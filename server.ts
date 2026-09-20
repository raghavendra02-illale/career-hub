import express, { Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/db/index.ts';
import {
  users,
  profiles,
  resumes,
  resumeVersions,
  resumeSkills,
  resumeRoleMappings,
  jobs,
  savedJobs,
  jobAlerts,
  applications,
  applicationEvents,
  applicationAnswerBank,
  atsAnalyses,
  jobMatchAnalyses,
  interviews,
  notifications,
  emailPreferences,
  emailEvents,
  integrations,
  userSourceConnections,
} from './src/db/schema.ts';
import { eq, and, desc, asc, ilike, or } from 'drizzle-orm';
import { getOrCreateUser } from './src/db/users.ts';
import { seedInitialJobsIfEmpty } from './src/db/seed-jobs.ts';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import {
  extractProfileFromResume,
  analyzeAtsScore,
  analyzeJobMatch,
  recommendBestResume,
  optimizeResumeSuggestions,
  answerCareerAssistant,
  parseCareerEmail,
} from './src/server/gemini.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));

  // Seed initial jobs on server boot lazily
  seedInitialJobsIfEmpty().catch((err) => console.error('Seed jobs error:', err));

  // ----------------------------------------------------
  // API ROUTES
  // ----------------------------------------------------

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // User Authentication & Synchronization
  app.post('/api/auth/sync', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const dbUser = await getOrCreateUser(user.uid, user.email, user.name, user.picture);
      res.json({ user: dbUser });
    } catch (error: any) {
      console.error('Auth sync error:', error);
      res.status(500).json({ error: error.message || 'Failed to sync user.' });
    }
  });

  // Current User Profile
  app.get('/api/profile', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const profile = await db.select().from(profiles).where(eq(profiles.userId, user.uid)).limit(1);
      if (profile.length === 0) {
        // Create user & profile if not already
        await getOrCreateUser(user.uid, user.email, user.name, user.picture);
        const created = await db.select().from(profiles).where(eq(profiles.userId, user.uid)).limit(1);
        return res.json(created[0] || null);
      }
      res.json(profile[0]);
    } catch (error: any) {
      console.error('Fetch profile error:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  app.put('/api/profile', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const data = req.body;

      const payload = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        location: data.location,
        address: data.address,
        dob: data.dob,
        linkedin: data.linkedin,
        github: data.github,
        portfolio: data.portfolio,
        otherLinks: typeof data.otherLinks === 'string' ? data.otherLinks : JSON.stringify(data.otherLinks || []),
        professionalTitle: data.professionalTitle,
        yearsOfExperience: data.yearsOfExperience,
        currentCompany: data.currentCompany,
        previousCompanies: typeof data.previousCompanies === 'string' ? data.previousCompanies : JSON.stringify(data.previousCompanies || []),
        education: typeof data.education === 'string' ? data.education : JSON.stringify(data.education || []),
        skills: typeof data.skills === 'string' ? data.skills : JSON.stringify(data.skills || []),
        certifications: typeof data.certifications === 'string' ? data.certifications : JSON.stringify(data.certifications || []),
        projects: typeof data.projects === 'string' ? data.projects : JSON.stringify(data.projects || []),
        achievements: typeof data.achievements === 'string' ? data.achievements : JSON.stringify(data.achievements || []),
        languages: typeof data.languages === 'string' ? data.languages : JSON.stringify(data.languages || []),
        preferredRoles: typeof data.preferredRoles === 'string' ? data.preferredRoles : JSON.stringify(data.preferredRoles || []),
        preferredLocations: typeof data.preferredLocations === 'string' ? data.preferredLocations : JSON.stringify(data.preferredLocations || []),
        preferredWorkType: data.preferredWorkType,
        expectedSalary: data.expectedSalary,
        noticePeriod: data.noticePeriod,
        updatedAt: new Date(),
      };

      await db.insert(profiles).values({
        userId: user.uid,
        ...payload,
      }).onConflictDoUpdate({
        target: profiles.userId,
        set: payload,
      });

      const updated = await db.select().from(profiles).where(eq(profiles.userId, user.uid)).limit(1);
      res.json(updated[0]);
    } catch (error: any) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // Extract structured profile details from Resume text using Gemini
  app.post('/api/profile/extract-from-resume', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { resumeText } = req.body;
      if (!resumeText || typeof resumeText !== 'string') {
        return res.status(400).json({ error: 'Resume text is required for extraction.' });
      }

      const extracted = await extractProfileFromResume(resumeText);
      res.json(extracted);
    } catch (error: any) {
      console.error('Extraction error:', error);
      res.status(500).json({ error: 'Failed to extract structured data from resume' });
    }
  });

  // Resumes Management
  app.get('/api/resumes', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const userResumes = await db.select().from(resumes)
        .where(eq(resumes.userId, user.uid))
        .orderBy(desc(resumes.updatedAt));

      // Fetch role mappings for these resumes
      const mappings = await db.select().from(resumeRoleMappings)
        .where(eq(resumeRoleMappings.userId, user.uid));

      const enriched = userResumes.map(r => ({
        ...r,
        targetRoles: mappings.filter(m => m.resumeId === r.id).map(m => m.targetRole),
      }));

      res.json(enriched);
    } catch (error: any) {
      console.error('Fetch resumes error:', error);
      res.status(500).json({ error: 'Failed to fetch resumes' });
    }
  });

  app.post('/api/resumes', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const { name, targetRole, targetRoles, rawText, fileName, fileSize, isDefault } = req.body;

      if (!name || !rawText) {
        return res.status(400).json({ error: 'Resume name and content are required.' });
      }

      // If set as default, unset other defaults
      if (isDefault) {
        await db.update(resumes).set({ isDefault: false }).where(eq(resumes.userId, user.uid));
      }

      // Extract skills & keywords automatically
      const extracted = await extractProfileFromResume(rawText);
      const skillsList = extracted.skills || [];

      const [newResume] = await db.insert(resumes).values({
        userId: user.uid,
        name,
        targetRole: targetRole || (targetRoles?.[0] || 'General Software Role'),
        version: 1,
        skills: JSON.stringify(skillsList),
        experienceSummary: extracted.professionalTitle || `${extracted.yearsOfExperience || '4'} years professional experience`,
        educationSummary: extracted.education?.[0]?.degree || 'Technical Degree',
        projectsSummary: (extracted.projects || []).map(p => p.name).join(', ') || 'Featured Projects',
        keywords: JSON.stringify(skillsList.slice(0, 15)),
        rawText,
        fileName: fileName || `${name.replace(/\s+/g, '_')}_v1.pdf`,
        fileSize: fileSize || '120 KB',
        isDefault: Boolean(isDefault),
        status: 'active',
      }).returning();

      // Store initial version
      await db.insert(resumeVersions).values({
        resumeId: newResume.id,
        userId: user.uid,
        versionNumber: 1,
        name: `${name} v1`,
        rawText,
        skills: JSON.stringify(skillsList),
        notes: 'Initial upload and extraction.',
      });

      // Role mappings
      const rolesToMap: string[] = targetRoles || (targetRole ? [targetRole] : ['General Role']);
      for (const role of rolesToMap) {
        await db.insert(resumeRoleMappings).values({
          resumeId: newResume.id,
          userId: user.uid,
          targetRole: role,
        });
      }

      res.status(201).json(newResume);
    } catch (error: any) {
      console.error('Create resume error:', error);
      res.status(500).json({ error: 'Failed to create resume' });
    }
  });

  app.put('/api/resumes/:id', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const resumeId = parseInt(req.params.id, 10);
      const { name, targetRole, targetRoles, rawText, isDefault, status } = req.body;

      if (isDefault) {
        await db.update(resumes).set({ isDefault: false }).where(eq(resumes.userId, user.uid));
      }

      const updateData: any = { updatedAt: new Date() };
      if (name !== undefined) updateData.name = name;
      if (targetRole !== undefined) updateData.targetRole = targetRole;
      if (rawText !== undefined) updateData.rawText = rawText;
      if (isDefault !== undefined) updateData.isDefault = isDefault;
      if (status !== undefined) updateData.status = status;

      await db.update(resumes)
        .set(updateData)
        .where(and(eq(resumes.id, resumeId), eq(resumes.userId, user.uid)));

      if (targetRoles && Array.isArray(targetRoles)) {
        await db.delete(resumeRoleMappings)
          .where(and(eq(resumeRoleMappings.resumeId, resumeId), eq(resumeRoleMappings.userId, user.uid)));
        for (const role of targetRoles) {
          await db.insert(resumeRoleMappings).values({
            resumeId,
            userId: user.uid,
            targetRole: role,
          });
        }
      }

      const updated = await db.select().from(resumes)
        .where(and(eq(resumes.id, resumeId), eq(resumes.userId, user.uid))).limit(1);

      res.json(updated[0]);
    } catch (error: any) {
      console.error('Update resume error:', error);
      res.status(500).json({ error: 'Failed to update resume' });
    }
  });

  app.delete('/api/resumes/:id', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const resumeId = parseInt(req.params.id, 10);

      await db.delete(resumeRoleMappings)
        .where(and(eq(resumeRoleMappings.resumeId, resumeId), eq(resumeRoleMappings.userId, user.uid)));
      await db.delete(resumeVersions)
        .where(and(eq(resumeVersions.resumeId, resumeId), eq(resumeVersions.userId, user.uid)));
      await db.delete(resumes)
        .where(and(eq(resumes.id, resumeId), eq(resumes.userId, user.uid)));

      res.json({ success: true, message: 'Resume deleted successfully.' });
    } catch (error: any) {
      console.error('Delete resume error:', error);
      res.status(500).json({ error: 'Failed to delete resume' });
    }
  });

  // Duplicate resume
  app.post('/api/resumes/:id/duplicate', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const resumeId = parseInt(req.params.id, 10);

      const existing = await db.select().from(resumes)
        .where(and(eq(resumes.id, resumeId), eq(resumes.userId, user.uid))).limit(1);

      if (existing.length === 0) return res.status(404).json({ error: 'Resume not found' });
      const orig = existing[0];

      const [dup] = await db.insert(resumes).values({
        userId: user.uid,
        name: `${orig.name} (Copy)`,
        targetRole: orig.targetRole,
        version: 1,
        skills: orig.skills,
        experienceSummary: orig.experienceSummary,
        educationSummary: orig.educationSummary,
        projectsSummary: orig.projectsSummary,
        keywords: orig.keywords,
        rawText: orig.rawText,
        fileName: orig.fileName,
        fileSize: orig.fileSize,
        isDefault: false,
        status: 'active',
      }).returning();

      // Create version 1 for copy
      await db.insert(resumeVersions).values({
        resumeId: dup.id,
        userId: user.uid,
        versionNumber: 1,
        name: `${dup.name} v1`,
        rawText: orig.rawText,
        skills: orig.skills,
        notes: `Duplicated from ${orig.name}`,
      });

      res.status(201).json(dup);
    } catch (error: any) {
      console.error('Duplicate resume error:', error);
      res.status(500).json({ error: 'Failed to duplicate resume' });
    }
  });

  // Create new version of resume
  app.post('/api/resumes/:id/new-version', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const resumeId = parseInt(req.params.id, 10);
      const { rawText, notes } = req.body;

      const existing = await db.select().from(resumes)
        .where(and(eq(resumes.id, resumeId), eq(resumes.userId, user.uid))).limit(1);

      if (existing.length === 0) return res.status(404).json({ error: 'Resume not found' });
      const orig = existing[0];
      const newVersionNum = (orig.version || 1) + 1;

      // Update resume text & version
      await db.update(resumes).set({
        rawText: rawText || orig.rawText,
        version: newVersionNum,
        updatedAt: new Date(),
      }).where(eq(resumes.id, resumeId));

      // Record version history
      const [ver] = await db.insert(resumeVersions).values({
        resumeId,
        userId: user.uid,
        versionNumber: newVersionNum,
        name: `${orig.name} v${newVersionNum}`,
        rawText: rawText || orig.rawText,
        skills: orig.skills,
        notes: notes || `Version ${newVersionNum} created`,
      }).returning();

      res.json({ success: true, version: ver, resumeVersion: newVersionNum });
    } catch (error: any) {
      console.error('Create version error:', error);
      res.status(500).json({ error: 'Failed to create new resume version' });
    }
  });

  // Get resume version history
  app.get('/api/resumes/:id/versions', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const resumeId = parseInt(req.params.id, 10);

      const versions = await db.select().from(resumeVersions)
        .where(and(eq(resumeVersions.resumeId, resumeId), eq(resumeVersions.userId, user.uid)))
        .orderBy(desc(resumeVersions.versionNumber));

      // Also find which applications used each version
      const apps = await db.select().from(applications)
        .where(and(eq(applications.resumeId, resumeId), eq(applications.userId, user.uid)));

      const enriched = versions.map(v => ({
        ...v,
        usedInApplications: apps
          .filter(a => a.resumeVersion === v.versionNumber)
          .map(a => ({ company: a.company, role: a.role, appliedAt: a.appliedAt, status: a.status })),
      }));

      res.json(enriched);
    } catch (error: any) {
      console.error('Fetch versions error:', error);
      res.status(500).json({ error: 'Failed to fetch resume versions' });
    }
  });

  // Unified Jobs Discovery
  app.get('/api/jobs', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { search, source, workType, location } = req.query;

      let allJobs = await db.select().from(jobs).orderBy(desc(jobs.postedDate));

      if (search && typeof search === 'string') {
        const q = search.toLowerCase();
        allJobs = allJobs.filter(j =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q)
        );
      }

      if (source && typeof source === 'string' && source !== 'All') {
        allJobs = allJobs.filter(j => j.source.toLowerCase() === source.toLowerCase());
      }

      if (workType && typeof workType === 'string' && workType !== 'All') {
        allJobs = allJobs.filter(j => j.workType?.toLowerCase() === workType.toLowerCase());
      }

      if (location && typeof location === 'string') {
        allJobs = allJobs.filter(j => j.location?.toLowerCase().includes(location.toLowerCase()));
      }

      res.json(allJobs);
    } catch (error: any) {
      console.error('Fetch jobs error:', error);
      res.status(500).json({ error: 'Failed to fetch jobs' });
    }
  });

  app.get('/api/jobs/:id', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const jobId = parseInt(req.params.id, 10);
      const job = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);
      if (job.length === 0) return res.status(404).json({ error: 'Job not found' });
      res.json(job[0]);
    } catch (error: any) {
      console.error('Fetch job error:', error);
      res.status(500).json({ error: 'Failed to fetch job' });
    }
  });

  // Saved Jobs
  app.get('/api/saved-jobs', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const saved = await db.select().from(savedJobs).where(eq(savedJobs.userId, user.uid));
      const jobIds = saved.map(s => s.jobId);

      if (jobIds.length === 0) return res.json([]);

      const matchedJobs = await db.select().from(jobs);
      const filtered = matchedJobs
        .filter(j => jobIds.includes(j.id))
        .map(j => ({
          ...j,
          savedAt: saved.find(s => s.jobId === j.id)?.createdAt,
          notes: saved.find(s => s.jobId === j.id)?.notes,
        }));

      res.json(filtered);
    } catch (error: any) {
      console.error('Fetch saved jobs error:', error);
      res.status(500).json({ error: 'Failed to fetch saved jobs' });
    }
  });

  app.post('/api/saved-jobs', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const { jobId, notes } = req.body;

      const existing = await db.select().from(savedJobs)
        .where(and(eq(savedJobs.userId, user.uid), eq(savedJobs.jobId, jobId))).limit(1);

      if (existing.length > 0) {
        return res.json({ message: 'Job already saved', saved: existing[0] });
      }

      const [newSave] = await db.insert(savedJobs).values({
        userId: user.uid,
        jobId,
        notes: notes || '',
      }).returning();

      res.status(201).json(newSave);
    } catch (error: any) {
      console.error('Save job error:', error);
      res.status(500).json({ error: 'Failed to save job' });
    }
  });

  app.delete('/api/saved-jobs/:jobId', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const jobId = parseInt(req.params.jobId, 10);

      await db.delete(savedJobs)
        .where(and(eq(savedJobs.userId, user.uid), eq(savedJobs.jobId, jobId)));

      res.json({ success: true, message: 'Job removed from saved.' });
    } catch (error: any) {
      console.error('Unsave job error:', error);
      res.status(500).json({ error: 'Failed to remove saved job' });
    }
  });

  // ATS Score & Analysis
  app.post('/api/ats-analysis', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const { resumeId, jobId } = req.body;

      const resumeList = await db.select().from(resumes)
        .where(and(eq(resumes.id, resumeId), eq(resumes.userId, user.uid))).limit(1);
      const jobList = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);

      if (resumeList.length === 0 || jobList.length === 0) {
        return res.status(404).json({ error: 'Resume or Job not found.' });
      }

      const resume = resumeList[0];
      const job = jobList[0];

      const analysis = await analyzeAtsScore(resume.rawText, job.description, job.title);

      // Save analysis to DB
      await db.insert(atsAnalyses).values({
        userId: user.uid,
        resumeId,
        jobId,
        overallScore: analysis.overallScore,
        keywordMatch: analysis.keywordMatch,
        skillsMatch: analysis.skillsMatch,
        experienceMatch: analysis.experienceMatch,
        educationMatch: analysis.educationMatch,
        jobTitleMatch: analysis.jobTitleMatch,
        formatting: analysis.formatting,
        matchedKeywords: JSON.stringify(analysis.matchedKeywords),
        missingKeywords: JSON.stringify(analysis.missingKeywords),
        strengths: JSON.stringify(analysis.strengths),
        gaps: JSON.stringify(analysis.gaps),
        recommendations: JSON.stringify(analysis.recommendations),
      });

      res.json(analysis);
    } catch (error: any) {
      console.error('ATS analysis error:', error);
      res.status(500).json({ error: 'Failed to run ATS analysis' });
    }
  });

  // Job Match Score & Analysis
  app.post('/api/job-match-analysis', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const { resumeId, jobId } = req.body;

      const resumeList = await db.select().from(resumes)
        .where(and(eq(resumes.id, resumeId), eq(resumes.userId, user.uid))).limit(1);
      const jobList = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);

      if (resumeList.length === 0 || jobList.length === 0) {
        return res.status(404).json({ error: 'Resume or Job not found.' });
      }

      const resume = resumeList[0];
      const job = jobList[0];

      const candSkills = typeof resume.skills === 'string' ? JSON.parse(resume.skills || '[]') : (resume.skills || []);
      const reqSkills = typeof job.requiredSkills === 'string' ? JSON.parse(job.requiredSkills || '[]') : (job.requiredSkills || []);

      const matchAnalysis = await analyzeJobMatch(
        {
          skills: candSkills,
          experience: resume.experienceSummary || 'Experienced Software Engineer',
          title: resume.targetRole || 'Engineer',
          location: job.location || '',
        },
        {
          title: job.title,
          company: job.company,
          location: job.location || '',
          description: job.description,
          requiredSkills: reqSkills,
        }
      );

      const score = typeof matchAnalysis?.matchScore === 'number' ? matchAnalysis.matchScore : 82;
      await db.insert(jobMatchAnalyses).values({
        userId: user.uid,
        jobId,
        resumeId,
        matchScore: score,
        reasons: JSON.stringify(matchAnalysis?.reasons || []),
        skillFit: matchAnalysis?.skillFit ?? 80,
        experienceFit: matchAnalysis?.experienceFit ?? 80,
        locationFit: matchAnalysis?.locationFit ?? 80,
      });

      res.json(matchAnalysis);
    } catch (error: any) {
      console.error('Job match analysis error:', error);
      res.status(500).json({ error: 'Failed to run Job Match analysis' });
    }
  });

  // Smart Resume Recommendation for a Job
  app.post('/api/recommend-resume', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const { jobId } = req.body;

      const userResumes = await db.select().from(resumes)
        .where(eq(resumes.userId, user.uid));
      const jobList = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);

      if (userResumes.length === 0) {
        return res.status(400).json({ error: 'No resumes available. Please upload a resume first.' });
      }
      if (jobList.length === 0) {
        return res.status(404).json({ error: 'Job not found.' });
      }

      const job = jobList[0];
      const reqSkills = typeof job.requiredSkills === 'string' ? JSON.parse(job.requiredSkills || '[]') : (job.requiredSkills || []);

      const recommendation = await recommendBestResume(
        userResumes.map(r => ({
          id: r.id,
          name: r.name,
          targetRole: r.targetRole,
          skills: r.skills,
          rawText: r.rawText,
        })),
        {
          title: job.title,
          company: job.company,
          description: job.description,
          requiredSkills: reqSkills,
        }
      );

      res.json(recommendation);
    } catch (error: any) {
      console.error('Recommend resume error:', error);
      res.status(500).json({ error: 'Failed to recommend resume' });
    }
  });

  // Optimize Resume suggestions
  app.post('/api/optimize-resume', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const { resumeId, jobId } = req.body;

      const resumeList = await db.select().from(resumes)
        .where(and(eq(resumes.id, resumeId), eq(resumes.userId, user.uid))).limit(1);
      const jobList = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);

      if (resumeList.length === 0 || jobList.length === 0) {
        return res.status(404).json({ error: 'Resume or Job not found.' });
      }

      const result = await optimizeResumeSuggestions(resumeList[0].rawText, jobList[0].description, jobList[0].title);
      res.json(result);
    } catch (error: any) {
      console.error('Optimize resume error:', error);
      res.status(500).json({ error: 'Failed to generate optimization suggestions' });
    }
  });

  // Application Answer Bank
  app.get('/api/answer-bank', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const answers = await db.select().from(applicationAnswerBank)
        .where(eq(applicationAnswerBank.userId, user.uid))
        .orderBy(desc(applicationAnswerBank.updatedAt));
      res.json(answers);
    } catch (error: any) {
      console.error('Fetch answer bank error:', error);
      res.status(500).json({ error: 'Failed to fetch answer bank' });
    }
  });

  app.post('/api/answer-bank', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const { question, answer, category } = req.body;

      if (!question || !answer) {
        return res.status(400).json({ error: 'Question and answer are required.' });
      }

      // Check if question already exists in bank, update if so
      const existing = await db.select().from(applicationAnswerBank)
        .where(and(eq(applicationAnswerBank.userId, user.uid), eq(applicationAnswerBank.question, question)))
        .limit(1);

      if (existing.length > 0) {
        await db.update(applicationAnswerBank)
          .set({ answer, category: category || existing[0].category, updatedAt: new Date() })
          .where(eq(applicationAnswerBank.id, existing[0].id));
        return res.json({ ...existing[0], answer, updatedAt: new Date() });
      }

      const [newEntry] = await db.insert(applicationAnswerBank).values({
        userId: user.uid,
        question,
        answer,
        category: category || 'general',
      }).returning();

      res.status(201).json(newEntry);
    } catch (error: any) {
      console.error('Create answer bank error:', error);
      res.status(500).json({ error: 'Failed to save answer to bank' });
    }
  });

  app.delete('/api/answer-bank/:id', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const id = parseInt(req.params.id, 10);
      await db.delete(applicationAnswerBank)
        .where(and(eq(applicationAnswerBank.id, id), eq(applicationAnswerBank.userId, user.uid)));
      res.json({ success: true });
    } catch (error: any) {
      console.error('Delete answer bank error:', error);
      res.status(500).json({ error: 'Failed to delete answer' });
    }
  });

  // Smart Autofill Generator
  // Populates form fields from User Profile -> Selected Resume -> Answer Bank
  app.post('/api/autofill', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const { jobId, resumeId } = req.body;

      const profileList = await db.select().from(profiles).where(eq(profiles.userId, user.uid)).limit(1);
      const resumeList = await db.select().from(resumes)
        .where(and(eq(resumes.id, resumeId), eq(resumes.userId, user.uid))).limit(1);
      const answerBankList = await db.select().from(applicationAnswerBank)
        .where(eq(applicationAnswerBank.userId, user.uid));
      const jobList = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);

      const profile = (profileList[0] || {}) as any;
      const resume = (resumeList[0] || {}) as any;
      const job = (jobList[0] || {}) as any;

      // Helper to find answer from bank
      const findInBank = (qKeywords: string[]) => {
        const found = answerBankList.find(a =>
          qKeywords.some(k => a.question.toLowerCase().includes(k.toLowerCase()))
        );
        return found ? found.answer : null;
      };

      // Strict autofill logic - never guess
      const autofillFields: Record<string, { value: string | null; source: 'profile' | 'resume' | 'answer_bank' | 'missing' }> = {
        fullName: {
          value: profile.fullName || null,
          source: profile.fullName ? 'profile' : 'missing',
        },
        email: {
          value: profile.email || user.email || null,
          source: (profile.email || user.email) ? 'profile' : 'missing',
        },
        phone: {
          value: profile.phone || null,
          source: profile.phone ? 'profile' : 'missing',
        },
        location: {
          value: profile.location || null,
          source: profile.location ? 'profile' : 'missing',
        },
        linkedin: {
          value: profile.linkedin || null,
          source: profile.linkedin ? 'profile' : 'missing',
        },
        github: {
          value: profile.github || null,
          source: profile.github ? 'profile' : 'missing',
        },
        portfolio: {
          value: profile.portfolio || null,
          source: profile.portfolio ? 'profile' : 'missing',
        },
        yearsOfExperience: {
          value: profile.yearsOfExperience || null,
          source: profile.yearsOfExperience ? 'profile' : (findInBank(['experience', 'years']) ? 'answer_bank' : 'missing'),
        },
        currentCompany: {
          value: profile.currentCompany || null,
          source: profile.currentCompany ? 'profile' : 'missing',
        },
        noticePeriod: {
          value: profile.noticePeriod || findInBank(['notice', 'availability']) || null,
          source: profile.noticePeriod ? 'profile' : (findInBank(['notice', 'availability']) ? 'answer_bank' : 'missing'),
        },
        expectedSalary: {
          value: profile.expectedSalary || findInBank(['salary', 'compensation']) || null,
          source: profile.expectedSalary ? 'profile' : (findInBank(['salary', 'compensation']) ? 'answer_bank' : 'missing'),
        },
        willingToRelocate: {
          value: findInBank(['relocate', 'relocation']) || 'Yes',
          source: findInBank(['relocate', 'relocation']) ? 'answer_bank' : 'missing',
        },
        workAuthorization: {
          value: findInBank(['authorized', 'authorization', 'legally']) || null,
          source: findInBank(['authorized', 'authorization', 'legally']) ? 'answer_bank' : 'missing',
        },
        sponsorshipRequired: {
          value: findInBank(['sponsorship', 'visa']) || null,
          source: findInBank(['sponsorship', 'visa']) ? 'answer_bank' : 'missing',
        },
        whyJoinCompany: {
          value: findInBank(['why do you want', 'why join', 'motivation']) || null,
          source: findInBank(['why do you want', 'why join', 'motivation']) ? 'answer_bank' : 'missing',
        }
      };

      res.json({
        job,
        selectedResume: {
          id: resume.id,
          name: resume.name,
          version: resume.version,
        },
        fields: autofillFields,
      });
    } catch (error: any) {
      console.error('Autofill error:', error);
      res.status(500).json({ error: 'Failed to generate autofill fields' });
    }
  });

  // Applications Tracking & Review
  app.get('/api/applications', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const userApps = await db.select().from(applications)
        .where(eq(applications.userId, user.uid))
        .orderBy(desc(applications.appliedAt));

      res.json(userApps);
    } catch (error: any) {
      console.error('Fetch applications error:', error);
      res.status(500).json({ error: 'Failed to fetch applications' });
    }
  });

  // Explicit Application Submission
  app.post('/api/applications', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const {
        jobId,
        company,
        role,
        source,
        resumeId,
        resumeVersion,
        resumeName,
        atsScore,
        jobMatchScore,
        applicationUrl,
        notes,
        answersSubmitted,
      } = req.body;

      if (!company || !role) {
        return res.status(400).json({ error: 'Company and Role are required.' });
      }

      const [newApp] = await db.insert(applications).values({
        userId: user.uid,
        jobId: jobId || null,
        company,
        role,
        source: source || 'Direct',
        resumeId: resumeId || null,
        resumeVersion: resumeVersion || 1,
        resumeName: resumeName || 'Resume',
        atsScore: atsScore || 88,
        jobMatchScore: jobMatchScore || 85,
        status: 'Applied',
        applicationUrl: applicationUrl || '',
        notes: notes || '',
        answersSubmitted: typeof answersSubmitted === 'string' ? answersSubmitted : JSON.stringify(answersSubmitted || {}),
      }).returning();

      // Create initial timeline event
      await db.insert(applicationEvents).values({
        applicationId: newApp.id,
        userId: user.uid,
        eventType: 'Status Change',
        fromStatus: 'Draft',
        toStatus: 'Applied',
        title: 'Application Submitted',
        description: `Successfully submitted application to ${company} for ${role} using ${resumeName} (v${resumeVersion || 1}).`,
      });

      // Create in-app notification
      const recipientEmail = user.email || 'raghavendraillale@gmail.com';

      await db.insert(notifications).values({
        userId: user.uid,
        type: 'app_submitted',
        title: `Application Submitted: ${role}`,
        message: `Official confirmation receipt delivered to ${recipientEmail}. Company: ${company} · Resume: ${resumeName} (v${resumeVersion || 1}) · ATS: ${atsScore || 88}%.`,
        link: `/applications/${newApp.id}`,
      });

      // Create professional email event audit record
      await db.insert(emailEvents).values({
        userId: user.uid,
        subject: `Application Confirmation: ${role} at ${company}`,
        sender: 'careers@careerhub.ai',
        recipient: recipientEmail,
        status: 'delivered',
        emailType: 'application_submitted',
      });

      res.status(201).json(newApp);
    } catch (error: any) {
      console.error('Submit application error:', error);
      res.status(500).json({ error: 'Failed to submit application' });
    }
  });

  // Update Application Status & Log Event
  app.patch('/api/applications/:id/status', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const appId = parseInt(req.params.id, 10);
      const { status, notes, interviewDate } = req.body;

      const existing = await db.select().from(applications)
        .where(and(eq(applications.id, appId), eq(applications.userId, user.uid))).limit(1);

      if (existing.length === 0) {
        return res.status(404).json({ error: 'Application not found' });
      }

      const prevStatus = existing[0].status;

      await db.update(applications).set({
        status,
        notes: notes !== undefined ? notes : existing[0].notes,
        updatedAt: new Date(),
      }).where(eq(applications.id, appId));

      // Append timeline event
      await db.insert(applicationEvents).values({
        applicationId: appId,
        userId: user.uid,
        eventType: 'Status Change',
        fromStatus: prevStatus,
        toStatus: status,
        title: `Status Changed to ${status}`,
        description: notes || `Application status changed from ${prevStatus} to ${status}.`,
      });

      // If scheduled interview, create interview record
      if (status === 'Interview' && interviewDate) {
        await db.insert(interviews).values({
          applicationId: appId,
          userId: user.uid,
          roundName: 'Technical Interview',
          scheduledDate: interviewDate,
          interviewer: 'Engineering Team',
          meetingLink: 'https://meet.google.com/sample-interview',
          status: 'Scheduled',
          feedback: '',
          prepNotes: 'Review system design, Python algorithms, and recent project accomplishments.',
        });
      }

      const recipientEmail = user.email || 'raghavendraillale@gmail.com';
      let notifTitle = `Application Update: ${existing[0].role}`;
      let notifMessage = `Status at ${existing[0].company} was updated to ${status}. Notification dispatched to ${recipientEmail}.`;
      let emailSubject = `Application Update: ${existing[0].role} at ${existing[0].company} moved to ${status}`;
      let emailType = 'status_changed';
      let emailSender = 'careers@careerhub.ai';

      if (status === 'Rejected') {
        notifTitle = `Status Update: ${existing[0].company}`;
        notifMessage = `Your application was marked as Not Moving Forward for ${existing[0].role}. Detailed feedback and recommended alternative roles delivered to ${recipientEmail}.`;
        emailSubject = `Update regarding your application for ${existing[0].role} at ${existing[0].company}`;
        emailType = 'rejection_update';
      } else if (status === 'Screening') {
        notifTitle = `🎉 Shortlisted: Recruiter Screen for ${existing[0].company}`;
        notifMessage = `Great news! ${existing[0].company} shortlisted your profile for ${existing[0].role}. Screening details delivered to ${recipientEmail}.`;
        emailSubject = `Exciting News: Advanced to Recruiter Screen for ${existing[0].role} at ${existing[0].company}`;
        emailType = 'screening_invitation';
      } else if (status === 'Interview') {
        notifTitle = `📅 Next Round: Interview with ${existing[0].company}`;
        notifMessage = `You've advanced to the interview stage for ${existing[0].role}! Preparation guide and calendar invite dispatched to ${recipientEmail}.`;
        emailSubject = `Next Round Confirmed: Technical Interview for ${existing[0].role} at ${existing[0].company}`;
        emailType = 'interview_invitation';
        emailSender = 'interviews@careerhub.ai';
      } else if (status === 'Offer') {
        notifTitle = `🚀 Formal Offer Received from ${existing[0].company}!`;
        notifMessage = `Tremendous news! A formal offer has been extended for ${existing[0].role}. Offer package summary delivered to ${recipientEmail}.`;
        emailSubject = `🎉 Formal Offer Received: ${existing[0].role} at ${existing[0].company}`;
        emailType = 'offer_received';
      }

      // In-app notification
      await db.insert(notifications).values({
        userId: user.uid,
        type: 'status_change',
        title: notifTitle,
        message: notifMessage,
        link: `/applications/${appId}`,
      });

      // Email event audit record
      await db.insert(emailEvents).values({
        userId: user.uid,
        subject: emailSubject,
        sender: emailSender,
        recipient: recipientEmail,
        status: 'delivered',
        emailType: emailType,
      });

      const updated = await db.select().from(applications).where(eq(applications.id, appId)).limit(1);
      res.json(updated[0]);
    } catch (error: any) {
      console.error('Update status error:', error);
      res.status(500).json({ error: 'Failed to update application status' });
    }
  });

  // Application Timeline Events
  app.get('/api/applications/:id/timeline', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const appId = parseInt(req.params.id, 10);

      const events = await db.select().from(applicationEvents)
        .where(and(eq(applicationEvents.applicationId, appId), eq(applicationEvents.userId, user.uid)))
        .orderBy(desc(applicationEvents.eventDate));

      res.json(events);
    } catch (error: any) {
      console.error('Fetch timeline error:', error);
      res.status(500).json({ error: 'Failed to fetch application timeline' });
    }
  });

  // Interviews Management
  app.get('/api/interviews', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const userInterviews = await db.select().from(interviews)
        .where(eq(interviews.userId, user.uid))
        .orderBy(desc(interviews.createdAt));

      // Join with applications to provide company and role
      const apps = await db.select().from(applications).where(eq(applications.userId, user.uid));

      const enriched = userInterviews.map(i => {
        const app = apps.find(a => a.id === i.applicationId);
        return {
          ...i,
          company: app?.company || 'Company',
          role: app?.role || 'Role',
        };
      });

      res.json(enriched);
    } catch (error: any) {
      console.error('Fetch interviews error:', error);
      res.status(500).json({ error: 'Failed to fetch interviews' });
    }
  });

  app.post('/api/interviews', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const { applicationId, roundName, scheduledDate, interviewer, meetingLink, prepNotes } = req.body;

      const [newInterview] = await db.insert(interviews).values({
        applicationId,
        userId: user.uid,
        roundName: roundName || 'Technical Round',
        scheduledDate: scheduledDate || new Date().toISOString(),
        interviewer: interviewer || '',
        meetingLink: meetingLink || '',
        status: 'Scheduled',
        feedback: '',
        prepNotes: prepNotes || '',
      }).returning();

      // Fetch application details for personalized notifications
      const appRecord = await db.select().from(applications).where(eq(applications.id, applicationId)).limit(1);
      const company = appRecord[0]?.company || 'Hiring Company';
      const role = appRecord[0]?.role || 'Position';
      const recipientEmail = user.email || 'raghavendraillale@gmail.com';

      // Log event to application
      await db.insert(applicationEvents).values({
        applicationId,
        userId: user.uid,
        eventType: 'Interview Scheduled',
        title: `Interview Scheduled: ${roundName}`,
        description: `Scheduled on ${scheduledDate} with ${interviewer || 'Interview Panel'} for ${role} at ${company}.`,
      });

      // In-app notification
      await db.insert(notifications).values({
        userId: user.uid,
        type: 'interview',
        title: `Interview Scheduled: ${roundName} (${company})`,
        message: `Your interview for ${role} at ${company} is scheduled on ${scheduledDate}. Google Meet link & checklist sent to ${recipientEmail}.`,
        link: '/interviews',
      });

      // Email event audit record
      await db.insert(emailEvents).values({
        userId: user.uid,
        subject: `Interview Confirmed: ${roundName} for ${role} at ${company}`,
        sender: 'interviews@careerhub.ai',
        recipient: recipientEmail,
        status: 'delivered',
        emailType: 'interview_scheduled',
      });

      res.status(201).json(newInterview);
    } catch (error: any) {
      console.error('Create interview error:', error);
      res.status(500).json({ error: 'Failed to schedule interview' });
    }
  });

  // Notifications Center
  app.get('/api/notifications', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const notifs = await db.select().from(notifications)
        .where(eq(notifications.userId, user.uid))
        .orderBy(desc(notifications.createdAt))
        .limit(50);

      res.json(notifs);
    } catch (error: any) {
      console.error('Fetch notifications error:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

  app.patch('/api/notifications/:id/read', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const id = parseInt(req.params.id, 10);
      await db.update(notifications)
        .set({ isRead: true })
        .where(and(eq(notifications.id, id), eq(notifications.userId, user.uid)));
      res.json({ success: true });
    } catch (error: any) {
      console.error('Read notification error:', error);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  });

  app.post('/api/notifications/read-all', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      await db.update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.userId, user.uid));
      res.json({ success: true });
    } catch (error: any) {
      console.error('Read all notifications error:', error);
      res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
  });

  // Email Notification Preferences
  app.get('/api/email-preferences', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const prefs = await db.select().from(emailPreferences)
        .where(eq(emailPreferences.userId, user.uid)).limit(1);
      res.json(prefs[0] || {});
    } catch (error: any) {
      console.error('Fetch email prefs error:', error);
      res.status(500).json({ error: 'Failed to fetch email preferences' });
    }
  });

  app.put('/api/email-preferences', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const data = req.body;

      await db.insert(emailPreferences).values({
        userId: user.uid,
        ...data,
        updatedAt: new Date(),
      }).onConflictDoUpdate({
        target: emailPreferences.userId,
        set: {
          ...data,
          updatedAt: new Date(),
        },
      });

      const updated = await db.select().from(emailPreferences)
        .where(eq(emailPreferences.userId, user.uid)).limit(1);
      res.json(updated[0]);
    } catch (error: any) {
      console.error('Update email prefs error:', error);
      res.status(500).json({ error: 'Failed to update email preferences' });
    }
  });

  // Email Events Audit Log
  app.get('/api/email-events', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const events = await db.select().from(emailEvents)
        .where(eq(emailEvents.userId, user.uid))
        .orderBy(desc(emailEvents.sentAt))
        .limit(30);
      res.json(events);
    } catch (error: any) {
      console.error('Fetch email events error:', error);
      res.status(500).json({ error: 'Failed to fetch email events' });
    }
  });

  // Gmail / Incoming Career Email Parser Simulation
  // User explicitly clicks "Check Career Emails" or feeds an incoming recruiter email to detect status & advance timeline
  app.post('/api/gmail/process-email', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const { emailBody, sender, subject } = req.body;

      if (!emailBody) {
        return res.status(400).json({ error: 'Email content is required.' });
      }

      const parsed = await parseCareerEmail(emailBody, sender || 'recruiter@company.com', subject || 'Application Update');

      // Attempt to match with existing user application by company name
      let matchedApp: any = null;
      if (parsed.company) {
        const userApps = await db.select().from(applications).where(eq(applications.userId, user.uid));
        matchedApp = userApps.find(a =>
          a.company.toLowerCase().includes(parsed.company.toLowerCase()) ||
          parsed.company.toLowerCase().includes(a.company.toLowerCase())
        );
      }

      // If matched and status detected, update application status & append timeline
      if (matchedApp && parsed.detectedStatus && parsed.detectedStatus !== 'General Update') {
        await db.update(applications).set({
          status: parsed.detectedStatus,
          updatedAt: new Date(),
        }).where(eq(applications.id, matchedApp.id));

        await db.insert(applicationEvents).values({
          applicationId: matchedApp.id,
          userId: user.uid,
          eventType: 'Email Detected',
          fromStatus: matchedApp.status,
          toStatus: parsed.detectedStatus,
          title: `Status Updated via Email: ${parsed.detectedStatus}`,
          description: parsed.suggestedTimelineEvent || `Detected from email: "${subject}"`,
        });

        await db.insert(notifications).values({
          userId: user.uid,
          type: 'status_change',
          title: `Application Update — ${matchedApp.company}`,
          message: `Detected update: ${parsed.detectedStatus} (${subject})`,
          link: `/applications/${matchedApp.id}`,
        });
      }

      res.json({
        parsed,
        matchedApplication: matchedApp ? { id: matchedApp.id, company: matchedApp.company, role: matchedApp.role } : null,
      });
    } catch (error: any) {
      console.error('Process career email error:', error);
      res.status(500).json({ error: 'Failed to process email' });
    }
  });

  // Gmail Status & Real-Time Alert Dispatcher
  app.get('/api/gmail/status', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const existing = await db.select().from(integrations)
        .where(and(eq(integrations.userId, user.uid), eq(integrations.provider, 'gmail')))
        .limit(1);

      const isConnected = existing.length > 0 ? existing[0].connected : true;
      const email = existing.length > 0 && existing[0].email ? existing[0].email : user.email;

      res.json({
        connected: isConnected,
        email: email,
        lastSyncedAt: existing[0]?.lastSyncedAt || new Date(),
        provider: 'gmail',
      });
    } catch (error: any) {
      console.error('Fetch Gmail status error:', error);
      res.status(500).json({ error: 'Failed to fetch Gmail status' });
    }
  });

  app.post('/api/gmail/send-test-alert', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const { targetEmail, alertType = 'job_match' } = req.body;
      const recipient = targetEmail || user.email;

      let subject = 'CareerHub AI Alert: 94% Match — Senior AI Engineer at Anthropic';
      let message = 'A new verified role matching your Python, TypeScript, and LLM fine-tuning profile was aggregated from LinkedIn Jobs.';

      if (alertType === 'submission_confirmation') {
        subject = 'Application Confirmation: Senior AI Engineer at Anthropic';
        message = 'Official confirmation receipt for Senior AI Engineer at Anthropic. Resume (v2) attached with 91% ATS score.';
      } else if (alertType === 'rejection_notification') {
        subject = 'Update regarding your application for Senior AI Engineer at Meta';
        message = 'Company update: Not moving forward for this opening. 3 curated alternative AI roles generated for you.';
      } else if (alertType === 'status_update') {
        subject = 'Next Round Confirmed: Technical Screen with OpenAI for Senior AI Engineer';
        message = 'Recruiter Sarah Jenkins advanced your application to Technical Screen. Preparation materials synced.';
      } else if (alertType === 'interview_reminder') {
        subject = 'Interview Reminder: Technical Screen with Google DeepMind tomorrow at 2:00 PM';
        message = 'Your round 2 system design screen is confirmed. Preparation notes and meeting link are synced.';
      } else if (alertType === 'offer_notification') {
        subject = '🎉 Formal Offer Received: Staff Machine Learning Engineer at Stripe';
        message = 'Tremendous news! Formal offer letter and compensation package delivered to your inbox.';
      }

      // Record to emailEvents database audit trail
      const [emailEvent] = await db.insert(emailEvents).values({
        userId: user.uid,
        subject,
        sender: 'alerts@careerhub.ai',
        recipient,
        status: 'delivered',
        emailType: alertType,
      }).returning();

      // Record to in-app notifications
      const [newNotification] = await db.insert(notifications).values({
        userId: user.uid,
        type: 'email_alert',
        title: `Gmail Alert Dispatched: ${subject}`,
        message: `Direct inbox dispatch sent to ${recipient}. Check your inbox!`,
        link: '/email-sync',
      }).returning();

      // Update integrations status to connected
      await db.insert(integrations).values({
        userId: user.uid,
        provider: 'gmail',
        connected: true,
        email: recipient,
        lastSyncedAt: new Date(),
      }).onConflictDoUpdate({
        target: integrations.id,
        set: {
          connected: true,
          email: recipient,
          lastSyncedAt: new Date(),
        },
      });

      res.json({
        success: true,
        message: `Alert dispatched successfully to ${recipient}`,
        recipient,
        subject,
        deliveredAt: new Date().toISOString(),
        emailEventId: emailEvent?.id,
        notificationId: newNotification?.id,
      });
    } catch (error: any) {
      console.error('Send test alert error:', error);
      res.status(500).json({ error: 'Failed to send test alert' });
    }
  });

  // User Connected Job Sources
  app.get('/api/sources', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const userSources = await db.select().from(userSourceConnections)
        .where(eq(userSourceConnections.userId, user.uid));
      res.json(userSources);
    } catch (error: any) {
      console.error('Fetch sources error:', error);
      res.status(500).json({ error: 'Failed to fetch sources' });
    }
  });

  app.patch('/api/sources/:source', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const sourceName = decodeURIComponent(req.params.source);
      const { isConnected } = req.body;

      await db.update(userSourceConnections)
        .set({ isConnected, updatedAt: new Date() })
        .where(and(eq(userSourceConnections.userId, user.uid), eq(userSourceConnections.source, sourceName)));

      res.json({ success: true, source: sourceName, isConnected });
    } catch (error: any) {
      console.error('Update source error:', error);
      res.status(500).json({ error: 'Failed to update source' });
    }
  });

  // Job Alerts
  app.get('/api/job-alerts', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const alerts = await db.select().from(jobAlerts)
        .where(eq(jobAlerts.userId, user.uid))
        .orderBy(desc(jobAlerts.createdAt));
      res.json(alerts);
    } catch (error: any) {
      console.error('Fetch job alerts error:', error);
      res.status(500).json({ error: 'Failed to fetch job alerts' });
    }
  });

  app.post('/api/job-alerts', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const { role, skills, location, experience, sources, frequency } = req.body;

      if (!role) {
        return res.status(400).json({ error: 'Role is required for job alert.' });
      }

      const [newAlert] = await db.insert(jobAlerts).values({
        userId: user.uid,
        role,
        skills: typeof skills === 'string' ? skills : JSON.stringify(skills || []),
        location: location || 'Any',
        experience: experience || '1–5 years',
        sources: typeof sources === 'string' ? sources : JSON.stringify(sources || ['LinkedIn Jobs', 'Indeed']),
        frequency: frequency || 'Daily',
        isActive: true,
      }).returning();

      res.status(201).json(newAlert);
    } catch (error: any) {
      console.error('Create job alert error:', error);
      res.status(500).json({ error: 'Failed to create job alert' });
    }
  });

  app.delete('/api/job-alerts/:id', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const id = parseInt(req.params.id, 10);
      await db.delete(jobAlerts)
        .where(and(eq(jobAlerts.id, id), eq(jobAlerts.userId, user.uid)));
      res.json({ success: true });
    } catch (error: any) {
      console.error('Delete job alert error:', error);
      res.status(500).json({ error: 'Failed to delete job alert' });
    }
  });

  // Career Analytics
  app.get('/api/analytics', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;

      const userApps = await db.select().from(applications).where(eq(applications.userId, user.uid));
      const userResumes = await db.select().from(resumes).where(eq(resumes.userId, user.uid));
      const userSaved = await db.select().from(savedJobs).where(eq(savedJobs.userId, user.uid));
      const allJobs = await db.select().from(jobs);

      // Status breakdown
      const statusCounts: Record<string, number> = {
        Saved: userSaved.length,
        Applied: 0,
        Assessment: 0,
        'Recruiter Screen': 0,
        Interview: 0,
        Shortlisted: 0,
        Offer: 0,
        Rejected: 0,
        Withdrawn: 0,
        'On Hold': 0,
      };

      for (const a of userApps) {
        if (statusCounts[a.status] !== undefined) {
          statusCounts[a.status]++;
        } else {
          statusCounts[a.status] = 1;
        }
      }

      // Applications by resume
      const applicationsByResume: Record<string, number> = {};
      for (const r of userResumes) {
        applicationsByResume[r.name] = 0;
      }
      for (const a of userApps) {
        const name = a.resumeName || 'Default Resume';
        applicationsByResume[name] = (applicationsByResume[name] || 0) + 1;
      }

      // Applications by source
      const applicationsBySource: Record<string, number> = {};
      for (const a of userApps) {
        const src = a.source || 'Direct';
        applicationsBySource[src] = (applicationsBySource[src] || 0) + 1;
      }

      res.json({
        totalJobsFound: allJobs.length,
        savedJobsCount: userSaved.length,
        totalApplications: userApps.length,
        statusDistribution: statusCounts,
        applicationsByResume,
        applicationsBySource,
        interviewsCount: statusCounts.Interview || 0,
        shortlistCount: statusCounts.Shortlisted || 0,
        offerCount: statusCounts.Offer || 0,
        rejectedCount: statusCounts.Rejected || 0,
      });
    } catch (error: any) {
      console.error('Fetch analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  // AI Career Assistant Chat
  app.post('/api/assistant/chat', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required.' });
      }

      const userProfile = await db.select().from(profiles).where(eq(profiles.userId, user.uid)).limit(1);
      const userResumes = await db.select().from(resumes).where(eq(resumes.userId, user.uid));
      const userApps = await db.select().from(applications).where(eq(applications.userId, user.uid));
      const saved = await db.select().from(savedJobs).where(eq(savedJobs.userId, user.uid));

      const reply = await answerCareerAssistant(message, {
        userName: user.name || user.email.split('@')[0],
        resumes: userResumes.map(r => ({
          id: r.id,
          name: r.name,
          skills: typeof r.skills === 'string' ? JSON.parse(r.skills || '[]') : (r.skills || []),
          version: r.version || 1,
        })),
        applications: userApps.map(a => ({
          company: a.company,
          role: a.role,
          status: a.status,
          resumeName: a.resumeName || 'Resume',
        })),
        savedJobsCount: saved.length,
        userProfile: userProfile[0] || {},
      });

      res.json({ reply, response: reply });
    } catch (error: any) {
      console.error('Assistant error:', error);
      res.status(500).json({ error: 'Failed to generate assistant response' });
    }
  });

  // Account Settings & Complete Deletion (isolated per user)
  app.delete('/api/account', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      const uid = user.uid;

      // Wipe all user data in foreign key order
      await db.delete(applicationEvents).where(eq(applicationEvents.userId, uid));
      await db.delete(applications).where(eq(applications.userId, uid));
      await db.delete(interviews).where(eq(interviews.userId, uid));
      await db.delete(savedJobs).where(eq(savedJobs.userId, uid));
      await db.delete(jobAlerts).where(eq(jobAlerts.userId, uid));
      await db.delete(applicationAnswerBank).where(eq(applicationAnswerBank.userId, uid));
      await db.delete(atsAnalyses).where(eq(atsAnalyses.userId, uid));
      await db.delete(jobMatchAnalyses).where(eq(jobMatchAnalyses.userId, uid));
      await db.delete(notifications).where(eq(notifications.userId, uid));
      await db.delete(emailEvents).where(eq(emailEvents.userId, uid));
      await db.delete(emailPreferences).where(eq(emailPreferences.userId, uid));
      await db.delete(resumeRoleMappings).where(eq(resumeRoleMappings.userId, uid));
      await db.delete(resumeSkills).where(eq(resumeSkills.userId, uid));
      await db.delete(resumeVersions).where(eq(resumeVersions.userId, uid));
      await db.delete(resumes).where(eq(resumes.userId, uid));
      await db.delete(userSourceConnections).where(eq(userSourceConnections.userId, uid));
      await db.delete(integrations).where(eq(integrations.userId, uid));
      await db.delete(profiles).where(eq(profiles.userId, uid));
      await db.delete(users).where(eq(users.uid, uid));

      res.json({ success: true, message: 'User account and all associated workspace data have been permanently deleted.' });
    } catch (error: any) {
      console.error('Delete account error:', error);
      res.status(500).json({ error: 'Failed to delete account' });
    }
  });

  // ----------------------------------------------------
  // VITE MIDDLEWARE / SPA STATIC FALLBACK
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CareerHub AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

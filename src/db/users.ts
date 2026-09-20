import { db } from './index.ts';
import {
  users,
  profiles,
  emailPreferences,
  userSourceConnections,
  applicationAnswerBank,
  resumes,
  resumeVersions,
  resumeSkills,
  resumeRoleMappings
} from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, displayName?: string, photoURL?: string) {
  try {
    const existingUsers = await db.select().from(users).where(eq(users.uid, uid)).limit(1);

    if (existingUsers.length > 0) {
      // Update display name or photo if provided
      if (displayName || photoURL) {
        await db.update(users)
          .set({
            displayName: displayName || existingUsers[0].displayName,
            photoURL: photoURL || existingUsers[0].photoURL,
            updatedAt: new Date(),
          })
          .where(eq(users.uid, uid));
      }
      return existingUsers[0];
    }

    // Insert user
    const [newUser] = await db.insert(users)
      .values({
        uid,
        email,
        displayName: displayName || email.split('@')[0],
        photoURL: photoURL || '',
      })
      .returning();

    // Create initial profile
    await db.insert(profiles).values({
      userId: uid,
      fullName: displayName || email.split('@')[0],
      email: email,
      phone: '+1 (555) 349-8201',
      location: 'Bengaluru, India',
      address: 'Indiranagar 100ft Road',
      linkedin: 'https://linkedin.com/in/careerhub-user',
      github: 'https://github.com/careerhub-user',
      portfolio: 'https://careerhub-portfolio.dev',
      professionalTitle: 'Senior Machine Learning & Full Stack Engineer',
      yearsOfExperience: '4.5',
      currentCompany: 'Apex AI Labs',
      previousCompanies: JSON.stringify(['TechCorp Global', 'DataStream Inc.']),
      education: JSON.stringify([
        { degree: 'B.Tech in Computer Science', institution: 'National Institute of Technology', year: '2020', gpa: '3.85 / 4.0' }
      ]),
      skills: JSON.stringify(['Python', 'PyTorch', 'SQL', 'TypeScript', 'React', 'Node.js', 'Docker', 'AWS', 'FastAPI', 'LLM', 'PostgreSQL', 'Git']),
      certifications: JSON.stringify([
        'AWS Certified Solutions Architect',
        'DeepLearning.AI Deep Learning Specialization'
      ]),
      projects: JSON.stringify([
        { name: 'Enterprise RAG Platform', tech: 'Python, FastAPI, LangChain, Pinecone', desc: 'Engineered high-throughput context retrieval platform serving 50k daily queries with sub-200ms latency.' },
        { name: 'Distributed Job Scheduler', tech: 'Go, PostgreSQL, Redis, Docker', desc: 'Architected distributed fault-tolerant task queue handling 1M daily async background jobs.' }
      ]),
      achievements: JSON.stringify([
        '1st Place at National AI Hackathon 2024',
        'Published research paper on Efficient Transformer Inference at IEEE'
      ]),
      languages: JSON.stringify(['English (Fluent)', 'Hindi (Native)']),
      preferredRoles: JSON.stringify(['AI Engineer', 'Machine Learning Engineer', 'Senior Full Stack Engineer', 'Backend Engineer']),
      preferredLocations: JSON.stringify(['Bengaluru', 'Remote', 'San Francisco', 'Hyderabad']),
      preferredWorkType: 'Remote',
      expectedSalary: '₹40,00,000 - ₹50,00,000',
      noticePeriod: '30 days',
    }).onConflictDoNothing();

    // Create initial email preferences
    await db.insert(emailPreferences).values({
      userId: uid,
      newMatchingJobs: true,
      applicationSubmitted: true,
      statusChanged: true,
      assessmentReceived: true,
      interviewScheduled: true,
      interviewReminder: true,
      offerReceived: true,
      jobClosingSoon: true,
      dailyDigest: true,
    }).onConflictDoNothing();

    // Seed default source connections
    const sources = ['LinkedIn Jobs', 'Indeed', 'Naukri', 'Foundit', 'Apna', 'Wellfound', 'Glassdoor', 'Company Careers'];
    for (const source of sources) {
      await db.insert(userSourceConnections).values({
        userId: uid,
        source,
        isConnected: true,
      });
    }

    // Seed default Answer Bank questions
    const standardAnswers = [
      { question: 'Are you willing to relocate?', answer: 'Yes, open to relocation for the right growth opportunity.', category: 'mobility' },
      { question: 'Notice period:', answer: '30 days', category: 'availability' },
      { question: 'Expected salary:', answer: '₹42,00,000 / year (negotiable based on total benefits)', category: 'compensation' },
      { question: 'Years of experience:', answer: '4.5 years', category: 'experience' },
      { question: 'Are you legally authorized to work in the country?', answer: 'Yes, authorized without sponsorship requirements.', category: 'authorization' },
      { question: 'Will you require visa sponsorship now or in the future?', answer: 'No', category: 'authorization' },
      { question: 'Why do you want to join this company?', answer: 'I admire your culture of engineering craft, rapid customer-focused innovation, and mission-critical scale. My background in ML infrastructure directly aligns with your roadmap.', category: 'motivation' },
      { question: 'What is your preferred work arrangement?', answer: 'Remote or Hybrid', category: 'work_type' },
    ];

    for (const item of standardAnswers) {
      await db.insert(applicationAnswerBank).values({
        userId: uid,
        question: item.question,
        answer: item.answer,
        category: item.category,
      });
    }

    // Seed initial 2 resumes for immediate smart matching and testing
    const sampleResume1 = `RAGHAVENDRA SHARMA
Senior AI/ML & LLM Engineer | Bengaluru, India | raghavendra@careerhub.ai | +91 9876543210
LinkedIn: linkedin.com/in/raghavendra-sharma | GitHub: github.com/raghavendra-sharma

PROFESSIONAL SUMMARY
Results-driven AI/ML Engineer with 4.5+ years designing, fine-tuning, and productionizing foundation models, transformer architectures, and distributed ML pipelines. Expert in Python, PyTorch, LLMs, LangChain, Vector Databases, and Kubernetes-based inference clusters.

CORE TECHNICAL SKILLS
- Languages: Python, SQL, C++, TypeScript, Bash
- AI / ML: PyTorch, TensorFlow, Hugging Face, Scikit-Learn, ONNX, vLLM, DeepSpeed
- Generative AI: Large Language Models (LLMs), LangChain, LangGraph, LlamaIndex, RAG, Prompt Engineering, RLHF
- Data & Cloud: PostgreSQL, Pinecone, Redis, AWS (S3, SageMaker, EC2), Docker, Kubernetes, FastAPI, REST APIs

PROFESSIONAL EXPERIENCE
Senior Machine Learning Engineer | Apex AI Labs (2023 - Present)
- Engineered scalable Generative AI evaluation pipeline reducing hallucination rates by 34% across 12 enterprise clients.
- Deployed vLLM inference engine on Kubernetes (AWS EKS), cutting latency from 850ms to 180ms per token generation.
- Designed vector retrieval system using Pinecone and dense embedding models supporting 50M+ document vectors.

Machine Learning Engineer | DataStream Inc. (2020 - 2023)
- Built predictive churn and recommendation models processing 20TB daily logs in PySpark and Python.
- Containerized 15+ ML model services into Docker images orchestrated with automated CI/CD pipelines.
- Partnered with product engineers to expose models via low-latency REST and gRPC endpoints.

EDUCATION
B.Tech in Computer Science & Engineering | National Institute of Technology (2016 - 2020) - GPA: 8.8/10`;

    const [res1] = await db.insert(resumes).values({
      userId: uid,
      name: 'AI & Machine Learning Engineer Resume',
      targetRole: 'AI Engineer / ML Engineer',
      version: 4,
      skills: JSON.stringify(['Python', 'PyTorch', 'Machine Learning', 'LLM', 'SQL', 'Docker', 'AWS', 'Kubernetes', 'FastAPI', 'REST API', 'Vector DB', 'LangChain']),
      experienceSummary: '4.5+ years building and deploying scalable AI, LLM, and Machine Learning systems.',
      educationSummary: 'B.Tech in Computer Science & Engineering (NIT)',
      projectsSummary: 'Enterprise RAG Evaluation Pipeline, vLLM Inference Engine, Vector Retrieval Platform',
      keywords: JSON.stringify(['Python', 'PyTorch', 'Machine Learning', 'LLM', 'SQL', 'AWS', 'Docker', 'Kubernetes', 'FastAPI', 'LangChain', 'vLLM']),
      rawText: sampleResume1,
      fileName: 'Raghavendra_AIML_Resume_v4.pdf',
      fileSize: '142 KB',
      isDefault: true,
      status: 'active',
    }).returning();

    // Add version record
    await db.insert(resumeVersions).values({
      resumeId: res1.id,
      userId: uid,
      versionNumber: 4,
      name: 'AI & Machine Learning Engineer Resume v4',
      rawText: sampleResume1,
      skills: JSON.stringify(['Python', 'PyTorch', 'Machine Learning', 'LLM', 'SQL', 'Docker', 'AWS', 'Kubernetes']),
      notes: 'Updated with recent LLM fine-tuning and Kubernetes inference accomplishments.',
    });

    // Add role mappings
    await db.insert(resumeRoleMappings).values([
      { resumeId: res1.id, userId: uid, targetRole: 'AI Engineer' },
      { resumeId: res1.id, userId: uid, targetRole: 'Machine Learning Engineer' },
      { resumeId: res1.id, userId: uid, targetRole: 'Generative AI Engineer' },
      { resumeId: res1.id, userId: uid, targetRole: 'LLM Solutions Architect' },
    ]);

    // Sample Resume 2: Software Engineer Resume
    const sampleResume2 = `RAGHAVENDRA SHARMA
Senior Full Stack & Backend Engineer | Bengaluru, India | raghavendra@careerhub.ai
Portfolio: careerhub-portfolio.dev | GitHub: github.com/raghavendra-sharma

SUMMARY
Versatile Full Stack Software Engineer with 4.5 years architecting high-throughput distributed microservices and responsive web applications. Strong expertise in TypeScript, React, Node.js, PostgreSQL, Docker, and REST/GraphQL APIs.

CORE SKILLS
- Frontend: React, TypeScript, Next.js, Tailwind CSS, HTML5/CSS3, Redux, State Management
- Backend: Node.js, Express, Go, Python, PostgreSQL, Redis, REST APIs, GraphQL, Microservices
- DevOps & Tools: Docker, Kubernetes, Git, CI/CD (GitHub Actions), AWS, Webpack, Vite

EXPERIENCE
Senior Software Engineer | Apex AI Labs (2023 - Present)
- Architected merchant web portals and developer dashboards using React 19, TypeScript, and Tailwind CSS.
- Optimized PostgreSQL database schema with indexing and query tuning, improving P99 API response times by 45%.
- Implemented robust JWT/OAuth authentication systems and role-based access control.

Software Engineer | TechCorp Global (2020 - 2023)
- Developed resilient microservices handling 10,000 requests per minute with Node.js and Redis caching.
- Built reusable modular UI component design system adopted across 8 engineering teams.

EDUCATION
B.Tech in Computer Science & Engineering | NIT (2016 - 2020)`;

    const [res2] = await db.insert(resumes).values({
      userId: uid,
      name: 'Full Stack Software Engineer Resume',
      targetRole: 'Full Stack Engineer / Backend Engineer',
      version: 3,
      skills: JSON.stringify(['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'REST API', 'Docker', 'Tailwind CSS', 'GraphQL', 'Redis', 'AWS']),
      experienceSummary: '4.5 years designing full-stack web applications and scalable distributed services.',
      educationSummary: 'B.Tech in Computer Science & Engineering',
      projectsSummary: 'Developer Dashboard, Microservices Migration, Modular Design System',
      keywords: JSON.stringify(['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'REST API', 'Docker', 'GraphQL', 'Redis']),
      rawText: sampleResume2,
      fileName: 'Raghavendra_FullStack_Resume_v3.pdf',
      fileSize: '128 KB',
      isDefault: false,
      status: 'active',
    }).returning();

    await db.insert(resumeVersions).values({
      resumeId: res2.id,
      userId: uid,
      versionNumber: 3,
      name: 'Full Stack Software Engineer Resume v3',
      rawText: sampleResume2,
      skills: JSON.stringify(['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'REST API', 'Docker']),
      notes: 'Added React 19 and distributed caching experience.',
    });

    await db.insert(resumeRoleMappings).values([
      { resumeId: res2.id, userId: uid, targetRole: 'Software Engineer' },
      { resumeId: res2.id, userId: uid, targetRole: 'Full Stack Engineer' },
      { resumeId: res2.id, userId: uid, targetRole: 'Backend Engineer' },
      { resumeId: res2.id, userId: uid, targetRole: 'Frontend UI/UX Engineer' },
    ]);

    return newUser;
  } catch (error) {
    console.error('Error in getOrCreateUser:', error);
    throw new Error('Failed to synchronize user.', { cause: error });
  }
}

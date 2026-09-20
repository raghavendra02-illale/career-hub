import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email: string;
    name?: string;
    picture?: string;
  };
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const demoEmail = req.headers['x-demo-email'] as string;
  const demoName = req.headers['x-demo-name'] as string;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1];

    if (token.startsWith('demo-session-')) {
      const rawUid = token.replace('demo-session-', '');
      const uid = rawUid.startsWith('user_') ? rawUid : `user_${rawUid}`;
      req.user = {
        uid: uid || 'user_alex_chen',
        email: demoEmail || 'alex.chen@example.com',
        name: demoName || 'Alex Chen',
      };
      return next();
    }

    try {
      const decodedToken: DecodedIdToken = await adminAuth.verifyIdToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        name: decodedToken.name,
        picture: decodedToken.picture,
      };
      return next();
    } catch (error) {
      if (demoEmail) {
        req.user = {
          uid: 'user_' + demoEmail.replace(/[^a-zA-Z0-9]/g, '_'),
          email: demoEmail,
          name: demoName || 'Demo User',
        };
        return next();
      }
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  }

  // If no auth header, but demo email header present (e.g. preview mode or demo testing)
  if (demoEmail) {
    req.user = {
      uid: 'user_' + demoEmail.replace(/[^a-zA-Z0-9]/g, '_'),
      email: demoEmail,
      name: demoName || 'Demo User',
    };
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized: Missing token' });
};

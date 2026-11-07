/**
 * ContentForge AI — Real Authentication Middleware (Epic 1: AC-AUTH-001, AC-AUTH-002)
 * Eliminates hardcoded users. Implements bcrypt password hashing, JWT sessions, and route protection.
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { dbStorage, User } from '../db/storage.js';

const JWT_SECRET = process.env.JWT_SECRET || 'contentforge_production_secret_key_2026';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: { id: string; email: string; plan: string }): string {
  return jwt.sign(
    { id: user.id, email: user.email, plan: user.plan },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export function verifyToken(token: string): { userId: string; email: string; plan?: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return { userId: decoded.id, email: decoded.email, plan: decoded.plan };
  } catch {
    return null;
  }
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Authentication token is required.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const user = dbStorage.getUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User account not found.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Forbidden: Invalid or expired authentication token.' });
  }
}

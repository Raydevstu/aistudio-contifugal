/**
 * ContentForge AI — Persistent Storage Engine (Epic 7: AC-DB-001)
 * Replaces in-memory storage with atomic disk-persisted database.
 * Preserves all users, projects, transcripts, clips, and exports across server restarts.
 */

import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  plan: 'Free' | 'Creator' | 'Pro';
  creditsBalanceMinutes: number;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
  confidence?: number;
}

export interface TranscriptSegment {
  id: string;
  start: number;
  end: number;
  text: string;
}

export interface Clip {
  id: string;
  projectId: string;
  title: string;
  startTime: number;
  endTime: number;
  duration: number;
  hookScore: number;
  engagementScore: number;
  viralityScore: number;
  reason: string;
  category: string;
  captionStyle: string;
  platform: string;
  exportUrl: string;
  createdAt: string;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  videoPath: string;
  durationMinutes: number;
  fileSizeMb: number;
  sourceType: 'UPLOAD' | 'YOUTUBE';
  status: 'PENDING' | 'TRANSCRIBED' | 'ANALYZED' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  transcript: TranscriptSegment[];
  wordTimestamps?: WordTimestamp[];
  clips: Clip[];
}

export interface ExportRecord {
  id: string;
  clipId: string;
  userId: string;
  format: 'MP4';
  resolution: '1080x1920';
  watermark: boolean;
  exportUrl: string;
  fileSizeBytes: number;
  createdAt: string;
  status: 'READY' | 'PROCESSING' | 'FAILED';
}

export interface BatchExportJob {
  id: string;
  userId: string;
  projectId: string;
  clipIds: string[];
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number; // 0 to 100
  totalClips: number;
  completedClips: number;
  exportIds: string[];
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface PublishScheduleRecord {
  id: string;
  userId: string;
  exportId: string;
  clipId: string;
  clipTitle: string;
  platform: 'TIKTOK' | 'INSTAGRAM_REELS' | 'YOUTUBE_SHORTS' | 'LINKEDIN';
  caption: string;
  hashtags: string[];
  scheduledAt: string;
  status: 'SCHEDULED' | 'PUBLISHING' | 'PUBLISHED' | 'FAILED';
  platformPostId?: string;
  createdAt: string;
  error?: string;
}

export interface DatabaseSchema {
  users: User[];
  projects: Project[];
  exports: ExportRecord[];
  batchExportJobs?: BatchExportJob[];
  publishSchedules?: PublishScheduleRecord[];
}

const DB_DIR = path.resolve('data');
const DB_FILE = path.join(DB_DIR, 'contentforge.db.json');

export class DatabaseManager {
  private data: DatabaseSchema = {
    users: [],
    projects: [],
    exports: [],
    batchExportJobs: [],
    publishSchedules: []
  };

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        console.log(`[Storage] Loaded persistent database from ${DB_FILE} (${this.data.users.length} users, ${this.data.projects.length} projects).`);
      } catch (e) {
        console.error('[Storage] Error loading database file, initializing fresh:', e);
        this.save();
      }
    } else {
      this.save();
      console.log(`[Storage] Created fresh database at ${DB_FILE}`);
    }
  }

  private save() {
    try {
      const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (e) {
      console.error('[Storage Error] Failed to persist database to disk:', e);
    }
  }

  // --- Users ---
  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: User): User {
    this.data.users.push(user);
    this.save();
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.getUserById(id);
    if (!user) return undefined;
    Object.assign(user, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return user;
  }

  // --- Projects ---
  getProjectsByUserId(userId: string): Project[] {
    return this.data.projects.filter(p => p.userId === userId);
  }

  getProjectById(id: string): Project | undefined {
    return this.data.projects.find(p => p.id === id);
  }

  createProject(project: Project): Project {
    this.data.projects.unshift(project);
    this.save();
    return project;
  }

  updateProject(id: string, updates: Partial<Project>): Project | undefined {
    const proj = this.getProjectById(id);
    if (!proj) return undefined;
    Object.assign(proj, updates);
    this.save();
    return proj;
  }

  deleteProject(id: string): boolean {
    const initialLen = this.data.projects.length;
    this.data.projects = this.data.projects.filter(p => p.id !== id);
    if (this.data.projects.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Clips ---
  addClipsToProject(projectId: string, clips: Clip[]): Clip[] {
    const proj = this.getProjectById(projectId);
    if (!proj) return [];
    proj.clips = clips;
    this.save();
    return clips;
  }

  getClipById(clipId: string): Clip | undefined {
    for (const proj of this.data.projects) {
      const found = (proj.clips || []).find(c => c.id === clipId);
      if (found) return found;
    }
    return undefined;
  }

  // --- Exports ---
  createExport(exportRecord: ExportRecord): ExportRecord {
    this.data.exports.unshift(exportRecord);
    this.save();
    return exportRecord;
  }

  getExportsByUserId(userId: string): ExportRecord[] {
    return this.data.exports.filter(e => e.userId === userId);
  }

  // --- Batch Export Jobs ---
  createBatchExportJob(job: BatchExportJob): BatchExportJob {
    if (!this.data.batchExportJobs) this.data.batchExportJobs = [];
    this.data.batchExportJobs.unshift(job);
    this.save();
    return job;
  }

  getBatchExportJobById(id: string): BatchExportJob | undefined {
    return (this.data.batchExportJobs || []).find(j => j.id === id);
  }

  getBatchExportJobsByUserId(userId: string): BatchExportJob[] {
    return (this.data.batchExportJobs || []).filter(j => j.userId === userId);
  }

  updateBatchExportJob(id: string, updates: Partial<BatchExportJob>): BatchExportJob | undefined {
    const job = this.getBatchExportJobById(id);
    if (!job) return undefined;
    Object.assign(job, updates);
    this.save();
    return job;
  }

  // --- Publish Schedules ---
  createPublishSchedule(schedule: PublishScheduleRecord): PublishScheduleRecord {
    if (!this.data.publishSchedules) this.data.publishSchedules = [];
    this.data.publishSchedules.unshift(schedule);
    this.save();
    return schedule;
  }

  getPublishSchedulesByUserId(userId: string): PublishScheduleRecord[] {
    return (this.data.publishSchedules || []).filter(s => s.userId === userId);
  }

  getPublishScheduleById(id: string): PublishScheduleRecord | undefined {
    return (this.data.publishSchedules || []).find(s => s.id === id);
  }

  updatePublishSchedule(id: string, updates: Partial<PublishScheduleRecord>): PublishScheduleRecord | undefined {
    const sched = this.getPublishScheduleById(id);
    if (!sched) return undefined;
    Object.assign(sched, updates);
    this.save();
    return sched;
  }

  // Debug/Telemetry
  getMetrics() {
    const totalUsers = this.data.users.length;
    const totalProjects = this.data.projects.length;
    const totalClips = this.data.projects.reduce((acc, p) => acc + (p.clips?.length || 0), 0);
    const paidUsers = this.data.users.filter(u => u.plan !== 'Free');
    const mrr = paidUsers.reduce((acc, u) => acc + (u.plan === 'Pro' ? 99 : 49), 0);

    return {
      totalUsers,
      totalProjects,
      totalClips,
      mrr,
      paidUsersCount: paidUsers.length
    };
  }
}

export const dbStorage = new DatabaseManager();

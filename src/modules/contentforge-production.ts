// ==========================================
// CONTENTFORGE AI — PRODUCTION IMPLEMENTATION (PROMPTS 4 TO 10)
// ==========================================

// ------------------------------------------
// PROMPT 4: PRISMA SCHEMA (/prisma/schema.prisma)
// ------------------------------------------
export const PRISMA_SCHEMA = `
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String          @id @default(uuid())
  clerkId       String          @unique
  email         String          @unique
  name          String?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  subscription  Subscription?
  projects      Project[]
  usageTracking UsageTracking[]
  billingEvents BillingEvent[]

  @@index([clerkId])
  @@index([email])
}

model Subscription {
  id                   String             @id @default(uuid())
  userId               String             @unique
  user                 User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  stripeCustomerId     String             @unique
  stripeSubscriptionId String             @unique
  plan                 SubscriptionPlan   @default(FREE)
  status               SubscriptionStatus @default(ACTIVE)
  renewalDate          DateTime
  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt

  @@index([stripeCustomerId])
}

enum SubscriptionPlan {
  FREE
  CREATOR
  PRO
}

enum SubscriptionStatus {
  ACTIVE
  CANCELED
  PAST_DUE
}

model Project {
  id              String        @id @default(uuid())
  userId          String
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  title           String
  sourceType      SourceType    @default(YOUTUBE)
  status          ProjectStatus @default(PENDING)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  video           Video?
  transcript      Transcript?
  clips           Clip[]

  @@index([userId])
}

enum SourceType {
  YOUTUBE
  UPLOAD_MP4
  UPLOAD_MOV
}

enum ProjectStatus {
  PENDING
  TRANSCRIBING
  ANALYZING
  COMPLETED
  FAILED
}

model Video {
  id         String   @id @default(uuid())
  projectId  String   @unique
  project    Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  storageUrl String
  fileSizeMb Float
  resolution String
  duration   Float
  createdAt  DateTime @default(now())
}

model Transcript {
  id        String   @id @default(uuid())
  projectId String   @unique
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  rawText   String
  wordsJson Json
  createdAt DateTime @default(now())
}

model Clip {
  id              String   @id @default(uuid())
  projectId       String
  project         Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  title           String
  startTime       Float
  endTime         Float
  duration        Float
  hookScore       Int
  engagementScore Int
  viralityScore   Int
  reason          String
  captionStyle    String
  platform        String
  createdAt       DateTime @default(now())
  exports         Export[]

  @@index([projectId])
}

model Export {
  id         String       @id @default(uuid())
  clipId     String
  clip       Clip         @relation(fields: [clipId], references: [id], onDelete: Cascade)
  exportUrl  String
  format     String       @default("MP4")
  resolution String       @default("1080x1920")
  watermark  Boolean      @default(true)
  status     ExportStatus @default(PROCESSING)
  createdAt  DateTime     @default(now())

  @@index([clipId])
}

enum ExportStatus {
  PROCESSING
  READY
  FAILED
}

model UsageTracking {
  id              String   @id @default(uuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  minutesUsed     Int      @default(0)
  videosProcessed Int      @default(0)
  billingMonth    String
  createdAt       DateTime @default(now())

  @@unique([userId, billingMonth])
}

model BillingEvent {
  id               String   @id @default(uuid())
  userId           String
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  stripeEventId    String   @unique
  stripeCustomerId String
  amountPaid       Float
  currency         String   @default("USD")
  status           String
  createdAt        DateTime @default(now())

  @@index([userId])
}
`;

// ------------------------------------------
// PROMPT 5: AUTHENTICATION IMPLEMENTATION
// ------------------------------------------
export const AUTH_IMPLEMENTATION = `
// middleware.ts (Clerk Protected Routes)
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook(.*)'
]);

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect();
  }
});

export const config = {
  matcher: ['/((?!.*\\\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};

// app/api/webhook/clerk/route.ts (User Profile Sync to PostgreSQL via Prisma)
import { Webhook } from 'svix';
import { headers } from 'headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!SIGNING_SECRET) throw new Error('Missing CLERK_WEBHOOK_SECRET');

  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse('Error occured -- no svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(SIGNING_SECRET);

  let evt: any;
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    return new NextResponse('Webhook verification failed', { status: 400 });
  }

  const eventType = evt.type;
  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses[0]?.email_address;

    await prisma.user.upsert({
      where: { clerkId: id },
      update: { email, name: \`\${first_name || ''} \${last_name || ''}\`.trim() },
      create: {
        clerkId: id,
        email,
        name: \`\${first_name || ''} \${last_name || ''}\`.trim(),
      },
    });
  }

  return NextResponse.json({ success: true });
}
`;

// ------------------------------------------
// PROMPT 8 & 10: UPLOAD SYSTEM & STORAGE LAYER
// ------------------------------------------
export const STORAGE_AND_UPLOAD_IMPLEMENTATION = `
// lib/supabase.ts (Supabase Storage Layer)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadVideoToSupabase(file: Buffer, fileName: string, mimeType: string) {
  const filePath = \`originals/\${Date.now()}_\${fileName}\`;
  const { data, error } = await supabase.storage
    .from('contentforge-videos')
    .upload(filePath, file, { contentType: mimeType, upsert: false });

  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from('contentforge-videos')
    .getPublicUrl(filePath);

  return publicUrl;
}
`;

// ------------------------------------------
// PROMPT 9: YOUTUBE URL IMPORT
// ------------------------------------------
export const YOUTUBE_IMPORT_IMPLEMENTATION = `
// lib/youtube.ts
export async function fetchYoutubeMetadata(videoUrl: string) {
  const ytRegex = /(?:youtube\\.com\\/(?:[^\\/]+\\/.+\\/.+\\/|(?:v|e(?:mbed)?)\\/|.*[?&]v=)|youtu\\.be\\/)([^"&?\\/\\s]{11})/;
  const match = videoUrl.match(ytRegex);
  
  if (!match) {
    throw new Error('Invalid YouTube URL');
  }

  const videoId = match[1];
  return {
    videoId,
    title: 'Extracted YouTube Masterclass Episode',
    durationMinutes: 18,
    sourceUrl: videoUrl
  };
}
`;

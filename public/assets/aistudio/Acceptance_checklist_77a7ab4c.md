For ContentForge AI, the MVP is accepted only when a real user can pay, upload a real video, generate real clips, and export a real MP4 without any mocked data.

MVP Acceptance Criteria v1.0
Epic 1: Authentication
AC-AUTH-001 User Registration

Given A new visitor

When The visitor creates an account

Then

✅ User record created in database

✅ Session established

✅ User redirected to dashboard

✅ No hardcoded user data used

AC-AUTH-002 Route Protection

Given An unauthenticated visitor

When The visitor accesses:

/dashboard
/projects
/billing
/settings


Then

✅ Redirect to login

Epic 2: Real Video Upload
AC-UPLOAD-001 File Upload

Given A logged-in user

When The user uploads:

MP4
MOV


Then

✅ File stored

✅ Project record created

✅ Upload progress shown

✅ Metadata saved

AC-UPLOAD-002 File Limit

When

file > 500 MB


Then

✅ Upload rejected

✅ Validation message shown

✅ No project created

Epic 3: Real Transcription
AC-TRANSCRIPT-001 Whisper Processing

Given An uploaded video

When Transcription starts

Then

✅ Audio extracted

✅ Whisper runs

✅ Transcript generated

✅ Transcript stored in database

AC-TRANSCRIPT-002 Word Timestamps

Then

✅ Every word includes:

word
start
end


Example:

{
  "word": "Retention",
  "start": 1.52,
  "end": 2.10
}

Epic 4: Viral Analysis
AC-VIRAL-001 Dynamic Scoring

Given A transcript

When Analysis runs

Then

✅ Different videos produce different scores

✅ No hardcoded clips

✅ No predefined scores

AC-VIRAL-002 AI Explanation

Each clip must contain:

{
  "score": 91,
  "hookScore": 95,
  "engagementScore": 89,
  "viralReason": "Strong curiosity hook and educational payoff."
}

Failure Condition

Reject release if:

viral_clip_1
viral_clip_2
viral_clip_3

or

Math.random()


is used.

Epic 5: Clip Generation
AC-CLIP-001 Real FFmpeg Render

Given A clip candidate

When User generates clip

Then

✅ FFmpeg executes

✅ MP4 created

✅ File exists on disk

AC-CLIP-002 Resolution

Generated video must be:

1080 x 1920
H264
Playable MP4


Verified by:

ffprobe

Epic 6: Caption Engine
AC-CAPTION-001 Subtitle Generation

Given Whisper timestamps

When Caption generation runs

Then

✅ ASS subtitles generated

✅ Timestamp synchronized

✅ No missing words

AC-CAPTION-002 Export Rendering

Exported clip contains:

✅ Visible captions

✅ Correct timing

✅ Selected style

Epic 7: Database Persistence
AC-DB-001 Persistence

Given Server restart

Then

✅ Users remain

✅ Projects remain

✅ Clips remain

✅ Exports remain

Failure Condition

Release blocked if:

let db = {


is still production storage.

Epic 8: Payments
AC-STRIPE-001 Checkout

Given Free user

When Upgrade clicked

Then

✅ Real Stripe checkout session created

AC-STRIPE-002 Subscription Sync

Given Successful payment

Then

✅ Plan updated

✅ Database updated

✅ Limits updated

Failure Condition

Release blocked if:

checkout URL manually generated


instead of stripe SDK.

Epic 9: Usage Limits
Free Plan
15 minutes/month

3 exports/month

watermarked exports

Creator Plan
300 minutes/month

unlimited exports

no watermark

Acceptance
✅ Limits enforced server-side

✅ Cannot bypass via API

Epic 10: API Quality

Every endpoint must:

✅ Return valid JSON

✅ Handle errors

✅ Return correct status codes

✅ Never crash server


Required endpoints:

/api/upload
/api/projects
/api/transcript
/api/clips
/api/export
/api/user

Epic 11: Testing
Unit Tests

Minimum:

80% coverage


Required:

plan enforcement
viral scoring
caption generation
stripe handling
FFmpeg generation

E2E Tests

Must pass:

Signup
Upload video
Generate transcript
Generate clips
Export MP4
Upgrade plan

Epic 12: Production Readiness
Build
pnpm lint


Result:

0 errors

pnpm tsc --noEmit


Result:

0 errors

pnpm test


Result:

All tests pass

pnpm build


Result:

Build succeeds

MVP Go/No-Go Gate
GO

Only if ALL are true:

✅ Real auth

✅ Real uploads

✅ Real persistence

✅ Real transcripts

✅ Real AI scoring

✅ Real FFmpeg exports

✅ Real Stripe payments

✅ Usage limits enforced

✅ Tests pass

✅ Build passes

NO-GO

If ANY of these remain:

❌ Hardcoded transcripts

❌ Hardcoded viral clips

❌ let db = {}

❌ Fake uploads

❌ Fake YouTube metadata

❌ Fake Stripe URLs

❌ Mock users

❌ Placeholder exports

Success Definition

A creator can:

Sign up
↓
Pay $49
↓
Upload a real video
↓
Generate a real transcript
↓
Generate AI-selected viral clips
↓
Export a real MP4 with captions
↓
Download the result


without encountering mocked data, manual intervention, or broken functionality. That's the minimum bar for ContentForge AI MVP launch.
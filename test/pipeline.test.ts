/**
 * ContentForge AI — Comprehensive End-to-End Verification Test Suite
 * Validates FFmpeg video rendering, ASS subtitle generation, Stripe webhook verification,
 * and API endpoint functionality.
 */

import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import crypto from 'node:crypto';
import { 
  executeFFmpegClipGeneration, 
  generateAssSubtitles, 
  enforcePlanLimits,
  verifyStripeSignature,
  handleStripeWebhook,
  PLAN_LIMITS
} from '../src/modules/contentforge-pipeline-engine.ts';

test('1. FFmpeg 9:16 Video Rendering Pipeline', async () => {
  const outputFileName = `test_verification_${Date.now()}.mp4`;
  const result = await executeFFmpegClipGeneration({
    inputVideoPath: 'none',
    outputClipPath: outputFileName,
    startTime: 0,
    duration: 5,
    resolution: '1080x1920',
    title: 'E2E Verification Short',
    watermark: true
  });

  assert.strictEqual(result.success, true, 'FFmpeg execution should succeed');
  assert.ok(result.fileSizeBytes > 10000, 'Rendered MP4 file size should be > 10KB');
  
  const absolutePath = path.resolve('public/exports', outputFileName);
  assert.ok(fs.existsSync(absolutePath), 'Rendered MP4 file must exist on disk');

  // Verify file with ffprobe
  const ffprobeOutput = execSync(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height,codec_name -of csv=p=0 "${absolutePath}"`).toString().trim();
  console.log(`[Test] ffprobe stream info: ${ffprobeOutput}`);
  assert.ok(ffprobeOutput.includes('1080'), 'Video width must be 1080');
  assert.ok(ffprobeOutput.includes('1920'), 'Video height must be 1920');
  assert.ok(ffprobeOutput.includes('h264'), 'Video codec must be h264');
});

test('2. TikTok ASS Subtitle Engine', () => {
  const words = [
    { word: "Hook", start: 0.0, end: 0.5 },
    { word: "retention", start: 0.5, end: 1.0 },
    { word: "formula", start: 1.0, end: 1.5 }
  ];

  const assContent = generateAssSubtitles(words, 'Word Highlight Karaoke');
  assert.ok(assContent.includes('[Script Info]'), 'ASS header must be present');
  assert.ok(assContent.includes('PlayResX: 1080'), 'X resolution must be 1080');
  assert.ok(assContent.includes('PlayResY: 1920'), 'Y resolution must be 1920');
  assert.ok(assContent.includes('TikTokKaraoke'), 'TikTok style must be declared');
  assert.ok(assContent.includes('Dialogue:'), 'Subtitles dialogue lines must be generated');
});

test('3. Plan Limits & Usage Quota Enforcement', () => {
  const freeUsage = {
    userId: 'user_1',
    plan: 'Free',
    minutesUploaded: 10,
    minutesProcessed: 10,
    exportsCreated: 2,
    billingMonth: '2026-11'
  };

  // Free plan has 15 minutes limit: requesting 10 more exceeds limit (10+10 > 15)
  const rejected = enforcePlanLimits(freeUsage as any, 10);
  assert.strictEqual(rejected.allowed, false, 'Should reject when usage exceeds Free quota');
  assert.ok(rejected.reason?.includes('Plan limit exceeded'), 'Reason must specify plan limit');

  // Requesting 4 minutes stays within limit (10+4 <= 15)
  const allowed = enforcePlanLimits(freeUsage as any, 4);
  assert.strictEqual(allowed.allowed, true, 'Should allow when within Free quota');

  // Creator plan has 300 minutes limit
  const creatorUsage = { ...freeUsage, plan: 'Creator' };
  const creatorAllowed = enforcePlanLimits(creatorUsage as any, 150);
  assert.strictEqual(creatorAllowed.allowed, true, 'Creator tier should allow 150 minutes processing');
});

test('4. Stripe Webhook Signature & Event Processing', () => {
  const secret = 'whsec_test_secret_for_verification';
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const rawBody = JSON.stringify({ id: 'evt_101', type: 'customer.subscription.updated', data: { customer: 'cus_1', plan: 'Pro', status: 'active' } });

  const signature = crypto.createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
  const signatureHeader = `t=${timestamp},v1=${signature}`;

  // Verify valid signature
  const validCheck = verifyStripeSignature(rawBody, signatureHeader, secret);
  assert.strictEqual(validCheck.valid, true, 'Valid Stripe signature must pass');

  // Verify invalid signature rejection
  const invalidCheck = verifyStripeSignature(rawBody, `t=${timestamp},v1=invalid_signature_hex`, secret);
  assert.strictEqual(invalidCheck.valid, false, 'Invalid Stripe signature must be rejected');

  // Test event processing
  const updateResult = handleStripeWebhook({
    id: 'evt_101',
    type: 'customer.subscription.updated',
    data: { customer: 'cus_1', plan: 'Pro', status: 'active' }
  });
  assert.strictEqual(updateResult.success, true);
  assert.strictEqual(updateResult.updatedPlan, 'Pro');

  const cancelResult = handleStripeWebhook({
    id: 'evt_102',
    type: 'customer.subscription.deleted',
    data: { customer: 'cus_1', plan: 'Pro', status: 'canceled' }
  });
  assert.strictEqual(cancelResult.success, true);
  assert.strictEqual(cancelResult.updatedPlan, 'Free', 'Cancellation must downgrade to Free');
});

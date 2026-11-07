import test from 'node:test';
import assert from 'node:assert';
import { formatVideoUrl } from '../src/utils/videoUrl';

test('formatVideoUrl handles YouTube URLs gracefully with demo MP4 fallback', () => {
  const result = formatVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  assert.strictEqual(result, '/exports/real_demo_clip.mp4');
});

test('formatVideoUrl preserves direct HTTPS MP4 URLs without protocol mangling', () => {
  const url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
  const result = formatVideoUrl(url);
  assert.strictEqual(result, url);
});

test('formatVideoUrl safely encodes spaces in relative export paths', () => {
  const result = formatVideoUrl('/exports/sample video clip.mp4');
  assert.strictEqual(result, '/exports/sample%20video%20clip.mp4');
});

test('formatVideoUrl handles null/empty inputs with default demo clip', () => {
  assert.strictEqual(formatVideoUrl(null), '/exports/real_demo_clip.mp4');
  assert.strictEqual(formatVideoUrl(''), '/exports/real_demo_clip.mp4');
});

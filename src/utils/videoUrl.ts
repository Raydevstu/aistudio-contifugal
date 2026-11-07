/**
 * Normalizes video file paths/URLs into clean web-accessible URLs
 * for browser HTML5 <video> elements with safe URL handling.
 */
export function formatVideoUrl(urlOrPath: string | null | undefined): string {
  if (!urlOrPath) {
    const fallback = '/exports/real_demo_clip.mp4';
    console.log('[formatVideoUrl] Input is empty/null. Fallback to:', fallback);
    return fallback;
  }

  const trimmed = urlOrPath.trim();

  // 1. YouTube & Third-Party Web Video Page Handling
  // HTML5 <video> elements cannot play YouTube web URLs directly. Fallback to demo clip.
  if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be') || trimmed.includes('vimeo.com')) {
    const fallback = '/exports/real_demo_clip.mp4';
    console.log(`[formatVideoUrl] YouTube/Web page URL detected ("${trimmed}"). Using video fallback: "${fallback}"`);
    return fallback;
  }

  // 2. Direct HTTP / HTTPS / Blob / Data URLs
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    console.log(`[formatVideoUrl] Direct web video stream URL: "${trimmed}"`);
    return trimmed;
  }

  // 3. Relative Server Paths
  let resolved = '';
  if (trimmed.startsWith('/exports/')) {
    resolved = trimmed;
  } else if (trimmed.startsWith('/uploads/')) {
    resolved = trimmed;
  } else if (trimmed.includes('/public/exports/')) {
    const filename = trimmed.split('/public/exports/')[1];
    resolved = `/exports/${filename}`;
  } else if (trimmed.includes('/exports/')) {
    const filename = trimmed.split('/exports/')[1];
    resolved = `/exports/${filename}`;
  } else if (trimmed.includes('/uploads/')) {
    const filename = trimmed.split('/uploads/')[1];
    resolved = `/uploads/${filename}`;
  } else if (trimmed.endsWith('.mp4') || trimmed.endsWith('.mov') || trimmed.endsWith('.webm') || trimmed.endsWith('.mkv')) {
    const filename = trimmed.split('/').pop() || trimmed;
    resolved = `/exports/${filename}`;
  } else {
    resolved = '/exports/real_demo_clip.mp4';
  }

  // Safely URL-encode relative path segments (e.g. spaces in filenames)
  const segments = resolved.split('/');
  const encodedSegments = segments.map((seg, idx) => {
    if (idx === 0 && seg === '') return '';
    return encodeURIComponent(seg);
  });
  const finalUrl = encodedSegments.join('/');

  console.log(`[formatVideoUrl Trace] "${urlOrPath}" -> Resolved relative URL: "${finalUrl}"`);
  return finalUrl;
}

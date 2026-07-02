/**
 * helpers.js — Pure utility functions
 * No side effects, no imports. Safe to use anywhere.
 */

/**
 * Format a date string as "June 25, 2026"
 * Falls back gracefully if the value is null / undefined / invalid.
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

/**
 * Format a date string as "Jun 2026" — for compact displays
 */
export function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short',
  });
}

/**
 * Format a date as relative time: "3 days ago", "just now", etc.
 */
export function formatRelative(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)   return 'just now';
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  return formatDateShort(dateStr);
}

/**
 * Truncate a string to `len` characters, appending "…"
 */
export function truncate(str, len = 120) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len).trimEnd() + '…' : str;
}

/**
 * Convert a string to a URL-safe slug
 * "Hello World!" → "hello-world"
 */
export function slugify(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Extract a plain-text excerpt from HTML content
 * Used to generate auto-excerpts when the author hasn't set one.
 */
export function htmlToText(html, maxLen = 160) {
  if (!html) return '';
  const plain = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return truncate(plain, maxLen);
}

/**
 * Format a view count: 1200 → "1.2k"
 */
export function formatViews(n) {
  if (!n) return '0';
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

/**
 * Build a query string from an object, omitting nullish values.
 * { page: 1, tag: 'react', status: null } → "?page=1&tag=react"
 */
export function buildQuery(params) {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return qs ? `?${qs}` : '';
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

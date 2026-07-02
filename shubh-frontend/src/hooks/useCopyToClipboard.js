/**
 * useCopyToClipboard.js
 *
 * Returns [copied, copy(text)].
 * `copied` is true for 2 seconds after a successful copy, then resets.
 * Falls back to document.execCommand for older browsers.
 *
 * Usage:
 *   const [copied, copy] = useCopyToClipboard();
 *   <button onClick={() => copy(window.location.href)}>
 *     {copied ? 'Copied!' : 'Copy Link'}
 *   </button>
 */

import { useState, useCallback, useRef } from 'react';

export function useCopyToClipboard(resetDelay = 2000) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  const copy = useCallback(async (text) => {
    // Clear any existing reset timer
    if (timerRef.current) clearTimeout(timerRef.current);

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for http or older browsers
        const el = document.createElement('textarea');
        el.value = text;
        el.style.cssText = 'position:fixed;left:-9999px;top:-9999px';
        document.body.appendChild(el);
        el.focus();
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setCopied(true);
      timerRef.current = setTimeout(() => setCopied(false), resetDelay);
    } catch (err) {
      console.warn('useCopyToClipboard: copy failed', err);
      setCopied(false);
    }
  }, [resetDelay]);

  return [copied, copy];
}

/**
 * useTableOfContents.js
 *
 * Parses h2 and h3 elements from the rendered post content and
 * returns a structured list of headings with their IDs and active state.
 *
 * How it works:
 *  1. After content renders, scan the DOM for h2/h3 inside `.prose-dark`
 *  2. Auto-inject `id` attributes on headings that don't have them
 *  3. Use IntersectionObserver to track which heading is in view
 *  4. Return `headings` array and `activeId` string
 *
 * Usage:
 *   const { headings, activeId } = useTableOfContents(post.content);
 *   // headings: [{ id, text, level }]
 *   // activeId: 'heading-slug' of the currently visible heading
 */

import { useState, useEffect } from 'react';
import { slugify } from '../utils/helpers';

export function useTableOfContents(content) {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');

  // Parse headings after content mounts
  useEffect(() => {
    if (!content) return;

    // Give the DOM time to render the dangerouslySetInnerHTML content
    const timer = setTimeout(() => {
      const container = document.querySelector('.prose-dark');
      if (!container) return;

      const nodes = container.querySelectorAll('h2, h3');
      const items = [];

      nodes.forEach((node) => {
        const text = node.textContent?.trim() || '';
        if (!text) return;

        // Generate a stable id from the heading text if one doesn't exist
        if (!node.id) {
          node.id = slugify(text);
        }

        items.push({
          id:    node.id,
          text,
          level: node.tagName === 'H2' ? 2 : 3,
        });
      });

      setHeadings(items);
    }, 100);

    return () => clearTimeout(timer);
  }, [content]);

  // Track active heading with IntersectionObserver
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible heading
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        // Fire when heading enters the top 20% of the viewport
        rootMargin: '-10% 0px -70% 0px',
        threshold:  0,
      }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  return { headings, activeId };
}

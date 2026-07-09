/**
 * SEO.jsx — Per-page <head> metadata via react-helmet-async
 *
 * Renders:
 *  - <title>
 *  - <meta name="description">
 *  - Open Graph tags (og:type, og:title, og:description, og:image, og:url)
 *  - Twitter card tags
 *
 * Usage:
 *   <SEO
 *     title="About"
 *     description="The full story of Shubh Jaiswal."
 *     image="https://…/og-about.jpg"
 *     type="website"
 *   />
 *
 *   When `title` is omitted, uses the default site title.
 *   When `description` is omitted, uses the default site description.
 */

import { Helmet } from 'react-helmet-async';

const SITE_NAME = import.meta.env.VITE_SITE_NAME || 'Shubh Jaiswal';
const SITE_URL  = import.meta.env.VITE_SITE_URL  || 'https://shubhjaiswal.dev';
const DEFAULT_DESC =
  'B.Tech CSE student, MERN Stack Developer, Guitarist, and Kickboxer building things that matter.';

export default function SEO({
  title,
  description,
  image,
  type        = 'website',
  canonicalPath = '',
}) {
  const fullTitle = title
    ? `${title} — ${SITE_NAME}`
    : `${SITE_NAME} — Developer · Guitarist · Builder`;

  const desc      = description || DEFAULT_DESC;
  const canonical = `${SITE_URL}${canonicalPath}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type"      content={type} />
      <meta property="og:title"     content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url"       content={canonical} />
      {image && <meta property="og:image" content={image} />}

      {/* Twitter */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
}

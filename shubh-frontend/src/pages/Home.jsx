/**
 * Home.jsx
 *
 * Section order (matches spec):
 *  1. Hero
 *  2. CurrentMission
 *  3. FeaturedBlogs
 *  4. Skills
 *  5. ProjectsShowcase
 *  6. JourneyDashboard    (teaser — links to /journey)
 *  7. Philosophy
 *  8. Newsletter
 *
 * No title prop → SEO renders the default site title.
 * "Shubh Jaiswal — Developer · Guitarist · Builder"
 */

import SEO              from '../components/common/SEO';
import PageWrapper      from '../components/common/PageWrapper';
import Hero             from '../components/sections/Hero';
import CurrentMission   from '../components/sections/CurrentMission';
import FeaturedBlogs    from '../components/sections/FeaturedBlogs';
import Skills           from '../components/sections/Skills';
import ProjectsShowcase from '../components/sections/ProjectsShowcase';
import JourneyDashboard from '../components/sections/JourneyDashboard';
import Philosophy       from '../components/sections/Philosophy';
import Newsletter       from '../components/sections/Newsletter';

export default function Home() {
  return (
    <PageWrapper>
      {/* No title → defaults to "Shubh Jaiswal — Developer · Guitarist · Builder" */}
      <SEO
        description="B.Tech CSE student, MERN Stack Developer, Guitarist, and Kickboxer building things that matter."
        canonicalPath="/"
      />
      <Hero />
      {/* <CurrentMission /> */}
      <FeaturedBlogs />
      <Skills />
      <ProjectsShowcase />
      {/* <JourneyDashboard /> */}
      <Philosophy />
      <Newsletter />
    </PageWrapper>
  );
}

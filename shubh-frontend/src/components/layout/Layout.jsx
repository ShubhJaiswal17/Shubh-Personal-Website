/**
 * Layout.jsx — Shell for all public-facing pages
 *
 * Renders:
 *   ScrollToTop  — scrolls window on route change, shows back-to-top button
 *   Navbar       — fixed top navigation
 *   <main>       — page content via <Outlet />
 *   Footer       — full-width footer
 *
 * The `grain` class applies a fixed-position pseudo-element with a subtle
 * noise texture overlay — the Dark Academia tactile signature.
 */

import { Outlet } from 'react-router-dom';
import Navbar      from './Navbar';
import Footer      from './Footer';
import ScrollToTop from '../common/ScrollToTop';

export default function Layout() {
  return (
    <div className="grain min-h-screen flex flex-col bg-bg">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

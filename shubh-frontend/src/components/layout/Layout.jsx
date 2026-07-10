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

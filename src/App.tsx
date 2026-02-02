import React from 'react';
import * as router from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Layout/Header';
import Home from './pages/Home';
import Archive from './pages/Archive';
import OTK from './pages/OTK';
import AdminLogin from './pages/Admin/Login';
import Dashboard from './pages/Admin/Dashboard';
import ManagerPanel from './pages/Manager/ManagerPanel';
import StudentLogin from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Profile from './pages/Profile'; // Import the new Profile page
import Boundle from './pages/Boundle'; // Import Boundle Lobby
import About from './pages/About'; // Import About Page
import PublicationsPage from './pages/Publications'; // Import Publications Page
import DiaryPage from './pages/Publications/Diary'; // Import Diary Page
import PublicationDetail from './pages/Publications/PublicationDetail'; // Import Publication Detail Page
import Forum from './pages/Forum';
import AcademicReviews from './pages/Forum/Courses';
import CourseDetail from './pages/Forum/CourseDetail';
import InstructorDetail from './pages/Forum/InstructorDetail';
import ClubReviews from './pages/Forum/Clubs';
import ClubDetail from './pages/Forum/ClubDetail';
import Community from './pages/Forum/Discussions';
import ThreadDetail from './pages/Forum/ThreadDetail'; // Import ThreadDetail Page
import ProtectedRoute from './components/Auth/ProtectedRoute';
import RequireProfileSetup from './components/Auth/RequireProfileSetup'; // Onboarding Modal

const { Routes, Route, useLocation, Link } = router;

import MobileBottomNav from './components/PWA/MobileBottomNav';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  // Hide header on all admin/manager pages and auth pages
  const hideHeader = location.pathname.startsWith('/admin') || location.pathname.startsWith('/auth') || location.pathname.startsWith('/yonetim');

  return (
    <div className="flex flex-col min-h-screen text-stone-900 font-sans selection:bg-boun-blue/20 relative overflow-x-hidden">
      {/* GLOBAL OVERLAY FOR ONBOARDING */}
      <RequireProfileSetup />

      {!hideHeader && <Header />}

      <main className="flex-grow">
        {children}
      </main>

      {!hideHeader && (
        <>
          <footer className="bg-stone-900 text-stone-400 py-8 text-center text-sm font-serif border-t border-stone-800 mb-0 md:mb-0 pb-24 md:pb-8">
            <p>© {new Date().getFullYear()} Boğaziçi Üniversitesi Öğrenci Temsilciliği Kurulu | Kolektif Hamlin. Tüm hakları saklıdır.</p>
            <p className="mt-2 opacity-50 text-xs">
              Bağımsız Öğrenci Platformu | <Link to="/hakkinda" className="hover:text-stone-200 transition-colors">Hakkında & Lisans</Link>
            </p>
          </footer>
          <MobileBottomNav />
        </>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* --- GRUP A: HERKESE AÇIK (Public) --- */}
          <Route path="/" element={<Home />} />
          <Route path="/otk" element={<OTK />} />
          <Route path="/hakkinda" element={<About />} />
          <Route path="/yayinlar" element={<PublicationsPage />} />
          <Route path="/yayinlar/:id" element={<PublicationDetail />} />
          <Route path="/yayinlar-gunluk" element={<DiaryPage />} />

          {/* Auth Pages */}
          <Route path="/auth/login" element={<StudentLogin />} />
          <Route path="/auth/register" element={<Register />} />

          {/* Admin Login (Must be public to allow entry) */}
          <Route path="/admin/login" element={<AdminLogin />} />


          {/* --- GRUP B: SADECE ÜYELERE (Logged In) --- */}
          <Route
            path="/arsiv"
            element={
              <ProtectedRoute requireAdmin={false}>
                <Archive />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute requireAdmin={false}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/boundle"
            element={
              <ProtectedRoute requireAdmin={false}>
                <Boundle />
              </ProtectedRoute>
            }
          />

          {/* Forum Routes */}
          <Route
            path="/forum"
            element={
              <ProtectedRoute requireAdmin={false}>
                <Forum />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forum/akademik"
            element={
              <ProtectedRoute requireAdmin={false}>
                <AcademicReviews />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forum/ders/:courseCode"
            element={
              <ProtectedRoute requireAdmin={false}>
                <CourseDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forum/hoca/:instructorId"
            element={
              <ProtectedRoute requireAdmin={false}>
                <InstructorDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forum/kulupler"
            element={
              <ProtectedRoute requireAdmin={false}>
                <ClubReviews />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forum/kulupler/:clubId"
            element={
              <ProtectedRoute requireAdmin={false}>
                <ClubDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forum/topluluk"
            element={
              <ProtectedRoute requireAdmin={false}>
                <Community />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forum/topluluk/:id"
            element={
              <ProtectedRoute requireAdmin={false}>
                <ThreadDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/yonetim"
            element={
              <ProtectedRoute requireAdmin={false}>
                <ManagerPanel />
              </ProtectedRoute>
            }
          />


          {/* --- GRUP C: SADECE ADMIN (Admin Only) --- */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
};

export default App;
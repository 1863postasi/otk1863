import React from 'react';
import * as router from 'react-router-dom';
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
import ProtectedRoute from './components/Auth/ProtectedRoute';
import RequireProfileSetup from './components/Auth/RequireProfileSetup'; // Onboarding Modal

const { Routes, Route, useLocation } = router;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  // Hide header on all admin/manager pages and auth pages
  const hideHeader = location.pathname.startsWith('/admin') || location.pathname.startsWith('/auth') || location.pathname.startsWith('/yonetim');

  return (
    <div className="flex flex-col min-h-screen text-stone-900 font-sans selection:bg-boun-blue/20 relative">
      {/* GLOBAL OVERLAY FOR ONBOARDING */}
      <RequireProfileSetup />

      {!hideHeader && <Header />}
      <main className="flex-grow">
        {children}
      </main>
      {!hideHeader && (
        <footer className="bg-stone-900 text-stone-400 py-8 text-center text-sm font-serif border-t border-stone-800">
          <p>© {new Date().getFullYear()} Boğaziçi Üniversitesi Öğrenci Temsilciliği Kurulu. Tüm hakları saklıdır.</p>
          <p className="mt-2 opacity-50 text-xs">Bağımsız Öğrenci Platformu</p>
        </footer>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Layout>
      <Routes>
        {/* --- GRUP A: HERKESE AÇIK (Public) --- */}
        <Route path="/" element={<Home />} />
        <Route path="/otk" element={<OTK />} />
        
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
    </Layout>
  );
};

export default App;
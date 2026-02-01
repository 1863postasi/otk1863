import React, { useEffect } from 'react';
import * as router from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2, ShieldAlert } from 'lucide-react';

const { Navigate } = router;

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { currentUser, userProfile, loading, logout } = useAuth();

  // Effect to handle logout for unverified users safely
  useEffect(() => {
    if (!loading && currentUser && !currentUser.emailVerified) {
      logout();
    }
  }, [currentUser, loading, logout]);

  // 1. Loading State (Spinner matches app aesthetic)
  if (loading) {
    return (
      <div className="min-h-screen bg-[#efede6] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-stone-600 animate-spin mb-4" />
        <p className="text-stone-500 font-serif text-sm tracking-widest uppercase">Güvenlik Kontrolü...</p>
      </div>
    );
  }

  // 2. Not Logged In (Redirect to Login)
  if (!currentUser) {
    return <Navigate to="/auth/login" replace />;
  }

  // 3. Email Not Verified (Redirect to Login - Logout handled in useEffect)
  if (!currentUser.emailVerified) {
    return <Navigate to="/auth/login" replace />;
  }

  // 4. Admin Check (If required)
  if (requireAdmin) {
    // If role is not admin, redirect to Home (Unauthorized)
    if (userProfile?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }
  }

  // 5. Authorized State (Render Content)
  return <>{children}</>;
};

export default ProtectedRoute;
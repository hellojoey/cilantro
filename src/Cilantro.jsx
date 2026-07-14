import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useCilantro } from './context/CilantroContext';
import { isSupabaseConfigured } from './lib/supabase';

// Views
import Home from './components/Home';
import Profile from './components/Profile';
import Gardens from './components/Gardens';
import GardenDetail from './components/GardenDetail';
import Daily30 from './components/Daily30';
import Insights from './components/Insights';
import Welcome from './components/Welcome';
import Login from './components/Login';
import Signup from './components/Signup';

// Auth guard: redirects to /welcome if not logged in
function ProtectedRoute({ children }) {
  const { isLoggedIn } = useCilantro();
  return isLoggedIn ? children : <Navigate to="/welcome" replace />;
}

// Guest guard: redirects to / if already logged in
function GuestRoute({ children }) {
  const { isLoggedIn } = useCilantro();
  return !isLoggedIn ? children : <Navigate to="/" replace />;
}

// Full-screen notice shown when Supabase env keys are missing.
function NotConfigured() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50 dark:from-stone-900 dark:to-stone-800 flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-sm">
        <h1 className="text-4xl font-light tracking-wide text-stone-600 dark:text-stone-300 mb-3">cilantro</h1>
        <p className="text-stone-500 dark:text-stone-400 font-light mb-2">
          Cilantro needs its backend keys.
        </p>
        <p className="text-sm text-stone-400 dark:text-stone-500 font-light">
          Add <code className="text-stone-500 dark:text-stone-300">VITE_SUPABASE_URL</code> and{' '}
          <code className="text-stone-500 dark:text-stone-300">VITE_SUPABASE_ANON_KEY</code> to your
          environment — see <code className="text-stone-500 dark:text-stone-300">.env.example</code>.
        </p>
      </div>
    </div>
  );
}

// Minimal centered loading state shown while the session is restored.
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50 dark:from-stone-900 dark:to-stone-800 flex flex-col items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-4xl font-light tracking-wide text-stone-400 dark:text-stone-500 mb-4 animate-pulse">
          cilantro
        </h1>
        <p className="text-sm text-stone-300 dark:text-stone-600 font-light">loading…</p>
      </div>
    </div>
  );
}

export default function Cilantro() {
  const { authLoading } = useCilantro();

  if (!isSupabaseConfigured) return <NotConfigured />;
  if (authLoading) return <LoadingScreen />;

  return (
    <Routes>
      {/* Guest routes (auth screens) */}
      <Route path="/welcome" element={<GuestRoute><Welcome /></GuestRoute>} />
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />

      {/* Protected routes (app screens) */}
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/gardens" element={<ProtectedRoute><Gardens /></ProtectedRoute>} />
      <Route path="/gardens/:gardenId" element={<ProtectedRoute><GardenDetail /></ProtectedRoute>} />
      <Route path="/daily30" element={<ProtectedRoute><Daily30 /></ProtectedRoute>} />
      <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

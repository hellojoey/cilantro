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
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-sm bg-card border-2 border-ink rounded-chunk shadow-chunk retint p-7">
        <h1 className="text-4xl font-rounded font-bold tracking-tight text-deep mb-3 retint">cilantro</h1>
        <p className="text-ink mb-2 retint">
          Cilantro needs its backend keys.
        </p>
        <p className="text-sm text-sub retint">
          Add <code className="text-ink">VITE_SUPABASE_URL</code> and{' '}
          <code className="text-ink">VITE_SUPABASE_ANON_KEY</code> to your
          environment — see <code className="text-ink">.env.example</code>.
        </p>
      </div>
    </div>
  );
}

// Minimal centered loading state shown while the session is restored.
function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-4xl font-rounded font-bold tracking-tight text-deep mb-4 animate-pulse retint">
          cilantro
        </h1>
        <p className="text-sm text-sub retint">loading…</p>
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

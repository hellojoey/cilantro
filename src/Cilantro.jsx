import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useCilantro } from './context/CilantroContext';

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

export default function Cilantro() {
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

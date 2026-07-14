import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCilantro } from '../context/CilantroContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useCilantro();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setSubmitting(true);
    const { error: authError } = await login(email.trim(), password);
    if (authError) {
      setError(authError);
      setSubmitting(false);
      return;
    }
    // On success, the auth listener flips isLoggedIn and the guest guard
    // redirects away from /login automatically.
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50 dark:from-stone-900 dark:to-stone-800 flex flex-col px-6 pt-12">
      <div className="max-w-sm w-full mx-auto">
        <button
          onClick={() => navigate('/welcome')}
          className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors text-sm mb-8"
          aria-label="Go back to welcome screen"
        >
          ← back
        </button>

        <h2 className="text-3xl font-light text-stone-600 dark:text-stone-200 mb-2">welcome back</h2>
        <p className="text-stone-400 dark:text-stone-500 font-light mb-8">continue your reflections</p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && (
            <div className="text-sm text-rose-500 bg-rose-50 dark:bg-rose-900/30 rounded-xl px-4 py-3 font-light" role="alert">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="login-email" className="sr-only">Email</label>
            <input
              id="login-email"
              type="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full py-4 px-4 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 rounded-2xl text-stone-600 dark:text-stone-200 placeholder-stone-300 dark:placeholder-stone-500 focus:outline-none focus:border-stone-400 dark:focus:border-stone-500 focus:ring-1 focus:ring-stone-300 dark:focus:ring-stone-600 font-light"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label htmlFor="login-password" className="sr-only">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-4 px-4 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 rounded-2xl text-stone-600 dark:text-stone-200 placeholder-stone-300 dark:placeholder-stone-500 focus:outline-none focus:border-stone-400 dark:focus:border-stone-500 focus:ring-1 focus:ring-stone-300 dark:focus:ring-stone-600 font-light"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-stone-700 hover:bg-stone-800 dark:bg-stone-600 dark:hover:bg-stone-500 text-white rounded-2xl font-light text-lg transition-all shadow-sm mt-6 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'signing in…' : 'sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-400 dark:text-stone-500 font-light">
          don't have an account?{' '}
          <button
            onClick={() => navigate('/signup')}
            className="text-stone-600 dark:text-stone-300 hover:text-stone-800 dark:hover:text-stone-100 underline"
          >
            sign up
          </button>
        </p>
      </div>
    </div>
  );
}

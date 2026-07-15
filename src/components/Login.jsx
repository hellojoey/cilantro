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
    <div className="min-h-screen bg-canvas retint flex flex-col px-6 pt-12">
      <div className="max-w-sm w-full mx-auto">
        <button
          onClick={() => navigate('/welcome')}
          className="text-sub text-xs font-rounded font-semibold opacity-55 hover:opacity-100 retint mb-8"
          aria-label="Go back to welcome screen"
        >
          ← back
        </button>

        <h2 className="text-3xl font-rounded font-bold text-deep retint mb-2">welcome back</h2>
        <p className="text-sub retint mb-8">continue your reflections</p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && (
            <div className="text-sm text-ink bg-negate rounded-xl px-4 py-3 retint" role="alert">
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
              className="w-full py-4 px-4 bg-card border-2 border-ink rounded-2xl text-ink placeholder-sub/60 focus:border-deep retint"
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
              className="w-full py-4 px-4 bg-card border-2 border-ink rounded-2xl text-ink placeholder-sub/60 focus:border-deep retint"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-deep text-canvas rounded-[18px] font-rounded font-semibold text-lg shadow-ledge retint transition-all hover:translate-y-[2px] hover:shadow-ledge-sm mt-6 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'signing in…' : 'sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-sub retint">
          don't have an account?{' '}
          <button
            onClick={() => navigate('/signup')}
            className="text-deep font-rounded font-semibold hover:opacity-75 underline retint"
          >
            sign up
          </button>
        </p>
      </div>
    </div>
  );
}

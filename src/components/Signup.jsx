import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCilantro } from '../context/CilantroContext';

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useCilantro();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!firstName.trim()) {
      setError('Please enter your first name');
      return;
    }
    if (!username.trim()) {
      setError('Please choose a username');
      return;
    }
    if (!password.trim() || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    const { error: authError, needsConfirmation } = await signup({
      email: email.trim(),
      password,
      firstName: firstName.trim(),
      username: username.trim(),
    });
    if (authError) {
      setError(authError);
      setSubmitting(false);
      return;
    }
    if (needsConfirmation) {
      setInfo('Check your email to confirm your account, then sign in.');
      setSubmitting(false);
      return;
    }
    // On success the auth listener flips isLoggedIn and the guest guard
    // redirects away from /signup automatically.
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

        <h2 className="text-3xl font-rounded font-bold text-deep retint mb-2">create account</h2>
        <p className="text-sub retint mb-8">start your journey of reflection</p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && (
            <div className="text-sm text-ink bg-negate rounded-xl px-4 py-3 retint" role="alert">
              {error}
            </div>
          )}
          {info && (
            <div className="text-sm text-deep bg-soft rounded-xl px-4 py-3 retint" role="status">
              {info}
            </div>
          )}

          <div>
            <label htmlFor="signup-email" className="sr-only">Email</label>
            <input
              id="signup-email"
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
            <label htmlFor="signup-firstname" className="sr-only">First name</label>
            <input
              id="signup-firstname"
              type="text"
              placeholder="first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full py-4 px-4 bg-card border-2 border-ink rounded-2xl text-ink placeholder-sub/60 focus:border-deep retint"
              autoComplete="given-name"
              required
            />
          </div>
          <div>
            <label htmlFor="signup-username" className="sr-only">Username</label>
            <input
              id="signup-username"
              type="text"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full py-4 px-4 bg-card border-2 border-ink rounded-2xl text-ink placeholder-sub/60 focus:border-deep retint"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label htmlFor="signup-password" className="sr-only">Password</label>
            <input
              id="signup-password"
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-4 px-4 bg-card border-2 border-ink rounded-2xl text-ink placeholder-sub/60 focus:border-deep retint"
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-deep text-canvas rounded-[18px] font-rounded font-semibold text-lg shadow-ledge retint transition-all hover:translate-y-[2px] hover:shadow-ledge-sm mt-6 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'creating account…' : 'create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-sub retint">
          already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-deep font-rounded font-semibold hover:opacity-75 underline retint"
          >
            sign in
          </button>
        </p>
      </div>
    </div>
  );
}

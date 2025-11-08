import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

export default function RegisterPage() {
  const { register, loading } = useAuthContext();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await register(name, email, password);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Registration failed. Please try again.');
      } else {
        setError('Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-surface px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-semibold text-brand-primary">Create an account</h1>
        <p className="mt-2 text-sm text-brand-secondary">
          Start visualizing your finances in a smarter way.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-brand-primary" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2 text-brand-primary focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-brand-primary" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2 text-brand-primary focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-brand-primary" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2 text-brand-primary focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
              placeholder="At least 8 characters"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-accent px-4 py-2 font-semibold text-white transition hover:bg-brand-accent/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-brand-secondary">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

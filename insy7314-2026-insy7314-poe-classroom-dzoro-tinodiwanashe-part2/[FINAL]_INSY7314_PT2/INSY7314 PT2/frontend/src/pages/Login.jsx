import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

export default function Login({ onSwitchToRegister }) {
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  //Helper to keep form inputs updated
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(formData.email, formData.password);
    } catch (err) {
      const data = err.response?.data;
      const validationMessages = Array.isArray(data?.errors)
        ? data.errors.map((e) => e.message).filter(Boolean)
        : [];
      const serverMessage = validationMessages.length
        ? validationMessages.join(' • ')
        : data?.message || 'Unable to sign in. Please check your credentials.';
      setError(serverMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full border-2 border-stone-900 bg-[#f7f5f0] p-8">
      <div className="mb-6">
        {/* Logo */}
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center overflow-hidden border-2 border-stone-900 bg-stone-900">
          <img
            src="/hustlehub-logo.jpeg"
            alt="HustleHub+"
            className="h-full w-full object-cover"
          />
        </div>

        <h2 className="font-serif text-3xl leading-tight text-stone-900">
          Welcome back
        </h2>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-stone-500">
          Sign in to manage your gigs
        </p>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-3 border-l-2 border-orange-700 bg-orange-50 py-2.5 pl-3 pr-2 text-sm text-orange-900">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-stone-600">
            Email
          </label>
          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full border-2 border-stone-900 bg-white py-2.5 pl-10 pr-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-700"
              placeholder="developer@hustlehub.com"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-stone-600">
            Password
          </label>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full border-2 border-stone-900 bg-white py-2.5 pl-10 pr-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-700"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 flex w-full items-center justify-center gap-2 border-2 border-stone-900 bg-stone-900 py-2.5 font-mono text-xs uppercase tracking-widest text-white transition hover:border-orange-700 hover:bg-orange-700 disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Signing in</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>
      </form>

      <div className="mt-6 border-t-2 border-stone-900 pt-4 text-center font-mono text-[10px] uppercase tracking-widest text-stone-500">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-orange-700 transition hover:underline hover:underline-offset-4"
        >
          Create one
        </button>
      </div>
    </div>
  );
}
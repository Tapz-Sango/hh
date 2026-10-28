import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Briefcase, AlertCircle, Loader2 } from 'lucide-react';

export default function Register({ onSwitchToLogin }) {
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'client'
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      await register(formData);
    } catch (err) {
      const data = err.response?.data;
      const validationMessages = Array.isArray(data?.errors)
        ? data.errors.map((e) => e.message).filter(Boolean)
        : [];
      const serverMessage = validationMessages.length
        ? validationMessages.join(' • ')
        : data?.message || 'Registration failed. Please check your inputs.';
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
          Join HustleHub+
        </h2>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-stone-500">
          Hire experts or sell services
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
            Full Name
          </label>
          <div className="relative">
            <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full border-2 border-stone-900 bg-white py-2.5 pl-10 pr-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-700"
              placeholder="Samson George"
            />
          </div>
        </div>

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
              placeholder="samson@example.com"
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

        <div>
          <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-stone-600">
            I want to
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, role: 'client' }))}
              className={`flex items-center justify-center gap-2 border-2 px-3 py-2.5 font-mono text-[10px] uppercase tracking-widest transition ${
                formData.role === 'client'
                  ? 'border-stone-900 bg-stone-900 text-white'
                  : 'border-stone-300 bg-white text-stone-500 hover:border-stone-900 hover:text-stone-900'
              }`}
            >
              <User size={13} />
              <span>Hire Services</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, role: 'freelancer' }))}
              className={`flex items-center justify-center gap-2 border-2 px-3 py-2.5 font-mono text-[10px] uppercase tracking-widest transition ${
                formData.role === 'freelancer'
                  ? 'border-stone-900 bg-stone-900 text-white'
                  : 'border-stone-300 bg-white text-stone-500 hover:border-stone-900 hover:text-stone-900'
              }`}
            >
              <Briefcase size={13} />
              <span>Offer Gigs</span>
            </button>
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
              <span>Creating</span>
            </>
          ) : (
            <span>Create Account</span>
          )}
        </button>
      </form>

      <div className="mt-6 border-t-2 border-stone-900 pt-4 text-center font-mono text-[10px] uppercase tracking-widest text-stone-500">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-orange-700 transition hover:underline hover:underline-offset-4"
        >
          Sign in
        </button>
      </div>
    </div>
  );
}
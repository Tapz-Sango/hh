import React from 'react';
import {
  Sparkles,
  LogOut,
  PlusCircle,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({
  onOpenAuth,
  onOpenCreateModal,
  currentTab,
  setCurrentTab
}) => {
  const { user, logout } = useAuth();

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b-2 border-stone-900 bg-[#f7f5f0]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
  type="button"
  onClick={() => setCurrentTab('marketplace')}
  className="flex items-center gap-2.5 focus:outline-none"
  aria-label="Go to HustleHub marketplace"
>
  <img
    src="/hustlehub-logo.jpeg"
    alt=""
    aria-hidden="true"
    className="h-9 w-9 object-cover"
  />

  <span className="font-serif text-2xl leading-none tracking-tight text-stone-900">
    HustleHub<span className="text-orange-700">+</span>
  </span>
</button>

        {user ? (
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Desktop tabs */}
            <div className="hidden items-center md:flex">
              {/* Marketplace */}
              <button
                type="button"
                onClick={() => handleTabChange('marketplace')}
                className={`flex items-center gap-2 px-3 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${
                  currentTab === 'marketplace'
                    ? 'text-stone-900'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <span
                  className={`inline-block h-1.5 w-1.5 rounded-full ${
                    currentTab === 'marketplace'
                      ? 'bg-orange-700'
                      : 'bg-transparent'
                  }`}
                />
                Marketplace
              </button>

              {/* My Orders */}
              <button
                type="button"
                onClick={() => handleTabChange('orders')}
                className={`flex items-center gap-2 px-3 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${
                  currentTab === 'orders'
                    ? 'text-stone-900'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <span
                  className={`inline-block h-1.5 w-1.5 rounded-full ${
                    currentTab === 'orders'
                      ? 'bg-orange-700'
                      : 'bg-transparent'
                  }`}
                />
                My Orders
              </button>

              {/* Earnings — freelancer only */}
              {user.role === 'freelancer' && (
                <button
                  type="button"
                  onClick={() => handleTabChange('earnings')}
                  className={`flex items-center gap-2 px-3 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${
                    currentTab === 'earnings'
                      ? 'text-stone-900'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  <span
                    className={`inline-block h-1.5 w-1.5 rounded-full ${
                      currentTab === 'earnings'
                        ? 'bg-orange-700'
                        : 'bg-transparent'
                    }`}
                  />
                  Earnings
                </button>
              )}
            </div>

            {/* Post Gig button — freelancer only */}
            {user.role === 'freelancer' && (
              <button
                type="button"
                onClick={onOpenCreateModal}
                className="ml-2 inline-flex items-center gap-2 rounded-none bg-stone-900 px-3 py-2 font-mono text-xs uppercase tracking-widest text-white transition hover:bg-orange-700 sm:px-4"
              >
                <PlusCircle size={14} />
                <span className="hidden sm:inline">Post Gig</span>
                <span className="sm:hidden">Post</span>
              </button>
            )}

            {/* User info */}
            <div className="ml-3 hidden items-center gap-3 border-l-2 border-stone-300 pl-4 lg:flex">
              <div className="text-right">
                <p className="text-sm font-semibold leading-tight text-stone-900">
                  {user.name || user.email}
                </p>
                {user.name && (
                  <p className="font-mono text-[10px] uppercase tracking-widest text-stone-500">
                    {user.role}
                  </p>
                )}
              </div>
            </div>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              title="Sign out"
              aria-label="Sign out"
              className="ml-2 flex h-9 w-9 items-center justify-center text-stone-500 transition hover:text-orange-700"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="px-3 py-2 font-mono text-xs uppercase tracking-widest text-stone-600 transition hover:text-stone-900 sm:px-4"
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => onOpenAuth('register')}
              className="inline-flex items-center rounded-none bg-orange-700 px-3 py-2 font-mono text-xs uppercase tracking-widest text-white transition hover:bg-stone-900 sm:px-4"
            >
              Get Started
            </button>
          </div>
        )}
      </div>

      {/* Mobile tabs bar */}
      {user && (
        <div className="border-t border-stone-300 bg-[#f7f5f0] md:hidden">
          <div className="mx-auto flex max-w-7xl px-4 sm:px-6">
            <button
              type="button"
              onClick={() => handleTabChange('marketplace')}
              className={`flex flex-1 items-center justify-center gap-2 py-3 font-mono text-xs uppercase tracking-widest ${
                currentTab === 'marketplace'
                  ? 'border-b-2 border-orange-700 text-stone-900'
                  : 'border-b-2 border-transparent text-stone-500'
              }`}
            >
              <Sparkles size={14} />
              Marketplace
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('orders')}
              className={`flex flex-1 items-center justify-center gap-2 py-3 font-mono text-xs uppercase tracking-widest ${
                currentTab === 'orders'
                  ? 'border-b-2 border-orange-700 text-stone-900'
                  : 'border-b-2 border-transparent text-stone-500'
              }`}
            >
              <Calendar size={14} />
              My Orders
            </button>

            {/* Mobile earnings tab — freelancer only */}
            {user.role === 'freelancer' && (
              <button
                type="button"
                onClick={() => handleTabChange('earnings')}
                className={`flex flex-1 items-center justify-center gap-2 py-3 font-mono text-xs uppercase tracking-widest ${
                  currentTab === 'earnings'
                    ? 'border-b-2 border-orange-700 text-stone-900'
                    : 'border-b-2 border-transparent text-stone-500'
                }`}
              >
                <TrendingUp size={14} />
                Earnings
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
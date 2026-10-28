import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import GigGrid from './components/GigGrid';
import CreateGigModal from './components/CreateGigModal';
import MyBookings from './components/MyBookings';
import EarningsDashboard from './components/EarningsDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

function AuthModal({ mode, onClose, onSwitch }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-stone-950/70 p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="relative my-auto w-full max-w-md"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute -top-10 right-0 flex h-9 w-9 items-center justify-center text-[#f7f5f0] transition hover:text-orange-400"
        >
          <X size={20} />
        </button>

        {mode === 'login' ? (
          <Login onSwitchToRegister={() => onSwitch('register')} />
        ) : (
          <Register onSwitchToLogin={() => onSwitch('login')} />
        )}
      </div>
    </div>
  );
}

function MainApp() {
  const { user } = useAuth();

  const [currentTab, setCurrentTab] = useState('marketplace');
  const [authMode, setAuthMode] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingGig, setEditingGig] = useState(null);
  const [gigRefreshKey, setGigRefreshKey] = useState(0);

  // Close the auth modal once the user is signed in
  useEffect(() => {
    if (user && authMode) setAuthMode(null);
  }, [user, authMode]);

  // If a signed-out user tries to open My Orders, prompt them to sign in
  useEffect(() => {
    if (!user && currentTab === 'orders') {
      setCurrentTab('marketplace');
      setAuthMode('login');
    }
  }, [user, currentTab]);

  // If a signed-out user or a non-freelancer somehow lands on Earnings, kick them back to the marketplace
  useEffect(() => {
    if (currentTab === 'earnings' && (!user || user.role !== 'freelancer')) {
      setCurrentTab('marketplace');
    }
  }, [user, currentTab]);

  const handleGigSaved = () => {
    setGigRefreshKey((k) => k + 1);
    setEditingGig(null);
  };

  const handleEditGig = (gig) => {
    setEditingGig(gig);
    setIsCreateOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingGig(null);
    setIsCreateOpen(true);
  };

  const handleCloseCreate = () => {
    setIsCreateOpen(false);
    setEditingGig(null);
  };

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-stone-900">
      <Navbar
        onOpenAuth={(mode) => setAuthMode(mode)}
        onOpenCreateModal={handleOpenCreate}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {currentTab === 'marketplace' && (
          <GigGrid
            key={gigRefreshKey}
            user={user}
            onEditGig={handleEditGig}
          />
        )}

        {currentTab === 'orders' && <MyBookings />}

        {currentTab === 'earnings' && user?.role === 'freelancer' && (
          <EarningsDashboard />
        )}
      </main>

      <CreateGigModal
        isOpen={isCreateOpen}
        onClose={handleCloseCreate}
        onGigSaved={handleGigSaved}
        editingGig={editingGig}
      />

      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onSwitch={(mode) => setAuthMode(mode)}
        />
      )}
    </div>
  );
}

function App() {
  return <MainApp />;
}

export default App;
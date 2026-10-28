import React, { useCallback, useEffect, useMemo, useState } from 'react';
import API from '../api/axios';
import GigCard from './GigCard';
import { Loader2, Search, SlidersHorizontal } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Development',
  'Design',
  'Marketing',
  'Writing',
];

const GigGrid = ({ user, onEditGig }) => {
  const [gigs, setGigs] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  //Get the latest services from the API
  const fetchGigs = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await API.get('/services');

      const services = Array.isArray(response.data)
        ? response.data
        : response.data?.services || response.data?.data || [];

      setGigs(services);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Unable to load gigs. Please try again.';

      setError(message);
      setGigs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  //Load services when the marketplace opens
  useEffect(() => {
    fetchGigs();
  }, [fetchGigs]);

  //Apply the search and category filters locally
  const filteredGigs = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return gigs.filter((gig) => {
      const matchesCategory =
        category === 'All' ||
        String(gig.category || '').toLowerCase() === category.toLowerCase();

      if (!matchesCategory) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableText = [
        gig.title,
        gig.description,
        gig.category,
        gig.freelancerId?.name,
        gig.freelancerId?.email,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [gigs, search, category]);

  //Remove a deleted gig from the current list
  const handleDeleteSuccess = useCallback((deletedGigId) => {
    setGigs((currentGigs) =>
      currentGigs.filter((gig) => gig._id !== deletedGigId),
    );
  }, []);

  //Leave booking notifications to the parent when needed
  const handleBookingSuccess = useCallback(() => {}, []);

  return (
    <section className="w-full">
      <div className="mb-10 border-2 border-stone-900 bg-white">
        <div className="flex flex-col lg:flex-row lg:items-stretch">
          <div className="relative flex-1 border-b-2 border-stone-900 lg:border-b-0 lg:border-r-2">
            <Search
              size={16}
              className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-stone-500"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search gigs, skills, or services..."
              aria-label="Search gigs"
              className="w-full bg-transparent py-5 pl-12 pr-5 font-mono text-sm tracking-wide text-stone-900 outline-none placeholder:text-stone-400"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto px-3 py-2 lg:px-4">
            <SlidersHorizontal
              size={14}
              className="mr-2 shrink-0 text-stone-400"
            />

            {CATEGORIES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`shrink-0 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest transition-colors ${
                  category === item
                    ? 'text-orange-700 underline decoration-2 underline-offset-4'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex min-h-72 flex-col items-center justify-center border-2 border-dashed border-stone-300 bg-transparent">
          <Loader2 size={24} className="animate-spin text-orange-700" />
          <p className="mt-3 font-mono text-xs uppercase tracking-widest text-stone-500">
            Loading gigs
          </p>
        </div>
      )}

      {!isLoading && error && (
        <div className="flex min-h-60 flex-col items-center justify-center border-2 border-orange-700 bg-orange-50 px-6 text-center">
          <p className="font-serif text-2xl text-stone-900">{error}</p>

          <button
            type="button"
            onClick={fetchGigs}
            className="mt-6 border-2 border-stone-900 bg-stone-900 px-5 py-2 font-mono text-xs uppercase tracking-widest text-white transition hover:border-orange-700 hover:bg-orange-700"
          >
            Try Again
          </button>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {filteredGigs.length > 0 ? (
            <>
              <div className="mb-6 flex items-center justify-between border-b-2 border-stone-900 pb-3">
                <p className="font-mono text-xs uppercase tracking-widest text-stone-600">
                  <span className="text-stone-900">
                    {filteredGigs.length}
                  </span>{' '}
                  {filteredGigs.length === 1 ? 'service' : 'services'} found
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredGigs.map((gig) => (
                  <GigCard
                    key={gig._id}
                    gig={gig}
                    user={user}
                    onBookingSuccess={handleBookingSuccess}
                    onEditGig={onEditGig}
                    onDeleteSuccess={handleDeleteSuccess}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center border-2 border-dashed border-stone-300 bg-white px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center border-2 border-stone-900 text-stone-900">
                <Search size={20} />
              </div>

              <h3 className="mt-5 font-serif text-2xl text-stone-900">
                No gigs found
              </h3>

              <p className="mt-2 max-w-md text-sm text-stone-600">
                {search || category !== 'All'
                  ? 'Try changing your search or category filter.'
                  : 'There are no services available yet. Check back soon.'}
              </p>

              {(search || category !== 'All') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setCategory('All');
                  }}
                  className="mt-6 border-2 border-stone-900 bg-stone-900 px-5 py-2 font-mono text-xs uppercase tracking-widest text-white transition hover:border-orange-700 hover:bg-orange-700"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default GigGrid;
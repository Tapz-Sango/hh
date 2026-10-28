import React, { useState } from 'react';
import API from '../api/axios';
import BookingModal from './BookingModal';
import {
  Tag,
  CheckCircle2,
  Loader2,
  Edit3,
  Trash2,
  AlertCircle,
} from 'lucide-react';

const GigCard = ({
  gig,
  user,
  onBookingSuccess,
  onEditGig,
  onDeleteSuccess,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);

  if (!gig) {
    return null;
  }

  const freelancerId = gig.freelancerId;

  const isOwner =
    user &&
    (user.id === freelancerId?._id ||
      user._id === freelancerId?._id ||
      user.id === freelancerId ||
      user._id === freelancerId);

  const title = gig.title || 'Untitled Service';
  const category = gig.category || 'Other';
  const description = gig.description || 'No description provided.';
  const price = Number(gig.price) || 0;

  const freelancerName =
    typeof freelancerId === 'object'
      ? freelancerId.name || freelancerId.email
      : null;

  const handleBookClick = () => {
    if (!user) {
      setError('Please sign in to book a service.');
      return;
    }
    setError('');
    setIsBookingModalOpen(true);
  };

  const handleBookingSuccess = (booking, bookedGig) => {
    setBookingComplete(true);
    if (onBookingSuccess) {
      onBookingSuccess(booking, bookedGig);
    }
  };

  const handleDelete = async () => {
    if (!gig._id || isDeleting) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    setError('');
    setIsDeleting(true);

    try {
      await API.delete(`/services/${gig._id}`);
      if (onDeleteSuccess) onDeleteSuccess(gig._id);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Unable to delete this gig. Please try again.';
      setError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    if (onEditGig) onEditGig(gig);
  };

  return (
    <>
      <article className="group flex h-full flex-col border-2 border-stone-900 bg-white transition-colors hover:border-orange-700">
        <div className="flex items-start justify-between gap-3 border-b-2 border-stone-900 px-5 pb-4 pt-5">
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-orange-700">
            <Tag size={11} />
            {category}
          </span>

          {isOwner && (
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={handleEdit}
                title="Edit gig"
                disabled={isDeleting}
                className="flex h-7 w-7 items-center justify-center border border-stone-300 text-stone-500 transition hover:border-stone-900 hover:text-stone-900 disabled:opacity-50"
              >
                <Edit3 size={13} />
              </button>

              <button
                type="button"
                onClick={handleDelete}
                title="Delete gig"
                disabled={isDeleting}
                className="flex h-7 w-7 items-center justify-center border border-stone-300 text-stone-500 transition hover:border-orange-700 hover:text-orange-700 disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Trash2 size={13} />
                )}
              </button>
            </div>
          )}
        </div>

        <div className="px-5 pt-5">
          <h3 className="font-serif text-2xl leading-tight text-stone-900">
            {title}
          </h3>

          {freelancerName && !isOwner && (
            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-stone-500">
              By {freelancerName}
            </p>
          )}
        </div>

        <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
          <p className="line-clamp-4 flex-1 text-sm leading-6 text-stone-600">
            {description}
          </p>

          {error && (
            <div className="mt-4 flex items-start gap-2 border-l-2 border-orange-700 bg-orange-50 py-2 pl-3 pr-2 text-xs text-orange-900">
              <AlertCircle className="mt-0.5 shrink-0" size={14} />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-5 flex items-end justify-between gap-4 border-t-2 border-stone-900 pt-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-stone-500">
                Starting at
              </p>
              <p className="font-serif text-3xl leading-none text-stone-900">
                ${price.toLocaleString()}
              </p>
            </div>

            {!isOwner && (
              <button
                type="button"
                onClick={handleBookClick}
                disabled={bookingComplete}
                className={`inline-flex min-w-24 items-center justify-center gap-1.5 rounded-none px-4 py-2 font-mono text-xs uppercase tracking-widest transition ${
                  bookingComplete
                    ? 'cursor-default border-2 border-stone-900 bg-white text-stone-900'
                    : 'border-2 border-stone-900 bg-stone-900 text-white hover:border-orange-700 hover:bg-orange-700'
                }`}
              >
                {bookingComplete ? (
                  <>
                    <CheckCircle2 size={13} />
                    Booked
                  </>
                ) : (
                  'Book Now'
                )}
              </button>
            )}

            {isOwner && (
              <span className="inline-flex items-center gap-1.5 border-2 border-stone-900 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-stone-900">
                <CheckCircle2 size={11} />
                Your Gig
              </span>
            )}
          </div>
        </div>
      </article>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        gig={gig}
        onBookingSuccess={handleBookingSuccess}
      />
    </>
  );
};

export default GigCard;
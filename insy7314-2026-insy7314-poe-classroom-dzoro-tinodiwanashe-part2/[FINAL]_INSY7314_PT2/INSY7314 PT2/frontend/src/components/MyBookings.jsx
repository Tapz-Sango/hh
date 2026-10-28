import { useCallback, useEffect, useState } from 'react';
import API from '../api/axios';
import {
  Loader2,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  DollarSign,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STATUS_STYLES = {
  pending: 'border-amber-600 text-amber-700',
  completed: 'border-emerald-700 text-emerald-700',
  cancelled: 'border-orange-700 text-orange-700',
};

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await API.get('/bookings/my-bookings');
      setBookings(response.data?.bookings || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to load bookings. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleStatusChange = async (bookingId, status) => {
    setUpdatingId(bookingId);

    try {
      const response = await API.put(`/bookings/${bookingId}/status`, {
        status,
      });
      const updated = response.data?.booking;
      setBookings((current) =>
        current.map((b) => (b._id === bookingId ? updated : b)),
      );
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to update booking status.',
      );
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center border-2 border-dashed border-stone-300">
        <Loader2 size={24} className="animate-spin text-orange-700" />
        <p className="mt-3 font-mono text-xs uppercase tracking-widest text-stone-500">
          Loading bookings
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-60 flex-col items-center justify-center border-2 border-orange-700 bg-orange-50 px-6 text-center">
        <p className="font-serif text-2xl text-stone-900">{error}</p>
        <button
          type="button"
          onClick={fetchBookings}
          className="mt-6 border-2 border-stone-900 bg-stone-900 px-5 py-2 font-mono text-xs uppercase tracking-widest text-white transition hover:border-orange-700 hover:bg-orange-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const asClient = bookings.filter(
    (b) => b.clientId?._id === user?.id || b.clientId === user?.id,
  );
  const asFreelancer = bookings.filter(
    (b) => b.freelancerId?._id === user?.id || b.freelancerId === user?.id,
  );

  const renderBooking = (booking, mode) => {
    const isClientView = mode === 'client';
    const counterparty = isClientView
      ? booking.freelancerId
      : booking.clientId;
    const service = booking.serviceId;
    const isUpdating = updatingId === booking._id;

    return (
      <div
        key={booking._id}
        className="border-2 border-stone-900 bg-white p-5"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate font-serif text-xl leading-tight text-stone-900">
              {service?.title || 'Service'}
            </h3>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-stone-500">
              {isClientView ? 'Freelancer: ' : 'Client: '}
              {counterparty?.name || counterparty?.email || 'Unknown'}
            </p>
          </div>

          <span
            className={`shrink-0 border-2 bg-transparent px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest ${
              STATUS_STYLES[booking.status] ||
              'border-stone-400 text-stone-600'
            }`}
          >
            {booking.status}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-stone-200 pt-4 text-xs sm:grid-cols-3">
          <div className="flex items-center gap-2 font-mono uppercase tracking-widest text-stone-600">
            <Calendar size={13} className="text-stone-400" />
            {booking.date}
          </div>
          <div className="flex items-center gap-2 font-mono uppercase tracking-widest text-stone-600">
            <Clock size={13} className="text-stone-400" />
            {booking.time}
          </div>
          <div className="flex items-center gap-2 font-serif text-base text-stone-900">
            <DollarSign size={13} className="text-stone-400" />
            {Number(booking.amount || 0).toLocaleString()}
          </div>
        </div>

        {booking.notes && (
          <p className="mt-3 border-l-2 border-stone-300 bg-stone-50 py-2 pl-3 pr-2 text-xs text-stone-600">
            {booking.notes}
          </p>
        )}

        {booking.status === 'pending' && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-stone-200 pt-4">
            {isClientView && (
              <button
                type="button"
                onClick={() => handleStatusChange(booking._id, 'cancelled')}
                disabled={isUpdating}
                className="inline-flex items-center gap-1.5 border-2 border-stone-900 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-stone-900 transition hover:border-orange-700 hover:bg-orange-700 hover:text-white disabled:opacity-50"
              >
                {isUpdating ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  <XCircle size={11} />
                )}
                Cancel
              </button>
            )}

            {!isClientView && (
              <button
                type="button"
                onClick={() => handleStatusChange(booking._id, 'completed')}
                disabled={isUpdating}
                className="inline-flex items-center gap-1.5 border-2 border-stone-900 bg-stone-900 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-white transition hover:border-orange-700 hover:bg-orange-700 disabled:opacity-50"
              >
                {isUpdating ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={11} />
                )}
                Mark Complete
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-12">
      <div>
        <div className="mb-5 flex items-end justify-between border-b-2 border-stone-900 pb-3">
          <h2 className="font-serif text-2xl leading-none text-stone-900">
            My Bookings
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-widest text-stone-500">
            {asClient.length} {asClient.length === 1 ? 'order' : 'orders'}
          </span>
        </div>

        {asClient.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center border-2 border-dashed border-stone-300 bg-white p-6 text-center">
            <AlertCircle size={20} className="text-stone-400" />
            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-stone-500">
              No bookings yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {asClient.map((b) => renderBooking(b, 'client'))}
          </div>
        )}
      </div>

      <div>
        <div className="mb-5 flex items-end justify-between border-b-2 border-stone-900 pb-3">
          <h2 className="font-serif text-2xl leading-none text-stone-900">
            Bookings I've Received
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-widest text-stone-500">
            {asFreelancer.length}{' '}
            {asFreelancer.length === 1 ? 'order' : 'orders'}
          </span>
        </div>

        {asFreelancer.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center border-2 border-dashed border-stone-300 bg-white p-6 text-center">
            <AlertCircle size={20} className="text-stone-400" />
            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-stone-500">
              No bookings received yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {asFreelancer.map((b) => renderBooking(b, 'freelancer'))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
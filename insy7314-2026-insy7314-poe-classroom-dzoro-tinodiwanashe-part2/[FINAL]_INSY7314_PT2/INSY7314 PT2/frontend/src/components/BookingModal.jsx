import { useEffect, useState } from 'react';
import API from '../api/axios';
import {
  X,
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Receipt
} from 'lucide-react';

// Default to tomorrow so the "past date" validator never trips
const getTomorrowISO = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const getCurrentTime = () => {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
};

const BookingModal = ({ isOpen, onClose, gig, onBookingSuccess }) => {
  const [date, setDate] = useState(getTomorrowISO());
  const [time, setTime] = useState(getCurrentTime());
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // NEW: hold the simulated payment reference + amount returned by the API
  const [paymentRef, setPaymentRef] = useState('');
  const [paidAmount, setPaidAmount] = useState(null);

  // Reset state whenever the modal opens for a new gig
  useEffect(() => {
    if (isOpen) {
      setDate(getTomorrowISO());
      setTime(getCurrentTime());
      setNotes('');
      setError('');
      setSuccess(false);
      setPaymentRef('');
      setPaidAmount(null);
    }
  }, [isOpen, gig]);

  if (!isOpen || !gig) {
    return null;
  }

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!date) {
      setError('Please pick a date.');
      return;
    }

    if (!time) {
      setError('Please pick a time.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await API.post('/bookings', {
        serviceId: gig._id,
        date,
        time,
        notes: notes.trim()
      });

      // Pull the transaction details out of the response
      const tx = response.data?.transaction;

      setSuccess(true);
      setPaymentRef(tx?.paymentReference || '');
      setPaidAmount(
        typeof tx?.amount === 'number' ? tx.amount : Number(gig.price) || 0
      );

      if (onBookingSuccess) {
        onBookingSuccess(response.data?.booking, gig);
      }

      // Let the success screen show briefly before closing
      setTimeout(() => {
        onClose();
      }, 2200);
    } catch (err) {
      const data = err.response?.data;
      const validationMessages = Array.isArray(data?.errors)
        ? data.errors.map((e) => e.message).filter(Boolean)
        : [];
      const message = validationMessages.length
        ? validationMessages.join(' • ')
        : data?.message || 'Unable to create booking. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const price = Number(gig.price) || 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-stone-950/70 p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <div
        className="my-auto w-full max-w-lg border-2 border-stone-900 bg-[#f7f5f0]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b-2 border-stone-900 px-6 pb-4 pt-5">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-widest text-orange-700">
              Book this gig
            </p>
            <h2 className="mt-1 truncate font-serif text-2xl leading-tight text-stone-900">
              {gig.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center text-stone-500 transition hover:text-orange-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center border-2 border-stone-900 bg-orange-700 text-white">
              <CheckCircle2 size={24} />
            </div>

            <h3 className="mt-5 font-serif text-2xl text-stone-900">
              Booking confirmed
            </h3>

            <p className="mt-1 text-sm text-stone-600">
              The freelancer will be in touch shortly.
            </p>

            {/* NEW: simulated payment receipt block */}
            {(paymentRef || paidAmount !== null) && (
              <div className="mt-6 w-full max-w-xs border-2 border-stone-900 bg-white">
                <div className="flex items-center gap-2 border-b-2 border-stone-900 px-3 py-2">
                  <Receipt size={13} className="text-orange-700" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-stone-700">
                    Payment Receipt
                  </span>
                </div>

                <div className="space-y-2 px-3 py-3 text-left">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-stone-500">
                      Amount
                    </span>
                    <span className="font-serif text-lg text-stone-900">
                      ${Number(paidAmount || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-stone-500">
                      Reference
                    </span>
                    <span className="font-mono text-[10px] tracking-widest text-stone-900">
                      {paymentRef || '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-stone-500">
                      Status
                    </span>
                    <span className="border border-amber-600 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-amber-700">
                      Pending
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-stone-200 pt-2">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-stone-500">
                      Method
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-stone-500">
                      Simulated
                    </span>
                  </div>
                </div>
              </div>
            )}

            <p className="mt-5 font-mono text-[10px] uppercase tracking-widest text-stone-400">
              Closing in a moment…
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 pb-6 pt-5">
            {error && (
              <div className="mb-5 flex items-start gap-3 border-l-2 border-orange-700 bg-orange-50 py-2.5 pl-3 pr-2 text-sm text-orange-900">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="mb-5 flex items-end justify-between border-b-2 border-stone-900 pb-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-stone-500">
                Total
              </span>
              <span className="font-serif text-3xl leading-none text-stone-900">
                ${price.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="booking-date"
                  className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-stone-600"
                >
                  Date
                </label>
                <div className="relative">
                  <Calendar
                    size={15}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500"
                  />
                  <input
                    id="booking-date"
                    type="date"
                    value={date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDate(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full border-2 border-stone-900 bg-white py-2.5 pl-10 pr-3 text-sm text-stone-900 outline-none transition focus:border-orange-700 disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="booking-time"
                  className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-stone-600"
                >
                  Time
                </label>
                <div className="relative">
                  <Clock
                    size={15}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500"
                  />
                  <input
                    id="booking-time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full border-2 border-stone-900 bg-white py-2.5 pl-10 pr-3 text-sm text-stone-900 outline-none transition focus:border-orange-700 disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5">
              <label
                htmlFor="booking-notes"
                className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-stone-600"
              >
                Notes (optional)
              </label>
              <div className="relative">
                <FileText
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-3.5 text-stone-500"
                />
                <textarea
                  id="booking-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Any details the freelancer should know..."
                  disabled={isSubmitting}
                  className="w-full resize-y border-2 border-stone-900 bg-white py-2.5 pl-10 pr-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-700 disabled:opacity-60"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 border-t-2 border-stone-900 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="border-2 border-stone-300 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-stone-600 transition hover:border-stone-900 hover:text-stone-900 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 border-2 border-stone-900 bg-stone-900 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-white transition hover:border-orange-700 hover:bg-orange-700 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Booking
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
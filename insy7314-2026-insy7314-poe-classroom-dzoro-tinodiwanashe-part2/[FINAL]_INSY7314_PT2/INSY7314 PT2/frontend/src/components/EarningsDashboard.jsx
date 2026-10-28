import { useCallback, useEffect, useState } from 'react';
import API from '../api/axios';
import {
  Loader2,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Receipt
} from 'lucide-react';

const STATUS_STYLES = {
  completed: 'border-emerald-700 text-emerald-700',
  pending: 'border-amber-600 text-amber-700',
  refunded: 'border-orange-700 text-orange-700'
};

const EarningsDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEarnings = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const [summaryRes, txRes] = await Promise.all([
        API.get('/earnings/summary'),
        API.get('/earnings/transactions')
      ]);

      setSummary(summaryRes.data?.summary || null);
      setTransactions(txRes.data?.transactions || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to load earnings. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  if (isLoading) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center border-2 border-dashed border-stone-300">
        <Loader2 size={24} className="animate-spin text-orange-700" />
        <p className="mt-3 font-mono text-xs uppercase tracking-widest text-stone-500">
          Loading earnings
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
          onClick={fetchEarnings}
          className="mt-6 border-2 border-stone-900 bg-stone-900 px-5 py-2 font-mono text-xs uppercase tracking-widest text-white transition hover:border-orange-700 hover:bg-orange-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="border-2 border-stone-900 bg-white p-5">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-stone-500">
            <TrendingUp size={12} className="text-emerald-700" />
            Total Earned
          </div>
          <p className="mt-2 font-serif text-4xl leading-none text-stone-900">
            ${(summary?.totalEarned || 0).toLocaleString()}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-stone-400">
            {summary?.completedCount || 0} completed
          </p>
        </div>

        <div className="border-2 border-stone-900 bg-white p-5">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-stone-500">
            <Clock size={12} className="text-amber-600" />
            Pending Income
          </div>
          <p className="mt-2 font-serif text-4xl leading-none text-stone-900">
            ${(summary?.pendingIncome || 0).toLocaleString()}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-stone-400">
            {summary?.pendingCount || 0} pending
          </p>
        </div>

        <div className="border-2 border-stone-900 bg-white p-5">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-stone-500">
            <Receipt size={12} className="text-orange-700" />
            Refunded
          </div>
          <p className="mt-2 font-serif text-4xl leading-none text-stone-900">
            ${(summary?.refunded || 0).toLocaleString()}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-stone-400">
            {summary?.refundedCount || 0} refunded
          </p>
        </div>
      </div>

      {/* Transaction history */}
      <div>
        <div className="mb-5 flex items-end justify-between border-b-2 border-stone-900 pb-3">
          <h2 className="font-serif text-2xl leading-none text-stone-900">
            Income History
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-widest text-stone-500">
            {transactions.length}{' '}
            {transactions.length === 1 ? 'transaction' : 'transactions'}
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center border-2 border-dashed border-stone-300 bg-white p-6 text-center">
            <AlertCircle size={20} className="text-stone-400" />
            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-stone-500">
              No transactions yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx._id}
                className="border-2 border-stone-900 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="truncate font-serif text-lg leading-tight text-stone-900">
                      {tx.serviceId?.title || 'Service'}
                    </h3>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-stone-500">
                      From: {tx.clientId?.name || tx.clientId?.email || 'Client'}
                    </p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-stone-400">
                      Ref: {tx.paymentReference}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-serif text-2xl leading-none text-stone-900">
                      ${Number(tx.amount || 0).toLocaleString()}
                    </p>
                    <span
                      className={`mt-2 inline-block border-2 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${
                        STATUS_STYLES[tx.status] ||
                        'border-stone-400 text-stone-600'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>
                </div>

                {tx.bookingId && (
                  <div className="mt-3 flex items-center gap-4 border-t border-stone-200 pt-3 font-mono text-[10px] uppercase tracking-widest text-stone-500">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 size={11} />
                      Booking: {tx.bookingId.date} at {tx.bookingId.time}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <DollarSign size={11} />
                      {tx.currency}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EarningsDashboard;
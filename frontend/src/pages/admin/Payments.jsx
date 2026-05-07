import React, { useEffect, useState } from 'react';
import { DollarSign, RefreshCw } from 'lucide-react';
import { paymentService } from '../../services/api';
import { formatPrice, formatDate } from '../../lib/utils';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Admin can see all payments via earnings endpoint (or a dedicated admin endpoint)
    paymentService.getEarnings().then(({ data }) => setPayments(data.payments || [])).finally(() => setLoading(false));
  }, []);

  const handleRefund = async (payment) => {
    const reason = prompt('Refund reason:');
    if (!reason) return;
    try {
      await paymentService.refund(payment._id, { reason });
      setPayments((prev) => prev.map((p) => p._id === payment._id ? { ...p, status: 'refunded' } : p));
      toast.success('Refund processed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Refund failed');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">Payment Management</h1>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Student</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Course</th>
                <th className="text-left px-4 py-3 font-medium">Amount</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Date</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-600">
                        {p.user?.name?.[0]}
                      </div>
                      <span className="text-sm">{p.user?.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell line-clamp-1">{p.course?.title}</td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(p.amount)}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{formatDate(p.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      p.status === 'completed' ? 'bg-green-100 text-green-700' :
                      p.status === 'refunded' ? 'bg-blue-100 text-blue-700' :
                      p.status === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {p.status === 'completed' && (
                      <button onClick={() => handleRefund(p)}
                        className="flex items-center gap-1 text-xs text-amber-600 hover:underline">
                        <RefreshCw className="w-3 h-3" /> Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {payments.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">No payments found.</div>
          )}
        </div>
      </div>
    </div>
  );
}

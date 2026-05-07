import React, { useEffect, useState } from 'react';
import { DollarSign, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { paymentService } from '../../services/api';
import { formatPrice, formatDate } from '../../lib/utils';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const statusConfig = {
  completed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Completed' },
  pending: { icon: RefreshCw, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Pending' },
  failed: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Failed' },
  refunded: { icon: RefreshCw, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Refunded' },
};

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentService.getHistory().then(({ data }) => setPayments(data.payments)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">Payment History</h1>

      {payments.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-xl">
          <DollarSign className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
          <p className="text-muted-foreground">No payment history yet.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Course</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-left px-4 py-3 font-medium">Amount</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => {
                  const s = statusConfig[p.status] || statusConfig.pending;
                  const Icon = s.icon;
                  return (
                    <tr key={p._id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.course?.thumbnail?.url ? (
                            <img src={p.course.thumbnail.url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
                              <DollarSign className="w-4 h-4 text-brand-400" />
                            </div>
                          )}
                          <span className="font-medium line-clamp-1">{p.course?.title || 'Unknown Course'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(p.createdAt)}</td>
                      <td className="px-4 py-3 font-semibold">{formatPrice(p.amount)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${s.bg} ${s.color}`}>
                          <Icon className="w-3 h-3" /> {s.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

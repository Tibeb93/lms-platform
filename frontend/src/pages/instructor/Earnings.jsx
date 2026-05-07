import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { paymentService } from '../../services/api';
import { formatPrice, formatDate } from '../../lib/utils';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function Earnings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentService.getEarnings().then(({ data: res }) => setData(res)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  const payments = data?.payments || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">Earnings</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Earnings', value: formatPrice(data?.totalEarnings || 0), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
          { label: 'This Month', value: formatPrice(data?.thisMonthEarnings || 0), icon: TrendingUp, color: 'text-brand-600', bg: 'bg-brand-100' },
          { label: 'Total Sales', value: payments.length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4">
              <div className={`w-10 h-10 ${s.bg} dark:bg-opacity-20 rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Recent transactions */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold">Recent Transactions</h2>
        </div>
        {payments.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No transactions yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Student</th>
                  <th className="text-left px-4 py-3 font-medium">Course</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-left px-4 py-3 font-medium">Amount</th>
                  <th className="text-left px-4 py-3 font-medium">Your Earnings</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-600">
                          {p.user?.name?.[0]}
                        </div>
                        <span>{p.user?.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground line-clamp-1">{p.course?.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(p.createdAt)}</td>
                    <td className="px-4 py-3">{formatPrice(p.amount)}</td>
                    <td className="px-4 py-3 text-green-600 font-medium">{formatPrice(p.instructorEarnings)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

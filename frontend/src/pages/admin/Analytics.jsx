import React, { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { userService } from '../../services/api';
import { formatPrice } from '../../lib/utils';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.getPlatformAnalytics().then(({ data: res }) => setData(res)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chartData = (data?.monthlySignups || []).map((m) => ({
    month: MONTHS[m._id.month - 1],
    users: m.count,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">Platform Analytics</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: formatPrice(data?.stats?.totalRevenue || 0) },
          { label: 'Total Users', value: data?.stats?.totalUsers || 0 },
          { label: 'Total Courses', value: data?.stats?.totalCourses || 0 },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-semibold mb-4">User Growth (Last 6 Months)</h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} name="New Users" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-muted-foreground">No data yet</div>
        )}
      </div>
    </div>
  );
}

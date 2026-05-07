import React, { useEffect, useState } from 'react';
import { Users, BookOpen, DollarSign, TrendingUp, UserCheck, ShieldAlert } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { userService } from '../../services/api';
import { formatPrice, formatDate } from '../../lib/utils';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.getPlatformAnalytics().then(({ data: res }) => setData(res)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  const stats = data?.stats || {};
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chartData = (data?.monthlySignups || []).map((m) => ({
    month: MONTHS[m._id.month - 1],
    users: m.count,
  }));

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Students', value: stats.totalStudents || 0, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Instructors', value: stats.totalInstructors || 0, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Total Courses', value: stats.totalCourses || 0, icon: BookOpen, color: 'text-brand-600', bg: 'bg-brand-100' },
    { label: 'Published Courses', value: stats.publishedCourses || 0, icon: BookOpen, color: 'text-teal-600', bg: 'bg-teal-100' },
    { label: 'Total Revenue', value: formatPrice(stats.totalRevenue || 0), icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">Platform Analytics</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((s, i) => {
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Signups chart */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold mb-4">Monthly Signups</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="users" fill="#6366f1" radius={[4, 4, 0, 0]} name="New Users" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
          )}
        </div>

        {/* Recent users */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold mb-4">Recent Users</h2>
          <div className="space-y-3">
            {(data?.recentUsers || []).slice(0, 6).map((u) => (
              <div key={u._id} className="flex items-center gap-3">
                {u.avatar?.url ? (
                  <img src={u.avatar.url} alt="" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-600">
                    {u.name?.[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                  u.role === 'admin' ? 'bg-red-100 text-red-700' :
                  u.role === 'instructor' ? 'bg-purple-100 text-purple-700' :
                  'bg-green-100 text-green-700'
                }`}>{u.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

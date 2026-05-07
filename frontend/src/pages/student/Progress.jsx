import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Clock, BookOpen, Award } from 'lucide-react';
import { userService } from '../../services/api';
import { formatDuration } from '../../lib/utils';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function Progress() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.getDashboard().then(({ data: res }) => setData(res)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  const stats = data?.stats || {};
  const recentProgress = data?.recentProgress || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">Learning Progress</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Courses', value: stats.totalCourses || 0, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Completed', value: stats.completedCourses || 0, icon: Award, color: 'text-green-600', bg: 'bg-green-100' },
          { label: 'In Progress', value: stats.inProgressCourses || 0, icon: TrendingUp, color: 'text-brand-600', bg: 'bg-brand-100' },
          { label: 'Hours Learned', value: stats.totalWatchTime || 0, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-100' },
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

      <div>
        <h2 className="text-lg font-semibold mb-4">Course Progress</h2>
        {recentProgress.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-xl">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
            <p className="text-muted-foreground">No progress data yet. Start learning!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentProgress.map((p) => (
              <div key={p._id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-4">
                  {p.course?.thumbnail?.url ? (
                    <img src={p.course.thumbnail.url} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-brand-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm mb-2 truncate">{p.course?.title}</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 progress-bar">
                        <div className="progress-fill" style={{ width: `${p.completionPercentage}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">{p.completionPercentage}%</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{p.completedLessons?.length || 0} lessons done</span>
                      {p.totalWatchTime > 0 && <span>{formatDuration(p.totalWatchTime)} watched</span>}
                      {p.isCompleted && <span className="text-green-600 font-medium">✅ Completed</span>}
                    </div>
                  </div>
                  <Link to={`/learn/${p.course?.slug}`} className="btn-primary text-xs px-3 py-1.5 flex-shrink-0">
                    {p.completionPercentage > 0 ? 'Continue' : 'Start'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

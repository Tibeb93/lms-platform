import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Play, Award, Clock } from 'lucide-react';
import { userService } from '../../services/api';
import { formatDuration } from '../../lib/utils';
import LoadingSpinner, { SkeletonCard } from '../../components/common/LoadingSpinner';

export default function MyCourses() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    userService.getDashboard().then(({ data: res }) => {
      setData(res);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-4">
      <div className="skeleton h-8 w-48 rounded" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );

  const enrolledCourses = data?.enrolledCourses || [];
  const progressMap = {};
  (data?.recentProgress || []).forEach((p) => { progressMap[p.course?._id] = p; });

  const filtered = enrolledCourses.filter((e) => {
    const p = progressMap[e.course?._id];
    if (filter === 'completed') return p?.isCompleted;
    if (filter === 'in-progress') return p && !p.isCompleted && p.completionPercentage > 0;
    if (filter === 'not-started') return !p || p.completionPercentage === 0;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">My Courses</h1>
        <Link to="/courses" className="btn-primary text-sm">Browse More</Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: 'all', label: `All (${enrolledCourses.length})` },
          { value: 'in-progress', label: 'In Progress' },
          { value: 'completed', label: 'Completed' },
          { value: 'not-started', label: 'Not Started' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f.value ? 'bg-brand-600 text-white' : 'bg-muted hover:bg-muted/80 text-muted-foreground'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
          <p className="text-muted-foreground">No courses in this category</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((enrollment) => {
            const course = enrollment.course;
            if (!course) return null;
            const p = progressMap[course._id];
            const pct = p?.completionPercentage || 0;
            return (
              <div key={enrollment._id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                {course.thumbnail?.url ? (
                  <img src={course.thumbnail.url} alt="" className="w-full h-36 object-cover" />
                ) : (
                  <div className="w-full h-36 bg-gradient-to-br from-brand-100 to-purple-100 flex items-center justify-center">
                    <BookOpen className="w-10 h-10 text-brand-400" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-3 line-clamp-2">{course.title}</h3>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{pct === 100 ? '✅ Completed' : `${pct}% complete`}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/learn/${course.slug}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm rounded-lg transition-colors"
                    >
                      <Play className="w-3 h-3" />
                      {pct > 0 ? 'Continue' : 'Start'}
                    </Link>
                    {pct === 100 && (
                      <Link to="/certificates" className="p-2 border border-border rounded-lg hover:bg-muted transition-colors">
                        <Award className="w-4 h-4 text-amber-500" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

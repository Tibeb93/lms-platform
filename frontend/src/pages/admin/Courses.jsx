import React, { useEffect, useState } from 'react';
import { Search, CheckCircle, XCircle, Eye, Trash2 } from 'lucide-react';
import { courseService } from '../../services/api';
import { formatPrice, formatDate } from '../../lib/utils';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ total: 0, pages: 1, currentPage: 1 });

  useEffect(() => {
    loadCourses();
  }, [search]);

  const loadCourses = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await courseService.getCourses({ search, page, limit: 20 });
      setCourses(data.courses);
      setPagination({ total: data.total, pages: data.pages, currentPage: data.currentPage });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (courseId, approved) => {
    const reason = !approved ? prompt('Rejection reason:') : undefined;
    try {
      await courseService.approveCourse(courseId, { approved, reason });
      setCourses((prev) => prev.map((c) => c._id === courseId ? { ...c, isApproved: approved } : c));
      toast.success(approved ? 'Course approved' : 'Course rejected');
    } catch {
      toast.error('Failed to update course');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this course permanently?')) return;
    try {
      await courseService.deleteCourse(id);
      setCourses((prev) => prev.filter((c) => c._id !== id));
      toast.success('Course deleted');
    } catch {
      toast.error('Failed to delete course');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">Course Management</h1>
        <span className="text-sm text-muted-foreground">{pagination.total} courses</span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses..." className="input-field pl-9 max-w-sm" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Course</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Instructor</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Price</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c._id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {c.thumbnail?.url ? (
                          <img src={c.thumbnail.url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-brand-100" />
                        )}
                        <div>
                          <p className="font-medium line-clamp-1">{c.title}</p>
                          <p className="text-xs text-muted-foreground">{c.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{c.instructor?.name}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">{formatPrice(c.price)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full w-fit ${c.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {c.isPublished ? 'Published' : 'Draft'}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full w-fit ${c.isApproved ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                          {c.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {!c.isApproved && (
                          <button onClick={() => handleApprove(c._id, true)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Approve">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {c.isApproved && (
                          <button onClick={() => handleApprove(c._id, false)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Reject">
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => handleDelete(c._id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, EyeOff, BookOpen, Star, Users } from 'lucide-react';
import { courseService } from '../../services/api';
import { formatPrice } from '../../lib/utils';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const { data } = await courseService.getInstructorCourses();
      setCourses(data.courses);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (course) => {
    setToggling(course._id);
    try {
      await courseService.togglePublish(course._id);
      setCourses((prev) => prev.map((c) => c._id === course._id ? { ...c, isPublished: !c.isPublished } : c));
      toast.success(course.isPublished ? 'Course unpublished' : 'Course published!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update course');
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this course? This cannot be undone.')) return;
    try {
      await courseService.deleteCourse(id);
      setCourses((prev) => prev.filter((c) => c._id !== id));
      toast.success('Course deleted');
    } catch {
      toast.error('Failed to delete course');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">My Courses</h1>
        <Link to="/instructor/courses/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Course
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-xl">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
          <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
          <p className="text-muted-foreground mb-6">Create your first course and start teaching!</p>
          <Link to="/instructor/courses/new" className="btn-primary">Create Course</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div key={course._id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
              {course.thumbnail?.url ? (
                <img src={course.thumbnail.url} alt="" className="w-full h-36 object-cover" />
              ) : (
                <div className="w-full h-36 bg-gradient-to-br from-brand-100 to-purple-100 flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-brand-400" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-sm line-clamp-2 flex-1">{course.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${course.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {course.isPublished ? 'Live' : 'Draft'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course.totalStudents}</span>
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{course.averageRating?.toFixed(1)}</span>
                  <span className="font-medium text-foreground">{formatPrice(course.price)}</span>
                </div>

                <div className="flex gap-2">
                  <Link to={`/instructor/courses/${course._id}/edit`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-border rounded-lg hover:bg-muted text-xs transition-colors">
                    <Edit className="w-3 h-3" /> Edit
                  </Link>
                  <button
                    onClick={() => handleTogglePublish(course)}
                    disabled={toggling === course._id}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-colors ${
                      course.isPublished ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {toggling === course._id ? <LoadingSpinner size="sm" /> : course.isPublished ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {course.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                  <button onClick={() => handleDelete(course._id)}
                    className="p-2 border border-border rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

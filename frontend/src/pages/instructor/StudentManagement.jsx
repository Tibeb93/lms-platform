import React, { useEffect, useState } from 'react';
import { Users, Search } from 'lucide-react';
import { courseService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../lib/utils';

export default function StudentManagement() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    courseService.getInstructorCourses().then(({ data }) => setCourses(data.courses)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  const totalStudents = courses.reduce((acc, c) => acc + c.totalStudents, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">Students</h1>
        <div className="flex items-center gap-2 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-3 py-1.5 rounded-lg text-sm font-medium">
          <Users className="w-4 h-4" /> {totalStudents} total students
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold">Enrollment by Course</h2>
        </div>
        <div className="divide-y divide-border">
          {courses.map((course) => (
            <div key={course._id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
              {course.thumbnail?.url ? (
                <img src={course.thumbnail.url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-brand-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate">{course.title}</h3>
                <p className="text-xs text-muted-foreground">{course.isPublished ? 'Published' : 'Draft'}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-bold text-lg">{course.totalStudents}</div>
                <div className="text-xs text-muted-foreground">students</div>
              </div>
            </div>
          ))}
        </div>
        {courses.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">No courses yet.</div>
        )}
      </div>
    </div>
  );
}

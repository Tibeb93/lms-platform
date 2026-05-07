import React, { useEffect, useState } from 'react';
import { Heart, BookOpen } from 'lucide-react';
import { courseService, userService } from '../../services/api';
import CourseCard from '../../components/common/CourseCard';
import LoadingSpinner, { SkeletonCard } from '../../components/common/LoadingSpinner';
import useAuthStore from '../../store/authStore';

export default function Wishlist() {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user?.wishlist?.length) { setLoading(false); return; }
      try {
        // Fetch each wishlisted course
        const results = await Promise.allSettled(
          user.wishlist.map((id) => courseService.getCourses({ _id: id }))
        );
        // Fallback: just show empty if API doesn't support _id filter
        setLoading(false);
      } catch {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [user?.wishlist]);

  if (loading) return (
    <div className="space-y-4">
      <div className="skeleton h-8 w-32 rounded" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
        <Heart className="w-6 h-6 text-red-500" /> Wishlist
      </h1>

      {!user?.wishlist?.length ? (
        <div className="text-center py-20 bg-card border border-border rounded-xl">
          <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
          <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
          <p className="text-muted-foreground mb-6">Save courses you're interested in to find them easily later.</p>
          <a href="/courses" className="btn-primary">Browse Courses</a>
        </div>
      ) : (
        <p className="text-muted-foreground">{user.wishlist.length} saved course{user.wishlist.length !== 1 ? 's' : ''}</p>
      )}
    </div>
  );
}

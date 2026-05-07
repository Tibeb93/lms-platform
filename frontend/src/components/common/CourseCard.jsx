import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Clock, Star, BookOpen, Heart } from 'lucide-react';
import { formatPrice, formatDuration, truncateText } from '../../lib/utils';
import { userService } from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function CourseCard({ course, showWishlist = true }) {
  const { user, isAuthenticated } = useAuthStore();
  const isWishlisted = user?.wishlist?.includes(course._id);

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login to save courses'); return; }
    try {
      await userService.toggleWishlist(course._id);
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const effectivePrice = course.isFree ? 0
    : (course.discountPrice && new Date(course.discountExpiry) > new Date() ? course.discountPrice : course.price);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-shadow"
    >
      <Link to={`/courses/${course.slug}`} className="block">
        {/* Thumbnail */}
        <div className="relative overflow-hidden aspect-video bg-muted">
          {course.thumbnail?.url ? (
            <img
              src={course.thumbnail.url}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-100 to-purple-100">
              <BookOpen className="w-12 h-12 text-brand-400" />
            </div>
          )}
          {/* Level badge */}
          <span className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
            {course.level}
          </span>
          {/* Wishlist button */}
          {showWishlist && (
            <button
              onClick={handleWishlist}
              className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="text-xs text-brand-600 font-medium mb-1">{course.category}</div>
          <h3 className="font-semibold text-foreground text-sm leading-snug mb-2 line-clamp-2">
            {course.title}
          </h3>
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {truncateText(course.subtitle || course.description, 80)}
          </p>

          {/* Instructor */}
          <div className="flex items-center gap-2 mb-3">
            {course.instructor?.avatar?.url ? (
              <img src={course.instructor.avatar.url} alt="" className="w-5 h-5 rounded-full object-cover" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center text-xs text-brand-600 font-bold">
                {course.instructor?.name?.[0]}
              </div>
            )}
            <span className="text-xs text-muted-foreground">{course.instructor?.name}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="font-medium text-foreground">{course.averageRating?.toFixed(1) || '0.0'}</span>
              <span>({course.totalReviews || 0})</span>
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {course.totalStudents?.toLocaleString() || 0}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(course.totalDuration)}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground">
                {formatPrice(effectivePrice)}
              </span>
              {effectivePrice < course.price && course.price > 0 && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(course.price)}
                </span>
              )}
            </div>
            {course.totalLessons > 0 && (
              <span className="text-xs text-muted-foreground">{course.totalLessons} lessons</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

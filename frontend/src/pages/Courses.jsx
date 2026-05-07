import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import CourseCard from '../components/common/CourseCard';
import { SkeletonCard } from '../components/common/LoadingSpinner';
import useCourseStore from '../store/courseStore';
import { debounce } from '../lib/utils';

const CATEGORIES = [
  'Web Development', 'Mobile Development', 'Data Science', 'Machine Learning',
  'DevOps', 'Cloud Computing', 'Cybersecurity', 'UI/UX Design', 'Graphic Design',
  'Digital Marketing', 'Business', 'Finance', 'Photography', 'Music',
  'Health & Fitness', 'Language Learning', 'Personal Development', 'Other',
];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];

export default function Courses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { courses, isLoading, pagination, filters, setFilters, fetchCourses } = useCourseStore();
  const [showFilters, setShowFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchParams.get('search') || '');

  useEffect(() => {
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    setFilters({ search, category });
    setLocalSearch(search);
  }, []);

  useEffect(() => {
    fetchCourses({ page: 1 });
  }, [filters]);

  const debouncedSearch = useCallback(
    debounce((val) => setFilters({ search: val }), 400),
    []
  );

  const handleSearchChange = (e) => {
    setLocalSearch(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handlePageChange = (page) => {
    fetchCourses({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilter = (key) => setFilters({ [key]: '' });

  const activeFilters = Object.entries(filters).filter(([k, v]) => v && k !== 'sort' && k !== 'search');

  return (
    <div className="page-container py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold mb-1">All Courses</h1>
        <p className="text-muted-foreground">
          {pagination.total > 0 ? `${pagination.total.toLocaleString()} courses available` : 'Explore our course catalog'}
        </p>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={localSearch}
            onChange={handleSearchChange}
            placeholder="Search courses, topics, instructors..."
            className="input-field pl-9"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filters.sort}
            onChange={(e) => setFilters({ sort: e.target.value })}
            className="input-field w-auto text-sm"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              showFilters ? 'bg-brand-600 text-white border-brand-600' : 'border-border hover:bg-muted'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilters.length > 0 && (
              <span className="bg-white text-brand-600 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {activeFilters.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {activeFilters.map(([key, value]) => (
            <span key={key} className="flex items-center gap-1 bg-brand-100 text-brand-700 text-xs px-3 py-1 rounded-full">
              {value}
              <button onClick={() => clearFilter(key)}><X className="w-3 h-3" /></button>
            </span>
          ))}
          <button onClick={() => setFilters({ category: '', level: '', minPrice: '', maxPrice: '', isFree: false })}
            className="text-xs text-muted-foreground hover:text-foreground underline">
            Clear all
          </button>
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar filters */}
        {showFilters && (
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-64 flex-shrink-0 space-y-6"
          >
            {/* Category */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Category</h3>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {CATEGORIES.map((cat) => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer hover:text-brand-600 transition-colors">
                    <input
                      type="radio"
                      name="category"
                      checked={filters.category === cat}
                      onChange={() => setFilters({ category: cat })}
                      className="accent-brand-600"
                    />
                    <span className="text-sm">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Level */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Level</h3>
              <div className="space-y-1">
                {LEVELS.map((lvl) => (
                  <label key={lvl} className="flex items-center gap-2 cursor-pointer hover:text-brand-600 transition-colors">
                    <input
                      type="radio"
                      name="level"
                      checked={filters.level === lvl}
                      onChange={() => setFilters({ level: lvl })}
                      className="accent-brand-600"
                    />
                    <span className="text-sm">{lvl}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Price</h3>
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={filters.isFree}
                  onChange={(e) => setFilters({ isFree: e.target.checked })}
                  className="accent-brand-600"
                />
                <span className="text-sm">Free only</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min $"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ minPrice: e.target.value })}
                  className="input-field text-sm py-1.5"
                />
                <input
                  type="number"
                  placeholder="Max $"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ maxPrice: e.target.value })}
                  className="input-field text-sm py-1.5"
                />
              </div>
            </div>

            {/* Rating */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Min Rating</h3>
              <div className="space-y-1">
                {[4.5, 4.0, 3.5, 3.0].map((r) => (
                  <label key={r} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      checked={filters.rating === String(r)}
                      onChange={() => setFilters({ rating: String(r) })}
                      className="accent-brand-600"
                    />
                    <span className="text-sm text-amber-500">{'★'.repeat(Math.floor(r))}</span>
                    <span className="text-sm text-muted-foreground">{r}+</span>
                  </label>
                ))}
              </div>
            </div>
          </motion.aside>
        )}

        {/* Course grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20">
              <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
              <h3 className="text-lg font-semibold mb-2">No courses found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        page === pagination.currentPage
                          ? 'bg-brand-600 text-white'
                          : 'border border-border hover:bg-muted'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

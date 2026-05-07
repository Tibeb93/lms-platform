import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, Play, Star, Users, BookOpen, Award, ArrowRight,
  CheckCircle, TrendingUp, Globe, Zap, Shield,
} from 'lucide-react';
import CourseCard from '../components/common/CourseCard';
import { SkeletonCard } from '../components/common/LoadingSpinner';
import useCourseStore from '../store/courseStore';

const CATEGORIES = [
  { name: 'Web Development', icon: '💻', color: 'from-blue-500 to-cyan-500' },
  { name: 'Data Science', icon: '📊', color: 'from-purple-500 to-pink-500' },
  { name: 'UI/UX Design', icon: '🎨', color: 'from-orange-500 to-red-500' },
  { name: 'Machine Learning', icon: '🤖', color: 'from-green-500 to-teal-500' },
  { name: 'Business', icon: '💼', color: 'from-yellow-500 to-orange-500' },
  { name: 'Photography', icon: '📷', color: 'from-pink-500 to-rose-500' },
  { name: 'Music', icon: '🎵', color: 'from-indigo-500 to-purple-500' },
  { name: 'Language Learning', icon: '🌍', color: 'from-teal-500 to-green-500' },
];

const STATS = [
  { value: '50K+', label: 'Students', icon: Users },
  { value: '1,200+', label: 'Courses', icon: BookOpen },
  { value: '300+', label: 'Instructors', icon: Award },
  { value: '4.8', label: 'Avg Rating', icon: Star },
];

const FEATURES = [
  { icon: Zap, title: 'Learn at Your Pace', desc: 'Access courses anytime, anywhere on any device.' },
  { icon: Shield, title: 'Expert Instructors', desc: 'Learn from industry professionals with real-world experience.' },
  { icon: Award, title: 'Earn Certificates', desc: 'Get recognized certificates upon course completion.' },
  { icon: Globe, title: 'Global Community', desc: 'Join millions of learners from around the world.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function Home() {
  const navigate = useNavigate();
  const { featuredCourses, isLoading, fetchFeaturedCourses } = useCourseStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchFeaturedCourses();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className="overflow-hidden">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-brand-950 via-brand-900 to-purple-900 text-white py-20 md:py-32 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        </div>

        <div className="page-container relative">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full text-sm mb-6">
                <TrendingUp className="w-4 h-4 text-brand-300" />
                <span>Join 50,000+ learners worldwide</span>
              </span>
            </motion.div>

            <motion.h1
              initial="hidden" animate="visible" variants={fadeUp} custom={1}
              className="text-4xl md:text-6xl font-heading font-bold leading-tight mb-6"
            >
              Unlock Your{' '}
              <span className="bg-gradient-to-r from-brand-300 to-purple-300 bg-clip-text text-transparent">
                Full Potential
              </span>{' '}
              with Expert-Led Courses
            </motion.h1>

            <motion.p
              initial="hidden" animate="visible" variants={fadeUp} custom={2}
              className="text-lg text-brand-200 mb-8 max-w-xl mx-auto"
            >
              Learn in-demand skills from world-class instructors. Start your journey today with 1,200+ courses across every discipline.
            </motion.p>

            {/* Search */}
            <motion.form
              initial="hidden" animate="visible" variants={fadeUp} custom={3}
              onSubmit={handleSearch}
              className="flex gap-2 max-w-lg mx-auto mb-8"
            >
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What do you want to learn?"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm"
                />
              </div>
              <button type="submit" className="px-6 py-3.5 bg-brand-500 hover:bg-brand-400 rounded-xl font-semibold text-sm transition-colors whitespace-nowrap">
                Search
              </button>
            </motion.form>

            <motion.div
              initial="hidden" animate="visible" variants={fadeUp} custom={4}
              className="flex flex-wrap justify-center gap-2 text-sm text-brand-300"
            >
              <span>Popular:</span>
              {['Python', 'React', 'UI Design', 'Data Science', 'JavaScript'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => navigate(`/courses?search=${tag}`)}
                  className="hover:text-white transition-colors underline underline-offset-2"
                >
                  {tag}
                </button>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className="py-12 bg-card border-b border-border">
        <div className="page-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-2">
                    <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/30 rounded-xl flex items-center justify-center">
                      <Icon className="w-5 h-5 text-brand-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold font-heading">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="page-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">Browse by Category</h2>
              <p className="text-muted-foreground mt-1">Explore our wide range of course categories</p>
            </div>
            <Link to="/courses" className="hidden sm:flex items-center gap-1 text-brand-600 hover:text-brand-700 font-medium text-sm">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/courses?category=${encodeURIComponent(cat.name)}`}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-brand-300 hover:shadow-md transition-all group text-center"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                    {cat.icon}
                  </div>
                  <span className="text-xs font-medium text-foreground leading-tight">{cat.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Courses ─────────────────────────────────────────────── */}
      <section className="py-16 bg-muted/30">
        <div className="page-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">Featured Courses</h2>
              <p className="text-muted-foreground mt-1">Hand-picked courses by our editorial team</p>
            </div>
            <Link to="/courses" className="hidden sm:flex items-center gap-1 text-brand-600 hover:text-brand-700 font-medium text-sm">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : featuredCourses.slice(0, 8).map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
          </div>
          {!isLoading && featuredCourses.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No featured courses yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="section-title">Why Choose LearnHub?</h2>
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
              We provide the best learning experience with cutting-edge tools and expert guidance.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-xl border border-border bg-card hover:shadow-md transition-shadow text-center"
                >
                  <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-brand-600" />
                  </div>
                  <h3 className="font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-r from-brand-600 to-purple-600 text-white">
        <div className="page-container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Ready to Start Learning?
            </h2>
            <p className="text-brand-100 mb-8 max-w-xl mx-auto">
              Join thousands of students already learning on LearnHub. Get unlimited access to all courses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-3.5 bg-white text-brand-700 font-semibold rounded-xl hover:bg-brand-50 transition-colors"
              >
                Get Started Free
              </Link>
              <Link
                to="/courses"
                className="px-8 py-3.5 bg-white/10 backdrop-blur border border-white/20 font-semibold rounded-xl hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" /> Browse Courses
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

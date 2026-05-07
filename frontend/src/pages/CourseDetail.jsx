import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Play, Clock, Users, Star, Award, Globe, CheckCircle, Lock,
  ChevronDown, ChevronUp, BookOpen, Download, Share2, Heart,
} from 'lucide-react';
import { formatPrice, formatDuration, formatDate } from '../lib/utils';
import { enrollmentService, paymentService, userService } from '../services/api';
import useCourseStore from '../store/courseStore';
import useAuthStore from '../store/authStore';
import StarRating from '../components/common/StarRating';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function CourseDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { fetchCourse, currentCourse, isLoading } = useCourseStore();
  const { user, isAuthenticated } = useAuthStore();
  const [expandedSections, setExpandedSections] = useState({});
  const [enrolling, setEnrolling] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchCourse(slug);
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!currentCourse?.course) {
    return (
      <div className="page-container py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Course not found</h2>
        <Link to="/courses" className="btn-primary">Browse Courses</Link>
      </div>
    );
  }

  const { course, isEnrolled, progress } = currentCourse;
  const effectivePrice = course.isFree ? 0
    : (course.discountPrice && new Date(course.discountExpiry) > new Date() ? course.discountPrice : course.price);

  const toggleSection = (id) => setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleEnroll = async () => {
    if (!isAuthenticated) { navigate('/login', { state: { from: `/courses/${slug}` } }); return; }
    setEnrolling(true);
    try {
      if (effectivePrice === 0) {
        await enrollmentService.enrollFree(course._id);
        toast.success('Enrolled successfully!');
        navigate(`/learn/${course.slug}`);
      } else {
        const { data } = await paymentService.createCheckout(course._id);
        window.location.href = data.url;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const totalLessons = course.sections?.reduce((acc, s) => acc + s.lessons.length, 0) || 0;
  const previewLessons = course.sections?.reduce(
    (acc, s) => acc + s.lessons.filter((l) => l.isPreview).length, 0
  ) || 0;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-10">
        <div className="page-container">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="text-sm text-brand-300 mb-2">{course.category}</div>
              <h1 className="text-3xl font-heading font-bold mb-3">{course.title}</h1>
              {course.subtitle && <p className="text-gray-300 mb-4">{course.subtitle}</p>}

              <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold">{course.averageRating?.toFixed(1)}</span>
                  <span className="text-gray-400">({course.totalReviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-gray-300">
                  <Users className="w-4 h-4" />
                  {course.totalStudents?.toLocaleString()} students
                </div>
                <div className="flex items-center gap-1 text-gray-300">
                  <Clock className="w-4 h-4" />
                  {formatDuration(course.totalDuration)}
                </div>
                <div className="flex items-center gap-1 text-gray-300">
                  <Globe className="w-4 h-4" />
                  {course.language}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {course.instructor?.avatar?.url ? (
                  <img src={course.instructor.avatar.url} alt="" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-sm font-bold">
                    {course.instructor?.name?.[0]}
                  </div>
                )}
                <span className="text-sm">
                  Created by <span className="text-brand-300 font-medium">{course.instructor?.name}</span>
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mt-3 text-xs">
                <span className="bg-white/10 px-2 py-1 rounded">{course.level}</span>
                <span className="bg-white/10 px-2 py-1 rounded">Last updated {formatDate(course.updatedAt)}</span>
                {course.hasCertificate && (
                  <span className="bg-white/10 px-2 py-1 rounded flex items-center gap-1">
                    <Award className="w-3 h-3" /> Certificate
                  </span>
                )}
              </div>
            </div>

            {/* Sticky purchase card - desktop */}
            <div className="hidden lg:block">
              <PurchaseCard
                course={course}
                effectivePrice={effectivePrice}
                isEnrolled={isEnrolled}
                progress={progress}
                enrolling={enrolling}
                onEnroll={handleEnroll}
                navigate={navigate}
                user={user}
                isAuthenticated={isAuthenticated}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile purchase card */}
      <div className="lg:hidden sticky top-16 z-10 bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold">{formatPrice(effectivePrice)}</span>
            {effectivePrice < course.price && course.price > 0 && (
              <span className="text-sm text-muted-foreground line-through ml-2">{formatPrice(course.price)}</span>
            )}
          </div>
          {isEnrolled ? (
            <button onClick={() => navigate(`/learn/${course.slug}`)} className="btn-primary">
              Continue Learning
            </button>
          ) : (
            <button onClick={handleEnroll} disabled={enrolling} className="btn-primary flex items-center gap-2">
              {enrolling ? <LoadingSpinner size="sm" /> : null}
              {effectivePrice === 0 ? 'Enroll Free' : 'Buy Now'}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="page-container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex gap-1 border-b border-border mb-6">
              {['overview', 'curriculum', 'instructor', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                    activeTab === tab ? 'border-brand-600 text-brand-600' : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {course.whatYouWillLearn?.length > 0 && (
                  <div className="border border-border rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-4">What you'll learn</h2>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {course.whatYouWillLearn.map((item, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h2 className="text-xl font-bold mb-3">Course Description</h2>
                  <div className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                    {course.description}
                  </div>
                </div>

                {course.requirements?.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold mb-3">Requirements</h2>
                    <ul className="space-y-1">
                      {course.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-brand-500 mt-1">•</span> {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Curriculum */}
            {activeTab === 'curriculum' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-muted-foreground">
                    {course.sections?.length} sections • {totalLessons} lessons • {formatDuration(course.totalDuration)} total
                  </div>
                  {previewLessons > 0 && (
                    <span className="text-xs text-brand-600">{previewLessons} free previews</span>
                  )}
                </div>
                <div className="space-y-2">
                  {course.sections?.map((section) => (
                    <div key={section._id} className="border border-border rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleSection(section._id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
                      >
                        <div>
                          <span className="font-semibold text-sm">{section.title}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {section.lessons.length} lessons
                          </span>
                        </div>
                        {expandedSections[section._id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      {expandedSections[section._id] && (
                        <div className="border-t border-border">
                          {section.lessons.map((lesson) => (
                            <div key={lesson._id} className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                              {lesson.isPreview ? (
                                <Play className="w-4 h-4 text-brand-500 flex-shrink-0" />
                              ) : (
                                <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              )}
                              <span className="flex-1 text-sm">{lesson.title}</span>
                              {lesson.isPreview && (
                                <span className="text-xs text-brand-600 font-medium">Preview</span>
                              )}
                              {lesson.duration > 0 && (
                                <span className="text-xs text-muted-foreground">{formatDuration(lesson.duration)}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructor */}
            {activeTab === 'instructor' && (
              <div className="flex gap-4">
                {course.instructor?.avatar?.url ? (
                  <img src={course.instructor.avatar.url} alt="" className="w-20 h-20 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center text-2xl font-bold text-brand-600 flex-shrink-0">
                    {course.instructor?.name?.[0]}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold">{course.instructor?.name}</h3>
                  <p className="text-muted-foreground text-sm mb-2">{course.instructor?.headline}</p>
                  <div className="flex gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-400" /> Instructor</span>
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {course.instructor?.totalStudents || 0} students</span>
                    <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {course.instructor?.courses?.length || 0} courses</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{course.instructor?.bio}</p>
                </div>
              </div>
            )}

            {/* Reviews */}
            {activeTab === 'reviews' && (
              <div>
                <div className="flex items-center gap-6 mb-6 p-6 bg-muted/30 rounded-xl">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-amber-500">{course.averageRating?.toFixed(1)}</div>
                    <StarRating rating={course.averageRating} size="md" />
                    <div className="text-sm text-muted-foreground mt-1">Course Rating</div>
                  </div>
                  <div className="flex-1 text-sm text-muted-foreground">
                    {course.totalReviews} reviews
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">
                  Enroll in the course to see and leave reviews.
                </p>
              </div>
            )}
          </div>

          {/* Desktop sidebar */}
          <div className="hidden lg:block" />
        </div>
      </div>
    </div>
  );
}

function PurchaseCard({ course, effectivePrice, isEnrolled, progress, enrolling, onEnroll, navigate, user, isAuthenticated }) {
  return (
    <div className="bg-card border border-border rounded-xl shadow-xl overflow-hidden sticky top-20">
      {course.thumbnail?.url && (
        <div className="relative aspect-video">
          <img src={course.thumbnail.url} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center">
              <Play className="w-6 h-6 text-brand-600 ml-1" />
            </div>
          </div>
        </div>
      )}
      <div className="p-5">
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-3xl font-bold">{formatPrice(effectivePrice)}</span>
          {effectivePrice < course.price && course.price > 0 && (
            <>
              <span className="text-lg text-muted-foreground line-through">{formatPrice(course.price)}</span>
              <span className="text-sm text-green-600 font-medium">
                {Math.round((1 - effectivePrice / course.price) * 100)}% off
              </span>
            </>
          )}
        </div>

        {isEnrolled ? (
          <div className="space-y-3">
            {progress && (
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span>{progress.completionPercentage}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress.completionPercentage}%` }} />
                </div>
              </div>
            )}
            <button
              onClick={() => navigate(`/learn/${course.slug}`)}
              className="w-full btn-primary py-3 text-center"
            >
              {progress?.completionPercentage > 0 ? 'Continue Learning' : 'Start Learning'}
            </button>
          </div>
        ) : (
          <button
            onClick={onEnroll}
            disabled={enrolling}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2 mb-3"
          >
            {enrolling ? <LoadingSpinner size="sm" /> : null}
            {effectivePrice === 0 ? 'Enroll for Free' : `Buy Now — ${formatPrice(effectivePrice)}`}
          </button>
        )}

        {!isEnrolled && (
          <p className="text-xs text-center text-muted-foreground mb-4">30-day money-back guarantee</p>
        )}

        <div className="space-y-2 text-sm">
          {[
            { icon: Clock, text: `${formatDuration(course.totalDuration)} of content` },
            { icon: BookOpen, text: `${course.totalLessons} lessons` },
            { icon: Globe, text: 'Full lifetime access' },
            { icon: Download, text: 'Downloadable resources' },
            ...(course.hasCertificate ? [{ icon: Award, text: 'Certificate of completion' }] : []),
          ].map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-center gap-2 text-muted-foreground">
              <Icon className="w-4 h-4 flex-shrink-0" />
              {text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

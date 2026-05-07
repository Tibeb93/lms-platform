import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
  Save, Plus, Trash2, Upload, ChevronDown, ChevronUp,
  Video, FileText, HelpCircle, GripVertical, Eye,
} from 'lucide-react';
import { courseService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Web Development', 'Mobile Development', 'Data Science', 'Machine Learning',
  'DevOps', 'Cloud Computing', 'Cybersecurity', 'UI/UX Design', 'Graphic Design',
  'Digital Marketing', 'Business', 'Finance', 'Photography', 'Music',
  'Health & Fitness', 'Language Learning', 'Personal Development', 'Other',
];

export default function CourseEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [expandedSections, setExpandedSections] = useState({});
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (isEditing) {
      // Load course by ID - we need to find it by slug or use a different endpoint
      // For now, load instructor courses and find by ID
      courseService.getInstructorCourses().then(({ data }) => {
        const found = data.courses.find((c) => c._id === id);
        if (found) {
          setCourse(found);
          reset({
            title: found.title,
            subtitle: found.subtitle,
            description: found.description,
            category: found.category,
            level: found.level,
            language: found.language,
            price: found.price,
            discountPrice: found.discountPrice,
            isFree: found.isFree,
          });
        }
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const onSaveBasic = async (data) => {
    setSaving(true);
    try {
      if (isEditing) {
        const { data: res } = await courseService.updateCourse(id, data);
        setCourse(res.course);
        toast.success('Course updated!');
      } else {
        const { data: res } = await courseService.createCourse(data);
        toast.success('Course created!');
        navigate(`/instructor/courses/${res.course._id}/edit`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !id) return;
    setUploadingThumbnail(true);
    const preview = URL.createObjectURL(file);
    setThumbnailPreview(preview);
    try {
      const formData = new FormData();
      formData.append('thumbnail', file);
      await courseService.uploadThumbnail(id, formData);
      toast.success('Thumbnail uploaded!');
    } catch {
      toast.error('Failed to upload thumbnail');
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const addSection = async () => {
    if (!id) { toast.error('Save the course first'); return; }
    const title = prompt('Section title:');
    if (!title) return;
    try {
      const { data } = await courseService.addSection(id, { title });
      setCourse((prev) => ({ ...prev, sections: [...(prev.sections || []), data.section] }));
      setExpandedSections((prev) => ({ ...prev, [data.section._id]: true }));
    } catch {
      toast.error('Failed to add section');
    }
  };

  const deleteSection = async (sectionId) => {
    if (!confirm('Delete this section and all its lessons?')) return;
    try {
      await courseService.deleteSection(id, sectionId);
      setCourse((prev) => ({ ...prev, sections: prev.sections.filter((s) => s._id !== sectionId) }));
    } catch {
      toast.error('Failed to delete section');
    }
  };

  const addLesson = async (sectionId) => {
    const title = prompt('Lesson title:');
    if (!title) return;
    try {
      const { data } = await courseService.addLesson(id, sectionId, { title, type: 'video' });
      setCourse((prev) => ({
        ...prev,
        sections: prev.sections.map((s) =>
          s._id === sectionId ? { ...s, lessons: [...s.lessons, data.lesson] } : s
        ),
      }));
    } catch {
      toast.error('Failed to add lesson');
    }
  };

  const uploadVideo = async (sectionId, lessonId, file) => {
    setUploadingVideo(lessonId);
    try {
      const formData = new FormData();
      formData.append('video', file);
      await courseService.uploadVideo(id, sectionId, lessonId, formData, (e) => {
        const pct = Math.round((e.loaded / e.total) * 100);
        // Could show progress here
      });
      toast.success('Video uploaded!');
    } catch {
      toast.error('Failed to upload video');
    } finally {
      setUploadingVideo(null);
    }
  };

  const deleteLesson = async (sectionId, lessonId) => {
    if (!confirm('Delete this lesson?')) return;
    try {
      await courseService.deleteLesson(id, sectionId, lessonId);
      setCourse((prev) => ({
        ...prev,
        sections: prev.sections.map((s) =>
          s._id === sectionId ? { ...s, lessons: s.lessons.filter((l) => l._id !== lessonId) } : s
        ),
      }));
    } catch {
      toast.error('Failed to delete lesson');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">{isEditing ? 'Edit Course' : 'Create Course'}</h1>
        {isEditing && course && (
          <button
            onClick={async () => {
              try {
                await courseService.togglePublish(id);
                setCourse((prev) => ({ ...prev, isPublished: !prev.isPublished }));
                toast.success(course.isPublished ? 'Course unpublished' : 'Course published!');
              } catch (err) {
                toast.error(err.response?.data?.message || 'Failed');
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              course?.isPublished ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            <Eye className="w-4 h-4" />
            {course?.isPublished ? 'Unpublish' : 'Publish Course'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {['basic', 'curriculum', 'media'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
              activeTab === tab ? 'border-brand-600 text-brand-600' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}>
            {tab === 'basic' ? 'Basic Info' : tab === 'curriculum' ? 'Curriculum' : 'Media'}
          </button>
        ))}
      </div>

      {/* Basic Info */}
      {activeTab === 'basic' && (
        <form onSubmit={handleSubmit(onSaveBasic)} className="space-y-4 max-w-2xl">
          <div>
            <label className="block text-sm font-medium mb-1.5">Course Title *</label>
            <input {...register('title', { required: 'Title is required' })} className="input-field" placeholder="e.g. Complete React Developer Course" />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Subtitle</label>
            <input {...register('subtitle')} className="input-field" placeholder="Brief course subtitle" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Description *</label>
            <textarea {...register('description', { required: 'Description is required' })} rows={6} className="input-field resize-none" placeholder="Describe what students will learn..." />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Category *</label>
              <select {...register('category', { required: true })} className="input-field">
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Level</label>
              <select {...register('level')} className="input-field">
                {['Beginner', 'Intermediate', 'Advanced', 'All Levels'].map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Price ($)</label>
              <input type="number" min="0" step="0.01" {...register('price', { required: true, min: 0 })} className="input-field" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Discount Price ($)</label>
              <input type="number" min="0" step="0.01" {...register('discountPrice')} className="input-field" placeholder="Optional" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('isFree')} className="accent-brand-600" />
            <span className="text-sm">This is a free course</span>
          </label>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <LoadingSpinner size="sm" className="border-white/30 border-t-white" /> : <Save className="w-4 h-4" />}
            {isEditing ? 'Save Changes' : 'Create Course'}
          </button>
        </form>
      )}

      {/* Curriculum */}
      {activeTab === 'curriculum' && (
        <div className="space-y-4">
          {!id && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 rounded-xl text-sm text-amber-700">
              Save the basic info first to add curriculum.
            </div>
          )}
          <div className="space-y-3">
            {(course?.sections || []).map((section) => (
              <div key={section._id} className="border border-border rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 p-3 bg-muted/30">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <span className="flex-1 font-medium text-sm">{section.title}</span>
                  <span className="text-xs text-muted-foreground">{section.lessons?.length || 0} lessons</span>
                  <button onClick={() => setExpandedSections((p) => ({ ...p, [section._id]: !p[section._id] }))}>
                    {expandedSections[section._id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <button onClick={() => deleteSection(section._id)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {expandedSections[section._id] && (
                  <div className="p-3 space-y-2">
                    {section.lessons?.map((lesson) => (
                      <div key={lesson._id} className="flex items-center gap-3 p-2.5 border border-border rounded-lg bg-background">
                        <Video className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="flex-1 text-sm">{lesson.title}</span>
                        {lesson.video?.url && <span className="text-xs text-green-600">✓ Video</span>}
                        <label className="cursor-pointer text-xs text-brand-600 hover:underline">
                          {uploadingVideo === lesson._id ? <LoadingSpinner size="sm" /> : 'Upload Video'}
                          <input type="file" accept="video/*" className="sr-only"
                            onChange={(e) => e.target.files[0] && uploadVideo(section._id, lesson._id, e.target.files[0])} />
                        </label>
                        <button onClick={() => deleteLesson(section._id, lesson._id)} className="text-red-400 hover:text-red-600">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => addLesson(section._id)}
                      className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:text-brand-600 hover:border-brand-300 transition-colors">
                      <Plus className="w-4 h-4" /> Add Lesson
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          {id && (
            <button onClick={addSection}
              className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-border rounded-xl text-sm text-muted-foreground hover:text-brand-600 hover:border-brand-300 transition-colors">
              <Plus className="w-4 h-4" /> Add Section
            </button>
          )}
        </div>
      )}

      {/* Media */}
      {activeTab === 'media' && (
        <div className="space-y-6 max-w-lg">
          <div>
            <label className="block text-sm font-medium mb-3">Course Thumbnail</label>
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
              {(thumbnailPreview || course?.thumbnail?.url) ? (
                <div className="relative">
                  <img src={thumbnailPreview || course.thumbnail.url} alt="" className="w-full h-48 object-cover rounded-lg mb-3" />
                  <label className="btn-primary text-sm cursor-pointer">
                    {uploadingThumbnail ? 'Uploading...' : 'Change Thumbnail'}
                    <input type="file" accept="image/*" className="sr-only" onChange={handleThumbnailUpload} disabled={!id} />
                  </label>
                </div>
              ) : (
                <label className={`flex flex-col items-center gap-3 cursor-pointer ${!id ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <Upload className="w-10 h-10 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Click to upload thumbnail (1280×720 recommended)</span>
                  <span className="btn-primary text-sm">Choose File</span>
                  <input type="file" accept="image/*" className="sr-only" onChange={handleThumbnailUpload} disabled={!id} />
                </label>
              )}
            </div>
            {!id && <p className="text-xs text-muted-foreground mt-2">Save the course first to upload media.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

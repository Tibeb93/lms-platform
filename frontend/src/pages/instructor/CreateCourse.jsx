import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { courseService } from '../../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Web Development', 'Mobile Development', 'Data Science', 'Machine Learning',
  'DevOps', 'Cloud Computing', 'Cybersecurity', 'UI/UX Design', 'Graphic Design',
  'Digital Marketing', 'Business', 'Finance', 'Photography', 'Music',
  'Health & Fitness', 'Language Learning', 'Personal Development', 'Other',
];

export default function CreateCourse() {
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { price: 0, isFree: false, level: 'All Levels', language: 'English' },
  });

  const isFree = watch('isFree');

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        price: data.isFree ? 0 : parseFloat(data.price),
        requirements: data.requirements?.split('\n').filter(Boolean) || [],
        whatYouWillLearn: data.whatYouWillLearn?.split('\n').filter(Boolean) || [],
        tags: data.tags?.split(',').map((t) => t.trim()).filter(Boolean) || [],
      };
      const { data: res } = await courseService.createCourse(payload);
      toast.success('Course created! Now add your content.');
      navigate(`/instructor/courses/${res.course._id}/builder`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create course');
    }
  };

  return (
    <div className="max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-heading font-bold mb-1">Create New Course</h1>
        <p className="text-muted-foreground mb-8">Fill in the basic details to get started</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Course Title *</label>
            <input
              {...register('title', { required: 'Title is required', maxLength: { value: 120, message: 'Max 120 characters' } })}
              placeholder="e.g. Complete React Developer Course"
              className="input-field"
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Subtitle</label>
            <input {...register('subtitle')} placeholder="Brief course subtitle" className="input-field" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Description *</label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              rows={5}
              placeholder="Describe what students will learn..."
              className="input-field resize-none"
            />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
          </div>

          {/* Category & Level */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Category *</label>
              <select {...register('category', { required: 'Category is required' })} className="input-field">
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Level</label>
              <select {...register('level')} className="input-field">
                {['Beginner', 'Intermediate', 'Advanced', 'All Levels'].map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Language</label>
            <input {...register('language')} placeholder="English" className="input-field" />
          </div>

          {/* Price */}
          <div>
            <label className="flex items-center gap-2 mb-3 cursor-pointer">
              <input type="checkbox" {...register('isFree')} className="accent-brand-600" />
              <span className="text-sm font-medium">This is a free course</span>
            </label>
            {!isFree && (
              <div>
                <label className="block text-sm font-medium mb-1.5">Price (USD) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('price', { required: !isFree && 'Price is required', min: { value: 0, message: 'Price must be positive' } })}
                  placeholder="29.99"
                  className="input-field"
                />
                {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
              </div>
            )}
          </div>

          {/* What you'll learn */}
          <div>
            <label className="block text-sm font-medium mb-1.5">What Students Will Learn</label>
            <textarea
              {...register('whatYouWillLearn')}
              rows={4}
              placeholder="One item per line..."
              className="input-field resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">Enter each learning outcome on a new line</p>
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Requirements</label>
            <textarea
              {...register('requirements')}
              rows={3}
              placeholder="One requirement per line..."
              className="input-field resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Tags</label>
            <input {...register('tags')} placeholder="react, javascript, web development" className="input-field" />
            <p className="text-xs text-muted-foreground mt-1">Comma-separated tags</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-70">
              {isSubmitting ? 'Creating...' : 'Create Course & Add Content'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Camera, Save, Lock, Bell } from 'lucide-react';
import { userService, authService } from '../../services/api';
import useAuthStore from '../../store/authStore';
import { getInitials } from '../../lib/utils';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      bio: user?.bio || '',
      headline: user?.headline || '',
      website: user?.website || '',
    },
  });

  const { register: registerPwd, handleSubmit: handlePwdSubmit, reset: resetPwd, watch } = useForm();

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const { data } = await userService.uploadAvatar(formData);
      updateUser({ avatar: data.user.avatar });
      toast.success('Profile photo updated!');
    } catch {
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const onSaveProfile = async (data) => {
    setSaving(true);
    try {
      const { data: res } = await userService.updateProfile(data);
      updateUser(res.user);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async (data) => {
    try {
      await authService.updatePassword(data);
      toast.success('Password changed!');
      resetPwd();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-heading font-bold">Profile Settings</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {['profile', 'security', 'notifications'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
              activeTab === tab ? 'border-brand-600 text-brand-600' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {user?.avatar?.url ? (
                <img src={user.avatar.url} alt="" className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                  {getInitials(user?.name)}
                </div>
              )}
              <label className="absolute bottom-0 right-0 w-7 h-7 bg-brand-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-brand-700 transition-colors">
                {uploading ? <LoadingSpinner size="sm" className="border-white/30 border-t-white" /> : <Camera className="w-3.5 h-3.5 text-white" />}
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
              </label>
            </div>
            <div>
              <p className="font-semibold">{user?.name}</p>
              <p className="text-sm text-muted-foreground capitalize">{user?.role}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Full Name</label>
                <input {...register('name', { required: true })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Headline</label>
                <input {...register('headline')} className="input-field" placeholder="e.g. Full Stack Developer" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Bio</label>
              <textarea {...register('bio')} rows={4} className="input-field resize-none" placeholder="Tell us about yourself..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Website</label>
              <input {...register('website')} className="input-field" placeholder="https://yourwebsite.com" />
            </div>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              {saving ? <LoadingSpinner size="sm" className="border-white/30 border-t-white" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </form>
        </div>
      )}

      {activeTab === 'security' && (
        <form onSubmit={handlePwdSubmit(onChangePassword)} className="space-y-4">
          <h2 className="font-semibold flex items-center gap-2"><Lock className="w-4 h-4" /> Change Password</h2>
          <div>
            <label className="block text-sm font-medium mb-1.5">Current Password</label>
            <input type="password" {...registerPwd('currentPassword', { required: true })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">New Password</label>
            <input type="password" {...registerPwd('newPassword', { required: true, minLength: 6 })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Confirm New Password</label>
            <input type="password" {...registerPwd('confirmPassword', {
              validate: (v) => v === watch('newPassword') || 'Passwords do not match'
            })} className="input-field" />
          </div>
          <button type="submit" className="btn-primary">Update Password</button>
        </form>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <h2 className="font-semibold flex items-center gap-2"><Bell className="w-4 h-4" /> Notification Preferences</h2>
          {[
            { key: 'email', label: 'Email notifications', desc: 'Receive updates via email' },
            { key: 'courseUpdates', label: 'Course updates', desc: 'Get notified when courses are updated' },
            { key: 'promotions', label: 'Promotions', desc: 'Receive promotional offers and discounts' },
          ].map((pref) => (
            <div key={pref.key} className="flex items-center justify-between p-4 border border-border rounded-xl">
              <div>
                <p className="font-medium text-sm">{pref.label}</p>
                <p className="text-xs text-muted-foreground">{pref.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={user?.notifications?.[pref.key]} className="sr-only peer" />
                <div className="w-11 h-6 bg-muted peer-checked:bg-brand-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

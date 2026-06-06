import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../services/api';
import toast from 'react-hot-toast';
import { User, Mail, MapPin, Briefcase, Save } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { getErrorMessage } from '../utils/apiErrors';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  skills: z.string().optional(),
  interests: z.string().optional(),
  careerGoal: z.string(),
});

const Profile = () => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => api.get('/auth/me').then(res => res.data),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(profileSchema),
  });

  const { setUser } = useAuthStore();

  const updateMutation = useMutation({
    mutationFn: (data) => api.patch('/profile/update', data),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries(['user']);
      setUser(updatedUser.data || updatedUser);
      toast.success('Profile updated!');
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not update profile'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete('/profile/delete'),
    onSuccess: () => {
      // clear client-side auth and cached data, then redirect to login
      toast.success('Account deleted successfully');
      useAuthStore.getState().logout();
      queryClient.clear();
      window.location.href = '/login';
    },
  });

  const streamSuggestions = useMemo(() => {
    const defaults = ['Critical Thinking', 'Communication', 'Problem Solving', 'Teamwork'];
    if (!user?.academicStream) return defaults;

    const map = {
      Engineering: ['Systems Thinking', 'Robotics', 'CAD', 'Programming'],
      Science: ['Data Analysis', 'Research Methods', 'Experimental Design', 'Scientific Writing'],
      Commerce: ['Financial Analysis', 'Market Research', 'Business Strategy', 'Excel'],
      Arts: ['Creative Writing', 'Visual Design', 'Storytelling', 'Media Production'],
      Medicine: ['Clinical Research', 'Patient Care', 'Medical Ethics', 'Diagnostics'],
      Law: ['Legal Research', 'Argumentation', 'Negotiation', 'Compliance'],
      Management: ['Leadership', 'Project Management', 'Operations', 'Strategic Planning'],
      IT: ['Cybersecurity', 'Cloud Computing', 'DevOps', 'Software Architecture'],
    };

    return map[user.academicStream] || defaults;
  }, [user?.academicStream]);

  const onSubmit = (data) => {
    const formattedData = {
      ...data,
      skills: data.skills
        ? data.skills.split(',').map((skill) => skill.trim()).filter(Boolean)
        : [],
      interests: data.interests
        ? data.interests.split(',').map((interest) => interest.trim()).filter(Boolean)
        : [],
    };
    updateMutation.mutate(formattedData);
  };

  const handleEdit = () => {
    reset({
      ...user,
      skills: user.skills?.join(', ') || '',
      interests: user.interests?.join(', ') || '',
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Profile
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your profile information.
        </p>
      </div>

      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-primary-600">
                {user.name.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
              {user.badges?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {user.badges.map((badge, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-200"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="btn-primary flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  {...register('name')}
                  defaultValue={user.name}
                  className="input-field"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  {...register('email')}
                  defaultValue={user.email}
                  className="input-field"
                  disabled
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Skills
              </label>
              <input
                {...register('skills')}
                defaultValue={user.skills?.join(', ')}
                className="input-field"
                placeholder="Enter skills separated by commas"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Interests
              </label>
              <input
                {...register('interests')}
                defaultValue={user.interests?.join(', ')}
                className="input-field"
                placeholder="Enter interests separated by commas"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Career Goal
              </label>
              <textarea
                {...register('careerGoal')}
                defaultValue={user.careerGoal}
                className="input-field"
                rows={3}
                placeholder="Describe your career goal"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={updateMutation.isLoading}
                className="btn-primary"
              >
                {updateMutation.isLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                  <p className="text-gray-900 dark:text-white">{user.name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                  <p className="text-gray-900 dark:text-white">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Briefcase className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Academic Stream</p>
                  <p className="text-gray-900 dark:text-white">{user.academicStream || 'Not set'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Education</p>
                  <p className="text-gray-900 dark:text-white">{user.currentEducation || 'Not set'}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {user.skills?.length > 0 ? (
                  user.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No skills added yet</p>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Interests</p>
              <div className="flex flex-wrap gap-2">
                {user.interests?.length > 0 ? (
                  user.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No interests added yet</p>
                )}
              </div>
            </div>

            {user.careerGoal && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Career Goal</p>
                <p className="text-gray-900 dark:text-white">{user.careerGoal}</p>
              </div>
            )}

            {user?.academicStream && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Recommended skills for {user.academicStream}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Add these to your profile to improve your recommendations and course matches.
                </p>
                <div className="flex flex-wrap gap-2">
                  {streamSuggestions.map((suggestion) => (
                    <span
                      key={suggestion}
                      className="px-3 py-1 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-200 text-xs"
                    >
                      {suggestion}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card border border-red-200 dark:border-red-800">
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
          Danger Zone
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
              deleteMutation.mutate();
            }
          }}
          disabled={deleteMutation.isLoading}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {deleteMutation.isLoading ? 'Deleting...' : 'Delete Account'}
        </button>
      </div>
    </div>
  );
};

export default Profile;

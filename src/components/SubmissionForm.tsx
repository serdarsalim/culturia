'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { getCountryName, getCountryFlag } from '@/lib/countries';
import { extractYouTubeVideoId, isValidYouTubeUrl } from '@/lib/youtube';
import { CATEGORY_LABELS, type VideoCategory } from '@/types';

interface SubmissionFormProps {
  countryCode: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SubmissionForm({ countryCode, onClose, onSuccess }: SubmissionFormProps) {
  const [category, setCategory] = useState<VideoCategory>('inspiration');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingSubmission, setExistingSubmission] = useState<any>(null);
  const [isEdit, setIsEdit] = useState(false);

  // Check if user has already submitted for this category
  useEffect(() => {
    async function checkExisting() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('video_submissions')
        .select('*')
        .eq('user_id', user.id)
        .eq('country_code', countryCode)
        .eq('category', category)
        .single();

      if (data) {
        setExistingSubmission(data);
        setYoutubeUrl(data.youtube_url);
        setTitle(data.title || '');
        setIsEdit(true);
      } else {
        setExistingSubmission(null);
        setYoutubeUrl('');
        setTitle('');
        setIsEdit(false);
      }
    }

    checkExisting();
  }, [category, countryCode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Validate YouTube URL
    if (!isValidYouTubeUrl(youtubeUrl)) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    const videoId = extractYouTubeVideoId(youtubeUrl);
    if (!videoId) {
      setError('Could not extract video ID from URL');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('You must be logged in to submit videos');
        return;
      }

      // Check for duplicates (same video ID in same country/category)
      const { data: duplicate } = await supabase
        .from('video_submissions')
        .select('id')
        .eq('youtube_video_id', videoId)
        .eq('country_code', countryCode)
        .eq('category', category)
        .neq('user_id', user.id)
        .single();

      if (duplicate) {
        setError('This video has already been submitted for this category');
        return;
      }

      if (isEdit && existingSubmission) {
        // Update existing submission
        const { error: updateError } = await supabase
          .from('video_submissions')
          .update({
            youtube_url: youtubeUrl,
            youtube_video_id: videoId,
            title,
            status: 'pending', // Reset to pending when edited
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingSubmission.id);

        if (updateError) throw updateError;
      } else {
        // Create new submission
        const { error: insertError } = await supabase
          .from('video_submissions')
          .insert({
            country_code: countryCode,
            category,
            youtube_url: youtubeUrl,
            youtube_video_id: videoId,
            title,
            user_id: user.id,
            user_email: user.email!,
            status: 'pending',
          });

        if (insertError) throw insertError;
      }

      onSuccess();
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.message || 'Failed to submit video');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">{getCountryFlag(countryCode)}</span>
            <h2 className="text-2xl font-bold text-gray-900">{getCountryName(countryCode)}</h2>
          </div>
          <p className="text-gray-600">
            {isEdit ? 'Update your video submission' : 'Submit a video to share'}
          </p>
        </div>

        {/* Guidelines */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Submission Guidelines</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Videos should have <strong>1 million+ views</strong></li>
            <li>• Videos should have <strong>English subtitles</strong> available</li>
            <li>• Only YouTube links are accepted</li>
            <li>• Content should be culturally authentic and appropriate</li>
            <li>• You can submit one video per category per country</li>
          </ul>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Selection */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as VideoCategory)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {(Object.entries(CATEGORY_LABELS) as [VideoCategory, string][]).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Existing Submission Notice */}
          {existingSubmission && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> You already submitted a video for this category.
                {existingSubmission.status === 'pending' && ' (Status: Pending approval)'}
                {existingSubmission.status === 'approved' && ' (Status: Approved)'}
                {existingSubmission.status === 'rejected' && ' (Status: Rejected)'}
              </p>
            </div>
          )}

          {/* YouTube URL */}
          <div>
            <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-700 mb-1">
              YouTube URL
            </label>
            <input
              id="youtubeUrl"
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Supported formats: youtube.com/watch?v=..., youtu.be/...
            </p>
          </div>

          {/* Optional Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Video Title (Optional)
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of the video"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : isEdit ? 'Update Submission' : 'Submit for Review'}
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-500 text-center">
          Your submission will be reviewed by our team before appearing on the site
        </p>
      </div>
    </div>
  );
}

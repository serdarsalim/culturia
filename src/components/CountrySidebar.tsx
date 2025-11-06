'use client';

import { useState, useEffect } from 'react';
import { getCountryByCode } from '@/lib/countries';
import { CATEGORY_LABELS, type VideoCategory, type VideoSubmission } from '@/types';
import { supabase } from '@/lib/supabase/client';

interface CountrySidebarProps {
  countryCode: string;
  onClose: () => void;
  onVideoSelect: (video: VideoSubmission, category: VideoCategory) => void;
  onSubmitClick: () => void;
}

export default function CountrySidebar({
  countryCode,
  onClose,
  onVideoSelect,
  onSubmitClick,
}: CountrySidebarProps) {
  const country = getCountryByCode(countryCode);
  const [videoCounts, setVideoCounts] = useState<Record<VideoCategory, number>>({
    inspiration: 0,
    music: 0,
    comedy: 0,
    cooking: 0,
    street_voices: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVideoCounts() {
      try {
        setLoading(true);
        const categories: VideoCategory[] = ['inspiration', 'music', 'comedy', 'cooking', 'street_voices'];

        const counts: Record<VideoCategory, number> = {
          inspiration: 0,
          music: 0,
          comedy: 0,
          cooking: 0,
          street_voices: 0,
        };

        for (const category of categories) {
          const { count, error } = await supabase
            .from('video_submissions')
            .select('*', { count: 'exact', head: true })
            .eq('country_code', countryCode)
            .eq('category', category)
            .eq('status', 'approved');

          if (!error && count !== null) {
            counts[category] = count;
          }
        }

        setVideoCounts(counts);
      } catch (error) {
        console.error('Error fetching video counts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchVideoCounts();
  }, [countryCode]);

  async function handleCategoryClick(category: VideoCategory) {
    try {
      // Fetch random approved video for this category
      const { data, error } = await supabase
        .from('video_submissions')
        .select('*')
        .eq('country_code', countryCode)
        .eq('category', category)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching videos:', error);
        return;
      }

      if (data && data.length > 0) {
        // Pick random video from latest 10
        const randomVideo = data[Math.floor(Math.random() * data.length)];
        onVideoSelect(randomVideo, category);
      }
    } catch (error) {
      console.error('Error fetching video:', error);
    }
  }

  if (!country) return null;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{country.flag}</span>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{country.name}</h2>
            <p className="text-sm text-gray-500">
              {country.languages.slice(0, 2).join(', ')}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
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
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-3">
          {(Object.entries(CATEGORY_LABELS) as [VideoCategory, string][]).map(([category, label]) => {
            const count = videoCounts[category];
            const hasVideos = count > 0;

            return (
              <button
                key={category}
                onClick={() => hasVideos && handleCategoryClick(category)}
                disabled={!hasVideos || loading}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  hasVideos
                    ? 'border-blue-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">{label}</span>
                  {loading ? (
                    <span className="text-sm text-gray-400">Loading...</span>
                  ) : hasVideos ? (
                    <span className="text-sm text-blue-600">{count} video{count !== 1 ? 's' : ''}</span>
                  ) : (
                    <span className="text-sm text-gray-400">No videos yet</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Submit Button */}
        <button
          onClick={onSubmitClick}
          className="w-full mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Submit Videos
        </button>

        {/* Info Text */}
        <p className="mt-4 text-sm text-gray-500 text-center">
          Help build our cultural library by submitting videos
        </p>
      </div>
    </div>
  );
}

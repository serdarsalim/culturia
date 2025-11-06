'use client';

import { useEffect, useState, useRef } from 'react';
import YouTube, { YouTubePlayer, YouTubeEvent } from 'react-youtube';
import { supabase } from '@/lib/supabase/client';
import { type VideoSubmission, type VideoCategory, CATEGORY_LABELS } from '@/types';
import { getCountryName, getCountryFlag } from '@/lib/countries';

interface VideoPlayerProps {
  video: VideoSubmission;
  category: VideoCategory;
  onClose: () => void;
  onNext: () => void;
}

export default function VideoPlayer({ video, category, onClose, onNext }: VideoPlayerProps) {
  const [showFlagButton, setShowFlagButton] = useState(false);
  const [flagging, setFlagging] = useState(false);
  const [flagged, setFlagged] = useState(false);
  const playerRef = useRef<YouTubePlayer | null>(null);

  // Check if user has already flagged this video
  useEffect(() => {
    async function checkFlagged() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('video_flags')
        .select('id')
        .eq('submission_id', video.id)
        .eq('user_id', user.id)
        .single();

      setFlagged(!!data);
    }

    checkFlagged();
  }, [video.id]);

  async function handleFlag(reason: 'broken' | 'wrong_category' | 'inappropriate' | 'other') {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please log in to flag videos');
      return;
    }

    setFlagging(true);
    try {
      const { error } = await supabase.from('video_flags').insert({
        submission_id: video.id,
        user_id: user.id,
        reason,
      });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          alert('You have already flagged this video');
        } else {
          throw error;
        }
      } else {
        setFlagged(true);
        setShowFlagButton(false);
        alert('Thank you for reporting this video. Our team will review it.');
      }
    } catch (error) {
      console.error('Error flagging video:', error);
      alert('Failed to flag video. Please try again.');
    } finally {
      setFlagging(false);
    }
  }

  function onPlayerReady(event: YouTubeEvent) {
    playerRef.current = event.target;
  }

  async function onPlayerEnd() {
    // Auto-play next video when current one ends
    onNext();
  }

  const opts = {
    width: '100%',
    height: '100%',
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      rel: 0,
    },
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Video Container */}
        <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
          <YouTube
            videoId={video.youtube_video_id}
            opts={opts}
            onReady={onPlayerReady}
            onEnd={onPlayerEnd}
            className="absolute inset-0 w-full h-full"
          />
        </div>

        {/* Controls */}
        <div className="mt-4 flex items-start justify-between gap-4">
          <div className="flex-1 text-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{getCountryFlag(video.country_code)}</span>
              <span className="font-semibold">{getCountryName(video.country_code)}</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-300">{CATEGORY_LABELS[category]}</span>
            </div>
            {video.title && (
              <p className="text-sm text-gray-300">{video.title}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Flag Button */}
            <div className="relative">
              {!flagged ? (
                <>
                  <button
                    onClick={() => setShowFlagButton(!showFlagButton)}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    Report Issue
                  </button>

                  {showFlagButton && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl overflow-hidden z-10">
                      <button
                        onClick={() => handleFlag('broken')}
                        disabled={flagging}
                        className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 transition-colors text-gray-900"
                      >
                        Video is broken
                      </button>
                      <button
                        onClick={() => handleFlag('wrong_category')}
                        disabled={flagging}
                        className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 transition-colors text-gray-900"
                      >
                        Wrong category
                      </button>
                      <button
                        onClick={() => handleFlag('inappropriate')}
                        disabled={flagging}
                        className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 transition-colors text-gray-900"
                      >
                        Inappropriate
                      </button>
                      <button
                        onClick={() => handleFlag('other')}
                        disabled={flagging}
                        className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 transition-colors text-gray-900"
                      >
                        Other issue
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <span className="px-4 py-2 text-sm text-gray-400">Reported</span>
              )}
            </div>

            {/* Next Button */}
            <button
              onClick={onNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Next
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 60,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{ width: '100%', maxWidth: '1024px' }}>
        {/* Video Container */}
        <div style={{
          position: 'relative',
          backgroundColor: '#000000',
          borderRadius: '8px',
          overflow: 'hidden',
          aspectRatio: '16/9'
        }}>
          <YouTube
            videoId={video.youtube_video_id}
            opts={opts}
            onReady={onPlayerReady}
            onEnd={onPlayerEnd}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%'
            }}
          />
        </div>

        {/* Controls */}
        <div style={{
          marginTop: '16px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <div style={{ flex: 1, color: '#ffffff' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '24px' }}>{getCountryFlag(video.country_code)}</span>
              <span style={{ fontWeight: '600' }}>{getCountryName(video.country_code)}</span>
              <span style={{ color: '#9ca3af' }}>•</span>
              <span style={{ color: '#d1d5db' }}>{CATEGORY_LABELS[category]}</span>
            </div>
            {video.title && (
              <p style={{ fontSize: '14px', color: '#d1d5db' }}>{video.title}</p>
            )}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            {/* Flag Button */}
            <div style={{ position: 'relative' }}>
              {!flagged ? (
                <>
                  <button
                    onClick={() => setShowFlagButton(!showFlagButton)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#374151',
                      color: '#ffffff',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                  >
                    Report Issue
                  </button>

                  {showFlagButton && (
                    <div style={{
                      position: 'absolute',
                      right: 0,
                      marginTop: '8px',
                      width: '224px',
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                      overflow: 'hidden',
                      zIndex: 10
                    }}>
                      <button
                        onClick={() => handleFlag('broken')}
                        disabled={flagging}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          textAlign: 'left',
                          fontSize: '14px',
                          border: 'none',
                          backgroundColor: '#ffffff',
                          color: '#111827',
                          cursor: flagging ? 'not-allowed' : 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => !flagging && (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                      >
                        Video is broken
                      </button>
                      <button
                        onClick={() => handleFlag('wrong_category')}
                        disabled={flagging}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          textAlign: 'left',
                          fontSize: '14px',
                          border: 'none',
                          backgroundColor: '#ffffff',
                          color: '#111827',
                          cursor: flagging ? 'not-allowed' : 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => !flagging && (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                      >
                        Wrong category
                      </button>
                      <button
                        onClick={() => handleFlag('inappropriate')}
                        disabled={flagging}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          textAlign: 'left',
                          fontSize: '14px',
                          border: 'none',
                          backgroundColor: '#ffffff',
                          color: '#111827',
                          cursor: flagging ? 'not-allowed' : 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => !flagging && (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                      >
                        Inappropriate
                      </button>
                      <button
                        onClick={() => handleFlag('other')}
                        disabled={flagging}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          textAlign: 'left',
                          fontSize: '14px',
                          border: 'none',
                          backgroundColor: '#ffffff',
                          color: '#111827',
                          cursor: flagging ? 'not-allowed' : 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => !flagging && (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                      >
                        Other issue
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <span style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  color: '#9ca3af'
                }}>Reported</span>
              )}
            </div>

            {/* Next Button */}
            <button
              onClick={onNext}
              style={{
                padding: '8px 24px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
            >
              Next
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                backgroundColor: '#374151',
                color: '#ffffff',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#374151'}
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                style={{ height: '20px', width: '20px' }}
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

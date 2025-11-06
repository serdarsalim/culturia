'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import WorldMap from '@/components/WorldMap';
import CountrySidebar from '@/components/CountrySidebar';
import VideoPlayer from '@/components/VideoPlayer';
import AuthModal from '@/components/AuthModal';
import SubmissionForm from '@/components/SubmissionForm';
import type { VideoSubmission, VideoCategory } from '@/types';

export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [currentVideo, setCurrentVideo] = useState<{ video: VideoSubmission; category: VideoCategory } | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);

  // Check authentication
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  function handleCountryClick(countryCode: string) {
    console.log('handleCountryClick called with:', countryCode);
    setSelectedCountry(countryCode);
    setCurrentVideo(null);
    console.log('Country selected:', countryCode);
  }

  function handleCloseSidebar() {
    setSelectedCountry(null);
    setCurrentVideo(null);
  }

  function handleVideoSelect(video: VideoSubmission, category: VideoCategory) {
    setCurrentVideo({ video, category });
  }

  function handleCloseVideo() {
    setCurrentVideo(null);
  }

  async function handleNextVideo() {
    if (!currentVideo) return;

    try {
      // Fetch another random video from same category and country
      const { data, error } = await supabase
        .from('video_submissions')
        .select('*')
        .eq('country_code', currentVideo.video.country_code)
        .eq('category', currentVideo.category)
        .eq('status', 'approved')
        .neq('id', currentVideo.video.id) // Exclude current video
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching next video:', error);
        return;
      }

      if (data && data.length > 0) {
        const randomVideo = data[Math.floor(Math.random() * data.length)];
        setCurrentVideo({ video: randomVideo, category: currentVideo.category });
      } else {
        alert('No more videos available in this category');
      }
    } catch (error) {
      console.error('Error fetching next video:', error);
    }
  }

  function handleSubmitClick() {
    // Allow submissions without login
    setShowSubmissionForm(true);
  }

  function handleAuthSuccess() {
    setShowAuthModal(false);
    // Keep submission form open if it was already open
    // User can now click submit again after logging in
  }

  function handleSubmissionSuccess() {
    setShowSubmissionForm(false);
    alert('Thank you! Your submission will be reviewed by our team.');
  }

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar - always visible on the left */}
      <div className="w-80 h-full shadow-2xl flex-shrink-0 overflow-y-auto" style={{ backgroundColor: '#f3f4f6', color: '#000000' }}>
        {selectedCountry ? (
          <CountrySidebar
            countryCode={selectedCountry}
            onClose={handleCloseSidebar}
            onVideoSelect={handleVideoSelect}
            onSubmitClick={handleSubmitClick}
          />
        ) : (
          <div className="h-full flex flex-col justify-center" style={{ padding: '48px 32px' }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '600',
              color: '#000000',
              marginBottom: '12px',
              letterSpacing: '-0.02em'
            }}>
              🌍 CULTURIA
            </h1>
            <p style={{
              fontSize: '15px',
              color: '#4b5563',
              marginBottom: '32px',
              lineHeight: '1.6',
              maxWidth: '100%'
            }}>
              Discover authentic cultural content from around the world
            </p>
            <div>
              <p style={{
                fontSize: '13px',
                fontWeight: '500',
                color: '#6b7280',
                marginBottom: '16px'
              }}>
                Click on any country to explore
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#000000' }}>
                  <span style={{ fontSize: '20px' }}>💡</span> Inspiration
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#000000' }}>
                  <span style={{ fontSize: '20px' }}>🎵</span> Music
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#000000' }}>
                  <span style={{ fontSize: '20px' }}>😄</span> Comedy
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#000000' }}>
                  <span style={{ fontSize: '20px' }}>🍳</span> Cooking
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#000000' }}>
                  <span style={{ fontSize: '20px' }}>🎤</span> Street Voices
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map Container - takes remaining space */}
      <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900">
        <WorldMap
          onCountryClick={handleCountryClick}
          selectedCountry={selectedCountry}
          onBackgroundClick={handleCloseSidebar}
        />
      </div>

      {/* Video Player Overlay */}
      {currentVideo && (
        <VideoPlayer
          video={currentVideo.video}
          category={currentVideo.category}
          onClose={handleCloseVideo}
          onNext={handleNextVideo}
        />
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* Submission Form */}
      {showSubmissionForm && selectedCountry && (
        <SubmissionForm
          countryCode={selectedCountry}
          onClose={() => setShowSubmissionForm(false)}
          onSuccess={handleSubmissionSuccess}
          onAuthRequired={() => setShowAuthModal(true)}
        />
      )}
    </div>
  );
}

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    setSelectedCountry(countryCode);
    setSidebarOpen(true);
    setCurrentVideo(null);
  }

  function handleCloseSidebar() {
    setSelectedCountry(null);
    setSidebarOpen(false);
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
    if (!user) {
      setShowAuthModal(true);
    } else {
      setShowSubmissionForm(true);
    }
  }

  function handleAuthSuccess() {
    setShowAuthModal(false);
    setShowSubmissionForm(true);
  }

  function handleSubmissionSuccess() {
    setShowSubmissionForm(false);
    alert('Thank you! Your submission will be reviewed by our team.');
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xl font-bold">C</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">CULTURIA</h1>
        </div>

        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-gray-600">{user.email}</span>
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
            >
              Sign In
            </button>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map Container */}
        <div className={`transition-all duration-300 ${sidebarOpen ? 'w-3/5' : 'w-full'} lg:${sidebarOpen ? 'w-3/5' : 'w-full'}`}>
          <WorldMap onCountryClick={handleCountryClick} selectedCountry={selectedCountry} />
        </div>

        {/* Sidebar */}
        {sidebarOpen && selectedCountry && (
          <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-2/5 border-l border-gray-200">
              <CountrySidebar
                countryCode={selectedCountry}
                onClose={handleCloseSidebar}
                onVideoSelect={handleVideoSelect}
                onSubmitClick={handleSubmitClick}
              />
            </div>

            {/* Mobile Bottom Sheet */}
            <div className="lg:hidden fixed inset-x-0 bottom-0 h-1/2 bg-white shadow-2xl z-40 overflow-hidden">
              <CountrySidebar
                countryCode={selectedCountry}
                onClose={handleCloseSidebar}
                onVideoSelect={handleVideoSelect}
                onSubmitClick={handleSubmitClick}
              />
            </div>
          </>
        )}
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
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-6 py-3 text-center text-sm text-gray-600 z-10">
        <p>
          © {new Date().getFullYear()} CULTURIA • Discover authentic cultural content from around the world
          {' • '}
          <a href="/terms" className="text-blue-600 hover:text-blue-700">Terms of Service</a>
        </p>
      </footer>
    </div>
  );
}

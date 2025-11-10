'use client';

import { VISIBLE_CATEGORIES, type VideoCategory } from '@/types';

const CATEGORY_DETAILS: Record<VideoCategory, {
  title: string;
  tagline: string;
  points: string[];
  icon: string;
}> = {
  inspiration: {
    title: 'Inspiration',
    icon: '💡',
    tagline: 'Short pieces that lift you up straight from the street.',
    points: [
      'Real people, real moments',
      'Native-language narration',
      'Local perspectives, not studio gloss',
    ],
  },
  music: {
    title: 'Music',
    icon: '🎵',
    tagline: 'Live sessions, buskers, and raw local talent.',
    points: [
      'One-take performances',
      'Local genres old & new',
      'Lyrics in the language of home',
    ],
  },
  comedy: {
    title: 'Comedy',
    icon: '😄',
    tagline: 'Street humor, sketches, and cultural riffs.',
    points: [
      'Punchlines in the native language',
      'Quick bits & micro-sketches',
      'Local references you won’t get elsewhere',
    ],
  },
  cooking: {
    title: 'Food',
    icon: '🍳',
    tagline: 'Home kitchens and street food classics, unfiltered.',
    points: [
      'Native-language walkthroughs',
      'Regional staples & snacks',
      'Real prep, real tools',
    ],
  },
  street_voices: {
    title: 'Talks',
    icon: '🎤',
    tagline: 'Candid conversations and micro-docs shot on the street.',
    points: [
      'Interviews & quick takes',
      'Native-language voices',
      'Unfiltered views of daily life',
    ],
  },
};

interface CategoryInfoCardProps {
  activeCategory: VideoCategory;
  onChangeCategory: (category: VideoCategory) => void;
  onClose: () => void;
}

export default function CategoryInfoCard({ activeCategory, onChangeCategory, onClose }: CategoryInfoCardProps) {
  const details = CATEGORY_DETAILS[activeCategory];
  const categoryEntries = VISIBLE_CATEGORIES.map(category => [category, CATEGORY_DETAILS[category]] as [VideoCategory, typeof details]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 150,
        backgroundColor: 'rgba(3, 7, 18, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          background: '#f8fafc',
          borderRadius: '20px',
          padding: '8px 20px 26px',
          boxShadow: '0 30px 60px rgba(15, 23, 42, 0.25)',
          border: '1px solid rgba(148, 163, 184, 0.4)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '9999px',
              border: '1px solid rgba(148, 163, 184, 0.5)',
              background: '#ffffff',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '0 6px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', maxWidth: '520px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px' }}>
            <span style={{ fontSize: '28px' }}>{details.icon}</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>{details.title}</h3>
              <p style={{ margin: 0, fontSize: '15px', color: '#475569' }}>{details.tagline}</p>
            </div>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 0 0', paddingLeft: '44px' }}>
            {details.points.map((point) => (
              <li key={point} style={{ fontSize: '15px', color: '#1e293b', marginBottom: '10px' }}>
                • {point}
              </li>
            ))}
          </ul>
          </div>
        </div>

        <div style={{
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(148, 163, 184, 0.35)',
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {categoryEntries.map(([category, info]) => {
            const isActive = category === activeCategory;
            return (
              <button
                key={category}
                onClick={() => onChangeCategory(category)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  border: isActive ? '1px solid rgba(249, 115, 22, 0.6)' : '1px solid rgba(148, 163, 184, 0.4)',
                  background: isActive ? 'linear-gradient(120deg, #f97316, #fb923c)' : '#ffffff',
                  color: isActive ? '#ffffff' : '#0f172a',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {info.icon} {info.title}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

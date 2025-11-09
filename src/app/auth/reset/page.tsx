'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

type Stage = 'loading' | 'form' | 'success' | 'error';

export default function PasswordResetPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('loading');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function initSession() {
      const hash = window.location.hash;
      const { data: session, error } = await supabase.auth.getSession();

      // If we already have a session (maybe user clicked Home) just show the form
      if (!hash && session?.session) {
        setStage('form');
        return;
      }

      const params = new URLSearchParams(hash.replace('#', ''));
      const type = params.get('type');
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const expiresIn = params.get('expires_in');

      if (type !== 'recovery' || !accessToken || !refreshToken) {
        setError('This reset link is invalid or has expired.');
        setStage('error');
        return;
      }

      const expiresInSeconds = expiresIn ? Number(expiresIn) : 0;
      const expiresAt = expiresInSeconds ? Math.floor(Date.now() / 1000) + expiresInSeconds : undefined;

      const { error: setSessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: expiresInSeconds,
        expires_at: expiresAt,
        token_type: 'bearer',
      });

      if (setSessionError) {
        setError(setSessionError.message || 'Could not verify reset link.');
        setStage('error');
      } else {
        setStage('form');
      }
    }

    initSession();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setInfo('Password updated. You are now signed in.');
      setStage('success');
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update password.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a, #1f2937)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: '#ffffff',
        borderRadius: '18px',
        padding: '32px',
        boxShadow: '0 30px 60px rgba(15, 23, 42, 0.35)'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 700,
          marginBottom: '8px',
          color: '#0f172a'
        }}>
          Reset your password
        </h1>
        <p style={{ color: '#475569', marginBottom: '24px' }}>
          {stage === 'loading' && 'Verifying your reset link…'}
          {stage === 'form' && 'Choose a new password to finish resetting your account.'}
          {stage === 'success' && info}
          {stage === 'error' && error}
        </p>

        {stage === 'form' && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', color: '#0f172a' }}>
                New password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  fontSize: '15px'
                }}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', color: '#0f172a' }}>
                Confirm password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  fontSize: '15px'
                }}
                placeholder="Re-enter password"
              />
            </div>

            {error && (
              <div style={{ padding: '12px', borderRadius: '10px', background: '#fee2e2', color: '#991b1b' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                fontWeight: 600,
                fontSize: '15px',
                color: '#fff',
                background: submitting ? '#94a3b8' : '#f97316',
                cursor: submitting ? 'not-allowed' : 'pointer'
              }}
            >
              {submitting ? 'Updating…' : 'Update password'}
            </button>
          </form>
        )}

        {stage === 'success' && (
          <div style={{ color: '#16a34a', fontWeight: 600 }}>
            {info}
          </div>
        )}

        {stage === 'error' && (
          <button
            onClick={() => router.push('/')}
            style={{
              marginTop: '12px',
              padding: '10px 16px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Go back home
          </button>
        )}
      </div>
    </div>
  );
}

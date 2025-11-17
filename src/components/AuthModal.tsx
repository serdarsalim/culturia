'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useGoogleLogin } from '@react-oauth/google';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
  initialMode?: 'login' | 'signup';
}

export default function AuthModal({ onClose, onSuccess, initialMode = 'signup' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showResetView, setShowResetView] = useState(false);

  // Google OAuth linking state
  const [linkingGoogle, setLinkingGoogle] = useState<{ email: string; sub: string; name?: string; picture?: string } | null>(null);
  const [linkPassword, setLinkPassword] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === 'login' && showResetView) {
      return; // handled via reset buttons
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'signup' && password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        setMessage('Account created successfully!');
        setTimeout(() => {
          onSuccess();
        }, 1000);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setMessage('Logged in successfully!');
        setTimeout(() => {
          onSuccess();
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      if (!tokenResponse.access_token) {
        setError('No access token received from Google');
        return;
      }

      setLoading(true);
      setError('');
      setMessage('');

      try {
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });

        if (!userInfoResponse.ok) {
          throw new Error('Unable to fetch Google profile');
        }

        const userInfo = await userInfoResponse.json();
        const googleSub = userInfo.sub;
        const googlePassword = `google_${googleSub}`;

        let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: userInfo.email,
          password: googlePassword,
        });

        if (signInError) {
          const { error: signUpError } = await supabase.auth.signUp({
            email: userInfo.email,
            password: googlePassword,
          });

          if (signUpError) {
            if (signUpError.message?.includes('already registered')) {
              setLinkingGoogle({
                email: userInfo.email,
                sub: googleSub,
                name: userInfo.name,
                picture: userInfo.picture,
              });
              setMessage('Enter your password to link this Google account.');
              setLoading(false);
              return;
            }

            throw signUpError;
          }

          const { data: signedInUser, error: newSignInError } = await supabase.auth.signInWithPassword({
            email: userInfo.email,
            password: googlePassword,
          });

          if (newSignInError) throw newSignInError;

          if (signedInUser.user) {
            await supabase.from('google_account_links').insert({
              user_id: signedInUser.user.id,
              google_id: googleSub,
              google_email: userInfo.email,
              google_name: userInfo.name,
              google_picture_url: userInfo.picture,
            });
          }
        } else if (signInData?.user) {
          const { data: existingLink } = await supabase
            .from('google_account_links')
            .select('id')
            .eq('user_id', signInData.user.id)
            .eq('google_id', googleSub)
            .maybeSingle();

          if (!existingLink) {
            await supabase.from('google_account_links').insert({
              user_id: signInData.user.id,
              google_id: googleSub,
              google_email: userInfo.email,
              google_name: userInfo.name,
              google_picture_url: userInfo.picture,
            });
          }
        }

        setMessage('Signed in with Google! Redirecting…');
        setTimeout(() => {
          onSuccess();
        }, 1000);
      } catch (err: any) {
        console.error('Google sign-in error:', err);
        setError(err.message || 'Failed to sign in with Google');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Failed to sign in with Google');
    },
  });

  async function handleLinkGoogleAccount() {
    if (!linkingGoogle) return;

    if (!linkPassword) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: linkingGoogle.email,
        password: linkPassword,
      });

      if (signInError) {
        setError('Incorrect password. Please try again.');
        setLoading(false);
        return;
      }

      const googlePassword = `google_${linkingGoogle.sub}`;

      const { error: updateError } = await supabase.auth.updateUser({
        password: googlePassword,
      });

      if (updateError) throw updateError;

      if (signInData?.user) {
        await supabase.from('google_account_links').insert({
          user_id: signInData.user.id,
          google_id: linkingGoogle.sub,
          google_email: linkingGoogle.email,
          google_name: linkingGoogle.name,
          google_picture_url: linkingGoogle.picture,
        });
      }

      setMessage('Google account linked! You can now sign in with Google.');
      setLinkingGoogle(null);
      setLinkPassword('');
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (err: any) {
      console.error('Account linking error:', err);
      setError(err.message || 'Failed to link account');
    } finally {
      setLoading(false);
    }
  }

  function cancelLinking() {
    setLinkingGoogle(null);
    setLinkPassword('');
    setError('');
    setMessage('');
  }

  async function handlePasswordResetRequest() {
    if (!email) {
      setError('Enter your email first so we can send the reset link.');
      return;
    }

    setResetLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset`,
      });

      if (error) throw error;

      setMessage('Password reset link sent. Check your email.');
    } catch (err: any) {
      setError(err.message || 'Unable to send reset email right now');
    } finally {
      setResetLoading(false);
    }
  }

  // If in linking mode, show linking UI
  if (linkingGoogle) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 70,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }} onClick={cancelLinking}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          maxWidth: '480px',
          width: '100%',
          padding: '32px',
          position: 'relative',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }} onClick={(e) => e.stopPropagation()}>

          {/* Close Button */}
          <button
            onClick={cancelLinking}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b7280',
              cursor: 'pointer',
              border: 'none',
              backgroundColor: '#f3f4f6',
              borderRadius: '50%',
              transition: 'all 0.2s'
            }}
          >
            ✕
          </button>

          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#000000',
            marginBottom: '16px',
          }}>
            Link Google Account
          </h2>

          <p style={{
            fontSize: '15px',
            color: '#6b7280',
            marginBottom: '24px',
            lineHeight: '1.6'
          }}>
            An account with <strong>{linkingGoogle.email}</strong> already exists. Enter your password to link your Google account.
          </p>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Password
            </label>
            <input
              type="password"
              value={linkPassword}
              onChange={(e) => setLinkPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '12px 16px',
              fontSize: '15px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: '#f3f4f6',
              color: '#000000',
              outline: 'none'
            }}
            onKeyDown={(e) => {
                if (e.key === 'Enter') handleLinkGoogleAccount();
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: '16px',
              backgroundColor: '#fee2e2',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <p style={{ fontSize: '14px', color: '#991b1b' }}>{error}</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={cancelLinking}
              style={{
                flex: 1,
                padding: '14px 24px',
                fontSize: '15px',
                fontWeight: '600',
                color: '#6b7280',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
              onClick={handleLinkGoogleAccount}
              disabled={loading}
              style={{
                flex: 1,
                padding: '14px 24px',
                fontSize: '15px',
                fontWeight: '600',
                color: '#ffffff',
                backgroundColor: loading ? '#9ca3af' : '#f97316',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Linking...' : 'Link Account'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 70,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        maxWidth: '480px',
        width: '100%',
        padding: '32px',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }} onClick={(e) => e.stopPropagation()}>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6b7280',
            cursor: 'pointer',
            border: 'none',
            backgroundColor: '#f3f4f6',
            borderRadius: '50%',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e5e7eb';
            e.currentTarget.style.color = '#000000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
            e.currentTarget.style.color = '#6b7280';
          }}
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header */}
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#000000',
          marginBottom: '24px',
          letterSpacing: '-0.02em'
        }}>
          {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
        </h2>

        {/* Google Sign-In Button */}
        <div style={{ marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => handleGoogleLogin()}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 24px',
              fontSize: '15px',
              fontWeight: '600',
              color: '#374151',
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#EA4335" d="M17.64 9.2045c0-.6395-.0573-1.2523-.1636-1.8409H9v3.4818h4.8436c-.2086 1.125-.8432 2.0796-1.7996 2.7177v2.2637h2.9155c1.7073-1.5737 2.6805-3.894 2.6805-6.6223z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.4686-.806 5.9582-2.1732l-2.9155-2.2637c-.8086.54-1.8409.8619-3.0427.8619-2.3405 0-4.3223-1.577-5.0295-3.7068H.9573v2.3318C2.4382 15.7723 5.4818 18 9 18z" />
              <path fill="#4285F4" d="M3.9705 10.7182C3.7855 10.1782 3.6818 9.6068 3.6818 9s.1037-1.1782.2887-1.7182V4.95H.9573A8.9573 8.9573 0 0 0 0 9c0 1.4568.3464 2.8341.9573 4.05l3.0132-2.3318z" />
              <path fill="#FBBC05" d="M9 3.5818c1.3214 0 2.5068.453 3.439.6714l2.5714-2.5714C13.4686.8164 11.43 0 9 0 5.4818 0 2.4382 2.2277.9573 4.95l3.0132 2.3318C4.6777 5.1587 6.6595 3.5818 9 3.5818z" />
            </svg>
            {loading ? 'Working...' : 'Continue with Google'}
          </button>
        </div>

        {/* Divider */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center'
          }}>
            <div style={{ width: '100%', borderTop: '1px solid #e5e7eb' }} />
          </div>
          <div style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <span style={{
              backgroundColor: '#ffffff',
              padding: '0 12px',
              fontSize: '13px',
              color: '#6b7280'
            }}>
              or continue with email
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Email */}
          {!(mode === 'login' && showResetView) && (
            <div>
              <label htmlFor="email" style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '15px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#f3f4f6',
                  color: '#000000',
                  outline: 'none'
                }}
                placeholder="you@example.com"
              />
            </div>
          )}

          {/* Password / Reset Email */}
          <div>
            <label htmlFor="password" style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              {mode === 'login' && showResetView ? 'Email address' : 'Password'}
            </label>
            {mode === 'login' && showResetView ? (
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '15px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#f3f4f6',
                  color: '#000000',
                  outline: 'none'
                }}
                placeholder="you@example.com"
              />
            ) : (
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '15px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#f3f4f6',
                  color: '#000000',
                  outline: 'none'
                }}
                placeholder="••••••••"
              />
            )}
            {mode === 'signup' && (
              <p style={{ marginTop: '6px', fontSize: '13px', color: '#6b7280' }}>
                At least 6 characters
              </p>
            )}
            {mode === 'login' && !showResetView && (
              <div style={{ marginTop: '8px', textAlign: 'right' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetView(true);
                    setError('');
                    setMessage('');
                  }}
                  style={{
                    fontSize: '13px',
                    color: '#f97316',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Forgot password?
                </button>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          {mode === 'signup' && (
            <div>
              <label htmlFor="confirmPassword" style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required={mode === 'signup'}
                minLength={6}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '15px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#f3f4f6',
                  color: '#000000',
                  outline: 'none'
                }}
                placeholder="Re-enter your password"
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '16px',
              backgroundColor: '#fee2e2',
              borderRadius: '8px'
            }}>
              <p style={{ fontSize: '14px', color: '#991b1b' }}>{error}</p>
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div style={{
              padding: '16px',
              backgroundColor: '#d1fae5',
              borderRadius: '8px'
            }}>
              <p style={{ fontSize: '14px', color: '#065f46' }}>{message}</p>
            </div>
          )}

          {/* Submit / Reset Buttons */}
            {mode === 'login' && showResetView ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                type="button"
                disabled={resetLoading}
                onClick={handlePasswordResetRequest}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#ffffff',
                  backgroundColor: resetLoading ? '#9ca3af' : '#f97316',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: resetLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {resetLoading ? 'Sending reset email…' : 'Send reset link'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResetView(false);
                  setError('');
                  setMessage('');
                }}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#475569',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Back to login
              </button>
            </div>
          ) : (
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px 24px',
                fontSize: '15px',
                fontWeight: '600',
                color: '#ffffff',
                backgroundColor: loading ? '#9ca3af' : '#f97316',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#ea580c';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#f97316';
              }}
            >
              {loading ? 'Please wait...' : mode === 'signup' ? 'Sign Up' : 'Log In'}
            </button>
          )}
        </form>

        {/* Toggle Mode */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            onClick={() => {
              setMode(mode === 'signup' ? 'login' : 'signup');
              setError('');
              setMessage('');
              setConfirmPassword('');
              setShowResetView(false);
            }}
            style={{
              fontSize: '14px',
              color: '#f97316',
              cursor: 'pointer',
              border: 'none',
              backgroundColor: 'transparent',
              textDecoration: 'none',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ea580c';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#f97316';
            }}
          >
            {mode === 'signup' ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
          </button>
        </div>

        {mode === 'signup' && (
          <p style={{
            marginTop: '16px',
            fontSize: '13px',
            color: '#9ca3af',
            textAlign: 'center'
          }}>
            By signing up, you agree to our Terms of Service
          </p>
        )}
      </div>
    </div>
  );
}

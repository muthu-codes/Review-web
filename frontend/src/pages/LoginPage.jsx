import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FloatingTiltCard from '../components/FloatingTiltCard';
import {
  ShieldCheck,
  MapPin,
  Lock,
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  Landmark
} from 'lucide-react';

export default function LoginPage() {
  const { loginWithGoogle, loginTestUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleClientId, setGoogleClientId] = useState('');

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (clientId) {
      setGoogleClientId(clientId);
      // Load Google Identity Services script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleResponse,
          });
          const btnParent = document.getElementById('google-btn-container');
          if (btnParent) {
            window.google.accounts.id.renderButton(btnParent, {
              theme: 'outline',
              size: 'large',
              width: '100%',
              text: 'continue_with',
              shape: 'pill',
            });
          }
        }
      };
      document.body.appendChild(script);
    }
  }, []);

  const handleGoogleResponse = async (response) => {
    setIsLoading(true);
    setError('');
    try {
      await loginWithGoogle(response.credential);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.data?.error || err.message || 'Google authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Immediate sandbox sign-in options for live testing and development
  const handleQuickDemoLogin = async (role = 'citizen') => {
    setIsLoading(true);
    setError('');
    try {
      if (role === 'admin') {
        await loginTestUser('admin@tirunelveli.local', 'Nellai Moderator (Admin)', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80');
      } else {
        await loginTestUser('citizen@tirunelveli.local', 'Nellai Citizen Reviewer', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80');
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.data?.error || err.message || 'Sign in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Heritage Silhouettes & Floating Glass Bubbles */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '8%',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 153, 51, 0.12) 0%, rgba(255, 255, 255, 0) 70%)',
          pointerEvents: 'none',
          filter: 'blur(30px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '12%',
          right: '8%',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.1) 0%, rgba(255, 255, 255, 0) 70%)',
          pointerEvents: 'none',
          filter: 'blur(40px)',
        }}
      />

      {/* Floating 3D Tilt Card */}
      <FloatingTiltCard
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '28px',
          border: '1px solid rgba(255, 255, 255, 0.95)',
          boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(226, 232, 240, 0.8)',
          padding: '36px 32px',
        }}
      >
        {/* Subtle Indian Tricolour decorative badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div className="tricolour-badge">
            <Landmark size={13} color="#C2410C" />
            <span>Tirunelveli District • திருநெல்வேலி</span>
          </div>
        </div>

        {/* Heading & Subtitle */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            Welcome to Review Web
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: '1.5' }}>
            Sign in with your verified Google account to rate local places, share community experiences, and help fellow citizens.
          </p>
        </div>

        {error && (
          <div
            style={{
              background: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#991B1B',
              padding: '12px 14px',
              borderRadius: '10px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Real Google OAuth Button Container */}
        <div style={{ marginBottom: '20px' }}>
          <div id="google-btn-container" style={{ minHeight: '44px', display: 'flex', justifyContent: 'center' }}>
            {!googleClientId && (
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('citizen')}
                disabled={isLoading}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  background: '#FFFFFF',
                  color: '#1F2937',
                  border: '1px solid #CBD5E1',
                  borderRadius: '999px',
                  padding: '12px 20px',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s ease',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>
            )}
          </div>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', gap: '12px' }}>
          <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>
            Instant Testing Access
          </span>
          <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
        </div>

        {/* Quick sandbox profile selection buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            type="button"
            onClick={() => handleQuickDemoLogin('citizen')}
            disabled={isLoading}
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'space-between', padding: '10px 16px', fontSize: '0.88rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="#2563EB" />
              <span>Sign In as Citizen Reviewer</span>
            </div>
            <ArrowRight size={14} color="#94A3B8" />
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemoLogin('admin')}
            disabled={isLoading}
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'space-between', padding: '10px 16px', fontSize: '0.88rem', borderColor: '#DDD6FE', background: '#FAF5FF' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} color="#7C3AED" />
              <span style={{ color: '#6D28D9' }}>Sign In as District Moderator</span>
            </div>
            <ArrowRight size={14} color="#A78BFA" />
          </button>
        </div>

        {/* Security & Privacy Commitment */}
        <div
          style={{
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            fontSize: '0.78rem',
            color: '#64748B',
            lineHeight: '1.45',
          }}
        >
          <Lock size={15} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>
            We never store Google passwords or share private personal email addresses. Your display name and profile picture will appear alongside published reviews.
          </span>
        </div>
      </FloatingTiltCard>
    </div>
  );
}

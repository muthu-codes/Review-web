import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import StarRating from '../components/StarRating';
import ReviewModal from '../components/ReviewModal';
import {
  User,
  Calendar,
  MessageSquare,
  Edit2,
  Trash2,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

export default function ProfilePage() {
  const { user, isAuthenticated, logout, deleteAccount, setUser } = useAuth();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  // Edit Profile State
  const [displayName, setDisplayName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  // Editing review modal
  const [editingReview, setEditingReview] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user) {
      setDisplayName(user.display_name || '');
    }

    // Load user submitted reviews
    api.reviews.getMyReviews()
      .then((data) => setReviews(data.results || data || []))
      .catch((err) => console.error("Could not fetch user reviews:", err))
      .finally(() => setIsLoadingReviews(false));
  }, [isAuthenticated, user, navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMessage('');
    try {
      const updated = await api.auth.updateProfile({ display_name: displayName });
      setUser(updated);
      setUpdateMessage('Profile updated successfully.');
      setTimeout(() => setUpdateMessage(''), 3000);
    } catch (err) {
      alert(err.data?.error || 'Failed to update profile.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await api.reviews.deleteReview(reviewId);
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      } catch (err) {
        alert(err.data?.error || 'Failed to delete review.');
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Warning: Deleting your account will remove your personal data and anonymize your reviews in accordance with our retention policy. Do you wish to proceed?")) {
      try {
        await deleteAccount();
        navigate('/');
      } catch (err) {
        alert(err.data?.error || 'Failed to delete account.');
      }
    }
  };

  if (!isAuthenticated || !user) return null;

  return (
    <div style={{ maxWidth: '1080px', margin: '36px auto', padding: '0 20px 80px 20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
        {/* Left Column: Account Summary & Settings */}
        <div>
          <div
            className="glass-panel"
            style={{
              padding: '32px',
              borderRadius: '24px',
              background: '#FFFFFF',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            }}
          >
            {/* Avatar & Display Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              {user.profile_picture_url ? (
                <img
                  src={user.profile_picture_url}
                  alt={user.display_name}
                  style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#DBEAFE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#1D4ED8',
                    fontWeight: 800,
                    fontSize: '1.5rem',
                  }}
                >
                  {user.display_name?.charAt(0) || 'U'}
                </div>
              )}
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A' }}>
                  {user.display_name || 'Community Member'}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748B', marginTop: '4px' }}>
                  <Calendar size={13} />
                  <span>Member since {new Date(user.date_joined).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </div>

            {/* Stats Pills */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '28px',
                padding: '16px',
                background: '#F8FAFC',
                borderRadius: '14px',
              }}
            >
              <div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#2563EB' }}>
                  {user.reviews_count || reviews.length}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Reviews Submitted</div>
              </div>
              <div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#059669' }}>
                  {user.reviews_edited_count || 0}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Reviews Edited</div>
              </div>
            </div>

            {/* Edit Display Name Form */}
            <form onSubmit={handleUpdateProfile} style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Public Display Name
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  {isUpdating ? 'Saving...' : 'Save'}
                </button>
              </div>
              {updateMessage && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontSize: '0.8rem', marginTop: '6px' }}>
                  <CheckCircle2 size={13} />
                  <span>{updateMessage}</span>
                </div>
              )}
            </form>

            {/* Logout and Delete Account */}
            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={logout}
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>

              <button
                type="button"
                onClick={handleDeleteAccount}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#DC2626',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '8px',
                  textAlign: 'center',
                }}
              >
                Request Account Deletion
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: User Review History */}
        <div style={{ flex: 2 }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={20} color="#2563EB" />
              <span>Your Review History ({reviews.length})</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
              All reviews you have published across Tirunelveli district
            </p>
          </div>

          {isLoadingReviews ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748B' }}>
              Loading your reviews...
            </div>
          ) : reviews.length === 0 ? (
            <div
              style={{
                background: '#FFFFFF',
                border: '1px dashed #CBD5E1',
                borderRadius: '18px',
                padding: '40px 20px',
                textAlign: 'center',
                color: '#64748B',
              }}
            >
              <p style={{ marginBottom: '14px', fontSize: '0.92rem' }}>
                You have not reviewed any establishments yet.
              </p>
              <Link to="/categories" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.88rem' }}>
                Explore Directory & Rate Places
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="glass-panel"
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div>
                      <Link
                        to={`/establishments/${rev.establishment_id}`}
                        style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1E3A8A', textDecoration: 'none' }}
                      >
                        {rev.establishment_name}
                      </Link>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                        {new Date(rev.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                        {rev.is_edited && <span style={{ marginLeft: '4px' }}>(edited)</span>}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <StarRating rating={rev.rating} size={15} />
                      <button
                        onClick={() => {
                          setEditingReview(rev);
                          setReviewModalOpen(true);
                        }}
                        title="Edit review"
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#2563EB', padding: '4px' }}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        title="Delete review"
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#DC2626', padding: '4px' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {rev.title && (
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>
                      {rev.title}
                    </h4>
                  )}

                  <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: '1.5' }}>
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Edit Modal */}
      {editingReview && (
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setEditingReview(null);
          }}
          establishment={{ id: editingReview.establishment_id, name: editingReview.establishment_name }}
          existingReview={editingReview}
          onSuccess={() => {
            api.reviews.getMyReviews().then((data) => setReviews(data.results || data || []));
          }}
        />
      )}
    </div>
  );
}

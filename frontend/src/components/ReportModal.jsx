import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client';

export default function ReportModal({ isOpen, onClose, review }) {
  if (!isOpen || !review) return null;

  const [reason, setReason] = useState('offensive_language');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!details.trim()) {
      setErrorMessage('Please provide context for why this review is being flagged.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await api.reviews.reportReview(review.id, { reason, details: details.trim() });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
      }, 2000);
    } catch (err) {
      setErrorMessage(err.data?.error || err.message || 'Failed to submit report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(6px)',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '480px',
          background: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={20} color="#DC2626" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
              Report Review
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}
          >
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div style={{ padding: '36px 24px', textAlign: 'center' }}>
            <CheckCircle2 size={48} color="#059669" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
              Report Received
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
              Thank you for upholding community integrity. Our moderation team will review this listing shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {errorMessage && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '10px', borderRadius: '8px', fontSize: '0.85rem' }}>
                {errorMessage}
              </div>
            )}

            <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.82rem', color: '#475569' }}>
              <span style={{ fontWeight: 600 }}>Review by {review.user?.name}:</span> "{review.comment.substring(0, 80)}..."
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Reason for reporting *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  background: '#FFFFFF',
                }}
              >
                <option value="offensive_language">Offensive or abusive language</option>
                <option value="defamatory">Defamatory or unsubstantiated accusation</option>
                <option value="fake_review">Suspected fake, paid, or competitor review</option>
                <option value="privacy_violation">Exposing private personal information or minor info</option>
                <option value="conflict_of_interest">Owner or employee self-review</option>
                <option value="other">Other community violation</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Details for moderators *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Explain the specific issue with this review..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.88rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
                style={{ background: '#DC2626', padding: '8px 18px', fontSize: '0.85rem' }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { X, Send, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';
import StarRating from './StarRating';
import { api } from '../api/client';

export default function ReviewModal({
  isOpen,
  onClose,
  establishment,
  existingReview = null,
  onSuccess,
}) {
  if (!isOpen || !establishment) return null;

  const [rating, setRating] = useState(existingReview ? existingReview.rating : 5);
  const [title, setTitle] = useState(existingReview ? existingReview.title || '' : '');
  const [comment, setComment] = useState(existingReview ? existingReview.comment : '');
  const [visitDate, setVisitDate] = useState(existingReview ? existingReview.visit_date || '' : '');
  const [category, setCategory] = useState(existingReview ? existingReview.review_category || '' : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isEditing = !!existingReview;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (comment.trim().length < 10) {
      setErrorMessage('Please provide at least 10 characters detailing your authentic experience.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        rating,
        title: title.trim(),
        comment: comment.trim(),
        visit_date: visitDate || null,
        review_category: category || '',
      };

      if (isEditing) {
        await api.reviews.updateReview(existingReview.id, payload);
      } else {
        await api.reviews.submitReview(establishment.id, payload);
      }

      // Celebrate with subtle confetti
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#FF9933', '#2563EB', '#138808'],
        });
      } catch (e) {
        // Fallback gracefully if confetti fails
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setErrorMessage(err.data?.error || err.data?.detail || err.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
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
          maxWidth: '540px',
          background: '#FFFFFF',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>
              {isEditing ? 'Edit Your Review' : 'Write a Review'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748B' }}>
              For {establishment.name}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px' }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {errorMessage && (
            <div
              style={{
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#991B1B',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertTriangle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Interactive Star Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#1E293B', marginBottom: '8px' }}>
              Rate your experience *
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <StarRating rating={rating} onChange={setRating} interactive={true} size={28} showLabel={true} />
            </div>
          </div>

          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Review Title (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Exceptional customer service, Authentic Nellai taste"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={150}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Comment */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                Your Experience Review *
              </label>
              <span style={{ fontSize: '0.75rem', color: comment.length < 10 ? '#EF4444' : '#64748B' }}>
                {comment.length} / 2000 characters
              </span>
            </div>
            <textarea
              required
              rows={4}
              placeholder="Share honest, constructive details about your visit. Please avoid personal allegations or private contact numbers."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={2000}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Optional: Visit Date & Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Visit Date (Optional)
              </label>
              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Focus Area (Optional)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.85rem',
                  outline: 'none',
                  background: '#FFFFFF',
                }}
              >
                <option value="">General Experience</option>
                <option value="Customer Service">Customer Service</option>
                <option value="Cleanliness & Hygiene">Cleanliness & Hygiene</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Value for Money">Value for Money</option>
                <option value="Food Quality">Food Quality</option>
                <option value="Doctor Consultation">Doctor Consultation</option>
                <option value="Academic Quality">Academic Quality</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-secondary"
              style={{ padding: '8px 18px', fontSize: '0.9rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              style={{ padding: '8px 22px', fontSize: '0.9rem' }}
            >
              <Send size={15} />
              <span>{isSubmitting ? 'Submitting...' : isEditing ? 'Save Changes' : 'Submit Review'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Star } from 'lucide-react';

const RATING_LABELS = {
  1: 'Very Poor',
  2: 'Poor',
  3: 'Average',
  4: 'Good',
  5: 'Excellent',
};

export default function StarRating({
  rating = 0,
  onChange,
  interactive = false,
  size = 20,
  showLabel = false,
  className = '',
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`} role={interactive ? "radiogroup" : "img"} aria-label={`Rating: ${rating} out of 5 stars`}>
      <div style={{ display: 'inline-flex', gap: '3px' }}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= Math.round(displayRating);
          return (
            <button
              key={star}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange && onChange(star)}
              onMouseEnter={() => interactive && setHoverRating(star)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              onFocus={() => interactive && setHoverRating(star)}
              onBlur={() => interactive && setHoverRating(0)}
              aria-label={`${star} star: ${RATING_LABELS[star]}`}
              role={interactive ? "radio" : undefined}
              aria-checked={interactive ? star === rating : undefined}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: interactive ? 'pointer' : 'default',
                padding: '2px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.15s ease',
                transform: interactive && hoverRating === star ? 'scale(1.2)' : 'scale(1)',
              }}
            >
              <Star
                size={size}
                fill={isFilled ? '#F59E0B' : 'transparent'}
                color={isFilled ? '#F59E0B' : '#CBD5E1'}
                strokeWidth={isFilled ? 1.5 : 2}
              />
            </button>
          );
        })}
      </div>

      {showLabel && (
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginLeft: '6px' }}>
          {RATING_LABELS[displayRating] || `${rating.toFixed(1)} / 5.0`}
        </span>
      )}
    </div>
  );
}

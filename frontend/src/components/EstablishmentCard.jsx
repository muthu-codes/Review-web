import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ShieldCheck, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';
import StarRating from './StarRating';

export default function EstablishmentCard({ establishment }) {
  if (!establishment) return null;

  const {
    id,
    name,
    tamil_name,
    category_name,
    town_name,
    locality_name,
    address_line1,
    average_rating = 0,
    review_count = 0,
    verification_status = 'listed',
    has_verified_complaint_channel = false,
  } = establishment;

  const renderVerificationBadge = () => {
    if (verification_status === 'official_verified') {
      return (
        <span className="badge-official" title="Official Registration Independently Verified">
          <ShieldCheck size={12} color="#059669" />
          <span>Official Verified</span>
        </span>
      );
    }
    if (verification_status === 'checked') {
      return (
        <span className="badge-checked" title="Information Checked by Review Web team">
          <CheckCircle2 size={12} color="#2563EB" />
          <span>Info Checked</span>
        </span>
      );
    }
    return (
      <span className="badge-listed" title="Listed on Review Web directory">
        <span>Listed</span>
      </span>
    );
  };

  return (
    <Link
      to={`/establishments/${id}`}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
    >
      <div
        className="glass-panel glass-card-hover"
        style={{
          padding: '20px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.85)',
          borderRadius: '16px',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          boxShadow: '0 4px 16px -2px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div>
          {/* Top badges */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '12px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                background: '#F1F5F9',
                color: '#475569',
                padding: '3px 8px',
                borderRadius: '6px',
                letterSpacing: '0.04em',
              }}
            >
              {category_name}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {has_verified_complaint_channel && (
                <span
                  title="Verified official grievance / complaint channel available"
                  style={{
                    background: '#FEF3C7',
                    color: '#92400E',
                    border: '1px solid #FDE68A',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '3px 7px',
                    borderRadius: '999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <AlertCircle size={11} color="#D97706" />
                  <span>Official Support</span>
                </span>
              )}
              {renderVerificationBadge()}
            </div>
          </div>

          {/* Establishment Title & Tamil Name */}
          <h3
            style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              color: '#0F172A',
              marginBottom: tamil_name ? '2px' : '8px',
              lineHeight: '1.3',
            }}
          >
            {name}
          </h3>

          {tamil_name && (
            <div style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '8px', fontWeight: 500 }}>
              {tamil_name}
            </div>
          )}

          {/* Location */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.82rem', color: '#475569', marginBottom: '16px' }}>
            <MapPin size={15} color="#EA580C" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span style={{ lineHeight: '1.4' }}>
              {locality_name ? `${locality_name}, ` : ''}{town_name}
            </span>
          </div>
        </div>

        {/* Rating and review counts footer */}
        <div
          style={{
            borderTop: '1px solid #F1F5F9',
            paddingTop: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <StarRating rating={average_rating} size={15} />
            <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0F172A' }}>
              {average_rating > 0 ? average_rating.toFixed(1) : 'No reviews'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#64748B' }}>
            <MessageSquare size={13} />
            <span>{review_count} {review_count === 1 ? 'review' : 'reviews'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

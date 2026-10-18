import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import ReviewModal from '../components/ReviewModal';
import ReportModal from '../components/ReportModal';
import ComplaintModal from '../components/ComplaintModal';
import {
  MapPin,
  ExternalLink,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Star,
  Edit3,
  Trash2,
  Flag,
  Share2,
  AlertTriangle
} from 'lucide-react';

export default function EstablishmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [establishment, setEstablishment] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [complaintChannels, setComplaintChannels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportingReview, setReportingReview] = useState(null);
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);

  // Review sorting
  const [reviewSort, setReviewSort] = useState('newest');

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [estRes, revRes, compRes] = await Promise.all([
        api.directory.getEstablishmentDetail(id),
        api.reviews.getEstablishmentReviews(id, { sort: reviewSort }),
        api.complaints.getChannels(id).catch(() => []),
      ]);

      setEstablishment(estRes);
      setReviews(revRes.results || []);
      setComplaintChannels(compRes || []);
    } catch (err) {
      setError(err.data?.error || err.message || 'Establishment not found.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, reviewSort]);

  const handleWriteReviewClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/establishments/${id}` } } });
      return;
    }
    // Check if user already has an active review
    const myExisting = reviews.find((r) => r.is_own_review);
    if (myExisting) {
      setEditingReview(myExisting);
    } else {
      setEditingReview(null);
    }
    setReviewModalOpen(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("Are you sure you want to remove your review?")) {
      try {
        await api.reviews.deleteReview(reviewId);
        loadData();
      } catch (err) {
        alert(err.data?.error || 'Could not delete review.');
      }
    }
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: '1080px', margin: '40px auto', padding: '0 20px', textAlign: 'center', color: '#64748B' }}>
        <p>Loading establishment details...</p>
      </div>
    );
  }

  if (error || !establishment) {
    return (
      <div style={{ maxWidth: '600px', margin: '60px auto', padding: '30px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '16px', textAlign: 'center' }}>
        <AlertTriangle size={36} color="#DC2626" style={{ margin: '0 auto 12px auto' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#991B1B', marginBottom: '8px' }}>Listing Not Found</h2>
        <p style={{ fontSize: '0.88rem', color: '#B91C1C', marginBottom: '18px' }}>{error || 'This listing does not exist in the Tirunelveli district directory.'}</p>
        <Link to="/categories" className="btn-secondary" style={{ padding: '8px 18px' }}>
          Back to Directory
        </Link>
      </div>
    );
  }

  const {
    name,
    tamil_name,
    category,
    town,
    locality,
    full_address,
    map_url,
    phone,
    email,
    website,
    business_hours,
    verification_status,
    average_rating = 0,
    review_count = 0,
    rating_distribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
  } = establishment;

  const userExistingReview = reviews.find((r) => r.is_own_review);

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '32px 20px 80px 20px' }}>
      {/* Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748B', marginBottom: '20px' }}>
        <Link to="/" style={{ color: '#64748B', textDecoration: 'none' }}>Home</Link>
        <span>/</span>
        <Link to="/categories" style={{ color: '#64748B', textDecoration: 'none' }}>Categories</Link>
        <span>/</span>
        {category && (
          <>
            <Link to={`/categories/${category.slug}`} style={{ color: '#64748B', textDecoration: 'none' }}>
              {category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span style={{ color: '#2563EB', fontWeight: 600 }}>{name}</span>
      </div>

      {/* Main Header Card */}
      <div
        className="glass-panel"
        style={{
          padding: '32px',
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.92)',
          boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.04)',
          marginBottom: '32px',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px' }}>
          <div style={{ maxWidth: '720px' }}>
            {/* Category and Verification Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  background: '#EFF6FF',
                  color: '#1D4ED8',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  letterSpacing: '0.04em',
                }}
              >
                {category?.name}
              </span>

              {verification_status === 'official_verified' && (
                <span className="badge-official">
                  <ShieldCheck size={14} color="#059669" />
                  <span>Official Registration Verified</span>
                </span>
              )}
              {verification_status === 'checked' && (
                <span className="badge-checked">
                  <CheckCircle2 size={14} color="#2563EB" />
                  <span>Information Checked by Review Web</span>
                </span>
              )}
              {verification_status === 'listed' && (
                <span className="badge-listed">
                  <span>Listed on Review Web</span>
                </span>
              )}
            </div>

            {/* Names */}
            <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: '1.2' }}>
              {name}
            </h1>
            {tamil_name && (
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#475569', marginTop: '4px', marginBottom: '12px' }}>
                {tamil_name}
              </h2>
            )}

            {/* Address */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.92rem', color: '#334155', marginTop: '14px' }}>
              <MapPin size={18} color="#EA580C" style={{ flexShrink: 0, marginTop: '3px' }} />
              <div>
                <div>{full_address}</div>
                {map_url && (
                  <a
                    href={map_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#2563EB',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      marginTop: '4px',
                    }}
                  >
                    <span>View Location on Map</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons: Write Review & Verified Complaint Button */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '220px' }}>
            <button
              onClick={handleWriteReviewClick}
              className="btn-primary"
              style={{ width: '100%', padding: '12px 20px', borderRadius: '12px' }}
            >
              <Star size={18} />
              <span>{userExistingReview ? 'Edit Your Review' : 'Write a Review'}</span>
            </button>

            {/* Crucial Section 8: Complaint Button appears ONLY when verified official channel exists */}
            {complaintChannels.length > 0 && (
              <button
                onClick={() => setComplaintModalOpen(true)}
                className="btn-secondary"
                style={{
                  width: '100%',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  borderColor: '#F59E0B',
                  color: '#92400E',
                  background: '#FEF3C7',
                }}
              >
                <AlertCircle size={16} color="#D97706" />
                <span>Official Complaint / Support</span>
              </button>
            )}
          </div>
        </div>

        {/* Contact and Sourced Business Hours Information Bar */}
        {(phone || email || website || (business_hours && Object.keys(business_hours).length > 0)) && (
          <div
            style={{
              marginTop: '28px',
              paddingTop: '20px',
              borderTop: '1px solid #F1F5F9',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '24px',
              fontSize: '0.88rem',
              color: '#475569',
            }}
          >
            {phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={15} color="#16A34A" />
                <span>{phone}</span>
              </div>
            )}
            {email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={15} color="#2563EB" />
                <span>{email}</span>
              </div>
            )}
            {website && (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563EB', textDecoration: 'none' }}
              >
                <ExternalLink size={15} />
                <span>Official Website</span>
              </a>
            )}
          </div>
        )}
      </div>

      {/* Grid: Rating Summary on left, Reviews list on right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
        {/* Left Column: Authentic Rating Distribution */}
        <div>
          <div
            className="glass-panel"
            style={{
              padding: '28px',
              borderRadius: '20px',
              background: '#FFFFFF',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
            }}
          >
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '16px' }}>
              Rating & Experience
            </h3>

            {review_count === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748B' }}>
                <p style={{ fontSize: '0.9rem', marginBottom: '12px' }}>
                  No published reviews yet. Be the first citizen to review this place!
                </p>
                <button onClick={handleWriteReviewClick} className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.88rem' }}>
                  Rate this place
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '3rem', fontWeight: 800, color: '#0F172A', lineHeight: '1' }}>
                    {average_rating.toFixed(1)}
                  </span>
                  <div>
                    <StarRating rating={average_rating} size={20} />
                    <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '4px' }}>
                      Based on {review_count} published {review_count === 1 ? 'review' : 'reviews'}
                    </div>
                  </div>
                </div>

                {/* 1 to 5 Star Distribution Bars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = rating_distribution[String(stars)] || 0;
                    const percent = review_count > 0 ? (count / review_count) * 100 : 0;
                    return (
                      <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                        <span style={{ width: '45px', fontWeight: 600, color: '#475569' }}>
                          {stars} ★
                        </span>
                        <div style={{ flex: 1, height: '8px', background: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${percent}%`,
                              background: stars >= 4 ? '#10B981' : stars === 3 ? '#F59E0B' : '#EF4444',
                              borderRadius: '999px',
                              transition: 'width 0.4s ease',
                            }}
                          />
                        </div>
                        <span style={{ width: '32px', textAlign: 'right', color: '#64748B', fontSize: '0.78rem' }}>
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Published Community Reviews */}
        <div style={{ flex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={20} color="#2563EB" />
              <span>Community Reviews ({reviews.length})</span>
            </h3>

            {/* Review sort */}
            <select
              value={reviewSort}
              onChange={(e) => setReviewSort(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.85rem',
                outline: 'none',
                background: '#FFFFFF',
              }}
            >
              <option value="newest">Newest First</option>
              <option value="rating_desc">Highest Rating</option>
              <option value="rating_asc">Lowest Rating</option>
            </select>
          </div>

          {reviews.length === 0 ? (
            <div
              style={{
                background: '#FFFFFF',
                border: '1px dashed #CBD5E1',
                borderRadius: '16px',
                padding: '36px 20px',
                textAlign: 'center',
                color: '#64748B',
              }}
            >
              <p style={{ marginBottom: '14px', fontSize: '0.92rem' }}>
                There are no published reviews for this establishment yet.
              </p>
              <button onClick={handleWriteReviewClick} className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.88rem' }}>
                Be the first to review
              </button>
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
                    background: rev.is_own_review ? '#F8FAFC' : '#FFFFFF',
                    border: rev.is_own_review ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {rev.user?.profile_picture_url ? (
                        <img
                          src={rev.user.profile_picture_url}
                          alt={rev.user.name}
                          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: '#DBEAFE',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#1D4ED8',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                          }}
                        >
                          {rev.user?.name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>
                          {rev.user?.name}
                          {rev.is_own_review && (
                            <span style={{ marginLeft: '8px', fontSize: '0.72rem', background: '#DBEAFE', color: '#1D4ED8', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                              Your Review
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          {new Date(rev.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                          {rev.is_edited && <span style={{ marginLeft: '4px', fontStyle: 'italic' }}>(edited)</span>}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <StarRating rating={rev.rating} size={15} />

                      {/* Edit or Delete for review author */}
                      {rev.is_own_review ? (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => {
                              setEditingReview(rev);
                              setReviewModalOpen(true);
                            }}
                            title="Edit your review"
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#2563EB', padding: '4px' }}
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteReview(rev.id)}
                            title="Delete your review"
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#DC2626', padding: '4px' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setReportingReview(rev);
                            setReportModalOpen(true);
                          }}
                          title="Report abusive or fraudulent review"
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '4px' }}
                        >
                          <Flag size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {rev.title && (
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                      {rev.title}
                    </h4>
                  )}

                  <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                    {rev.comment}
                  </p>

                  {(rev.review_category || rev.visit_date) && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '12px', fontSize: '0.75rem', color: '#64748B' }}>
                      {rev.review_category && (
                        <span style={{ background: '#F1F5F9', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                          Focus: {rev.review_category}
                        </span>
                      )}
                      {rev.visit_date && (
                        <span>Visited: {rev.visit_date}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          setEditingReview(null);
        }}
        establishment={establishment}
        existingReview={editingReview}
        onSuccess={loadData}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => {
          setReportModalOpen(false);
          setReportingReview(null);
        }}
        review={reportingReview}
      />

      {/* Complaint Modal */}
      <ComplaintModal
        isOpen={complaintModalOpen}
        onClose={() => setComplaintModalOpen(false)}
        establishment={establishment}
        channels={complaintChannels}
      />
    </div>
  );
}

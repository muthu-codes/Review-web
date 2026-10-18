import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, AlertCircle, CheckCircle2, Lock, ArrowLeft } from 'lucide-react';

export default function GuidelinesPage() {
  return (
    <div style={{ maxWidth: '840px', margin: '40px auto', padding: '0 20px 80px 20px' }}>
      <Link
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: '#64748B',
          textDecoration: 'none',
          fontSize: '0.88rem',
          marginBottom: '20px',
        }}
      >
        <ArrowLeft size={16} />
        <span>Back to Home</span>
      </Link>

      <div
        className="glass-panel"
        style={{
          padding: '40px',
          borderRadius: '24px',
          background: '#FFFFFF',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div className="tricolour-badge" style={{ marginBottom: '12px' }}>
          <span>Community Standards & Trust</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
          Review Guidelines & Moderation Policy
        </h1>
        <p style={{ fontSize: '0.92rem', color: '#64748B', marginBottom: '32px', lineHeight: '1.6' }}>
          Review Web is dedicated to fostering an authentic, respectful, and constructive directory platform for Tirunelveli district, Tamil Nadu.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', fontSize: '0.92rem', color: '#334155', lineHeight: '1.7' }}>
          {/* Principle 1 */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} color="#059669" />
              <span>1. Authentic First-Hand Experiences</span>
            </h2>
            <p>
              Reviews must reflect your genuine personal experience visiting, enrolling, purchasing from, or seeking service at the establishment. Do not post second-hand rumors, hearsay, or competitor disparagement. One review per user is permitted per establishment.
            </p>
          </div>

          {/* Principle 2 */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} color="#D97706" />
              <span>2. Crucial Distinction: Reviews vs. Official Complaints</span>
            </h2>
            <p>
              Review Web is an independent community discovery site. <strong>Posting a 1-star review does not constitute filing a legal, consumer, or governmental grievance.</strong> Where verified official complaint portals, forms, helplines, or ombudsman channels exist, Review Web displays a dedicated "Official Support / Complaint" button linking directly to verified public grievance channels.
            </p>
          </div>

          {/* Principle 3 */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={18} color="#2563EB" />
              <span>3. Privacy Protection for Minors, Patients, and Individuals</span>
            </h2>
            <p>
              Never post private phone numbers, home addresses, medical details, or names of individual employees, patients, students, or children. For schools and colleges in Tirunelveli, focus strictly on institutional infrastructure, academic atmosphere, and campus amenities.
            </p>
          </div>

          {/* Principle 4 */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="#7C3AED" />
              <span>4. Respectful Tone and Prohibition of Defamation</span>
            </h2>
            <p>
              Constructive criticism is welcomed; abusive slurs, hate speech, threats, and unsubstantiated criminal allegations will be removed upon report. Business owners and community members may flag reviews that breach these guidelines.
            </p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #E2E8F0', marginTop: '36px', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
            Last updated: October 2026 • Tirunelveli District, Tamil Nadu
          </span>
          <Link to="/categories" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.88rem' }}>
            Explore Directory
          </Link>
        </div>
      </div>
    </div>
  );
}

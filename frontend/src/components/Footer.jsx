import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, MapPin, ExternalLink, HelpCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      style={{
        background: '#FFFFFF',
        borderTop: '1px solid #E2E8F0',
        marginTop: '60px',
        color: '#475569',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '48px 20px 24px 20px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '36px',
            marginBottom: '40px',
          }}
        >
          {/* Column 1: Brand & Mission */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #FF9933 0%, #2563EB 50%, #138808 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                }}
              >
                RW
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-heading)' }}>
                Review Web
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', lineHeight: '1.6', color: '#64748B', marginBottom: '16px' }}>
              The authentic, verified community directory and reviews platform focused exclusively on Tirunelveli District, Tamil Nadu. Discover places, share experiences, and access verified public channels.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#0F172A', fontWeight: 600 }}>
              <MapPin size={14} color="#EA580C" />
              <span>Tirunelveli, Palayamkottai, Ambasamudram & District</span>
            </div>
          </div>

          {/* Column 2: Discover Categories */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Directory Categories
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <Link to="/categories/hospitals" style={{ color: '#475569', textDecoration: 'none' }}>
                  Hospitals & Clinics
                </Link>
              </li>
              <li>
                <Link to="/categories/schools" style={{ color: '#475569', textDecoration: 'none' }}>
                  Schools & Institutions
                </Link>
              </li>
              <li>
                <Link to="/categories/colleges" style={{ color: '#475569', textDecoration: 'none' }}>
                  Colleges & Universities
                </Link>
              </li>
              <li>
                <Link to="/categories/hotels-restaurants" style={{ color: '#475569', textDecoration: 'none' }}>
                  Hotels & Restaurants
                </Link>
              </li>
              <li>
                <Link to="/categories/temples" style={{ color: '#475569', textDecoration: 'none' }}>
                  Temples & Heritage
                </Link>
              </li>
              <li>
                <Link to="/categories/government-offices" style={{ color: '#475569', textDecoration: 'none' }}>
                  Government Offices
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Community & Governance */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Trust & Community
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <Link to="/guidelines" style={{ color: '#475569', textDecoration: 'none' }}>
                  Review & Moderation Policy
                </Link>
              </li>
              <li>
                <Link to="/suggest-place" style={{ color: '#475569', textDecoration: 'none' }}>
                  Suggest a Missing Place
                </Link>
              </li>
              <li>
                <Link to="/categories" style={{ color: '#475569', textDecoration: 'none' }}>
                  Browse All Categories
                </Link>
              </li>
              <li>
                <Link to="/admin-portal" style={{ color: '#7C3AED', textDecoration: 'none', fontWeight: 600 }}>
                  Administrative Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Official Complaint Disclaimer */}
          <div>
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.85rem', color: '#1E3A8A', marginBottom: '6px' }}>
                <ShieldCheck size={16} color="#2563EB" />
                <span>Notice on Official Complaints</span>
              </div>
              <p style={{ fontSize: '0.78rem', lineHeight: '1.5', color: '#64748B' }}>
                Review Web distinguishes between community reviews and formal complaints. We link to verified official grievance portals and helplines only when verified. Review Web does not file legal complaints directly.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright & tricolour accent */}
        <div
          style={{
            borderTop: '1px solid #E2E8F0',
            paddingTop: '20px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            fontSize: '0.8rem',
            color: '#64748B',
          }}
        >
          <div>
            © {new Date().getFullYear()} Review Web — Tirunelveli District. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Built with dedication for the people of</span>
            <span style={{ fontWeight: 700, color: '#C2410C' }}>திருநெல்வேலி</span>
          </div>
        </div>
      </div>

      {/* Tricolour Accent Line */}
      <div className="tricolour-accent-bar" />
    </footer>
  );
}

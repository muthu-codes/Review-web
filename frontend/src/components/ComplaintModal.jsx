import React from 'react';
import { X, ExternalLink, ShieldAlert, Phone, Mail, FileText, CheckCircle2 } from 'lucide-react';

export default function ComplaintModal({ isOpen, onClose, establishment, channels = [] }) {
  if (!isOpen || !establishment) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(8px)',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '560px',
          background: '#FFFFFF',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
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
            background: 'linear-gradient(to right, #FFFBEB, #FFFFFF)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#FEF3C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#B45309',
              }}
            >
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                Official Complaint & Grievance Channels
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748B' }}>
                For {establishment.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px' }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Advisory / Disclaimer Notice */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: '12px',
              padding: '14px',
              fontSize: '0.82rem',
              color: '#1E40AF',
              lineHeight: '1.5',
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} color="#2563EB" />
              <span>Independent Directory Notice</span>
            </div>
            Review Web is an independent community discovery and reviews platform. Clicking official links below will take you directly to verified external grievance mechanisms. <strong>Review Web does not record, handle, or submit formal complaints on your behalf</strong>, nor does it share your private account data with external authorities.
          </div>

          {/* Verified Channels List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Verified Official Channels ({channels.length})
            </h4>

            {channels.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', background: '#F8FAFC', borderRadius: '12px', color: '#64748B', fontSize: '0.88rem' }}>
                No verified official complaint channels are currently registered for this establishment. Ordinary reviews remain available.
              </div>
            ) : (
              channels.map((ch) => (
                <div
                  key={ch.id}
                  style={{
                    border: '1px solid #E2E8F0',
                    borderRadius: '14px',
                    padding: '16px',
                    background: '#FFFFFF',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>
                        {ch.channel_name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600 }}>
                        Receiving Organization: {ch.receiving_organization}
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        background: '#ECFDF5',
                        color: '#047857',
                        padding: '3px 8px',
                        borderRadius: '999px',
                        border: '1px solid #A7F3D0',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Verified Channel
                    </span>
                  </div>

                  {ch.instructions && (
                    <p style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '12px', lineHeight: '1.5' }}>
                      {ch.instructions}
                    </p>
                  )}

                  {/* Action Link / Button */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
                    {ch.official_url && (
                      <a
                        href={ch.official_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                      >
                        <span>Open Official Portal</span>
                        <ExternalLink size={14} />
                      </a>
                    )}

                    {ch.official_contact && (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          color: '#1E293B',
                          background: '#F1F5F9',
                          padding: '6px 12px',
                          borderRadius: '8px',
                        }}
                      >
                        {ch.channel_type === 'email' ? <Mail size={14} color="#2563EB" /> : <Phone size={14} color="#16A34A" />}
                        <span>{ch.official_contact}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
            <button
              onClick={onClose}
              className="btn-secondary"
              style={{ padding: '8px 20px', fontSize: '0.88rem' }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

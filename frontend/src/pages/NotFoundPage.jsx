import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{ maxWidth: '500px', margin: '80px auto', padding: '0 20px', textAlign: 'center' }}>
      <div
        className="glass-panel"
        style={{
          padding: '48px 32px',
          background: '#FFFFFF',
          borderRadius: '24px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            color: '#2563EB',
          }}
        >
          <Compass size={32} />
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
          404 - Page Not Found
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: '24px', lineHeight: '1.5' }}>
          The directory page, category, or establishment you are searching for does not exist or has been moved.
        </p>
        <Link to="/" className="btn-primary" style={{ padding: '10px 24px' }}>
          <ArrowLeft size={16} />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}

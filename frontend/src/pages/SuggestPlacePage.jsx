import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, CheckCircle2, AlertCircle, ArrowLeft, Send } from 'lucide-react';

export default function SuggestPlacePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [categories, setCategories] = useState([]);
  const [towns, setTowns] = useState([]);

  // Form State
  const [name, setName] = useState('');
  const [tamilName, setTamilName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [townId, setTownId] = useState('');
  const [localityName, setLocalityName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    Promise.all([api.directory.getCategories(), api.directory.getTowns()])
      .then(([cats, twns]) => {
        setCategories(cats || []);
        setTowns(twns || []);
        if (cats && cats.length > 0) setCategoryId(cats[0].id);
        if (twns && twns.length > 0) setTownId(twns[0].id);
      })
      .catch((err) => console.error("Error loading categories/towns:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please provide the establishment name.');
      return;
    }
    if (!address.trim()) {
      setErrorMessage('Please provide the physical address or street details.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.directory.suggestEstablishment({
        name: name.trim(),
        tamil_name: tamilName.trim(),
        category: categoryId,
        town: townId,
        locality_name: localityName.trim(),
        address: address.trim(),
        phone: phone.trim(),
        website: website.trim(),
        notes: notes.trim(),
      });
      setIsSuccess(true);
    } catch (err) {
      setErrorMessage(err.data?.error || err.message || 'Failed to submit place suggestion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '40px auto', padding: '0 20px 80px 20px' }}>
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
          padding: '36px',
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 12px 40px -10px rgba(0, 0, 0, 0.05)',
        }}
      >
        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '40px 10px' }}>
            <CheckCircle2 size={54} color="#059669" style={{ margin: '0 auto 16px auto' }} />
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
              Suggestion Submitted!
            </h2>
            <p style={{ fontSize: '0.92rem', color: '#475569', maxWidth: '480px', margin: '0 auto 24px auto', lineHeight: '1.6' }}>
              Thank you for contributing to the Tirunelveli district directory. Our moderation team will verify the details and publish the listing once checked.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                onClick={() => {
                  setIsSuccess(false);
                  setName('');
                  setTamilName('');
                  setLocalityName('');
                  setAddress('');
                  setPhone('');
                  setWebsite('');
                  setNotes('');
                }}
                className="btn-secondary"
              >
                Suggest Another Place
              </button>
              <Link to="/" className="btn-primary">
                Return to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '28px' }}>
              <div className="tricolour-badge" style={{ marginBottom: '8px' }}>
                <span>Community Sourced Directory</span>
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
                Suggest a Missing Place
              </h1>
              <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: '1.5' }}>
                Know an unlisted shop, clinic, school, college, temple, or public service establishment in Tirunelveli district? Submit its details below for verification.
              </p>
            </div>

            {errorMessage && (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  color: '#991B1B',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '20px',
                }}
              >
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Name & Tamil Name */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                    Establishment Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sri Nellaiappar Book Centre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                    Tamil Name (தமிழ் பெயர்)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ஸ்ரீ நெல்லையப்பர் புத்தக நிலையம்"
                    value={tamilName}
                    onChange={(e) => setTamilName(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Category & Town */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none', background: '#FFFFFF' }}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.tamil_name ? `(${c.tamil_name})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                    Town / Municipal Area *
                  </label>
                  <select
                    value={townId}
                    onChange={(e) => setTownId(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none', background: '#FFFFFF' }}
                  >
                    {towns.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} {t.tamil_name ? `(${t.tamil_name})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Locality & Address */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                  Locality / Landmark
                </label>
                <input
                  type="text"
                  placeholder="e.g. Town, Junction, Vannarpettai, Palayamkottai High Ground"
                  value={localityName}
                  onChange={(e) => setLocalityName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                  Complete Physical Address *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Door number, street name, nearest landmark..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none' }}
                />
              </div>

              {/* Optional Phone & Website */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                    Public Contact Number (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 0462-233xxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                    Official Website / Link (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                  Verification Context & Sourced Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Any details to help our team verify this place (e.g. official board photo reference, public news mention, or government notice)."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                  style={{ padding: '12px 28px', fontSize: '0.95rem' }}
                >
                  <Send size={16} />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Suggestion'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

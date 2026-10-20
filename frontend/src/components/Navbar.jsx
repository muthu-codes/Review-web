import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import {
  Search,
  MapPin,
  Menu,
  X,
  User,
  LogOut,
  ShieldCheck,
  PlusCircle,
  Building,
  ChevronDown,
  Compass
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    // Load top categories for quick navigation
    api.directory.getCategories()
      .then((data) => setCategories(data || []))
      .catch((err) => console.error("Could not fetch categories:", err));
  }, []);

  // Debounced search suggestions
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const resp = await api.directory.getEstablishments({ search: searchQuery, page_size: 5 });
        setSuggestions(resp.results || []);
        setShowDropdown(true);
      } catch (err) {
        console.error("Search suggestion error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener for search suggestions
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      navigate(`/categories?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        left: 0,
        width: '100%',
        boxSizing: 'border-box',
        zIndex: 50,
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.03)',
      }}
    >
      {/* Subtle top Tricolour line */}
      <div className="tricolour-accent-bar" />

      <div
        className="navbar-inner"
        style={{
          maxWidth: '1280px',
          width: '100%',
          boxSizing: 'border-box',
          margin: '0 auto',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        {/* Brand / Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexShrink: 0,
            minWidth: 0,
            textDecoration: 'none',
            color: 'inherit',
          }}
          className="navbar-brand"
        
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #FF9933 0%, #2563EB 50%, #138808 100%)',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                background: '#FFFFFF',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.25rem',
                color: '#1E3A8A',
                fontFamily: 'var(--font-heading)',
              }}
            >
              RW
            </div>
          </div>
          <div>
            <div className="navbar-brand-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap' }}>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0F172A', fontFamily: 'var(--font-heading)' }}>
                Review Web
              </span>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  background: '#EFF6FF',
                  color: '#1D4ED8',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  border: '1px solid #BFDBFE',
                  textTransform: 'uppercase',
                }}
              >
                Tirunelveli
              </span>
            </div>
            <div className="navbar-brand-location" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#64748B' }}>
              <MapPin size={12} color="#EA580C" />
              <span>திருநெல்வேலி மாவட்டம், Tamil Nadu</span>
            </div>
          </div>
        </Link>

        {/* Global Search with Autocomplete */}
        <div ref={searchRef} style={{ position: 'relative', flex: '1', maxWidth: '420px', display: 'none' }} className="desktop-search">
          <form onSubmit={handleSearchSubmit}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(241, 245, 249, 0.85)',
                border: '1px solid #CBD5E1',
                borderRadius: '999px',
                padding: '6px 14px',
                transition: 'all 0.2s ease',
              }}
            >
              <Search size={16} color="#64748B" style={{ marginRight: '8px' }} />
              <input
                type="text"
                placeholder="Search shops, schools, temples, hospitals in Nellai..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  width: '100%',
                  fontSize: '0.88rem',
                  color: '#0F172A',
                }}
              />
            </div>
          </form>

          {/* Autocomplete Dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <div
              className="glass-panel"
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                right: 0,
                padding: '8px',
                borderRadius: '16px',
                zIndex: 60,
                background: '#FFFFFF',
                boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
              }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', padding: '6px 12px' }}>
                Matching Tirunelveli Listings
              </div>
              {suggestions.map((item) => (
                <Link
                  key={item.id}
                  to={`/establishments/${item.id}`}
                  onClick={() => setShowDropdown(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0F172A' }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      {item.tamil_name ? `${item.tamil_name} • ` : ''}{item.town_name}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      background: '#F1F5F9',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      color: '#475569',
                    }}
                  >
                    {item.category_name}
                  </span>
                </Link>
              ))}
              <div style={{ borderTop: '1px solid #E2E8F0', marginTop: '6px', paddingTop: '6px' }}>
                <Link
                  to={`/categories?search=${encodeURIComponent(searchQuery)}`}
                  onClick={() => setShowDropdown(false)}
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    fontSize: '0.8rem',
                    color: '#2563EB',
                    fontWeight: 600,
                    textDecoration: 'none',
                    padding: '6px',
                  }}
                >
                  View all results for "{searchQuery}" →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Navigation links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '16px' }} className="desktop-nav">
          <Link
            to="/categories"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.92rem',
              color: '#334155',
            }}
          >
            <Compass size={16} color="#2563EB" />
            <span>Categories</span>
          </Link>

          <Link
            to="/suggest-place"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.92rem',
              color: '#334155',
            }}
          >
            <PlusCircle size={16} color="#EA580C" />
            <span>Suggest Place</span>
          </Link>

          {isAdmin && (
            <Link
              to="/admin-portal"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.88rem',
                color: '#7C3AED',
                background: '#F5F3FF',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #DDD6FE',
              }}
            >
              <ShieldCheck size={16} />
              <span>Admin Portal</span>
            </Link>
          )}

          {/* User profile / Sign in button */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link
                to="/profile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  color: 'inherit',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                }}
              >
                {user?.profile_picture_url ? (
                  <img
                    src={user.profile_picture_url}
                    alt={user.display_name}
                    style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: '#DBEAFE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#1D4ED8',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                    }}
                  >
                    {user?.display_name?.charAt(0) || 'U'}
                  </div>
                )}
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1E293B', maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.display_name || 'My Profile'}
                </span>
              </Link>

              <button
                onClick={logout}
                title="Sign out"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px',
                }}
                aria-label="Sign out"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.88rem' }}>
              Sign In
            </Link>
          )}
        </nav>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '6px',
            color: '#0F172A',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          className="mobile-toggle"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            background: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
          className="mobile-drawer"
        >
          <form onSubmit={handleSearchSubmit}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#F1F5F9',
                borderRadius: '8px',
                padding: '8px 12px',
                marginBottom: '8px',
              }}
            >
              <Search size={18} color="#64748B" style={{ marginRight: '8px' }} />
              <input
                type="text"
                placeholder="Search Tirunelveli directory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem' }}
              />
            </div>
          </form>

          <Link
            to="/categories"
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '10px 0', textDecoration: 'none', color: '#0F172A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Compass size={18} color="#2563EB" />
            <span>Browse Categories</span>
          </Link>

          <Link
            to="/suggest-place"
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '10px 0', textDecoration: 'none', color: '#0F172A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <PlusCircle size={18} color="#EA580C" />
            <span>Suggest a Missing Place</span>
          </Link>

          {isAdmin && (
            <Link
              to="/admin-portal"
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: '10px 0', textDecoration: 'none', color: '#7C3AED', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <ShieldCheck size={18} />
              <span>Admin & Moderation Portal</span>
            </Link>
          )}

          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '12px', marginTop: '4px' }}>
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ textDecoration: 'none', color: '#0F172A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <User size={18} color="#2563EB" />
                  <span>{user?.display_name || 'My Profile'}</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  style={{ background: 'transparent', border: 'none', color: '#DC2626', fontWeight: 600, cursor: 'pointer' }}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary"
                style={{ width: '100%', textAlign: 'center' }}
              >
                Sign In with Google
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Responsive navbar: keep desktop layout, use a menu on smaller screens. */}
      <style>{`
        .navbar-brand-title > span:first-child {
          white-space: nowrap;
        }

        .navbar-brand-title > span:last-child {
          white-space: nowrap;
          flex-shrink: 0;
        }

        @media (max-width: 767px) {
          .desktop-search {
            display: none !important;
          }

          .desktop-nav {
            display: none !important;
          }

          .mobile-toggle {
            display: flex !important;
          }

          .navbar-inner {
            gap: 10px !important;
            padding: 10px 14px !important;
          }

          .navbar-brand {
            gap: 9px !important;
          }

          .navbar-brand-location {
            white-space: nowrap;
          }

          .mobile-drawer {
            width: 100%;
            box-sizing: border-box;
          }
        }

        @media (min-width: 768px) {
          .desktop-search {
            display: block !important;
          }

          .desktop-nav {
            display: flex !important;
          }

          .mobile-toggle,
          .mobile-drawer {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}

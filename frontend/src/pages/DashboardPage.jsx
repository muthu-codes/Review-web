import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import EstablishmentCard from '../components/EstablishmentCard';
import {
  Search,
  Compass,
  MapPin,
  TrendingUp,
  Star,
  Clock,
  PlusCircle,
  Building,
  RefreshCw,
  Award,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();

  // Search state
  const [heroSearch, setHeroSearch] = useState('');

  // 9 Dashboard Sections State
  const [categories, setCategories] = useState([]);
  const [towns, setTowns] = useState([]);
  const [popularPlaces, setPopularPlaces] = useState([]);
  const [recentlyReviewed, setRecentlyReviewed] = useState([]);
  const [highestRated, setHighestRated] = useState([]);
  const [lowestRated, setLowestRated] = useState([]);
  const [recentlyAdded, setRecentlyAdded] = useState([]);
  const [recentlyUpdated, setRecentlyUpdated] = useState([]);
  const [stats, setStats] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      try {
        const [
          catsRes,
          townsRes,
          popRes,
          recentRevRes,
          highRes,
          lowRes,
          addedRes,
          updatedRes,
          statsRes
        ] = await Promise.allSettled([
          api.directory.getCategories(),
          api.directory.getTowns(),
          api.directory.getEstablishments({ sort: 'reviews_desc', page_size: 4 }),
          api.directory.getEstablishments({ sort: 'recently_reviewed', page_size: 4 }),
          api.directory.getEstablishments({ sort: 'rating_desc', page_size: 4 }),
          api.directory.getEstablishments({ sort: 'rating_asc', page_size: 4 }),
          api.directory.getEstablishments({ sort: 'newest', page_size: 4 }),
          api.directory.getEstablishments({ sort: 'recently_updated', page_size: 4 }),
          api.directory.getStats(),
        ]);

        if (catsRes.status === 'fulfilled') setCategories(catsRes.value || []);
        if (townsRes.status === 'fulfilled') setTowns(townsRes.value || []);
        if (popRes.status === 'fulfilled') setPopularPlaces(popRes.value?.results || []);
        if (recentRevRes.status === 'fulfilled') setRecentlyReviewed(recentRevRes.value?.results || []);
        if (highRes.status === 'fulfilled') setHighestRated(highRes.value?.results || []);
        if (lowRes.status === 'fulfilled') setLowestRated(lowRes.value?.results || []);
        if (addedRes.status === 'fulfilled') setRecentlyAdded(addedRes.value?.results || []);
        if (updatedRes.status === 'fulfilled') setRecentlyUpdated(updatedRes.value?.results || []);
        if (statsRes.status === 'fulfilled') setStats(statsRes.value || null);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/categories?search=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  const renderEmptyState = (title, message) => (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.65)',
        border: '1px dashed #CBD5E1',
        borderRadius: '16px',
        padding: '36px 20px',
        textAlign: 'center',
        color: '#64748B',
      }}
    >
      <div style={{ fontWeight: 600, color: '#334155', marginBottom: '4px', fontSize: '0.95rem' }}>
        {title}
      </div>
      <p style={{ fontSize: '0.82rem', maxWidth: '420px', margin: '0 auto 16px auto' }}>
        {message}
      </p>
      <Link to="/suggest-place" className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
        <PlusCircle size={14} color="#EA580C" />
        <span>Suggest an Establishment</span>
      </Link>
    </div>
  );

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px 60px 20px' }}>
      {/* Hero Section */}
      <section
        style={{
          padding: '60px 0 40px 0',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Subtle decorative heritage badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <div className="tricolour-badge">
            <MapPin size={12} color="#C2410C" />
            <span>Tirunelveli District • திருநெல்வேலி மாவட்டம்</span>
          </div>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.03em',
            lineHeight: '1.15',
            marginBottom: '16px',
          }}
        >
          Tirunelveli Reviews
        </h1>

        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: '#475569',
            maxWidth: '680px',
            margin: '0 auto 32px auto',
            lineHeight: '1.6',
          }}
        >
          Discover local places. Share your experience. Help our community.
        </p>

        {/* Hero Search Bar */}
        <form
          onSubmit={handleHeroSearch}
          style={{
            maxWidth: '620px',
            margin: '0 auto 28px auto',
          }}
        >
          <div
            className="glass-panel"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 10px 8px 18px',
              background: '#FFFFFF',
              borderRadius: '999px',
              boxShadow: '0 12px 35px -5px rgba(37, 99, 235, 0.12), 0 0 0 1px rgba(226, 232, 240, 0.8)',
            }}
          >
            <Search size={20} color="#2563EB" style={{ marginRight: '12px', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search by place name, school, hospital, temple, or locality..."
              value={heroSearch}
              onChange={(e) => setHeroSearch(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: '100%',
                fontSize: '1rem',
                color: '#0F172A',
              }}
            />
            <button
              type="submit"
              className="btn-primary"
              style={{
                borderRadius: '999px',
                padding: '10px 24px',
                flexShrink: 0,
              }}
            >
              Search
            </button>
          </div>
        </form>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
          <Link to="/categories" className="btn-secondary" style={{ borderRadius: '999px' }}>
            <Compass size={16} color="#2563EB" />
            <span>Browse Categories</span>
          </Link>
          <Link to="/suggest-place" className="btn-saffron" style={{ borderRadius: '999px' }}>
            <PlusCircle size={16} />
            <span>Suggest a Missing Place</span>
          </Link>
        </div>

        {/* Real Live Stats bar */}
        {stats && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '24px',
              marginTop: '40px',
              padding: '14px 24px',
              background: 'rgba(255, 255, 255, 0.75)',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              maxWidth: '800px',
              margin: '36px auto 0 auto',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>{stats.total_establishments}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Active Places</div>
            </div>
            <div style={{ width: '1px', background: '#E2E8F0' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669' }}>{stats.verified_establishments}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Verified Listings</div>
            </div>
            <div style={{ width: '1px', background: '#E2E8F0' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563EB' }}>{stats.total_reviews}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Community Reviews</div>
            </div>
            <div style={{ width: '1px', background: '#E2E8F0' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#D97706' }}>{stats.total_towns}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>District Towns</div>
            </div>
          </div>
        )}
      </section>

      {/* SECTION 1: Browse All Categories */}
      <section style={{ margin: '48px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>
              1. Browse All Categories
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
              Explore registered establishments and public services organized by category
            </p>
          </div>
          <Link to="/categories" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#2563EB', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>View All</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '14px',
          }}
        >
          {categories.slice(0, 12).map((cat) => (
            <Link
              key={cat.id}
              to={`/categories/${cat.slug}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div
                className="glass-panel glass-card-hover"
                style={{
                  padding: '16px',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.85)',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  height: '100%',
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: '#EFF6FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2563EB',
                  }}
                >
                  <Building size={20} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>
                  {cat.name}
                </div>
                {cat.tamil_name && (
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    {cat.tamil_name}
                  </div>
                )}
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: '#2563EB',
                    background: '#F1F5F9',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    marginTop: 'auto',
                  }}
                >
                  {cat.establishments_count || 0} places
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION 2: Popular Places in Tirunelveli */}
      <section style={{ margin: '48px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={22} color="#2563EB" />
              <span>2. Popular Places in Tirunelveli</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
              Establishments with the most verified community reviews across the district
            </p>
          </div>
        </div>

        {popularPlaces.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {popularPlaces.map((est) => (
              <EstablishmentCard key={est.id} establishment={est} />
            ))}
          </div>
        ) : (
          renderEmptyState("No Popular Places Yet", "As local citizens submit reviews, verified establishments with the highest engagement will appear here.")
        )}
      </section>

      {/* SECTION 3: Recently Reviewed Places */}
      <section style={{ margin: '48px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={22} color="#059669" />
              <span>3. Recently Reviewed Places</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
              Fresh community feedback submitted in the past days
            </p>
          </div>
        </div>

        {recentlyReviewed.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {recentlyReviewed.map((est) => (
              <EstablishmentCard key={est.id} establishment={est} />
            ))}
          </div>
        ) : (
          renderEmptyState("No Recent Reviews", "Be the first in your locality to review a school, shop, or public hospital!")
        )}
      </section>

      {/* SECTION 4: Highest-Rated Places */}
      <section style={{ margin: '48px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={22} color="#D97706" />
              <span>4. Highest-Rated Places</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
              Places with top 5-star ratings calculated from authentic published citizen experiences
            </p>
          </div>
        </div>

        {highestRated.filter((e) => e.review_count > 0).length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {highestRated.filter((e) => e.review_count > 0).map((est) => (
              <EstablishmentCard key={est.id} establishment={est} />
            ))}
          </div>
        ) : (
          renderEmptyState("No Rated Places Yet", "Ratings are strictly computed from published citizen reviews. No fake ratings are fabricated.")
        )}
      </section>

      {/* SECTION 5: Lowest-Rated Places (Displayed Neutrally) */}
      <section style={{ margin: '48px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={22} color="#64748B" />
              <span>5. Lowest-Rated Places (Neutral Display)</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
              Establishments that received critical feedback, helping visitors and management understand areas needing improvement
            </p>
          </div>
        </div>

        {lowestRated.filter((e) => e.review_count > 0).length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {lowestRated.filter((e) => e.review_count > 0).map((est) => (
              <EstablishmentCard key={est.id} establishment={est} />
            ))}
          </div>
        ) : (
          renderEmptyState("No Places in This Section", "When critical citizen feedback is published, listings will appear here neutrally without sensationalism.")
        )}
      </section>

      {/* SECTION 6: Recently Added Establishments */}
      <section style={{ margin: '48px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>
              6. Recently Added Establishments
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
              New listings added to the Tirunelveli district directory
            </p>
          </div>
        </div>

        {recentlyAdded.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {recentlyAdded.map((est) => (
              <EstablishmentCard key={est.id} establishment={est} />
            ))}
          </div>
        ) : (
          renderEmptyState("No Establishments Added Yet", "The directory expands through lawful CSV imports and approved public suggestions.")
        )}
      </section>

      {/* SECTION 7: Explore by Town or Locality */}
      <section style={{ margin: '48px 0' }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={22} color="#EA580C" />
            <span>7. Explore by Town or Locality</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Filter places across major municipal and revenue centres in Tirunelveli District
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {towns.map((t) => (
            <Link
              key={t.id}
              to={`/categories?town=${t.slug}`}
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '999px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                color: '#1E293B',
                fontWeight: 600,
                fontSize: '0.9rem',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#2563EB';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <MapPin size={14} color="#EA580C" />
              <span>{t.name}</span>
              {t.tamil_name && <span style={{ color: '#64748B', fontSize: '0.8rem' }}>({t.tamil_name})</span>}
              <span style={{ fontSize: '0.72rem', background: '#F1F5F9', color: '#475569', padding: '2px 6px', borderRadius: '999px' }}>
                {t.establishments_count || 0}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION 8: Recently Updated Listings */}
      <section style={{ margin: '48px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RefreshCw size={20} color="#2563EB" />
              <span>8. Recently Updated Listings</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
              Directory entries whose contact, hours, address, or verification details were recently updated
            </p>
          </div>
        </div>

        {recentlyUpdated.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {recentlyUpdated.map((est) => (
              <EstablishmentCard key={est.id} establishment={est} />
            ))}
          </div>
        ) : (
          renderEmptyState("No Recently Updated Listings", "Listings will appear here when contact information or verification audits are completed.")
        )}
      </section>

      {/* SECTION 9: Suggest a Missing Place Card Banner */}
      <section
        className="glass-panel"
        style={{
          margin: '60px 0 20px 0',
          padding: '40px 32px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(239, 246, 255, 0.9) 100%)',
          borderRadius: '24px',
          border: '1px solid #BFDBFE',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          <div className="tricolour-badge" style={{ marginBottom: '12px' }}>
            <span>Community Directory Growth</span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
            9. Suggest a Missing Place in Tirunelveli
          </h2>
          <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: '1.6' }}>
            Know a popular hospital, school, market, temple, or shop in your town or village that isn't listed yet? Submit its details for our verification team to review and add to the public directory.
          </p>
        </div>

        <Link to="/suggest-place" className="btn-saffron" style={{ padding: '12px 28px', fontSize: '1rem', borderRadius: '999px' }}>
          <PlusCircle size={18} />
          <span>Suggest an Establishment</span>
        </Link>
      </section>
    </div>
  );
}

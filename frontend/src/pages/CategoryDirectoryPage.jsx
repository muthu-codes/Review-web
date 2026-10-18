import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import EstablishmentCard from '../components/EstablishmentCard';
import {
  Search,
  Filter,
  ArrowUpDown,
  RotateCcw,
  MapPin,
  ShieldCheck,
  Building,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  AlertCircle
} from 'lucide-react';

export default function CategoryDirectoryPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [towns, setTowns] = useState([]);
  const [localities, setLocalities] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedTown, setSelectedTown] = useState(searchParams.get('town') || '');
  const [selectedLocality, setSelectedLocality] = useState(searchParams.get('locality') || '');
  const [selectedVerification, setSelectedVerification] = useState(searchParams.get('verification') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'alpha_asc');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  // Listings State
  const [establishments, setEstablishments] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Fetch Categories and Towns reference data
  useEffect(() => {
    Promise.all([api.directory.getCategories(), api.directory.getTowns()])
      .then(([cats, twns]) => {
        setCategories(cats || []);
        setTowns(twns || []);
      })
      .catch((err) => console.error("Error loading categories/towns:", err));
  }, []);

  // 2. Fetch Localities when Town is selected
  useEffect(() => {
    if (selectedTown) {
      api.directory.getLocalities({ town_slug: selectedTown })
        .then((locs) => setLocalities(locs || []))
        .catch((err) => console.error("Error loading localities:", err));
    } else {
      setLocalities([]);
      setSelectedLocality('');
    }
  }, [selectedTown]);

  // 3. Determine current active category from route slug
  useEffect(() => {
    if (slug && categories.length > 0) {
      const match = categories.find((c) => c.slug === slug);
      setCurrentCategory(match || null);
    } else {
      setCurrentCategory(null);
    }
  }, [slug, categories]);

  // 4. Fetch Establishments based on filters, search, sorting, and pagination
  useEffect(() => {
    async function fetchListings() {
      setIsLoading(true);
      setError('');
      try {
        const params = {
          page,
          page_size: 12,
          sort: sortBy,
        };

        if (slug) params.category = slug;
        if (searchQuery.trim()) params.search = searchQuery.trim();
        if (selectedTown) params.town = selectedTown;
        if (selectedLocality) params.locality = selectedLocality;
        if (selectedVerification) params.verification_status = selectedVerification;

        const resp = await api.directory.getEstablishments(params);
        setEstablishments(resp.results || []);
        setTotalCount(resp.count || 0);
      } catch (err) {
        setError(err.data?.error || err.message || 'Failed to retrieve listings.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchListings();
  }, [slug, searchQuery, selectedTown, selectedLocality, selectedVerification, sortBy, page]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedTown('');
    setSelectedLocality('');
    setSelectedVerification('');
    setSortBy('alpha_asc');
    setPage(1);
    setSearchParams({});
  };

  const totalPages = Math.ceil(totalCount / 12);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 20px 60px 20px' }}>
      {/* Category Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Link to="/" style={{ color: '#64748B', textDecoration: 'none', fontSize: '0.85rem' }}>Home</Link>
          <span style={{ color: '#CBD5E1' }}>/</span>
          <Link to="/categories" style={{ color: '#64748B', textDecoration: 'none', fontSize: '0.85rem' }}>Categories</Link>
          {currentCategory && (
            <>
              <span style={{ color: '#CBD5E1' }}>/</span>
              <span style={{ color: '#2563EB', fontSize: '0.85rem', fontWeight: 600 }}>{currentCategory.name}</span>
            </>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
              {currentCategory ? currentCategory.name : 'All Directory Establishments'}
            </h1>
            {currentCategory?.tamil_name && (
              <p style={{ fontSize: '1rem', color: '#64748B', fontWeight: 500, marginTop: '2px' }}>
                {currentCategory.tamil_name}
              </p>
            )}
            <p style={{ fontSize: '0.88rem', color: '#475569', marginTop: '6px' }}>
              {currentCategory?.description || 'Browse, filter, and discover verified local establishments across Tirunelveli District.'}
            </p>
          </div>

          <div style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 600 }}>
            Showing {establishments.length} of {totalCount} {totalCount === 1 ? 'place' : 'places'}
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '20px',
          borderRadius: '18px',
          background: 'rgba(255, 255, 255, 0.9)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
          marginBottom: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              placeholder="Search by name (English or தமிழ்)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.88rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Filter: Town */}
          <div>
            <select
              value={selectedTown}
              onChange={(e) => {
                setSelectedTown(e.target.value);
                setPage(1);
              }}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.88rem',
                outline: 'none',
                background: '#FFFFFF',
              }}
            >
              <option value="">All Towns in Tirunelveli</option>
              {towns.map((t) => (
                <option key={t.id} value={t.slug}>
                  {t.name} {t.tamil_name ? `(${t.tamil_name})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Filter: Locality (visible when town chosen) */}
          <div>
            <select
              value={selectedLocality}
              disabled={!selectedTown || localities.length === 0}
              onChange={(e) => {
                setSelectedLocality(e.target.value);
                setPage(1);
              }}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.88rem',
                outline: 'none',
                background: !selectedTown ? '#F1F5F9' : '#FFFFFF',
              }}
            >
              <option value="">All Localities</option>
              {localities.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} {loc.postal_code ? `(${loc.postal_code})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Filter: Verification Status */}
          <div>
            <select
              value={selectedVerification}
              onChange={(e) => {
                setSelectedVerification(e.target.value);
                setPage(1);
              }}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.88rem',
                outline: 'none',
                background: '#FFFFFF',
              }}
            >
              <option value="">All Verification States</option>
              <option value="official_verified">Official Registration Verified</option>
              <option value="checked">Checked by Review Web</option>
              <option value="listed">Listed</option>
            </select>
          </div>

          {/* Sort By dropdown */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.88rem',
                outline: 'none',
                background: '#FFFFFF',
                fontWeight: 600,
              }}
            >
              <option value="alpha_asc">Alphabetical: A to Z</option>
              <option value="alpha_desc">Alphabetical: Z to A</option>
              <option value="rating_desc">Highest Star Rating</option>
              <option value="rating_asc">Lowest Star Rating (Neutral)</option>
              <option value="reviews_desc">Most Reviewed</option>
              <option value="newest">Recently Added</option>
            </select>
          </div>
        </div>

        {/* Clear Filters indicator */}
        {(searchQuery || selectedTown || selectedLocality || selectedVerification || sortBy !== 'alpha_asc') && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', borderTop: '1px solid #F1F5F9', paddingTop: '10px' }}>
            <button
              onClick={handleResetFilters}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#EA580C',
                fontSize: '0.82rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <RotateCcw size={13} />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Directory Listings Grid */}
      {isLoading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748B' }}>
          <div style={{ fontSize: '1rem', fontWeight: 600 }}>Loading listings...</div>
        </div>
      ) : error ? (
        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
          {error}
        </div>
      ) : establishments.length === 0 ? (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px dashed #CBD5E1',
            borderRadius: '20px',
            padding: '48px 24px',
            textAlign: 'center',
            color: '#64748B',
          }}
        >
          <Building size={40} color="#94A3B8" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
            No listings found
          </h3>
          <p style={{ fontSize: '0.88rem', maxWidth: '440px', margin: '0 auto 20px auto' }}>
            No establishments matched your current search and filter criteria. You can suggest this missing establishment to help expand the directory!
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button onClick={handleResetFilters} className="btn-secondary" style={{ padding: '8px 18px', fontSize: '0.88rem' }}>
              Clear Filters
            </button>
            <Link to="/suggest-place" className="btn-saffron" style={{ padding: '8px 18px', fontSize: '0.88rem' }}>
              <PlusCircle size={15} />
              <span>Suggest Place</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '24px',
              marginBottom: '36px',
            }}
          >
            {establishments.map((est) => (
              <EstablishmentCard key={est.id} establishment={est} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '32px',
              }}
            >
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>

              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#475569', margin: '0 10px' }}>
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

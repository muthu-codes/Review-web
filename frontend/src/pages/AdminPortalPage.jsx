import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import {
  ShieldCheck,
  Upload,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Layers,
  Search,
  Eye,
  Activity,
  UserCheck,
  Building,
  Flag
} from 'lucide-react';

export default function AdminPortalPage() {
  const { user, isAdmin, isModerator } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'reports', 'suggestions', 'csv', 'duplicates'
  const [overview, setOverview] = useState(null);
  const [reports, setReports] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // CSV Import State
  const [csvFile, setCsvFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importReport, setImportReport] = useState(null);
  const [importError, setImportError] = useState('');

  // Duplicate Check State
  const [dupName, setDupName] = useState('');
  const [dupTown, setDupTown] = useState('');
  const [dupResults, setDupResults] = useState(null);
  const [isCheckingDup, setIsCheckingDup] = useState(false);

  useEffect(() => {
    if (!isAdmin && !isModerator) {
      navigate('/login');
      return;
    }
    loadData();
  }, [isAdmin, isModerator, navigate]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [overviewRes, repRes, sugRes] = await Promise.all([
        api.admin.getDashboardOverview().catch(() => null),
        api.admin.getReportsQueue('pending').catch(() => []),
        api.admin.getSuggestions().catch(() => []),
      ]);

      setOverview(overviewRes);
      setReports(repRes.results || repRes || []);
      setSuggestions(sugRes.results || sugRes || []);
      if (overviewRes?.recent_audit_logs) {
        setAuditLogs(overviewRes.recent_audit_logs);
      }
    } catch (err) {
      console.error("Admin portal load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModerationDecision = async (reportId, decision) => {
    const notes = prompt("Enter administrative notes for audit log (optional):") || '';
    try {
      await api.admin.submitModerationDecision(reportId, decision, notes);
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      loadData();
    } catch (err) {
      alert(err.data?.error || 'Action failed.');
    }
  };

  const handleApproveSuggestion = async (sugId) => {
    if (window.confirm("Approve this place suggestion and create unverified directory listing?")) {
      try {
        await api.admin.approveSuggestion(sugId);
        setSuggestions((prev) => prev.map((s) => s.id === sugId ? { ...s, status: 'approved' } : s));
        alert("Suggestion approved and establishment listing added as pending verification.");
      } catch (err) {
        alert(err.data?.error || 'Approval failed.');
      }
    }
  };

  const handleCSVUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) return;

    setIsImporting(true);
    setImportReport(null);
    setImportError('');
    try {
      const res = await api.admin.uploadCSV(csvFile);
      setImportReport(res);
      loadData();
    } catch (err) {
      setImportError(err.data?.error || err.message || 'CSV Import failed.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleCheckDuplicates = async (e) => {
    e.preventDefault();
    if (!dupName.trim()) return;

    setIsCheckingDup(true);
    try {
      const res = await api.admin.checkDuplicates(dupName.trim(), dupTown);
      setDupResults(res.potential_duplicates || []);
    } catch (err) {
      alert(err.data?.error || 'Duplicate search failed.');
    } finally {
      setIsCheckingDup(false);
    }
  };

  if (!isAdmin && !isModerator) return null;

  return (
    <div style={{ maxWidth: '1280px', margin: '32px auto', padding: '0 20px 80px 20px' }}>
      {/* Portal Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#EDE9FE', color: '#6D28D9', padding: '3px 10px', borderRadius: '999px' }}>
              Restricted Administrative Portal
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Tirunelveli District Moderation & Management
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#64748B' }}>
            Logged in as {user?.email} ({user?.display_name})
          </p>
        </div>

        <a
          href="/admin/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary"
          style={{ fontSize: '0.88rem', padding: '8px 16px' }}
        >
          <span>Django Admin Backend</span>
        </a>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          borderBottom: '1px solid #E2E8F0',
          marginBottom: '28px',
          paddingBottom: '4px',
        }}
      >
        {[
          { key: 'overview', label: 'Overview Metrics', icon: Activity },
          { key: 'reports', label: `Flagged Reviews Queue (${reports.length})`, icon: Flag },
          { key: 'suggestions', label: `Public Suggestions (${suggestions.filter(s => s.status === 'pending').length})`, icon: Building },
          { key: 'csv', label: 'CSV Directory Ingestion', icon: Upload },
          { key: 'duplicates', label: 'Duplicate Detector', icon: Search },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.88rem',
                background: isActive ? '#1E3A8A' : 'transparent',
                color: isActive ? '#FFFFFF' : '#475569',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW METRICS */}
      {activeTab === 'overview' && overview && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '36px' }}>
            <div className="glass-panel" style={{ padding: '20px', background: '#FFFFFF', borderRadius: '16px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Total Places</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', marginTop: '6px' }}>{overview.total_establishments}</div>
            </div>

            <div className="glass-panel" style={{ padding: '20px', background: '#FFFFFF', borderRadius: '16px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>Verified Places</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#059669', marginTop: '6px' }}>{overview.verified_establishments}</div>
            </div>

            <div className="glass-panel" style={{ padding: '20px', background: '#FFFFFF', borderRadius: '16px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#D97706', textTransform: 'uppercase' }}>Pending Places</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#D97706', marginTop: '6px' }}>{overview.pending_establishments}</div>
            </div>

            <div className="glass-panel" style={{ padding: '20px', background: '#FFFFFF', borderRadius: '16px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#DC2626', textTransform: 'uppercase' }}>Pending Reports</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#DC2626', marginTop: '6px' }}>{overview.pending_review_reports}</div>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="glass-panel" style={{ padding: '24px', background: '#FFFFFF', borderRadius: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '16px' }}>
              Recent Administrative Audit Trail
            </h3>
            {auditLogs.length === 0 ? (
              <p style={{ color: '#64748B', fontSize: '0.88rem' }}>No recent audit actions logged.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#64748B' }}>
                      <th style={{ padding: '10px' }}>Timestamp</th>
                      <th style={{ padding: '10px' }}>Admin</th>
                      <th style={{ padding: '10px' }}>Action</th>
                      <th style={{ padding: '10px' }}>Target Entity</th>
                      <th style={{ padding: '10px' }}>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '10px', color: '#64748B' }}>
                          {new Date(log.timestamp).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '10px', fontWeight: 600 }}>{log.user_email || 'System'}</td>
                        <td style={{ padding: '10px' }}>
                          <span style={{ background: '#F1F5F9', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                            {log.action}
                          </span>
                        </td>
                        <td style={{ padding: '10px' }}>{log.entity_type} #{log.entity_id.substring(0, 8)}</td>
                        <td style={{ padding: '10px', color: '#475569' }}>{JSON.stringify(log.details)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FLAGGED REVIEWS QUEUE */}
      {activeTab === 'reports' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A' }}>
              Pending Flagged Reviews
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
              Review reports submitted by local citizens for defamatory, abusive, fake, or privacy-violating content.
            </p>
          </div>

          {reports.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', background: '#FFFFFF', borderRadius: '16px', border: '1px dashed #CBD5E1', color: '#64748B' }}>
              <CheckCircle2 size={36} color="#059669" style={{ margin: '0 auto 10px auto' }} />
              <div style={{ fontWeight: 700, color: '#0F172A' }}>Moderation Queue Empty</div>
              <p style={{ fontSize: '0.85rem' }}>No pending review reports require action at this time.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {reports.map((rep) => (
                <div key={rep.id} className="glass-panel" style={{ padding: '24px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#FEE2E2', color: '#991B1B', padding: '3px 8px', borderRadius: '4px' }}>
                        Flag Reason: {rep.reason}
                      </span>
                      <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '6px' }}>
                        Reported by: {rep.reported_by_email} on {new Date(rep.created_at).toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleModerationDecision(rep.id, 'dismiss')}
                        className="btn-secondary"
                        style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                      >
                        Dismiss Report
                      </button>
                      <button
                        onClick={() => handleModerationDecision(rep.id, 'uphold_and_hide')}
                        className="btn-primary"
                        style={{ background: '#DC2626', padding: '6px 14px', fontSize: '0.82rem' }}
                      >
                        Uphold & Hide Review
                      </button>
                    </div>
                  </div>

                  <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '10px', marginBottom: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                      Citizen Report Context:
                    </div>
                    <p style={{ fontSize: '0.88rem', color: '#0F172A' }}>{rep.details}</p>
                  </div>

                  {rep.review && (
                    <div style={{ padding: '14px', borderRadius: '10px', border: '1px solid #CBD5E1' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>
                        Content of Review on {rep.review.establishment_name} ({rep.review.rating}★ by {rep.review.user?.name}):
                      </div>
                      <p style={{ fontSize: '0.9rem', color: '#1E293B' }}>{rep.review.comment}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PUBLIC SUGGESTIONS */}
      {activeTab === 'suggestions' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A' }}>
              Public Establishment Suggestions
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
              Places submitted by citizens awaiting administrative review and approval.
            </p>
          </div>

          {suggestions.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', background: '#FFFFFF', borderRadius: '16px', border: '1px dashed #CBD5E1', color: '#64748B' }}>
              <p>No missing establishment suggestions currently submitted.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {suggestions.map((sug) => (
                <div key={sug.id} className="glass-panel" style={{ padding: '24px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                        {sug.name}
                      </h4>
                      {sug.tamil_name && <div style={{ fontSize: '0.85rem', color: '#64748B' }}>{sug.tamil_name}</div>}
                      <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px' }}>
                        {sug.category_name} • {sug.locality_name ? `${sug.locality_name}, ` : ''}{sug.town_name}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, background: sug.status === 'approved' ? '#ECFDF5' : '#FEF3C7', color: sug.status === 'approved' ? '#065F46' : '#92400E', padding: '3px 8px', borderRadius: '4px' }}>
                        {sug.status}
                      </span>
                      {sug.status === 'pending' && (
                        <button
                          onClick={() => handleApproveSuggestion(sug.id)}
                          className="btn-primary"
                          style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                        >
                          Approve & List
                        </button>
                      )}
                    </div>
                  </div>

                  <p style={{ fontSize: '0.88rem', color: '#334155', marginBottom: '8px' }}>
                    <strong>Address:</strong> {sug.address}
                  </p>
                  {sug.notes && (
                    <p style={{ fontSize: '0.82rem', color: '#64748B' }}>
                      <strong>Submitter Notes:</strong> {sug.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CSV DIRECTORY INGESTION */}
      {activeTab === 'csv' && (
        <div style={{ maxWidth: '800px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A' }}>
              CSV Directory Ingestion Pipeline
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: '1.5' }}>
              Import permitted establishment records in bulk. <strong>Crucial Rule:</strong> All imported records are created with status <em>pending_verification</em> and will not be marked as verified automatically.
            </p>
          </div>

          <form onSubmit={handleCSVUpload} className="glass-panel" style={{ padding: '28px', background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', marginBottom: '28px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#1E293B', marginBottom: '8px' }}>
                Select CSV File (UTF-8)
              </label>
              <input
                type="file"
                accept=".csv"
                required
                onChange={(e) => setCsvFile(e.target.files[0])}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px dashed #CBD5E1',
                  background: '#F8FAFC',
                }}
              />
              <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '6px' }}>
                Required columns: <code>name, category_slug, town_name, address_line1</code>. Optional: <code>tamil_name, locality_name, phone, website</code>.
              </div>
            </div>

            <button
              type="submit"
              disabled={isImporting || !csvFile}
              className="btn-primary"
              style={{ padding: '10px 24px' }}
            >
              <Upload size={16} />
              <span>{isImporting ? 'Validating & Importing...' : 'Upload & Process CSV'}</span>
            </button>
          </form>

          {importError && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '14px', borderRadius: '10px', marginBottom: '20px' }}>
              {importError}
            </div>
          )}

          {importReport && (
            <div className="glass-panel" style={{ padding: '24px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '12px' }}>
                Import Validation Report
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '18px' }}>
                <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Total Processed</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{importReport.total_rows}</div>
                </div>
                <div style={{ padding: '12px', background: '#ECFDF5', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#065F46' }}>Successfully Imported</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669' }}>{importReport.successful_imports}</div>
                </div>
                <div style={{ padding: '12px', background: '#FEF2F2', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#991B1B' }}>Rejected Rows</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#DC2626' }}>{importReport.rejected_rows.length}</div>
                </div>
              </div>

              {/* Duplicates notice */}
              {importReport.duplicates_detected.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#D97706', marginBottom: '8px' }}>
                    Potential Duplicate Warnings ({importReport.duplicates_detected.length})
                  </h5>
                  <div style={{ fontSize: '0.82rem', color: '#475569', maxHeight: '160px', overflowY: 'auto' }}>
                    {importReport.duplicates_detected.map((d, idx) => (
                      <div key={idx} style={{ padding: '6px 0', borderBottom: '1px solid #F1F5F9' }}>
                        Row {d.row}: <strong>{d.proposed_name}</strong> - {d.matches[0]?.reason}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: DUPLICATE DETECTOR */}
      {activeTab === 'duplicates' && (
        <div style={{ maxWidth: '720px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A' }}>
              Directory Duplicate Detector
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
              Check if an establishment or variant already exists in Tirunelveli district directory before adding new entries.
            </p>
          </div>

          <form onSubmit={handleCheckDuplicates} className="glass-panel" style={{ padding: '24px', background: '#FFFFFF', borderRadius: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <input
                type="text"
                required
                placeholder="Enter establishment name to check..."
                value={dupName}
                onChange={(e) => setDupName(e.target.value)}
                style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
              />
              <button type="submit" disabled={isCheckingDup} className="btn-primary" style={{ padding: '10px 20px' }}>
                <Search size={16} />
                <span>{isCheckingDup ? 'Checking...' : 'Check Matches'}</span>
              </button>
            </div>
          </form>

          {dupResults && (
            <div className="glass-panel" style={{ padding: '24px', background: '#FFFFFF', borderRadius: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '12px' }}>
                Potential Matches Found: {dupResults.length}
              </h4>
              {dupResults.length === 0 ? (
                <p style={{ color: '#059669', fontSize: '0.88rem' }}>
                  No potential duplicates detected. This listing appears unique in the directory.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {dupResults.map((m, idx) => (
                    <div key={idx} style={{ padding: '12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontWeight: 700, color: '#0F172A' }}>{m.name} ({m.town})</div>
                      <div style={{ fontSize: '0.8rem', color: '#D97706', fontWeight: 600 }}>Confidence: {m.confidence}</div>
                      <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '2px' }}>{m.reason}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

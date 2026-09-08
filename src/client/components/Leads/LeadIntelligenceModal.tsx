import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Globe,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Activity,
  Layers,
  X,
} from 'lucide-react';
import { ILead } from '../../../core/types/lead.types';
import { ILeadIntelligenceProfile, IResearchRun } from '../../../core/types/lead-intelligence.types';
import { apiService } from '../../services/api.service';

interface LeadIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: ILead | null;
  onLeadUpdated: () => void;
  onOpenProvenance: () => void;
}

export const LeadIntelligenceModal: React.FC<LeadIntelligenceModalProps> = ({
  isOpen,
  onClose,
  lead,
  onLeadUpdated,
  onOpenProvenance,
}) => {
  const [profile, setProfile] = useState<ILeadIntelligenceProfile | null>(lead?.intelligenceProfile || null);
  const [runs, setRuns] = useState<IResearchRun[]>([]);
  const [isResearching, setIsResearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DIMENSIONS' | 'GAPS_SERVICES' | 'HISTORY'>('OVERVIEW');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lead) {
      setProfile(lead.intelligenceProfile || null);
      loadHistory(lead.id);
    }
  }, [lead]);

  const loadHistory = async (leadId: string) => {
    try {
      const history = await apiService.getResearchRuns(leadId);
      setRuns(history);
    } catch {
      // ignore
    }
  };

  const handleRunResearch = async () => {
    if (!lead) return;
    setIsResearching(true);
    setError(null);

    try {
      const result = await apiService.runResearch({
        leadId: lead.id,
        url: lead.website,
        businessName: lead.businessName,
        location: lead.location,
      });

      if (result.success && result.profile) {
        setProfile(result.profile);
        await loadHistory(lead.id);
        onLeadUpdated();
      } else {
        setError(result.error || 'Failed to complete research scan');
      }
    } catch (err: any) {
      setError(err.message || 'Error executing research pipeline');
    } finally {
      setIsResearching(false);
    }
  };

  if (!isOpen || !lead) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#06B6D4';
    if (score >= 40) return '#F59E0B';
    return '#EF4444';
  };

  const getIdentityBadge = (status?: string) => {
    switch (status) {
      case 'CONFIDENT':
        return <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 11, background: 'rgba(16,185,129,0.15)', color: '#10B981', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={12} /> CONFIDENT</span>;
      case 'PROBABLE':
        return <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 11, background: 'rgba(6,182,212,0.15)', color: '#06B6D4', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Activity size={12} /> PROBABLE</span>;
      default:
        return <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 11, background: 'rgba(239,68,68,0.15)', color: '#EF4444', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}><AlertTriangle size={12} /> AMBIGUOUS</span>;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 20,
    }}>
      <div style={{
        background: '#0B1120',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 16,
        width: '100%',
        maxWidth: 1000,
        height: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0F172A' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(6,182,212,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Search size={22} color="#06B6D4" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3 style={{ margin: 0, fontSize: 19, color: '#F8FAFC' }}>{lead.businessName}</h3>
                {getIdentityBadge(profile?.identity?.confidence || lead.identityConfidence)}
              </div>
              <p style={{ margin: '3px 0 0', fontSize: 12.5, color: '#94A3B8' }}>
                {lead.location} • {lead.industry} {lead.website && `• ${lead.website}`}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={handleRunResearch}
              disabled={isResearching}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: isResearching ? 0.7 : 1 }}
            >
              <RefreshCw size={14} className={isResearching ? 'animate-spin' : ''} />
              <span>{isResearching ? 'Scanning Live Evidence...' : 'Re-Audit Lead'}</span>
            </button>
            <button
              onClick={onOpenProvenance}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <ShieldCheck size={14} color="#6366F1" />
              <span>Provenance</span>
            </button>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 4 }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(15, 23, 42, 0.6)', padding: '0 24px' }}>
          {[
            { id: 'OVERVIEW', label: 'Intelligence Overview' },
            { id: 'DIMENSIONS', label: 'Dimensional Health' },
            { id: 'GAPS_SERVICES', label: 'Gaps & Service Matches' },
            { id: 'HISTORY', label: `Scan History (${runs.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '12px 16px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #06B6D4' : '2px solid transparent',
                color: activeTab === tab.id ? '#38BDF8' : '#94A3B8',
                fontSize: 13,
                fontWeight: activeTab === tab.id ? 600 : 400,
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div style={{ padding: 24, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {error && (
            <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', fontSize: 13 }}>
              {error}
            </div>
          )}

          {!profile ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94A3B8' }}>
              <Search size={40} color="#06B6D4" style={{ marginBottom: 12, opacity: 0.8 }} />
              <h4 style={{ fontSize: 16, color: '#F1F5F9', margin: '0 0 8px' }}>No Live Intelligence Profile Generated Yet</h4>
              <p style={{ fontSize: 13, maxWidth: 450, margin: '0 auto 20px' }}>
                Run the real web research pipeline to audit the live DOM, measure server latency, inspect SEO architecture, and detect gaps.
              </p>
              <button onClick={handleRunResearch} disabled={isResearching} className="btn btn-primary">
                <Sparkles size={16} />
                <span>Run First Intelligence Scan</span>
              </button>
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'OVERVIEW' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {/* Scores Top Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                    <div className="glass-card" style={{ padding: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase' }}>Lead Score</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: getScoreColor(profile.leadScoring.leadScore), marginTop: 4 }}>
                        {profile.leadScoring.leadScore}/100
                      </div>
                      <div style={{ fontSize: 11, color: '#CBD5E1', marginTop: 2 }}>{profile.leadScoring.qualification}</div>
                    </div>

                    <div className="glass-card" style={{ padding: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase' }}>Digital Presence</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: getScoreColor(profile.digitalPresence.overallScore), marginTop: 4 }}>
                        {profile.digitalPresence.overallScore}/100
                      </div>
                      <div style={{ fontSize: 11, color: '#CBD5E1', marginTop: 2 }}>6 Weighted Dimensions</div>
                    </div>

                    <div className="glass-card" style={{ padding: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase' }}>Initial Latency</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: profile.website.responseTimeMs < 2000 ? '#10B981' : '#EF4444', marginTop: 4 }}>
                        {profile.website.responseTimeMs}ms
                      </div>
                      <div style={{ fontSize: 11, color: '#CBD5E1', marginTop: 2 }}>{profile.website.detectedCms}</div>
                    </div>

                    <div className="glass-card" style={{ padding: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase' }}>Verified Gaps</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: '#F59E0B', marginTop: 4 }}>
                        {profile.verifiedGaps.length}
                      </div>
                      <div style={{ fontSize: 11, color: '#CBD5E1', marginTop: 2 }}>Actionable Opportunities</div>
                    </div>
                  </div>

                  {/* Public Contact & Triggers Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {/* Public Contacts */}
                    <div className="glass-card" style={{ padding: 18 }}>
                      <h4 style={{ fontSize: 13, textTransform: 'uppercase', color: '#94A3B8', margin: '0 0 12px' }}>Verified Public Contacts</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#CBD5E1' }}>
                            <Phone size={14} color="#06B6D4" /> Phone:
                          </span>
                          <span style={{ color: profile.contact.publicPhones.length > 0 ? '#38BDF8' : '#EF4444', fontWeight: 500 }}>
                            {profile.contact.publicPhones.map(p => p.value).join(', ') || 'UNKNOWN'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#CBD5E1' }}>
                            <Mail size={14} color="#06B6D4" /> Email:
                          </span>
                          <span style={{ color: profile.contact.publicEmails.length > 0 ? '#38BDF8' : '#EF4444', fontWeight: 500 }}>
                            {profile.contact.publicEmails.map(e => e.value).join(', ') || 'UNKNOWN'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#CBD5E1' }}>
                            <Calendar size={14} color="#06B6D4" /> Online Booking:
                          </span>
                          <span style={{ color: profile.contact.bookingLinks.length > 0 ? '#10B981' : '#EF4444', fontWeight: 500 }}>
                            {profile.contact.bookingLinks.length > 0 ? 'Verified Link' : 'UNKNOWN / Absent'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Conversion Signals */}
                    <div className="glass-card" style={{ padding: 18 }}>
                      <h4 style={{ fontSize: 13, textTransform: 'uppercase', color: '#94A3B8', margin: '0 0 12px' }}>Conversion & Search Signals</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ color: '#CBD5E1' }}>WhatsApp Click-to-Chat:</span>
                          <span style={{ color: profile.conversion.hasWhatsAppWidget ? '#10B981' : '#EF4444', fontWeight: 600 }}>
                            {profile.conversion.hasWhatsAppWidget ? 'DETECTED' : 'MISSING'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ color: '#CBD5E1' }}>LocalBusiness JSON-LD Schema:</span>
                          <span style={{ color: profile.localSearch.hasLocalBusinessSchema ? '#10B981' : '#EF4444', fontWeight: 600 }}>
                            {profile.localSearch.hasLocalBusinessSchema ? 'DETECTED' : 'MISSING'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ color: '#CBD5E1' }}>robots.txt Configuration:</span>
                          <span style={{ color: profile.seo.robotsTxtStatus === 'AVAILABLE' ? '#10B981' : '#EF4444', fontWeight: 600 }}>
                            {profile.seo.robotsTxtStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: DIMENSIONAL HEALTH */}
              {activeTab === 'DIMENSIONS' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {profile.digitalPresence.dimensions.map((dim, idx) => (
                    <div key={idx} className="glass-card" style={{ padding: 18 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <div style={{ fontWeight: 600, fontSize: 15, color: '#F8FAFC' }}>{dim.name}</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: getScoreColor(dim.score) }}>{dim.score}/100</div>
                      </div>

                      {/* Progress Bar */}
                      <div style={{ width: '100%', height: 6, background: '#1E293B', borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
                        <div style={{ width: `${dim.score}%`, height: '100%', background: getScoreColor(dim.score), transition: 'width 0.4s ease' }} />
                      </div>

                      {/* Reasons Breakdown */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5 }}>
                        {dim.reasons.map((r, rIdx) => (
                          <div key={rIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: '#CBD5E1' }}>
                            {r.type === 'BONUS' ? (
                              <CheckCircle2 size={14} color="#10B981" style={{ marginTop: 2, flexShrink: 0 }} />
                            ) : (
                              <XCircle size={14} color="#EF4444" style={{ marginTop: 2, flexShrink: 0 }} />
                            )}
                            <div>
                              <span>{r.description}</span>
                              <span style={{ color: '#64748B', marginLeft: 6 }}>({r.evidence})</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: GAPS & SERVICES */}
              {activeTab === 'GAPS_SERVICES' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {/* Verified Gaps */}
                  <div className="glass-card" style={{ padding: 18 }}>
                    <h4 style={{ fontSize: 14, color: '#EF4444', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <AlertTriangle size={16} /> Verified Technical Gaps ({profile.verifiedGaps.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {profile.verifiedGaps.map((g, i) => (
                        <div key={i} style={{ padding: 10, borderRadius: 6, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 12.5, color: '#F1F5F9' }}>
                          {g}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Matched PrimeSoul Services */}
                  <div className="glass-card" style={{ padding: 18 }}>
                    <h4 style={{ fontSize: 14, color: '#10B981', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Sparkles size={16} /> Matched PrimeSoul Solutions ({profile.recommendedServices.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {profile.recommendedServices.map((s, i) => (
                        <div key={i} style={{ padding: 12, borderRadius: 8, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontWeight: 600, fontSize: 13, color: '#F8FAFC' }}>{s.serviceName}</div>
                            <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#10B981', color: '#000', fontWeight: 700 }}>
                              {s.priority}
                            </span>
                          </div>
                          <p style={{ margin: '6px 0 0', fontSize: 12, color: '#94A3B8' }}>{s.rationale}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: SCAN HISTORY */}
              {activeTab === 'HISTORY' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {runs.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#64748B', padding: 40 }}>No previous scan history recorded.</div>
                  ) : (
                    runs.map((r, i) => (
                      <div key={i} className="glass-card" style={{ padding: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Clock size={14} color="#06B6D4" />
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9' }}>Scan Run: {r.runId}</span>
                            <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, background: r.status === 'COMPLETED' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: r.status === 'COMPLETED' ? '#10B981' : '#EF4444' }}>
                              {r.status}
                            </span>
                          </div>
                          <span style={{ fontSize: 11.5, color: '#64748B' }}>{new Date(r.timestamp).toLocaleString()}</span>
                        </div>

                        {/* Changes Detected */}
                        {r.changesFromPrevious?.hasChanges ? (
                          <div style={{ marginTop: 8, padding: 10, borderRadius: 6, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', fontSize: 12 }}>
                            <div style={{ fontWeight: 600, color: '#F59E0B', marginBottom: 4 }}>
                              Detected Shifts ({r.changesFromPrevious.changesCount}):
                            </div>
                            <ul style={{ margin: 0, paddingLeft: 16, color: '#CBD5E1' }}>
                              {r.changesFromPrevious.changes.map((c, cIdx) => (
                                <li key={cIdx}>{c.description}</li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>No significant shifts from prior baseline.</div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid rgba(255,255,255,0.08)', background: '#0F172A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 12, color: '#64748B' }}>
            {profile?.researchTimestamp && `Last scanned: ${new Date(profile.researchTimestamp).toLocaleString()}`}
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Close Intelligence Drawer
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  TrendingUp,
  Share2,
  Compass,
  Sparkles,
  Copy,
  Check,
  Globe,
  Search,
  Zap,
  Activity,
} from 'lucide-react';
import { apiService } from '../../services/api.service';

export const ContentSeoView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'content' | 'seo'>('content');

  // Content State
  const [topicInput, setTopicInput] = useState('Why slow mobile websites lose 40% of local customers');
  const [platform, setPlatform] = useState<'linkedin' | 'instagram' | 'whatsapp'>('linkedin');
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>(`### LinkedIn Thought Leadership Post
**Hook**: 80% of local business websites lose customers within the first 3 seconds. Here is why speed is your most underrated sales rep:

Most businesses spend lakhs on ads, yet direct traffic to a website loading like it is 2012. When your mobile site takes 4+ seconds to load:
1. 40% of users hit 'Back' immediately.
2. Google demotes your mobile search ranking.
3. Your cost per lead doubles.

At PrimeSoul Web Solutions, we engineer websites that load in <1 second because performance equals revenue.

How fast does your website load on 4G? Test it in Google PageSpeed today.`);

  // SEO State
  const [auditUrl, setAuditUrl] = useState('https://apexdentalcare.in');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  const handleGenerateContent = async () => {
    setIsGeneratingContent(true);
    try {
      const output = await apiService.executeAgent('content_social', {
        task: `Generate ${platform.toUpperCase()} post for topic: ${topicInput}`,
        objective: 'Follow PrimeSoul brand voice with compelling hook and conversion CTA',
        context: { platform, topic: topicInput },
      });
      setGeneratedContent(output.content);
    } catch (err: any) {
      alert(`Content generation error: ${err.message}`);
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const handleRunAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await apiService.analyzeWebsite(auditUrl);
      if (res.success) {
        setAuditResult(res.data);
      } else {
        alert(`Audit failed: ${res.error}`);
      }
    } catch (err: any) {
      alert(`Audit error: ${err.message}`);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & Sub-tab Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '20px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={20} color="var(--emerald)" />
            <span>Marketing, Social Content & SEO Engine</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '3px' }}>
            Multi-platform brand storytelling and data-driven technical search optimization.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '6px', background: 'rgba(15, 23, 42, 0.6)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setActiveSubTab('content')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeSubTab === 'content' ? 'var(--primary)' : 'transparent',
              color: activeSubTab === 'content' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Social Content Creator
          </button>
          <button
            onClick={() => setActiveSubTab('seo')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeSubTab === 'seo' ? 'var(--primary)' : 'transparent',
              color: activeSubTab === 'seo' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Website SEO & Speed Auditor
          </button>
        </div>
      </div>

      {activeSubTab === 'content' ? (
        /* Social Content Creator */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '22px' }}>
            <h3 style={{ fontSize: '16px', margin: '0 0 14px 0' }}>Post Generator Settings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Platform</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {(['linkedin', 'instagram', 'whatsapp'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlatform(p)}
                      style={{
                        padding: '8px',
                        borderRadius: 'var(--radius-sm)',
                        border: platform === p ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                        backgroundColor: platform === p ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)',
                        color: platform === p ? '#ffffff' : 'var(--text-secondary)',
                        fontSize: '12px',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        cursor: 'pointer',
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Core Topic / Angle</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                />
              </div>

              <button
                onClick={handleGenerateContent}
                disabled={isGeneratingContent}
                className="btn btn-primary"
                style={{ padding: '12px', marginTop: '6px' }}
              >
                {isGeneratingContent ? <Sparkles className="pulse-glow" size={16} /> : <Share2 size={16} />}
                <span>{isGeneratingContent ? 'Generating Post...' : 'Generate Brand Post'}</span>
              </button>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '16px', margin: 0 }}>Generated Copy</h3>
              <span className="badge badge-indigo">{platform.toUpperCase()}</span>
            </div>
            <div style={{
              backgroundColor: 'rgba(11, 15, 25, 0.75)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              minHeight: '320px',
              maxHeight: '480px',
              overflowY: 'auto',
            }}>
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: '13px', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)', lineHeight: '1.6', margin: 0 }}>
                {generatedContent}
              </pre>
            </div>
          </div>
        </div>
      ) : (
        /* SEO & Website Speed Auditor */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '22px' }}>
            <h3 style={{ fontSize: '16px', margin: '0 0 12px 0' }}>Live Website Health & Local SEO Crawler</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                className="form-input"
                value={auditUrl}
                onChange={(e) => setAuditUrl(e.target.value)}
                placeholder="https://example.com"
                style={{ flex: 1 }}
              />
              <button
                onClick={handleRunAudit}
                disabled={isAuditing}
                className="btn btn-primary"
                style={{ gap: '8px' }}
              >
                {isAuditing ? <Sparkles className="pulse-glow" size={16} /> : <Search size={16} />}
                <span>{isAuditing ? 'Auditing URL...' : 'Audit Website'}</span>
              </button>
            </div>
          </div>

          {auditResult && (
            <div className="animate-fade-in glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', margin: 0 }}>Audit Report: {auditResult.url}</h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    CMS: <strong>{auditResult.technology.detectedCms}</strong> • SSL: <strong>{auditResult.technology.sslSecured ? 'Active' : 'Missing'}</strong>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Performance Health</div>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: auditResult.performance.coreWebVitalsScore > 75 ? 'var(--emerald)' : 'var(--amber)' }}>
                    {auditResult.performance.coreWebVitalsScore}/100
                  </div>
                </div>
              </div>

              {/* Identified Gaps */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--rose)', marginBottom: '6px' }}>Identified Technical Gaps:</div>
                <ul style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {auditResult.identifiedGaps.map((gap: string, i: number) => <li key={i}>{gap}</li>)}
                </ul>
              </div>

              {/* Recommended Actions */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--emerald)', marginBottom: '6px' }}>PrimeSoul Recommended Solutions:</div>
                <ul style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {auditResult.recommendedPrimeSoulActions.map((act: string, i: number) => <li key={i}>{act}</li>)}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

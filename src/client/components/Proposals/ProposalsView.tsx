import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  Download,
  ShieldCheck,
  Zap,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { ILead } from '../../../core/types/lead.types';
import { apiService } from '../../services/api.service';

interface ProposalsViewProps {
  leads: ILead[];
}

export const ProposalsView: React.FC<ProposalsViewProps> = ({ leads }) => {
  const [selectedLeadId, setSelectedLeadId] = useState<string>(leads[0]?.id || '');
  const [packageTier, setPackageTier] = useState<string>('Standard Growth Transformation');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [generatedProposal, setGeneratedProposal] = useState<string>(`### PrimeSoul Proposal: Digital Infrastructure & Local Growth Transformation
**Client**: Apex Dental Care & Implant Center  
**Prepared By**: PrimeSoul Web Solutions  
**Status**: DRAFT FOR HUMAN REVIEW

---

#### Act I: Understanding the Challenge (Mirroring Reality)
Apex Dental Care has established clinical excellence in Indore, but your current mobile web experience (4.1s load time) and unverified Google Business Profile are actively leaking high-intent patient inquiries to newly opened competing clinics.

- **Identified Bottleneck**: 40%+ of local mobile visitors bounce due to slow load latency.
- **Cost of Inaction**: An estimated ₹1.5L in lost monthly implant and consultation inquiries.

---

#### Act II: The Solution Journey (PrimeSoul Architecture)
1. **High-Performance Responsive Web Platform**: Sub-second mobile load times with custom booking widgets.
2. **Google Business Profile & Local SEO 3-Pack Sprint**: Verification, category optimization, and 50+ local citations.
3. **Instant WhatsApp Appointment Automation**: Direct routing from search to front desk booking in under 15 seconds.

---

#### Act III: Transformed State & Investment
- **Transformed Outcome**: Dominance in local Indore dental search queries and 3x faster patient intake.
- **Estimated Investment Tier**: Standard Growth Package [Estimated Range: ₹35,000 - ₹55,000 / $700 - $1,100].
- **Kickoff Timeline**: 3-4 Weeks from milestone authorization.`);

  const handleGenerateProposal = async () => {
    setIsGenerating(true);
    const targetLead = leads.find(l => l.id === selectedLeadId);
    try {
      const output = await apiService.executeAgent('proposal', {
        task: `Generate 3-Act Proposal for ${targetLead?.businessName || 'Target Client'}`,
        objective: `Package ${packageTier} with Win Themes and Core Web Vitals guarantees`,
        leadData: targetLead,
        context: { packageTier }
      });
      setGeneratedProposal(output.content);
    } catch (err: any) {
      alert(`Failed to generate proposal: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedProposal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '20px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={20} color="var(--primary)" />
          <span>3-Act Persuasion Proposal Studio</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '3px' }}>
          Transforms dry scope sheets into compelling 3-Act persuasion documents: Understanding The Challenge → The Solution Journey → The Transformed State.
        </p>
      </div>

      {/* Main Studio Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '20px' }}>
        {/* Controls & Win Themes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-card" style={{ padding: '22px' }}>
            <h3 style={{ fontSize: '16px', margin: '0 0 14px 0' }}>Proposal Configuration</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Select Target Lead</label>
                <select
                  className="form-select"
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                >
                  {leads.map(l => (
                    <option key={l.id} value={l.id}>{l.businessName} ({l.industry})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Package Tier</label>
                <select
                  className="form-select"
                  value={packageTier}
                  onChange={(e) => setPackageTier(e.target.value)}
                >
                  <option value="Starter Web & Local SEO Sprint">Starter Web & Local SEO Sprint</option>
                  <option value="Standard Growth Transformation">Standard Growth Transformation</option>
                  <option value="Custom Enterprise & PrimeOMS Suite">Custom Enterprise & PrimeOMS Suite</option>
                </select>
              </div>

              <button
                onClick={handleGenerateProposal}
                disabled={isGenerating}
                className="btn btn-primary"
                style={{ marginTop: '8px', padding: '12px' }}
              >
                {isGenerating ? <Sparkles className="pulse-glow" size={16} /> : <Zap size={16} />}
                <span>{isGenerating ? 'Drafting 3-Act Proposal...' : 'Generate 3-Act Proposal'}</span>
              </button>
            </div>
          </div>

          {/* Win Themes Preview */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '14px', margin: '0 0 10px 0', color: 'var(--cyan)' }}>Woven Win Theme Matrix</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              <div style={{ padding: '8px 10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                <strong>Theme 1: Sub-Second Speed</strong> — Resolves high mobile bounce rates and demoted search rank.
              </div>
              <div style={{ padding: '8px 10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                <strong>Theme 2: Google 3-Pack Dominance</strong> — Captures high-intent local buyers before competitors.
              </div>
              <div style={{ padding: '8px 10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                <strong>Theme 3: Automated WhatsApp Pipeline</strong> — Converts clicks into real consultations instantly.
              </div>
            </div>
          </div>
        </div>

        {/* Proposal Document Preview */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            <div>
              <h3 style={{ fontSize: '16px', margin: 0 }}>Proposal Live Preview</h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Persuasive 3-Act Architecture</span>
            </div>
            <button onClick={handleCopy} className="btn btn-secondary btn-sm" style={{ gap: '6px' }}>
              {copied ? <Check size={14} color="var(--emerald)" /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
            </button>
          </div>

          <div style={{
            flex: 1,
            backgroundColor: 'rgba(11, 15, 25, 0.75)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            overflowY: 'auto',
            maxHeight: '520px',
          }}>
            <pre style={{
              whiteSpace: 'pre-wrap',
              fontSize: '13px',
              fontFamily: 'var(--font-sans)',
              color: 'var(--text-primary)',
              lineHeight: '1.6',
              margin: 0,
            }}>
              {generatedProposal}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

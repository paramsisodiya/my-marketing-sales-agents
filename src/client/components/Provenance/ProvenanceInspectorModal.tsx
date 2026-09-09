import React from 'react';
import { ShieldCheck, Database, Globe, HelpCircle, X } from 'lucide-react';
import { ILead } from '../../../core/types/lead.types';

interface ProvenanceInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead?: ILead | null;
}

export const ProvenanceInspectorModal: React.FC<ProvenanceInspectorModalProps> = ({ isOpen, onClose, lead }) => {
  if (!isOpen || !lead) return null;

  // Generate real-time provenance breakdown
  const facts = [
    {
      field: 'Target Website',
      value: lead.website || 'UNKNOWN',
      source: lead.website || 'User Input',
      sourceType: lead.website ? 'LIVE_WEBSITE' : 'UNKNOWN',
      confidence: lead.website ? 'HIGH' : 'NONE',
      evidence: lead.website ? 'Target domain submitted for automated HTML crawl' : 'No URL provided',
      stage: 'Lead Intake',
    },
    {
      field: 'Company Name',
      value: lead.businessName,
      source: lead.source || 'User CRM',
      sourceType: 'USER_CRM',
      confidence: 'HIGH',
      evidence: `Explicitly recorded in CRM record (${lead.id})`,
      stage: 'CRM Lead Store',
    },
    {
      field: 'Contact Person',
      value: lead.contactName || 'UNKNOWN',
      source: lead.contactName ? 'User CRM' : 'None',
      sourceType: lead.contactName ? 'USER_CRM' : 'UNKNOWN',
      confidence: lead.contactName ? 'HIGH' : 'NONE',
      evidence: lead.contactName ? `Confirmed lead contact: ${lead.contactName}` : 'No contact name supplied (Neutral greeting enforced)',
      stage: 'CRM Lead Store',
    },
    {
      field: 'Location / Market',
      value: lead.location || 'UNKNOWN',
      source: lead.location ? 'User CRM' : 'None',
      sourceType: lead.location ? 'USER_CRM' : 'UNKNOWN',
      confidence: lead.location ? 'HIGH' : 'NONE',
      evidence: lead.location ? `Target geographic market: ${lead.location}` : 'Unspecified local market',
      stage: 'CRM Lead Store',
    },
    {
      field: 'Industry Sector',
      value: lead.industry || 'UNKNOWN',
      source: lead.industry ? 'User CRM' : 'None',
      sourceType: lead.industry ? 'USER_CRM' : 'UNKNOWN',
      confidence: lead.industry ? 'HIGH' : 'NONE',
      evidence: `Industry vertical: ${lead.industry}`,
      stage: 'CRM Lead Store',
    },
    {
      field: 'Lead Qualification Score',
      value: `${lead.leadScore}/100 (${lead.qualificationStatus})`,
      source: 'PrimeSoul Qualification Engine',
      sourceType: 'INFERENCE',
      confidence: 'HIGH',
      evidence: `Calculated from ${lead.painPoints?.length || 0} identified technical gaps and digital presence readiness`,
      stage: 'Lead Qualification',
    },
    {
      field: 'Identified Pain Points',
      value: lead.painPoints && lead.painPoints.length > 0 ? `${lead.painPoints.length} verified gaps` : 'No gaps logged',
      source: lead.website || 'Web Analyzer',
      sourceType: 'LIVE_WEBSITE',
      confidence: 'HIGH',
      evidence: lead.painPoints?.join(' | ') || 'Zero pain points detected',
      stage: 'Web Analysis & Research',
    },
  ];

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'LIVE_WEBSITE':
        return <Globe size={14} color="#06B6D4" />;
      case 'USER_CRM':
        return <Database size={14} color="#10B981" />;
      case 'UNKNOWN':
        return <HelpCircle size={14} color="#EF4444" />;
      default:
        return <ShieldCheck size={14} color="#8B5CF6" />;
    }
  };

  const getConfidenceBadge = (conf: string) => {
    switch (conf) {
      case 'HIGH':
        return <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, background: 'rgba(16,185,129,0.15)', color: '#10B981', fontWeight: 600 }}>HIGH</span>;
      case 'MEDIUM':
        return <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, background: 'rgba(245,158,11,0.15)', color: '#F59E0B', fontWeight: 600 }}>MEDIUM</span>;
      default:
        return <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, background: 'rgba(239,68,68,0.15)', color: '#EF4444', fontWeight: 600 }}>UNKNOWN / NONE</span>;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 20
    }}>
      <div style={{
        background: '#0F172A',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 16,
        width: '100%',
        maxWidth: 900,
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} color="#6366F1" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, color: '#F8FAFC' }}>Data Provenance Inspector</h3>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: '#94A3B8' }}>
                Verifiable source attribution for <strong>{lead.businessName}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content Table */}
        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8' }}>
                <th style={{ padding: '10px 12px' }}>Field</th>
                <th style={{ padding: '10px 12px' }}>Value</th>
                <th style={{ padding: '10px 12px' }}>Source Type</th>
                <th style={{ padding: '10px 12px' }}>Confidence</th>
                <th style={{ padding: '10px 12px' }}>Stage</th>
                <th style={{ padding: '10px 12px' }}>Evidence / Reference</th>
              </tr>
            </thead>
            <tbody>
              {facts.map((f, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px', fontWeight: 600, color: '#F1F5F9' }}>{f.field}</td>
                  <td style={{ padding: '12px', color: '#38BDF8', fontFamily: 'monospace' }}>{f.value}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#CBD5E1' }}>
                      {getSourceIcon(f.sourceType)}
                      <span>{f.sourceType}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>{getConfidenceBadge(f.confidence)}</td>
                  <td style={{ padding: '12px', color: '#94A3B8' }}>{f.stage}</td>
                  <td style={{ padding: '12px', color: '#64748B', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={f.evidence}>
                    {f.evidence}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              background: '#334155',
              border: 'none',
              color: '#F8FAFC',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};

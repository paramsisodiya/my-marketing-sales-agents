import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Globe,
  Mail,
  Phone,
  ShieldCheck,
  TrendingUp,
  FileText,
  Play,
  X,
  Trash2,
  Edit2,
  Sparkles,
} from 'lucide-react';
import { ILead, QualificationStatus, OutreachStatus } from '../../../core/types/lead.types';
import { apiService } from '../../services/api.service';
import { ProvenanceInspectorModal } from '../Provenance/ProvenanceInspectorModal';

interface LeadsViewProps {
  leads: ILead[];
  onRefresh: () => void;
  onLaunchWorkflowForLead: (wfId: string, leadId: string) => void;
}

export const LeadsView: React.FC<LeadsViewProps> = ({
  leads,
  onRefresh,
  onLaunchWorkflowForLead,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [activeLead, setActiveLead] = useState<ILead | null>(leads[0] || null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProvenanceModalOpen, setIsProvenanceModalOpen] = useState(false);

  // New Lead Form State
  const [newBusinessName, setNewBusinessName] = useState('');
  const [newIndustry, setNewIndustry] = useState('Healthcare');
  const [newLocation, setNewLocation] = useState('');
  const [newWebsite, setNewWebsite] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const industries = ['ALL', 'Healthcare', 'Real Estate', 'E-Commerce', 'Professional Services', 'Hospitality'];
  const statuses = ['ALL', 'QUALIFIED', 'RESEARCHED', 'UNQUALIFIED', 'OPPORTUNITY'];

  const filteredLeads = leads.filter(l => {
    const matchesSearch = searchQuery === '' ||
      l.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesIndustry = selectedIndustry === 'ALL' || l.industry === selectedIndustry;
    const matchesStatus = selectedStatus === 'ALL' || l.qualificationStatus === selectedStatus;

    return matchesSearch && matchesIndustry && matchesStatus;
  });

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBusinessName || !newIndustry || !newLocation) {
      alert('Please fill in required fields');
      return;
    }

    try {
      const created = await apiService.saveLead({
        businessName: newBusinessName,
        industry: newIndustry,
        location: newLocation,
        website: newWebsite,
        contactName: newContactName,
        email: newEmail,
        phone: newPhone,
        source: 'Manual CRM Intake',
        qualificationStatus: 'RESEARCHED',
        leadScore: 65,
        painPoints: ['Manual intake audit pending'],
        opportunities: ['Website performance overhaul', 'Local SEO 3-Pack rank'],
        recommendedServices: ['Website Design & Development', 'Google Business Profile & Local SEO'],
      });
      setActiveLead(created);
      setIsAddModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(`Error creating lead: ${err.message}`);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    await apiService.deleteLead(id);
    setActiveLead(null);
    onRefresh();
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '20px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="var(--cyan)" />
            <span>Leads & Opportunity Pipeline ({leads.length})</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '3px' }}>
            Unified prospect database tracking digital presence scores, MEDDPICC qualification criteria, and outreach stages.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-primary"
          style={{ gap: '8px' }}
        >
          <Plus size={16} />
          <span>Add New Lead</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        flexWrap: 'wrap',
        background: 'rgba(15, 23, 42, 0.6)',
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search leads by business, contact, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#ffffff',
              fontSize: '13.5px',
              width: '100%',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            className="form-select"
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}
          >
            {industries.map(ind => <option key={ind} value={ind}>{ind === 'ALL' ? 'All Industries' : ind}</option>)}
          </select>

          <select
            className="form-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}
          >
            {statuses.map(st => <option key={st} value={st}>{st === 'ALL' ? 'All Statuses' : st}</option>)}
          </select>
        </div>
      </div>

      {/* Main Layout: Leads Table + Details Drawer */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '20px' }}>
        {/* Leads Table */}
        <div className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '11.5px', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 18px' }}>Business</th>
                <th style={{ padding: '14px 12px' }}>Industry</th>
                <th style={{ padding: '14px 12px' }}>Score</th>
                <th style={{ padding: '14px 12px' }}>Status</th>
                <th style={{ padding: '14px 12px' }}>Outreach</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map(lead => {
                const isSelected = activeLead?.id === lead.id;
                return (
                  <tr
                    key={lead.id}
                    onClick={() => setActiveLead(lead)}
                    style={{
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--border-subtle)',
                      backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                      transition: 'background var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: '#ffffff' }}>{lead.businessName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{lead.location}</div>
                    </td>
                    <td style={{ padding: '14px 12px', color: 'var(--text-secondary)' }}>
                      {lead.industry}
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <span style={{
                        fontWeight: 700,
                        color: lead.leadScore >= 80 ? 'var(--emerald)' : lead.leadScore >= 60 ? 'var(--cyan)' : 'var(--amber)'
                      }}>
                        {lead.leadScore}
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <span className={`badge ${lead.qualificationStatus === 'QUALIFIED' ? 'badge-emerald' : 'badge-cyan'}`} style={{ fontSize: '10.5px' }}>
                        {lead.qualificationStatus}
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <span className={`badge ${lead.outreachStatus === 'RESPONDED' ? 'badge-emerald' : 'badge-purple'}`} style={{ fontSize: '10.5px' }}>
                        {lead.outreachStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Lead Details Inspector */}
        {activeLead ? (
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '18px', margin: 0 }}>{activeLead.businessName}</h3>
                  <span className="badge badge-indigo">{activeLead.industry}</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {activeLead.location} • Source: {activeLead.source}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setIsProvenanceModalOpen(true)}
                  className="btn btn-secondary btn-sm"
                  title="Inspect Data Provenance & Grounding"
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px' }}
                >
                  <ShieldCheck size={14} color="var(--primary)" />
                  <span>Provenance</span>
                </button>
                <button
                  onClick={() => handleDeleteLead(activeLead.id)}
                  className="btn btn-rose btn-sm"
                  title="Delete Lead"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Quick Contact Row */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              {activeLead.website && (
                <a href={activeLead.website} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--cyan)', textDecoration: 'none' }}>
                  <Globe size={14} /> {activeLead.website.replace('https://', '')}
                </a>
              )}
              {activeLead.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Mail size={14} /> {activeLead.email}
                </div>
              )}
              {activeLead.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Phone size={14} /> {activeLead.phone}
                </div>
              )}
            </div>

            {/* Scores Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Lead Qualification Score</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--emerald)', marginTop: '2px' }}>
                  {activeLead.leadScore}/100
                </div>
              </div>
              <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Digital Presence Health</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--amber)', marginTop: '2px' }}>
                  {activeLead.digitalPresenceScore}/100
                </div>
              </div>
            </div>

            {/* Pain Points & Opportunities */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--rose)', marginBottom: '6px' }}>Identified Pain Points:</div>
              <ul style={{ paddingLeft: '16px', fontSize: '12.5px', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {activeLead.painPoints.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>

            {/* MEDDPICC Scoring Block */}
            {activeLead.meddpicc && (
              <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>MEDDPICC Opportunity Assessment</div>
                  <span className="badge badge-indigo" style={{ fontSize: '11px' }}>Score: {activeLead.meddpicc.totalScore || 0}/40</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {activeLead.meddpicc.metrics && <div><strong>Metrics</strong>: {activeLead.meddpicc.metrics}</div>}
                  {activeLead.meddpicc.economicBuyer && <div><strong>Economic Buyer</strong>: {activeLead.meddpicc.economicBuyer}</div>}
                  {activeLead.meddpicc.identifyPain && <div><strong>Pain</strong>: {activeLead.meddpicc.identifyPain}</div>}
                </div>
              </div>
            )}

            {/* Quick Workflow Triggers */}
            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => onLaunchWorkflowForLead('lead-to-outreach', activeLead.id)}
                className="btn btn-primary btn-sm"
                style={{ flex: 1, gap: '6px' }}
              >
                <Sparkles size={14} />
                <span>Run Outreach Workflow</span>
              </button>
              <button
                onClick={() => onLaunchWorkflowForLead('deal-to-proposal', activeLead.id)}
                className="btn btn-secondary btn-sm"
                style={{ flex: 1, gap: '6px' }}
              >
                <FileText size={14} />
                <span>Generate Proposal</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Select a lead from the left to view comprehensive digital audit details and trigger multi-agent workflows.
          </div>
        )}
      </div>

      {/* Add Lead Modal */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div className="glass-card" style={{ width: '500px', maxWidth: '90vw', padding: '28px' }}>
            <h3 style={{ fontSize: '18px', margin: '0 0 16px 0' }}>Add New Target Prospect</h3>
            <form onSubmit={handleCreateLead} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Business Name *</label>
                <input required className="form-input" value={newBusinessName} onChange={e => setNewBusinessName(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Industry *</label>
                  <select className="form-select" value={newIndustry} onChange={e => setNewIndustry(e.target.value)}>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="E-Commerce">E-Commerce</option>
                    <option value="Professional Services">Professional Services</option>
                    <option value="Hospitality">Hospitality</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Location (City/State) *</label>
                  <input required className="form-input" value={newLocation} onChange={e => setNewLocation(e.target.value)} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Website URL</label>
                <input className="form-input" value={newWebsite} onChange={e => setNewWebsite(e.target.value)} placeholder="https://" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Contact Name</label>
                  <input className="form-input" value={newContactName} onChange={e => setNewContactName(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Email</label>
                  <input className="form-input" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Provenance Inspector Modal */}
      <ProvenanceInspectorModal
        isOpen={isProvenanceModalOpen}
        onClose={() => setIsProvenanceModalOpen(false)}
        lead={activeLead}
      />
    </div>
  );
};

import React from 'react';
import {
  Users,
  Workflow,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  Play,
  FileText,
  Sparkles,
  Bot
} from 'lucide-react';
import { ILead } from '../../../core/types/lead.types';
import { IWorkflowInstance } from '../../../core/types/workflow.types';
import { IApprovalItem } from '../../../core/types/approval.types';
import { IAgentMetadata } from '../../../core/types/agent.types';
import { TabType } from '../Layout/Sidebar';

interface DashboardViewProps {
  leads: ILead[];
  workflows: IWorkflowInstance[];
  approvals: IApprovalItem[];
  agents: IAgentMetadata[];
  setActiveTab: (tab: TabType) => void;
  onQuickStartWorkflow: (wfId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  leads,
  workflows,
  approvals,
  agents,
  setActiveTab,
  onQuickStartWorkflow,
}) => {
  const pendingApprovals = approvals.filter(a => a.status === 'REVIEW');
  const activeWorkflows = workflows.filter(w => w.status === 'RUNNING' || w.status === 'WAITING_APPROVAL');
  const qualifiedLeads = leads.filter(l => l.qualificationStatus === 'QUALIFIED' || l.qualificationStatus === 'OPPORTUNITY');

  const avgLeadScore = leads.length > 0
    ? Math.round(leads.reduce((acc, l) => acc + l.leadScore, 0) / leads.length)
    : 0;

  const kpis = [
    {
      title: 'Total Active Leads',
      value: leads.length,
      sub: `${qualifiedLeads.length} Qualified in Pipeline`,
      icon: <Users size={22} color="var(--cyan)" />,
      borderColor: 'var(--cyan)',
      action: () => setActiveTab('growth_leads')
    },
    {
      title: 'Pending Human Approvals',
      value: pendingApprovals.length,
      sub: 'Action required before dispatch',
      icon: <CheckCircle2 size={22} color="var(--amber)" />,
      borderColor: 'var(--amber)',
      badge: pendingApprovals.length > 0 ? 'NEEDS ATTENTION' : 'ALL CLEAR',
      action: () => setActiveTab('approvals')
    },
    {
      title: 'Active Workflows',
      value: activeWorkflows.length,
      sub: 'Multi-agent pipelines running',
      icon: <Workflow size={22} color="var(--primary)" />,
      borderColor: 'var(--primary)',
      action: () => setActiveTab('workflows')
    },
    {
      title: 'Average Lead Health',
      value: `${avgLeadScore}/100`,
      sub: 'Digital presence & ICP match',
      icon: <TrendingUp size={22} color="var(--emerald)" />,
      borderColor: 'var(--emerald)',
      action: () => setActiveTab('growth_leads')
    },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-indigo">PRIME SOUL AI OPERATING SYSTEM</span>
            <span className="badge badge-emerald">₹0 DEVELOPMENT READY</span>
          </div>
          <h2 style={{ fontSize: '22px', margin: '4px 0 8px 0' }}>
            Internal AI Marketing & Sales Headquarters
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '650px', margin: 0 }}>
            Orchestrating 9 specialized agents across lead discovery, signal-based cold outreach, MEDDPICC deal strategy, 3-Act proposals, and local search dominance.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('workflows')}
          className="btn btn-primary"
          style={{ padding: '12px 20px', gap: '10px' }}
        >
          <Play size={16} />
          <span>Launch AI Workflow</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '16px',
      }}>
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="glass-card"
            onClick={kpi.action}
            style={{
              padding: '20px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {kpi.icon}
              </div>
              {kpi.badge && (
                <span className={kpi.value > 0 ? 'badge badge-amber' : 'badge badge-emerald'} style={{ fontSize: '10px' }}>
                  {kpi.badge}
                </span>
              )}
            </div>

            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500 }}>{kpi.title}</div>
              <div style={{ fontSize: '28px', fontWeight: 700, margin: '4px 0', fontFamily: 'var(--font-display)', color: '#ffffff' }}>
                {kpi.value}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{kpi.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Grid: Quick Actions & Live Leads Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
        {/* Pipeline & Recent Leads */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '17px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="var(--cyan)" />
              <span>High-Priority Lead Pipeline</span>
            </h3>
            <button onClick={() => setActiveTab('growth_leads')} className="btn btn-secondary btn-sm">
              <span>View All</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {leads.slice(0, 4).map(lead => (
              <div
                key={lead.id}
                style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#ffffff' }}>{lead.businessName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {lead.industry} • {lead.location} • {lead.painPoints[0] || 'Digital audit pending'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Lead Score</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: lead.leadScore > 75 ? 'var(--emerald)' : 'var(--amber)' }}>
                      {lead.leadScore}/100
                    </div>
                  </div>
                  <span className={`badge ${lead.qualificationStatus === 'QUALIFIED' ? 'badge-emerald' : 'badge-cyan'}`} style={{ fontSize: '11px' }}>
                    {lead.qualificationStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 9 Specialists Quick Hub */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '17px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bot size={18} color="var(--primary)" />
              <span>Specialized AI Roster</span>
            </h3>
            <button onClick={() => setActiveTab('agents')} className="btn btn-secondary btn-sm">
              <span>View Roster</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {agents.slice(0, 6).map(agent => (
              <div
                key={agent.id}
                onClick={() => setActiveTab('agents')}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'background var(--transition-fast)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.07)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: agent.color }} />
                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#ffffff' }}>{agent.name}</div>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {agent.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

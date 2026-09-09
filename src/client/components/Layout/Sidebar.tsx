import React from 'react';
import {
  LayoutDashboard,
  Bot,
  Workflow,
  Users,
  CheckCircle2,
  FileText,
  TrendingUp,
  BookOpen,
  Terminal,
  Settings,
  Sparkles,
  QrCode,
  Search,
  Gift,
  Globe,
} from 'lucide-react';

export type TabType =
  | 'growth_overview'
  | 'growth_leads'
  | 'growth_audits'
  | 'growth_menus'
  | 'growth_referrals'
  | 'dashboard'
  | 'agents'
  | 'workflows'
  | 'approvals'
  | 'proposals'
  | 'content_seo'
  | 'knowledge'
  | 'logs';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  pendingApprovalsCount: number;
  onOpenSettings: () => void;
  onBackToPublicSite: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  pendingApprovalsCount,
  onOpenSettings,
  onBackToPublicSite,
}) => {
  const growthNavItems: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
    { id: 'growth_overview', label: 'Overview', icon: <LayoutDashboard size={17} /> },
    { id: 'growth_leads', label: 'Inbound Leads CRM', icon: <Users size={17} /> },
    { id: 'growth_audits', label: 'Business Audits', icon: <Search size={17} /> },
    { id: 'growth_menus', label: 'Restaurant QR Menus', icon: <QrCode size={17} /> },
    { id: 'growth_referrals', label: 'Referral Program', icon: <Gift size={17} /> },
  ];

  const aiOpsNavItems: Array<{ id: TabType; label: string; icon: React.ReactNode; badge?: number }> = [
    { id: 'workflows', label: 'Workflows Engine', icon: <Workflow size={17} /> },
    { id: 'agents', label: 'AI Agents Hub', icon: <Bot size={17} /> },
    { id: 'approvals', label: 'Approval Queue', icon: <CheckCircle2 size={17} />, badge: pendingApprovalsCount },
    { id: 'proposals', label: 'Proposal Studio', icon: <FileText size={17} /> },
    { id: 'content_seo', label: 'Content & SEO', icon: <TrendingUp size={17} /> },
    { id: 'knowledge', label: 'Knowledge Base', icon: <BookOpen size={17} /> },
    { id: 'logs', label: 'Audit Logs', icon: <Terminal size={17} /> },
  ];

  return (
    <aside style={{
      width: '260px',
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px 12px',
      flexShrink: 0,
      userSelect: 'none',
      height: '100vh',
      overflowY: 'auto',
    }}>
      {/* Brand Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 6px 14px 6px',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(99, 102, 241, 0.4)',
          }}>
            <Sparkles size={16} color="#ffffff" />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontWeight: '700',
              fontSize: '15px',
              color: '#ffffff',
              letterSpacing: '-0.02em',
            }}>
              PrimeSoul <span style={{ color: '#06b6d4', fontSize: '11px', background: 'rgba(6,182,212,0.15)', padding: '1px 5px', borderRadius: '4px' }}>CRM</span>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Growth & Operations OS</div>
          </div>
        </div>
      </div>

      {/* Switch to Public Site Button */}
      <div style={{ marginBottom: '14px' }}>
        <button
          onClick={onBackToPublicSite}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            color: '#a5b4fc',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 600,
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.15)';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
            e.currentTarget.style.color = '#a5b4fc';
          }}
        >
          <Globe size={14} />
          <span>← Public Growth Website</span>
        </button>
      </div>

      {/* Section 1: Customer Acquisition & CRM */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '16px' }}>
        <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em', padding: '4px 8px', fontWeight: 700 }}>
          Growth Engine & CRM
        </div>
        {growthNavItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive ? 'rgba(99, 102, 241, 0.18)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                border: isActive ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 500,
                transition: 'all var(--transition-fast)',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <span style={{ color: isActive ? '#818cf8' : 'var(--text-muted)' }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Section 2: AI Operations */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
        <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em', padding: '4px 8px', fontWeight: 700 }}>
          AI Specialist Ops
        </div>
        {aiOpsNavItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive ? 'rgba(99, 102, 241, 0.18)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                border: isActive ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 500,
                transition: 'all var(--transition-fast)',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <span style={{ color: isActive ? '#818cf8' : 'var(--text-muted)' }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span style={{
                  backgroundColor: 'var(--amber)',
                  color: '#000000',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontSize: '10px',
                  fontWeight: 700,
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Settings */}
      <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
        <button
          onClick={onOpenSettings}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '9px',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'transparent',
            color: 'var(--text-secondary)',
            border: '1px solid transparent',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          <Settings size={16} color="var(--text-muted)" />
          <span>AI Settings</span>
        </button>
      </div>
    </aside>
  );
};

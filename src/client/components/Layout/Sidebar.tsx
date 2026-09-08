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
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'agents'
  | 'workflows'
  | 'leads'
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
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  pendingApprovalsCount,
  onOpenSettings,
}) => {
  const navItems: Array<{ id: TabType; label: string; icon: React.ReactNode; badge?: number }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'agents', label: 'AI Agents Hub', icon: <Bot size={18} /> },
    { id: 'workflows', label: 'Workflows Engine', icon: <Workflow size={18} /> },
    { id: 'leads', label: 'Leads & Pipeline', icon: <Users size={18} /> },
    { id: 'approvals', label: 'Approval Queue', icon: <CheckCircle2 size={18} />, badge: pendingApprovalsCount },
    { id: 'proposals', label: 'Proposal Studio', icon: <FileText size={18} /> },
    { id: 'content_seo', label: 'Marketing & SEO', icon: <TrendingUp size={18} /> },
    { id: 'knowledge', label: 'Knowledge Base', icon: <BookOpen size={18} /> },
    { id: 'logs', label: 'Audit Logs', icon: <Terminal size={18} /> },
  ];

  return (
    <aside style={{
      width: '260px',
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 14px',
      flexShrink: 0,
      userSelect: 'none',
    }}>
      {/* Brand Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '0 8px 24px 8px',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '20px',
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
        }}>
          <Sparkles size={20} color="#ffffff" />
        </div>
        <div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: '700',
            fontSize: '17px',
            color: '#ffffff',
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            PRIMESOUL <span style={{ color: '#06b6d4', fontSize: '12px', background: 'rgba(6,182,212,0.15)', padding: '2px 6px', borderRadius: '4px' }}>AI</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Marketing & Sales OS</div>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em', padding: '6px 10px', fontWeight: 600 }}>
          Operating Modules
        </div>
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                border: isActive ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid transparent',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: '13.5px',
                fontWeight: isActive ? 600 : 500,
                transition: 'all var(--transition-fast)',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span style={{
                  backgroundColor: 'var(--amber)',
                  color: '#000000',
                  padding: '2px 7px',
                  borderRadius: '10px',
                  fontSize: '11px',
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
      <div style={{ paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
        <button
          onClick={onOpenSettings}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'transparent',
            color: 'var(--text-secondary)',
            border: '1px solid transparent',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            fontSize: '13.5px',
            fontWeight: 500,
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <Settings size={18} color="var(--text-muted)" />
          <span>Settings & Providers</span>
        </button>
      </div>
    </aside>
  );
};

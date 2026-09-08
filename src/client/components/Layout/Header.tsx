import React from 'react';
import { Cpu, Bell, Activity, RefreshCw } from 'lucide-react';

interface HeaderProps {
  currentProvider: string;
  activeWorkflowsCount: number;
  onRefresh: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProvider,
  activeWorkflowsCount,
  onRefresh,
  onOpenSettings,
}) => {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: '20px',
      marginBottom: '24px',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          PrimeSoul Operations Command
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
          Autonomous Multi-Agent Intelligence Engine for PrimeSoul Web Solutions
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Active Engine Badge */}
        <button
          onClick={onOpenSettings}
          className="badge"
          style={{
            backgroundColor: currentProvider === 'mock' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
            color: currentProvider === 'mock' ? '#34d399' : '#818cf8',
            border: `1px solid ${currentProvider === 'mock' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`,
            padding: '6px 12px',
            fontSize: '12px',
            cursor: 'pointer',
          }}
          title="Click to change AI Provider"
        >
          <Cpu size={14} />
          <span>Provider: <strong>{currentProvider === 'mock' ? '₹0 Mock (Offline)' : currentProvider.toUpperCase()}</strong></span>
        </button>

        {/* Live Workflow Status */}
        {activeWorkflowsCount > 0 && (
          <div className="badge badge-amber pulse-glow" style={{ padding: '6px 12px' }}>
            <Activity size={14} />
            <span>{activeWorkflowsCount} Workflows In Progress</span>
          </div>
        )}

        {/* Quick Refresh */}
        <button
          onClick={onRefresh}
          className="btn btn-secondary btn-sm"
          title="Refresh Data"
          style={{ padding: '8px 12px' }}
        >
          <RefreshCw size={14} />
          <span>Sync</span>
        </button>
      </div>
    </header>
  );
};

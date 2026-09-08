import React, { useState, useEffect } from 'react';
import {
  Terminal,
  RefreshCw,
  Clock,
  Bot,
  AlertTriangle,
  Info,
  CheckCircle2,
  Workflow,
} from 'lucide-react';
import { apiService } from '../../services/api.service';

export const LogsView: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const fetchLogs = async () => {
    try {
      const data = await apiService.getLogs(150);
      setLogs(data);
      if (data.length > 0 && !selectedLog) {
        setSelectedLog(data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = selectedLevel === 'ALL'
    ? logs
    : logs.filter(l => l.level === selectedLevel);

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'agent_step': return <span className="badge badge-indigo" style={{ fontSize: '10px' }}>AGENT STEP</span>;
      case 'handoff': return <span className="badge badge-cyan" style={{ fontSize: '10px' }}>HANDOFF</span>;
      case 'approval_event': return <span className="badge badge-amber" style={{ fontSize: '10px' }}>APPROVAL</span>;
      case 'error': return <span className="badge badge-rose" style={{ fontSize: '10px' }}>ERROR</span>;
      default: return <span className="badge badge-emerald" style={{ fontSize: '10px' }}>INFO</span>;
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '20px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={20} color="var(--primary)" />
            <span>Structured Observability & Audit Trail</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '3px' }}>
            Real-time execution telemetry tracking agent steps, handoff payloads, and runtime performance.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['ALL', 'agent_step', 'handoff', 'approval_event', 'error'].map(lvl => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-sm)',
                border: selectedLevel === lvl ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                backgroundColor: selectedLevel === lvl ? 'rgba(99, 102, 241, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                color: selectedLevel === lvl ? '#ffffff' : 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {lvl === 'ALL' ? 'All Events' : lvl.replace('_', ' ').toUpperCase()}
            </button>
          ))}
          <button onClick={fetchLogs} className="btn btn-secondary btn-sm" style={{ padding: '6px 10px' }}>
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Main Logs View */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
        {/* Stream List */}
        <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '600px', overflowY: 'auto' }}>
          {filteredLogs.map(log => {
            const isSelected = selectedLog?.id === log.id;
            return (
              <div
                key={log.id}
                onClick={() => setSelectedLog(log)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(15, 23, 42, 0.4)',
                  border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {getLevelBadge(log.level)}
                    {log.agentId && (
                      <span style={{ fontWeight: 600, color: '#ffffff', fontSize: '12px' }}>
                        [{log.agentId}]
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div style={{ color: 'var(--text-primary)', fontSize: '12.5px' }}>{log.message}</div>
              </div>
            );
          })}
        </div>

        {/* Selected Log Inspector */}
        {selectedLog ? (
          <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '16px', margin: 0 }}>Event Telemetry Inspector</h3>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ID: {selectedLog.id}</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div><strong>Timestamp</strong>: {new Date(selectedLog.timestamp).toLocaleString()}</div>
              <div><strong>Level</strong>: {selectedLog.level}</div>
              {selectedLog.agentId && <div><strong>Agent</strong>: {selectedLog.agentId}</div>}
              {selectedLog.durationMs !== undefined && <div><strong>Duration</strong>: {selectedLog.durationMs}ms</div>}
            </div>

            {selectedLog.data && (
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Payload Metadata</div>
                <pre style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(11, 15, 25, 0.8)',
                  color: 'var(--cyan)',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  overflowX: 'auto',
                  maxHeight: '300px',
                }}>
                  {JSON.stringify(selectedLog.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Select an event from the stream to inspect structured execution metrics.
          </div>
        )}
      </div>
    </div>
  );
};

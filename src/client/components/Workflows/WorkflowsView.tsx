import React, { useState } from 'react';
import {
  Workflow,
  Play,
  CheckCircle2,
  Clock,
  AlertCircle,
  PauseCircle,
  FileText,
  UserCheck,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { IWorkflowDefinition, IWorkflowInstance } from '../../../core/types/workflow.types';
import { ILead } from '../../../core/types/lead.types';
import { apiService } from '../../services/api.service';

interface WorkflowsViewProps {
  workflows: IWorkflowDefinition[];
  instances: IWorkflowInstance[];
  leads: ILead[];
  onRefresh: () => void;
}

export const WorkflowsView: React.FC<WorkflowsViewProps> = ({
  workflows,
  instances,
  leads,
  onRefresh,
}) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<IWorkflowDefinition | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string>(leads[0]?.id || '');
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [activeInstance, setActiveInstance] = useState<IWorkflowInstance | null>(instances[0] || null);

  const handleStartWorkflow = async (def: IWorkflowDefinition) => {
    setIsStarting(true);
    try {
      const instance = await apiService.startWorkflow(def.id, selectedLeadId);
      setActiveInstance(instance);
      onRefresh();
    } catch (err: any) {
      alert(`Error starting workflow: ${err.message}`);
    } finally {
      setIsStarting(false);
      setSelectedWorkflow(null);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Workflow size={20} color="var(--primary)" />
            <span>Multi-Agent Workflow Pipelines</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '3px' }}>
            Orchestrated state machines executing multi-agent handoffs with automatic context passing and human approval gates.
          </p>
        </div>
      </div>

      {/* Available Workflow Definitions Catalog */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '16px',
      }}>
        {workflows.map(wf => (
          <div
            key={wf.id}
            className="glass-card"
            style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <span className="badge badge-indigo">{wf.category.toUpperCase()}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{wf.steps.length} Steps</span>
              </div>
              <h3 style={{ fontSize: '16px', margin: '6px 0', color: '#ffffff' }}>{wf.name}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4', margin: '8px 0 16px 0' }}>
                {wf.description}
              </p>

              {/* Step Sequence Pills */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                {wf.steps.map((step, idx) => (
                  <div
                    key={step.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{idx + 1}.</span>
                    <span style={{ flex: 1, color: '#ffffff' }}>{step.name}</span>
                    {step.requiresHumanApproval && (
                      <span className="badge badge-amber" style={{ fontSize: '9.5px', padding: '1px 5px' }}>Approval Gate</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedWorkflow(wf)}
              className="btn btn-primary btn-sm"
              style={{ width: '100%', gap: '8px', justifyContent: 'center' }}
            >
              <Play size={14} />
              <span>Launch Pipeline</span>
            </button>
          </div>
        ))}
      </div>

      {/* Active Workflow Execution Inspector */}
      {activeInstance && (
        <div className="glass-card" style={{ padding: '24px', marginTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ fontSize: '18px', margin: 0 }}>Active Execution: {activeInstance.workflowName}</h3>
                <span className={`badge ${
                  activeInstance.status === 'COMPLETED' ? 'badge-emerald' :
                  activeInstance.status === 'WAITING_APPROVAL' ? 'badge-amber' :
                  activeInstance.status === 'RUNNING' ? 'badge-indigo' : 'badge-rose'
                }`}>
                  {activeInstance.status}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                ID: {activeInstance.id} • Started: {new Date(activeInstance.startedAt).toLocaleTimeString()}
              </div>
            </div>
            <button onClick={onRefresh} className="btn btn-secondary btn-sm" style={{ gap: '6px' }}>
              <RefreshCw size={13} />
              <span>Refresh Status</span>
            </button>
          </div>

          {/* Step Execution Chain */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeInstance.steps.map((step, idx) => (
              <div
                key={step.stepId}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: step.status === 'RUNNING' ? 'rgba(99, 102, 241, 0.1)' :
                                   step.status === 'WAITING_APPROVAL' ? 'rgba(245, 158, 11, 0.1)' :
                                   step.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.06)' : 'rgba(15, 23, 42, 0.4)',
                  border: `1px solid ${
                    step.status === 'RUNNING' ? 'var(--primary)' :
                    step.status === 'WAITING_APPROVAL' ? 'var(--amber)' :
                    step.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'
                  }`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: step.status === 'COMPLETED' ? 'var(--emerald)' :
                                       step.status === 'WAITING_APPROVAL' ? 'var(--amber)' :
                                       step.status === 'RUNNING' ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                      color: '#000000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '12px',
                    }}>
                      {step.status === 'COMPLETED' ? <CheckCircle2 size={16} color="#ffffff" /> : idx + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: '#ffffff' }}>{step.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Assigned Agent: <strong>{step.agentId}</strong></div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {step.durationMs !== undefined && (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{step.durationMs}ms</span>
                    )}
                    <span className={`badge ${
                      step.status === 'COMPLETED' ? 'badge-emerald' :
                      step.status === 'WAITING_APPROVAL' ? 'badge-amber' :
                      step.status === 'RUNNING' ? 'badge-indigo pulse-glow' : 'badge-purple'
                    }`} style={{ fontSize: '11px' }}>
                      {step.status}
                    </span>
                  </div>
                </div>

                {/* Step Output Preview */}
                {step.output && (
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--cyan)', fontWeight: 600, marginBottom: '4px' }}>
                      Output Summary:
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                      {step.output.summary}
                    </div>
                    <details style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      <summary style={{ cursor: 'pointer', color: 'var(--primary)' }}>View Full Step Deliverable</summary>
                      <pre style={{
                        marginTop: '8px',
                        padding: '12px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'rgba(11, 15, 25, 0.8)',
                        color: 'var(--text-primary)',
                        whiteSpace: 'pre-wrap',
                        maxHeight: '200px',
                        overflowY: 'auto',
                      }}>
                        {step.output.content}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Workflow Event Logs */}
          <div style={{ marginTop: '20px', padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(11, 15, 25, 0.7)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Terminal size={14} />
              <span>Workflow State Machine Log</span>
            </div>
            <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {activeInstance.logs.map((log, i) => (
                <div key={i}>• {log}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Launch Workflow Modal */}
      {selectedWorkflow && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div className="glass-card" style={{ width: '520px', maxWidth: '90vw', padding: '28px' }}>
            <h3 style={{ fontSize: '18px', margin: '0 0 8px 0' }}>Launch Pipeline: {selectedWorkflow.name}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Select target prospect from your CRM database to seed context across all workflow agents.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Target Lead / Business
              </label>
              <select
                className="form-select"
                value={selectedLeadId}
                onChange={(e) => setSelectedLeadId(e.target.value)}
              >
                {leads.map(lead => (
                  <option key={lead.id} value={lead.id}>
                    {lead.businessName} ({lead.industry} • Score: {lead.leadScore})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setSelectedWorkflow(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={() => handleStartWorkflow(selectedWorkflow)}
                disabled={isStarting}
                className="btn btn-primary"
              >
                {isStarting ? <Sparkles className="pulse-glow" size={16} /> : <Play size={16} />}
                <span>{isStarting ? 'Initiating Pipeline...' : 'Start Execution'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

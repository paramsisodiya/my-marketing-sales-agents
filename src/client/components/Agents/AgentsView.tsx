import React, { useState } from 'react';
import {
  Bot,
  Play,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Send,
  AlertCircle,
  HelpCircle,
  X,
  Code
} from 'lucide-react';
import { IAgentMetadata, IAgentOutput } from '../../../core/types/agent.types';
import { apiService } from '../../services/api.service';

interface AgentsViewProps {
  agents: IAgentMetadata[];
}

export const AgentsView: React.FC<AgentsViewProps> = ({ agents }) => {
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [activeAgent, setActiveAgent] = useState<IAgentMetadata | null>(null);
  const [taskInput, setTaskInput] = useState<string>('');
  const [objectiveInput, setObjectiveInput] = useState<string>('');
  const [businessNameInput, setBusinessNameInput] = useState<string>('Apex Dental Care');
  const [websiteInput, setWebsiteInput] = useState<string>('https://apexdentalcare.in');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<IAgentOutput | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);

  const divisions = [
    { id: 'all', label: 'All Specialists' },
    { id: 'orchestration', label: 'Orchestration' },
    { id: 'sales', label: 'Sales & Deals' },
    { id: 'marketing', label: 'Growth & Content' },
    { id: 'seo', label: 'SEO & Search' },
    { id: 'research', label: 'Research' },
  ];

  const filteredAgents = selectedDivision === 'all'
    ? agents
    : agents.filter(a => a.division === selectedDivision);

  const handleOpenAgentDrawer = (agent: IAgentMetadata) => {
    setActiveAgent(agent);
    setTaskInput(`Execute standard task for ${agent.name}`);
    setObjectiveInput(`Optimize digital growth and pipeline for ${businessNameInput}`);
    setExecutionResult(null);
    setExecutionError(null);
  };

  const handleRunAgent = async () => {
    if (!activeAgent) return;
    setIsExecuting(true);
    setExecutionError(null);
    try {
      const output = await apiService.executeAgent(activeAgent.id, {
        task: taskInput,
        objective: objectiveInput,
        leadData: {
          businessName: businessNameInput,
          website: websiteInput,
        }
      });
      setExecutionResult(output);
    } catch (err: any) {
      setExecutionError(err.message || 'Execution failed');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & Filter Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '20px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bot size={20} color="var(--primary)" />
            <span>Specialized AI Roster ({filteredAgents.length})</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '3px' }}>
            Specialized agents engineered with domain methodologies from SPIN Selling to MEDDPICC and Pre-GSC SEO.
          </p>
        </div>

        {/* Division Filters */}
        <div style={{ display: 'flex', gap: '6px', background: 'rgba(15, 23, 42, 0.6)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          {divisions.map(div => (
            <button
              key={div.id}
              onClick={() => setSelectedDivision(div.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: selectedDivision === div.id ? 'var(--primary)' : 'transparent',
                color: selectedDivision === div.id ? '#ffffff' : 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: selectedDivision === div.id ? 600 : 500,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              {div.label}
            </button>
          ))}
        </div>
      </div>

      {/* Agents Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '18px',
      }}>
        {filteredAgents.map(agent => (
          <div
            key={agent.id}
            className="glass-card"
            style={{
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderTop: `3px solid ${agent.color}`,
            }}
          >
            <div>
              {/* Agent Head */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: `${agent.color}22`,
                    border: `1px solid ${agent.color}55`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: agent.color,
                  }}>
                    <Bot size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', margin: 0, color: '#ffffff' }}>{agent.name}</h3>
                    <span className="badge" style={{
                      backgroundColor: `${agent.color}15`,
                      color: agent.color,
                      border: `1px solid ${agent.color}33`,
                      fontSize: '10px',
                      padding: '2px 6px',
                      marginTop: '2px',
                    }}>
                      {agent.division.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vibe Quote */}
              <p style={{
                fontStyle: 'italic',
                fontSize: '12.5px',
                color: 'var(--text-primary)',
                background: 'rgba(255,255,255,0.02)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                borderLeft: `2px solid ${agent.color}`,
                margin: '10px 0',
              }}>
                "{agent.vibe}"
              </p>

              {/* Description */}
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.45', margin: '10px 0' }}>
                {agent.description}
              </p>

              {/* Responsibilities */}
              <div style={{ marginTop: '14px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>
                  Core Disciplines
                </div>
                <ul style={{ paddingLeft: '16px', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {agent.responsibilities.slice(0, 3).map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              {/* Knowledge Links */}
              <div style={{ marginTop: '14px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {agent.requiredKnowledge.map(k => (
                  <span key={k} style={{
                    fontSize: '10.5px',
                    background: 'rgba(255,255,255,0.04)',
                    color: 'var(--text-muted)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                  }}>
                    <BookOpen size={10} /> {k}
                  </span>
                ))}
              </div>
            </div>

            {/* Run Action */}
            <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => handleOpenAgentDrawer(agent)}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', gap: '6px', justifyContent: 'center' }}
              >
                <Play size={14} color="var(--primary)" />
                <span>Test & Run Agent</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Live Agent Execution Modal/Drawer */}
      {activeAgent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'flex-end',
          zIndex: 1000,
        }}>
          <div style={{
            width: '650px',
            maxWidth: '90vw',
            height: '100%',
            backgroundColor: 'var(--bg-secondary)',
            borderLeft: '1px solid var(--border-subtle)',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }}>
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${activeAgent.color}33`, color: activeAgent.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', margin: 0 }}>{activeAgent.name} Console</h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Interactive Standalone Execution</span>
                </div>
              </div>
              <button onClick={() => setActiveAgent(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Input Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Task Description</label>
                <input
                  type="text"
                  className="form-input"
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Strategic Objective</label>
                <input
                  type="text"
                  className="form-input"
                  value={objectiveInput}
                  onChange={(e) => setObjectiveInput(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Target Business Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={businessNameInput}
                    onChange={(e) => setBusinessNameInput(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Target Website URL</label>
                  <input
                    type="text"
                    className="form-input"
                    value={websiteInput}
                    onChange={(e) => setWebsiteInput(e.target.value)}
                  />
                </div>
              </div>

              <button
                onClick={handleRunAgent}
                disabled={isExecuting}
                className="btn btn-primary"
                style={{ padding: '12px', marginTop: '6px' }}
              >
                {isExecuting ? <Sparkles className="pulse-glow" size={16} /> : <Send size={16} />}
                <span>{isExecuting ? 'Agent Reasoning & Generating...' : `Execute ${activeAgent.name}`}</span>
              </button>
            </div>

            {/* Error Message */}
            {executionError && (
              <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', fontSize: '13px', display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <AlertCircle size={16} />
                <span>{executionError}</span>
              </div>
            )}

            {/* Execution Output Display */}
            {executionResult && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(15, 23, 42, 0.7)', border: '1px solid var(--border-highlight)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '13px' }}>Agent Output Summary</div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{executionResult.executionTimeMs}ms</span>
                  </div>
                  <div style={{ fontSize: '13.5px', color: '#ffffff' }}>{executionResult.summary}</div>
                </div>

                {/* Facts / Assumptions / Recommendations */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {executionResult.facts && executionResult.facts.length > 0 && (
                    <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--cyan)', marginBottom: '4px' }}>[FACTS IDENTIFIED]</div>
                      <ul style={{ fontSize: '12px', color: 'var(--text-primary)', paddingLeft: '14px' }}>
                        {executionResult.facts.map((f, i) => <li key={i}>{f}</li>)}
                      </ul>
                    </div>
                  )}

                  {executionResult.assumptions && executionResult.assumptions.length > 0 && (
                    <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--amber)', marginBottom: '4px' }}>[ASSUMPTIONS]</div>
                      <ul style={{ fontSize: '12px', color: 'var(--text-primary)', paddingLeft: '14px' }}>
                        {executionResult.assumptions.map((a, i) => <li key={i}>{a}</li>)}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Deliverable Markdown Content */}
                <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(11, 15, 25, 0.8)', border: '1px solid var(--border-subtle)', maxHeight: '350px', overflowY: 'auto' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>Deliverable Content</div>
                  <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12.5px', color: 'var(--text-primary)', lineHeight: '1.5', margin: 0 }}>
                    {executionResult.content}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

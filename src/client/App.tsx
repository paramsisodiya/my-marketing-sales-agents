import React, { useState, useEffect } from 'react';
import { Sidebar, TabType } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { DashboardView } from './components/Dashboard/DashboardView';
import { AgentsView } from './components/Agents/AgentsView';
import { WorkflowsView } from './components/Workflows/WorkflowsView';
import { LeadsView } from './components/Leads/LeadsView';
import { ApprovalsView } from './components/Approvals/ApprovalsView';
import { ProposalsView } from './components/Proposals/ProposalsView';
import { ContentSeoView } from './components/ContentSeo/ContentSeoView';
import { KnowledgeView } from './components/Knowledge/KnowledgeView';
import { LogsView } from './components/Logs/LogsView';
import { SettingsModal } from './components/Settings/SettingsModal';
import { apiService } from './services/api.service';
import { ILead } from '../core/types/lead.types';
import { IWorkflowDefinition, IWorkflowInstance } from '../core/types/workflow.types';
import { IApprovalItem } from '../core/types/approval.types';
import { IAgentMetadata } from '../core/types/agent.types';
import { IKnowledgeDocument } from '../core/types/knowledge.types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [leads, setLeads] = useState<ILead[]>([]);
  const [workflows, setWorkflows] = useState<IWorkflowDefinition[]>([]);
  const [instances, setInstances] = useState<IWorkflowInstance[]>([]);
  const [approvals, setApprovals] = useState<IApprovalItem[]>([]);
  const [agents, setAgents] = useState<IAgentMetadata[]>([]);
  const [knowledgeDocs, setKnowledgeDocs] = useState<IKnowledgeDocument[]>([]);
  const [settings, setSettings] = useState<any>({ aiProvider: 'mock' });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const loadAllData = async () => {
    try {
      const [l, w, inst, apprs, ag, k, s] = await Promise.all([
        apiService.getLeads(),
        apiService.getWorkflows(),
        apiService.getWorkflowInstances(),
        apiService.getApprovals(),
        apiService.getAgents(),
        apiService.getKnowledgeDocs(),
        apiService.getSettings(),
      ]);
      setLeads(l || []);
      setWorkflows(w || []);
      setInstances(inst || []);
      setApprovals(apprs || []);
      setAgents(ag || []);
      setKnowledgeDocs(k || []);
      setSettings(s || { aiProvider: 'mock' });
    } catch (err) {
      console.error('Failed to load application data:', err);
    }
  };

  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadAllData, 4000);
    return () => clearInterval(interval);
  }, []);

  const pendingApprovalsCount = approvals.filter(a => a.status === 'REVIEW').length;
  const activeWorkflowsCount = instances.filter(w => w.status === 'RUNNING' || w.status === 'WAITING_APPROVAL').length;

  const handleLaunchWorkflowForLead = async (wfId: string, leadId: string) => {
    try {
      await apiService.startWorkflow(wfId, leadId);
      setActiveTab('workflows');
      loadAllData();
    } catch (err: any) {
      alert(`Failed to start workflow: ${err.message}`);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingApprovalsCount={pendingApprovalsCount}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="main-content">
        <Header
          currentProvider={settings.aiProvider || 'mock'}
          activeWorkflowsCount={activeWorkflowsCount}
          onRefresh={loadAllData}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {activeTab === 'dashboard' && (
          <DashboardView
            leads={leads}
            workflows={instances}
            approvals={approvals}
            agents={agents}
            setActiveTab={setActiveTab}
            onQuickStartWorkflow={(wfId) => {
              if (leads.length > 0) handleLaunchWorkflowForLead(wfId, leads[0].id);
            }}
          />
        )}

        {activeTab === 'agents' && <AgentsView agents={agents} />}

        {activeTab === 'workflows' && (
          <WorkflowsView
            workflows={workflows}
            instances={instances}
            leads={leads}
            onRefresh={loadAllData}
          />
        )}

        {activeTab === 'leads' && (
          <LeadsView
            leads={leads}
            onRefresh={loadAllData}
            onLaunchWorkflowForLead={handleLaunchWorkflowForLead}
          />
        )}

        {activeTab === 'approvals' && (
          <ApprovalsView
            approvals={approvals}
            onRefresh={loadAllData}
          />
        )}

        {activeTab === 'proposals' && <ProposalsView leads={leads} />}

        {activeTab === 'content_seo' && <ContentSeoView />}

        {activeTab === 'knowledge' && (
          <KnowledgeView
            documents={knowledgeDocs}
            onRefresh={loadAllData}
          />
        )}

        {activeTab === 'logs' && <LogsView />}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsSaved={loadAllData}
      />
    </div>
  );
};

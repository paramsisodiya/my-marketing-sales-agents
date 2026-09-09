import React, { useState, useEffect, useCallback } from 'react';
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

// Growth Engine Components
import { PublicNavbar } from './components/Growth/PublicNavbar';
import { PublicFooter } from './components/Growth/PublicFooter';
import { HomePage } from './components/Growth/HomePage';
import { AuditPage } from './components/Growth/AuditPage';
import { QrMenuLandingPage } from './components/Growth/QrMenuLandingPage';
import { PublicMenuView } from './components/Growth/PublicMenuView';
import { RestaurantLandingPage } from './components/Growth/RestaurantLandingPage';
import { SchoolLandingPage } from './components/Growth/SchoolLandingPage';
import { LocalBusinessLandingPage } from './components/Growth/LocalBusinessLandingPage';
import { ReferralLandingPage } from './components/Growth/ReferralLandingPage';
import { LegalPage } from './components/Growth/LegalPage';
import { GrowthOverview } from './components/Growth/GrowthOverview';
import { GrowthLeadsView } from './components/Growth/GrowthLeadsView';
import { AuditsManagerView } from './components/Growth/AuditsManagerView';
import { QrMenusManagerView } from './components/Growth/QrMenusManagerView';
import { ReferralsManagerView } from './components/Growth/ReferralsManagerView';

import { apiService } from './services/api.service';
import { ILead } from '../core/types/lead.types';
import { IAuditRecord, IQRRestaurant, IReferralRecord } from '../core/types/growth.types';
import { IWorkflowDefinition, IWorkflowInstance } from '../core/types/workflow.types';
import { IApprovalItem } from '../core/types/approval.types';
import { IAgentMetadata } from '../core/types/agent.types';
import { IKnowledgeDocument } from '../core/types/knowledge.types';

export const App: React.FC = () => {
  // Mode: 'public' (Customer-facing Growth Website) vs 'crm' (Internal Operations & AI Ops)
  const initialPath = typeof window !== 'undefined' ? window.location.pathname : '/';
  const isInitialCrm = initialPath.startsWith('/dashboard') || initialPath.startsWith('/admin');

  const [viewMode, setViewMode] = useState<'public' | 'crm'>(isInitialCrm ? 'crm' : 'public');
  const [currentRoute, setCurrentRoute] = useState<string>(initialPath || '/');
  const [referralCode, setReferralCode] = useState<string>('');

  // Internal CRM State
  const [activeTab, setActiveTab] = useState<TabType>('growth_overview');
  const [leads, setLeads] = useState<ILead[]>([]);
  const [audits, setAudits] = useState<IAuditRecord[]>([]);
  const [restaurants, setRestaurants] = useState<IQRRestaurant[]>([]);
  const [referrals, setReferrals] = useState<IReferralRecord[]>([]);
  const [workflows, setWorkflows] = useState<IWorkflowDefinition[]>([]);
  const [instances, setInstances] = useState<IWorkflowInstance[]>([]);
  const [approvals, setApprovals] = useState<IApprovalItem[]>([]);
  const [agents, setAgents] = useState<IAgentMetadata[]>([]);
  const [knowledgeDocs, setKnowledgeDocs] = useState<IKnowledgeDocument[]>([]);
  const [settings, setSettings] = useState<any>({ aiProvider: 'mock' });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Parse referral code if present in URL or stored
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check query params ?ref=XYZ
    const urlParams = new URLSearchParams(window.location.search);
    const qRef = urlParams.get('ref') || urlParams.get('utm_campaign');
    if (qRef) {
      localStorage.setItem('primesoul_ref', qRef.toUpperCase());
      setReferralCode(qRef.toUpperCase());
      apiService.trackReferralClick(qRef.toUpperCase()).catch(() => {});
    } else {
      const stored = localStorage.getItem('primesoul_ref');
      if (stored) setReferralCode(stored);
    }
  }, []);

  // Listen to browser back/forward history navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname || '/';
      if (path.startsWith('/dashboard') || path.startsWith('/admin')) {
        setViewMode('crm');
      } else {
        setViewMode('public');
        setCurrentRoute(path);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Central Navigation Handler
  const handleNavigate = useCallback((path: string) => {
    if (path.startsWith('/dashboard') || path.startsWith('/admin')) {
      setViewMode('crm');
      if (window.location.pathname !== path) {
        window.history.pushState({}, '', path);
      }
    } else {
      setViewMode('public');
      setCurrentRoute(path);
      if (window.location.pathname !== path) {
        window.history.pushState({}, '', path);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Fetch all CRM and app data
  const loadAllData = async () => {
    try {
      const [l, aud, rest, refs, w, inst, apprs, ag, k, s] = await Promise.all([
        apiService.getLeads(),
        apiService.getAudits(),
        apiService.getRestaurants(),
        apiService.getReferrals(),
        apiService.getWorkflows(),
        apiService.getWorkflowInstances(),
        apiService.getApprovals(),
        apiService.getAgents(),
        apiService.getKnowledgeDocs(),
        apiService.getSettings(),
      ]);
      setLeads(l || []);
      setAudits(aud || []);
      setRestaurants(rest || []);
      setReferrals(refs || []);
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
    const interval = setInterval(loadAllData, 5000);
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

  // ----------------------------------------------------
  // PUBLIC GROWTH WEBSITE ROUTER
  // ----------------------------------------------------
  if (viewMode === 'public') {
    // 1. Standalone Restaurant Public Menu (/qr-menu/:slug)
    if (currentRoute.startsWith('/qr-menu/') && currentRoute !== '/qr-menu' && currentRoute !== '/qr-menu/') {
      const slug = currentRoute.replace('/qr-menu/', '').split('?')[0].split('#')[0];
      return <PublicMenuView slug={slug} onNavigate={handleNavigate} />;
    }

    // 2. Main Public Customer Website Flow
    return (
      <div className="public-site-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <PublicNavbar
          currentRoute={currentRoute}
          onNavigate={handleNavigate}
          onSwitchToDashboard={() => handleNavigate('/dashboard')}
        />

        <main style={{ flex: 1 }}>
          {/* Route: Home (/) */}
          {currentRoute === '/' && <HomePage onNavigate={handleNavigate} />}

          {/* Route: Free Audit (/audit or /audit/result/:id) */}
          {currentRoute.startsWith('/audit') && (
            <AuditPage
              onNavigate={handleNavigate}
              referralCode={referralCode}
              auditId={currentRoute.includes('/result/') ? currentRoute.split('/result/')[1]?.split('?')[0] : undefined}
            />
          )}

          {/* Route: Free QR Menu Creator (/qr-menu) */}
          {(currentRoute === '/qr-menu' || currentRoute === '/qr-menu/') && (
            <QrMenuLandingPage onNavigate={handleNavigate} referralCode={referralCode} />
          )}

          {/* Route: Industry Landing - Restaurants (/for-restaurants) */}
          {currentRoute === '/for-restaurants' && <RestaurantLandingPage onNavigate={handleNavigate} />}

          {/* Route: Industry Landing - Schools & Coaching (/for-schools) */}
          {currentRoute === '/for-schools' && <SchoolLandingPage onNavigate={handleNavigate} />}

          {/* Route: Industry Landing - Local Businesses (/for-local-businesses) */}
          {currentRoute === '/for-local-businesses' && <LocalBusinessLandingPage onNavigate={handleNavigate} />}

          {/* Route: Referral Landing (/r/:code) */}
          {currentRoute.startsWith('/r/') && (
            <ReferralLandingPage
              code={currentRoute.replace('/r/', '').split('?')[0]}
              onNavigate={handleNavigate}
            />
          )}

          {/* Route: Legal - Privacy (/privacy) */}
          {currentRoute === '/privacy' && <LegalPage type="privacy" onNavigate={handleNavigate} />}

          {/* Route: Legal - Terms (/terms) */}
          {currentRoute === '/terms' && <LegalPage type="terms" onNavigate={handleNavigate} />}

          {/* 404 Fallback for unrecognized public paths */}
          {![
            '/',
            '/audit',
            '/qr-menu',
            '/for-restaurants',
            '/for-schools',
            '/for-local-businesses',
            '/privacy',
            '/terms',
          ].includes(currentRoute) &&
            !currentRoute.startsWith('/audit') &&
            !currentRoute.startsWith('/r/') && (
              <div className="not-found-container" style={{ padding: '80px 24px', textAlign: 'center' }}>
                <div style={{ maxWidth: '520px', margin: '0 auto' }}>
                  <h1 style={{ fontSize: '48px', fontWeight: '800', color: '#818cf8', marginBottom: '12px' }}>404</h1>
                  <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff', marginBottom: '12px' }}>
                    Page Not Found
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '28px', lineHeight: 1.6 }}>
                    The page you are looking for does not exist or has been moved. Explore our free growth tools below.
                  </p>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button onClick={() => handleNavigate('/')} className="btn btn-primary">
                      Back to Home
                    </button>
                    <button onClick={() => handleNavigate('/audit')} className="btn btn-secondary">
                      Free Business Audit
                    </button>
                    <button onClick={() => handleNavigate('/qr-menu')} className="btn btn-emerald">
                      Free QR Digital Menu
                    </button>
                  </div>
                </div>
              </div>
            )}
        </main>

        <PublicFooter onNavigate={handleNavigate} />
      </div>
    );
  }

  // ----------------------------------------------------
  // INTERNAL CRM & AGENT OS ROUTER
  // ----------------------------------------------------
  return (
    <div className="app-container">
      {/* Sidebar Navigation with Growth & Ops Tabs */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingApprovalsCount={pendingApprovalsCount}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onBackToPublicSite={() => handleNavigate('/')}
      />

      {/* Main Content Area */}
      <main className="main-content">
        <Header
          currentProvider={settings.aiProvider || 'mock'}
          activeWorkflowsCount={activeWorkflowsCount}
          onRefresh={loadAllData}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Growth Engine CRM Tabs */}
        {activeTab === 'growth_overview' && (
          <GrowthOverview
            leads={leads}
            audits={audits}
            restaurants={restaurants}
            referrals={referrals}
            onNavigateTab={(tab) => setActiveTab(tab as TabType)}
          />
        )}

        {activeTab === 'growth_leads' && (
          <GrowthLeadsView
            leads={leads}
            onRefresh={loadAllData}
            onNavigateTab={(tab) => setActiveTab(tab as TabType)}
          />
        )}

        {activeTab === 'growth_audits' && (
          <AuditsManagerView
            audits={audits}
            onRefresh={loadAllData}
            onNavigate={handleNavigate}
          />
        )}

        {activeTab === 'growth_menus' && (
          <QrMenusManagerView
            restaurants={restaurants}
            onRefresh={loadAllData}
            onNavigate={handleNavigate}
          />
        )}

        {activeTab === 'growth_referrals' && (
          <ReferralsManagerView
            referrals={referrals}
            onRefresh={loadAllData}
            onNavigate={handleNavigate}
          />
        )}

        {/* AI Specialist Ops & Workflows Tabs */}
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

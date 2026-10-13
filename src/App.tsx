import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { AuthModal } from './components/auth/AuthModal';
import { AppShell } from './components/layout/AppShell';

// Views
import { DashboardView } from './components/views/DashboardView';
import { FindBusinessesView } from './components/views/FindBusinessesView';
import { OpportunityScannerView } from './components/views/OpportunityScannerView';
import { LeadsView } from './components/views/LeadsView';
import { OutreachWorkspaceView } from './components/views/OutreachWorkspaceView';
import { ContactHistoryView } from './components/views/ContactHistoryView';
import { FollowUpsView } from './components/views/FollowUpsView';
import { DealRescueRadarView } from './components/views/DealRescueRadarView';
import { SalesAnalyticsView } from './components/views/SalesAnalyticsView';
import { SettingsView } from './components/views/SettingsView';

// Modals
import { LeadDetailDrawer } from './components/modals/LeadDetailDrawer';
import { NewLeadModal } from './components/modals/NewLeadModal';
import { DuplicateDetectorModal } from './components/modals/DuplicateDetectorModal';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';

import { DiscoveredBusiness } from './types';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  // Navigation view state: 10 views as specified
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [taskFilter, setTaskFilter] = useState<string>('all');

  // Modals and drawers
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [showDuplicatesModal, setShowDuplicatesModal] = useState(false);
  const [showGlobalSearchModal, setShowGlobalSearchModal] = useState(false);

  // Business to pass directly from Discovery to Opportunity Scanner
  const [scannerBusiness, setScannerBusiness] = useState<DiscoveredBusiness | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuotaExceeded = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  // Global Cmd+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowGlobalSearchModal((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F7FF] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-[#EDE9FE] border-t-[#7C3AED] animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthModal />;
  }

  const handleNavigate = (viewId: string, filter?: string) => {
    setCurrentView(viewId);
    if (viewId === 'tasks' && filter) {
      setTaskFilter(filter);
    }
  };

  const handleNavigateToScanner = (business: DiscoveredBusiness) => {
    setScannerBusiness(business);
    setCurrentView('scanner');
  };

  const handleNavigateToOutreach = (leadId: string) => {
    setSelectedLeadId(leadId);
    setCurrentView('outreach');
  };

  return (
    <>
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm flex items-center justify-center gap-2">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}
      <AppShell
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenGlobalSearch={() => setShowGlobalSearchModal(true)}
        onOpenNewLead={() => setShowNewLeadModal(true)}
      >
      {/* 1. Dashboard View */}
      {currentView === 'dashboard' && (
        <DashboardView
          onNavigate={handleNavigate}
          onSelectLead={(id) => setSelectedLeadId(id)}
        />
      )}

      {/* 2. Find Businesses View */}
      {currentView === 'discovery' && (
        <FindBusinessesView
          onNavigateToScanner={handleNavigateToScanner}
          onNavigateToLeads={() => setCurrentView('leads')}
        />
      )}

      {/* 3. Opportunity Scanner View */}
      {currentView === 'scanner' && (
        <OpportunityScannerView
          initialBusiness={scannerBusiness}
          onNavigateToOutreach={handleNavigateToOutreach}
          onNavigateToLeads={() => setCurrentView('leads')}
        />
      )}

      {/* 4. Leads View */}
      {currentView === 'leads' && (
        <LeadsView
          onSelectLead={(id) => setSelectedLeadId(id)}
          onOpenNewLead={() => setShowNewLeadModal(true)}
          onOpenDuplicates={() => setShowDuplicatesModal(true)}
        />
      )}

      {/* 5. Outreach Workspace View */}
      {currentView === 'outreach' && (
        <OutreachWorkspaceView
          initialLeadId={selectedLeadId}
          onNavigateToHistory={() => setCurrentView('history')}
        />
      )}

      {/* 6. Contact History View */}
      {currentView === 'history' && (
        <ContactHistoryView onSelectLead={(id) => setSelectedLeadId(id)} />
      )}

      {/* 7. Tasks & Follow-ups View */}
      {currentView === 'tasks' && (
        <FollowUpsView
          initialFilter={taskFilter}
          onSelectLead={(id) => setSelectedLeadId(id)}
        />
      )}

      {/* 8. Deal Rescue Radar View */}
      {currentView === 'radar' && (
        <DealRescueRadarView
          onSelectLead={(id) => setSelectedLeadId(id)}
          onNavigateToOutreach={handleNavigateToOutreach}
        />
      )}

      {/* 9. Sales Analytics View */}
      {currentView === 'analytics' && <SalesAnalyticsView />}

      {/* 10. Settings View */}
      {currentView === 'settings' && <SettingsView />}

      {/* Modals & Drawers */}
      <LeadDetailDrawer
        leadId={selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
        onOpenOutreach={(id) => handleNavigateToOutreach(id)}
        onOpenFollowUp={(id) => {
          setSelectedLeadId(null);
          setCurrentView('tasks');
        }}
      />

      <NewLeadModal
        isOpen={showNewLeadModal}
        onClose={() => setShowNewLeadModal(false)}
        onCreated={(newId) => setSelectedLeadId(newId)}
      />

      <DuplicateDetectorModal
        isOpen={showDuplicatesModal}
        onClose={() => setShowDuplicatesModal(false)}
      />

      <GlobalSearchModal
        isOpen={showGlobalSearchModal}
        onClose={() => setShowGlobalSearchModal(false)}
        onSelectLead={(id) => setSelectedLeadId(id)}
        onNavigateView={(v) => setCurrentView(v)}
      />
    </AppShell>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar, NavigationTab } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { DashboardView } from './components/DashboardView';
import { ResumeUploadView } from './components/ResumeUploadView';
import { DiscoverJobsView } from './components/DiscoverJobsView';
import { ShortlistedJobsView } from './components/ShortlistedJobsView';
import { StudioView } from './components/StudioView';
import { ApplicationsView } from './components/ApplicationsView';
import { SettingsView } from './components/SettingsView';
import { CandidateProfile, JobListing, SearchPreferences, AppDatabase } from './types';
import { api } from './services/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [preferences, setPreferences] = useState<SearchPreferences>({
    targetTitles: ['Full Stack Engineer', 'Frontend Engineer', 'Senior Software Engineer'],
    locations: ['Remote', 'United States'],
    remotePreference: 'any',
    experienceLevels: ['Mid', 'Senior'],
    minSalary: 110000,
    excludedCompanies: [],
    keywords: ['React', 'TypeScript', 'Node.js'],
    autoScanEnabled: true,
    scanIntervalHours: 12,
    autoPrepareResumeOnHighMatch: false,
    matchScoreThreshold: 75,
  });

  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isDiscovering, setIsDiscovering] = useState(false);

  // Cross-view selections
  const [selectedJobIdForStudio, setSelectedJobIdForStudio] = useState<string | null>(null);
  const [selectedJobForApplyModal, setSelectedJobForApplyModal] = useState<JobListing | null>(null);

  // Initial load
  const loadState = async () => {
    try {
      const db = await api.getDb();
      setProfile(db.profile);
      setJobs(db.jobs || []);
      if (db.preferences) {
        setPreferences(db.preferences);
      }
    } catch (err) {
      console.error('Error loading initial app state:', err);
    } finally {
      setIsLoadingInitial(false);
    }
  };

  useEffect(() => {
    loadState();
  }, []);

  // Quick Discovery Handler
  const handleQuickDiscover = async () => {
    setIsDiscovering(true);
    try {
      const res = await api.discoverJobs();
      setJobs(res.jobs);
      if (currentTab !== 'discover' && currentTab !== 'dashboard') {
        setCurrentTab('discover');
      }
    } catch (err: any) {
      alert(`Job scan error: ${err.message}`);
    } finally {
      setIsDiscovering(false);
    }
  };

  // Nav actions
  const handleSelectJobForStudio = (job: JobListing) => {
    setSelectedJobIdForStudio(job.id);
    setCurrentTab('studio');
  };

  const handleSelectJobForApply = (job: JobListing) => {
    setSelectedJobForApplyModal(job);
    setCurrentTab('applications');
  };

  if (isLoadingInitial) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 space-y-3">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-600">Loading AutoApply AI Agent...</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-[#0f172a]">
      {/* 260px Persistent Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        profile={profile}
        jobs={jobs}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          currentTab={currentTab}
          onNavigate={setCurrentTab}
          profile={profile}
          onQuickDiscover={handleQuickDiscover}
          isDiscovering={isDiscovering}
        />

        <main className="flex-1 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              profile={profile}
              jobs={jobs}
              preferences={preferences}
              onNavigate={setCurrentTab}
              onSelectJobForStudio={handleSelectJobForStudio}
              onSelectJobForApply={handleSelectJobForApply}
              onDiscover={handleQuickDiscover}
              isDiscovering={isDiscovering}
            />
          )}

          {currentTab === 'resume' && (
            <ResumeUploadView
              profile={profile}
              onProfileUpdated={(updated) => {
                setProfile(updated);
                loadState();
              }}
            />
          )}

          {currentTab === 'discover' && (
            <DiscoverJobsView
              jobs={jobs}
              profile={profile}
              preferences={preferences}
              onRefreshJobs={loadState}
              onSelectJobForStudio={handleSelectJobForStudio}
              onSelectJobForApply={handleSelectJobForApply}
              isDiscovering={isDiscovering}
              onDiscover={handleQuickDiscover}
            />
          )}

          {currentTab === 'shortlisted' && (
            <ShortlistedJobsView
              jobs={jobs}
              profile={profile}
              onRefreshJobs={loadState}
              onSelectJobForStudio={handleSelectJobForStudio}
              onSelectJobForApply={handleSelectJobForApply}
              onNavigateToDiscover={() => setCurrentTab('discover')}
            />
          )}

          {currentTab === 'studio' && (
            <StudioView
              jobs={jobs}
              profile={profile}
              selectedJobId={selectedJobIdForStudio}
              onSelectJob={setSelectedJobIdForStudio}
              onRefreshJobs={loadState}
              onNavigateToApply={handleSelectJobForApply}
            />
          )}

          {currentTab === 'applications' && (
            <ApplicationsView
              jobs={jobs}
              profile={profile}
              selectedJobForModal={selectedJobForApplyModal}
              onClearSelectedJobModal={() => setSelectedJobForApplyModal(null)}
              onRefreshJobs={loadState}
              onNavigateToStudio={handleSelectJobForStudio}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              preferences={preferences}
              profile={profile}
              onPreferencesUpdated={(newPrefs) => setPreferences(newPrefs)}
              onDataReset={loadState}
            />
          )}
        </main>
      </div>
    </div>
  );
}

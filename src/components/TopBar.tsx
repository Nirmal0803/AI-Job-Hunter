import React from 'react';
import { Compass, Upload, Sparkles } from 'lucide-react';
import { NavigationTab } from './Sidebar';
import { CandidateProfile } from '../types';

interface TopBarProps {
  currentTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  profile: CandidateProfile | null;
  onQuickDiscover: () => void;
  isDiscovering: boolean;
}

const tabTitles: Record<NavigationTab, { label: string; desc: string }> = {
  dashboard: { label: 'Executive Dashboard', desc: 'Real-time overview of your job search pipeline' },
  resume: { label: 'Resume Intelligence', desc: 'Automatic extraction, skill detection, and profile verification' },
  discover: { label: 'Job Discovery', desc: 'Multi-source job board aggregation and AI matching' },
  shortlisted: { label: 'Shortlisted Jobs', desc: 'Curated high-affinity roles ready for application prep' },
  studio: { label: 'Resume & Cover Letter Studio', desc: 'ATS-targeted resume customization and cover letters' },
  applications: { label: 'Application Automation & Tracker', desc: 'Browser-assisted autofill, approval gate, and outcome tracking' },
  settings: { label: 'Agent Settings', desc: 'Search filters, background scheduling, and privacy' },
};

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onNavigate,
  profile,
  onQuickDiscover,
  isDiscovering,
}) => {
  const current = tabTitles[currentTab];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between gap-8 sticky top-0 z-20">
      {/* Zone 1: Contextual Breadcrumb */}
      <div className="flex items-center gap-2 text-sm whitespace-nowrap shrink-0">
        <span className="font-semibold text-slate-400">Agent</span>
        <span className="text-slate-300">/</span>
        <span className="font-bold text-slate-900">{current.label}</span>
      </div>

      {/* Zone 2: Quiet Status / Pipeline summary */}
      <div className="hidden md:flex items-center gap-3 text-xs text-slate-500 whitespace-nowrap truncate">
        {profile ? (
          <>
            <span className="font-medium text-slate-700">{profile.fullName}</span>
            <span aria-hidden="true">·</span>
            <span>{profile.headline}</span>
            <span aria-hidden="true">·</span>
            <span>{profile.location || 'Remote'}</span>
          </>
        ) : (
          <span>No resume uploaded yet. Start by uploading a PDF or DOCX file.</span>
        )}
      </div>

      {/* Zone 3: 1 Primary Action */}
      <div className="flex items-center gap-3 shrink-0">
        {!profile ? (
          <button
            onClick={() => onNavigate('resume')}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Master Resume
          </button>
        ) : currentTab === 'discover' || currentTab === 'dashboard' ? (
          <button
            onClick={onQuickDiscover}
            disabled={isDiscovering}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shadow-sm disabled:opacity-50"
          >
            <Compass className={`w-3.5 h-3.5 ${isDiscovering ? 'animate-spin' : ''}`} />
            {isDiscovering ? 'Scanning Job Boards...' : 'Discover Jobs Now'}
          </button>
        ) : (
          <button
            onClick={() => onNavigate('discover')}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Explore New Opportunities
          </button>
        )}
      </div>
    </header>
  );
};

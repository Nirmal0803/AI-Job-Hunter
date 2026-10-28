import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Compass,
  BookmarkCheck,
  Sparkles,
  Send,
  Settings,
  CheckCircle2,
  AlertCircle,
  Briefcase,
} from 'lucide-react';
import { CandidateProfile, JobListing } from '../types';

export type NavigationTab =
  | 'dashboard'
  | 'resume'
  | 'discover'
  | 'shortlisted'
  | 'studio'
  | 'applications'
  | 'settings';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  profile: CandidateProfile | null;
  jobs: JobListing[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  profile,
  jobs,
}) => {
  const shortlistedCount = jobs.filter((j) => j.status === 'Shortlisted').length;
  const readyCount = jobs.filter((j) => j.status === 'Resume Ready').length;
  const awaitingCount = jobs.filter((j) => j.status === 'Awaiting Approval').length;
  const appliedCount = jobs.filter((j) => j.status === 'Applied' || j.status === 'Interview' || j.status === 'Offer').length;

  const navItems = [
    {
      id: 'dashboard' as NavigationTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'resume' as NavigationTab,
      label: 'Upload Resume',
      icon: FileText,
      badge: profile?.isApproved ? 'Verified' : profile ? 'Review' : null,
      badgeType: profile?.isApproved ? 'success' : 'warn',
    },
    {
      id: 'discover' as NavigationTab,
      label: 'Discover Jobs',
      icon: Compass,
      badge: jobs.length > 0 ? jobs.length : null,
    },
    {
      id: 'shortlisted' as NavigationTab,
      label: 'Shortlisted',
      icon: BookmarkCheck,
      badge: shortlistedCount > 0 ? shortlistedCount : null,
    },
    {
      id: 'studio' as NavigationTab,
      label: 'Resume & Studio',
      icon: Sparkles,
      badge: readyCount > 0 ? readyCount : null,
    },
    {
      id: 'applications' as NavigationTab,
      label: 'Applications',
      icon: Send,
      badge: awaitingCount > 0 ? `${awaitingCount} ready` : appliedCount > 0 ? appliedCount : null,
      badgeType: awaitingCount > 0 ? 'accent' : 'default',
    },
    {
      id: 'settings' as NavigationTab,
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 h-screen sticky top-0 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-200">
        <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-sm">
          <Briefcase className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-bold text-slate-900 text-base tracking-tight leading-none block">
            AutoApply AI
          </span>
          <span className="text-xs text-slate-500 font-medium leading-tight">
            Personal Job-Hunting Agent
          </span>
        </div>
      </div>

      {/* Profile Trust Status Banner */}
      <div className="px-4 py-3 mx-3 my-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-600 font-medium">Candidate Profile</span>
          {profile?.isApproved ? (
            <span className="text-emerald-700 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Approved
            </span>
          ) : profile ? (
            <span className="text-amber-700 flex items-center gap-1 font-semibold">
              <AlertCircle className="w-3.5 h-3.5" /> Pending Review
            </span>
          ) : (
            <span className="text-slate-500">Not Uploaded</span>
          )}
        </div>
        <div className="mt-1 truncate font-semibold text-slate-900">
          {profile ? profile.fullName : 'Please upload resume'}
        </div>
        {profile && (
          <div className="text-[11px] text-slate-500 truncate">
            {profile.headline}
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap text-left ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-slate-500'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== null && (
                <span
                  className={`text-xs px-2 py-0.5 rounded font-mono tabular-nums font-semibold shrink-0 ${
                    isActive
                      ? 'bg-slate-800 text-slate-200'
                      : item.badgeType === 'accent'
                      ? 'bg-amber-100 text-amber-800'
                      : item.badgeType === 'success'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Agent Status Footer */}
      <div className="p-4 border-t border-slate-200 text-xs text-slate-500 space-y-1">
        <div className="flex items-center justify-between">
          <span>Engine Status</span>
          <span className="font-semibold text-emerald-600">Local-First / Active</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Model</span>
          <span className="font-mono">Gemini 3.8 Flash</span>
        </div>
      </div>
    </aside>
  );
};

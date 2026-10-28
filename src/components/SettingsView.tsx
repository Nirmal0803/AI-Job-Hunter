import React, { useState } from 'react';
import {
  Settings,
  Clock,
  Shield,
  Download,
  Trash2,
  Save,
  CheckCircle2,
  Sliders,
  Building,
  Key,
  Info,
  RefreshCw,
} from 'lucide-react';
import { SearchPreferences, CandidateProfile } from '../types';
import { api } from '../services/api';

interface SettingsViewProps {
  preferences: SearchPreferences;
  profile: CandidateProfile | null;
  onPreferencesUpdated: (prefs: SearchPreferences) => void;
  onDataReset: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  preferences,
  profile,
  onPreferencesUpdated,
  onDataReset,
}) => {
  const [formData, setFormData] = useState<SearchPreferences>(preferences);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newTitleInput, setNewTitleInput] = useState('');
  const [newExcludedInput, setNewExcludedInput] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await api.updatePreferences(formData);
      onPreferencesUpdated(res.preferences);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      alert(`Failed to save settings: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTitle = () => {
    if (!newTitleInput.trim()) return;
    if (formData.targetTitles.includes(newTitleInput.trim())) return;
    setFormData({
      ...formData,
      targetTitles: [...formData.targetTitles, newTitleInput.trim()],
    });
    setNewTitleInput('');
  };

  const handleRemoveTitle = (title: string) => {
    setFormData({
      ...formData,
      targetTitles: formData.targetTitles.filter((t) => t !== title),
    });
  };

  const handleAddExcluded = () => {
    if (!newExcludedInput.trim()) return;
    if (formData.excludedCompanies.includes(newExcludedInput.trim())) return;
    setFormData({
      ...formData,
      excludedCompanies: [...formData.excludedCompanies, newExcludedInput.trim()],
    });
    setNewExcludedInput('');
  };

  const handleRemoveExcluded = (company: string) => {
    setFormData({
      ...formData,
      excludedCompanies: formData.excludedCompanies.filter((c) => c !== company),
    });
  };

  const handleReset = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset your local database? All stored jobs and extracted profiles will be cleared.'
    );
    if (confirmed) {
      await api.resetData();
      onDataReset();
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Agent Preferences & Automation Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure search queries, autonomous scanning cadence, match thresholds, and local privacy.
        </p>
      </div>

      {/* Target Job Titles */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-slate-600" />
          Target Job Titles
        </h3>

        <div className="flex flex-wrap gap-2">
          {formData.targetTitles.map((title) => (
            <span
              key={title}
              className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-medium flex items-center gap-1.5"
            >
              <span>{title}</span>
              <button
                onClick={() => handleRemoveTitle(title)}
                className="text-slate-400 hover:text-rose-600"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 max-w-md">
          <input
            type="text"
            value={newTitleInput}
            onChange={(e) => setNewTitleInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTitle()}
            placeholder="Add title: e.g. Staff AI Engineer"
            className="flex-1 text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-slate-900"
          />
          <button
            onClick={handleAddTitle}
            className="px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
          >
            Add
          </button>
        </div>
      </div>

      {/* Work Arrangement & Minimum Salary */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Work Arrangement & Compensation</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Work Arrangement Preference
            </label>
            <select
              value={formData.remotePreference}
              onChange={(e) => setFormData({ ...formData, remotePreference: e.target.value as any })}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-slate-900 font-medium"
            >
              <option value="any">Any (Remote, Hybrid, or Onsite)</option>
              <option value="remote_only">Remote Only</option>
              <option value="hybrid">Hybrid Allowed</option>
              <option value="onsite">Onsite</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Minimum Target Salary (USD/Year)
            </label>
            <input
              type="number"
              step={5000}
              value={formData.minSalary || 0}
              onChange={(e) => setFormData({ ...formData, minSalary: Number(e.target.value) })}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-slate-900 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Excluded Companies (Blacklist) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-4 h-4 text-slate-600" />
            Excluded Companies
          </h3>
          <p className="text-xs text-slate-500">
            Exclude your current employer or specific organizations from discovery and auto-shortlisting.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {formData.excludedCompanies.length === 0 ? (
            <span className="text-xs text-slate-400">No companies excluded.</span>
          ) : (
            formData.excludedCompanies.map((c) => (
              <span
                key={c}
                className="px-3 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-xs font-medium flex items-center gap-1.5"
              >
                <span>{c}</span>
                <button
                  onClick={() => handleRemoveExcluded(c)}
                  className="text-rose-400 hover:text-rose-700"
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>

        <div className="flex items-center gap-2 max-w-md">
          <input
            type="text"
            value={newExcludedInput}
            onChange={(e) => setNewExcludedInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddExcluded()}
            placeholder="Add company name to exclude..."
            className="flex-1 text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-slate-900"
          />
          <button
            onClick={handleAddExcluded}
            className="px-3 py-2 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold hover:bg-slate-200 border border-slate-200"
          >
            Add
          </button>
        </div>
      </div>

      {/* Autonomous Scheduling & Scoring Thresholds */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-600" />
          Autonomous Discovery Cadence
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Auto-Discovery Cadence
            </label>
            <select
              value={formData.scanIntervalHours}
              onChange={(e) => setFormData({ ...formData, scanIntervalHours: Number(e.target.value) })}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-slate-900 font-medium"
            >
              <option value={6}>Every 6 hours</option>
              <option value={12}>Every 12 hours (Recommended)</option>
              <option value={24}>Once daily (24 hours)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Auto-Shortlist Match Score Threshold
            </label>
            <select
              value={formData.matchScoreThreshold}
              onChange={(e) => setFormData({ ...formData, matchScoreThreshold: Number(e.target.value) })}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-slate-900 font-medium font-mono"
            >
              <option value={65}>Score ≥ 65%</option>
              <option value={75}>Score ≥ 75% (Recommended)</option>
              <option value={85}>Score ≥ 85% (High Affinity Only)</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
          <span>Last automated scan:</span>
          <span className="font-mono text-slate-700">
            {formData.lastScanTime ? new Date(formData.lastScanTime).toLocaleString() : 'Never'}
          </span>
        </div>
      </div>

      {/* Security & Data Privacy Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            Security & Privacy Architecture
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            AutoApply AI operates in local-first mode. All uploaded resumes, profile documents, and applications are stored locally on your system in an encrypted JSON database. Resume excerpts are sent over SSL to Google Gemini AI solely for analysis and ATS tailoring when triggered.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <a
            href="/api/export"
            download
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 border border-slate-200"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Database JSON</span>
          </a>

          <button
            onClick={handleReset}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 border border-rose-200"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Stored Data</span>
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-4">
        {saveSuccess && (
          <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Preferences saved!
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>
    </div>
  );
};

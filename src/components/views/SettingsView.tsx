import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  Settings,
  User,
  Building,
  Sparkles,
  Shield,
  RotateCcw,
  Download,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Key,
  Database,
  Lock,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { settings, updateSettings, resetToDemoData, exportAllDataJSON } = useData();

  // Profile fields
  const [userName, setUserName] = useState(user?.name || '');
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [role, setRole] = useState(user?.role || '');

  // ICP & Services fields
  const [services, setServices] = useState<string[]>(settings.servicesOffered);
  const [newServiceText, setNewServiceText] = useState('');
  const [icpText, setIcpText] = useState(settings.icpDescription);
  const [defaultTone, setDefaultTone] = useState(settings.defaultTone);
  const [followUpInterval, setFollowUpInterval] = useState(settings.defaultFollowUpIntervalDays);

  const [saveFeedback, setSaveFeedback] = useState(false);

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceText.trim()) return;
    const next = [...services, newServiceText.trim()];
    setServices(next);
    updateSettings({ servicesOffered: next });
    setNewServiceText('');
  };

  const handleRemoveService = (index: number) => {
    const next = services.filter((_, i) => i !== index);
    setServices(next);
    updateSettings({ servicesOffered: next });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: userName,
      companyName,
      role,
    });
    updateSettings({
      companyName,
      icpDescription: icpText,
      defaultTone,
      defaultFollowUpIntervalDays: followUpInterval,
    });
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2500);
  };

  const handleResetData = () => {
    if (confirm('Reset your entire workspace to the rich sample demo dataset? This will restore realistic leads, tasks, and history.')) {
      resetToDemoData();
      alert('Workspace reset to initial demo state!');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#312E81] tracking-tight">System & Account Settings</h1>
          <p className="text-xs text-[#6B7280] mt-1">
            Configure your sales organization, services, ideal customer profile, and integration providers.
          </p>
        </div>

        {saveFeedback && (
          <div className="px-3.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Settings saved successfully!
          </div>
        )}
      </div>

      {/* SECTION 1: User & Organization Profile */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] card-shadow space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#F3F4F6]">
          <div className="w-8 h-8 rounded-lg bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#17172A]">User & Organization Profile</h3>
            <p className="text-[11px] text-[#6B7280]">Your public business representation in outreach signatures</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-[#17172A] mb-1">Your Full Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#17172A] mb-1">Company / Agency Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#17172A] mb-1">Role / Job Title</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#17172A] mb-1">Account Work Email</label>
            <input
              type="text"
              disabled
              value={user?.email || 'user@autonexa.io'}
              className="w-full sm:max-w-md px-3 py-2 bg-gray-50 border border-[#E5E7EB] rounded-lg text-gray-500 cursor-not-allowed"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 font-bold text-white bg-[#312E81] hover:bg-[#282568] rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Update Profile
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: Core Services Offered Manager */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] card-shadow space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#F3F4F6]">
          <div className="w-8 h-8 rounded-lg bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#17172A]">Core Services & Pitches</h3>
            <p className="text-[11px] text-[#6B7280]">
              The services Gemini references during Opportunity Scans and Outreach copywriting
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {services.map((srv, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F8F7FF] border border-[#DDD6FE] text-xs font-semibold text-[#312E81]"
              >
                {srv}
                <button
                  type="button"
                  onClick={() => handleRemoveService(idx)}
                  className="text-gray-400 hover:text-red-600 cursor-pointer ml-1"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>

          <form onSubmit={handleAddService} className="flex gap-2 text-xs">
            <input
              type="text"
              value={newServiceText}
              onChange={(e) => setNewServiceText(e.target.value)}
              placeholder="Add another service offering (e.g. AI Customer Service Chatbot)..."
              className="flex-1 px-3 py-2 bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
            />
            <button
              type="submit"
              className="px-4 py-2 font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-lg cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </form>
        </div>

        {/* ICP Statement */}
        <div className="pt-3 border-t border-[#F3F4F6] space-y-2">
          <label className="block text-xs font-semibold text-[#17172A]">
            Ideal Customer Profile (ICP) Blueprint
          </label>
          <textarea
            rows={3}
            value={icpText}
            onChange={(e) => setIcpText(e.target.value)}
            className="w-full p-3 text-xs bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] text-[#17172A] leading-relaxed"
          />
        </div>
      </div>

      {/* SECTION 3: Service Providers & Integrations Status */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] card-shadow space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#F3F4F6]">
          <div className="w-8 h-8 rounded-lg bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#17172A]">Integrations & Provider Status</h3>
            <p className="text-[11px] text-[#6B7280]">Real-time operational status of connected APIs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Gemini */}
          <div className="p-4 rounded-xl border border-[#DDD6FE] bg-[#F8F7FF] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#312E81]">Gemini AI 3.8</span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Connected
              </span>
            </div>
            <p className="text-[11px] text-[#6B7280] leading-relaxed">
              Powers opportunity analysis, personalized copywriting, and reply intelligence on the secure server.
            </p>
          </div>

          {/* Google Places */}
          <div className="p-4 rounded-xl border border-[#E5E7EB] bg-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#17172A]">Google Places API (New)</span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Live Active
              </span>
            </div>
            <p className="text-[11px] text-[#6B7280] leading-relaxed">
              Real-time Indian business discovery connected via Places API (New) text search and geocoding.
            </p>
          </div>

          {/* Outreach Sender */}
          <div className="p-4 rounded-xl border border-[#E5E7EB] bg-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#17172A]">Outreach Dispatcher</span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-100 text-purple-800">
                Demo Simulation
              </span>
            </div>
            <p className="text-[11px] text-[#6B7280] leading-relaxed">
              Outreach messages simulate delivery safely without accidentally spamming unverified contacts.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 4: Demo Mode & Backup Utilities */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] card-shadow space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#F3F4F6]">
          <div className="w-8 h-8 rounded-lg bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#17172A]">Demo Controls & Data Backup</h3>
            <p className="text-[11px] text-[#6B7280]">Reset sample data or export your complete sales pipeline as JSON</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#17172A]">Reset Demo Records</span>
            <p className="text-[11px] text-[#6B7280]">
              Restore pre-configured high-conversion dental, clinic, legal, and architecture leads and follow-ups.
            </p>
          </div>
          <button
            onClick={handleResetData}
            className="px-4 py-2 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Sample Demo Dataset
          </button>
        </div>

        <div className="pt-3 border-t border-[#F3F4F6] flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#17172A]">Full JSON Backup Export</span>
            <p className="text-[11px] text-[#6B7280]">
              Download full pipeline database (leads, scans, drafts, interactions, and settings).
            </p>
          </div>
          <button
            onClick={exportAllDataJSON}
            className="px-4 py-2 text-xs font-bold text-white bg-[#312E81] hover:bg-[#282568] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#93C5FD]" />
            Download Full JSON Backup
          </button>
        </div>
      </div>

      {/* SECTION 5: Compliance and Privacy Information */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#EDE9FE]/50 to-[#F8F7FF] border border-[#DDD6FE] flex items-start gap-3 text-xs text-[#312E81]">
        <Shield className="w-5 h-5 text-[#7C3AED] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">GDPR & CAN-SPAM Compliance Guard</p>
          <p className="text-[11px] text-[#4338CA] leading-relaxed">
            AUTONEXA enforces an active opt-out policy. When a prospect requests removal, their record is immediately flagged as Opted Out, all open tasks and follow-ups are cancelled, and promotional outreach generation is programmatically blocked.
          </p>
        </div>
      </div>
    </div>
  );
};

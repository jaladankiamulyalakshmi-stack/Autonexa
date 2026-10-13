import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Lead, PipelineStage, Priority } from '../../types';
import {
  X,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Plus,
  Send,
  Trash2,
  ShieldAlert,
  Sparkles,
  Info,
  DollarSign,
  User,
} from 'lucide-react';

interface LeadDetailDrawerProps {
  leadId: string | null;
  onClose: () => void;
  onOpenOutreach?: (leadId: string) => void;
  onOpenFollowUp?: (leadId: string) => void;
}

const STAGES: PipelineStage[] = [
  'New Lead',
  'Qualified',
  'Contacted',
  'Replied',
  'Meeting Scheduled',
  'Proposal Sent',
  'Negotiation',
  'Won',
  'Lost',
];

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({
  leadId,
  onClose,
  onOpenOutreach,
  onOpenFollowUp,
}) => {
  const { leads, updateLead, moveLeadStage, deleteLead, markOptOut, tasks, interactions } = useData();
  const lead = leads.find((l) => l.id === leadId);

  const [activeTab, setActiveTab] = useState<'overview' | 'scoring' | 'tasks' | 'timeline'>('overview');
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [showOptOutConfirm, setShowOptOutConfirm] = useState(false);

  React.useEffect(() => {
    if (lead) {
      setNotesText(lead.notes || '');
    }
  }, [lead]);

  if (!lead) return null;

  const leadTasks = tasks.filter((t) => t.leadId === lead.id);
  const leadHistory = interactions.filter((act) => act.leadId === lead.id);

  const handleSaveNotes = () => {
    updateLead(lead.id, { notes: notesText });
    setEditingNotes(false);
  };

  const handleOptOutConfirm = () => {
    markOptOut(lead.id, 'Opt-out requested in Lead Drawer');
    setShowOptOutConfirm(false);
  };

  const priorityBadgeColor = (p: Priority) => {
    if (p === 'HIGH') return 'bg-red-50 text-red-700 border-red-200';
    if (p === 'MEDIUM') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-[#E5E7EB] animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#E5E7EB] bg-[#F8F7FF] flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${priorityBadgeColor(lead.priority)}`}>
                {lead.priority} PRIORITY
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-[#EDE9FE] text-[#312E81]">
                Score: {lead.leadScore}/100
              </span>
              {lead.isOptedOut && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-800 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  OPTED OUT
                </span>
              )}
            </div>
            <h2 className="text-xl font-extrabold text-[#17172A]">{lead.businessName}</h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6B7280]">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#7C3AED]" />
                {lead.location}
              </span>
              <span>•</span>
              <span>{lead.industry}</span>
              <span>•</span>
              <span className="text-[#312E81] font-medium">Owner: {lead.leadOwner}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#6B7280] hover:text-[#17172A] hover:bg-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pipeline Stage Bar */}
        <div className="px-6 py-3 bg-[#EDE9FE]/50 border-b border-[#DDD6FE] flex items-center justify-between">
          <span className="text-xs font-semibold text-[#312E81]">Pipeline Stage:</span>
          <select
            value={lead.pipelineStage}
            onChange={(e) => moveLeadStage(lead.id, e.target.value as PipelineStage)}
            className="text-xs font-bold bg-white border border-[#DDD6FE] text-[#312E81] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] cursor-pointer"
          >
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E5E7EB] px-6 text-xs font-semibold text-[#6B7280]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#7C3AED] text-[#7C3AED] font-bold'
                : 'border-transparent hover:text-[#17172A]'
            }`}
          >
            Overview & Details
          </button>
          <button
            onClick={() => setActiveTab('scoring')}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'scoring'
                ? 'border-[#7C3AED] text-[#7C3AED] font-bold'
                : 'border-transparent hover:text-[#17172A]'
            }`}
          >
            Score Explainability ({lead.leadScore})
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'tasks'
                ? 'border-[#7C3AED] text-[#7C3AED] font-bold'
                : 'border-transparent hover:text-[#17172A]'
            }`}
          >
            Follow-ups ({leadTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'timeline'
                ? 'border-[#7C3AED] text-[#7C3AED] font-bold'
                : 'border-transparent hover:text-[#17172A]'
            }`}
          >
            History ({leadHistory.length})
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Opportunity Highlight Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#EDE9FE]/70 to-[#F8F7FF] border border-[#DDD6FE]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#7C3AED] uppercase tracking-wider mb-1">
                  <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                  Scanned Business Opportunity
                </div>
                <p className="text-sm font-semibold text-[#17172A] mt-1 leading-snug">
                  {lead.opportunitySummary}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-[#312E81]">
                  <span className="font-bold">Target Service:</span>
                  <span className="bg-white/80 px-2 py-0.5 rounded border border-[#DDD6FE]">
                    {lead.serviceOffered}
                  </span>
                </div>
              </div>

              {/* Deal Value & Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white border border-[#E5E7EB]">
                  <span className="text-xs text-[#6B7280] font-medium flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    Deal Value
                  </span>
                  <p className="text-lg font-bold text-[#17172A] mt-1">${lead.dealValue.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#E5E7EB]">
                  <span className="text-xs text-[#6B7280] font-medium flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-[#312E81]" />
                    Decision Maker
                  </span>
                  <p className="text-sm font-bold text-[#17172A] mt-1 truncate">
                    {lead.contactPerson || 'Not identified yet'}
                  </p>
                </div>
              </div>

              {/* Channels */}
              <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] space-y-3">
                <h4 className="text-xs font-bold text-[#312E81] uppercase tracking-wider">Contact Channels</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-[#F3F4F6]">
                    <span className="text-[#6B7280] flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#7C3AED]" /> Email
                    </span>
                    <span className="font-medium text-[#17172A]">{lead.email || 'None available'}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-[#F3F4F6]">
                    <span className="text-[#6B7280] flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#7C3AED]" /> Phone
                    </span>
                    <span className="font-medium text-[#17172A]">{lead.phone || 'None available'}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-[#6B7280] flex items-center gap-2">
                      <ExternalLink className="w-3.5 h-3.5 text-[#7C3AED]" /> Website
                    </span>
                    {lead.website ? (
                      <a
                        href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-[#7C3AED] hover:underline truncate max-w-[240px]"
                      >
                        {lead.website}
                      </a>
                    ) : (
                      <span className="text-[#9CA3AF]">No website recorded</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#312E81] uppercase tracking-wider">Internal Notes</h4>
                  {!editingNotes && (
                    <button
                      onClick={() => setEditingNotes(true)}
                      className="text-xs text-[#7C3AED] font-semibold hover:underline cursor-pointer"
                    >
                      Edit Notes
                    </button>
                  )}
                </div>
                {editingNotes ? (
                  <div className="space-y-2">
                    <textarea
                      value={notesText}
                      onChange={(e) => setNotesText(e.target.value)}
                      rows={4}
                      className="w-full text-xs p-3 border border-[#DDD6FE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingNotes(false)}
                        className="px-3 py-1 text-xs text-[#6B7280] hover:bg-gray-100 rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveNotes}
                        className="px-3 py-1 text-xs bg-[#312E81] text-white font-semibold rounded-lg hover:bg-[#282568] cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#4B5563] whitespace-pre-wrap leading-relaxed">
                    {lead.notes || 'No notes added yet.'}
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'scoring' && (
            <div className="space-y-6">
              {/* Score header */}
              <div className="p-5 rounded-xl bg-gradient-to-r from-[#EDE9FE] to-white border border-[#DDD6FE] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#7C3AED] uppercase tracking-wider">
                    Transparent Lead Score
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold text-[#312E81]">{lead.leadScore}</span>
                    <span className="text-xs text-[#6B7280]">/ 100 max</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${priorityBadgeColor(lead.priority)}`}>
                    {lead.priority} Priority Tier
                  </span>
                  <p className="text-[11px] text-[#6B7280] mt-1.5">Deterministic model</p>
                </div>
              </div>

              {/* Sub-score bars */}
              <div className="space-y-3 p-4 rounded-xl bg-white border border-[#E5E7EB]">
                <h4 className="text-xs font-bold text-[#312E81] uppercase tracking-wider">Score Breakdown</h4>
                {[
                  { label: 'Service Fit', value: lead.scoreBreakdown.serviceFit, max: 25 },
                  { label: 'Industry Relevance', value: lead.scoreBreakdown.industryRelevance, max: 20 },
                  { label: 'Evidence of Opportunity', value: lead.scoreBreakdown.evidenceFound, max: 20 },
                  { label: 'Location Match', value: lead.scoreBreakdown.locationMatch, max: 15 },
                  { label: 'Contactability', value: lead.scoreBreakdown.contactability, max: 10 },
                  { label: 'Profile Completeness', value: lead.scoreBreakdown.profileCompleteness, max: 10 },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#4B5563] font-medium">{item.label}</span>
                      <span className="font-bold text-[#312E81]">
                        {item.value} / {item.max}
                      </span>
                    </div>
                    <div className="w-full bg-[#F3F4F6] rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#7C3AED] h-full rounded-full transition-all duration-500"
                        style={{ width: `${(item.value / item.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Positive Factors */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 uppercase">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Factors Increasing Score
                </span>
                <ul className="text-xs text-emerald-900 space-y-1 list-disc list-inside">
                  {lead.scoreBreakdown.positiveFactors.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>

              {/* Missing Info */}
              {lead.scoreBreakdown.missingInfo.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2">
                  <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5 uppercase">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Missing Information
                  </span>
                  <ul className="text-xs text-amber-900 space-y-1 list-disc list-inside">
                    {lead.scoreBreakdown.missingInfo.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommended Next Action */}
              <div className="p-4 rounded-xl bg-[#EDE9FE] border border-[#DDD6FE] space-y-1">
                <span className="text-xs font-bold text-[#312E81] flex items-center gap-1.5 uppercase">
                  <Info className="w-4 h-4 text-[#7C3AED]" />
                  Recommended Action
                </span>
                <p className="text-xs text-[#312E81] leading-relaxed font-medium">
                  {lead.scoreBreakdown.recommendedAction}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#312E81] uppercase tracking-wider">Scheduled Tasks</h4>
                <button
                  onClick={() => onOpenFollowUp && onOpenFollowUp(lead.id)}
                  className="px-2.5 py-1 text-xs bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Follow-up
                </button>
              </div>

              {leadTasks.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#6B7280] bg-[#F8F7FF] rounded-xl border border-dashed border-[#DDD6FE]">
                  No tasks or reminders logged for this lead yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {leadTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 bg-white rounded-xl border border-[#E5E7EB] flex items-start justify-between text-xs"
                    >
                      <div className="space-y-1">
                        <span
                          className={`font-bold ${
                            task.status === 'COMPLETED' ? 'line-through text-[#9CA3AF]' : 'text-[#17172A]'
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.description && <p className="text-[#6B7280]">{task.description}</p>}
                        <div className="flex items-center gap-2 text-[11px] text-[#6B7280]">
                          <Calendar className="w-3 h-3 text-[#7C3AED]" />
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gray-100 text-[#4B5563]">
                        {task.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-[#312E81] uppercase tracking-wider">Audit Log & Timeline</h4>
              {leadHistory.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#6B7280] bg-[#F8F7FF] rounded-xl border border-dashed border-[#DDD6FE]">
                  No activity recorded yet.
                </div>
              ) : (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#DDD6FE]">
                  {leadHistory.map((act) => (
                    <div key={act.id} className="relative text-xs space-y-0.5">
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-[#7C3AED] ring-4 ring-white" />
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#312E81]">{act.eventType.replace(/_/g, ' ')}</span>
                        <span className="text-[10px] text-[#9CA3AF]">
                          {new Date(act.timestamp).toLocaleDateString()} {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[#4B5563] text-xs leading-relaxed">{act.details}</p>
                      <span className="text-[10px] text-[#7C3AED] font-medium">By {act.author}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 bg-[#F8F7FF] border-t border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!lead.isOptedOut && (
              <button
                onClick={() => setShowOptOutConfirm(true)}
                className="px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Opt Out
              </button>
            )}
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete lead "${lead.businessName}"?`)) {
                  deleteLead(lead.id);
                  onClose();
                }
              }}
              className="px-2.5 py-2 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={lead.isOptedOut}
              onClick={() => {
                if (onOpenOutreach) {
                  onClose();
                  onOpenOutreach(lead.id);
                }
              }}
              className="px-4 py-2 text-xs font-bold bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Draft Personalized Outreach
            </button>
          </div>
        </div>

        {/* Opt-out confirmation modal */}
        {showOptOutConfirm && (
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-red-200">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h3 className="text-base font-bold text-[#17172A]">Enforce Opt-Out Compliance</h3>
                <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
                  Flagging this contact as Opted Out will permanently cancel all pending outreach tasks and prevent promotional emails from being generated.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowOptOutConfirm(false)}
                  className="flex-1 py-2 text-xs font-semibold text-[#4B5563] bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleOptOutConfirm}
                  className="flex-1 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer"
                >
                  Confirm Opt-Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

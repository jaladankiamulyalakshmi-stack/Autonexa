import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Channel, Tone, OutreachDraft } from '../../types';
import {
  Send,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Mail,
  Linkedin,
  Phone,
  ShieldAlert,
  Edit3,
  CheckCircle2,
  Clock,
  Building2,
  FileText,
} from 'lucide-react';

interface OutreachWorkspaceViewProps {
  initialLeadId?: string | null;
  onNavigateToHistory: () => void;
}

export const OutreachWorkspaceView: React.FC<OutreachWorkspaceViewProps> = ({
  initialLeadId,
  onNavigateToHistory,
}) => {
  const {
    leads,
    outreachDrafts,
    generateOutreachDraft,
    updateDraft,
    approveDraft,
    sendDraft,
    settings,
  } = useData();

  // Selected lead
  const [selectedLeadId, setSelectedLeadId] = useState<string>(
    initialLeadId || (leads[0] ? leads[0].id : '')
  );

  const selectedLead = leads.find((l) => l.id === selectedLeadId);

  // Outreach parameters
  const [channel, setChannel] = useState<Channel>('Email');
  const [tone, setTone] = useState<Tone>(settings.defaultTone);
  const [objective, setObjective] = useState('Schedule a 10-minute Discovery Call');

  // Generator state
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeDraft, setActiveDraft] = useState<OutreachDraft | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Editable draft fields
  const [subjectInput, setSubjectInput] = useState('');
  const [bodyInput, setBodyInput] = useState('');

  const handleGenerate = async () => {
    if (!selectedLead) return;
    if (selectedLead.isOptedOut) {
      setErrorMsg('Compliance Guard: Contact has opted out. No outreach can be generated.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    setSendSuccess(false);

    try {
      const draft = await generateOutreachDraft({
        leadId: selectedLead.id,
        channel,
        tone,
        objective,
      });
      setActiveDraft(draft);
      setSubjectInput(draft.subject || '');
      setBodyInput(draft.messageBody);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate outreach.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveEdits = () => {
    if (!activeDraft) return;
    updateDraft(activeDraft.id, {
      subject: subjectInput,
      messageBody: bodyInput,
    });
    alert('Draft updated successfully!');
  };

  const handleCopy = () => {
    const textToCopy = channel === 'Email' ? `Subject: ${subjectInput}\n\n${bodyInput}` : bodyInput;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApprove = () => {
    if (!activeDraft) return;
    approveDraft(activeDraft.id);
    setActiveDraft((prev) => (prev ? { ...prev, status: 'Awaiting Approval' } : null));
  };

  const handleSend = async () => {
    if (!activeDraft) return;
    setIsSending(true);
    setErrorMsg(null);

    try {
      await sendDraft(activeDraft.id);
      setActiveDraft((prev) => (prev ? { ...prev, status: 'Sent' } : null));
      setSendSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send outreach.');
    } finally {
      setIsSending(false);
    }
  };

  // Associated drafts for selected lead
  const existingDrafts = outreachDrafts.filter((d) => d.leadId === selectedLeadId);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#312E81] tracking-tight">
            Personalized Outreach Workspace
          </h1>
          <p className="text-xs text-[#6B7280] mt-1">
            Generate authentic, evidence-based B2B drafts with Gemini AI and track approvals and dispatch.
          </p>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Prospect Selection & Campaign Settings */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] card-shadow space-y-4">
            <h3 className="text-xs font-bold text-[#312E81] uppercase tracking-wider">
              1. Prospect & Campaign Focus
            </h3>

            {/* Lead Select */}
            <div>
              <label className="block text-xs font-semibold text-[#17172A] mb-1">Select Target Lead</label>
              <select
                value={selectedLeadId}
                onChange={(e) => {
                  setSelectedLeadId(e.target.value);
                  setActiveDraft(null);
                  setErrorMsg(null);
                  setSendSuccess(false);
                }}
                className="w-full px-3 py-2 text-xs bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] font-medium text-[#17172A]"
              >
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.businessName} ({l.pipelineStage}) {l.isOptedOut ? '⛔ OPTED OUT' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Lead Detail Summary Card */}
            {selectedLead && (
              <div className="p-3.5 rounded-xl bg-[#F8F7FF] border border-[#E5E7EB] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#312E81] text-sm">{selectedLead.businessName}</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#EDE9FE] text-[#7C3AED] font-extrabold text-[10px]">
                    Score: {selectedLead.leadScore}
                  </span>
                </div>
                <p className="text-[#6B7280]">{selectedLead.industry} • {selectedLead.location}</p>
                <div className="p-2 bg-white rounded-lg border border-[#E5E7EB] text-[11px] text-[#4B5563]">
                  <strong>Scanned Opportunity:</strong> {selectedLead.opportunitySummary}
                </div>

                {selectedLead.isOptedOut && (
                  <div className="p-2 bg-red-50 rounded-lg border border-red-200 text-red-700 text-xs flex items-center gap-1.5 font-bold">
                    <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                    Contact has opted out. Promotional outreach blocked.
                  </div>
                )}
              </div>
            )}

            {/* Channel Select */}
            <div>
              <label className="block text-xs font-semibold text-[#17172A] mb-1">Outreach Channel</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Email', icon: Mail },
                  { id: 'LinkedIn', icon: Linkedin },
                  { id: 'Phone Script', icon: Phone },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setChannel(item.id as Channel)}
                      className={`p-2 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        channel === item.id
                          ? 'border-[#7C3AED] bg-[#EDE9FE] text-[#7C3AED]'
                          : 'border-[#E5E7EB] bg-[#F8F7FF] text-[#6B7280] hover:bg-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="text-[10px]">{item.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tone Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#17172A] mb-1">Tone of Voice</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {['Professional', 'Friendly', 'Concise', 'Bold'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t as Tone)}
                    className={`py-1.5 px-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                      tone === t
                        ? 'border-[#7C3AED] bg-[#EDE9FE] text-[#7C3AED] font-bold'
                        : 'border-[#E5E7EB] bg-[#F8F7FF] text-[#6B7280] hover:bg-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Objective */}
            <div>
              <label className="block text-xs font-semibold text-[#17172A] mb-1">Call to Action Objective</label>
              <select
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg focus:outline-none font-medium text-[#17172A]"
              >
                <option value="Schedule a 10-minute Discovery Call">Schedule 10-minute Discovery Call</option>
                <option value="Send a free 3-minute Video Audit">Send Free 3-Minute Video Audit</option>
                <option value="Share Competitor Speed Benchmark PDF">Share Competitor Benchmark PDF</option>
                <option value="Reconnect on previous inquiry">Reconnect on Previous Inquiry</option>
              </select>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedLead || selectedLead?.isOptedOut}
              className="w-full py-2.5 text-xs font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-40 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#93C5FD]" />
                  Generating Personalized Copy...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#93C5FD]" />
                  Generate AI Outreach Draft
                </>
              )}
            </button>
          </div>

          {/* Previous Drafts for this Lead */}
          {existingDrafts.length > 0 && (
            <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] card-shadow space-y-2 text-xs">
              <h4 className="font-bold text-[#312E81] uppercase tracking-wider text-[11px]">
                Draft History for this Lead ({existingDrafts.length})
              </h4>
              <div className="space-y-1.5">
                {existingDrafts.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => {
                      setActiveDraft(d);
                      setSubjectInput(d.subject || '');
                      setBodyInput(d.messageBody);
                    }}
                    className="p-2.5 rounded-lg bg-[#F8F7FF] hover:bg-[#EDE9FE]/50 border border-[#E5E7EB] cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-[#17172A] block truncate max-w-[160px]">
                        {d.subject || `${d.channel} message`}
                      </span>
                      <span className="text-[10px] text-[#6B7280]">{d.channel} • {d.tone}</span>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 text-[9px] font-bold rounded-full ${
                        d.status === 'Sent'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-indigo-50 text-[#312E81]'
                      }`}
                    >
                      {d.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Draft Editor & Dispatcher */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#E5E7EB] card-shadow flex flex-col justify-between space-y-4 min-h-[560px]">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {sendSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  {settings.demoMode
                    ? '[SIMULATION]: Outreach recorded as Sent! Lead stage advanced to Contacted and smart follow-up scheduled.'
                    : 'Message dispatched successfully! Lead moved to Contacted.'}
                </span>
              </div>
              <button
                onClick={onNavigateToHistory}
                className="text-xs font-bold text-emerald-900 underline cursor-pointer"
              >
                View Timeline
              </button>
            </div>
          )}

          {!activeDraft && !isGenerating ? (
            <div className="text-center py-24 space-y-3 my-auto">
              <div className="w-14 h-14 rounded-2xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center mx-auto">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[#17172A]">AI Outreach Copywriter Ready</h3>
              <p className="text-xs text-[#6B7280] max-w-sm mx-auto leading-relaxed">
                Select a lead on the left and choose your channel and tone, then click "Generate AI Outreach Draft" to construct a tailored value proposition.
              </p>
            </div>
          ) : isGenerating ? (
            <div className="text-center py-24 space-y-4 my-auto">
              <div className="w-12 h-12 rounded-full border-4 border-[#EDE9FE] border-t-[#7C3AED] animate-spin mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#312E81]">Crafting Hyper-Personalized Copy...</p>
                <p className="text-xs text-[#6B7280]">
                  Grounded in {selectedLead?.businessName}'s real scanned digital gap (zero hallucinated claims).
                </p>
              </div>
            </div>
          ) : activeDraft ? (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Draft Status Badge Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F6]">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-[#EDE9FE] text-[#312E81]">
                      Status: {activeDraft.status}
                    </span>
                    <span className="text-xs text-[#6B7280]">
                      Channel: <strong className="text-[#17172A]">{activeDraft.channel}</strong> ({activeDraft.tone})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="px-2.5 py-1 text-xs font-semibold text-[#4B5563] bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                    <button
                      onClick={handleGenerate}
                      className="px-2.5 py-1 text-xs font-semibold text-[#7C3AED] hover:bg-[#EDE9FE] rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Regenerate
                    </button>
                  </div>
                </div>

                {/* Email Subject Line (if email) */}
                {channel === 'Email' && (
                  <div>
                    <label className="block text-[11px] font-bold text-[#312E81] uppercase tracking-wider mb-1">
                      Subject Line
                    </label>
                    <input
                      type="text"
                      value={subjectInput}
                      onChange={(e) => setSubjectInput(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] text-[#17172A]"
                    />
                  </div>
                )}

                {/* Message Body Editor */}
                <div>
                  <label className="block text-[11px] font-bold text-[#312E81] uppercase tracking-wider mb-1">
                    Message Body (Editable)
                  </label>
                  <textarea
                    rows={12}
                    value={bodyInput}
                    onChange={(e) => setBodyInput(e.target.value)}
                    className="w-full p-3 text-xs bg-[#F8F7FF] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED] text-[#17172A] leading-relaxed font-sans"
                  />
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-[#F3F4F6] flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={handleSaveEdits}
                  className="px-3.5 py-2 text-xs font-semibold text-[#4B5563] hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  Save Draft Edits
                </button>

                <div className="flex items-center gap-2">
                  {activeDraft.status === 'Draft' && (
                    <button
                      onClick={handleApprove}
                      className="px-4 py-2 text-xs font-bold text-[#312E81] bg-[#EDE9FE] hover:bg-[#DDD6FE] rounded-lg cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#7C3AED]" />
                      Approve Draft
                    </button>
                  )}

                  <button
                    onClick={handleSend}
                    disabled={isSending || activeDraft.status === 'Sent' || selectedLead?.isOptedOut}
                    className="px-5 py-2 text-xs font-bold text-white bg-[#312E81] hover:bg-[#282568] disabled:opacity-50 rounded-lg shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    {isSending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-[#93C5FD]" />
                        Dispatching Message...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-[#93C5FD]" />
                        {settings.demoMode ? 'Simulate Send & Log' : 'Send Outreach Message'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

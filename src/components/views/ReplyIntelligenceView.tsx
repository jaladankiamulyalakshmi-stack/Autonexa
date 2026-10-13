import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  MessageSquare,
  Sparkles,
  ShieldAlert,
  CheckCircle,
  Copy,
  Check,
  Send,
  Calendar,
  RefreshCw,
  Building2,
  ArrowRight,
  Info,
} from 'lucide-react';

interface ReplyIntelligenceViewProps {
  onNavigateToTasks: () => void;
  onNavigateToLeads: () => void;
}

export const ReplyIntelligenceView: React.FC<ReplyIntelligenceViewProps> = ({
  onNavigateToTasks,
  onNavigateToLeads,
}) => {
  const { leads, classifyReply } = useData();

  // Selected lead context
  const [selectedLeadId, setSelectedLeadId] = useState<string>(leads[0]?.id || '');
  const selectedLead = leads.find((l) => l.id === selectedLeadId);

  // Inbound reply text
  const [replyText, setReplyText] = useState(
    "Hi Amulya, thanks for reaching out. We've actually been talking about fixing our online appointment booking system for months. What kind of pricing are we looking at, and do you have any examples with other dental practices?"
  );

  // Classification state
  const [isClassifying, setIsClassifying] = useState(false);
  const [result, setResult] = useState<{
    category: string;
    explanation: string;
    confidence: number;
    suggestedResponse: string;
    recommendedAction: string;
    suggestedFollowUpDays: number | null;
    isOptOut: boolean;
  } | null>(null);

  const [editableResponse, setEditableResponse] = useState('');
  const [copied, setCopied] = useState(false);

  const handleClassify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || !selectedLeadId) return;

    setIsClassifying(true);
    try {
      const data = await classifyReply({
        replyText,
        leadId: selectedLeadId,
      });
      setResult(data);
      setEditableResponse(data.suggestedResponse);
    } catch (err: any) {
      alert(err.message || 'Failed to classify reply');
    } finally {
      setIsClassifying(false);
    }
  };

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(editableResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const samplePresets = [
    {
      label: 'Positive / Pricing Inquiry',
      text: "Thanks for the note! We are definitely interested in modernizing our patient intake. Could you send over standard pricing tiers and a demo link?",
    },
    {
      label: 'Objection / Timing',
      text: "We are currently tied up in end-of-quarter audits and don't have bandwidth to review software right now. Please circle back in 60 days.",
    },
    {
      label: 'Explicit Opt-Out Demand',
      text: "Please remove me and our organization from your mailing list immediately. Do not contact us again.",
    },
    {
      label: 'Out of Office',
      text: "I am out of the office on annual leave through next Tuesday with limited email access. For urgent clinic matters contact reception.",
    },
  ];

  const categoryBadgeColor = (cat: string) => {
    if (cat === 'Interested' || cat === 'Asking for Pricing') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (cat === 'Opt Out') return 'bg-red-50 text-red-700 border-red-200';
    if (cat === 'Follow Up Later') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (cat === 'Objection') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-purple-50 text-purple-700 border-purple-200';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#312E81] tracking-tight">
            Reply Intelligence & Sentiment Classifier
          </h1>
          <p className="text-xs text-[#6B7280] mt-1">
            Categorize inbound prospect responses with Gemini, synthesize empathetic responses, and enforce opt-out safeguards.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Inbound Message */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#E5E7EB] card-shadow space-y-4">
          <h3 className="text-xs font-bold text-[#312E81] uppercase tracking-wider">
            Inbound Message Details
          </h3>

          <div>
            <label className="block text-xs font-semibold text-[#17172A] mb-1">Associated Lead</label>
            <select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] font-medium text-[#17172A]"
            >
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.businessName} ({l.pipelineStage})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#17172A]">Paste Inbound Prospect Reply</label>
              <span className="text-[10px] text-[#6B7280]">Raw email, SMS, or LinkedIn reply</span>
            </div>
            <textarea
              rows={6}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Paste customer message text here..."
              className="w-full p-3 text-xs bg-[#F8F7FF] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED] leading-relaxed text-[#17172A]"
            />
          </div>

          {/* Quick preset chips */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
              Quick Test Scenarios
            </span>
            <div className="flex flex-wrap gap-1.5">
              {samplePresets.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setReplyText(p.text)}
                  className="px-2.5 py-1 text-[11px] font-medium bg-[#F8F7FF] hover:bg-[#EDE9FE] border border-[#E5E7EB] text-[#312E81] rounded-lg transition-colors cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => handleClassify()}
            disabled={isClassifying || !replyText.trim()}
            className="w-full py-2.5 text-xs font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-40 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isClassifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-[#93C5FD]" />
                Classifying Sentiment & Intent...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#93C5FD]" />
                Analyze Inbound Reply with AI
              </>
            )}
          </button>
        </div>

        {/* Right Column: AI Analysis & Response Drafter */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#E5E7EB] card-shadow flex flex-col justify-between space-y-4 min-h-[500px]">
          {!result && !isClassifying ? (
            <div className="text-center py-20 space-y-3 my-auto">
              <div className="w-14 h-14 rounded-2xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center mx-auto">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[#17172A]">AI Classification Engine Ready</h3>
              <p className="text-xs text-[#6B7280] max-w-sm mx-auto leading-relaxed">
                Paste an inbound prospect message or test one of the scenarios on the left to classify the intent, extract objections, and formulate a suggested response.
              </p>
            </div>
          ) : isClassifying ? (
            <div className="text-center py-20 space-y-4 my-auto">
              <div className="w-12 h-12 rounded-full border-4 border-[#EDE9FE] border-t-[#7C3AED] animate-spin mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#312E81]">Analyzing Prospect Tone & Intent...</p>
                <p className="text-xs text-[#6B7280]">Categorizing intent and checking for opt-out compliance.</p>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-4 animate-in fade-in flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Result Header Badge */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-[#EDE9FE] to-white border border-[#DDD6FE] flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
                      Predicted Category
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 text-xs font-black rounded-full border ${categoryBadgeColor(result.category)}`}>
                        {result.category}
                      </span>
                      <span className="text-xs font-bold text-[#312E81]">
                        {result.confidence}% Confidence
                      </span>
                    </div>
                  </div>

                  {result.isOptOut && (
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Opt-Out Triggered
                    </span>
                  )}
                </div>

                {/* Explanation & Action */}
                <div className="p-3.5 rounded-xl bg-[#F8F7FF] border border-[#E5E7EB] space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-[#312E81]">AI Rationale:</span>{' '}
                    <span className="text-[#4B5563]">{result.explanation}</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#7C3AED]">Recommended Sales Step:</span>{' '}
                    <span className="text-[#17172A]">{result.recommendedAction}</span>
                  </div>
                </div>

                {/* Suggested Response Editor */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#312E81] uppercase tracking-wider">
                      Suggested Tailored Response (Editable)
                    </label>
                    <button
                      onClick={handleCopyResponse}
                      className="px-2.5 py-1 text-xs font-semibold text-[#4B5563] bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy Response'}
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    value={editableResponse}
                    onChange={(e) => setEditableResponse(e.target.value)}
                    className="w-full p-3 text-xs bg-[#F8F7FF] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED] leading-relaxed text-[#17172A]"
                  />
                </div>
              </div>

              {/* Bottom Quick Links */}
              <div className="pt-3 border-t border-[#F3F4F6] flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-[#6B7280]">
                  Target Lead: <strong>{selectedLead?.businessName}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onNavigateToLeads}
                    className="px-3.5 py-1.5 font-semibold text-[#4B5563] hover:bg-gray-100 rounded-lg cursor-pointer"
                  >
                    View in Pipeline
                  </button>
                  <button
                    onClick={onNavigateToTasks}
                    className="px-4 py-1.5 font-bold text-white bg-[#312E81] hover:bg-[#282568] rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#93C5FD]" />
                    Review Follow-up Tasks
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

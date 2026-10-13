import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  AlertTriangle,
  Clock,
  Sparkles,
  Send,
  CheckCircle,
  Copy,
  Check,
  Building2,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Flame,
} from 'lucide-react';

interface DealRescueRadarViewProps {
  onSelectLead: (leadId: string) => void;
  onNavigateToOutreach: (leadId: string) => void;
}

export const DealRescueRadarView: React.FC<DealRescueRadarViewProps> = ({
  onSelectLead,
  onNavigateToOutreach,
}) => {
  const { dealAlerts, resolveDealAlert, requestRescueStrategy, leads } = useData();

  const [activeStrategies, setActiveStrategies] = useState<{
    [alertId: string]: {
      loading: boolean;
      data?: {
        stallReasonAnalysis: string;
        recommendedAction: string;
        suggestedMessage: string;
        urgencyLevel: string;
      };
    };
  }>({});

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeAlerts = dealAlerts.filter((a) => !a.resolved);

  const handleGenerateAIStrategy = async (alertId: string, leadId: string, reason: string) => {
    setActiveStrategies((prev) => ({
      ...prev,
      [alertId]: { loading: true },
    }));

    try {
      const data = await requestRescueStrategy(leadId, reason);
      setActiveStrategies((prev) => ({
        ...prev,
        [alertId]: { loading: false, data },
      }));
    } catch (err: any) {
      alert(err.message || 'Failed to generate rescue strategy');
      setActiveStrategies((prev) => ({
        ...prev,
        [alertId]: { loading: false },
      }));
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const urgencyColor = (urgency: string) => {
    if (urgency === 'CRITICAL') return 'bg-red-50 text-red-700 border-red-200';
    if (urgency === 'HIGH') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#312E81] tracking-tight">
              Deal Rescue Radar
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-red-600 animate-pulse" />
              {activeAlerts.length} Stalled Opportunity Alert{activeAlerts.length === 1 ? '' : 's'}
            </span>
          </div>
          <p className="text-xs text-[#6B7280] mt-1">
            Detect deals stagnating in your pipeline, diagnose drop-off causes, and generate low-friction pattern-interrupt recovery drafts.
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-[#E5E7EB] card-shadow">
          <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
            Stalled Opportunities
          </span>
          <p className="text-2xl font-extrabold text-red-600 mt-1">{activeAlerts.length}</p>
          <p className="text-[11px] text-[#9CA3AF]">Requiring immediate re-engagement</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E5E7EB] card-shadow">
          <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
            At-Risk Pipeline Revenue
          </span>
          <p className="text-2xl font-extrabold text-[#312E81] mt-1">
            ${activeAlerts.reduce((acc, a) => acc + a.dealValue, 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-[#9CA3AF]">Weighted contract values in danger of churning</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E5E7EB] card-shadow">
          <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
            Average Days Inactive
          </span>
          <p className="text-2xl font-extrabold text-[#7C3AED] mt-1">
            {activeAlerts.length > 0
              ? Math.round(activeAlerts.reduce((acc, a) => acc + a.daysInactive, 0) / activeAlerts.length)
              : 0}{' '}
            days
          </p>
          <p className="text-[11px] text-[#9CA3AF]">Threshold limit is 7 days</p>
        </div>
      </div>

      {/* Radar Cards */}
      <div className="space-y-4">
        {activeAlerts.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-[#E5E7EB] text-center space-y-2 card-shadow">
            <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-[#17172A]">Pipeline Cadence Healthy</h3>
            <p className="text-xs text-[#6B7280] max-w-sm mx-auto">
              No deals currently exceed your inactivity thresholds. All active prospects have had logged touchpoints within the last 7 days!
            </p>
          </div>
        ) : (
          activeAlerts.map((alert) => {
            const aiState = activeStrategies[alert.id];
            const displayAction = aiState?.data?.recommendedAction || alert.recommendedAction;
            const displayMessage = aiState?.data?.suggestedMessage || alert.suggestedMessage;
            const displayAnalysis = aiState?.data?.stallReasonAnalysis;

            return (
              <div
                key={alert.id}
                className="bg-white p-6 rounded-2xl border border-[#E5E7EB] card-shadow space-y-4 transition-all"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-[#F3F4F6]">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => onSelectLead(alert.leadId)}
                        className="text-base font-extrabold text-[#312E81] hover:text-[#7C3AED] hover:underline cursor-pointer"
                      >
                        {alert.leadName}
                      </button>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${urgencyColor(alert.urgency)}`}>
                        {alert.urgency} URGENCY
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-[#EDE9FE] text-[#312E81]">
                        Stage: {alert.currentStage}
                      </span>
                    </div>
                    <p className="text-xs text-red-600 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-red-500" />
                      {alert.daysInactive} days without interaction — {alert.alertReason}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-[#6B7280] uppercase font-bold block">Deal Value</span>
                    <span className="text-base font-extrabold text-[#17172A]">
                      ${alert.dealValue.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* AI Rationale & Advice */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#F8F7FF] border border-[#E5E7EB] space-y-2 text-xs">
                    <span className="font-bold text-[#312E81] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
                      Recovery Strategy
                    </span>
                    <p className="text-[#374151] leading-relaxed font-medium">
                      {displayAction}
                    </p>
                    {displayAnalysis && (
                      <p className="text-[11px] text-[#6B7280] italic pt-1 border-t border-[#E5E7EB]">
                        <strong>Root Cause:</strong> {displayAnalysis}
                      </p>
                    )}
                  </div>

                  {/* Pattern-Interrupt Message Draft */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[#EDE9FE]/50 to-white border border-[#DDD6FE] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#7C3AED] uppercase tracking-wider text-[11px]">
                        Pattern Interrupt Win-Back Draft
                      </span>
                      <button
                        onClick={() => handleCopy(alert.id, displayMessage)}
                        className="px-2 py-1 text-[11px] font-semibold text-[#4B5563] bg-white border border-[#E5E7EB] hover:bg-gray-50 rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === alert.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        {copiedId === alert.id ? 'Copied' : 'Copy'}
                      </button>
                    </div>

                    <p className="text-xs text-[#17172A] bg-white p-3 rounded-lg border border-[#DDD6FE] whitespace-pre-wrap leading-relaxed italic">
                      "{displayMessage}"
                    </p>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() =>
                      handleGenerateAIStrategy(alert.id, alert.leadId, alert.alertReason)
                    }
                    disabled={aiState?.loading}
                    className="px-3.5 py-1.5 text-xs font-semibold text-[#7C3AED] hover:bg-[#EDE9FE] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {aiState?.loading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Generating Custom Strategy...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Generate Deeper AI Strategy
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => resolveDealAlert(alert.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-[#6B7280] hover:bg-gray-100 rounded-lg cursor-pointer"
                    >
                      Dismiss Alert
                    </button>
                    <button
                      onClick={() => onNavigateToOutreach(alert.leadId)}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-[#312E81] hover:bg-[#282568] rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 text-[#93C5FD]" />
                      Launch Re-engagement Message
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

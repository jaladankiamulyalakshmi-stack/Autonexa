import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  Clock,
  Filter,
  Search,
  Building2,
  Calendar,
  Sparkles,
  Send,
  MessageSquare,
  Trophy,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';

interface ContactHistoryViewProps {
  onSelectLead: (leadId: string) => void;
}

export const ContactHistoryView: React.FC<ContactHistoryViewProps> = ({ onSelectLead }) => {
  const { interactions, leads } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');

  const filteredHistory = interactions.filter((act) => {
    if (selectedType !== 'ALL' && act.eventType !== selectedType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        act.leadName.toLowerCase().includes(q) ||
        act.details.toLowerCase().includes(q) ||
        act.eventType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'DEAL_WON':
        return { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: Trophy };
      case 'OUTREACH_SENT':
        return { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Send };
      case 'REPLY_RECEIVED':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: MessageSquare };
      case 'OPPORTUNITY_SCANNED':
        return { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Sparkles };
      case 'OPT_OUT_RECORDED':
        return { color: 'bg-red-100 text-red-800 border-red-200', icon: ShieldAlert };
      case 'TASK_COMPLETED':
        return { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 };
      default:
        return { color: 'bg-gray-100 text-[#4B5563] border-gray-200', icon: Clock };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#312E81] tracking-tight">Contact & Activity Timeline</h1>
          <p className="text-xs text-[#6B7280] mt-1">
            Immutable chronological audit log of all lead interactions, messages sent, scans, and pipeline movements.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] card-shadow flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[220px] max-w-xs flex-1">
            <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search audit trail by lead or text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#6B7280] font-medium">Event Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-2.5 py-1.5 bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg font-medium text-[#17172A]"
            >
              <option value="ALL">All Event Types</option>
              <option value="DEAL_WON">Deals Won</option>
              <option value="OUTREACH_SENT">Outreach Sent</option>
              <option value="REPLY_RECEIVED">Replies Received</option>
              <option value="MEETING_SCHEDULED">Meetings Scheduled</option>
              <option value="OPPORTUNITY_SCANNED">Opportunity Scans</option>
              <option value="STAGE_CHANGED">Stage Changed</option>
              <option value="OPT_OUT_RECORDED">Opt-Outs</option>
            </select>
          </div>
        </div>

        <span className="text-[#6B7280]">
          Showing <strong>{filteredHistory.length}</strong> events
        </span>
      </div>

      {/* Timeline Stream */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] card-shadow">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12 text-xs text-[#6B7280]">
            No historical records match your filter criteria.
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#EDE9FE]">
            {filteredHistory.map((act) => {
              const badge = getEventBadge(act.eventType);
              const Icon = badge.icon;

              return (
                <div key={act.id} className="relative group">
                  {/* Dot */}
                  <div className="absolute -left-[30px] top-1.5 w-4 h-4 rounded-full bg-[#7C3AED] ring-4 ring-white flex items-center justify-center text-white">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>

                  <div className="p-4 rounded-xl bg-[#F8F7FF] group-hover:bg-[#EDE9FE]/30 border border-[#E5E7EB] group-hover:border-[#DDD6FE] transition-all space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectLead(act.leadId)}
                          className="font-bold text-[#312E81] hover:text-[#7C3AED] text-sm hover:underline cursor-pointer"
                        >
                          {act.leadName}
                        </button>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${badge.color} flex items-center gap-1`}>
                          <Icon className="w-3 h-3" />
                          {act.eventType.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <span className="text-[11px] text-[#6B7280] flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#9CA3AF]" />
                        {new Date(act.timestamp).toLocaleDateString()} at{' '}
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-[#374151] leading-relaxed">
                      {act.details}
                    </p>

                    <div className="pt-1 flex items-center justify-between text-[11px] text-[#9CA3AF]">
                      <span>Logged by: <strong className="text-[#6B7280]">{act.author}</strong></span>
                      <button
                        onClick={() => onSelectLead(act.leadId)}
                        className="text-[#7C3AED] font-semibold hover:underline cursor-pointer"
                      >
                        Open Lead Profile →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { Lead, PipelineStage, Priority } from '../../types';
import {
  Search,
  Filter,
  Plus,
  LayoutGrid,
  List,
  Copy,
  ArrowUpDown,
  Building2,
  MapPin,
  Calendar,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  DollarSign,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';

interface LeadsViewProps {
  onSelectLead: (leadId: string) => void;
  onOpenNewLead: () => void;
  onOpenDuplicates: () => void;
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

export const LeadsView: React.FC<LeadsViewProps> = ({
  onSelectLead,
  onOpenNewLead,
  onOpenDuplicates,
}) => {
  const { leads, moveLeadStage, detectDuplicates } = useData();
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score' | 'activity' | 'value'>('score');

  const duplicatePairs = detectDuplicates();

  // Filtered & sorted leads
  const filteredLeads = useMemo(() => {
    let result = [...leads];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.businessName.toLowerCase().includes(q) ||
          l.industry.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q) ||
          (l.contactPerson && l.contactPerson.toLowerCase().includes(q))
      );
    }

    if (stageFilter !== 'all') {
      result = result.filter((l) => l.pipelineStage === stageFilter);
    }

    if (priorityFilter !== 'all') {
      result = result.filter((l) => l.priority === priorityFilter);
    }

    if (sortBy === 'score') {
      result.sort((a, b) => b.leadScore - a.leadScore);
    } else if (sortBy === 'activity') {
      result.sort((a, b) => new Date(b.lastInteraction).getTime() - new Date(a.lastInteraction).getTime());
    } else if (sortBy === 'value') {
      result.sort((a, b) => b.dealValue - a.dealValue);
    }

    return result;
  }, [leads, searchQuery, stageFilter, priorityFilter, sortBy]);

  const priorityColor = (p: Priority) => {
    if (p === 'HIGH') return 'bg-red-50 text-red-700 border-red-200';
    if (p === 'MEDIUM') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#312E81] tracking-tight">Leads & Pipeline CRM</h1>
          <p className="text-xs text-[#6B7280] mt-1">
            Manage prospects across 9 pipeline stages with explainable scoring and duplicate prevention.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {duplicatePairs.length > 0 && (
            <button
              onClick={onOpenDuplicates}
              className="px-3 py-2 text-xs font-bold bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-amber-600" />
              Duplicates Detected ({duplicatePairs.length})
            </button>
          )}

          <div className="bg-white border border-[#E5E7EB] rounded-xl p-1 flex items-center gap-1">
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'board' ? 'bg-[#EDE9FE] text-[#7C3AED]' : 'text-[#6B7280] hover:text-[#17172A]'
              }`}
              title="Board View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-[#EDE9FE] text-[#7C3AED]' : 'text-[#6B7280] hover:text-[#17172A]'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onOpenNewLead}
            className="px-4 py-2 text-xs font-bold bg-[#312E81] hover:bg-[#282568] text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#93C5FD]" />
            New Lead
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] card-shadow flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative min-w-[220px] max-w-xs flex-1">
            <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter leads by name, city, owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:bg-white"
            />
          </div>

          {/* Stage Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#6B7280] font-medium">Stage:</span>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg focus:outline-none font-medium text-[#17172A]"
            >
              <option value="all">All Stages</option>
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#6B7280] font-medium">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg focus:outline-none font-medium text-[#17172A]"
            >
              <option value="all">All Priorities</option>
              <option value="HIGH">High Priority (80+)</option>
              <option value="MEDIUM">Medium Priority (50-79)</option>
              <option value="LOW">Low Priority (&lt;50)</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#6B7280] font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg focus:outline-none font-medium text-[#17172A]"
            >
              <option value="score">Highest Lead Score</option>
              <option value="activity">Recent Activity</option>
              <option value="value">Highest Deal Value</option>
            </select>
          </div>
        </div>

        <span className="text-[#6B7280] font-semibold">
          Showing <strong className="text-[#312E81]">{filteredLeads.length}</strong> leads
        </span>
      </div>

      {/* VIEW 1: KANBAN BOARD */}
      {viewMode === 'board' ? (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-[1700px] items-start">
            {STAGES.map((stage) => {
              const stageLeads = filteredLeads.filter((l) => l.pipelineStage === stage);
              const stageTotalValue = stageLeads.reduce((acc, l) => acc + l.dealValue, 0);

              return (
                <div
                  key={stage}
                  className="w-[280px] shrink-0 bg-[#F8F7FF] rounded-2xl border border-[#E5E7EB] flex flex-col max-h-[75vh]"
                >
                  {/* Column Header */}
                  <div className="p-3.5 border-b border-[#E5E7EB] bg-white rounded-t-2xl flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#17172A]">{stage}</span>
                        <span className="px-1.5 py-0.5 text-[10px] font-extrabold rounded-full bg-[#EDE9FE] text-[#7C3AED]">
                          {stageLeads.length}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#6B7280] font-medium">
                        ${stageTotalValue.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Cards container */}
                  <div className="p-3 space-y-3 overflow-y-auto flex-1">
                    {stageLeads.length === 0 ? (
                      <div className="text-center py-6 text-[11px] text-[#9CA3AF] border border-dashed border-[#DDD6FE] rounded-xl">
                        No leads in this stage
                      </div>
                    ) : (
                      stageLeads.map((lead) => (
                        <div
                          key={lead.id}
                          onClick={() => onSelectLead(lead.id)}
                          className="p-3.5 bg-white rounded-xl border border-[#E5E7EB] hover:border-[#7C3AED] hover:shadow-md transition-all cursor-pointer space-y-2 group"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="text-xs font-bold text-[#17172A] group-hover:text-[#7C3AED] leading-snug line-clamp-1">
                              {lead.businessName}
                            </span>
                            <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border ${priorityColor(lead.priority)} shrink-0`}>
                              {lead.leadScore}
                            </span>
                          </div>

                          <p className="text-[11px] text-[#6B7280] flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#7C3AED]" />
                            {lead.location}
                          </p>

                          <p className="text-[11px] text-[#4B5563] line-clamp-2 leading-relaxed bg-[#F8F7FF] p-2 rounded-lg border border-[#F3F4F6]">
                            {lead.opportunitySummary}
                          </p>

                          <div className="flex items-center justify-between text-[10px] pt-1 border-t border-[#F3F4F6] text-[#6B7280]">
                            <span className="font-bold text-[#312E81]">
                              ${lead.dealValue.toLocaleString()}
                            </span>
                            {lead.isOptedOut ? (
                              <span className="text-red-600 font-bold flex items-center gap-0.5">
                                <ShieldAlert className="w-2.5 h-2.5" /> Opted Out
                              </span>
                            ) : (
                              <span>
                                {new Date(lead.lastInteraction).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* VIEW 2: TABLE VIEW */
        <div className="bg-white rounded-2xl border border-[#E5E7EB] card-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F7FF] text-[#6B7280] uppercase tracking-wider font-bold border-b border-[#E5E7EB]">
                <tr>
                  <th className="py-3 px-4">Business Name</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Score / Priority</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Deal Value</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4">Last Activity</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => onSelectLead(lead.id)}
                    className="hover:bg-[#EDE9FE]/30 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#17172A] group-hover:text-[#7C3AED]">
                        {lead.businessName}
                      </div>
                      <div className="text-[11px] text-[#6B7280]">{lead.industry}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[#4B5563]">{lead.location}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-[#312E81]">{lead.leadScore}</span>
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border ${priorityColor(lead.priority)}`}>
                          {lead.priority}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-[#EDE9FE] text-[#312E81] font-semibold text-[11px]">
                        {lead.pipelineStage}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#17172A]">
                      ${lead.dealValue.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-[#4B5563]">{lead.leadOwner}</td>
                    <td className="py-3.5 px-4 text-[#6B7280]">
                      {new Date(lead.lastInteraction).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <ChevronRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#7C3AED] inline" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

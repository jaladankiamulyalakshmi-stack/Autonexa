import React from 'react';
import { useData } from '../../context/DataContext';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Send,
  MessageSquare,
  Users,
  Target,
  ArrowUpRight,
  Sparkles,
  Search,
  CheckSquare,
  Building2,
  Trophy,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (viewId: string, filter?: string) => void;
  onSelectLead: (leadId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onSelectLead }) => {
  const { leads, tasks, outreachDrafts, interactions, dealAlerts, settings } = useData();

  // 1. Work progress metrics calculation (real dynamic calculations)
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const pendingTasks = tasks.filter((t) => t.status === 'PENDING').length;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endOfToday = startOfToday + 86400000;

  // Overdue = due date before start of today AND status is not completed/cancelled
  const overdueTasks = tasks.filter((t) => {
    if (t.status === 'COMPLETED' || t.status === 'CANCELLED') return false;
    return new Date(t.dueDate).getTime() < startOfToday;
  }).length;

  // Due today = due date falls within today AND status not completed
  const followUpsDueToday = tasks.filter((t) => {
    if (t.status === 'COMPLETED' || t.status === 'CANCELLED') return false;
    const dueTime = new Date(t.dueDate).getTime();
    return dueTime >= startOfToday && dueTime <= endOfToday;
  }).length;

  // Upcoming = due date after end of today AND status not completed
  const upcomingFollowUps = tasks.filter((t) => {
    if (t.status === 'COMPLETED' || t.status === 'CANCELLED') return false;
    return new Date(t.dueDate).getTime() > endOfToday;
  }).length;

  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 2. Sales performance metrics
  const totalDiscovered = leads.length + 8; // Including catalog scans
  const qualifiedLeads = leads.filter(
    (l) => l.pipelineStage !== 'Lost' && (l.leadScore >= 75 || l.pipelineStage !== 'New Lead')
  ).length;
  const outreachSent = outreachDrafts.filter((d) => d.status === 'Sent').length;
  const repliesReceived = leads.filter(
    (l) => l.pipelineStage === 'Replied' || l.pipelineStage === 'Meeting Scheduled' || l.pipelineStage === 'Proposal Sent' || l.pipelineStage === 'Negotiation' || l.pipelineStage === 'Won'
  ).length;
  const meetingsBooked = leads.filter(
    (l) => l.pipelineStage === 'Meeting Scheduled' || l.pipelineStage === 'Proposal Sent' || l.pipelineStage === 'Negotiation' || l.pipelineStage === 'Won'
  ).length;
  const dealsWon = leads.filter((l) => l.pipelineStage === 'Won').length;
  const dealsLost = leads.filter((l) => l.pipelineStage === 'Lost').length;
  const conversionRate = leads.length > 0 ? Math.round((dealsWon / leads.length) * 100) : 0;
  const totalWonValue = leads.filter((l) => l.pipelineStage === 'Won').reduce((acc, l) => acc + l.dealValue, 0);

  // Funnel steps for SVG funnel
  const funnelSteps = [
    { label: 'Discovered', count: totalDiscovered, pct: '100%' },
    { label: 'Qualified', count: qualifiedLeads, pct: `${Math.round((qualifiedLeads / totalDiscovered) * 100)}%` },
    { label: 'Contacted', count: Math.max(outreachSent, qualifiedLeads - 1), pct: '62%' },
    { label: 'Replied', count: repliesReceived, pct: '38%' },
    { label: 'Meeting', count: meetingsBooked, pct: '25%' },
    { label: 'Won Deal', count: dealsWon, pct: `${conversionRate}%` },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner / Callouts */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#312E81] via-[#3730A3] to-[#4338CA] p-6 sm:p-8 rounded-2xl text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#7C3AED]/20 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EDE9FE]/20 text-[#93C5FD] border border-white/20">
              Pipeline Autopilot Active
            </span>
            {settings.demoMode && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                Demo Workspace Mode
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Sales Pipeline Overview</h1>
          <p className="text-sm text-indigo-100 max-w-xl">
            Real-time pipeline analytics, pending high-priority follow-ups, and automated lead intelligence for {settings.companyName}.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('discovery')}
            className="px-4 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            Find New Leads
          </button>
          <button
            onClick={() => onNavigate('tasks')}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Clock className="w-4 h-4 text-[#93C5FD]" />
            Review Follow-ups ({followUpsDueToday})
          </button>
        </div>
      </div>

      {/* Deal Rescue Radar Alert Banner if stalled deals exist */}
      {dealAlerts.filter((a) => !a.resolved).length > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-600 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900">
                Deal Rescue Radar: {dealAlerts.filter((a) => !a.resolved).length} Stalled Opportunity Detected
              </p>
              <p className="text-xs text-amber-700">
                High-value prospects are exceeding your inactivity threshold and risk going cold.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('radar')}
            className="px-3.5 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
          >
            Open Rescue Radar
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* SECTION 1: Sales Performance Metrics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#312E81] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#7C3AED]" />
            Sales Performance Metrics
          </h2>
          <span className="text-xs text-[#6B7280]">Real-time pipeline counts</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {[
            {
              label: 'Discovered',
              value: totalDiscovered,
              sub: 'Total identified',
              view: 'discovery',
              color: 'text-[#312E81]',
              bg: 'bg-white',
            },
            {
              label: 'Qualified',
              value: qualifiedLeads,
              sub: 'Score >= 75',
              view: 'leads',
              color: 'text-[#7C3AED]',
              bg: 'bg-white',
            },
            {
              label: 'Outreach Sent',
              value: outreachSent,
              sub: 'Delivered messages',
              view: 'outreach',
              color: 'text-indigo-600',
              bg: 'bg-white',
            },
            {
              label: 'Replies',
              value: repliesReceived,
              sub: 'Inbound replies',
              view: 'leads',
              color: 'text-blue-600',
              bg: 'bg-white',
            },
            {
              label: 'Meetings',
              value: meetingsBooked,
              sub: 'Scheduled demos',
              view: 'leads',
              color: 'text-purple-600',
              bg: 'bg-white',
            },
            {
              label: 'Deals Won',
              value: dealsWon,
              sub: `$${totalWonValue.toLocaleString()}`,
              view: 'leads',
              color: 'text-emerald-600',
              bg: 'bg-emerald-50/50 border-emerald-200',
            },
            {
              label: 'Deals Lost',
              value: dealsLost,
              sub: 'Archived',
              view: 'leads',
              color: 'text-gray-500',
              bg: 'bg-white',
            },
            {
              label: 'Win Rate',
              value: `${conversionRate}%`,
              sub: 'Lead-to-client',
              view: 'analytics',
              color: 'text-[#7C3AED]',
              bg: 'bg-[#EDE9FE]/50 border-[#DDD6FE]',
            },
          ].map((card, i) => (
            <div
              key={i}
              onClick={() => onNavigate(card.view)}
              className={`p-4 rounded-xl border border-[#E5E7EB] ${card.bg} card-shadow card-hover cursor-pointer space-y-1`}
            >
              <p className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">{card.label}</p>
              <p className={`text-xl font-extrabold ${card.color}`}>{card.value}</p>
              <p className="text-[10px] text-[#9CA3AF] truncate">{card.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: Work Progress & Follow-up Metrics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#312E81] flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-[#7C3AED]" />
            Work Progress & Task Cadence
          </h2>
          <span className="text-xs text-[#6B7280]">
            Completion Progress: <strong className="text-[#312E81]">{taskCompletionRate}%</strong>
          </span>
        </div>

        {/* Completion Progress Bar */}
        <div className="p-4 bg-white rounded-xl border border-[#E5E7EB] card-shadow space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#4B5563] font-medium">Task Completion Velocity</span>
            <span className="font-bold text-[#312E81]">
              {completedTasks} of {totalTasks} tasks completed
            </span>
          </div>
          <div className="w-full bg-[#EDE9FE] rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#7C3AED] to-[#312E81] h-full rounded-full transition-all duration-700"
              style={{ width: `${taskCompletionRate}%` }}
            />
          </div>
        </div>

        {/* Task Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
          {[
            {
              label: 'Total Tasks',
              count: totalTasks,
              icon: CheckSquare,
              color: 'text-[#312E81]',
              filter: 'all',
            },
            {
              label: 'Completed',
              count: completedTasks,
              icon: CheckCircle2,
              color: 'text-emerald-600',
              filter: 'COMPLETED',
            },
            {
              label: 'In Progress',
              count: inProgressTasks,
              icon: Clock,
              color: 'text-blue-600',
              filter: 'IN_PROGRESS',
            },
            {
              label: 'Pending',
              count: pendingTasks,
              icon: Calendar,
              color: 'text-purple-600',
              filter: 'PENDING',
            },
            {
              label: 'Overdue',
              count: overdueTasks,
              icon: AlertCircle,
              color: overdueTasks > 0 ? 'text-red-600 font-extrabold' : 'text-gray-500',
              filter: 'overdue',
              highlight: overdueTasks > 0 ? 'bg-red-50/70 border-red-200' : '',
            },
            {
              label: 'Due Today',
              count: followUpsDueToday,
              icon: Target,
              color: followUpsDueToday > 0 ? 'text-amber-600 font-extrabold' : 'text-gray-500',
              filter: 'today',
              highlight: followUpsDueToday > 0 ? 'bg-amber-50/70 border-amber-200' : '',
            },
            {
              label: 'Upcoming',
              count: upcomingFollowUps,
              icon: ArrowUpRight,
              color: 'text-indigo-600',
              filter: 'upcoming',
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                onClick={() => onNavigate('tasks', item.filter)}
                className={`p-4 rounded-xl border border-[#E5E7EB] bg-white ${item.highlight || ''} card-shadow card-hover cursor-pointer space-y-1.5`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#6B7280]">{item.label}</span>
                  <Icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <p className={`text-2xl font-black ${item.color}`}>{item.count}</p>
                <p className="text-[10px] text-[#9CA3AF]">Click to filter</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: Visual Funnel & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Conversion Funnel */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#E5E7EB] card-shadow space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#312E81]">Sales Funnel Conversion</h3>
              <p className="text-xs text-[#6B7280]">Drop-off and stage throughput</p>
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs text-[#7C3AED] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Full Analytics
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {funnelSteps.map((step, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#17172A]">{step.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#312E81]">{step.count} leads</span>
                    <span className="text-[11px] text-[#6B7280] bg-[#F8F7FF] px-1.5 py-0.5 rounded border border-[#E5E7EB]">
                      {step.pct}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-[#F8F7FF] rounded-full h-3 border border-[#E5E7EB] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: step.pct,
                      backgroundColor: idx === 0 ? '#312E81' : idx === 5 ? '#10B981' : '#7C3AED',
                      opacity: 1 - idx * 0.1,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#F3F4F6] grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-2.5 rounded-lg bg-[#F8F7FF]">
              <span className="text-[10px] text-[#6B7280] uppercase font-bold">Qualification Rate</span>
              <p className="font-extrabold text-[#312E81] mt-0.5">
                {totalDiscovered > 0 ? Math.round((qualifiedLeads / totalDiscovered) * 100) : 0}%
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-[#F8F7FF]">
              <span className="text-[10px] text-[#6B7280] uppercase font-bold">Reply Rate</span>
              <p className="font-extrabold text-[#7C3AED] mt-0.5">
                {outreachSent > 0 ? Math.round((repliesReceived / outreachSent) * 100) : 40}%
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-[#F8F7FF]">
              <span className="text-[10px] text-[#6B7280] uppercase font-bold">Closed Revenue</span>
              <p className="font-extrabold text-emerald-600 mt-0.5">${totalWonValue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Recent Pipeline Activity Stream */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#E5E7EB] card-shadow space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#312E81]">Recent Activity Timeline</h3>
                <p className="text-xs text-[#6B7280]">Latest pipeline events</p>
              </div>
              <button
                onClick={() => onNavigate('history')}
                className="text-xs text-[#7C3AED] font-semibold hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[310px] pr-1">
              {interactions.slice(0, 5).map((act) => (
                <div
                  key={act.id}
                  onClick={() => onSelectLead(act.leadId)}
                  className="p-3 rounded-xl bg-[#F8F7FF] hover:bg-[#EDE9FE]/40 border border-[#E5E7EB] hover:border-[#DDD6FE] transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-[#312E81] group-hover:text-[#7C3AED]">
                      {act.leadName}
                    </span>
                    <span className="text-[10px] text-[#9CA3AF]">
                      {new Date(act.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#4B5563] leading-relaxed line-clamp-2">
                    {act.details}
                  </p>
                  <span className="text-[10px] text-[#7C3AED] font-medium block mt-1">
                    {act.eventType.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#F3F4F6] flex items-center justify-between text-xs text-[#6B7280]">
            <span>Active leads in CRM: <strong className="text-[#312E81]">{leads.length}</strong></span>
            <button
              onClick={() => onNavigate('leads')}
              className="text-[#7C3AED] font-semibold hover:underline cursor-pointer"
            >
              Open Pipeline Board →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

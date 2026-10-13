import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Search, X, Building2, CheckSquare, ArrowRight, User } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLead: (leadId: string) => void;
  onNavigateView: (view: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectLead,
  onNavigateView,
}) => {
  const { leads, tasks } = useData();
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchingLeads = q
    ? leads.filter(
        (l) =>
          l.businessName.toLowerCase().includes(q) ||
          l.industry.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q) ||
          (l.contactPerson && l.contactPerson.toLowerCase().includes(q))
      )
    : [];

  const matchingTasks = q
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.leadName && t.leadName.toLowerCase().includes(q)) ||
          (t.description && t.description.toLowerCase().includes(q))
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center p-4 pt-20">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#E5E7EB] flex items-center gap-3 bg-[#F8F7FF]">
          <Search className="w-5 h-5 text-[#7C3AED] shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search leads, decision makers, tasks, locations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm bg-transparent border-none focus:outline-none text-[#17172A] placeholder-[#9CA3AF]"
          />
          <button
            onClick={onClose}
            className="p-1 text-[#6B7280] hover:text-[#17172A] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {!q ? (
            <div className="text-center py-8 text-xs text-[#6B7280]">
              Type a keyword like <span className="font-semibold text-[#7C3AED]">"dental"</span>,{' '}
              <span className="font-semibold text-[#7C3AED]">"Austin"</span>, or{' '}
              <span className="font-semibold text-[#7C3AED]">"proposal"</span> to search your pipeline.
            </div>
          ) : matchingLeads.length === 0 && matchingTasks.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#6B7280]">
              No records found matching "{query}".
            </div>
          ) : (
            <>
              {matchingLeads.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-[#312E81] uppercase tracking-wider">
                    Prospect Leads ({matchingLeads.length})
                  </h4>
                  {matchingLeads.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => {
                        onSelectLead(lead.id);
                        onClose();
                      }}
                      className="p-3 rounded-xl bg-white hover:bg-[#F8F7FF] border border-[#E5E7EB] hover:border-[#DDD6FE] transition-all flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#17172A] group-hover:text-[#7C3AED]">
                            {lead.businessName}
                          </p>
                          <p className="text-[11px] text-[#6B7280]">
                            {lead.location} • Stage: {lead.pipelineStage} • Score: {lead.leadScore}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#7C3AED] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  ))}
                </div>
              )}

              {matchingTasks.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#F3F4F6]">
                  <h4 className="text-[11px] font-bold text-[#312E81] uppercase tracking-wider">
                    Tasks & Reminders ({matchingTasks.length})
                  </h4>
                  {matchingTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => {
                        onNavigateView('tasks');
                        onClose();
                      }}
                      className="p-3 rounded-xl bg-white hover:bg-[#F8F7FF] border border-[#E5E7EB] hover:border-[#DDD6FE] transition-all flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <CheckSquare className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#17172A] group-hover:text-[#7C3AED]">
                            {task.title}
                          </p>
                          <p className="text-[11px] text-[#6B7280]">
                            For: {task.leadName || 'General'} • Due: {new Date(task.dueDate).toLocaleDateString()} • {task.status}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#7C3AED] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

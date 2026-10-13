import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Task, Priority, TaskType } from '../../types';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
  Check,
  Building2,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface FollowUpsViewProps {
  initialFilter?: string;
  onSelectLead: (leadId: string) => void;
}

export const FollowUpsView: React.FC<FollowUpsViewProps> = ({
  initialFilter = 'all',
  onSelectLead,
}) => {
  const { tasks, leads, completeTask, rescheduleTask, deleteTask, createTask } = useData();

  const [activeTab, setActiveTab] = useState<string>(initialFilter);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newLeadId, setNewLeadId] = useState(leads[0]?.id || '');
  const [newDueDate, setNewDueDate] = useState(
    new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  );
  const [newPriority, setNewPriority] = useState<Priority>('HIGH');
  const [newType, setNewType] = useState<TaskType>('Follow-up Email');
  const [newDesc, setNewDesc] = useState('');

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endOfToday = startOfToday + 86400000;

  // Grouped task filtering
  const categorizedTasks = tasks.filter((task) => {
    const isCompleted = task.status === 'COMPLETED';
    const isCancelled = task.status === 'CANCELLED';
    const dueTime = new Date(task.dueDate).getTime();

    if (activeTab === 'today') {
      return !isCompleted && !isCancelled && dueTime >= startOfToday && dueTime <= endOfToday;
    }
    if (activeTab === 'overdue') {
      return !isCompleted && !isCancelled && dueTime < startOfToday;
    }
    if (activeTab === 'upcoming') {
      return !isCompleted && !isCancelled && dueTime > endOfToday;
    }
    if (activeTab === 'COMPLETED') {
      return isCompleted;
    }
    return true; // 'all'
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const lead = leads.find((l) => l.id === newLeadId);
    createTask({
      leadId: lead?.id,
      leadName: lead?.businessName,
      title: newTitle.trim(),
      description: newDesc.trim(),
      dueDate: new Date(newDueDate).toISOString(),
      priority: newPriority,
      status: 'PENDING',
      type: newType,
      assignedTo: 'Amulya Lakshmi',
    });

    setShowNewTaskModal(false);
    setNewTitle('');
    setNewDesc('');
  };

  const priorityColor = (p: Priority) => {
    if (p === 'HIGH') return 'bg-red-50 text-red-700 border-red-200';
    if (p === 'MEDIUM') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#312E81] tracking-tight">
            Tasks & Follow-up Scheduler
          </h1>
          <p className="text-xs text-[#6B7280] mt-1">
            Maintain sales momentum with automated due date tracking, overdue alerts, and quick reschedule cadences.
          </p>
        </div>

        <button
          onClick={() => setShowNewTaskModal(true)}
          className="px-4 py-2 text-xs font-bold bg-[#312E81] hover:bg-[#282568] text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-[#93C5FD]" />
          Schedule Follow-up Task
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-[#E5E7EB] gap-2 text-xs font-bold text-[#6B7280]">
        {[
          { id: 'all', label: 'All Tasks', count: tasks.length },
          {
            id: 'today',
            label: 'Due Today',
            count: tasks.filter(
              (t) =>
                t.status !== 'COMPLETED' &&
                t.status !== 'CANCELLED' &&
                new Date(t.dueDate).getTime() >= startOfToday &&
                new Date(t.dueDate).getTime() <= endOfToday
            ).length,
            color: 'text-amber-600',
          },
          {
            id: 'overdue',
            label: 'Overdue',
            count: tasks.filter(
              (t) =>
                t.status !== 'COMPLETED' &&
                t.status !== 'CANCELLED' &&
                new Date(t.dueDate).getTime() < startOfToday
            ).length,
            color: 'text-red-600',
          },
          {
            id: 'upcoming',
            label: 'Upcoming',
            count: tasks.filter(
              (t) =>
                t.status !== 'COMPLETED' &&
                t.status !== 'CANCELLED' &&
                new Date(t.dueDate).getTime() > endOfToday
            ).length,
          },
          {
            id: 'COMPLETED',
            label: 'Completed',
            count: tasks.filter((t) => t.status === 'COMPLETED').length,
            color: 'text-emerald-600',
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'border-[#7C3AED] text-[#7C3AED]'
                : 'border-transparent hover:text-[#17172A]'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                tab.color || 'text-[#4B5563]'
              } bg-[#F8F7FF] border border-[#E5E7EB]`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {categorizedTasks.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-[#E5E7EB] text-center space-y-2 card-shadow">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-[#17172A]">No tasks in this category</h3>
            <p className="text-xs text-[#6B7280]">
              You're all caught up on scheduled follow-ups here!
            </p>
          </div>
        ) : (
          categorizedTasks.map((task) => {
            const isCompleted = task.status === 'COMPLETED';
            const isOverdue =
              !isCompleted &&
              task.status !== 'CANCELLED' &&
              new Date(task.dueDate).getTime() < startOfToday;

            return (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition-all bg-white card-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isOverdue ? 'border-red-200 bg-red-50/20' : 'border-[#E5E7EB]'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${priorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-[#EDE9FE] text-[#312E81]">
                      {task.type}
                    </span>
                    {isOverdue && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-100 text-red-800">
                        OVERDUE
                      </span>
                    )}
                  </div>

                  <h3
                    className={`text-sm font-bold ${
                      isCompleted ? 'line-through text-[#9CA3AF]' : 'text-[#17172A]'
                    }`}
                  >
                    {task.title}
                  </h3>

                  {task.description && (
                    <p className="text-xs text-[#4B5563] leading-relaxed max-w-2xl">
                      {task.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#6B7280] pt-1">
                    {task.leadId && task.leadName && (
                      <button
                        onClick={() => onSelectLead(task.leadId!)}
                        className="font-semibold text-[#7C3AED] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        {task.leadName}
                      </button>
                    )}
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#9CA3AF]" />
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span>Assignee: {task.assignedTo}</span>
                  </div>
                </div>

                {/* Task Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {!isCompleted && (
                    <>
                      <button
                        onClick={() => completeTask(task.id)}
                        className="px-3 py-1.5 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Complete
                      </button>

                      <button
                        onClick={() => {
                          const nextDate = new Date(Date.now() + 3 * 86400000).toISOString();
                          rescheduleTask(task.id, nextDate);
                        }}
                        className="px-2.5 py-1.5 text-xs font-semibold text-[#4B5563] hover:bg-gray-100 rounded-lg border border-[#E5E7EB] transition-colors cursor-pointer"
                        title="Reschedule +3 Days"
                      >
                        +3 Days
                      </button>

                      <button
                        onClick={() => {
                          const nextDate = new Date(Date.now() + 7 * 86400000).toISOString();
                          rescheduleTask(task.id, nextDate);
                        }}
                        className="px-2.5 py-1.5 text-xs font-semibold text-[#4B5563] hover:bg-gray-100 rounded-lg border border-[#E5E7EB] transition-colors cursor-pointer"
                        title="Reschedule +1 Week"
                      >
                        +1 Week
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 text-[#9CA3AF] hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#E5E7EB]">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <h3 className="text-base font-bold text-[#17172A]">Schedule New Follow-up</h3>
              <button
                onClick={() => setShowNewTaskModal(false)}
                className="p-1 text-[#6B7280] hover:text-[#17172A] rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#17172A] mb-1">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Follow-up email regarding scheduling software..."
                  className="w-full px-3 py-2 bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#17172A] mb-1">Linked Lead</label>
                <select
                  value={newLeadId}
                  onChange={(e) => setNewLeadId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg focus:outline-none"
                >
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.businessName} ({l.location})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#17172A] mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#17172A] mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg focus:outline-none"
                  >
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="LOW">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#17172A] mb-1">Task Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as TaskType)}
                  className="w-full px-3 py-2 bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg focus:outline-none"
                >
                  <option value="Follow-up Email">Follow-up Email</option>
                  <option value="Discovery Call">Discovery Call</option>
                  <option value="Send Proposal">Send Proposal</option>
                  <option value="Audit Presentation">Audit Presentation</option>
                  <option value="Contract Review">Contract Review</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#17172A] mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Key context to remember for this follow-up..."
                  className="w-full p-2.5 bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#F3F4F6]">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-3.5 py-2 font-semibold text-[#4B5563] hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-[#312E81] hover:bg-[#282568] rounded-lg cursor-pointer"
                >
                  Save & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { StaffTask, StaffProfile, Client } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  KeyRound, 
  AlertCircle, 
  Phone, 
  ShieldCheck, 
  Sparkles, 
  User, 
  FileCheck2,
  Calendar,
  Building
} from 'lucide-react';

interface StaffTasksViewProps {
  tasks: StaffTask[];
  clients: Client[];
  activeStaff: StaffProfile;
  onUpdateTask: (task: StaffTask) => void;
  onSelectClientToView: (client: Client) => void;
}

export const StaffTasksView: React.FC<StaffTasksViewProps> = ({
  tasks,
  clients,
  activeStaff,
  onUpdateTask,
  onSelectClientToView,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'my'>('my');
  const [selectedTask, setSelectedTask] = useState<StaffTask | null>(tasks[0] || null);

  const displayedTasks = tasks.filter((t) => {
    if (filterMode === 'my' && activeStaff.role === 'Staff') {
      return t.assignedStaffId === activeStaff.id;
    }
    return true;
  });

  const toggleChecklist = (taskId: string, checkId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedChecklist = task.checklist.map((item) =>
      item.id === checkId ? { ...item, completed: !item.completed } : item
    );

    const allCompleted = updatedChecklist.every((i) => i.completed);

    const updatedTask: StaffTask = {
      ...task,
      checklist: updatedChecklist,
      isComplete: allCompleted,
      completedAt: allCompleted ? new Date().toISOString().replace('T', ' ').slice(0, 16) : undefined,
    };

    onUpdateTask(updatedTask);
    if (selectedTask?.id === taskId) {
      setSelectedTask(updatedTask);
    }
  };

  const handleCompleteAll = (task: StaffTask) => {
    const updatedTask: StaffTask = {
      ...task,
      checklist: task.checklist.map((item) => ({ ...item, completed: true })),
      isComplete: true,
      completedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    onUpdateTask(updatedTask);
    if (selectedTask?.id === task.id) {
      setSelectedTask(updatedTask);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
            Field Operations & Task Management · Kampala
          </div>
          <h2 className="text-xl font-serif-luxury font-bold text-white mt-0.5">
            Client Information & Estate Care Tasks
          </h2>
          <div className="text-xs text-slate-400 mt-1">
            Assigned to: <span className="text-amber-400 font-medium">{activeStaff.name}</span> ({activeStaff.role} · {activeStaff.title})
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex p-0.5 bg-slate-900 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setFilterMode('my')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                filterMode === 'my' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              My Assigned Tasks
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                filterMode === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Kampala Field Tasks ({tasks.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Tasks list / Right Full Client Dossier & Interactive Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols): Task List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs text-slate-400 px-1 flex justify-between">
            <span>Scheduled Residencies Today</span>
            <span>Kampala Branch</span>
          </div>

          {displayedTasks.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs bg-[#0f172a] rounded-xl border border-slate-800">
              No tasks currently assigned for this filter.
            </div>
          ) : (
            displayedTasks.map((t) => {
              const isSelected = selectedTask?.id === t.id;
              const completedCount = t.checklist.filter((c) => c.completed).length;

              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTask(t)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/60 shadow-md'
                      : 'bg-[#0f172a] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className={`text-sm font-semibold ${isSelected ? 'text-amber-300' : 'text-slate-100'}`}>
                        {t.clientName}
                      </h4>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{t.residenceAddress}</span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase font-mono-numbers shrink-0 ${
                      t.isComplete
                        ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    }`}>
                      {t.isComplete ? 'Complete' : 'In Progress'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-2.5">
                    <span className="text-amber-400/90 font-medium">{t.neighborhood}</span>
                    <span>·</span>
                    <span className="font-mono-numbers">{t.timeSlot}</span>
                  </div>

                  {/* Checklist progress bar */}
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      {completedCount} of {t.checklist.length} checklist items complete
                    </span>
                    <span className="font-mono-numbers text-amber-400 font-semibold">
                      {Math.round((completedCount / t.checklist.length) * 100)}%
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column (7 cols): Selected Task & Client Dossier */}
        <div className="lg:col-span-7 space-y-4">
          {selectedTask ? (
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                    Client Residence Dossier · Kampala
                  </div>
                  <h3 className="text-lg font-serif-luxury font-bold text-white mt-0.5">
                    {selectedTask.clientName}
                  </h3>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>{selectedTask.residenceAddress}, {selectedTask.neighborhood}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono-numbers text-amber-400 font-semibold">
                    {selectedTask.timeSlot}
                  </div>
                  <div className="text-[11px] text-slate-400">{selectedTask.serviceTier}</div>
                </div>
              </div>

              {/* Security & Gate Access Box */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  Security Protocol & Gate Clearance
                </div>
                <div className="text-xs text-slate-200 font-medium">
                  {selectedTask.accessCode}
                </div>
                {selectedTask.petInstructions && (
                  <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                    <span className="text-slate-300 font-medium">Pet Instructions:</span> {selectedTask.petInstructions}
                  </div>
                )}
              </div>

              {/* Client Special Preferences */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs">
                <div className="text-slate-400 font-semibold flex items-center gap-1.5 text-slate-300">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  Client Housekeeping Directives
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {selectedTask.specialRequests}
                </p>
              </div>

              {/* Interactive Checklist */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-amber-400" />
                    White-Glove Task Execution Checklist
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleCompleteAll(selectedTask)}
                    className="text-xs text-amber-400 hover:text-amber-300 underline font-medium"
                  >
                    Mark All Completed
                  </button>
                </div>

                <div className="space-y-2">
                  {selectedTask.checklist.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleChecklist(selectedTask.id, item.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        item.completed
                          ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-200'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => {}}
                          className="rounded accent-emerald-500 w-4 h-4"
                        />
                        <div>
                          <span className={`text-xs ${item.completed ? 'line-through text-slate-400' : 'text-slate-100 font-medium'}`}>
                            {item.task}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            Area: {item.area}
                          </span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-semibold ${item.completed ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {item.completed ? 'DONE' : 'PENDING'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="text-[11px] text-slate-500">
                  Assigned: {selectedTask.assignedStaffName}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const client = clients.find((c) => c.id === selectedTask.clientId);
                    if (client) onSelectClientToView(client);
                  }}
                  className="px-3.5 py-2 bg-slate-900 border border-slate-700 hover:border-amber-500 text-slate-200 hover:text-white rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Building className="w-3.5 h-3.5 text-amber-400" />
                  <span>View Full Client Dossier</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs bg-[#0f172a] rounded-xl border border-slate-800">
              Select an estate visit from the left to view gate codes and task checklist.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

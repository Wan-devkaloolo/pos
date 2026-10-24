import React, { useState } from 'react';
import { FollowUpSequence, FollowUpLog, Lead, Client } from '../types';
import { 
  SendHorizontal, 
  Sparkles, 
  Clock, 
  MessageSquare, 
  Mail, 
  CheckCircle2, 
  Copy, 
  Play, 
  Settings2,
  TrendingUp,
  History
} from 'lucide-react';

interface FollowUpWorkflowsViewProps {
  sequences: FollowUpSequence[];
  logs: FollowUpLog[];
  leads: Lead[];
  clients: Client[];
  onUpdateSequence: (sequence: FollowUpSequence) => void;
  onSendManualFollowUp: (log: FollowUpLog) => void;
}

export const FollowUpWorkflowsView: React.FC<FollowUpWorkflowsViewProps> = ({
  sequences,
  logs,
  leads,
  clients,
  onUpdateSequence,
  onSendManualFollowUp,
}) => {
  const [selectedSequence, setSelectedSequence] = useState<FollowUpSequence>(sequences[0] || null);
  const [selectedLeadId, setSelectedLeadId] = useState<string>(leads[0]?.id || '');
  const [simulatorStatus, setSimulatorStatus] = useState<string | null>(null);

  // Template editor state
  const [editedSubject, setEditedSubject] = useState(selectedSequence?.subjectTemplate || '');
  const [editedMessage, setEditedMessage] = useState(selectedSequence?.messageTemplate || '');

  const activeLead = leads.find((l) => l.id === selectedLeadId) || leads[0];

  const handleSelectSequence = (seq: FollowUpSequence) => {
    setSelectedSequence(seq);
    setEditedSubject(seq.subjectTemplate);
    setEditedMessage(seq.messageTemplate);
  };

  const handleSaveTemplate = () => {
    if (!selectedSequence) return;
    const updated: FollowUpSequence = {
      ...selectedSequence,
      subjectTemplate: editedSubject,
      messageTemplate: editedMessage,
    };
    onUpdateSequence(updated);
    setSelectedSequence(updated);
    setSimulatorStatus('Template saved and live workflow updated!');
    setTimeout(() => setSimulatorStatus(null), 4000);
  };

  const handleToggleActive = (seq: FollowUpSequence) => {
    const updated: FollowUpSequence = {
      ...seq,
      isActive: !seq.isActive,
    };
    onUpdateSequence(updated);
    if (selectedSequence.id === seq.id) setSelectedSequence(updated);
  };

  // Replace tokens for live preview
  const previewMessage = (template: string, lead?: Lead) => {
    if (!lead) return template;
    return template
      .replace(/{{client_name}}/g, lead.clientName)
      .replace(/{{address}}/g, lead.address)
      .replace(/{{service_tier}}/g, lead.serviceTier)
      .replace(/{{square_footage}}/g, lead.squareFootage.toLocaleString())
      .replace(/{{estimated_value}}/g, `$${lead.estimatedValue.toLocaleString()}`)
      .replace(/{{time_slot}}/g, '08:30 AM - 01:30 PM')
      .replace(/{{cleaner_team}}/g, 'Elena Rostova & Team Alpha')
      .replace(/{{gate_code}}/g, '#8829')
      .replace(/{{qa_score}}/g, '98')
      .replace(/{{booking_id}}/g, 'bk-201');
  };

  const previewSubject = (template: string, lead?: Lead) => {
    if (!lead) return template;
    return template
      .replace(/{{client_name}}/g, lead.clientName)
      .replace(/{{address}}/g, lead.address)
      .replace(/{{service_tier}}/g, lead.serviceTier);
  };

  const handleSimulateSend = () => {
    if (!activeLead || !selectedSequence) return;

    const renderedContent = previewMessage(editedMessage, activeLead);
    const renderedSubject = previewSubject(editedSubject, activeLead);

    const newLog: FollowUpLog = {
      id: `flog-${Date.now()}`,
      leadOrClientId: activeLead.id,
      recipientName: activeLead.clientName,
      recipientContact: selectedSequence.channel === 'sms' ? activeLead.phone : activeLead.email,
      channel: selectedSequence.channel === 'sms' ? 'sms' : 'email',
      sequenceName: selectedSequence.name,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'sent',
      subject: renderedSubject,
      content: renderedContent,
    };

    onSendManualFollowUp(newLog);
    setSimulatorStatus(`Workflow triggered! Automated dispatch sent to ${activeLead.clientName}.`);
    setTimeout(() => setSimulatorStatus(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
            CRM Point of Sales Efficiency
          </div>
          <h2 className="text-xl font-serif-luxury font-bold text-white mt-0.5">
            Automated Client Follow-Up Sequences
          </h2>
          <div className="text-xs text-slate-400 mt-1">
            Nurture inquiries with instant VIP welcome texts, 24h quote follow-ups, and post-clean reviews.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-emerald-400 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Automated Triggers Active</span>
          </div>
        </div>
      </div>

      {simulatorStatus && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{simulatorStatus}</span>
          </div>
          <button onClick={() => setSimulatorStatus(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Main Grid: Left Sequence Selector / Right Live Template Engine & Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols): Sequences List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Configured Sequences ({sequences.length})</span>
            <span>Avg Response: 82%</span>
          </div>

          {sequences.map((seq) => {
            const isSelected = selectedSequence?.id === seq.id;
            return (
              <div
                key={seq.id}
                onClick={() => handleSelectSequence(seq)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/60 shadow-md'
                    : 'bg-[#0f172a] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className={`text-xs font-semibold ${isSelected ? 'text-amber-300' : 'text-slate-200'}`}>
                      {seq.name}
                    </h4>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{seq.triggerEvent}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleActive(seq);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${
                      seq.isActive
                        ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {seq.isActive ? 'Active' : 'Paused'}
                  </button>
                </div>

                {/* Metadata */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-800/80">
                  <span className="capitalize">{seq.channel} delivery</span>
                  <span className="font-mono-numbers">
                    Sent: {seq.totalSent} · {seq.responseRate}% response
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column (7 cols): Template Editor & Live Simulator */}
        <div className="lg:col-span-7 space-y-4">
          {selectedSequence ? (
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="text-xs text-amber-400 font-semibold uppercase">
                    Workflow Sequence Engine
                  </div>
                  <h3 className="text-sm font-semibold text-white mt-0.5">
                    {selectedSequence.name}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveTemplate}
                    className="px-3 py-1.5 bg-slate-900 border border-slate-700 hover:border-amber-500 text-slate-200 hover:text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Subject (if email or both) */}
              {(selectedSequence.channel === 'email' || selectedSequence.channel === 'both') && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Email Subject Template</label>
                  <input
                    type="text"
                    value={editedSubject}
                    onChange={(e) => setEditedSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:border-amber-500 font-mono text-[11px]"
                  />
                </div>
              )}

              {/* Message Body Template */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-slate-400">Message Content Template</label>
                  <span className="text-[10px] text-slate-500">
                    Available tags: {'{{client_name}}'}, {'{{address}}'}, {'{{service_tier}}'}, {'{{estimated_value}}'}
                  </span>
                </div>
                <textarea
                  rows={6}
                  value={editedMessage}
                  onChange={(e) => setEditedMessage(e.target.value)}
                  className="w-full p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:border-amber-500 font-mono text-[11px] leading-relaxed"
                />
              </div>

              {/* Live Preview with Real Lead Data */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                  <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Live Rendered Preview
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 text-[11px]">Preview With:</span>
                    <select
                      value={selectedLeadId}
                      onChange={(e) => setSelectedLeadId(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-slate-200 text-xs"
                    >
                      {leads.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.clientName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {editedSubject && (
                  <div className="text-xs font-semibold text-slate-200">
                    Subject: {previewSubject(editedSubject, activeLead)}
                  </div>
                )}

                <div className="text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed pt-1">
                  {previewMessage(editedMessage, activeLead)}
                </div>
              </div>

              {/* Simulator Action Button */}
              <div className="pt-2 flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  Target: {activeLead ? `${activeLead.clientName} (${activeLead.phone})` : 'No lead selected'}
                </div>
                <button
                  type="button"
                  onClick={handleSimulateSend}
                  className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5"
                >
                  <SendHorizontal className="w-3.5 h-3.5" />
                  <span>Execute Automated Send to {activeLead?.clientName.split(' ')[0]}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs bg-[#0f172a] rounded-xl border border-slate-800">
              Select a sequence on the left to view and configure its template.
            </div>
          )}

          {/* Activity Dispatch Logs */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-amber-400" />
              Recent Automated Follow-Up Dispatches ({logs.length})
            </h4>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 text-xs flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="font-medium text-slate-200">
                      {log.recipientName} <span className="text-slate-500 text-[11px]">({log.recipientContact})</span>
                    </div>
                    <div className="text-[11px] text-amber-400/90">{log.sequenceName}</div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{log.content}</div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase font-semibold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30">
                      {log.status}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-1 font-mono-numbers">{log.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

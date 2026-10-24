import React, { useState } from 'react';
import { Lead, ServiceTier, LeadStatus } from '../types';
import { 
  Users, 
  Plus, 
  Send, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Clock, 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  Filter, 
  Phone, 
  Mail, 
  Building,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface LeadsPipelineViewProps {
  leads: Lead[];
  onAddLead: (lead: Lead) => void;
  onUpdateLeadStatus: (leadId: string, status: LeadStatus) => void;
  onTriggerFollowUp: (lead: Lead) => void;
  onConvertToBooking: (lead: Lead) => void;
}

const STAGES: { id: LeadStatus; label: string; color: string }[] = [
  { id: 'new_inquiry', label: 'New Inquiries', color: 'border-sky-500/50' },
  { id: 'qualified', label: 'Qualified Estate', color: 'border-indigo-500/50' },
  { id: 'estimate_sent', label: 'Estimate Delivered', color: 'border-amber-500/50' },
  { id: 'followup_1', label: 'Follow-Up 1 (24h)', color: 'border-purple-500/50' },
  { id: 'followup_2', label: 'Follow-Up 2 (48h)', color: 'border-orange-500/50' },
  { id: 'closed_won', label: 'Closed Won (Booked)', color: 'border-emerald-500/50' },
  { id: 'closed_lost', label: 'Archived / Lost', color: 'border-slate-600/50' },
];

export const LeadsPipelineView: React.FC<LeadsPipelineViewProps> = ({
  leads,
  onAddLead,
  onUpdateLeadStatus,
  onTriggerFollowUp,
  onConvertToBooking,
}) => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [filterSource, setFilterSource] = useState<string>('all');

  // Form for new lead
  const [formData, setFormData] = useState({
    clientName: '',
    email: '',
    phone: '',
    address: '',
    residenceType: 'Private Estate',
    serviceTier: 'Signature Estate Maintenance' as ServiceTier,
    squareFootage: 6000,
    estimatedValue: 1250,
    source: 'Website Form' as Lead['source'],
    notes: '',
  });

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || !formData.email) return;

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      clientName: formData.clientName,
      email: formData.email,
      phone: formData.phone || '(415) 555-0182',
      address: formData.address || 'San Francisco Bay Area',
      residenceType: formData.residenceType,
      serviceTier: formData.serviceTier,
      squareFootage: formData.squareFootage,
      estimatedValue: formData.estimatedValue,
      status: 'new_inquiry',
      inquiryDate: new Date().toISOString().split('T')[0],
      lastContactDate: new Date().toISOString().split('T')[0],
      source: formData.source,
      conversionProbability: 60,
      notes: formData.notes || 'Inbound inquiry captured by concierge team.',
      nextFollowUpDue: new Date(Date.now() + 86400000).toISOString().replace('T', ' ').slice(0, 16),
      automatedFollowUpStage: 0,
    };

    onAddLead(newLead);
    setIsNewLeadModalOpen(false);
    setFormData({
      clientName: '',
      email: '',
      phone: '',
      address: '',
      residenceType: 'Private Estate',
      serviceTier: 'Signature Estate Maintenance',
      squareFootage: 6000,
      estimatedValue: 1250,
      source: 'Website Form',
      notes: '',
    });
  };

  const filteredLeads = leads.filter((l) => {
    if (filterSource === 'all') return true;
    return l.source === filterSource;
  });

  // Calculate Pipeline KPIs
  const totalPipelineValue = leads
    .filter((l) => l.status !== 'closed_lost')
    .reduce((sum, l) => sum + l.estimatedValue, 0);

  const wonLeadsCount = leads.filter((l) => l.status === 'closed_won').length;
  const overallConversionRate = leads.length > 0 ? Math.round((wonLeadsCount / leads.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
            Client Relationship Management
          </div>
          <h2 className="text-xl font-serif-luxury font-bold text-white mt-0.5">
            Inbound Leads & Conversion Pipeline
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>{leads.length} Total Inquiries</span>
            <span>·</span>
            <span className="font-mono-numbers text-slate-200 font-medium">
              ${totalPipelineValue.toLocaleString()} Pipeline Value
            </span>
            <span>·</span>
            <span className="text-emerald-400 font-medium font-mono-numbers">
              {overallConversionRate}% Win Rate
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-lg">
            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'board' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pipeline Board
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Table View
            </button>
          </div>

          <button
            onClick={() => setIsNewLeadModalOpen(true)}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Capture Inbound Lead</span>
          </button>
        </div>
      </div>

      {/* Filter row */}
      <div className="flex items-center justify-between py-2 border-b border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span>Inquiry Source:</span>
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs focus:border-amber-500"
          >
            <option value="all">All Sources ({leads.length})</option>
            <option value="Website Form">Website Form</option>
            <option value="Concierge Referral">Concierge Referral</option>
            <option value="Estate Manager">Estate Manager</option>
            <option value="Realtor Partner">Realtor Partner</option>
          </select>
        </div>

        <div className="text-[11px] text-slate-500">
          Showing {filteredLeads.length} active opportunities
        </div>
      </div>

      {/* Pipeline Kanban View */}
      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-3 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => l.status === stage.id);
            const stageValue = stageLeads.reduce((sum, l) => sum + l.estimatedValue, 0);

            return (
              <div
                key={stage.id}
                className="bg-[#0f172a]/90 border border-slate-800 rounded-xl p-3 flex flex-col min-w-[240px]"
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <div>
                    <div className="text-xs font-semibold text-slate-200">{stage.label}</div>
                    <div className="text-[10px] text-slate-400 font-mono-numbers">
                      {stageLeads.length} leads · ${stageValue.toLocaleString()}
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-amber-400/80" />
                </div>

                {/* Lead Cards List */}
                <div className="space-y-2 flex-1 overflow-y-auto max-h-[600px] pr-0.5">
                  {stageLeads.length === 0 ? (
                    <div className="py-8 text-center text-slate-600 text-[11px]">
                      No leads in this stage
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className="p-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all hover:bg-slate-850 group shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-1.5">
                          <span className="text-xs font-semibold text-slate-100 group-hover:text-amber-300 transition-colors">
                            {lead.clientName}
                          </span>
                          <span className="text-xs font-mono-numbers font-semibold text-amber-400">
                            ${lead.estimatedValue.toLocaleString()}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-400 truncate mb-2">
                          {lead.serviceTier}
                        </div>

                        {/* Unboxed Metadata discipline */}
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-2">
                          <span>{lead.squareFootage.toLocaleString()} sq ft</span>
                          <span>·</span>
                          <span>{lead.source}</span>
                          <span>·</span>
                          <span className="text-emerald-400 font-mono-numbers font-medium">
                            {lead.conversionProbability}% Prob
                          </span>
                        </div>

                        {/* Action buttons inside card */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onTriggerFollowUp(lead);
                            }}
                            className="text-amber-400 hover:text-amber-300 flex items-center gap-1"
                            title="Send automated VIP email/sms sequence"
                          >
                            <Send className="w-3 h-3" />
                            <span>Auto Follow-up</span>
                          </button>

                          {lead.status !== 'closed_won' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onConvertToBooking(lead);
                              }}
                              className="text-emerald-400 hover:text-emerald-300 font-medium"
                              title="Book immediately"
                            >
                              Convert to POS
                            </button>
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
      ) : (
        /* Table View */
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-medium border-b border-slate-800 text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Client & Estate</th>
                  <th className="px-4 py-3">Service Tier</th>
                  <th className="px-4 py-3">Est. Value</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Inquiry Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="hover:bg-slate-850/60 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-100">{lead.clientName}</div>
                      <div className="text-[11px] text-slate-400">{lead.phone} · {lead.email}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      <div>{lead.serviceTier}</div>
                      <div className="text-[10px] text-slate-500 font-mono-numbers">
                        {lead.squareFootage.toLocaleString()} sq ft
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono-numbers font-semibold text-amber-400">
                      ${lead.estimatedValue.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] text-slate-300">
                        {STAGES.find((s) => s.id === lead.status)?.label || lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{lead.source}</td>
                    <td className="px-4 py-3 text-slate-400 font-mono-numbers">{lead.inquiryDate}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTriggerFollowUp(lead);
                          }}
                          className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-amber-400 hover:text-white text-[11px]"
                        >
                          Follow-up
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onConvertToBooking(lead);
                          }}
                          className="px-2 py-1 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 hover:text-white text-[11px]"
                        >
                          Book (POS)
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lead Detail Modal Drawer */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                  Lead Details & Inbound Dossier
                </div>
                <h3 className="text-lg font-serif-luxury font-bold text-white mt-0.5">
                  {selectedLead.clientName}
                </h3>
                <div className="text-xs text-slate-400">{selectedLead.address}</div>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-500 block mb-0.5">Contact</span>
                <div className="text-slate-200 font-medium">{selectedLead.phone}</div>
                <div className="text-slate-400 text-[11px] truncate">{selectedLead.email}</div>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-500 block mb-0.5">Estimated Value</span>
                <div className="text-amber-400 font-mono-numbers text-base font-bold">
                  ${selectedLead.estimatedValue.toLocaleString()}
                </div>
                <div className="text-[11px] text-emerald-400 font-mono-numbers">
                  {selectedLead.conversionProbability}% Win Probability
                </div>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-slate-400 block font-medium">Service Specifications</span>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1 text-slate-300">
                <div>{selectedLead.serviceTier}</div>
                <div className="text-[11px] text-slate-400">
                  {selectedLead.squareFootage.toLocaleString()} sq ft · {selectedLead.residenceType}
                </div>
                <div className="text-[11px] text-slate-400 mt-2">
                  <span className="text-slate-500">Notes:</span> {selectedLead.notes}
                </div>
              </div>
            </div>

            {/* Stage Selector */}
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                Update Pipeline Stage
              </label>
              <select
                value={selectedLead.status}
                onChange={(e) => {
                  onUpdateLeadStatus(selectedLead.id, e.target.value as LeadStatus);
                  setSelectedLead({ ...selectedLead, status: e.target.value as LeadStatus });
                }}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:border-amber-500"
              >
                {STAGES.map((stg) => (
                  <option key={stg.id} value={stg.id}>
                    {stg.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  onTriggerFollowUp(selectedLead);
                  setSelectedLead(null);
                }}
                className="px-3.5 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-semibold flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Trigger VIP Automated Follow-up</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onConvertToBooking(selectedLead);
                  setSelectedLead(null);
                }}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs"
              >
                Promote to Booked POS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Inbound Lead Modal */}
      {isNewLeadModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-serif-luxury font-bold text-white">
                  Capture Inbound Service Inquiry
                </h3>
                <p className="text-xs text-slate-400">
                  Record new incoming phone call, referral, or web form inquiry.
                </p>
              </div>
              <button
                onClick={() => setIsNewLeadModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Client Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lord & Lady Hamilton"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="client@residence.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="(415) 555-0199"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Residence Address</label>
                <input
                  type="text"
                  placeholder="100 Belvedere Ave, Belvedere, CA"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Service Tier Requested</label>
                  <select
                    value={formData.serviceTier}
                    onChange={(e) => setFormData({ ...formData, serviceTier: e.target.value as ServiceTier })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:border-amber-500"
                  >
                    <option value="Signature Estate Maintenance">Signature Estate Maintenance</option>
                    <option value="White Glove Deep Clean">White Glove Deep Clean</option>
                    <option value="Turnover & Concierge Detailing">Turnover & Concierge Detailing</option>
                    <option value="Post-Renovation Architectural Detailing">Post-Renovation Architectural Detailing</option>
                    <option value="Marble & Chandelier Specialty Care">Marble & Chandelier Specialty Care</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Inquiry Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:border-amber-500"
                  >
                    <option value="Website Form">Website Form (sovereigntouchhomecare.com)</option>
                    <option value="Concierge Referral">Luxury Concierge Referral</option>
                    <option value="Estate Manager">Private Estate Manager</option>
                    <option value="Realtor Partner">Realtor Partner</option>
                    <option value="Direct Phone">Direct Phone Inquiry</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Est. Sq Footage</label>
                  <input
                    type="number"
                    step="500"
                    value={formData.squareFootage}
                    onChange={(e) => setFormData({ ...formData, squareFootage: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:border-amber-500 font-mono-numbers"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Est. Booking Value ($)</label>
                  <input
                    type="number"
                    value={formData.estimatedValue}
                    onChange={(e) => setFormData({ ...formData, estimatedValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:border-amber-500 font-mono-numbers"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Inquiry Notes</label>
                <textarea
                  rows={2}
                  placeholder="Special requests, timeline, pet notes, gate entry..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:border-amber-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewLeadModalOpen(false)}
                  className="px-3 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors"
                >
                  Save Lead & Trigger Sequence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

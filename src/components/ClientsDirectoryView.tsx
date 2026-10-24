import React, { useState } from 'react';
import { Client, StaffProfile } from '../types';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  KeyRound, 
  ShieldCheck, 
  Sparkles, 
  Search, 
  Star,
  Clock,
  UserCheck
} from 'lucide-react';

interface ClientsDirectoryViewProps {
  clients: Client[];
  activeStaff: StaffProfile;
  selectedClientModal: Client | null;
  onCloseClientModal: () => void;
  onSelectClient: (client: Client) => void;
}

export const ClientsDirectoryView: React.FC<ClientsDirectoryViewProps> = ({
  clients,
  activeStaff,
  selectedClientModal,
  onCloseClientModal,
  onSelectClient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterNeighborhood, setFilterNeighborhood] = useState('all');

  const filtered = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm);
    const matchesNeigh = filterNeighborhood === 'all' || c.city.toLowerCase().includes(filterNeighborhood.toLowerCase());
    return matchesSearch && matchesNeigh;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
            Kampala Private Client Directory
          </div>
          <h2 className="text-xl font-serif-luxury font-bold text-white mt-0.5">
            Client Residences & Gate Clearances
          </h2>
          <div className="text-xs text-slate-400 mt-1">
            Access protocols, estate gate codes, and bespoke housekeeping preferences across Kampala.
          </div>
        </div>

        <div className="text-xs text-slate-400">
          Showing <span className="text-white font-mono-numbers">{filtered.length}</span> verified client residencies
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#0f172a] border border-slate-800 rounded-xl text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client name, address, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-xs focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span>Neighborhood:</span>
          <select
            value={filterNeighborhood}
            onChange={(e) => setFilterNeighborhood(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 text-xs focus:border-amber-500"
          >
            <option value="all">All Kampala Areas</option>
            <option value="Kololo">Kololo Hill</option>
            <option value="Nakasero">Nakasero Hill</option>
            <option value="Muyenga">Muyenga Tank Hill</option>
            <option value="Munyonyo">Munyonyo Marina</option>
          </select>
        </div>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((client) => (
          <div
            key={client.id}
            onClick={() => onSelectClient(client)}
            className="bg-[#0f172a] border border-slate-800 hover:border-amber-500/40 rounded-xl p-5 cursor-pointer transition-all flex flex-col justify-between space-y-4 shadow-sm"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white hover:text-amber-300 transition-colors">
                    {client.name}
                  </h3>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{client.address}, {client.city}</span>
                  </div>
                </div>

                <span className="text-[10px] text-slate-400 font-mono-numbers px-2 py-0.5 rounded bg-slate-900 border border-slate-800 shrink-0">
                  {client.residenceType}
                </span>
              </div>

              {/* Unboxed Metadata */}
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-3 pt-2 border-t border-slate-800/80">
                <span className="font-mono-numbers">{client.squareFootage.toLocaleString()} sq ft</span>
                <span>·</span>
                <span>{client.bedrooms} Bed / {client.bathrooms} Bath</span>
                <span>·</span>
                <span className="text-amber-400 font-mono-numbers">{client.cleaningsCount} cleans</span>
              </div>

              {/* Security Gate instructions preview */}
              {client.gateCode && (
                <div className="mt-3 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-amber-300/90 flex items-start gap-2">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="truncate">{client.gateCode}</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="text-[11px] font-mono-numbers">{client.phone}</span>
              <span className="text-amber-400 hover:underline font-medium">View Dossier →</span>
            </div>
          </div>
        ))}
      </div>

      {/* Client Detail Modal */}
      {selectedClientModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                  Verified Client Dossier · Kampala
                </div>
                <h3 className="text-lg font-serif-luxury font-bold text-white mt-0.5">
                  {selectedClientModal.name}
                </h3>
                <div className="text-xs text-slate-400">
                  {selectedClientModal.address}, {selectedClientModal.city}
                </div>
              </div>
              <button onClick={onCloseClientModal} className="text-slate-400 hover:text-white p-1">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-500 block mb-0.5">Phone Contact</span>
                <div className="text-slate-200 font-medium font-mono-numbers">{selectedClientModal.phone}</div>
                <div className="text-slate-400 text-[11px] truncate">{selectedClientModal.email}</div>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-500 block mb-0.5">Residence Sizing</span>
                <div className="text-amber-400 font-mono-numbers font-bold">
                  {selectedClientModal.squareFootage.toLocaleString()} sq ft
                </div>
                <div className="text-slate-400 text-[11px]">
                  {selectedClientModal.bedrooms} Bedrooms · {selectedClientModal.bathrooms} Bathrooms
                </div>
              </div>
            </div>

            {/* Access Protocol */}
            <div className="p-3.5 bg-slate-900/90 rounded-xl border border-amber-500/30 space-y-1.5 text-xs">
              <div className="text-amber-400 font-semibold flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" />
                Gate Clearance & Security Procedure
              </div>
              <div className="text-slate-200 font-medium">
                {selectedClientModal.gateCode || 'Standard residential access.'}
              </div>
              <div className="text-[11px] text-slate-400 pt-1">
                {selectedClientModal.accessInstructions}
              </div>
            </div>

            {/* Housekeeping Special Preferences */}
            <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1 text-xs">
              <div className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Special Housekeeping Directives
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {selectedClientModal.specialPreferences}
              </p>
            </div>

            {/* Preferred Crew */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span>Preferred Concierge: {selectedClientModal.preferredCrew || 'Kampala Team Alpha'}</span>
              <button
                type="button"
                onClick={onCloseClientModal}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

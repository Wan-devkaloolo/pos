import React, { useState } from 'react';
import { Booking, BookingStatus, Client, ServiceTier } from '../types';
import { 
  CalendarDays, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Users, 
  CheckCircle2, 
  Car, 
  Sparkles, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Phone,
  KeyRound,
  FileCheck2
} from 'lucide-react';

interface SchedulingViewProps {
  bookings: Booking[];
  clients: Client[];
  onAddBooking: (booking: Booking) => void;
  onUpdateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  onOpenQualityAudit: (booking: Booking) => void;
}

const STATUS_CONFIG: Record<BookingStatus, { label: string; textClass: string; bgClass: string }> = {
  scheduled: { label: 'Scheduled', textClass: 'text-sky-400', bgClass: 'bg-sky-500/10 border-sky-500/30' },
  in_route: { label: 'In Route', textClass: 'text-amber-400', bgClass: 'bg-amber-500/10 border-amber-500/30' },
  in_progress: { label: 'Cleaning In Progress', textClass: 'text-purple-400', bgClass: 'bg-purple-500/10 border-purple-500/30' },
  quality_inspected: { label: 'QA Inspected & Certified', textClass: 'text-emerald-400', bgClass: 'bg-emerald-500/10 border-emerald-500/30' },
  completed: { label: 'Service Completed', textClass: 'text-slate-300', bgClass: 'bg-slate-800 border-slate-700' },
  cancelled: { label: 'Cancelled', textClass: 'text-rose-400', bgClass: 'bg-rose-500/10 border-rose-500/30' },
};

export const SchedulingView: React.FC<SchedulingViewProps> = ({
  bookings,
  clients,
  onAddBooking,
  onUpdateBookingStatus,
  onOpenQualityAudit,
}) => {
  const [filterDate, setFilterDate] = useState<string>('2026-10-24');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCrewFilter, setSelectedCrewFilter] = useState<string>('all');

  // New booking form
  const [selectedClientId, setSelectedClientId] = useState('');
  const [date, setDate] = useState('2026-10-25');
  const [timeSlot, setTimeSlot] = useState('08:30 AM - 01:30 PM');
  const [serviceTier, setServiceTier] = useState<ServiceTier>('Signature Estate Maintenance');
  const [crew, setCrew] = useState('Elena Rostova (Lead Concierge) & Team Alpha');
  const [price, setPrice] = useState(850);
  const [hours, setHours] = useState(5);
  const [notes, setNotes] = useState('White glove gate access. Fragile fine arts on first floor.');

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === selectedClientId) || clients[0];
    if (!client) return;

    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      clientId: client.id,
      clientName: client.name,
      clientPhone: client.phone,
      address: client.address,
      serviceTier,
      date,
      timeSlot,
      estimatedHours: hours,
      cleanerTeam: [crew],
      status: 'scheduled',
      price,
      squareFootage: client.squareFootage,
      frequency: 'bi-weekly',
      notes,
      isPaid: false,
    };

    onAddBooking(newBooking);
    setIsModalOpen(false);
  };

  const filteredBookings = bookings.filter((b) => {
    const matchCrew = selectedCrewFilter === 'all' || b.cleanerTeam.some((c) => c.includes(selectedCrewFilter));
    return matchCrew;
  });

  // Today's bookings
  const todayBookings = bookings.filter((b) => b.date === filterDate);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
            Automated Client Scheduling & Dispatch
          </div>
          <h2 className="text-xl font-serif-luxury font-bold text-white mt-0.5">
            White-Glove Crew Dispatch Board
          </h2>
          <div className="text-xs text-slate-400 mt-1">
            Real-time appointment tracking, arrival windows, gate access codes, and QA handoffs.
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Picker */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200">
            <CalendarDays className="w-3.5 h-3.5 text-amber-400" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-transparent focus:outline-none text-xs text-slate-100"
            />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Appointment</span>
          </button>
        </div>
      </div>

      {/* Daily Dispatch Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-3.5 bg-[#0f172a] border border-slate-800 rounded-xl">
          <span className="text-slate-400 text-xs block mb-1">Today's Visits ({filterDate})</span>
          <div className="text-xl font-bold text-white font-mono-numbers">
            {todayBookings.length} Residences
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            ${todayBookings.reduce((sum, b) => sum + b.price, 0).toLocaleString()} Booked Value
          </div>
        </div>

        <div className="p-3.5 bg-[#0f172a] border border-slate-800 rounded-xl">
          <span className="text-slate-400 text-xs block mb-1">In Progress Now</span>
          <div className="text-xl font-bold text-purple-400 font-mono-numbers">
            {todayBookings.filter((b) => b.status === 'in_progress').length} Active
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Live crew telemetry</div>
        </div>

        <div className="p-3.5 bg-[#0f172a] border border-slate-800 rounded-xl">
          <span className="text-slate-400 text-xs block mb-1">Pending Quality Audit</span>
          <div className="text-xl font-bold text-amber-400 font-mono-numbers">
            {todayBookings.filter((b) => b.status === 'in_progress' || b.status === 'scheduled').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Requires Inspector sign-off</div>
        </div>

        <div className="p-3.5 bg-[#0f172a] border border-slate-800 rounded-xl">
          <span className="text-slate-400 text-xs block mb-1">Completed & Passed QA</span>
          <div className="text-xl font-bold text-emerald-400 font-mono-numbers">
            {bookings.filter((b) => b.status === 'quality_inspected' || b.status === 'completed').length} Total
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">100% white-glove record</div>
        </div>
      </div>

      {/* Bookings Card List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
          <span>Active Dispatch Appointments</span>
          <div className="flex items-center gap-2">
            <span>Filter Crew:</span>
            <select
              value={selectedCrewFilter}
              onChange={(e) => setSelectedCrewFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs"
            >
              <option value="all">All Concierge Teams</option>
              <option value="Elena">Team Alpha (Elena Rostova)</option>
              <option value="Camille">Team Beta (Camille Laurent)</option>
              <option value="Julian">Team Gamma (Julian Cross)</option>
            </select>
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs bg-[#0f172a] rounded-xl border border-slate-800">
            No scheduled visits matching the selected criteria. Click "Schedule Appointment" to dispatch a team.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredBookings.map((b) => {
              const status = STATUS_CONFIG[b.status] || STATUS_CONFIG.scheduled;
              const client = clients.find((c) => c.id === b.clientId);

              return (
                <div
                  key={b.id}
                  className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all space-y-3"
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                          {b.clientName}
                        </h4>
                        <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{b.address}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${status.bgClass} ${status.textClass}`}>
                          {status.label}
                        </span>
                        <div className="text-xs font-mono-numbers font-semibold text-amber-400 mt-1">
                          ${b.price.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Metadata line (Zero-pill) */}
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-2.5">
                      <span className="text-amber-400/90 font-medium">{b.serviceTier}</span>
                      <span>·</span>
                      <span className="font-mono-numbers">{b.squareFootage.toLocaleString()} sq ft</span>
                      <span>·</span>
                      <span className="capitalize">{b.frequency}</span>
                    </div>
                  </div>

                  {/* Middle: Arrival Window & Crew */}
                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-medium font-mono-numbers">{b.date} · {b.timeSlot}</span>
                      </div>
                      <span className="text-slate-500 font-mono-numbers">~{b.estimatedHours} hrs</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{b.cleanerTeam.join(', ')}</span>
                    </div>

                    {client?.gateCode && (
                      <div className="flex items-center gap-1.5 text-amber-300/90 text-[11px] pt-1 border-t border-slate-800">
                        <KeyRound className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Security / Gate Code: <strong>{client.gateCode}</strong></span>
                      </div>
                    )}

                    {b.notes && (
                      <div className="text-[11px] text-slate-400 italic">
                        "{b.notes}"
                      </div>
                    )}
                  </div>

                  {/* Bottom: Workflow Transitions */}
                  <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      {b.status === 'scheduled' && (
                        <button
                          type="button"
                          onClick={() => onUpdateBookingStatus(b.id, 'in_route')}
                          className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-amber-400 hover:text-white hover:border-amber-500 text-[11px] flex items-center gap-1"
                        >
                          <Car className="w-3 h-3" />
                          <span>Mark In Route</span>
                        </button>
                      )}
                      {b.status === 'in_route' && (
                        <button
                          type="button"
                          onClick={() => onUpdateBookingStatus(b.id, 'in_progress')}
                          className="px-2.5 py-1 rounded bg-purple-950/80 border border-purple-500/50 text-purple-200 hover:text-white text-[11px] flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Start Cleaning</span>
                        </button>
                      )}
                      {b.status === 'in_progress' && (
                        <button
                          type="button"
                          onClick={() => onUpdateBookingStatus(b.id, 'quality_inspected')}
                          className="px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 hover:text-white text-[11px] flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Submit for QA</span>
                        </button>
                      )}
                      {b.status === 'quality_inspected' && (
                        <button
                          type="button"
                          onClick={() => onUpdateBookingStatus(b.id, 'completed')}
                          className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-[11px]"
                        >
                          Mark Completed
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenQualityAudit(b)}
                      className="text-amber-400 hover:text-amber-300 hover:underline text-[11px] flex items-center gap-1"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>{b.qaScore ? `QA Score: ${b.qaScore}%` : 'Perform QA Audit'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-serif-luxury font-bold text-white">
                Dispatch Cleaner Crew to Residence
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Select Client Residence *</label>
                <select
                  required
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:border-amber-500"
                >
                  <option value="">-- Choose registered estate --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} · {c.address} ({c.squareFootage.toLocaleString()} sq ft)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Service Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Arrival Window</label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:border-amber-500"
                  >
                    <option value="08:00 AM - 01:00 PM">08:00 AM - 01:00 PM</option>
                    <option value="08:30 AM - 01:30 PM">08:30 AM - 01:30 PM</option>
                    <option value="01:30 PM - 06:00 PM">01:30 PM - 06:00 PM</option>
                    <option value="Full Day Concierge">Full Day Concierge</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Service Tier</label>
                  <select
                    value={serviceTier}
                    onChange={(e) => setServiceTier(e.target.value as ServiceTier)}
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
                  <label className="block text-slate-400 mb-1">Concierge Crew</label>
                  <select
                    value={crew}
                    onChange={(e) => setCrew(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:border-amber-500"
                  >
                    <option value="Elena Rostova (Lead Concierge) & Team Alpha">Team Alpha (Elena Rostova Lead)</option>
                    <option value="Camille Laurent (Lead) & Team Beta">Team Beta (Camille Laurent Lead)</option>
                    <option value="Julian Cross & Specialist Detailers">Team Gamma (Julian Cross Lead)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Service Fee ($)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:border-amber-500 font-mono-numbers"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Est. Duration (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:border-amber-500 font-mono-numbers"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Access Notes & Gate Codes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:border-amber-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors"
                >
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

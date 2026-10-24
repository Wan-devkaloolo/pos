import React, { useState } from 'react';
import { QAInspection, Booking, QAChecklistCategory } from '../types';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  Star, 
  FileCheck2, 
  Sparkles, 
  ShieldCheck, 
  Plus, 
  UserCheck, 
  Clock, 
  MapPin, 
  MessageSquare
} from 'lucide-react';

interface QualityTrackingViewProps {
  inspections: QAInspection[];
  bookings: Booking[];
  onAddInspection: (inspection: QAInspection) => void;
  onUpdateInspection: (inspection: QAInspection) => void;
  activeBookingToInspect: Booking | null;
  onCloseInspectorModal: () => void;
}

const DEFAULT_AUDIT_CATEGORIES: QAChecklistCategory[] = [
  {
    category: '1. Foyer & Marble Reception',
    items: [
      { id: 'f-1', label: 'Streak-free high-gloss reflection under 5000K inspection lamp', passed: true },
      { id: 'f-2', label: 'Zero micro-dust along baseboards, wainscoting & pediments', passed: true },
      { id: 'f-3', label: 'Threshold & solid brass hardware polished and hand-buffed', passed: true },
    ],
  },
  {
    category: '2. Gourmet Chef’s Kitchen & Appliances',
    items: [
      { id: 'k-1', label: 'Sub-Zero & Wolf stainless grain uniform with zero watermarks', passed: true },
      { id: 'k-2', label: 'La Cornue range burners degreased and spark-tested', passed: true },
      { id: 'k-3', label: 'Under-cabinet kickplates sanitized & crumb-free', passed: true },
      { id: 'k-4', label: 'Exhaust hood filters ultrasonically cleaned and reseated', passed: true },
    ],
  },
  {
    category: '3. Primary Master Suite & Linens',
    items: [
      { id: 'm-1', label: 'Italian Egyptian cotton bedding crisp hospital corners and pressed', passed: true },
      { id: 'm-2', label: 'Walk-in dressing room mirrors zero smudge and cedar scent active', passed: true },
      { id: 'm-3', label: 'Under-bed HEPA sweep verified with laser beam test', passed: true },
    ],
  },
  {
    category: '4. Spa Bathrooms & Grout Detailing',
    items: [
      { id: 'b-1', label: 'Shower glass zero hard water spots or micro-film residue', passed: true },
      { id: 'b-2', label: 'Carrara / Calacatta marble sanitized with pH-neutral organic cleaner', passed: true },
      { id: 'b-3', label: 'Heated towel racks folded with Sovereign Touch signature roll', passed: true },
    ],
  },
  {
    category: '5. Ambient Air Quality & Finishing Touches',
    items: [
      { id: 'a-1', label: 'Sovereign Touch signature white tea & thyme ambient infusion', passed: true },
      { id: 'a-2', label: 'Fresh cut floral water replenished & stems trimmed', passed: true },
      { id: 'a-3', label: 'Security gate / lockbox re-secured according to estate instructions', passed: true },
    ],
  },
];

export const QualityTrackingView: React.FC<QualityTrackingViewProps> = ({
  inspections,
  bookings,
  onAddInspection,
  onUpdateInspection,
  activeBookingToInspect,
  onCloseInspectorModal,
}) => {
  const [selectedInspection, setSelectedInspection] = useState<QAInspection | null>(null);
  const [isAuditorOpen, setIsAuditorOpen] = useState(false);

  // Active audit state
  const [auditBooking, setAuditBooking] = useState<Booking | null>(activeBookingToInspect || bookings[0] || null);
  const [inspectorName, setInspectorName] = useState('Camille Laurent, Certified QA Lead');
  const [checklist, setChecklist] = useState<QAChecklistCategory[]>(DEFAULT_AUDIT_CATEGORIES);
  const [clientFeedback, setClientFeedback] = useState('Outstanding estate upkeep. Every surface shines flawlessly.');
  const [clientCSAT, setClientCSAT] = useState<number>(5);

  // Calculate live score from checklist
  const totalItems = checklist.reduce((sum, c) => sum + c.items.length, 0);
  const passedItems = checklist.reduce(
    (sum, c) => sum + c.items.filter((i) => i.passed).length,
    0
  );
  const calculatedScore = totalItems > 0 ? Math.round((passedItems / totalItems) * 100) : 100;

  const toggleChecklistItem = (catIndex: number, itemIndex: number) => {
    setChecklist((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy[catIndex].items[itemIndex].passed = !copy[catIndex].items[itemIndex].passed;
      return copy;
    });
  };

  const handleSaveAudit = () => {
    if (!auditBooking) return;

    const newQA: QAInspection = {
      id: `qa-${Date.now()}`,
      bookingId: auditBooking.id,
      clientName: auditBooking.clientName,
      address: auditBooking.address,
      serviceTier: auditBooking.serviceTier,
      inspectorName,
      date: new Date().toISOString().split('T')[0],
      overallScore: calculatedScore,
      status: calculatedScore >= 90 ? 'passed' : 're-clean_required',
      checklist,
      clientCSAT,
      clientFeedback,
      inspectorSignature: inspectorName,
      verifiedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    onAddInspection(newQA);
    setIsAuditorOpen(false);
    onCloseInspectorModal();
  };

  // Average score & CSAT metrics
  const avgScore = inspections.length > 0
    ? Math.round(inspections.reduce((sum, i) => sum + i.overallScore, 0) / inspections.length)
    : 98;

  const avgCSAT = inspections.length > 0
    ? (inspections.reduce((sum, i) => sum + (i.clientCSAT || 5), 0) / inspections.length).toFixed(1)
    : '5.0';

  const passedCount = inspections.filter((i) => i.status === 'passed' || i.status === 'client_reviewed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
            Quality Assurance & Service Standards
          </div>
          <h2 className="text-xl font-serif-luxury font-bold text-white mt-0.5">
            White-Glove Service Quality Tracking
          </h2>
          <div className="text-xs text-slate-400 mt-1">
            Room-by-room audit checklists, high-precision scorecards, and client CSAT ratings.
          </div>
        </div>

        <button
          onClick={() => {
            setAuditBooking(bookings[0] || null);
            setIsAuditorOpen(true);
          }}
          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Award className="w-4 h-4" />
          <span>Launch Quality Inspection Audit</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-4 bg-[#0f172a] border border-slate-800 rounded-xl">
          <span className="text-slate-400 text-xs block mb-1">Average QA Score</span>
          <div className="text-2xl font-bold text-amber-400 font-mono-numbers">
            {avgScore}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">90% required for sign-off</div>
        </div>

        <div className="p-4 bg-[#0f172a] border border-slate-800 rounded-xl">
          <span className="text-slate-400 text-xs block mb-1">Client Satisfaction (CSAT)</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono-numbers flex items-center gap-1">
            <span>{avgCSAT}</span>
            <Star className="w-4 h-4 fill-emerald-400 text-emerald-400" />
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Out of 5.0 stars across estates</div>
        </div>

        <div className="p-4 bg-[#0f172a] border border-slate-800 rounded-xl">
          <span className="text-slate-400 text-xs block mb-1">Certified Pass Rate</span>
          <div className="text-2xl font-bold text-white font-mono-numbers">
            {inspections.length > 0 ? Math.round((passedCount / inspections.length) * 100) : 100}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Zero unresolved defect rate</div>
        </div>

        <div className="p-4 bg-[#0f172a] border border-slate-800 rounded-xl">
          <span className="text-slate-400 text-xs block mb-1">Active Clean Warranty</span>
          <div className="text-2xl font-bold text-sky-400 font-mono-numbers">
            100%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">24h re-clean guarantee active</div>
        </div>
      </div>

      {/* Inspections History List */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-amber-400" />
            Verified Estate Quality Audits ({inspections.length})
          </h3>
          <span className="text-xs text-slate-400 font-mono-numbers">
            Standard: 5000K Inspection & Laser Particle Check
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inspections.map((qa) => (
            <div
              key={qa.id}
              onClick={() => setSelectedInspection(qa)}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{qa.clientName}</h4>
                  <div className="text-xs text-slate-400">{qa.address}</div>
                </div>

                <div className="text-right">
                  <div className={`text-base font-bold font-mono-numbers ${
                    qa.overallScore >= 90 ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {qa.overallScore}%
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono-numbers">{qa.date}</div>
                </div>
              </div>

              {/* Checklist pass count preview */}
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="text-amber-400">{qa.serviceTier}</span>
                <span>·</span>
                <span>Audited by {qa.inspectorName.split(',')[0]}</span>
              </div>

              {qa.clientFeedback && (
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-300 italic flex items-start gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>"{qa.clientFeedback}"</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: qa.clientCSAT || 5 }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-[11px] text-slate-400 ml-1">CSAT Rating</span>
                </div>

                <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  White-Glove Certified
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inspection Modal or Audit Runner */}
      {(isAuditorOpen || activeBookingToInspect) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative my-8 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                  Live White-Glove Field Inspection Audit
                </div>
                <h3 className="text-lg font-serif-luxury font-bold text-white mt-0.5">
                  Estate Quality Scorecard
                </h3>
                <div className="text-xs text-slate-400">
                  {auditBooking ? `${auditBooking.clientName} · ${auditBooking.address}` : 'Select a residence'}
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold font-mono-numbers text-amber-400">
                  {calculatedScore}%
                </div>
                <div className="text-[10px] text-slate-400">Current Audit Score</div>
              </div>
            </div>

            {/* Residence Selector if not locked */}
            {!activeBookingToInspect && (
              <div>
                <label className="block text-xs text-slate-400 mb-1">Select Active Clean to Inspect</label>
                <select
                  value={auditBooking?.id || ''}
                  onChange={(e) => {
                    const found = bookings.find((b) => b.id === e.target.value);
                    if (found) setAuditBooking(found);
                  }}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:border-amber-500"
                >
                  {bookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.clientName} · {b.serviceTier} ({b.date})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Inspector Name */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Lead Inspector Sign-off</label>
              <input
                type="text"
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:border-amber-500"
              />
            </div>

            {/* Checklist Category Sections */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2 border-t border-b border-slate-800 py-3">
              {checklist.map((cat, cIdx) => (
                <div key={cat.category} className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-xs font-semibold text-amber-300/90">{cat.category}</div>
                  <div className="space-y-1.5">
                    {cat.items.map((item, iIdx) => (
                      <div
                        key={item.id}
                        onClick={() => toggleChecklistItem(cIdx, iIdx)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all text-xs ${
                          item.passed
                            ? 'bg-emerald-950/30 border border-emerald-500/30 text-slate-200'
                            : 'bg-rose-950/30 border border-rose-500/30 text-rose-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={item.passed}
                            onChange={() => {}}
                            className="rounded accent-emerald-500"
                          />
                          <span>{item.label}</span>
                        </div>
                        <span className={`text-[10px] font-semibold ${item.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {item.passed ? 'PASSED' : 'NEEDS TOUCH-UP'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Client Feedback & CSAT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Client CSAT Rating (1-5)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setClientCSAT(star)}
                      className={`p-2 rounded-lg border transition-all ${
                        clientCSAT >= star
                          ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                          : 'bg-slate-900 border-slate-800 text-slate-600'
                      }`}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  ))}
                  <span className="font-mono-numbers text-slate-300 font-semibold">{clientCSAT}.0 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Estate Manager / Client Feedback</label>
                <input
                  type="text"
                  value={clientFeedback}
                  onChange={(e) => setClientFeedback(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:border-amber-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsAuditorOpen(false);
                  onCloseInspectorModal();
                }}
                className="px-3 py-2 text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAudit}
                className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-all"
              >
                Sign & Finalize White-Glove QA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

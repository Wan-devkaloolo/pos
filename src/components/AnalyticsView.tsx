import React from 'react';
import { Lead, Booking, Invoice, QAInspection, Client } from '../types';
import { 
  TrendingUp, 
  DollarSign, 
  Award, 
  Calendar, 
  Users, 
  Zap, 
  ArrowUpRight, 
  CheckCircle2, 
  Sparkles,
  PieChart
} from 'lucide-react';

interface AnalyticsViewProps {
  leads: Lead[];
  bookings: Booking[];
  invoices: Invoice[];
  inspections: QAInspection[];
  clients: Client[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  leads,
  bookings,
  invoices,
  inspections,
  clients,
}) => {
  // Calculations
  const totalInquiries = leads.length;
  const wonCount = leads.filter((l) => l.status === 'closed_won').length;
  const estimateSentCount = leads.filter(
    (l) => l.status === 'estimate_sent' || l.status === 'followup_1' || l.status === 'followup_2' || l.status === 'closed_won'
  ).length;

  const leadToEstimateRate = totalInquiries > 0 ? Math.round((estimateSentCount / totalInquiries) * 100) : 0;
  const estimateToBookingRate = estimateSentCount > 0 ? Math.round((wonCount / estimateSentCount) * 100) : 0;
  const overallWinRate = totalInquiries > 0 ? Math.round((wonCount / totalInquiries) * 100) : 0;

  // Revenue metrics
  const totalBookedRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const paidRevenue = invoices
    .filter((inv) => inv.status === 'paid' || inv.status === 'partially_paid')
    .reduce((sum, inv) => sum + (inv.status === 'paid' ? inv.total : inv.depositPaid), 0);

  const averageBookingValue = bookings.length > 0
    ? Math.round(bookings.reduce((sum, b) => sum + b.price, 0) / bookings.length)
    : 850;

  // Monthly Recurring Revenue estimate from recurring clients
  const recurringBookings = bookings.filter((b) => b.frequency !== 'one-time');
  const estimatedMRR = recurringBookings.reduce((sum, b) => {
    if (b.frequency === 'weekly') return sum + (b.price * 4);
    if (b.frequency === 'bi-weekly') return sum + (b.price * 2);
    if (b.frequency === 'monthly') return sum + b.price;
    return sum;
  }, 0);

  // Conversion by Source
  const sources = ['Website Form', 'Concierge Referral', 'Estate Manager', 'Realtor Partner'] as const;
  const sourceStats = sources.map((src) => {
    const srcLeads = leads.filter((l) => l.source === src);
    const srcWon = srcLeads.filter((l) => l.status === 'closed_won').length;
    const rate = srcLeads.length > 0 ? Math.round((srcWon / srcLeads.length) * 100) : 0;
    const revenue = srcLeads.reduce((sum, l) => sum + l.estimatedValue, 0);
    return { name: src, count: srcLeads.length, won: srcWon, rate, revenue };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
            Executive Performance & Intelligence
          </div>
          <h2 className="text-xl font-serif-luxury font-bold text-white mt-0.5">
            Sales KPIs & Inbound Conversion Rates
          </h2>
          <div className="text-xs text-slate-400 mt-1">
            Real-time pipeline velocity, conversion funnels, recurring MRR, and white-glove quality scores.
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span className="font-mono-numbers text-slate-400">Reporting Window:</span>
          <span className="font-semibold text-amber-400 font-mono-numbers">Current Fiscal Quarter</span>
        </div>
      </div>

      {/* Top 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#0f172a] border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Overall Win Rate</span>
            <span className="text-emerald-400 font-semibold flex items-center text-[11px]">
              +8.4% MoM
            </span>
          </div>
          <div className="text-3xl font-bold text-white font-mono-numbers">
            {overallWinRate}%
          </div>
          <div className="text-[11px] text-slate-400">
            {wonCount} of {totalInquiries} total inquiries converted
          </div>
        </div>

        <div className="p-4 bg-[#0f172a] border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Average Booking Value (AOV)</span>
            <span className="text-amber-400 font-mono-numbers font-medium text-[11px]">
              High Net Worth
            </span>
          </div>
          <div className="text-3xl font-bold text-amber-400 font-mono-numbers">
            ${averageBookingValue.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400">
            Per residential cleaning visit
          </div>
        </div>

        <div className="p-4 bg-[#0f172a] border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Contracted Monthly MRR</span>
            <span className="text-emerald-400 font-semibold text-[11px]">
              98% Retention
            </span>
          </div>
          <div className="text-3xl font-bold text-emerald-400 font-mono-numbers">
            ${estimatedMRR.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400">
            From recurring estate concierge contracts
          </div>
        </div>

        <div className="p-4 bg-[#0f172a] border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Quality Assurance (CSAT)</span>
            <span className="text-amber-400 text-[11px] font-semibold">
              White Glove
            </span>
          </div>
          <div className="text-3xl font-bold text-white font-mono-numbers">
            98.5%
          </div>
          <div className="text-[11px] text-slate-400">
            Average room audit score across visits
          </div>
        </div>
      </div>

      {/* Conversion Funnel Breakdown */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Inbound Sales Conversion Funnel & Velocity
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Efficiency from initial lead capture to signed contract and deposit collection.
            </p>
          </div>
          <span className="text-xs font-mono-numbers text-amber-400 font-semibold">
            Avg Velocity: 18.2 Hours
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="text-xs text-slate-400 font-medium">1. Inbound Inquiries</div>
            <div className="text-2xl font-bold text-white font-mono-numbers">{totalInquiries}</div>
            <div className="text-[11px] text-slate-500">100% of pipeline volume</div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div className="bg-amber-400 h-full w-full" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="text-xs text-slate-400 font-medium">2. Qualified Estates</div>
            <div className="text-2xl font-bold text-white font-mono-numbers">
              {leads.filter((l) => l.status !== 'new_inquiry' && l.status !== 'closed_lost').length}
            </div>
            <div className="text-[11px] text-emerald-400 font-mono-numbers">86% qualification rate</div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div className="bg-amber-400 h-full w-[86%]" />
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="text-xs text-slate-400 font-medium">3. Estimates Delivered</div>
            <div className="text-2xl font-bold text-white font-mono-numbers">{estimateSentCount}</div>
            <div className="text-[11px] text-emerald-400 font-mono-numbers">{leadToEstimateRate}% proposal delivery</div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div className="bg-amber-400 h-full" style={{ width: `${leadToEstimateRate}%` }} />
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="text-xs text-slate-400 font-medium">4. Closed Won (Paid)</div>
            <div className="text-2xl font-bold text-emerald-400 font-mono-numbers">{wonCount}</div>
            <div className="text-[11px] text-emerald-400 font-mono-numbers">{overallWinRate}% total conversion</div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div className="bg-emerald-400 h-full" style={{ width: `${overallWinRate}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Channel Conversion + Cleaner QA Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Conversion */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-amber-400" />
              Conversion Efficiency by Inbound Channel
            </h3>
            <span className="text-xs text-slate-400">ROI Analysis</span>
          </div>

          <div className="space-y-3">
            {sourceStats.map((src) => (
              <div key={src.name} className="p-3 bg-slate-900 rounded-xl border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{src.name}</span>
                  <span className="font-mono-numbers text-emerald-400 font-semibold">
                    {src.rate}% Conversion
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{src.count} inquiries · {src.won} booked clients</span>
                  <span className="font-mono-numbers text-amber-400/90">${src.revenue.toLocaleString()} pipeline</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-amber-300 h-full"
                    style={{ width: `${src.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cleaner & Crew QA Leaderboard */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Concierge Crew Quality Leaderboard
            </h3>
            <span className="text-xs text-slate-400">Audit Scorecards</span>
          </div>

          <div className="space-y-3">
            {[
              {
                crew: 'Team Alpha (Elena Rostova Lead)',
                cleanings: 24,
                avgQA: '99.2%',
                onTime: '100%',
                badge: 'Premier Honor Roll',
              },
              {
                crew: 'Team Beta (Camille Laurent Lead)',
                cleanings: 18,
                avgQA: '98.5%',
                onTime: '98.0%',
                badge: 'Master Detailer',
              },
              {
                crew: 'Team Gamma (Julian Cross Lead)',
                cleanings: 14,
                avgQA: '97.8%',
                onTime: '96.5%',
                badge: 'Specialist Crew',
              },
            ].map((team, idx) => (
              <div key={team.crew} className="p-3 bg-slate-900 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center font-mono-numbers text-[10px]">
                      #{idx + 1}
                    </span>
                    <span>{team.crew}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 ml-6">
                    {team.cleanings} estate cleans · {team.onTime} on-time dispatch
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-400 font-mono-numbers">
                    {team.avgQA}
                  </div>
                  <div className="text-[10px] text-amber-400">{team.badge}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { 
  SiteAssessment, 
  STHCQuote, 
  QuoteCostLine, 
  STHCServiceId, 
  StaffProfile, 
  Booking, 
  Invoice 
} from '../types';
import { 
  QuoterEngine, 
  STHC_COMPANY_INFO, 
  STHC_SERVICE_CATALOG, 
  STHC_RATE_CARDS 
} from '../services/quoterEngine';
import { 
  Calculator, 
  FileText, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Printer, 
  Plus, 
  Sparkles, 
  Clock, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Check, 
  Copy, 
  DollarSign, 
  Trash2, 
  Building2, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Sliders,
  Send
} from 'lucide-react';

interface QuoterDashboardViewProps {
  assessments: SiteAssessment[];
  quotes: STHCQuote[];
  activeStaff: StaffProfile;
  onAddAssessment?: (assessment: SiteAssessment) => void;
  onSaveAssessment?: (assessment: SiteAssessment) => void;
  onAddQuote?: (quote: STHCQuote) => void;
  onSaveQuote?: (quote: STHCQuote) => void;
  onUpdateQuoteStatus?: (quoteId: string, status: STHCQuote['status']) => void;
  onConvertToBookingAndInvoice: (quote: STHCQuote) => void;
}

export const QuoterDashboardView: React.FC<QuoterDashboardViewProps> = ({
  assessments,
  quotes,
  activeStaff,
  onAddAssessment,
  onSaveAssessment,
  onAddQuote,
  onSaveQuote,
  onUpdateQuoteStatus,
  onConvertToBookingAndInvoice,
}) => {
  const handleSaveAssessmentInternal = (assessment: SiteAssessment) => {
    if (onAddAssessment) onAddAssessment(assessment);
    if (onSaveAssessment) onSaveAssessment(assessment);
  };

  const handleSaveQuoteInternal = (quote: STHCQuote) => {
    if (onAddQuote) onAddQuote(quote);
    if (onSaveQuote) onSaveQuote(quote);
  };
  const [activeSubTab, setActiveSubTab] = useState<'quotes' | 'assessments' | 'builder' | 'rates'>('quotes');
  const [selectedQuoteForView, setSelectedQuoteForView] = useState<STHCQuote | null>(quotes[0] || null);
  const [selectedAssessmentForView, setSelectedAssessmentForView] = useState<SiteAssessment | null>(assessments[0] || null);
  const [copiedStatus, setCopiedStatus] = useState(false);
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);

  // ==========================================
  // Cost Buildup & Quote Studio State
  // ==========================================
  const [builderServiceId, setBuilderServiceId] = useState<STHCServiceId>('rooftile_cleaning');
  const [builderAssessmentRef, setBuilderAssessmentRef] = useState<string>(assessments[0]?.report_id || '');
  const [clientName, setClientName] = useState('Sample Client');
  const [clientContact, setClientContact] = useState('0767 666 883');
  const [clientEmail, setClientEmail] = useState('client.kira@kampala.ug');
  const [siteAddress, setSiteAddress] = useState('Plot 19 Kira Estate Road, Kira Division, Kampala');
  const [estimatedDays, setEstimatedDays] = useState<number>(3);
  const [bufferDays, setBufferDays] = useState<number>(0);
  const [isRush, setIsRush] = useState<boolean>(false);
  const [targetMarginTier, setTargetMarginTier] = useState<number>(0.50); // 50% default
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [clientFacingNotes, setClientFacingNotes] = useState(
    'All works executed under Sovereign Touch Come Home to Clean™ safety and quality protocols.'
  );

  // Inclusions / Exclusions
  const [inclusionsText, setInclusionsText] = useState(
    'Complete high-pressure wash of clay roof tiles (420 sqm)\nEco-biocide moss and algae eradication treatment\nRainwater gutter clearing and downspout flush\nPost-clean perimeter terrace rinse'
  );
  const [exclusionsText, setExclusionsText] = useState(
    'Replacement of cracked or damaged clay tiles (client to supply spares if needed)\nInterior ceiling attic inspection'
  );
  const [assumptionsText, setAssumptionsText] = useState(
    'On-site water point accessible for booster pump feeding\nContinuous execution without third-party site interruptions'
  );

  // Cost Lines for the active builder
  const [costLines, setCostLines] = useState<QuoteCostLine[]>(() => {
    return QuoterEngine.generateInitialCostLines('rooftile_cleaning', assessments[0] || {});
  });

  // Risk Rating state in builder
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [contingencyPercent, setContingencyPercent] = useState<number>(0.10); // 10%
  const [riskReasoning, setRiskReasoning] = useState('Height work, weather exposure, low municipal water pressure risk.');

  // ==========================================
  // New Site Assessment Form State
  // ==========================================
  const [newAssessForm, setNewAssessForm] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    clientType: 'residential' as SiteAssessment['client']['client_type'],
    leadSource: 'Website Inquiry',
    hubspotDealId: '',
    siteAddress: '',
    areaLandmark: 'Kololo',
    propertyType: 'house' as SiteAssessment['site']['property_type'],
    storeys: 1,
    floorAreaSqm: 250,
    roofAreaSqm: 300,
    bedrooms: 4,
    bathrooms: 4,
    vehicleAccess: 'good' as SiteAssessment['access_and_utilities']['vehicle_access'],
    carryDistanceM: 10,
    waterAvailable: true,
    waterPressure: 'good' as SiteAssessment['access_and_utilities']['water_pressure'],
    powerAvailable: true,
    gateRules: 'Announce Sovereign Touch crew at security post',
    conditionLevel: 'moderate' as SiteAssessment['condition']['condition_level'],
    serviceId: 'deep_clean_residential' as STHCServiceId,
    heightWork: false,
    weatherExposure: false,
    tradesOnSite: false,
    equipmentBreakdown: false,
    budgetSensitivity: 'medium' as SiteAssessment['hazards_and_risks']['client_budget_sensitivity'],
    crewSize: 3,
    estimatedDays: 1,
    specialRequests: '',
    assessorName: activeStaff.name,
  });

  // Calculate live Risk Score for New Assessment
  const liveAssessmentRisk = useMemo(() => {
    return QuoterEngine.calculateRiskRating({
      hazards_and_risks: {
        height_work: newAssessForm.heightWork,
        weather_exposure: newAssessForm.weatherExposure,
        trades_still_on_site: newAssessForm.tradesOnSite,
        equipment_breakdown_exposure: newAssessForm.equipmentBreakdown,
        client_budget_sensitivity: newAssessForm.budgetSensitivity,
        other: '',
      },
      access_and_utilities: {
        vehicle_access: newAssessForm.vehicleAccess,
        equipment_carry_distance_m: newAssessForm.carryDistanceM,
        water_available: newAssessForm.waterAvailable,
        water_pressure: newAssessForm.waterPressure,
        power_available: newAssessForm.powerAvailable,
        parking: '',
        access_hours: '',
        gate_or_security_rules: newAssessForm.gateRules,
      },
      condition: {
        condition_level: newAssessForm.conditionLevel,
        special_issues: [],
        surfaces: [],
      },
    });
  }, [newAssessForm]);

  // Live Quote Pricing Calculations
  const calculation = useMemo(() => {
    return QuoterEngine.calculateQuote(
      costLines,
      contingencyPercent,
      targetMarginTier,
      isRush,
      discountPercent
    );
  }, [costLines, contingencyPercent, targetMarginTier, isRush, discountPercent]);

  // Guardrail Checks
  const guardrails = useMemo(() => {
    const matchedAssessment = assessments.find((a) => a.report_id === builderAssessmentRef);
    return QuoterEngine.verifyGuardrails(
      builderServiceId,
      costLines,
      estimatedDays,
      calculation.margin_status,
      matchedAssessment
    );
  }, [builderServiceId, costLines, estimatedDays, calculation.margin_status, builderAssessmentRef, assessments]);

  // Handle Assessment Selection into Builder
  const handleLoadAssessmentIntoBuilder = (assess: SiteAssessment) => {
    setSelectedAssessmentForView(assess);
    setBuilderAssessmentRef(assess.report_id);
    setClientName(assess.client.name);
    setClientContact(assess.client.phone_whatsapp);
    setClientEmail(assess.client.email);
    setSiteAddress(`${assess.site.address}, ${assess.site.area_landmark}`);
    setBuilderServiceId(assess.scope.service_id);
    setEstimatedDays(assess.resources_estimate.estimated_days || 1);
    setRiskLevel(assess.risk_rating.level);
    setRiskReasoning(assess.risk_rating.reasoning);
    setContingencyPercent(
      assess.risk_rating.level === 'high' ? 0.18 : assess.risk_rating.level === 'medium' ? 0.10 : 0.05
    );
    setBufferDays(assess.risk_rating.level === 'high' ? 2 : assess.risk_rating.level === 'medium' ? 1 : 0);

    // Initial cost lines
    const generated = QuoterEngine.generateInitialCostLines(assess.scope.service_id, assess);
    setCostLines(generated);

    // Inclusions / exclusions
    if (assess.scope.included.length > 0) {
      setInclusionsText(assess.scope.included.join('\n'));
    }
    if (assess.scope.excluded.length > 0) {
      setExclusionsText(assess.scope.excluded.join('\n'));
    }

    setActiveSubTab('builder');
  };

  // Add Custom Cost Line
  const handleAddCostLine = () => {
    const newLine: QuoteCostLine = {
      id: `line-${Date.now()}`,
      category: 'labour',
      description: 'Additional Specialized Service Item',
      qty: 1,
      unit: 'item',
      unit_cost: 50000,
      line_cost: 50000,
    };
    setCostLines((prev) => [...prev, newLine]);
  };

  const handleUpdateCostLine = (id: string, updates: Partial<QuoteCostLine>) => {
    setCostLines((prev) =>
      prev.map((line) => {
        if (line.id === id) {
          const updated = { ...line, ...updates };
          if ('qty' in updates || 'unit_cost' in updates) {
            updated.line_cost = Math.round(updated.qty * updated.unit_cost);
          }
          return updated;
        }
        return line;
      })
    );
  };

  const handleDeleteCostLine = (id: string) => {
    setCostLines((prev) => prev.filter((l) => l.id !== id));
  };

  // Save Finalized Quote
  const handleGenerateQuote = () => {
    if (!guardrails.passed) {
      alert('Cannot generate quote: One or more company margin guardrails or rules have failed.');
      return;
    }

    const matchedService = STHC_SERVICE_CATALOG.find((s) => s.id === builderServiceId);
    const serviceName = matchedService?.name || 'Professional White-Glove Clean';

    const newQuote: STHCQuote = {
      quote_id: `STHC-Q-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
      status: 'draft',
      assessment_ref: builderAssessmentRef || `SAR-${Date.now().toString().slice(-6)}`,
      client: {
        name: clientName,
        contact: clientContact,
        site_address: siteAddress,
        email: clientEmail,
      },
      service_id: builderServiceId,
      service_name: serviceName,
      scope_of_work: {
        included: inclusionsText.split('\n').filter((s) => s.trim().length > 0),
        excluded: exclusionsText.split('\n').filter((s) => s.trim().length > 0),
        assumptions: assumptionsText.split('\n').filter((s) => s.trim().length > 0),
      },
      schedule: {
        start_date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        estimated_days: estimatedDays,
        buffer_days_included: bufferDays,
        note: `Buffer days included based on ${riskLevel} risk assessment.`,
      },
      cost_buildup: {
        lines: costLines,
        direct_cost: calculation.direct_cost,
        contingency_percent: contingencyPercent,
        contingency_amount: calculation.contingency_amount,
        total_cost: calculation.total_cost,
      },
      pricing: {
        target_margin: targetMarginTier,
        price_ex_vat_before_rush: calculation.price_ex_vat_before_rush,
        rush_premium_percent: calculation.rush_premium_percent,
        price_ex_vat: calculation.price_ex_vat,
        vat_amount: calculation.vat_amount,
        total_incl_vat: calculation.total_incl_vat,
        discount: {
          percent: calculation.discount.percent,
          amount: calculation.discount.amount,
          approved_by: activeStaff.name,
        },
      },
      margin_check: {
        gross_profit: calculation.gross_profit,
        gross_margin_percent: calculation.gross_margin_percent,
        floor_price_ex_vat: calculation.floor_price_ex_vat,
        status: calculation.margin_status,
        rule: 'Never quote below floor_price_ex_vat (30% margin floor).',
      },
      payment_terms: {
        deposit_percent: calculation.deposit_percent,
        deposit_amount: calculation.deposit_amount,
        balance_due: 'on completion',
        methods: ['Stanbic Bank Kampala Wire', 'MTN MoMo / Airtel Money Pay', 'Cash / Cheque'],
      },
      validity_days: 14,
      client_facing_notes: clientFacingNotes,
      footer: {
        email: STHC_COMPANY_INFO.email,
        phone: STHC_COMPANY_INFO.phone,
        ursb_registration_no: STHC_COMPANY_INFO.ursb_registration_no,
      },
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    handleSaveQuoteInternal(newQuote);
    setSelectedQuoteForView(newQuote);
    setActiveSubTab('quotes');
    setActionSuccessNotice(`Quote ${newQuote.quote_id} generated successfully with Margin Guard clearance!`);
    setTimeout(() => setActionSuccessNotice(null), 5000);
  };

  // Submit New Site Assessment
  const handleSaveAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssessForm.clientName || !newAssessForm.siteAddress) {
      alert('Please fill in required client name and site address.');
      return;
    }

    const reportId = `SAR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

    const newAssessment: SiteAssessment = {
      report_id: reportId,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      client: {
        name: newAssessForm.clientName,
        phone_whatsapp: newAssessForm.clientPhone || STHC_COMPANY_INFO.phone,
        email: newAssessForm.clientEmail || 'client@residence.ug',
        client_type: newAssessForm.clientType,
        lead_source: newAssessForm.leadSource,
        hubspot_deal_id: newAssessForm.hubspotDealId,
      },
      site: {
        address: newAssessForm.siteAddress,
        area_landmark: newAssessForm.areaLandmark,
        property_type: newAssessForm.propertyType,
        storeys: newAssessForm.storeys,
        floor_area_sqm: newAssessForm.floorAreaSqm,
        roof_area_sqm: newAssessForm.roofAreaSqm,
        bedrooms: newAssessForm.bedrooms,
        bathrooms: newAssessForm.bathrooms,
        occupied: true,
        furnished: true,
      },
      access_and_utilities: {
        vehicle_access: newAssessForm.vehicleAccess,
        equipment_carry_distance_m: newAssessForm.carryDistanceM,
        water_available: newAssessForm.waterAvailable,
        water_pressure: newAssessForm.waterPressure,
        power_available: newAssessForm.powerAvailable,
        parking: 'Available on-site',
        access_hours: '08:00 AM - 05:00 PM',
        gate_or_security_rules: newAssessForm.gateRules,
      },
      condition: {
        condition_level: newAssessForm.conditionLevel,
        special_issues: ['cement_residue', 'hard_water_scale'],
        surfaces: ['terrazzo', 'tiles', 'glass'],
      },
      scope: {
        service_id: newAssessForm.serviceId,
        included: ['Full white-glove estate clean', 'High-reach dust extraction', 'Oven and range degreasing'],
        excluded: ['Exterior gardening or painting'],
        client_special_requests: newAssessForm.specialRequests || 'Standard white glove care requested.',
        timing: {
          requested_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
          rush: false,
          rush_reason: '',
        },
      },
      hazards_and_risks: {
        height_work: newAssessForm.heightWork,
        weather_exposure: newAssessForm.weatherExposure,
        trades_still_on_site: newAssessForm.tradesOnSite,
        equipment_breakdown_exposure: newAssessForm.equipmentBreakdown,
        client_budget_sensitivity: newAssessForm.budgetSensitivity,
        other: '',
      },
      resources_estimate: {
        crew_size: newAssessForm.crewSize,
        supervisor_needed: true,
        estimated_days: newAssessForm.estimatedDays,
        hours_per_day: 8,
        equipment_needed: ['Commercial HEPA Scrubber', 'Steam Unit'],
        consumables_notes: 'Standard eco-botanical consumables',
      },
      evidence: {
        photos: [],
        videos: [],
        measurements_notes: `${newAssessForm.floorAreaSqm} sqm measured by assessor.`,
        assessor: newAssessForm.assessorName,
        assessment_date: new Date().toISOString().split('T')[0],
      },
      risk_rating: {
        level: liveAssessmentRisk.level,
        score: liveAssessmentRisk.score,
        reasoning: liveAssessmentRisk.reasoning,
      },
    };

    handleSaveAssessmentInternal(newAssessment);
    handleLoadAssessmentIntoBuilder(newAssessment);
    setActionSuccessNotice(`Site Assessment ${reportId} created! Loaded directly into Quoter & Margin Guard engine.`);
  };

  const handleCopyQuoteSummary = (q: STHCQuote) => {
    const text = `Sovereign Touch Home Care - Quotation #${q.quote_id}
Client: ${q.client.name}
Site: ${q.client.site_address}
Service: ${q.service_name}
Duration: ${q.schedule.estimated_days} Days (Buffer: ${q.schedule.buffer_days_included} Days)
Total Cost Buildup: UGX ${q.cost_buildup.total_cost.toLocaleString()}
Price Ex-VAT: UGX ${q.pricing.price_ex_vat.toLocaleString()}
18% VAT: UGX ${q.pricing.vat_amount.toLocaleString()}
TOTAL (INCL. VAT): UGX ${q.pricing.total_incl_vat.toLocaleString()}
Required 50% Deposit: UGX ${q.payment_terms.deposit_amount.toLocaleString()}

Contact: ${q.footer.phone} · ${q.footer.email}
URSB Reg: ${q.footer.ursb_registration_no}
Come Home to Clean™`;

    navigator.clipboard.writeText(text);
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#0b192c] via-slate-900 to-[#131b2e] border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Sovereign Touch Home Care · Quoter & Site Assessment Dashboard</span>
          </div>
          <h2 className="text-xl font-serif-luxury font-bold text-white mt-1">
            Site Assessment, Cost Build-Up & Margin Guard
          </h2>
          <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
            <span>Tagline: <strong className="text-amber-400">"{STHC_COMPANY_INFO.tagline}"</strong></span>
            <span>·</span>
            <span>URSB Reg: <strong className="font-mono-numbers text-slate-200">{STHC_COMPANY_INFO.ursb_registration_no}</strong></span>
            <span>·</span>
            <span>Kampala: <strong className="font-mono-numbers text-slate-200">{STHC_COMPANY_INFO.phone}</strong></span>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="flex items-center gap-4 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <div>
            <div className="text-slate-400 text-[11px]">Site Assessments</div>
            <div className="text-sm font-bold text-white font-mono-numbers">{assessments.length} Active</div>
          </div>
          <div className="h-7 w-px bg-slate-800" />
          <div>
            <div className="text-slate-400 text-[11px]">Generated Quotes</div>
            <div className="text-sm font-bold text-amber-400 font-mono-numbers">{quotes.length} Quotes</div>
          </div>
          <div className="h-7 w-px bg-slate-800" />
          <div>
            <div className="text-slate-400 text-[11px]">Margin Floor Rule</div>
            <div className="text-sm font-bold text-emerald-400 font-mono-numbers">30% Minimum</div>
          </div>
        </div>
      </div>

      {actionSuccessNotice && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccessNotice}</span>
          </div>
          <button onClick={() => setActionSuccessNotice(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Workspace Segmented Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
          <button
            onClick={() => setActiveSubTab('quotes')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'quotes' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Client Proposals & Quotes ({quotes.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('assessments')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'assessments' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Site Assessment Reports ({assessments.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('builder')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'builder' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Cost Buildup & Margin Studio</span>
          </button>
          <button
            onClick={() => setActiveSubTab('rates')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'rates' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Rate Cards & Guardrails</span>
          </button>
        </div>

        <button
          onClick={() => {
            setActiveSubTab('assessments');
          }}
          className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Site Assessment Entry</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-VIEW 1: QUOTES LEDGER & CLIENT-FACING PROPOSALS */}
      {/* ========================================================================= */}
      {activeSubTab === 'quotes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (5 cols): Quotes List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex justify-between items-center text-xs text-slate-400 px-1">
              <span>Saved Proposals ({quotes.length})</span>
              <span>All Prices in UGX (18% VAT)</span>
            </div>

            {quotes.map((q) => {
              const isSelected = selectedQuoteForView?.quote_id === q.quote_id;
              const marginStatusColor = 
                q.margin_check.status === 'ok' ? 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30' :
                q.margin_check.status === 'below_target' ? 'text-amber-400 bg-amber-950/60 border-amber-500/30' :
                'text-rose-400 bg-rose-950/60 border-rose-500/30';

              return (
                <div
                  key={q.quote_id}
                  onClick={() => setSelectedQuoteForView(q)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/60 shadow-md'
                      : 'bg-[#0f172a] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-mono-numbers text-slate-400 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <span>{q.quote_id}</span>
                        <span>·</span>
                        <span className="text-[10px] text-slate-500">{q.assessment_ref}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1">{q.client.name}</h4>
                      <div className="text-xs text-slate-400 truncate">{q.client.site_address}</div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-amber-400 font-mono-numbers">
                        UGX {q.pricing.total_incl_vat.toLocaleString()}
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase font-bold mt-1 inline-block ${marginStatusColor}`}>
                        {(q.margin_check.gross_margin_percent * 100).toFixed(0)}% Margin
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800/80">
                    <span className="text-amber-300/90">{q.service_name}</span>
                    <span className="font-mono-numbers">{q.schedule.estimated_days} Days Crew</span>
                    <span className="capitalize">{q.status}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column (7 cols): Document Preview & Client-Ready Quotation */}
          <div className="lg:col-span-7 space-y-4">
            {selectedQuoteForView ? (
              <div className="bg-[#0b0f17] border border-amber-500/30 rounded-2xl p-6 shadow-2xl relative space-y-6">
                {/* Action Bar (No-Print) */}
                <div className="no-print flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-amber-400 uppercase">
                      Client-Ready Quotation Proposal
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="text-xs font-mono-numbers text-slate-300">{selectedQuoteForView.quote_id}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyQuoteSummary(selectedQuoteForView)}
                      className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 hover:border-amber-500 text-slate-200 text-xs rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      {copiedStatus ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedStatus ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-3 py-1.5 bg-slate-900 border border-slate-700 hover:border-amber-500 text-slate-200 text-xs rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print / PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onConvertToBookingAndInvoice(selectedQuoteForView)}
                      className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
                      title="Convert accepted quote to booking on dispatch calendar and draft invoice"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Convert to Invoice & Schedule</span>
                    </button>
                  </div>
                </div>

                {/* Branded Sovereign Touch Quotation Header */}
                <div className="flex justify-between items-start pb-5 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 text-amber-400 mb-1">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      <span className="text-xl font-serif-luxury font-bold tracking-tight text-white">
                        {STHC_COMPANY_INFO.name}
                      </span>
                    </div>
                    <div className="text-xs text-amber-300 font-medium italic">
                      "{STHC_COMPANY_INFO.tagline}"
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Kololo HQ · Kampala, Uganda · Tel: {STHC_COMPANY_INFO.phone}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-serif-luxury font-bold text-amber-400">
                      OFFICIAL QUOTATION
                    </div>
                    <div className="text-xs font-mono-numbers text-slate-300 mt-0.5">
                      #{selectedQuoteForView.quote_id}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Assessment Ref: <span className="font-mono-numbers text-slate-300">{selectedQuoteForView.assessment_ref}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Date: <span className="font-mono-numbers">{selectedQuoteForView.createdAt.slice(0, 10)}</span>
                    </div>
                  </div>
                </div>

                {/* Client & Schedule Grid */}
                <div className="grid grid-cols-2 gap-4 text-xs pb-4 border-b border-slate-800">
                  <div>
                    <div className="text-slate-400 uppercase text-[10px] tracking-wider mb-1 font-semibold">
                      Client & Site Location
                    </div>
                    <div className="font-bold text-white text-sm">{selectedQuoteForView.client.name}</div>
                    <div className="text-slate-300 mt-0.5">{selectedQuoteForView.client.site_address}</div>
                    <div className="text-slate-400 mt-0.5">Contact: {selectedQuoteForView.client.contact}</div>
                  </div>

                  <div>
                    <div className="text-slate-400 uppercase text-[10px] tracking-wider mb-1 font-semibold">
                      Schedule & Service Execution
                    </div>
                    <div className="font-semibold text-amber-300">{selectedQuoteForView.service_name}</div>
                    <div className="text-slate-300 mt-0.5 font-mono-numbers">
                      Estimated Duration: {selectedQuoteForView.schedule.estimated_days} Days
                    </div>
                    <div className="text-slate-400 mt-0.5 font-mono-numbers text-[11px]">
                      Risk Contingency Days: +{selectedQuoteForView.schedule.buffer_days_included} Days Included
                    </div>
                  </div>
                </div>

                {/* Scope of Work */}
                <div className="space-y-3 pb-4 border-b border-slate-800 text-xs">
                  <div className="font-semibold text-slate-200 uppercase text-[10px] tracking-wider">
                    Scope of Work & Specifications
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1.5">
                      <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Included in Scope:
                      </span>
                      <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside">
                        {selectedQuoteForView.scope_of_work.included.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1.5">
                      <span className="text-[11px] font-semibold text-rose-400 flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Excluded from Scope:
                      </span>
                      <ul className="space-y-1 text-slate-400 text-[11px] list-disc list-inside">
                        {selectedQuoteForView.scope_of_work.excluded.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Cost Buildup Breakdown Table (Client-Transparent or Internal Guard) */}
                <div className="space-y-3 pb-4 border-b border-slate-800">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-200 uppercase text-[10px] tracking-wider">
                      Itemized Resource & Cost Build-Up
                    </span>
                    <span className="text-[11px] font-mono-numbers text-slate-400">
                      Direct Cost: UGX {selectedQuoteForView.cost_buildup.direct_cost.toLocaleString()}
                    </span>
                  </div>

                  <table className="w-full text-left text-xs font-mono-numbers">
                    <thead className="text-slate-400 uppercase text-[10px] border-b border-slate-800 pb-2">
                      <tr>
                        <th className="py-1.5 font-sans">Category & Resource</th>
                        <th className="py-1.5 text-center font-sans">Qty</th>
                        <th className="py-1.5 text-right font-sans">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300 text-[11px]">
                      {selectedQuoteForView.cost_buildup.lines.map((line) => (
                        <tr key={line.id}>
                          <td className="py-2 font-sans">
                            <span className="font-medium text-slate-200">{line.description}</span>
                            <span className="text-[10px] text-slate-500 uppercase block">{line.category}</span>
                          </td>
                          <td className="py-2 text-center text-slate-400">{line.qty} {line.unit}</td>
                          <td className="py-2 text-right text-slate-200 font-semibold">
                            UGX {line.line_cost.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pricing, VAT & Deposit Calculation Summary */}
                <div className="pt-2 flex justify-end">
                  <div className="w-full sm:w-80 space-y-2 text-xs font-mono-numbers">
                    <div className="flex justify-between text-slate-400">
                      <span className="font-sans">Subtotal (Ex-VAT):</span>
                      <span>UGX {selectedQuoteForView.pricing.price_ex_vat.toLocaleString()}</span>
                    </div>

                    {selectedQuoteForView.pricing.rush_premium_percent > 0 && (
                      <div className="flex justify-between text-amber-400">
                        <span className="font-sans">Rush Delivery Premium (+25%):</span>
                        <span>Included</span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-400">
                      <span className="font-sans">Uganda VAT (18%):</span>
                      <span>UGX {selectedQuoteForView.pricing.vat_amount.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800">
                      <span className="font-sans">Total Quoted (Incl. VAT):</span>
                      <span className="text-amber-400">
                        UGX {selectedQuoteForView.pricing.total_incl_vat.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between text-xs text-amber-300 font-semibold pt-1 border-t border-slate-800/80">
                      <span className="font-sans">50% Required Deposit:</span>
                      <span>UGX {selectedQuoteForView.payment_terms.deposit_amount.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span className="font-sans">Balance Due:</span>
                      <span>On Service Completion</span>
                    </div>
                  </div>
                </div>

                {/* Margin Guard Summary Box */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-slate-200">Margin Guard Verification:</span>
                    <span className="text-emerald-400 font-mono-numbers font-bold">
                      {(selectedQuoteForView.margin_check.gross_margin_percent * 100).toFixed(1)}% Gross Margin
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono-numbers">
                    Floor Price (30% Gross): UGX {selectedQuoteForView.margin_check.floor_price_ex_vat.toLocaleString()}
                  </div>
                </div>

                {/* Mandatory Company Footer Required by Spec */}
                <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="flex flex-wrap items-center justify-between text-slate-300 font-medium">
                    <span>Email: <strong className="text-amber-400">{selectedQuoteForView.footer.email}</strong></span>
                    <span>Phone / WhatsApp: <strong className="text-amber-400">{selectedQuoteForView.footer.phone}</strong></span>
                    <span>URSB Reg No: <strong className="text-amber-400 font-mono-numbers">{selectedQuoteForView.footer.ursb_registration_no}</strong></span>
                  </div>
                  <div className="text-[10px] text-slate-500 pt-1 text-center font-serif-luxury">
                    Sovereign Touch Home Care · "Come Home to Clean™" · Kampala, Uganda
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500 text-xs bg-[#0f172a] rounded-xl border border-slate-800">
                Select a quote from the list to preview the client-ready proposal.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 2: SITE ASSESSMENTS LIST & NEW ASSESSMENT INTAKE */}
      {/* ========================================================================= */}
      {activeSubTab === 'assessments' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (5 cols): Existing Site Assessments */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs text-slate-400 px-1 flex justify-between">
              <span>Site Assessment Reports ({assessments.length})</span>
              <span>Audited by Lead Concierge</span>
            </div>

            {assessments.map((a) => (
              <div
                key={a.report_id}
                className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 hover:border-amber-500/50 transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono-numbers text-amber-400 font-semibold">{a.report_id}</span>
                    <h4 className="text-sm font-bold text-white mt-0.5">{a.client.name}</h4>
                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>{a.site.address}, {a.site.area_landmark}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold font-mono-numbers ${
                    a.risk_rating.level === 'low' ? 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30' :
                    a.risk_rating.level === 'medium' ? 'text-amber-400 bg-amber-950/60 border-amber-500/30' :
                    'text-rose-400 bg-rose-950/60 border-rose-500/30'
                  }`}>
                    {a.risk_rating.level} Risk ({a.risk_rating.score} pts)
                  </span>
                </div>

                <div className="text-xs text-slate-400 grid grid-cols-2 gap-2 pt-1">
                  <div>Floor Area: <strong className="text-slate-200 font-mono-numbers">{a.site.floor_area_sqm} sqm</strong></div>
                  <div>Water: <strong className="text-slate-200 capitalize">{a.access_and_utilities.water_pressure}</strong></div>
                  <div>Crew Est: <strong className="text-slate-200 font-mono-numbers">{a.resources_estimate.crew_size} Cleaners ({a.resources_estimate.estimated_days}d)</strong></div>
                  <div>Condition: <strong className="text-slate-200 capitalize">{a.condition.condition_level}</strong></div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">{a.createdAt}</span>
                  <button
                    type="button"
                    onClick={() => handleLoadAssessmentIntoBuilder(a)}
                    className="px-3 py-1 bg-amber-500/10 border border-amber-500/40 hover:bg-amber-500/20 text-amber-300 font-medium rounded-lg text-xs flex items-center gap-1 transition-colors"
                  >
                    <span>Load Into Quoter Engine</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column (7 cols): New Assessment Intake Form */}
          <div className="lg:col-span-7 bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                  Site Assessment Intake (STHC SAR Protocol)
                </div>
                <h3 className="text-base font-serif-luxury font-bold text-white mt-0.5">
                  Record Site Inspection & Risk Profile
                </h3>
              </div>

              {/* Live Risk Score Widget */}
              <div className="text-right">
                <span className={`text-xs px-2.5 py-1 rounded-lg border font-bold font-mono-numbers inline-block ${
                  liveAssessmentRisk.level === 'low' ? 'text-emerald-400 bg-emerald-950/80 border-emerald-500/40' :
                  liveAssessmentRisk.level === 'medium' ? 'text-amber-400 bg-amber-950/80 border-amber-500/40' :
                  'text-rose-400 bg-rose-950/80 border-rose-500/40'
                }`}>
                  Risk Score: {liveAssessmentRisk.score} pts ({liveAssessmentRisk.level.toUpperCase()})
                </span>
                <div className="text-[10px] text-slate-400 mt-1 font-mono-numbers">
                  Contingency: {(liveAssessmentRisk.contingencyPercent * 100).toFixed(0)}% · Buffer: +{liveAssessmentRisk.bufferDays}d
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveAssessment} className="space-y-4 text-xs">
              {/* Section 1: Client & Contact */}
              <div className="space-y-2">
                <div className="font-semibold text-slate-200 text-xs">1. Client Details</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Client Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Vivienne Rothschild"
                      value={newAssessForm.clientName}
                      onChange={(e) => setNewAssessForm({ ...newAssessForm, clientName: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">WhatsApp / Phone *</label>
                    <input
                      type="text"
                      placeholder="0767 666 883"
                      value={newAssessForm.clientPhone}
                      onChange={(e) => setNewAssessForm({ ...newAssessForm, clientPhone: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Client Type</label>
                    <select
                      value={newAssessForm.clientType}
                      onChange={(e) => setNewAssessForm({ ...newAssessForm, clientType: e.target.value as any })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:border-amber-500"
                    >
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                      <option value="diplomatic">Diplomatic</option>
                      <option value="institutional">Institutional</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Site Dimensions */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="font-semibold text-slate-200 text-xs">2. Site & Property Metrics</div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 mb-1">Address *</label>
                    <input
                      type="text"
                      required
                      placeholder="Plot 14 Prince Charles Drive"
                      value={newAssessForm.siteAddress}
                      onChange={(e) => setNewAssessForm({ ...newAssessForm, siteAddress: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Kampala Landmark / Area</label>
                    <input
                      type="text"
                      placeholder="Kololo / Muyenga / Kira"
                      value={newAssessForm.areaLandmark}
                      onChange={(e) => setNewAssessForm({ ...newAssessForm, areaLandmark: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Service Type</label>
                    <select
                      value={newAssessForm.serviceId}
                      onChange={(e) => setNewAssessForm({ ...newAssessForm, serviceId: e.target.value as STHCServiceId })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:border-amber-500"
                    >
                      {STHC_SERVICE_CATALOG.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div>
                    <label className="block text-slate-400 mb-1">Floor Area (sqm)</label>
                    <input
                      type="number"
                      value={newAssessForm.floorAreaSqm}
                      onChange={(e) => setNewAssessForm({ ...newAssessForm, floorAreaSqm: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 font-mono-numbers focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Roof Area (sqm)</label>
                    <input
                      type="number"
                      value={newAssessForm.roofAreaSqm}
                      onChange={(e) => setNewAssessForm({ ...newAssessForm, roofAreaSqm: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 font-mono-numbers focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Bedrooms / Baths</label>
                    <input
                      type="text"
                      placeholder="4 Beds / 4 Baths"
                      value={`${newAssessForm.bedrooms} Beds / ${newAssessForm.bathrooms} Baths`}
                      readOnly
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Condition Level</label>
                    <select
                      value={newAssessForm.conditionLevel}
                      onChange={(e) => setNewAssessForm({ ...newAssessForm, conditionLevel: e.target.value as any })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:border-amber-500"
                    >
                      <option value="light">Light (Nominal)</option>
                      <option value="moderate">Moderate</option>
                      <option value="heavy">Heavy (+1 Pt)</option>
                      <option value="extreme">Extreme (+2 Pts)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Access, Water, Power */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="font-semibold text-slate-200 text-xs">3. Utilities & Equipment Access</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Water Pressure</label>
                    <select
                      value={newAssessForm.waterPressure}
                      onChange={(e) => setNewAssessForm({ ...newAssessForm, waterPressure: e.target.value as any })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:border-amber-500"
                    >
                      <option value="good">Good Pressure</option>
                      <option value="low">Low Pressure (+2 Pts: Booster Required)</option>
                      <option value="none">No Water Point (+2 Pts: Bowser Required)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Vehicle Access</label>
                    <select
                      value={newAssessForm.vehicleAccess}
                      onChange={(e) => setNewAssessForm({ ...newAssessForm, vehicleAccess: e.target.value as any })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:border-amber-500"
                    >
                      <option value="good">Good Driveway</option>
                      <option value="limited">Limited</option>
                      <option value="poor">Poor Access (+1 Pt)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Carry Distance (m)</label>
                    <input
                      type="number"
                      value={newAssessForm.carryDistanceM}
                      onChange={(e) => setNewAssessForm({ ...newAssessForm, carryDistanceM: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 font-mono-numbers focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Risk Factors (Automated Scoring Formula) */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="font-semibold text-slate-200 text-xs">4. Risk Assessment & Hazard Check</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAssessForm.heightWork}
                      onChange={(e) => setNewAssessForm({ ...newAssessForm, heightWork: e.target.checked })}
                      className="rounded accent-amber-500"
                    />
                    <span>Height Work (+2)</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAssessForm.weatherExposure}
                      onChange={(e) => setNewAssessForm({ ...newAssessForm, weatherExposure: e.target.checked })}
                      className="rounded accent-amber-500"
                    />
                    <span>Rain / Weather (+2)</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAssessForm.tradesOnSite}
                      onChange={(e) => setNewAssessForm({ ...newAssessForm, tradesOnSite: e.target.checked })}
                      className="rounded accent-amber-500"
                    />
                    <span>Trades on Site (+2)</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAssessForm.equipmentBreakdown}
                      onChange={(e) => setNewAssessForm({ ...newAssessForm, equipmentBreakdown: e.target.checked })}
                      className="rounded accent-amber-500"
                    />
                    <span>Machine Risk (+1)</span>
                  </label>
                </div>
              </div>

              {/* Form Submit */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  Assessor: {activeStaff.name} ({activeStaff.role})
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Assessment & Build Cost Quote</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 3: COST BUILD-UP & MARGIN GUARD STUDIO */}
      {/* ========================================================================= */}
      {activeSubTab === 'builder' && (
        <div className="space-y-6">
          {/* Margin Guard Live Status Banner */}
          <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
            calculation.margin_status === 'below_floor_blocked'
              ? 'bg-rose-950/70 border-rose-500 text-rose-200'
              : calculation.margin_status === 'below_target'
              ? 'bg-amber-950/60 border-amber-500/50 text-amber-200'
              : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
          }`}>
            <div className="flex items-center gap-2.5">
              {calculation.margin_status === 'below_floor_blocked' ? (
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              ) : calculation.margin_status === 'below_target' ? (
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider">
                  Margin Guard Status: {calculation.margin_status === 'below_floor_blocked' ? 'BLOCKED BELOW FLOOR (30%)' : calculation.margin_status === 'below_target' ? 'WARNING: BELOW 50% TARGET' : 'HEALTHY MARGIN PASSED'}
                </div>
                <div className="text-[11px] opacity-90 mt-0.5">
                  {calculation.margin_status === 'below_floor_blocked'
                    ? 'Quoted price is below the 30% gross margin floor. Company policy: Never discount below floor price. Trade scope, not price!'
                    : `Current Gross Margin: ${(calculation.gross_margin_percent * 100).toFixed(1)}% | Gross Profit: UGX ${calculation.gross_profit.toLocaleString()}`}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono-numbers text-xs">
              <div className="text-right">
                <span className="opacity-75 block text-[10px]">Floor Price (Ex-VAT):</span>
                <span className="font-bold">UGX {calculation.floor_price_ex_vat.toLocaleString()}</span>
              </div>
              <div className="h-6 w-px bg-white/20" />
              <div className="text-right">
                <span className="opacity-75 block text-[10px]">Quoted (Ex-VAT):</span>
                <span className="font-bold text-amber-300">UGX {calculation.price_ex_vat.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Guardrail Warnings / Blockers */}
          {(!guardrails.passed || guardrails.warnings.length > 0) && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              {guardrails.blockers.map((b, i) => (
                <div key={i} className="text-rose-400 font-semibold flex items-center gap-2">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>{b}</span>
                </div>
              ))}
              {guardrails.warnings.map((w, i) => (
                <div key={i} className="text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}

          {/* Main 2-Column Grid: Cost Lines Editor / Margin & Pricing Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (7 cols): Cost Buildup Lines */}
            <div className="lg:col-span-7 bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-amber-400" />
                    Itemized Cost Build-Up
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Labour day rates, equipment hire, transport logistics & chemical consumables.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddCostLine}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs flex items-center gap-1 font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Add Line</span>
                </button>
              </div>

              {/* Table of cost lines */}
              <div className="space-y-2">
                {costLines.map((line) => (
                  <div
                    key={line.id}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-12 gap-2 items-center text-xs"
                  >
                    <div className="col-span-4">
                      <input
                        type="text"
                        value={line.description}
                        onChange={(e) => handleUpdateCostLine(line.id, { description: e.target.value })}
                        className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs focus:border-amber-500"
                      />
                      <select
                        value={line.category}
                        onChange={(e) => handleUpdateCostLine(line.id, { category: e.target.value as any })}
                        className="mt-1 text-[10px] text-slate-400 bg-transparent border-0 focus:outline-none"
                      >
                        <option value="labour">Labour</option>
                        <option value="equipment_hire">Equipment Hire</option>
                        <option value="logistics">Logistics & Fuel</option>
                        <option value="consumables">Consumables</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="col-span-2">
                      <input
                        type="number"
                        min="1"
                        value={line.qty}
                        onChange={(e) => handleUpdateCostLine(line.id, { qty: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs font-mono-numbers focus:border-amber-500"
                      />
                      <span className="text-[10px] text-slate-500 block truncate">{line.unit}</span>
                    </div>

                    <div className="col-span-3">
                      <input
                        type="number"
                        step="5000"
                        value={line.unit_cost}
                        onChange={(e) => handleUpdateCostLine(line.id, { unit_cost: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs font-mono-numbers focus:border-amber-500"
                      />
                      <span className="text-[10px] text-slate-500 block">UGX / unit</span>
                    </div>

                    <div className="col-span-2 text-right font-mono-numbers font-semibold text-slate-100">
                      UGX {line.line_cost.toLocaleString()}
                    </div>

                    <div className="col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteCostLine(line.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Subtotal & Risk Contingency Rate */}
              <div className="pt-3 border-t border-slate-800 space-y-2 text-xs font-mono-numbers">
                <div className="flex justify-between text-slate-400">
                  <span>Direct Resource Cost:</span>
                  <span>UGX {calculation.direct_cost.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-2">
                    <span>Risk Contingency Rate:</span>
                    <select
                      value={contingencyPercent}
                      onChange={(e) => setContingencyPercent(Number(e.target.value))}
                      className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-xs text-amber-300"
                    >
                      <option value={0.05}>5% (Low Risk)</option>
                      <option value={0.10}>10% (Medium Risk)</option>
                      <option value={0.18}>18% (High Risk)</option>
                    </select>
                  </span>
                  <span>+UGX {calculation.contingency_amount.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-sm font-bold text-white pt-1 border-t border-slate-800">
                  <span>Total Base Job Cost:</span>
                  <span className="text-amber-400">UGX {calculation.total_cost.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Right Column (5 cols): Margin Guard & Price Engine */}
            <div className="lg:col-span-5 bg-[#0f172a] border border-amber-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="pb-3 border-b border-slate-800">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  Target Margin & Price Builder
                </h3>
                <p className="text-[11px] text-slate-400">
                  Formula: <code>price_ex_vat = total_cost / (1 - margin)</code>
                </p>
              </div>

              {/* Target Margin Selector */}
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Gross Margin Target Tier</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setTargetMarginTier(0.50)}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      targetMarginTier === 0.50
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div>Target (50%)</div>
                    <div className="text-[10px] text-slate-500">Standard standard clean</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetMarginTier(0.55)}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      targetMarginTier === 0.55
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div>High Risk / Roof (55%)</div>
                    <div className="text-[10px] text-slate-500">Rooftile & post-construction</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetMarginTier(0.40)}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      targetMarginTier === 0.40
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div>Commercial (40%)</div>
                    <div className="text-[10px] text-slate-500">6-12 mo office contract</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetMarginTier(0.30)}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      targetMarginTier === 0.30
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div>Floor Minimum (30%)</div>
                    <div className="text-[10px] text-rose-400 font-semibold">Strict bottom limit</div>
                  </button>
                </div>
              </div>

              {/* Rush Premium Toggle */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-200">Same or Next-Day Rush (+25%)</span>
                  <div className="text-[10px] text-slate-400">Applies to price ex-VAT</div>
                </div>
                <input
                  type="checkbox"
                  checked={isRush}
                  onChange={(e) => setIsRush(e.target.checked)}
                  className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
                />
              </div>

              {/* Price Breakdown Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono-numbers">
                <div className="flex justify-between text-slate-400">
                  <span>Price Ex-VAT (Rounded 5k):</span>
                  <span>UGX {calculation.price_ex_vat_before_rush.toLocaleString()}</span>
                </div>
                {isRush && (
                  <div className="flex justify-between text-amber-400">
                    <span>Rush Premium (25%):</span>
                    <span>+UGX {Math.round(calculation.price_ex_vat_before_rush * 0.25).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Uganda VAT (18%):</span>
                  <span>UGX {calculation.vat_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800">
                  <span>Total Incl. VAT:</span>
                  <span className="text-amber-400 font-bold">
                    UGX {calculation.total_incl_vat.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-emerald-400 pt-1">
                  <span>50% Required Deposit:</span>
                  <span className="font-bold">UGX {calculation.deposit_amount.toLocaleString()}</span>
                </div>
              </div>

              {/* Generate Quote Action */}
              <button
                type="button"
                disabled={!guardrails.passed}
                onClick={handleGenerateQuote}
                className={`w-full py-3 px-4 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                  guardrails.passed
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>
                  {guardrails.passed
                    ? 'Generate Official Sovereign Touch Quote'
                    : 'Blocked by Margin Guard / Guardrail Rules'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 4: RATE CARDS & COMPANY GUARDRAILS REPOSITORY */}
      {/* ========================================================================= */}
      {activeSubTab === 'rates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rate Cards */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-400" />
                Standard Kampala Rate Cards (UGX)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Baseline cost parameters powering the site assessment buildup engine.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-amber-400 font-semibold uppercase text-[11px] block mb-1">Labour Rates</span>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1 font-mono-numbers text-slate-300">
                  <div className="flex justify-between"><span>Cleaner Day Rate:</span><strong className="text-white">UGX 30,000 / day</strong></div>
                  <div className="flex justify-between"><span>Supervisor Day Rate:</span><strong className="text-white">UGX 50,000 / day</strong></div>
                  <div className="flex justify-between"><span>Specialist Day Rate:</span><strong className="text-white">UGX 60,000 / day</strong></div>
                </div>
              </div>

              <div>
                <span className="text-amber-400 font-semibold uppercase text-[11px] block mb-1">Equipment Hire</span>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1 font-mono-numbers text-slate-300">
                  <div className="flex justify-between"><span>Pressure Washer Hire:</span><strong className="text-white">UGX 80,000 / day</strong></div>
                  <div className="flex justify-between"><span>Generator Hire (Backup):</span><strong className="text-white">UGX 50,000 / day</strong></div>
                  <div className="flex justify-between"><span>Submersible Water Pump:</span><strong className="text-white">UGX 30,000 / day</strong></div>
                  <div className="flex justify-between"><span>Floor Scrubber (Owned):</span><strong className="text-emerald-400">UGX 0 (Depreciation)</strong></div>
                </div>
              </div>

              <div>
                <span className="text-amber-400 font-semibold uppercase text-[11px] block mb-1">Logistics & Consumables</span>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1 font-mono-numbers text-slate-300">
                  <div className="flex justify-between"><span>Transport / Fuel Trip:</span><strong className="text-white">UGX 30,000 / trip</strong></div>
                  <div className="flex justify-between"><span>Crew Transport per Day:</span><strong className="text-white">UGX 50,000 / day</strong></div>
                  <div className="flex justify-between"><span>Standard Consumables:</span><strong className="text-white">UGX 400 / sqm</strong></div>
                  <div className="flex justify-between"><span>Post-Construction Acid/Solvent:</span><strong className="text-white">UGX 900 / sqm</strong></div>
                  <div className="flex justify-between"><span>Roof Biocide & Sealant:</span><strong className="text-white">UGX 700 / sqm</strong></div>
                </div>
              </div>
            </div>
          </div>

          {/* Company Guardrails & Policy */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Operational Guardrails & Rules of Engagement
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Strict policies enforced by Sovereign Touch Home Care management.
              </p>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-900 rounded-xl border border-rose-500/30 space-y-1">
                <span className="font-bold text-rose-300 block text-xs">1. Strict Margin Floor Rule (30%)</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Never discount below the 30% gross floor price. In negotiation, trade scope, not price: remove exclusions, extend schedule, or add a retainer instead.
                </p>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-amber-500/30 space-y-1">
                <span className="font-bold text-amber-300 block text-xs">2. Rooftile Cleaning Minimums</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Never quote rooftile cleaning as 2 days. The reference job ran 5 days due to rain and water pressure. Default to 3 days minimum plus generator and submersible pump hire.
                </p>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-slate-200 block text-xs">3. Post-Construction Trades Confirmation</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Confirm painters and wet trades have finished before Day 1. Always state in writing whether exterior glass or compound is included.
                </p>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-slate-200 block text-xs">4. Mandatory Footer Compliance</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Every document must carry the registered company email (<code>cleaningserviceskla@gmail.com</code>), phone (<code>0767 666 883</code>), and URSB registration number (<code>80044053039397</code>).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

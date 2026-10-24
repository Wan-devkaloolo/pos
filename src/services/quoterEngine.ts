import { 
  SiteAssessment, 
  STHCQuote, 
  QuoteCostLine, 
  STHCServiceId 
} from '../types';

export const STHC_COMPANY_INFO = {
  name: 'Sovereign Touch Home Care',
  tagline: 'Come Home to Clean™',
  email: 'cleaningserviceskla@gmail.com',
  phone: '0767 666 883',
  ursb_registration_no: '80044053039397',
  brand: {
    primary: '#0B192C',
    accent: '#D4AF37',
  },
  footer_required_fields: ['email', 'phone', 'ursb_registration_no'],
};

export const STHC_RATE_CARDS = {
  labour: {
    cleaner_day: { unit: 'per_person_per_day', cost: 30000, label: 'Cleaner Day Rate' },
    supervisor_day: { unit: 'per_day', cost: 50000, label: 'Supervisor Day Rate (On-Site Supervision)' },
    specialist_day: { unit: 'per_person_per_day', cost: 60000, label: 'Specialist Day Rate (Roof, Upholstery, Detail)' },
  },
  equipment_hire: {
    pressure_washer_day: { unit: 'per_day', cost: 80000, label: 'Commercial Pressure Washer Hire' },
    generator_day: { unit: 'per_day', cost: 50000, label: 'Heavy-Duty Generator Hire (Backup Power)' },
    submersible_pump_day: { unit: 'per_day', cost: 30000, label: 'Submersible Water Pump Hire' },
    floor_scrubber_day: { unit: 'per_day', cost: 0, label: 'Floor Scrubber (Owned / Depreciation)' },
  },
  logistics: {
    transport_per_trip: { unit: 'per_trip', cost: 30000, label: 'Transport / Fuel per Trip' },
    transport_per_day_crew: { unit: 'per_day', cost: 50000, label: 'Crew Logistics & Transport per Day' },
    water_bowser: { unit: 'per_delivery', cost: 120000, label: 'Water Bowser Tank Delivery (If site dry)' },
  },
  consumables: {
    standard_per_sqm: { unit: 'per_sqm', cost: 400, label: 'Standard Eco Consumables' },
    post_construction_per_sqm: { unit: 'per_sqm', cost: 900, label: 'Post-Construction Chemicals, Scrapers & Solvents' },
    roof_treatment_per_sqm: { unit: 'per_sqm', cost: 700, label: 'Roof Biocide, Moss Treatment & Sealant' },
  },
};

export const STHC_SERVICE_CATALOG: {
  id: STHCServiceId;
  name: string;
  pricing_basis: string;
  default_margin_tier: 'target' | 'floor' | 'premium_or_high_risk' | 'commercial_contract';
  productivity_sqm_per_person_day?: number;
  minimum_quoted_days?: number;
  scope_note?: string;
  rule?: string;
}[] = [
  {
    id: 'deep_clean_residential',
    name: 'Residential Deep Clean',
    pricing_basis: 'per_sqm_or_per_day',
    default_margin_tier: 'target',
    productivity_sqm_per_person_day: 25,
    scope_note: 'Standard white-glove deep sanitization, internal windows, baseboards, and oven steam.',
  },
  {
    id: 'post_construction',
    name: 'Post-Construction Clean',
    pricing_basis: 'per_sqm_and_days',
    default_margin_tier: 'premium_or_high_risk',
    productivity_sqm_per_person_day: 15,
    scope_note: 'Confirm whether exterior is excluded. Confirm that painters and other trades have finished before day 1.',
  },
  {
    id: 'rooftile_cleaning',
    name: 'Rooftile Cleaning',
    pricing_basis: 'per_day_crew_plus_hire',
    default_margin_tier: 'premium_or_high_risk',
    minimum_quoted_days: 3,
    rule: 'Never quote rooftile as 2 days. Default to 3 days minimum plus risk buffer days. Include generator and submersible pump hire.',
  },
  {
    id: 'sofa_upholstery',
    name: 'Sofa / Upholstery Cleaning',
    pricing_basis: 'per_item',
    default_margin_tier: 'target',
    scope_note: 'Steam extraction, fabric stain treatment & pet hair sanitization.',
  },
  {
    id: 'move_in_out',
    name: 'Move-In / Move-Out Clean',
    pricing_basis: 'per_sqm_or_per_day',
    default_margin_tier: 'target',
    scope_note: 'Verified against Sovereign Touch 115-item Move-In/Move-Out quality checklist.',
  },
  {
    id: 'retainer_residential',
    name: 'Residential Retainer',
    pricing_basis: 'per_visit_monthly',
    default_margin_tier: 'target',
    scope_note: 'Monthly recurring contract (e.g. 4 visits/month, target gross margin ~55%).',
  },
  {
    id: 'commercial_office',
    name: 'Commercial / Office Cleaning',
    pricing_basis: 'per_visit_or_monthly_contract',
    default_margin_tier: 'commercial_contract',
    scope_note: 'Commercial office contract (40% margin, 6-12 month commitment).',
  },
];

export const QuoterEngine = {
  // Round up to nearest 5000 UGX
  roundUpToNearest5000(amount: number): number {
    return Math.ceil(amount / 5000) * 5000;
  },

  // Calculate Automated Risk Score & Level
  calculateRiskRating(assessment: Partial<SiteAssessment>): {
    score: number;
    level: 'low' | 'medium' | 'high';
    contingencyPercent: number;
    bufferDays: number;
    recommendedMarginTier: 'target' | 'premium_or_high_risk';
    reasoning: string;
  } {
    let score = 0;
    const reasons: string[] = [];

    const hazards = assessment.hazards_and_risks || {
      height_work: false,
      weather_exposure: false,
      trades_still_on_site: false,
      equipment_breakdown_exposure: false,
      client_budget_sensitivity: 'medium',
      other: '',
    };

    const util = assessment.access_and_utilities || {
      vehicle_access: 'good',
      equipment_carry_distance_m: 0,
      water_available: true,
      water_pressure: 'good',
      power_available: true,
      parking: '',
      access_hours: '',
      gate_or_security_rules: '',
    };

    const condition = assessment.condition || {
      condition_level: 'moderate',
      special_issues: [],
      surfaces: [],
    };

    if (hazards.height_work) {
      score += 2;
      reasons.push('Height work (+2)');
    }
    if (hazards.weather_exposure) {
      score += 2;
      reasons.push('Weather exposure (+2)');
    }
    if (hazards.trades_still_on_site) {
      score += 2;
      reasons.push('Trades still on site (+2)');
    }
    if (!util.water_available || util.water_pressure === 'low' || util.water_pressure === 'none') {
      score += 2;
      reasons.push('Low/No water pressure (+2)');
    }
    if (!util.power_available) {
      score += 1;
      reasons.push('Power unavailable (+1)');
    }
    if (condition.condition_level === 'heavy') {
      score += 1;
      reasons.push('Heavy condition (+1)');
    } else if (condition.condition_level === 'extreme') {
      score += 2;
      reasons.push('Extreme condition (+2)');
    }
    if (util.vehicle_access === 'poor') {
      score += 1;
      reasons.push('Poor vehicle access (+1)');
    }
    if (hazards.equipment_breakdown_exposure) {
      score += 1;
      reasons.push('Equipment breakdown exposure (+1)');
    }

    let level: 'low' | 'medium' | 'high' = 'low';
    let contingencyPercent = 0.05; // 5%
    let bufferDays = 0;
    let recommendedMarginTier: 'target' | 'premium_or_high_risk' = 'target';

    if (score >= 6) {
      level = 'high';
      contingencyPercent = 0.18; // 18%
      bufferDays = 2;
      recommendedMarginTier = 'premium_or_high_risk';
    } else if (score >= 3) {
      level = 'medium';
      contingencyPercent = 0.10; // 10%
      bufferDays = 1;
      recommendedMarginTier = 'target';
    } else {
      level = 'low';
      contingencyPercent = 0.05; // 5%
      bufferDays = 0;
      recommendedMarginTier = 'target';
    }

    return {
      score,
      level,
      contingencyPercent,
      bufferDays,
      recommendedMarginTier,
      reasoning: reasons.length > 0 ? reasons.join(', ') : 'Standard residential parameters with nominal risk.',
    };
  },

  // Calculate complete pricing build-up and margin guards
  calculateQuote(
    costLines: QuoteCostLine[],
    contingencyPercent: number,
    targetMargin: number, // e.g. 0.50
    isRush: boolean = false,
    discountPercent: number = 0
  ) {
    const direct_cost = costLines.reduce((sum, line) => sum + (line.line_cost || 0), 0);
    const contingency_amount = Math.round(direct_cost * contingencyPercent);
    const total_cost = direct_cost + contingency_amount;

    const floor_margin = 0.30; // 30% floor margin rule

    // Floor price ex-vat
    const floor_price_ex_vat = this.roundUpToNearest5000(total_cost / (1 - floor_margin));

    // Price ex-vat before rush
    const price_ex_vat_before_rush = this.roundUpToNearest5000(total_cost / (1 - targetMargin));

    // Rush premium (25% if rush)
    const rush_premium_percent = isRush ? 0.25 : 0;
    let calculated_price_ex_vat = Math.round(price_ex_vat_before_rush * (1 + rush_premium_percent));

    // Discount if applied
    const discountAmount = Math.round(calculated_price_ex_vat * (discountPercent / 100));
    const price_ex_vat = calculated_price_ex_vat - discountAmount;

    // VAT 18%
    const vat_rate = 0.18;
    const vat_amount = Math.round(price_ex_vat * vat_rate);
    const total_incl_vat = price_ex_vat + vat_amount;

    // Gross profit and margin
    const gross_profit = price_ex_vat - total_cost;
    const gross_margin_percent = price_ex_vat > 0 ? gross_profit / price_ex_vat : 0;

    // Margin status check
    let margin_status: 'ok' | 'below_target' | 'below_floor_blocked' = 'ok';
    if (price_ex_vat < floor_price_ex_vat) {
      margin_status = 'below_floor_blocked';
    } else if (gross_margin_percent < targetMargin - 0.01) {
      margin_status = 'below_target';
    } else {
      margin_status = 'ok';
    }

    // Deposit 50%
    const deposit_percent = 0.50;
    const deposit_amount = Math.round(total_incl_vat * deposit_percent);

    return {
      direct_cost,
      contingency_percent: contingencyPercent,
      contingency_amount,
      total_cost,
      floor_margin,
      floor_price_ex_vat,
      price_ex_vat_before_rush,
      rush_premium_percent,
      price_ex_vat,
      vat_amount,
      total_incl_vat,
      gross_profit,
      gross_margin_percent,
      margin_status,
      discount: {
        percent: discountPercent,
        amount: discountAmount,
      },
      deposit_percent,
      deposit_amount,
    };
  },

  // Check company guardrails
  verifyGuardrails(
    serviceId: STHCServiceId,
    costLines: QuoteCostLine[],
    estimatedDays: number,
    marginStatus: 'ok' | 'below_target' | 'below_floor_blocked',
    assessment?: Partial<SiteAssessment>
  ): { passed: boolean; warnings: string[]; blockers: string[] } {
    const warnings: string[] = [];
    const blockers: string[] = [];

    // 1. Margin Floor Guard
    if (marginStatus === 'below_floor_blocked') {
      blockers.push('Margin Guard Blocked: Quoted price is below the 30% gross margin floor. Company policy forbids discounting below floor. Trade scope, not price.');
    }

    // 2. Rooftile Cleaning Rules
    if (serviceId === 'rooftile_cleaning') {
      if (estimatedDays < 3) {
        blockers.push('Rooftile Guardrail: Minimum quoted duration must be at least 3 days. Past 2-day quotes caused cost overruns due to weather and water pressure.');
      }

      const hasGenerator = costLines.some((l) =>
        l.description.toLowerCase().includes('generator') || l.category === 'equipment_hire'
      );
      const hasPump = costLines.some((l) =>
        l.description.toLowerCase().includes('pump') || l.description.toLowerCase().includes('submersible')
      );

      if (!hasGenerator || !hasPump) {
        warnings.push('Rooftile Requirement: Ensure generator hire and submersible pump hire are included on the cost lines for equipment reliability.');
      }
    }

    // 3. Post-Construction Clean Rules
    if (serviceId === 'post_construction') {
      if (assessment?.hazards_and_risks?.trades_still_on_site) {
        warnings.push('Post-Construction Alert: Painters or trades still on site. Written confirmation is required that trades will vacate before Day 1.');
      }
      if (!assessment?.scope?.excluded?.length && !assessment?.scope?.included?.length) {
        warnings.push('Scope Clarity: State in writing whether exterior surfaces (windows, facade, balconies) are included or excluded.');
      }
    }

    return {
      passed: blockers.length === 0,
      warnings,
      blockers,
    };
  },

  // Generate Default Cost Lines based on Assessment & Service
  generateInitialCostLines(
    serviceId: STHCServiceId,
    assessment: Partial<SiteAssessment>
  ): QuoteCostLine[] {
    const lines: QuoteCostLine[] = [];
    const days = assessment.resources_estimate?.estimated_days || (serviceId === 'rooftile_cleaning' ? 3 : 1);
    const crewSize = assessment.resources_estimate?.crew_size || 3;
    const floorArea = assessment.site?.floor_area_sqm || 200;

    // Labour lines
    lines.push({
      id: `line-${Date.now()}-1`,
      category: 'labour',
      description: `Crew Labour (${crewSize} cleaners for ${days} days)`,
      qty: crewSize * days,
      unit: 'person_days',
      unit_cost: STHC_RATE_CARDS.labour.cleaner_day.cost,
      line_cost: crewSize * days * STHC_RATE_CARDS.labour.cleaner_day.cost,
    });

    lines.push({
      id: `line-${Date.now()}-2`,
      category: 'labour',
      description: `On-Site Quality Supervision (${days} days)`,
      qty: days,
      unit: 'days',
      unit_cost: STHC_RATE_CARDS.labour.supervisor_day.cost,
      line_cost: days * STHC_RATE_CARDS.labour.supervisor_day.cost,
    });

    // Service-specific equipment hire & logistics
    if (serviceId === 'rooftile_cleaning') {
      lines.push({
        id: `line-${Date.now()}-3`,
        category: 'equipment_hire',
        description: 'Commercial Pressure Washer Machine Hire (3 days)',
        qty: days,
        unit: 'days',
        unit_cost: STHC_RATE_CARDS.equipment_hire.pressure_washer_day.cost,
        line_cost: 400000, // reference job total hire
      });

      lines.push({
        id: `line-${Date.now()}-4`,
        category: 'equipment_hire',
        description: 'Generator & Submersible Water Pump Hire (Backup & Pressure)',
        qty: days,
        unit: 'days',
        unit_cost: 70000,
        line_cost: 200000,
      });

      lines.push({
        id: `line-${Date.now()}-5`,
        category: 'logistics',
        description: 'Heavy Equipment Transport & Crew Logistics (Kampala)',
        qty: 1,
        unit: 'job',
        unit_cost: 250000,
        line_cost: 250000,
      });

      lines.push({
        id: `line-${Date.now()}-6`,
        category: 'consumables',
        description: 'Roof Biocide, Moss Treatment & Chemical Consumables',
        qty: 1,
        unit: 'lot',
        unit_cost: 200000,
        line_cost: 200000,
      });
    } else if (serviceId === 'post_construction') {
      lines.push({
        id: `line-${Date.now()}-3`,
        category: 'logistics',
        description: 'Crew Transport & Equipment Logistics',
        qty: days,
        unit: 'days',
        unit_cost: STHC_RATE_CARDS.logistics.transport_per_day_crew.cost,
        line_cost: days * STHC_RATE_CARDS.logistics.transport_per_day_crew.cost,
      });

      lines.push({
        id: `line-${Date.now()}-4`,
        category: 'consumables',
        description: `Post-Construction Acid, Scrapers & Solvents (${floorArea} sqm)`,
        qty: floorArea,
        unit: 'sqm',
        unit_cost: STHC_RATE_CARDS.consumables.post_construction_per_sqm.cost,
        line_cost: floorArea * STHC_RATE_CARDS.consumables.post_construction_per_sqm.cost,
      });
    } else {
      // General residential or upholstery
      lines.push({
        id: `line-${Date.now()}-3`,
        category: 'logistics',
        description: 'Crew Logistics & Equipment Transport',
        qty: 1,
        unit: 'job',
        unit_cost: STHC_RATE_CARDS.logistics.transport_per_trip.cost,
        line_cost: STHC_RATE_CARDS.logistics.transport_per_trip.cost,
      });

      lines.push({
        id: `line-${Date.now()}-4`,
        category: 'consumables',
        description: `Standard Eco-Botanical Cleaning Consumables (${floorArea} sqm)`,
        qty: floorArea,
        unit: 'sqm',
        unit_cost: STHC_RATE_CARDS.consumables.standard_per_sqm.cost,
        line_cost: floorArea * STHC_RATE_CARDS.consumables.standard_per_sqm.cost,
      });
    }

    return lines;
  },
};

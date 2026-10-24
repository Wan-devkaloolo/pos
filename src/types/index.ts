export type ServiceTier = 
  | 'Signature Estate Maintenance' 
  | 'White Glove Deep Clean' 
  | 'Turnover & Concierge Detailing' 
  | 'Post-Renovation Architectural Detailing' 
  | 'Marble & Chandelier Specialty Care';

export type LeadStatus = 
  | 'new_inquiry' 
  | 'qualified' 
  | 'estimate_sent' 
  | 'followup_1' 
  | 'followup_2' 
  | 'closed_won' 
  | 'closed_lost';

export type BookingStatus = 
  | 'scheduled' 
  | 'in_route' 
  | 'in_progress' 
  | 'quality_inspected' 
  | 'completed' 
  | 'cancelled';

export type InvoiceStatus = 
  | 'draft' 
  | 'sent' 
  | 'partially_paid' 
  | 'paid' 
  | 'overdue';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  residenceType: 'Private Estate' | 'Penthouse' | 'Luxury Villa' | 'Historic Townhome' | 'Waterfront Residence';
  squareFootage: number;
  bedrooms: number;
  bathrooms: number;
  gateCode?: string;
  alarmCode?: string;
  accessInstructions: string;
  specialPreferences: string;
  preferredCrew?: string;
  totalSpend: number;
  cleaningsCount: number;
  ratingAverage: number;
  createdAt: string;
}

export interface Lead {
  id: string;
  clientName: string;
  email: string;
  phone: string;
  address: string;
  residenceType: string;
  serviceTier: ServiceTier;
  squareFootage: number;
  estimatedValue: number;
  status: LeadStatus;
  inquiryDate: string;
  lastContactDate: string;
  source: 'Website Form' | 'Private Referral' | 'Estate Manager' | 'Luxury Concierge' | 'Concierge Referral' | 'Direct Phone' | 'Realtor Partner';
  conversionProbability: number; // 0-100
  notes: string;
  nextFollowUpDue: string;
  automatedFollowUpStage: number; // 0, 1, 2, 3
}

export interface Booking {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  address: string;
  serviceTier: ServiceTier;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. 08:30 AM - 12:30 PM
  estimatedHours: number;
  cleanerTeam: string[];
  status: BookingStatus;
  price: number;
  squareFootage: number;
  frequency: 'one-time' | 'weekly' | 'bi-weekly' | 'monthly';
  notes: string;
  qaScore?: number;
  invoiceId?: string;
  isPaid: boolean;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: 'invoice' | 'estimate';
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  bookingId?: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceLineItem[];
  subtotal: number;
  taxRate: number; // e.g. 0.0825 (8.25%)
  taxAmount: number;
  discountAmount: number;
  total: number;
  depositRequired: number;
  depositPaid: number;
  status: InvoiceStatus;
  paymentMethod?: 'credit_card' | 'wire_ach' | 'check' | 'apple_pay' | 'cash';
  paidAt?: string;
  notes: string;
  serviceTier: string;
}

export interface QAChecklistCategory {
  category: string;
  items: {
    id: string;
    label: string;
    passed: boolean;
    inspectorNote?: string;
  }[];
}

export interface QAInspection {
  id: string;
  bookingId: string;
  clientName: string;
  address: string;
  serviceTier: string;
  inspectorName: string;
  date: string;
  overallScore: number; // 0-100%
  status: 'passed' | 're-clean_required' | 'client_reviewed';
  checklist: QAChecklistCategory[];
  clientCSAT?: number; // 1-5 stars
  clientFeedback?: string;
  inspectorSignature: string;
  verifiedAt: string;
}

export interface FollowUpSequence {
  id: string;
  name: string;
  triggerEvent: string;
  delayHours: number;
  channel: 'sms' | 'email' | 'both';
  subjectTemplate: string;
  messageTemplate: string;
  isActive: boolean;
  totalSent: number;
  responseRate: number; // percentage
}

export interface FollowUpLog {
  id: string;
  leadOrClientId: string;
  recipientName: string;
  recipientContact: string;
  channel: 'sms' | 'email';
  sequenceName: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'opened' | 'responded';
  subject?: string;
  content: string;
}

export type UserRole = 'Admin' | 'Manager' | 'Staff';

export interface RolePermissions {
  canAccessPOS: boolean;
  canManageInvoices: boolean;
  canManageSupabaseSync: boolean;
  canViewReporting: boolean;
  canManageScheduling: boolean;
  canManageFollowUps: boolean;
  canViewCRM: boolean;
  canViewClients: boolean;
  canManageTasks: boolean;
  canPerformQA: boolean;
  canManageQuoter: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  Admin: {
    canAccessPOS: true,
    canManageInvoices: true,
    canManageSupabaseSync: true,
    canViewReporting: true,
    canManageScheduling: true,
    canManageFollowUps: true,
    canViewCRM: true,
    canViewClients: true,
    canManageTasks: true,
    canPerformQA: true,
    canManageQuoter: true,
  },
  Manager: {
    canAccessPOS: false,
    canManageInvoices: false,
    canManageSupabaseSync: false,
    canViewReporting: true,
    canManageScheduling: true,
    canManageFollowUps: true,
    canViewCRM: true,
    canViewClients: true,
    canManageTasks: true,
    canPerformQA: true,
    canManageQuoter: true,
  },
  Staff: {
    canAccessPOS: false,
    canManageInvoices: false,
    canManageSupabaseSync: false,
    canViewReporting: false,
    canManageScheduling: false,
    canManageFollowUps: false,
    canViewCRM: false,
    canViewClients: true,
    canManageTasks: true,
    canPerformQA: true,
    canManageQuoter: false,
  },
};

export interface StaffTask {
  id: string;
  clientId: string;
  clientName: string;
  residenceAddress: string;
  neighborhood: string; // e.g. Kololo, Nakasero, Muyenga, Munyonyo
  date: string;
  timeSlot: string;
  serviceTier: ServiceTier;
  accessCode: string;
  petInstructions: string;
  specialRequests: string;
  assignedStaffId: string;
  assignedStaffName: string;
  checklist: {
    id: string;
    task: string;
    completed: boolean;
    area: string;
  }[];
  isComplete: boolean;
  completedAt?: string;
}

export interface StaffProfile {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  pin: string;
  avatarUrl: string;
  phone: string;
  branch: string; // 'Kampala HQ - Kololo'
}

export interface UserSession {
  isAuthenticated: boolean;
  activeStaff: StaffProfile;
  autoLockMinutes: number;
  lastActiveTimestamp: number;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  lastSyncedAt: string | null;
  autoSync: boolean;
}

// ============================================================================
// Sovereign Touch Home Care [sovereigntouchhomecare.com] Quoter & Site Assessment Types
// ============================================================================

export type STHCServiceId = 
  | 'deep_clean_residential' 
  | 'post_construction' 
  | 'rooftile_cleaning' 
  | 'sofa_upholstery' 
  | 'move_in_out' 
  | 'retainer_residential' 
  | 'commercial_office';

export interface SiteAssessment {
  report_id: string; // SAR-YYYYMMDD-###
  createdAt: string;
  client: {
    name: string;
    phone_whatsapp: string;
    email: string;
    client_type: 'residential' | 'commercial' | 'diplomatic' | 'institutional';
    lead_source: string;
    hubspot_deal_id?: string;
  };
  site: {
    address: string;
    area_landmark: string;
    gps?: string;
    property_type: 'house' | 'apartment' | 'office' | 'shop' | 'roof' | 'other';
    storeys: number;
    floor_area_sqm: number;
    roof_area_sqm?: number;
    bedrooms: number;
    bathrooms: number;
    occupied: boolean;
    furnished: boolean;
  };
  access_and_utilities: {
    vehicle_access: 'good' | 'limited' | 'poor';
    equipment_carry_distance_m: number;
    water_available: boolean;
    water_pressure: 'good' | 'low' | 'none';
    power_available: boolean;
    parking: string;
    access_hours: string;
    gate_or_security_rules: string;
  };
  condition: {
    condition_level: 'light' | 'moderate' | 'heavy' | 'extreme';
    special_issues: string[];
    surfaces: string[];
  };
  scope: {
    service_id: STHCServiceId;
    included: string[];
    excluded: string[];
    client_special_requests: string;
    timing: {
      requested_date: string;
      rush: boolean;
      rush_reason: string;
    };
  };
  hazards_and_risks: {
    height_work: boolean;
    weather_exposure: boolean;
    trades_still_on_site: boolean;
    equipment_breakdown_exposure: boolean;
    client_budget_sensitivity: 'low' | 'medium' | 'high';
    other: string;
  };
  resources_estimate: {
    crew_size: number;
    supervisor_needed: boolean;
    estimated_days: number;
    hours_per_day: number;
    equipment_needed: string[];
    consumables_notes: string;
  };
  evidence: {
    photos: string[];
    videos: string[];
    measurements_notes: string;
    assessor: string;
    assessment_date: string;
  };
  risk_rating: {
    level: 'low' | 'medium' | 'high';
    score: number;
    reasoning: string;
  };
}

export interface QuoteCostLine {
  id: string;
  category: 'labour' | 'equipment_hire' | 'logistics' | 'consumables' | 'other';
  description: string;
  qty: number;
  unit: string;
  unit_cost: number;
  line_cost: number;
}

export interface STHCQuote {
  quote_id: string; // STHC-Q-YYYYMMDD-###
  status: 'draft' | 'sent' | 'accepted' | 'lost' | 'expired';
  assessment_ref: string;
  client: {
    name: string;
    contact: string;
    site_address: string;
    email?: string;
  };
  service_id: STHCServiceId;
  service_name: string;
  scope_of_work: {
    included: string[];
    excluded: string[];
    assumptions: string[];
  };
  schedule: {
    start_date: string;
    estimated_days: number;
    buffer_days_included: number;
    note?: string;
  };
  cost_buildup: {
    lines: QuoteCostLine[];
    direct_cost: number;
    contingency_percent: number;
    contingency_amount: number;
    total_cost: number;
  };
  pricing: {
    target_margin: number;
    price_ex_vat_before_rush: number;
    rush_premium_percent: number;
    price_ex_vat: number;
    vat_amount: number;
    total_incl_vat: number;
    discount: {
      percent: number;
      amount: number;
      approved_by?: string;
    };
  };
  margin_check: {
    gross_profit: number;
    gross_margin_percent: number;
    floor_price_ex_vat: number;
    status: 'ok' | 'below_target' | 'below_floor_blocked';
    rule: string;
  };
  payment_terms: {
    deposit_percent: number;
    deposit_amount: number;
    balance_due: string;
    methods: string[];
  };
  validity_days: number;
  client_facing_notes: string;
  footer: {
    email: string;
    phone: string;
    ursb_registration_no: string;
  };
  createdAt: string;
}


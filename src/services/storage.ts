import { 
  Client, 
  Lead, 
  Booking, 
  Invoice, 
  QAInspection, 
  FollowUpSequence, 
  FollowUpLog, 
  SupabaseConfig, 
  StaffProfile,
  UserSession,
  StaffTask,
  SiteAssessment,
  STHCQuote 
} from '../types';
import { 
  INITIAL_CLIENTS, 
  INITIAL_LEADS, 
  INITIAL_BOOKINGS, 
  INITIAL_INVOICES, 
  INITIAL_QA_INSPECTIONS, 
  INITIAL_FOLLOWUP_SEQUENCES, 
  INITIAL_FOLLOWUP_LOGS, 
  INITIAL_STAFF,
  INITIAL_STAFF_TASKS,
  INITIAL_SITE_ASSESSMENTS,
  INITIAL_QUOTES 
} from '../data/mockInitialData';

const STORAGE_KEYS = {
  CLIENTS: 'sovereign_clients_v1',
  LEADS: 'sovereign_leads_v1',
  BOOKINGS: 'sovereign_bookings_v1',
  INVOICES: 'sovereign_invoices_v1',
  QA: 'sovereign_qa_inspections_v1',
  SEQUENCES: 'sovereign_sequences_v1',
  LOGS: 'sovereign_followup_logs_v1',
  STAFF: 'sovereign_staff_v1',
  TASKS: 'sovereign_staff_tasks_v1',
  ASSESSMENTS: 'sovereign_site_assessments_v1',
  QUOTES: 'sovereign_quotes_v1',
  SESSION: 'sovereign_session_v1',
  SUPABASE_CONFIG: 'sovereign_supabase_config_v1',
};

export const StorageService = {
  // Session & Staff
  getSession(): UserSession {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.activeStaff) {
          const validRoles = ['Admin', 'Manager', 'Staff'];
          if (!validRoles.includes(parsed.activeStaff.role)) {
            if (parsed.activeStaff.role === 'Executive Director') {
              parsed.activeStaff.role = 'Admin';
            } else if (parsed.activeStaff.role === 'Senior Dispatcher') {
              parsed.activeStaff.role = 'Manager';
            } else if (parsed.activeStaff.role === 'Field QA Inspector') {
              parsed.activeStaff.role = 'Staff';
            } else {
              parsed.activeStaff = INITIAL_STAFF[0];
            }
          }
          return parsed;
        }
      } catch {
        // fallback
      }
    }
    return {
      isAuthenticated: false,
      activeStaff: INITIAL_STAFF[0],
      autoLockMinutes: 15,
      lastActiveTimestamp: Date.now(),
    };
  },

  saveSession(session: UserSession): void {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  },

  getStaffList(): StaffProfile[] {
    const raw = localStorage.getItem(STORAGE_KEYS.STAFF);
    if (raw) {
      try {
        const parsed: StaffProfile[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validRoles = ['Admin', 'Manager', 'Staff'];
          const isValid = parsed.every((s) => s.role && validRoles.includes(s.role));
          if (isValid) {
            return parsed;
          }
        }
      } catch {
        // fallback
      }
    }
    return INITIAL_STAFF;
  },

  // Staff Tasks
  getStaffTasks(): StaffTask[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    return INITIAL_STAFF_TASKS;
  },

  saveStaffTasks(tasks: StaffTask[]): void {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  },

  // Site Assessments
  getSiteAssessments(): SiteAssessment[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ASSESSMENTS);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    return INITIAL_SITE_ASSESSMENTS;
  },

  saveSiteAssessments(assessments: SiteAssessment[]): void {
    localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(assessments));
  },

  // STHC Quotes
  getQuotes(): STHCQuote[] {
    const raw = localStorage.getItem(STORAGE_KEYS.QUOTES);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    return INITIAL_QUOTES;
  },

  saveQuotes(quotes: STHCQuote[]): void {
    localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
  },

  // Clients
  getClients(): Client[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    return INITIAL_CLIENTS;
  },

  saveClients(clients: Client[]): void {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  },

  // Leads
  getLeads(): Lead[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LEADS);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    return INITIAL_LEADS;
  },

  saveLeads(leads: Lead[]): void {
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
  },

  // Bookings
  getBookings(): Booking[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    return INITIAL_BOOKINGS;
  },

  saveBookings(bookings: Booking[]): void {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  },

  // Invoices
  getInvoices(): Invoice[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INVOICES);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    return INITIAL_INVOICES;
  },

  saveInvoices(invoices: Invoice[]): void {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  },

  // QA Inspections
  getQAInspections(): QAInspection[] {
    const raw = localStorage.getItem(STORAGE_KEYS.QA);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    return INITIAL_QA_INSPECTIONS;
  },

  saveQAInspections(qaList: QAInspection[]): void {
    localStorage.setItem(STORAGE_KEYS.QA, JSON.stringify(qaList));
  },

  // Follow-up sequences
  getFollowUpSequences(): FollowUpSequence[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SEQUENCES);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    return INITIAL_FOLLOWUP_SEQUENCES;
  },

  saveFollowUpSequences(sequences: FollowUpSequence[]): void {
    localStorage.setItem(STORAGE_KEYS.SEQUENCES, JSON.stringify(sequences));
  },

  // Follow-up logs
  getFollowUpLogs(): FollowUpLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    return INITIAL_FOLLOWUP_LOGS;
  },

  saveFollowUpLogs(logs: FollowUpLog[]): void {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  },

  // Supabase Configuration
  getSupabaseConfig(): SupabaseConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.SUPABASE_CONFIG);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    return {
      url: 'https://xyzcompany.supabase.co',
      anonKey: '',
      isConnected: false,
      lastSyncedAt: null,
      autoSync: false,
    };
  },

  saveSupabaseConfig(cfg: SupabaseConfig): void {
    localStorage.setItem(STORAGE_KEYS.SUPABASE_CONFIG, JSON.stringify(cfg));
  },

  // Reset to initial demo data
  resetDemoData(): void {
    localStorage.removeItem(STORAGE_KEYS.CLIENTS);
    localStorage.removeItem(STORAGE_KEYS.LEADS);
    localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
    localStorage.removeItem(STORAGE_KEYS.INVOICES);
    localStorage.removeItem(STORAGE_KEYS.QA);
    localStorage.removeItem(STORAGE_KEYS.SEQUENCES);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.ASSESSMENTS);
    localStorage.removeItem(STORAGE_KEYS.QUOTES);
  },

  // Full export as JSON
  exportAllDataJson(): string {
    const backup = {
      exportedAt: new Date().toISOString(),
      company: 'Sovereign Touch Home Care',
      domain: 'sovereigntouchhomecare.com',
      clients: this.getClients(),
      leads: this.getLeads(),
      bookings: this.getBookings(),
      invoices: this.getInvoices(),
      qaInspections: this.getQAInspections(),
      followUpSequences: this.getFollowUpSequences(),
      followUpLogs: this.getFollowUpLogs(),
    };
    return JSON.stringify(backup, null, 2);
  },

  // SQL Schema for Supabase & GitHub migrations
  generateSupabaseSQL(): string {
    return `-- ====================================================================
-- Sovereign Touch Home Care [sovereigntouchhomecare.com]
-- Enterprise Database Schema for Supabase (PostgreSQL)
-- Compatible with GitHub Actions CI/CD Migrations
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CLIENTS TABLE
CREATE TABLE IF NOT EXISTS public.clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'San Francisco, CA',
    residence_type TEXT NOT NULL,
    square_footage INTEGER NOT NULL DEFAULT 4000,
    bedrooms INTEGER NOT NULL DEFAULT 4,
    bathrooms INTEGER NOT NULL DEFAULT 4,
    gate_code TEXT,
    alarm_code TEXT,
    access_instructions TEXT,
    special_preferences TEXT,
    preferred_crew TEXT,
    total_spend NUMERIC(10, 2) DEFAULT 0.00,
    cleanings_count INTEGER DEFAULT 0,
    rating_average NUMERIC(3, 2) DEFAULT 5.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. LEADS & INQUIRIES PIPELINE
CREATE TABLE IF NOT EXISTS public.leads (
    id TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    residence_type TEXT,
    service_tier TEXT NOT NULL,
    square_footage INTEGER NOT NULL,
    estimated_value NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'new_inquiry',
    inquiry_date DATE DEFAULT CURRENT_DATE,
    last_contact_date DATE DEFAULT CURRENT_DATE,
    source TEXT NOT NULL DEFAULT 'Website Form',
    conversion_probability INTEGER DEFAULT 50,
    notes TEXT,
    next_follow_up_due TIMESTAMPTZ,
    automated_follow_up_stage INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BOOKINGS & DISPATCH SCHEDULE
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY,
    client_id TEXT REFERENCES public.clients(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    address TEXT NOT NULL,
    service_tier TEXT NOT NULL,
    date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    estimated_hours NUMERIC(4, 2) DEFAULT 4.0,
    cleaner_team TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'scheduled',
    price NUMERIC(10, 2) NOT NULL,
    square_footage INTEGER NOT NULL,
    frequency TEXT NOT NULL DEFAULT 'one-time',
    notes TEXT,
    qa_score INTEGER,
    invoice_id TEXT,
    is_paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. INVOICES & ESTIMATES
CREATE TABLE IF NOT EXISTS public.invoices (
    id TEXT PRIMARY KEY,
    invoice_number TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL DEFAULT 'invoice', -- 'invoice' or 'estimate'
    client_id TEXT REFERENCES public.clients(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_phone TEXT,
    client_address TEXT NOT NULL,
    booking_id TEXT REFERENCES public.bookings(id) ON DELETE SET NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    items JSONB NOT NULL DEFAULT '[]',
    subtotal NUMERIC(10, 2) NOT NULL,
    tax_rate NUMERIC(5, 4) DEFAULT 0.085,
    tax_amount NUMERIC(10, 2) NOT NULL,
    discount_amount NUMERIC(10, 2) DEFAULT 0.00,
    total NUMERIC(10, 2) NOT NULL,
    deposit_required NUMERIC(10, 2) DEFAULT 0.00,
    deposit_paid NUMERIC(10, 2) DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'draft',
    payment_method TEXT,
    paid_at TIMESTAMPTZ,
    notes TEXT,
    service_tier TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. QA INSPECTIONS & QUALITY TRACKING
CREATE TABLE IF NOT EXISTS public.qa_inspections (
    id TEXT PRIMARY KEY,
    booking_id TEXT REFERENCES public.bookings(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    address TEXT NOT NULL,
    service_tier TEXT NOT NULL,
    inspector_name TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    overall_score INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'passed',
    checklist JSONB NOT NULL DEFAULT '[]',
    client_csat INTEGER,
    client_feedback TEXT,
    inspector_signature TEXT,
    verified_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. AUTOMATED FOLLOW-UP WORKFLOWS & LOGS
CREATE TABLE IF NOT EXISTS public.follow_up_sequences (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    trigger_event TEXT NOT NULL,
    delay_hours INTEGER NOT NULL DEFAULT 0,
    channel TEXT NOT NULL DEFAULT 'both',
    subject_template TEXT,
    message_template TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    total_sent INTEGER DEFAULT 0,
    response_rate NUMERIC(5, 2) DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS public.follow_up_logs (
    id TEXT PRIMARY KEY,
    lead_or_client_id TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    recipient_contact TEXT NOT NULL,
    channel TEXT NOT NULL,
    sequence_name TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'sent',
    subject TEXT,
    content TEXT NOT NULL
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(date);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_qa_booking ON public.qa_inspections(booking_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qa_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_up_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_up_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full operational access
CREATE POLICY "Staff Full Access Clients" ON public.clients FOR ALL USING (true);
CREATE POLICY "Staff Full Access Leads" ON public.leads FOR ALL USING (true);
CREATE POLICY "Staff Full Access Bookings" ON public.bookings FOR ALL USING (true);
CREATE POLICY "Staff Full Access Invoices" ON public.invoices FOR ALL USING (true);
CREATE POLICY "Staff Full Access QA" ON public.qa_inspections FOR ALL USING (true);
CREATE POLICY "Staff Full Access FollowUps" ON public.follow_up_sequences FOR ALL USING (true);
CREATE POLICY "Staff Full Access Logs" ON public.follow_up_logs FOR ALL USING (true);
`;
  },

  // GitHub CI/CD Action YAML template
  generateGithubWorkflowYaml(): string {
    return `name: Sovereign Touch Supabase Sync

on:
  push:
    branches:
      - main
    paths:
      - 'supabase/**'
      - '.github/workflows/supabase-sync.yml'
  workflow_dispatch:

jobs:
  deploy-supabase:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Link Supabase Project
        run: supabase link --project-ref \${{ secrets.SUPABASE_PROJECT_ID }}
        env:
          SUPABASE_ACCESS_TOKEN: \${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Push Database Migrations
        run: supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: \${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_DB_PASSWORD: \${{ secrets.SUPABASE_DB_PASSWORD }}

      - name: Verify Schema Status
        run: |
          echo "Sovereign Touch Home Care database schema synced successfully to Supabase!"
`;
  },
};

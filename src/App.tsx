import React, { useState, useEffect } from 'react';
import { 
  Client, 
  Lead, 
  Booking, 
  Invoice, 
  QAInspection, 
  FollowUpSequence, 
  FollowUpLog, 
  StaffProfile, 
  StaffTask,
  UserSession, 
  SupabaseConfig,
  BookingStatus,
  LeadStatus,
  InvoiceStatus,
  ROLE_PERMISSIONS,
  UserRole,
  ServiceTier,
  SiteAssessment,
  STHCQuote
} from './types';
import { StorageService } from './services/storage';
import { PinLockScreen } from './components/PinLockScreen';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { PointOfSaleView } from './components/PointOfSaleView';
import { LeadsPipelineView } from './components/LeadsPipelineView';
import { SchedulingView } from './components/SchedulingView';
import { InvoicingView } from './components/InvoicingView';
import { QualityTrackingView } from './components/QualityTrackingView';
import { FollowUpWorkflowsView } from './components/FollowUpWorkflowsView';
import { AnalyticsView } from './components/AnalyticsView';
import { SupabaseSyncView } from './components/SupabaseSyncView';
import { StaffTasksView } from './components/StaffTasksView';
import { ClientsDirectoryView } from './components/ClientsDirectoryView';
import { AccessDeniedView } from './components/AccessDeniedView';
import { RapidPOSModal } from './components/RapidPOSModal';
import { QuoterDashboardView } from './components/QuoterDashboardView';

export default function App() {
  // Session & Authentication
  const [session, setSession] = useState<UserSession>(() => StorageService.getSession());
  const [staffList, setStaffList] = useState<StaffProfile[]>(() => StorageService.getStaffList());
  const [activeStaff, setActiveStaff] = useState<StaffProfile>(() => {
    const s = session?.activeStaff;
    if (s && (s.role === 'Admin' || s.role === 'Manager' || s.role === 'Staff')) {
      return s;
    }
    return StorageService.getStaffList()[0];
  });

  // App Navigation (default to 'tasks' for Staff, 'dashboard' for Admin/Manager)
  const [activeTab, setActiveTab] = useState<string>(() => {
    const role = session?.activeStaff?.role;
    return role === 'Staff' ? 'tasks' : 'dashboard';
  });
  const [isPOSModalOpen, setIsPOSModalOpen] = useState(false);

  // Core Data Collections
  const [clients, setClients] = useState<Client[]>(() => StorageService.getClients());
  const [leads, setLeads] = useState<Lead[]>(() => StorageService.getLeads());
  const [bookings, setBookings] = useState<Booking[]>(() => StorageService.getBookings());
  const [invoices, setInvoices] = useState<Invoice[]>(() => StorageService.getInvoices());
  const [inspections, setInspections] = useState<QAInspection[]>(() => StorageService.getQAInspections());
  const [sequences, setSequences] = useState<FollowUpSequence[]>(() => StorageService.getFollowUpSequences());
  const [followUpLogs, setFollowUpLogs] = useState<FollowUpLog[]>(() => StorageService.getFollowUpLogs());
  const [staffTasks, setStaffTasks] = useState<StaffTask[]>(() => StorageService.getStaffTasks());
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() => StorageService.getSupabaseConfig());
  const [siteAssessments, setSiteAssessments] = useState<SiteAssessment[]>(() => StorageService.getSiteAssessments());
  const [sthcQuotes, setSthcQuotes] = useState<STHCQuote[]>(() => StorageService.getQuotes());

  // Modal / Drilldown Targets
  const [activeInvoiceToView, setActiveInvoiceToView] = useState<Invoice | null>(null);
  const [activeBookingToInspect, setActiveBookingToInspect] = useState<Booking | null>(null);
  const [selectedClientModal, setSelectedClientModal] = useState<Client | null>(null);

  // Persist State Changes
  useEffect(() => {
    StorageService.saveClients(clients);
  }, [clients]);

  useEffect(() => {
    StorageService.saveLeads(leads);
  }, [leads]);

  useEffect(() => {
    StorageService.saveBookings(bookings);
  }, [bookings]);

  useEffect(() => {
    StorageService.saveInvoices(invoices);
  }, [invoices]);

  useEffect(() => {
    StorageService.saveQAInspections(inspections);
  }, [inspections]);

  useEffect(() => {
    StorageService.saveFollowUpSequences(sequences);
  }, [sequences]);

  useEffect(() => {
    StorageService.saveFollowUpLogs(followUpLogs);
  }, [followUpLogs]);

  useEffect(() => {
    StorageService.saveStaffTasks(staffTasks);
  }, [staffTasks]);

  useEffect(() => {
    StorageService.saveSupabaseConfig(supabaseConfig);
  }, [supabaseConfig]);

  useEffect(() => {
    StorageService.saveSiteAssessments(siteAssessments);
  }, [siteAssessments]);

  useEffect(() => {
    StorageService.saveQuotes(sthcQuotes);
  }, [sthcQuotes]);

  useEffect(() => {
    StorageService.saveSession(session);
  }, [session]);

  // Auth Handlers
  const handleUnlock = () => {
    setSession((prev) => ({
      ...prev,
      isAuthenticated: true,
      lastActiveTimestamp: Date.now(),
      activeStaff,
    }));
    // route to appropriate initial tab for the role
    if (activeStaff.role === 'Staff' && activeTab === 'dashboard') {
      setActiveTab('tasks');
    }
  };

  const handleLockScreen = () => {
    setSession((prev) => ({
      ...prev,
      isAuthenticated: false,
    }));
  };

  const handleSwitchStaff = (newStaff: StaffProfile) => {
    setActiveStaff(newStaff);
    setSession((prev) => ({
      ...prev,
      activeStaff: newStaff,
      lastActiveTimestamp: Date.now(),
    }));
    // If switching to Staff while on restricted tab, route to allowed tab
    const perms = ROLE_PERMISSIONS[newStaff.role];
    if (newStaff.role === 'Staff' && !perms.canViewReporting && activeTab === 'dashboard') {
      setActiveTab('tasks');
    }
  };

  // Add / Update Entities
  const handleAddBooking = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);

    // Also auto-generate staff task for field execution
    const newTask: StaffTask = {
      id: `task-${Date.now()}`,
      clientId: newBooking.clientId,
      clientName: newBooking.clientName,
      residenceAddress: newBooking.address,
      neighborhood: 'Kampala',
      date: newBooking.date,
      timeSlot: newBooking.timeSlot,
      serviceTier: newBooking.serviceTier,
      accessCode: 'Access protocol on file with Kampala concierge.',
      petInstructions: 'Please consult client profile before entry.',
      specialRequests: newBooking.notes,
      assignedStaffId: 'staff-field-1',
      assignedStaffName: 'Sarah Namubiru',
      checklist: [
        { id: 'c-1', task: 'Pre-service arrival perimeter & door threshold check', completed: false, area: 'Foyer' },
        { id: 'c-2', task: 'White-glove HEPA vacuum & terrazzo/marble buffing', completed: false, area: 'Living' },
        { id: 'c-3', task: 'Kitchen disinfection & appliance restoration', completed: false, area: 'Kitchen' },
        { id: 'c-4', task: 'Crisp Egyptian linen hospital corners press', completed: false, area: 'Bedrooms' },
        { id: 'c-5', task: 'Sovereign white tea ambient infusion spray', completed: false, area: 'Finishing' },
      ],
      isComplete: false,
    };
    setStaffTasks((prev) => [newTask, ...prev]);
  };

  const handleUpdateBookingStatus = (bookingId: string, status: BookingStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
    );
  };

  const handleAddInvoice = (newInvoice: Invoice) => {
    setInvoices((prev) => [newInvoice, ...prev]);
  };

  const handleUpdateInvoiceStatus = (
    invoiceId: string,
    status: InvoiceStatus,
    paymentMethod?: any
  ) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              status,
              paymentMethod: paymentMethod || inv.paymentMethod || 'credit_card',
              paidAt: status === 'paid' ? new Date().toISOString() : inv.paidAt,
            }
          : inv
      )
    );
  };

  const handleAddLead = (newLead: Lead) => {
    setLeads((prev) => [newLead, ...prev]);
  };

  const handleUpdateLeadStatus = (leadId: string, status: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status } : l))
    );
  };

  const handleAddClient = (newClient: Client) => {
    setClients((prev) => [newClient, ...prev]);
  };

  const handleAddQAInspection = (newQA: QAInspection) => {
    setInspections((prev) => [newQA, ...prev]);
    if (newQA.bookingId) {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === newQA.bookingId
            ? { ...b, qaScore: newQA.overallScore, status: 'quality_inspected' }
            : b
        )
      );
    }
  };

  const handleUpdateSequence = (updated: FollowUpSequence) => {
    setSequences((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
  };

  const handleAddFollowUpLog = (newLog: FollowUpLog) => {
    setFollowUpLogs((prev) => [newLog, ...prev]);
  };

  const handleUpdateStaffTask = (updatedTask: StaffTask) => {
    setStaffTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  };

  // Convert Lead into Booked POS Flow (Admin only)
  const handleConvertLeadToBooking = (lead: Lead) => {
    handleUpdateLeadStatus(lead.id, 'closed_won');
    if (activeStaff.role === 'Admin') {
      setActiveTab('pos');
    } else {
      setActiveTab('scheduling');
    }
  };

  // Trigger follow up from CRM
  const handleTriggerFollowUpForLead = (lead: Lead) => {
    const seq = sequences[0] || null;
    if (!seq) return;

    const rendered = seq.messageTemplate
      .replace(/{{client_name}}/g, lead.clientName)
      .replace(/{{address}}/g, lead.address)
      .replace(/{{service_tier}}/g, lead.serviceTier)
      .replace(/{{square_footage}}/g, lead.squareFootage.toLocaleString())
      .replace(/{{estimated_value}}/g, `UGX ${lead.estimatedValue.toLocaleString()}`);

    const newLog: FollowUpLog = {
      id: `flog-${Date.now()}`,
      leadOrClientId: lead.id,
      recipientName: lead.clientName,
      recipientContact: seq.channel === 'sms' ? lead.phone : lead.email,
      channel: seq.channel === 'sms' ? 'sms' : 'email',
      sequenceName: seq.name,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'sent',
      subject: seq.subjectTemplate,
      content: rendered,
    };

    handleAddFollowUpLog(newLog);
    setActiveTab('followups');
  };

  // Assessment and Quote handlers
  const handleSaveAssessment = (assessment: SiteAssessment) => {
    setSiteAssessments((prev) => {
      const idx = prev.findIndex((a) => a.report_id === assessment.report_id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = assessment;
        return copy;
      }
      return [assessment, ...prev];
    });
  };

  const handleSaveQuote = (quote: STHCQuote) => {
    setSthcQuotes((prev) => {
      const idx = prev.findIndex((q) => q.quote_id === quote.quote_id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = quote;
        return copy;
      }
      return [quote, ...prev];
    });
  };

  // 1-Click Conversion: STHC Quote -> Booking & Financial Invoice
  const handleConvertQuoteToBookingAndInvoice = (quote: STHCQuote) => {
    // 1. Locate or create client in directory
    let existingClient = clients.find(
      (c) => c.name.toLowerCase() === quote.client.name.toLowerCase() ||
             (quote.client.email && c.email.toLowerCase() === quote.client.email.toLowerCase())
    );

    if (!existingClient) {
      existingClient = {
        id: `cli-${Date.now()}`,
        name: quote.client.name,
        email: quote.client.email || 'cleaningserviceskla@gmail.com',
        phone: quote.client.contact || '0767 666 883',
        address: quote.client.site_address,
        city: 'Kampala',
        residenceType: 'Private Estate',
        squareFootage: 350,
        bedrooms: 4,
        bathrooms: 4,
        accessInstructions: 'Site assessment verified. Access rules on file.',
        specialPreferences: `Quote Ref: ${quote.quote_id}. Scope: ${quote.service_name}`,
        totalSpend: quote.pricing.total_incl_vat,
        cleaningsCount: 1,
        ratingAverage: 5.0,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setClients((prev) => [existingClient!, ...prev]);
    }

    // 2. Map service tier
    let serviceTier: ServiceTier = 'White Glove Deep Clean';
    if (quote.service_id === 'rooftile_cleaning') serviceTier = 'Signature Estate Maintenance';
    else if (quote.service_id === 'post_construction') serviceTier = 'Post-Renovation Architectural Detailing';
    else if (quote.service_id === 'sofa_upholstery') serviceTier = 'Turnover & Concierge Detailing';
    else if (quote.service_id === 'deep_clean_residential') serviceTier = 'White Glove Deep Clean';

    // 3. Create Booking
    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      clientId: existingClient.id,
      clientName: existingClient.name,
      clientPhone: existingClient.phone,
      address: quote.client.site_address,
      date: quote.schedule.start_date || new Date().toISOString().slice(0, 10),
      timeSlot: '08:30 AM - 04:30 PM (EAT)',
      serviceTier,
      cleanerTeam: ['Pato (Supervisor)', 'Lead Tech 1', 'Lead Tech 2'],
      estimatedHours: 8 * (quote.schedule.estimated_days || 1),
      status: 'scheduled',
      squareFootage: 350,
      price: quote.pricing.total_incl_vat,
      frequency: 'one-time',
      notes: `From STHC Quote ${quote.quote_id} | Ref Site Assessment: ${quote.assessment_ref || 'Direct'} | Estimated Days: ${quote.schedule.estimated_days} (+${quote.schedule.buffer_days_included} buffer days)`,
      isPaid: false,
      invoiceId: `inv-${Date.now()}`,
    };
    handleAddBooking(newBooking);

    // 4. Create Invoice
    const newInvoice: Invoice = {
      id: newBooking.invoiceId!,
      invoiceNumber: `STHC-INV-${quote.quote_id.replace('STHC-Q-', '')}`,
      type: 'invoice',
      clientId: existingClient.id,
      clientName: existingClient.name,
      clientEmail: existingClient.email,
      clientPhone: existingClient.phone,
      clientAddress: quote.client.site_address,
      bookingId: newBooking.id,
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + quote.validity_days * 86400000).toISOString().slice(0, 10),
      items: quote.cost_buildup.lines.map((cl, i) => ({
        id: `li-${i}`,
        description: cl.description,
        quantity: cl.qty,
        unitPrice: cl.unit_cost,
        total: cl.line_cost,
      })),
      subtotal: quote.pricing.price_ex_vat,
      taxRate: 0.18,
      taxAmount: quote.pricing.vat_amount,
      discountAmount: quote.pricing.discount?.amount || 0,
      total: quote.pricing.total_incl_vat,
      depositRequired: quote.payment_terms.deposit_amount,
      depositPaid: 0,
      status: 'sent',
      paymentMethod: 'wire_ach',
      serviceTier,
      notes: `50% deposit required (UGX ${quote.payment_terms.deposit_amount.toLocaleString()}) upon confirmation. Sovereign Touch Home Care URSB Reg: 80044053039397. Airtel/MTN: 0767 666 883.`,
    };
    handleAddInvoice(newInvoice);

    // 5. Update quote status to accepted
    const updatedQuote: STHCQuote = {
      ...quote,
      status: 'accepted',
    };
    handleSaveQuote(updatedQuote);

    // 6. Direct to invoices view so user can view or share the invoice
    setActiveInvoiceToView(newInvoice);
    setActiveTab('invoices');
  };

  // Reset all data
  const handleResetDemo = () => {
    if (confirm('Reset Sovereign Touch Kampala demo records to pristine factory state?')) {
      StorageService.resetDemoData();
      setClients(StorageService.getClients());
      setLeads(StorageService.getLeads());
      setBookings(StorageService.getBookings());
      setInvoices(StorageService.getInvoices());
      setInspections(StorageService.getQAInspections());
      setSequences(StorageService.getFollowUpSequences());
      setFollowUpLogs(StorageService.getFollowUpLogs());
      setStaffTasks(StorageService.getStaffTasks());
      setSiteAssessments(StorageService.getSiteAssessments());
      setSthcQuotes(StorageService.getQuotes());
    }
  };

  // If user is not authenticated, render PIN lock screen
  if (!session.isAuthenticated) {
    return (
      <PinLockScreen
        staffList={staffList}
        activeStaff={activeStaff}
        onSelectStaff={(staff) => {
          setActiveStaff(staff);
          setSession((prev) => ({ ...prev, activeStaff: staff }));
        }}
        onUnlock={handleUnlock}
      />
    );
  }

  // Count active badges
  const newLeadsCount = leads.filter((l) => l.status === 'new_inquiry').length;
  const pendingFollowUps = leads.filter(
    (l) => l.status === 'estimate_sent' || l.status === 'followup_1'
  ).length;

  const safeRole: UserRole = (activeStaff && (activeStaff.role === 'Admin' || activeStaff.role === 'Manager' || activeStaff.role === 'Staff'))
    ? activeStaff.role
    : 'Admin';

  const permissions = ROLE_PERMISSIONS[safeRole] || ROLE_PERMISSIONS.Admin;

  // RBAC Permission Check Helper
  const checkAccess = (tab: string): { allowed: boolean; requiredRole: 'Admin' | 'Manager or Admin'; featureName: string } => {
    switch (tab) {
      case 'dashboard':
        return {
          allowed: permissions.canViewReporting,
          requiredRole: 'Manager or Admin',
          featureName: 'KPI Reporting & Conversion Analytics',
        };
      case 'scheduling':
        return {
          allowed: permissions.canManageScheduling,
          requiredRole: 'Manager or Admin',
          featureName: 'Dispatch Scheduling & Calendar Management',
        };
      case 'pipeline':
        return {
          allowed: permissions.canViewCRM,
          requiredRole: 'Manager or Admin',
          featureName: 'Inbound CRM Pipeline & Inquiry Intake',
        };
      case 'followups':
        return {
          allowed: permissions.canManageFollowUps,
          requiredRole: 'Manager or Admin',
          featureName: 'Automated Client Follow-Up Sequences',
        };
      case 'pos':
        return {
          allowed: permissions.canAccessPOS,
          requiredRole: 'Admin',
          featureName: 'Point of Sale (POS) Rapid Charging Counter',
        };
      case 'invoices':
        return {
          allowed: permissions.canManageInvoices,
          requiredRole: 'Admin',
          featureName: 'Financial Invoices & Billing Ledger',
        };
      case 'supabase':
        return {
          allowed: permissions.canManageSupabaseSync,
          requiredRole: 'Admin',
          featureName: 'Supabase Database & GitHub Sync Hub',
        };
      case 'tasks':
        return {
          allowed: permissions.canManageTasks,
          requiredRole: 'Manager or Admin',
          featureName: 'Field Operations & Task Checklists',
        };
      case 'clients':
        return {
          allowed: permissions.canViewClients,
          requiredRole: 'Manager or Admin',
          featureName: 'Kampala Client Directory & Gate Clearances',
        };
      case 'quality':
        return {
          allowed: permissions.canPerformQA,
          requiredRole: 'Manager or Admin',
          featureName: 'Service Quality (QA) Tracking',
        };
      case 'quoter':
        return {
          allowed: permissions.canManageQuoter,
          requiredRole: 'Manager or Admin',
          featureName: 'STHC Quoter & Site Assessment Studio',
        };
      default:
        return { allowed: true, requiredRole: 'Manager or Admin', featureName: 'Requested View' };
    }
  };

  const access = checkAccess(activeTab);

  return (
    <div className="min-h-screen bg-[#070a10] text-slate-100 flex flex-col font-sans selection:bg-amber-500/20">
      {/* Top Bar Contract Zone */}
      <Header
        activeStaff={activeStaff}
        staffList={staffList}
        onSelectStaff={handleSwitchStaff}
        activeTab={activeTab}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onOpenPOSModal={() => {
          if (activeStaff.role === 'Admin') {
            setIsPOSModalOpen(true);
          } else {
            setActiveTab('pos');
          }
        }}
        onLockScreen={handleLockScreen}
        supabaseConfig={supabaseConfig}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          pendingFollowUpsCount={pendingFollowUps}
          newLeadsCount={newLeadsCount}
          activeStaff={activeStaff}
        />

        {/* Content Viewport with RBAC Guarding */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {!access.allowed ? (
            <AccessDeniedView
              activeStaff={activeStaff}
              attemptedFeature={access.featureName}
              requiredRole={access.requiredRole}
              onGoToPermittedTab={() => setActiveTab(activeStaff.role === 'Staff' ? 'tasks' : 'dashboard')}
              onRequestSwitchProfile={handleLockScreen}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <AnalyticsView
                  leads={leads}
                  bookings={bookings}
                  invoices={invoices}
                  inspections={inspections}
                  clients={clients}
                />
              )}

              {activeTab === 'tasks' && (
                <StaffTasksView
                  tasks={staffTasks}
                  clients={clients}
                  activeStaff={activeStaff}
                  onUpdateTask={handleUpdateStaffTask}
                  onSelectClientToView={(client) => setSelectedClientModal(client)}
                />
              )}

              {activeTab === 'clients' && (
                <ClientsDirectoryView
                  clients={clients}
                  activeStaff={activeStaff}
                  selectedClientModal={selectedClientModal}
                  onCloseClientModal={() => setSelectedClientModal(null)}
                  onSelectClient={(client) => setSelectedClientModal(client)}
                />
              )}

              {activeTab === 'pos' && (
                <PointOfSaleView
                  clients={clients}
                  onAddBooking={handleAddBooking}
                  onAddInvoice={handleAddInvoice}
                  onAddLead={handleAddLead}
                  onAddClient={handleAddClient}
                  onViewInvoice={(inv) => setActiveInvoiceToView(inv)}
                />
              )}

              {activeTab === 'pipeline' && (
                <LeadsPipelineView
                  leads={leads}
                  onAddLead={handleAddLead}
                  onUpdateLeadStatus={handleUpdateLeadStatus}
                  onTriggerFollowUp={handleTriggerFollowUpForLead}
                  onConvertToBooking={handleConvertLeadToBooking}
                />
              )}

              {activeTab === 'scheduling' && (
                <SchedulingView
                  bookings={bookings}
                  clients={clients}
                  onAddBooking={handleAddBooking}
                  onUpdateBookingStatus={handleUpdateBookingStatus}
                  onOpenQualityAudit={(b) => {
                    setActiveBookingToInspect(b);
                    setActiveTab('quality');
                  }}
                />
              )}

              {activeTab === 'invoices' && (
                <InvoicingView
                  invoices={invoices}
                  clients={clients}
                  onAddInvoice={handleAddInvoice}
                  onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
                  activeInvoiceToView={activeInvoiceToView}
                  onCloseInvoiceModal={() => setActiveInvoiceToView(null)}
                  onSelectInvoiceToView={(inv) => setActiveInvoiceToView(inv)}
                />
              )}

              {activeTab === 'quality' && (
                <QualityTrackingView
                  inspections={inspections}
                  bookings={bookings}
                  onAddInspection={handleAddQAInspection}
                  onUpdateInspection={(qa) => {
                    setInspections((prev) =>
                      prev.map((i) => (i.id === qa.id ? qa : i))
                    );
                  }}
                  activeBookingToInspect={activeBookingToInspect}
                  onCloseInspectorModal={() => setActiveBookingToInspect(null)}
                />
              )}

              {activeTab === 'followups' && (
                <FollowUpWorkflowsView
                  sequences={sequences}
                  logs={followUpLogs}
                  leads={leads}
                  clients={clients}
                  onUpdateSequence={handleUpdateSequence}
                  onSendManualFollowUp={handleAddFollowUpLog}
                />
              )}

              {activeTab === 'quoter' && (
                <QuoterDashboardView
                  assessments={siteAssessments}
                  quotes={sthcQuotes}
                  onSaveAssessment={handleSaveAssessment}
                  onSaveQuote={handleSaveQuote}
                  onConvertToBookingAndInvoice={handleConvertQuoteToBookingAndInvoice}
                  activeStaff={activeStaff}
                />
              )}

              {activeTab === 'supabase' && (
                <SupabaseSyncView
                  config={supabaseConfig}
                  onUpdateConfig={(cfg) => setSupabaseConfig(cfg)}
                  onResetDemoData={handleResetDemo}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Global Rapid POS Quick Modal (Admin Only) */}
      {permissions.canAccessPOS && (
        <RapidPOSModal
          isOpen={isPOSModalOpen}
          onClose={() => setIsPOSModalOpen(false)}
          clients={clients}
          onAddBooking={handleAddBooking}
          onAddInvoice={handleAddInvoice}
          onAddLead={handleAddLead}
          onAddClient={handleAddClient}
          onViewInvoice={(inv) => {
            setActiveInvoiceToView(inv);
            setIsPOSModalOpen(false);
            setActiveTab('invoices');
          }}
        />
      )}
    </div>
  );
}

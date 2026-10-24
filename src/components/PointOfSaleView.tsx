import React, { useState, useMemo } from 'react';
import { 
  Client, 
  Booking, 
  Invoice, 
  ServiceTier, 
  InvoiceLineItem,
  Lead
} from '../types';
import { 
  Zap, 
  CreditCard, 
  Building, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Printer, 
  Send, 
  UserPlus, 
  Search,
  DollarSign,
  ShieldCheck,
  Percent
} from 'lucide-react';

interface PointOfSaleViewProps {
  clients: Client[];
  onAddBooking: (booking: Booking) => void;
  onAddInvoice: (invoice: Invoice) => void;
  onAddLead: (lead: Lead) => void;
  onAddClient: (client: Client) => void;
  onViewInvoice: (invoice: Invoice) => void;
}

const LUXURY_SERVICES: { tier: ServiceTier; baseRatePerSqFt: number; minHours: number; desc: string }[] = [
  { 
    tier: 'Signature Estate Maintenance', 
    baseRatePerSqFt: 100, // UGX per sq ft
    minHours: 4,
    desc: 'Regular white-glove upkeep for luxury residences in Kampala, dustless HEPA care & botanical sanitization.' 
  },
  { 
    tier: 'White Glove Deep Clean', 
    baseRatePerSqFt: 140, 
    minHours: 5,
    desc: 'Intensive restoration including baseboards, ceiling moldings, cabinet interiors & detailed fixture polish.' 
  },
  { 
    tier: 'Turnover & Concierge Detailing', 
    baseRatePerSqFt: 160, 
    minHours: 5,
    desc: 'Rapid executive estate turnover, linen steaming, guest suite preparation & silver polishing.' 
  },
  { 
    tier: 'Post-Renovation Architectural Detailing', 
    baseRatePerSqFt: 220, 
    minHours: 6,
    desc: 'High-filtration silica removal, paint overspray cleanup, marble vacuuming & crystal detailing.' 
  },
  { 
    tier: 'Marble & Chandelier Specialty Care', 
    baseRatePerSqFt: 180, 
    minHours: 4,
    desc: 'Diamond buffing for Italian marble, ultrasonic crystal prisms, and bespoke architectural metal care.' 
  },
];

const LUXURY_ADDONS = [
  { id: 'ch-1', label: 'Austrian Crystal Chandelier Hand Buffing', price: 450000 },
  { id: 'app-1', label: 'Sub-Zero & Chef Oven Steam Disinfection', price: 150000 },
  { id: 'mar-1', label: 'French Limestone / Marble Diamond Sealing', price: 350000 },
  { id: 'gl-1', label: 'Panoramic Architectural Glass Streak-Free Treatment', price: 280000 },
  { id: 'aro-1', label: 'Organic White Tea & Cedar Ambient Diffuser Refill', price: 100000 },
  { id: 'sil-1', label: 'Silverware Ultrasonic Tarnish Removal & Buffing', price: 180000 },
];

export const PointOfSaleView: React.FC<PointOfSaleViewProps> = ({
  clients,
  onAddBooking,
  onAddInvoice,
  onAddLead,
  onAddClient,
  onViewInvoice,
}) => {
  // Client selection state
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewClient, setIsNewClient] = useState(false);

  // New client fields
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');
  const [newClientType, setNewClientType] = useState<Client['residenceType']>('Private Estate');

  // Service configuration
  const [serviceTier, setServiceTier] = useState<ServiceTier>('Signature Estate Maintenance');
  const [sqFt, setSqFt] = useState<number>(6500);
  const [bedrooms, setBedrooms] = useState<number>(5);
  const [bathrooms, setBathrooms] = useState<number>(6);
  const [frequency, setFrequency] = useState<'one-time' | 'weekly' | 'bi-weekly' | 'monthly'>('bi-weekly');
  const [selectedAddons, setSelectedAddons] = useState<string[]>(['app-1']);
  const [customDiscountPercent, setCustomDiscountPercent] = useState<number>(0);

  // Scheduling details
  const [serviceDate, setServiceDate] = useState<string>(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [timeSlot, setTimeSlot] = useState<string>('08:30 AM - 01:30 PM');
  const [crewAssignment, setCrewAssignment] = useState<string>('Elena Rostova (Lead) & Team Alpha');
  const [specialInstructions, setSpecialInstructions] = useState<string>('White glove gate access. Fragile artwork on primary floor.');

  // Payment configuration
  const [paymentOption, setPaymentOption] = useState<'full' | 'deposit' | 'estimate_only'>('deposit');
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'wire_ach' | 'check' | 'apple_pay'>('credit_card');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Selected client object
  const activeClient = useMemo(() => {
    return clients.find((c) => c.id === selectedClientId) || null;
  }, [clients, selectedClientId]);

  // If active client selected, populate sqft & bed/baths
  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
    setIsNewClient(false);
    const found = clients.find((c) => c.id === clientId);
    if (found) {
      setSqFt(found.squareFootage);
      setBedrooms(found.bedrooms);
      setBathrooms(found.bathrooms);
    }
  };

  // Price calculations
  const calculation = useMemo(() => {
    const tierConfig = LUXURY_SERVICES.find((s) => s.tier === serviceTier) || LUXURY_SERVICES[0];
    
    // Base calculation from square footage + room count adjustment in UGX
    const sqFtCost = sqFt * tierConfig.baseRatePerSqFt;
    const roomAdjustment = (bedrooms * 25000) + (bathrooms * 35000);
    const baseServicePrice = Math.max(450000, Math.round(sqFtCost + roomAdjustment));

    // Frequency discount
    let freqDiscountPercent = 0;
    if (frequency === 'weekly') freqDiscountPercent = 20;
    else if (frequency === 'bi-weekly') freqDiscountPercent = 15;
    else if (frequency === 'monthly') freqDiscountPercent = 10;

    const totalDiscountPercent = Math.min(40, freqDiscountPercent + customDiscountPercent);
    const discountAmount = Math.round(baseServicePrice * (totalDiscountPercent / 100));
    const discountedBase = baseServicePrice - discountAmount;

    // Add-ons cost
    const addOnsTotal = selectedAddons.reduce((sum, id) => {
      const item = LUXURY_ADDONS.find((a) => a.id === id);
      return sum + (item ? item.price : 0);
    }, 0);

    const subtotal = discountedBase + addOnsTotal;
    const taxRate = 0.18; // 18% Uganda VAT
    const taxAmount = Math.round(subtotal * taxRate);
    const grandTotal = subtotal + taxAmount;
    const depositRequired = Math.round(grandTotal * 0.35); // 35% deposit

    return {
      baseServicePrice,
      totalDiscountPercent,
      discountAmount,
      discountedBase,
      addOnsTotal,
      subtotal,
      taxAmount,
      grandTotal,
      depositRequired,
      estimatedHours: tierConfig.minHours + (sqFt > 7000 ? 1.5 : 0),
    };
  }, [serviceTier, sqFt, bedrooms, bathrooms, frequency, selectedAddons, customDiscountPercent]);

  // Toggle Addon
  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Submit POS Transaction or Estimate
  const handleExecutePOS = (isOnlyEstimate = false) => {
    let clientToUse: Client;

    if (isNewClient || !activeClient) {
      if (!newClientName || !newClientEmail) {
        alert('Please provide the client name and email address.');
        return;
      }
      clientToUse = {
        id: `cli-${Date.now().toString().slice(-5)}`,
        name: newClientName,
        email: newClientEmail,
        phone: newClientPhone || '(415) 555-0199',
        address: newClientAddress || 'Private Residence, SF Bay Area',
        city: 'San Francisco, CA',
        residenceType: newClientType,
        squareFootage: sqFt,
        bedrooms,
        bathrooms,
        accessInstructions: specialInstructions,
        specialPreferences: 'Registered via Rapid POS counter.',
        totalSpend: 0,
        cleaningsCount: 0,
        ratingAverage: 5.0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      onAddClient(clientToUse);
    } else {
      clientToUse = activeClient;
    }

    // Build line items
    const lineItems: InvoiceLineItem[] = [
      {
        id: `li-${Date.now()}-1`,
        description: `${serviceTier} (${sqFt.toLocaleString()} sq ft · ${bedrooms} Bed / ${bathrooms} Bath)`,
        quantity: 1,
        unitPrice: calculation.discountedBase,
        total: calculation.discountedBase,
      },
      ...selectedAddons.map((addId, idx) => {
        const item = LUXURY_ADDONS.find((a) => a.id === addId)!;
        return {
          id: `li-${Date.now()}-${idx + 2}`,
          description: item.label,
          quantity: 1,
          unitPrice: item.price,
          total: item.price,
        };
      }),
    ];

    const invoiceNumber = isOnlyEstimate
      ? `ST-EST-2026-${Math.floor(100 + Math.random() * 900)}`
      : `ST-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const depositPaidAmount = isOnlyEstimate
      ? 0
      : paymentOption === 'full'
      ? calculation.grandTotal
      : calculation.depositRequired;

    const invoiceStatus = isOnlyEstimate
      ? 'sent'
      : paymentOption === 'full'
      ? 'paid'
      : 'partially_paid';

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      type: isOnlyEstimate ? 'estimate' : 'invoice',
      clientId: clientToUse.id,
      clientName: clientToUse.name,
      clientEmail: clientToUse.email,
      clientPhone: clientToUse.phone,
      clientAddress: clientToUse.address,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
      items: lineItems,
      subtotal: calculation.subtotal,
      taxRate: 0.085,
      taxAmount: calculation.taxAmount,
      discountAmount: calculation.discountAmount,
      total: calculation.grandTotal,
      depositRequired: calculation.depositRequired,
      depositPaid: depositPaidAmount,
      status: invoiceStatus,
      paymentMethod: isOnlyEstimate ? undefined : paymentMethod,
      paidAt: isOnlyEstimate ? undefined : new Date().toISOString(),
      notes: isOnlyEstimate
        ? 'VIP Estimate prepared via Sovereign Touch POS engine. Valid for 14 calendar days.'
        : `Payment processed at POS via ${paymentMethod.replace('_', ' ').toUpperCase()}. Concierge dispatched.`,
      serviceTier,
    };

    onAddInvoice(newInvoice);

    if (!isOnlyEstimate) {
      // Create confirmed Booking
      const newBooking: Booking = {
        id: `bk-${Date.now()}`,
        clientId: clientToUse.id,
        clientName: clientToUse.name,
        clientPhone: clientToUse.phone,
        address: clientToUse.address,
        serviceTier,
        date: serviceDate,
        timeSlot,
        estimatedHours: calculation.estimatedHours,
        cleanerTeam: [crewAssignment],
        status: 'scheduled',
        price: calculation.grandTotal,
        squareFootage: sqFt,
        frequency,
        notes: specialInstructions,
        invoiceId: newInvoice.id,
        isPaid: paymentOption === 'full',
      };
      onAddBooking(newBooking);

      setSuccessNotice(`Transaction complete! Invoice ${invoiceNumber} issued and dispatched to calendar.`);
    } else {
      // Also register as pipeline lead if it's an estimate
      const newLead: Lead = {
        id: `lead-${Date.now()}`,
        clientName: clientToUse.name,
        email: clientToUse.email,
        phone: clientToUse.phone,
        address: clientToUse.address,
        residenceType: clientToUse.residenceType,
        serviceTier,
        squareFootage: sqFt,
        estimatedValue: calculation.grandTotal,
        status: 'estimate_sent',
        inquiryDate: new Date().toISOString().split('T')[0],
        lastContactDate: new Date().toISOString().split('T')[0],
        source: 'Website Form',
        conversionProbability: 80,
        notes: `Generated estimate at POS for ${sqFt.toLocaleString()} sq ft property. Deposit of $${calculation.depositRequired} quoted.`,
        nextFollowUpDue: new Date(Date.now() + 86400000).toISOString().replace('T', ' ').slice(0, 16),
        automatedFollowUpStage: 1,
      };
      onAddLead(newLead);
      setSuccessNotice(`Estimate ${invoiceNumber} generated! Lead placed into 24-hour automated follow-up sequence.`);
    }

    // Auto-clear notice after 6 seconds
    setTimeout(() => {
      setSuccessNotice(null);
    }, 6000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-[#131b2e] border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Zap className="w-4 h-4" />
            Point of Sale & Instant Intake Counter
          </div>
          <h2 className="text-xl font-serif-luxury font-bold text-white mt-1">
            White-Glove Booking & Rapid Charge
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Calculate estate estimates in seconds, collect deposits, and dispatch concierge cleaning teams.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-xs text-slate-400">Standard Estate Deposit</div>
            <div className="text-sm font-bold text-amber-400 font-mono-numbers">35% Required</div>
          </div>
          <div className="h-8 w-px bg-slate-800 mx-2" />
          <div className="text-right">
            <div className="text-xs text-slate-400">Payment Engine</div>
            <div className="text-sm font-semibold text-emerald-400">Stripe & POS Active</div>
          </div>
        </div>
      </div>

      {successNotice && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successNotice}</span>
          </div>
          <button
            onClick={() => setSuccessNotice(null)}
            className="text-xs text-emerald-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Left Configurator / Right Live POS Receipt */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Client & Estate Parameters */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Client Selection */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Building className="w-4 h-4 text-amber-400" />
                1. Client & Residence Profile
              </h3>
              <div className="flex items-center gap-1 p-0.5 bg-slate-900 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewClient(false)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    !isNewClient ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Existing Client
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsNewClient(true);
                    setSelectedClientId('');
                  }}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    isNewClient ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  + New VIP Client
                </button>
              </div>
            </div>

            {!isNewClient ? (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search client by name, estate address, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {clients
                    .filter(
                      (c) =>
                        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.address.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((client) => {
                      const isSelected = selectedClientId === client.id;
                      return (
                        <div
                          key={client.id}
                          onClick={() => handleSelectClient(client.id)}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-amber-500/10 border-amber-500/50 text-white'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="text-xs font-semibold truncate">{client.name}</div>
                          <div className="text-[11px] text-slate-400 truncate">{client.address}</div>
                          <div className="text-[10px] text-amber-400/90 mt-1 font-mono-numbers">
                            {client.squareFootage.toLocaleString()} sq ft · {client.residenceType}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Client Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Lord Charles Sterling"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Email Address *</label>
                  <input
                    type="email"
                    placeholder="client@estate.com"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="(415) 555-0199"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Estate Type</label>
                  <select
                    value={newClientType}
                    onChange={(e) => setNewClientType(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:border-amber-500"
                  >
                    <option value="Private Estate">Private Estate</option>
                    <option value="Penthouse">Penthouse</option>
                    <option value="Luxury Villa">Luxury Villa</option>
                    <option value="Historic Townhome">Historic Townhome</option>
                    <option value="Waterfront Residence">Waterfront Residence</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-slate-400 mb-1">Property Address</label>
                  <input
                    type="text"
                    placeholder="1200 Pacific Heights Blvd, San Francisco, CA"
                    value={newClientAddress}
                    onChange={(e) => setNewClientAddress(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:border-amber-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Service Tier & Property Dimensions */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              2. Service Tier & Estate Sizing
            </h3>

            {/* Service Tier Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {LUXURY_SERVICES.map((serv) => {
                const isSelected = serviceTier === serv.tier;
                return (
                  <div
                    key={serv.tier}
                    onClick={() => setServiceTier(serv.tier)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/60 shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold ${isSelected ? 'text-amber-400' : 'text-slate-200'}`}>
                        {serv.tier}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{serv.desc}</p>
                    <div className="text-[10px] text-slate-500 mt-2 font-mono-numbers">
                      Base Rate: ${(serv.baseRatePerSqFt * 100).toFixed(0)}¢/sq ft · Min {serv.minHours} hrs crew
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Property Sizing Sliders */}
            <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Square Footage</span>
                  <span className="font-mono-numbers font-semibold text-amber-400">{sqFt.toLocaleString()} sq ft</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="16000"
                  step="500"
                  value={sqFt}
                  onChange={(e) => setSqFt(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Bedrooms</span>
                  <span className="font-mono-numbers font-semibold text-amber-400">{bedrooms}</span>
                </div>
                <div className="flex items-center gap-1">
                  {[2, 3, 4, 5, 6, 8].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setBedrooms(num)}
                      className={`flex-1 py-1 text-xs rounded border transition-colors font-mono-numbers ${
                        bedrooms === num
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-500'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Bathrooms</span>
                  <span className="font-mono-numbers font-semibold text-amber-400">{bathrooms}</span>
                </div>
                <div className="flex items-center gap-1">
                  {[2, 3, 4, 6, 8, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setBathrooms(num)}
                      className={`flex-1 py-1 text-xs rounded border transition-colors font-mono-numbers ${
                        bathrooms === num
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-500'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Cadence & Frequency */}
            <div className="pt-2 border-t border-slate-800">
              <label className="block text-xs text-slate-400 mb-2">Service Frequency & Estate Cadence</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'weekly', label: 'Weekly', discount: '20% Off' },
                  { id: 'bi-weekly', label: 'Bi-Weekly', discount: '15% Off' },
                  { id: 'monthly', label: 'Monthly', discount: '10% Off' },
                  { id: 'one-time', label: 'One-Time', discount: 'Standard' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFrequency(item.id as any)}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      frequency === item.id
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-semibold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs">{item.label}</div>
                    <div className="text-[10px] text-emerald-400">{item.discount}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Bespoke Add-ons & Detailing */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              3. Bespoke Architectural Detailing & Add-ons
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {LUXURY_ADDONS.map((addon) => {
                const isChecked = selectedAddons.includes(addon.id);
                return (
                  <div
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-amber-500/10 border-amber-500/50 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs truncate">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded accent-amber-500"
                      />
                      <span className="truncate">{addon.label}</span>
                    </div>
                    <span className="text-xs font-mono-numbers text-amber-400 shrink-0 font-semibold">
                      +${addon.price}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Schedule Dispatch & Instructions */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              4. Dispatch Window & Access Notes
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Target Service Date</label>
                <input
                  type="date"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Arrival Window</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:border-amber-500"
                >
                  <option value="08:00 AM - 01:00 PM">Morning (08:00 AM - 01:00 PM)</option>
                  <option value="08:30 AM - 01:30 PM">Morning Prime (08:30 AM - 01:30 PM)</option>
                  <option value="01:30 PM - 06:00 PM">Afternoon (01:30 PM - 06:00 PM)</option>
                  <option value="Full Day Concierge">Full Day Concierge (08:30 AM - 05:00 PM)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Assigned Crew</label>
                <select
                  value={crewAssignment}
                  onChange={(e) => setCrewAssignment(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:border-amber-500"
                >
                  <option value="Elena Rostova (Lead) & Team Alpha">Elena Rostova (Lead) & Team Alpha</option>
                  <option value="Camille Laurent (Lead) & Team Beta">Camille Laurent (Lead) & Team Beta</option>
                  <option value="Julian Cross & Specialist Detailers">Julian Cross & Specialist Detailers</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Security Gate / Alarm / Access Instructions</label>
              <input
                type="text"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Gate code, butler instructions, delicate surfaces to protect..."
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Live POS Receipt & Instant Checkout */}
        <div className="lg:col-span-5 sticky top-20 space-y-4">
          <div className="bg-[#0f172a] border border-amber-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
            {/* Header branding */}
            <div className="text-center pb-4 border-b border-slate-800">
              <div className="text-xs uppercase tracking-widest text-amber-400 font-semibold font-serif-luxury">
                Sovereign Touch Home Care
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Point of Sale · Order Summary</div>
              <div className="text-[10px] text-slate-500">sovereigntouchhomecare.com</div>
            </div>

            {/* Client summary */}
            <div className="py-3 border-b border-slate-800/80 text-xs">
              <div className="text-slate-400">Client / Residence:</div>
              <div className="font-semibold text-slate-100 mt-0.5">
                {isNewClient ? (newClientName || 'New Client (Pending Name)') : (activeClient?.name || 'Please select a client')}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {isNewClient ? (newClientAddress || 'Address pending') : activeClient?.address}
              </div>
            </div>

            {/* Line items preview */}
            <div className="py-3 border-b border-slate-800/80 space-y-2 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-slate-200">{serviceTier}</div>
                  <div className="text-[10px] text-slate-500">
                    {sqFt.toLocaleString()} sq ft · {frequency}
                  </div>
                </div>
                <div className="font-mono-numbers font-medium text-slate-100">
                  ${calculation.discountedBase.toLocaleString()}
                </div>
              </div>

              {selectedAddons.map((addId) => {
                const item = LUXURY_ADDONS.find((a) => a.id === addId);
                if (!item) return null;
                return (
                  <div key={addId} className="flex justify-between items-center text-[11px] text-slate-300">
                    <span className="truncate pr-2">↳ {item.label}</span>
                    <span className="font-mono-numbers text-slate-400 shrink-0">+${item.price}</span>
                  </div>
                );
              })}
            </div>

            {/* Calculations Breakdown */}
            <div className="py-3 border-b border-slate-800/80 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono-numbers">${calculation.subtotal.toLocaleString()}</span>
              </div>
              {calculation.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Frequency Discount ({calculation.totalDiscountPercent}%)</span>
                  <span className="font-mono-numbers">-${calculation.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Estimated Sales Tax (8.5%)</span>
                <span className="font-mono-numbers">${calculation.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800">
                <span>Grand Total</span>
                <span className="font-mono-numbers text-amber-400">
                  ${calculation.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-xs text-amber-300/90 pt-1">
                <span>35% Required Deposit</span>
                <span className="font-mono-numbers font-semibold">
                  ${calculation.depositRequired.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment Mode Selector */}
            <div className="pt-3 space-y-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1.5">Collection Mode at POS</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentOption('deposit')}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                      paymentOption === 'deposit'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Collect 35% Deposit
                    <div className="text-[10px] font-mono-numbers">${calculation.depositRequired}</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentOption('full')}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                      paymentOption === 'full'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Collect Full Payment
                    <div className="text-[10px] font-mono-numbers">${calculation.grandTotal}</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Tender / Payment Instrument</label>
                <div className="grid grid-cols-4 gap-1 text-[11px]">
                  {[
                    { id: 'credit_card', label: 'Card/POS' },
                    { id: 'apple_pay', label: 'Apple Pay' },
                    { id: 'wire_ach', label: 'Wire / ACH' },
                    { id: 'check', label: 'Check' },
                  ].map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id as any)}
                      className={`py-1.5 px-1 rounded border text-center transition-colors ${
                        paymentMethod === pm.id
                          ? 'bg-slate-800 border-amber-500 text-amber-300 font-semibold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {pm.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleExecutePOS(false)}
                  className="w-full py-3 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-950/30 transition-all flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    Charge {paymentOption === 'full' ? `$${calculation.grandTotal}` : `$${calculation.depositRequired}`} & Dispatch Crew
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExecutePOS(true)}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5 text-amber-400" />
                  <span>Generate & Send Private Estimate Only</span>
                </button>
              </div>

              <div className="text-[10px] text-center text-slate-500 pt-1">
                Encrypted transaction · Sovereign Touch 100% White-Glove Guarantee
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

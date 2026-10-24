import React, { useState } from 'react';
import { Invoice, InvoiceStatus, Client, InvoiceLineItem } from '../types';
import { 
  Receipt, 
  Printer, 
  Download, 
  Send, 
  Plus, 
  CheckCircle2, 
  CreditCard, 
  Clock, 
  FileText, 
  Sparkles,
  Building,
  DollarSign
} from 'lucide-react';

interface InvoicingViewProps {
  invoices: Invoice[];
  clients: Client[];
  onAddInvoice: (invoice: Invoice) => void;
  onUpdateInvoiceStatus: (invoiceId: string, status: InvoiceStatus, paidMethod?: any) => void;
  activeInvoiceToView: Invoice | null;
  onCloseInvoiceModal: () => void;
  onSelectInvoiceToView: (invoice: Invoice) => void;
}

const INVOICE_STATUS_STYLES: Record<InvoiceStatus, { label: string; textClass: string; bgClass: string }> = {
  draft: { label: 'Draft', textClass: 'text-slate-400', bgClass: 'bg-slate-800 border-slate-700' },
  sent: { label: 'Sent / Awaiting Approval', textClass: 'text-sky-400', bgClass: 'bg-sky-500/10 border-sky-500/30' },
  partially_paid: { label: 'Deposit Paid (Balance Due)', textClass: 'text-amber-400', bgClass: 'bg-amber-500/10 border-amber-500/30' },
  paid: { label: 'Paid in Full', textClass: 'text-emerald-400', bgClass: 'bg-emerald-500/10 border-emerald-500/30' },
  overdue: { label: 'Overdue', textClass: 'text-rose-400', bgClass: 'bg-rose-500/10 border-rose-500/30' },
};

export const InvoicingView: React.FC<InvoicingViewProps> = ({
  invoices,
  clients,
  onAddInvoice,
  onUpdateInvoiceStatus,
  activeInvoiceToView,
  onCloseInvoiceModal,
  onSelectInvoiceToView,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'invoice' | 'estimate'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Invoice Form state
  const [selectedClientId, setSelectedClientId] = useState('');
  const [docType, setDocType] = useState<'invoice' | 'estimate'>('invoice');
  const [serviceDescription, setServiceDescription] = useState('Signature Estate Maintenance & Concierge Detailing');
  const [amount, setAmount] = useState(850);
  const [depositRequired, setDepositRequired] = useState(300);
  const [notes, setNotes] = useState('Payment due upon service completion. Thank you for choosing Sovereign Touch Home Care.');

  const handleCreateDoc = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === selectedClientId) || clients[0];
    if (!client) return;

    const subtotal = amount;
    const taxRate = 0.085;
    const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
    const total = subtotal + taxAmount;

    const lineItems: InvoiceLineItem[] = [
      {
        id: `li-${Date.now()}`,
        description: serviceDescription,
        quantity: 1,
        unitPrice: amount,
        total: amount,
      },
    ];

    const invoiceNumber = docType === 'estimate'
      ? `ST-EST-2026-${Math.floor(100 + Math.random() * 900)}`
      : `ST-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newDoc: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      type: docType,
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email,
      clientPhone: client.phone,
      clientAddress: client.address,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
      items: lineItems,
      subtotal,
      taxRate,
      taxAmount,
      discountAmount: 0,
      total,
      depositRequired,
      depositPaid: 0,
      status: docType === 'estimate' ? 'sent' : 'draft',
      notes,
      serviceTier: serviceDescription,
    };

    onAddInvoice(newDoc);
    setIsCreateModalOpen(false);
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (filterType !== 'all' && inv.type !== filterType) return false;
    if (filterStatus !== 'all' && inv.status !== filterStatus) return false;
    return true;
  });

  const totalPaidRevenue = invoices
    .filter((inv) => inv.status === 'paid' || inv.status === 'partially_paid')
    .reduce((sum, inv) => sum + (inv.status === 'paid' ? inv.total : inv.depositPaid), 0);

  const totalOutstanding = invoices
    .filter((inv) => inv.status !== 'paid' && inv.type === 'invoice')
    .reduce((sum, inv) => sum + (inv.total - inv.depositPaid), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
            Point of Sale Ledger & Billing
          </div>
          <h2 className="text-xl font-serif-luxury font-bold text-white mt-0.5">
            Invoices, Estimates & Receivables
          </h2>
          <div className="text-xs text-slate-400 mt-1">
            Automate estimate delivery, record deposits, and generate printable luxury statements.
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Invoice / Estimate</span>
        </button>
      </div>

      {/* Revenue Snapshot Metric Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 bg-[#0f172a] border border-slate-800 rounded-xl">
          <span className="text-slate-400 text-xs block mb-1">Collected Revenue</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono-numbers">
            ${totalPaidRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Settled payments via Card/Wire</div>
        </div>

        <div className="p-4 bg-[#0f172a] border border-slate-800 rounded-xl">
          <span className="text-slate-400 text-xs block mb-1">Outstanding Receivables</span>
          <div className="text-2xl font-bold text-amber-400 font-mono-numbers">
            ${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Pending post-service balances</div>
        </div>

        <div className="p-4 bg-[#0f172a] border border-slate-800 rounded-xl">
          <span className="text-slate-400 text-xs block mb-1">Active Estimates in Field</span>
          <div className="text-2xl font-bold text-sky-400 font-mono-numbers">
            {invoices.filter((i) => i.type === 'estimate').length} Proposals
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            ${invoices.filter((i) => i.type === 'estimate').reduce((s, i) => s + i.total, 0).toLocaleString()} pipeline volume
          </div>
        </div>
      </div>

      {/* Filter and Tab Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-2 border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-2">
          {/* Document type switch */}
          <div className="flex p-0.5 bg-slate-900 border border-slate-800 rounded-lg">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded ${
                filterType === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Documents
            </button>
            <button
              onClick={() => setFilterType('invoice')}
              className={`px-2.5 py-1 text-xs font-medium rounded ${
                filterType === 'invoice' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Invoices ({invoices.filter((i) => i.type === 'invoice').length})
            </button>
            <button
              onClick={() => setFilterType('estimate')}
              className={`px-2.5 py-1 text-xs font-medium rounded ${
                filterType === 'estimate' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Estimates ({invoices.filter((i) => i.type === 'estimate').length})
            </button>
          </div>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-300 text-xs focus:border-amber-500"
          >
            <option value="all">All Payment Statuses</option>
            <option value="paid">Paid in Full</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="sent">Sent / Awaiting Approval</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <div className="text-slate-500 text-[11px]">
          Showing {filteredInvoices.length} billing records
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-medium border-b border-slate-800 text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Doc #</th>
                <th className="px-4 py-3">Client & Estate</th>
                <th className="px-4 py-3">Service Tier</th>
                <th className="px-4 py-3">Total Amount</th>
                <th className="px-4 py-3">Deposit Status</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Issue Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredInvoices.map((inv) => {
                const statusStyle = INVOICE_STATUS_STYLES[inv.status] || INVOICE_STATUS_STYLES.draft;
                const isEstimate = inv.type === 'estimate';

                return (
                  <tr
                    key={inv.id}
                    onClick={() => onSelectInvoiceToView(inv)}
                    className="hover:bg-slate-850/60 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-mono-numbers font-semibold text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{inv.invoiceNumber}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase">
                        {isEstimate ? 'Estimate' : 'Invoice'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-100">{inv.clientName}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{inv.clientAddress}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      <div>{inv.serviceTier || inv.items[0]?.description}</div>
                      <div className="text-[10px] text-slate-500 font-mono-numbers">
                        {inv.items.length} line item{inv.items.length > 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono-numbers font-bold text-amber-400">
                      ${inv.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 font-mono-numbers text-[11px]">
                      {inv.depositPaid > 0 ? (
                        <span className="text-emerald-400">
                          Paid: ${inv.depositPaid.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          Req: ${inv.depositRequired.toLocaleString()}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${statusStyle.bgClass} ${statusStyle.textClass}`}>
                        {statusStyle.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono-numbers text-[11px]">
                      {inv.issueDate}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectInvoiceToView(inv);
                          }}
                          className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-slate-700"
                          title="View / Print Branded Statement"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        {inv.status !== 'paid' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateInvoiceStatus(inv.id, 'paid', 'credit_card');
                            }}
                            className="px-2 py-1 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 hover:text-white text-[11px] font-medium"
                            title="Collect Full Payment"
                          >
                            Mark Paid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable / Luxury Invoice Viewer Modal */}
      {activeInvoiceToView && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative my-8">
            {/* Action Bar (No-Print) */}
            <div className="no-print flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-400 font-semibold uppercase">
                  {activeInvoiceToView.type === 'estimate' ? 'Estimate Document' : 'Official Statement of Account'}
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-xs text-slate-300 font-mono-numbers">{activeInvoiceToView.invoiceNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  type="button"
                  onClick={onCloseInvoiceModal}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Branded Luxury Paper Canvas */}
            <div className="bg-[#0b0f17] border border-amber-500/20 rounded-xl p-8 text-slate-200 space-y-6">
              {/* Header Lockup */}
              <div className="flex justify-between items-start pb-6 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 text-amber-400 mb-1">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-xl font-serif-luxury font-bold tracking-tight text-white">
                      Sovereign Touch Home Care
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">Luxury Estate Cleaning & Concierge Detailing</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    sovereigntouchhomecare.com · (415) 800-4820 · billing@sovereigntouchhomecare.com
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-serif-luxury font-bold text-amber-400 uppercase">
                    {activeInvoiceToView.type === 'estimate' ? 'ESTIMATE' : 'INVOICE'}
                  </div>
                  <div className="text-xs font-mono-numbers text-slate-300 mt-1">
                    #{activeInvoiceToView.invoiceNumber}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Date: <span className="font-mono-numbers">{activeInvoiceToView.issueDate}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Due: <span className="font-mono-numbers">{activeInvoiceToView.dueDate}</span>
                  </div>
                </div>
              </div>

              {/* Bill To Info */}
              <div className="grid grid-cols-2 gap-6 text-xs pb-4 border-b border-slate-800">
                <div>
                  <div className="text-slate-400 uppercase text-[10px] tracking-wider mb-1 font-semibold">
                    Client / Residence
                  </div>
                  <div className="font-semibold text-white text-sm">{activeInvoiceToView.clientName}</div>
                  <div className="text-slate-300 mt-0.5">{activeInvoiceToView.clientAddress}</div>
                  <div className="text-slate-400 mt-0.5">{activeInvoiceToView.clientPhone} · {activeInvoiceToView.clientEmail}</div>
                </div>

                <div>
                  <div className="text-slate-400 uppercase text-[10px] tracking-wider mb-1 font-semibold">
                    Payment Status
                  </div>
                  <div className="font-semibold text-amber-400 capitalize">
                    {activeInvoiceToView.status.replace('_', ' ')}
                  </div>
                  {activeInvoiceToView.paymentMethod && (
                    <div className="text-slate-300 mt-0.5 capitalize">
                      Tender: {activeInvoiceToView.paymentMethod.replace('_', ' ')}
                    </div>
                  )}
                  {activeInvoiceToView.paidAt && (
                    <div className="text-[11px] text-emerald-400 font-mono-numbers mt-0.5">
                      Settled on {activeInvoiceToView.paidAt.slice(0, 10)}
                    </div>
                  )}
                </div>
              </div>

              {/* Line Items Table */}
              <div className="space-y-3">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-400 uppercase text-[10px] border-b border-slate-800 pb-2">
                    <tr>
                      <th className="py-2">Description</th>
                      <th className="py-2 text-center">Qty</th>
                      <th className="py-2 text-right">Unit Rate</th>
                      <th className="py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono-numbers">
                    {activeInvoiceToView.items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2.5 font-sans text-slate-200">{item.description}</td>
                        <td className="py-2.5 text-center text-slate-300">{item.quantity}</td>
                        <td className="py-2.5 text-right text-slate-300">${item.unitPrice.toLocaleString()}</td>
                        <td className="py-2.5 text-right text-white font-semibold">
                          ${item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Calculation */}
              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <div className="w-64 space-y-2 text-xs font-mono-numbers">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span>${activeInvoiceToView.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Tax (8.5%):</span>
                    <span>${activeInvoiceToView.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                    <span className="font-sans">Grand Total:</span>
                    <span className="text-amber-400">
                      ${activeInvoiceToView.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {activeInvoiceToView.depositPaid > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Deposit Paid:</span>
                      <span>-${activeInvoiceToView.depositPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs font-semibold text-slate-200 pt-1 border-t border-slate-800/80">
                    <span className="font-sans">Balance Remaining:</span>
                    <span>
                      ${(activeInvoiceToView.total - activeInvoiceToView.depositPaid).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Terms and White-Glove Guarantee */}
              <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300">Sovereign White-Glove Guarantee:</div>
                <p>
                  Every Sovereign Touch clean is inspected by a certified QA lead. If any area does not meet your exacting standard, our concierge crew will return within 24 hours to re-detail without fee.
                </p>
                <div className="text-[10px] text-slate-500 pt-2 font-mono-numbers">
                  Remit payment via Wire, ACH, or Sovereign Touch Card Portal · sovereigntouchhomecare.com
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Invoice / Estimate Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-serif-luxury font-bold text-white">
                Generate Invoice or Estimate
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDoc} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Document Type</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:border-amber-500"
                  >
                    <option value="invoice">Official Invoice</option>
                    <option value="estimate">Private Estimate Proposal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Target Client *</label>
                  <select
                    required
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:border-amber-500"
                  >
                    <option value="">-- Choose client --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.residenceType})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Service Line Description</label>
                <input
                  type="text"
                  required
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Service Amount ($)</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:border-amber-500 font-mono-numbers"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Required Deposit ($)</label>
                  <input
                    type="number"
                    value={depositRequired}
                    onChange={(e) => setDepositRequired(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:border-amber-500 font-mono-numbers"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Notes / Terms</label>
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
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors"
                >
                  Generate {docType === 'estimate' ? 'Estimate' : 'Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

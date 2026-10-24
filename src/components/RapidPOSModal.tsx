import React from 'react';
import { Client, Booking, Invoice, Lead } from '../types';
import { PointOfSaleView } from './PointOfSaleView';
import { X, Sparkles } from 'lucide-react';

interface RapidPOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  onAddBooking: (booking: Booking) => void;
  onAddInvoice: (invoice: Invoice) => void;
  onAddLead: (lead: Lead) => void;
  onAddClient: (client: Client) => void;
  onViewInvoice: (invoice: Invoice) => void;
}

export const RapidPOSModal: React.FC<RapidPOSModalProps> = ({
  isOpen,
  onClose,
  clients,
  onAddBooking,
  onAddInvoice,
  onAddLead,
  onAddClient,
  onViewInvoice,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0b0f17] border border-amber-500/30 rounded-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto p-6 shadow-2xl relative my-auto">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 sticky top-0 bg-[#0b0f17] z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-serif-luxury font-bold text-white">
                Sovereign Touch Rapid POS & Service Intake
              </h3>
              <p className="text-[11px] text-slate-400">
                Instant price quoting, booking confirmation, and credit card / wire billing.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <PointOfSaleView
          clients={clients}
          onAddBooking={(b) => {
            onAddBooking(b);
          }}
          onAddInvoice={(i) => {
            onAddInvoice(i);
          }}
          onAddLead={(l) => {
            onAddLead(l);
          }}
          onAddClient={(c) => {
            onAddClient(c);
          }}
          onViewInvoice={(inv) => {
            onViewInvoice(inv);
            onClose();
          }}
        />
      </div>
    </div>
  );
};

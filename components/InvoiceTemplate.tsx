
import React from 'react';
import { HostingRecord, AppSettings } from '../types';

interface InvoiceTemplateProps {
  record: HostingRecord;
  settings: AppSettings;
  forwardRef?: React.Ref<HTMLDivElement>;
}

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ record, settings, forwardRef }) => {
  return (
    <div 
      id="invoice-print-area"
      ref={forwardRef} 
      className="bg-white p-8 md:p-12 shadow-lg rounded-xl max-w-4xl mx-auto text-gray-800 print:shadow-none print:w-full print:p-0 print:max-w-none print:mx-0"
    >
      {/* Branded Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-gray-100 pb-10 mb-10">
        <div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-3">INVOICE</h1>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded">No.</span>
            <p className="text-sm font-bold text-gray-800 tracking-wide">{record.invoiceNumber || 'DRAFT-MODE'}</p>
          </div>
        </div>
        
        <div className="text-right flex flex-col items-end mt-6 sm:mt-0">
          {settings.logoUrl && (
            <div className="mb-4 bg-white p-1 rounded-lg border border-gray-50 shadow-sm max-w-[200px]">
              <img 
                src={settings.logoUrl} 
                alt="Company Logo" 
                className="h-16 w-auto object-contain" 
              />
            </div>
          )}
          <h2 className="text-xl font-black text-gray-900 leading-tight uppercase tracking-tight">{settings.companyName}</h2>
          <div className="mt-2 space-y-0.5">
            <p className="text-xs font-medium text-gray-500 whitespace-pre-line leading-relaxed">{settings.companyAddress}</p>
            <p className="text-xs font-bold text-indigo-600">{settings.companyEmail}</p>
            <p className="text-xs font-medium text-gray-500">{settings.companyPhone}</p>
          </div>
        </div>
      </div>

      {/* Billing Context */}
      <div className="flex flex-col md:flex-row justify-between gap-8 mb-12">
        <div className="flex-1">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 border-b border-gray-50 pb-2">Client Details</h3>
          <p className="font-black text-xl text-gray-900 mb-1">{record.clientName}</p>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-600">{record.email}</p>
            <p className="text-sm font-medium text-gray-500">{record.phone}</p>
            <p className="text-xs font-bold text-indigo-500 mt-2">{record.website}</p>
          </div>
        </div>
        
        <div className="w-full md:w-64 bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Issued On:</span>
              <span className="text-xs font-bold text-gray-800">{record.invoiceDate}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Due Date:</span>
              <span className="text-xs font-bold text-gray-800">{record.validationDate}</span>
            </div>
            <div className="h-px w-full bg-gray-200 my-1"></div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Status:</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${record.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {record.paymentStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 mb-10">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-900 text-white">
              <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest">Service Description</th>
              <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-right">Line Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="py-6 px-6">
                <div className="mb-1">
                  <p className="font-bold text-gray-900">Managed Hosting Renewal</p>
                  <p className="text-xs text-indigo-600 font-bold tracking-tight">{record.website}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                  <span className="flex items-center gap-1.5">Storage: {record.storageGB} GB</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span>Coverage: {record.setupDate} to {record.validationDate}</span>
                </div>
              </td>
              <td className="py-6 px-6 text-right font-black text-gray-900">
                {settings.currency}{record.amount.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Total Calculations */}
      <div className="flex flex-col items-end pt-4">
        <div className="w-full md:w-80 space-y-3">
          <div className="flex justify-between text-sm text-gray-600 font-medium px-2">
            <span>Subtotal</span>
            <span>{settings.currency}{record.amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 font-medium px-2">
            <span>Tax ({settings.taxRate}%)</span>
            <span>{settings.currency}{(record.amount * (settings.taxRate / 100)).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center bg-gray-900 text-white p-6 rounded-2xl shadow-xl shadow-gray-200 mt-4">
            <span className="text-xs font-black uppercase tracking-[0.2em] opacity-60">Total Amount Due</span>
            <span className="text-3xl font-black">
              {settings.currency}{(record.amount * (1 + settings.taxRate / 100)).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Footer */}
      <div className="mt-20 border-t border-gray-100 pt-10 text-center">
        <div className="inline-block px-6 py-2 bg-gray-50 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">
          Official Hosting Invoice
        </div>
        <p className="text-sm font-bold text-gray-800 mb-1">Thank you for your continued partnership!</p>
        <p className="text-xs text-gray-400 font-medium">Please process this payment by {record.validationDate} to avoid service disruption.</p>
        <div className="mt-6 flex justify-center items-center gap-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <span>{settings.companyName}</span>
          <span className="w-1.5 h-1.5 bg-indigo-200 rounded-full"></span>
          <span>{settings.companyEmail}</span>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplate;

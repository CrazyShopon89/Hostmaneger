
import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import InvoiceTemplate from '../components/InvoiceTemplate';
import { 
  Printer, 
  Download, 
  Send, 
  RefreshCw, 
  Loader2, 
  CheckCircle2, 
  X, 
  Mail, 
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { draftInvoiceEmail } from '../services/geminiService';
import { simulateEmailDelivery, EmailPayload } from '../services/emailService';

const Invoices: React.FC = () => {
  const { records, settings, generateAutoInvoices, updateRecord, addNotification } = useData();
  const [selectedId, setSelectedId] = useState<string>(records[0]?.id || '');
  
  // UI States
  const [isDrafting, setIsDrafting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Email Data
  const [emailPayload, setEmailPayload] = useState<EmailPayload>({ to: '', subject: '', body: '' });
  const [deliveryStatus, setDeliveryStatus] = useState('');

  const selectedRecord = records.find(r => r.id === selectedId);

  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => setShowSuccessMessage(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  const handlePrint = () => {
    if (!selectedRecord) return;
    // Small delay ensures reactivity is handled by the browser before printing
    setTimeout(() => {
        window.print();
    }, 50);
  };

  const handleDownload = () => {
    if (!selectedRecord) return;

    const invoiceSummary = `
INVOICE: ${selectedRecord.invoiceNumber || 'DRAFT'}
--------------------------------------------------
FROM:
${settings.companyName}
${settings.companyAddress}
Email: ${settings.companyEmail}
Phone: ${settings.companyPhone}

BILL TO:
${selectedRecord.clientName}
${selectedRecord.email}
${selectedRecord.phone}
Website: ${selectedRecord.website}

DETAILS:
Invoice Date: ${selectedRecord.invoiceDate}
Renewal Due:  ${selectedRecord.validationDate}
Payment:      ${selectedRecord.paymentStatus}

LINE ITEMS:
Hosting Renewal - ${selectedRecord.website}
Storage: ${selectedRecord.storageGB}GB | Period: ${selectedRecord.setupDate} to ${selectedRecord.validationDate}
Amount: ${settings.currency}${selectedRecord.amount.toFixed(2)}

TOTALS:
Subtotal: ${settings.currency}${selectedRecord.amount.toFixed(2)}
Tax (${settings.taxRate}%): ${settings.currency}${(selectedRecord.amount * (settings.taxRate / 100)).toFixed(2)}
TOTAL DUE: ${settings.currency}${(selectedRecord.amount * (1 + settings.taxRate / 100)).toFixed(2)}

--------------------------------------------------
Thank you for choosing ${settings.companyName}.
Contact support: ${settings.companyEmail}
    `.trim();

    const blob = new Blob([invoiceSummary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${selectedRecord.invoiceNumber || 'DRAFT'}_${selectedRecord.clientName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleStartSendWorkflow = async () => {
    if (!selectedRecord) return;
    
    setIsDrafting(true);
    try {
        const fullDraft = await draftInvoiceEmail(selectedRecord, settings);
        
        // Split subject and body if AI provided it in standard format
        const lines = fullDraft.split('\n');
        let subject = `Invoice ${selectedRecord.invoiceNumber || 'Draft'} - ${selectedRecord.website}`;
        let body = fullDraft;

        if (lines[0].toLowerCase().startsWith('subject:')) {
            subject = lines[0].replace(/subject:/i, '').trim();
            body = lines.slice(1).join('\n').trim();
        }

        setEmailPayload({
            to: selectedRecord.email,
            subject: subject,
            body: body
        });
        setShowComposer(true);
    } catch (error) {
        addNotification({
            title: 'Drafting Failed',
            message: 'AI was unable to generate the email draft.',
            type: 'error'
        });
    } finally {
        setIsDrafting(false);
    }
  };

  const handleFinalSend = async () => {
    if (!selectedRecord) return;
    
    setIsSending(true);
    try {
        await simulateEmailDelivery(emailPayload, settings, (msg) => setDeliveryStatus(msg));
        
        updateRecord(selectedRecord.id, {
            invoiceStatus: 'Sent',
            sendingDate: new Date().toISOString().split('T')[0]
        });

        addNotification({
            title: 'Delivered',
            message: `Invoice successfully sent to ${selectedRecord.clientName}.`,
            type: 'success'
        });

        setShowComposer(false);
        setShowSuccessMessage(true);
    } catch (error: any) {
        addNotification({
            title: 'Delivery Error',
            message: error.message,
            type: 'error'
        });
    } finally {
        setIsSending(false);
        setDeliveryStatus('');
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
      {/* Sidebar List */}
      <div className="w-full lg:w-80 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-120px)] overflow-hidden no-print">
         <div className="p-4 border-b border-gray-100">
            <button 
                onClick={generateAutoInvoices}
                className="w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 p-2 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
            >
                <RefreshCw size={16} />
                Run Auto-Generation
            </button>
         </div>
         <div className="flex-1 overflow-y-auto no-scrollbar">
            {records.map(record => (
                <div 
                    key={record.id}
                    onClick={() => {
                        setSelectedId(record.id);
                        setShowSuccessMessage(false);
                    }}
                    className={`p-4 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 ${selectedId === record.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''}`}
                >
                    <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-gray-800 text-sm">{record.invoiceNumber || 'DRAFT'}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${record.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {record.paymentStatus}
                        </span>
                    </div>
                    <div className="text-xs text-gray-600 truncate">{record.clientName}</div>
                    <div className="text-xs text-gray-400 mt-1">{record.validationDate}</div>
                </div>
            ))}
         </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex flex-col h-[calc(100vh-120px)] relative">
         {selectedRecord ? (
            <>
                {/* Actions Toolbar */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-4 flex justify-between items-center no-print">
                    <div className="text-sm text-gray-500">
                        Previewing invoice for <span className="font-semibold text-gray-900">{selectedRecord.clientName}</span>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handlePrint} className="p-2 hover:bg-gray-100 rounded text-gray-600 active:scale-95 transition-all" title="Print / Save as PDF">
                            <Printer size={20} />
                        </button>
                         <button onClick={handleDownload} className="p-2 hover:bg-gray-100 rounded text-gray-600 active:scale-95 transition-all" title="Download Text Summary">
                            <Download size={20} />
                        </button>
                         <button 
                            onClick={handleStartSendWorkflow}
                            disabled={isDrafting}
                            className={`flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-70 transition-all shadow-sm active:scale-95`}
                        >
                            {isDrafting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    AI Drafting...
                                </>
                            ) : (
                                <>
                                    <Send size={16} />
                                    Send to Client
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Local Success Message Alert */}
                {showSuccessMessage && (
                  <div className="mb-4 bg-green-50 border border-green-200 p-4 rounded-xl flex items-center justify-between animate-slide-up shadow-sm no-print">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-green-100 text-green-600 rounded-full">
                        <CheckCircle2 size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-green-800">Delivered Successfully!</p>
                        <p className="text-xs text-green-600">Invoice for {selectedRecord.website} has been sent and recorded.</p>
                      </div>
                    </div>
                    <button onClick={() => setShowSuccessMessage(false)} className="text-green-400 hover:text-green-600 p-1">
                      <X size={16} />
                    </button>
                  </div>
                )}

                {/* Scrollable Invoice Preview */}
                <div className="flex-1 overflow-y-auto bg-gray-100 rounded-xl p-8 border border-gray-200 no-scrollbar print:bg-white print:border-none print:p-0">
                    <InvoiceTemplate record={selectedRecord} settings={settings} />
                </div>
            </>
         ) : (
             <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 no-print">
                 Select an invoice to preview
             </div>
         )}
      </div>

      {/* Email Composer Modal */}
      {showComposer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 no-print">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 text-white rounded-lg">
                            <Mail size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Email Composer</h2>
                            <p className="text-xs text-gray-500">Refine the AI-drafted message before sending</p>
                        </div>
                    </div>
                    <button onClick={() => !isSending && setShowComposer(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                    <div className="grid grid-cols-[80px_1fr] items-center gap-4">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">To</label>
                        <input 
                            type="text" 
                            readOnly
                            className="w-full bg-gray-50 border-0 border-b border-gray-200 p-2 text-sm focus:ring-0 cursor-not-allowed" 
                            value={emailPayload.to}
                        />
                    </div>
                    <div className="grid grid-cols-[80px_1fr] items-center gap-4">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Subject</label>
                        <input 
                            type="text" 
                            className="w-full border-0 border-b border-gray-200 p-2 text-sm focus:ring-0 focus:border-indigo-500 font-medium" 
                            value={emailPayload.subject}
                            onChange={e => setEmailPayload({...emailPayload, subject: e.target.value})}
                        />
                    </div>
                    <div className="pt-4">
                        <textarea 
                            className="w-full h-64 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none leading-relaxed"
                            value={emailPayload.body}
                            onChange={e => setEmailPayload({...emailPayload, body: e.target.value})}
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        {isSending ? (
                            <div className="flex items-center gap-3 text-indigo-600 animate-pulse">
                                <Loader2 size={18} className="animate-spin" />
                                <span className="text-sm font-medium">{deliveryStatus}</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-gray-400 text-xs">
                                <AlertCircle size={14} />
                                <span>Press Send to deliver via {settings.smtpHost}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button 
                            type="button" 
                            disabled={isSending}
                            onClick={() => setShowComposer(false)} 
                            className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button 
                            type="button"
                            disabled={isSending}
                            onClick={handleFinalSend}
                            className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            {isSending ? 'Sending...' : 'Send Now'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;

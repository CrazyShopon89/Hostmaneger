
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import HostingTable from '../components/HostingTable';
import { Plus, X } from 'lucide-react';
import { HostingRecord } from '../types';

const Clients: React.FC = () => {
  const { records, addRecord, updateRecord, deleteRecord, settings, dropdownOptions } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialFormState: Omit<HostingRecord, 'id'> = {
      serialNumber: records.length + 1,
      clientName: '',
      website: '',
      email: '',
      phone: '',
      storageGB: 5,
      setupDate: new Date().toISOString().split('T')[0],
      validationDate: new Date().toISOString().split('T')[0],
      amount: 0,
      status: 'Active',
      invoiceNumber: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      paymentStatus: 'Unpaid',
      invoiceStatus: 'Draft',
      paymentMethod: 'Bank Transfer'
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleEdit = (id: string) => {
    const record = records.find(r => r.id === id);
    if (record) {
        setFormData(record);
        setEditingId(id);
        setIsModalOpen(true);
    }
  };

  const handleDelete = (id: string) => {
      if(window.confirm('Are you sure you want to delete this record?')) {
          deleteRecord(id);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
        updateRecord(editingId, formData);
    } else {
        addRecord(formData);
    }
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Hosting Records</h1>
        <button 
            onClick={() => {
                setEditingId(null);
                setFormData({ ...initialFormState, serialNumber: records.length + 1 });
                setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm active:scale-95"
        >
          <Plus size={18} />
          Add New Client
        </button>
      </div>

      <HostingTable records={records} onEdit={handleEdit} onDelete={handleDelete} />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            {/* Modal Container */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-slide-up overflow-hidden">
                
                {/* Header - Fixed Height */}
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-bold text-gray-800">
                      {editingId ? 'Edit Hosting Record' : 'New Hosting Record'}
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Form Body - Scrollable Area */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 no-scrollbar bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                        <div className="md:col-span-2">
                             <h3 className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">Client Details</h3>
                             <div className="h-px w-full bg-gray-100"></div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-600">Client Name</label>
                            <input required type="text" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-600">Website</label>
                            <input required type="text" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-600">Email Address</label>
                            <input required type="email" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-600">Phone</label>
                            <input type="text" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        </div>

                         <div className="md:col-span-2 mt-4">
                             <h3 className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">Service Configuration</h3>
                             <div className="h-px w-full bg-gray-100"></div>
                        </div>
                         <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-600">Service Status</label>
                            <select className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-white" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                                {dropdownOptions.status.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-600">Storage Capacity (GB)</label>
                            <input required type="number" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={formData.storageGB} onChange={e => setFormData({...formData, storageGB: Number(e.target.value)})} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-600">Initial Setup Date</label>
                            <input required type="date" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={formData.setupDate} onChange={e => setFormData({...formData, setupDate: e.target.value})} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-600">Renewal/Validation Date</label>
                            <input required type="date" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={formData.validationDate} onChange={e => setFormData({...formData, validationDate: e.target.value})} />
                        </div>

                         <div className="md:col-span-2 mt-4">
                             <h3 className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">Billing & Payment</h3>
                             <div className="h-px w-full bg-gray-100"></div>
                        </div>
                         <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-600">Service Fee ({settings.currency})</label>
                            <input required type="number" step="0.01" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-600">Payment Method</label>
                            <select 
                                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-white" 
                                value={formData.paymentMethod} 
                                onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
                            >
                                {dropdownOptions.paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                         <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-600">Payment Status</label>
                             <select 
                                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-white" 
                                value={formData.paymentStatus} 
                                onChange={e => setFormData({...formData, paymentStatus: e.target.value as any})}
                            >
                                <option value="Paid">Paid</option>
                                <option value="Unpaid">Unpaid</option>
                                <option value="Overdue">Overdue</option>
                            </select>
                        </div>
                         <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-600">Invoice Status</label>
                            <select 
                                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-white" 
                                value={formData.invoiceStatus} 
                                onChange={e => setFormData({...formData, invoiceStatus: e.target.value})}
                            >
                                {dropdownOptions.invoiceStatus.map(is => <option key={is} value={is}>{is}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="sticky bottom-0 bg-white pt-6 mt-6 border-t border-gray-50 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                        <button type="submit" className="px-8 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all shadow-md active:scale-95">
                            {editingId ? 'Update Record' : 'Create Record'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Clients;

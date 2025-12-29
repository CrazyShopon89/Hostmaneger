
import React, { useState } from 'react';
import { HostingRecord } from '../types';
import { useData } from '../context/DataContext';
import { Edit2, Trash2, ExternalLink, Mail, Download } from 'lucide-react';

interface HostingTableProps {
  records: HostingRecord[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const HostingTable: React.FC<HostingTableProps> = ({ records, onEdit, onDelete }) => {
  const { settings } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Suspended' | 'Expired'>('All');

  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.website.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || record.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700 border-green-200';
      case 'Suspended': return 'bg-red-100 text-red-700 border-red-200';
      case 'Expired': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'text-green-600 font-medium';
      case 'Unpaid': return 'text-yellow-600 font-medium';
      case 'Overdue': return 'text-red-600 font-bold';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
        <div className="flex gap-4 items-center flex-1">
           <div className="relative flex-1 max-w-md">
             <input
                type="text"
                placeholder="Search clients, websites, or emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
             />
             <svg className="w-4 h-4 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
           </div>
           <select 
             className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 outline-none"
             value={statusFilter}
             onChange={(e) => setStatusFilter(e.target.value as any)}
           >
             <option value="All">All Status</option>
             <option value="Active">Active</option>
             <option value="Suspended">Suspended</option>
             <option value="Expired">Expired</option>
           </select>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto no-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200">Sl.</th>
              <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200">Client Info</th>
              <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200">Status</th>
              <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200">Setup Date</th>
              <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200">Renewal Date</th>
              <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200">Amount</th>
              <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200">Method</th>
              <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200">Payment</th>
              <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredRecords.length > 0 ? filteredRecords.map((record) => (
              <tr key={record.id} className="hover:bg-indigo-50/30 transition-colors group">
                <td className="px-6 py-4 text-xs text-gray-500">{record.serialNumber}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 text-sm">{record.clientName}</span>
                    <a href={`https://${record.website}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline text-xs flex items-center gap-1">
                      {record.website} <ExternalLink size={10} />
                    </a>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusColor(record.status)}`}>
                    {record.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-gray-600">
                  {new Date(record.setupDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-xs text-gray-600">
                  {new Date(record.validationDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-xs font-bold text-gray-900">
                  {settings.currency}{record.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-xs text-gray-500">
                  {record.paymentMethod}
                </td>
                 <td className="px-6 py-4 text-xs">
                  <span className={getPaymentStatusColor(record.paymentStatus)}>
                    {record.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button title="Email Client" className="p-1.5 hover:bg-indigo-100 text-indigo-600 rounded-md transition-colors">
                      <Mail size={14} />
                    </button>
                    <button onClick={() => onEdit(record.id)} title="Edit Record" className="p-1.5 hover:bg-blue-100 text-blue-600 rounded-md transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => onDelete(record.id)} title="Delete Record" className="p-1.5 hover:bg-red-100 text-red-600 rounded-md transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-gray-400 text-sm italic">
                  No records found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HostingTable;

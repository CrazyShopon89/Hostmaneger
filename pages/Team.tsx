import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { User, Plus, Trash2, Shield } from 'lucide-react';

const Team: React.FC = () => {
  const { teamMembers, addTeamMember, removeTeamMember, settings } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Team Member',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTeamMember({
      ...formData,
      role: formData.role as any,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`
    });
    setIsModalOpen(false);
    setFormData({ name: '', email: '', role: 'Team Member' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Team Management</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-colors bg-${settings.themeColor}-600 hover:bg-${settings.themeColor}-700`}
        >
          <Plus size={18} />
          Add Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => (
          <div key={member.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center text-center relative group">
            <button 
                onClick={() => removeTeamMember(member.id)}
                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
            >
                <Trash2 size={18} />
            </button>
            
            <img 
                src={member.avatar} 
                alt={member.name} 
                className="w-20 h-20 rounded-full mb-4 border-4 border-gray-50" 
            />
            <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{member.email}</p>
            
            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${member.role === 'Admin' || member.role === 'Manager' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                <Shield size={12} />
                {member.role}
            </span>
          </div>
        ))}
      </div>

      {/* Add Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">Invite Team Member</h2>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Full Name</label>
                        <input 
                            type="text" 
                            required
                            className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Email Address</label>
                        <input 
                            type="email" 
                            required
                            className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Role</label>
                        <select 
                            className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={formData.role}
                            onChange={e => setFormData({...formData, role: e.target.value})}
                        >
                            <option value="Manager">Manager</option>
                            <option value="Team Member">Team Member</option>
                        </select>
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
                        <button type="submit" className={`flex-1 px-4 py-2 text-white rounded-lg bg-${settings.themeColor}-600 hover:bg-${settings.themeColor}-700`}>Send Invite</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Team;
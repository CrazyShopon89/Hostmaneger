
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Save, Camera, ShieldCheck, AlertTriangle } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { settings } = useData();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatar: '',
  });

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [msg, setMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    updateProfile(formData);
    setTimeout(() => {
      setLoading(false);
      setMsg({ type: 'success', text: 'Profile details updated successfully!' });
    }, 500);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      setMsg({ type: 'error', text: 'New passwords do not match!' });
      return;
    }
    if (passwordData.new.length < 6) {
        setMsg({ type: 'error', text: 'Password must be at least 6 characters long.' });
        return;
    }

    setPasswordLoading(true);
    try {
      await changePassword(passwordData.current, passwordData.new);
      setMsg({ type: 'success', text: 'Password changed successfully! Keep it safe.' });
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to change password.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) return null;

  const themeColorClass = `bg-${settings.themeColor}-600`;
  const themeButtonClass = `bg-${settings.themeColor}-600 hover:bg-${settings.themeColor}-700`;

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Super Admin Profile</h1>
      
      {msg && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-slide-up ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {msg.type === 'success' ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}
              <span className="text-sm font-medium">{msg.text}</span>
              <button onClick={() => setMsg(null)} className="ml-auto text-current opacity-50 hover:opacity-100">&times;</button>
          </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className={`h-32 ${themeColorClass} w-full opacity-90`}></div>
        
        <div className="px-8 pb-8">
          <div className="relative -mt-16 mb-8 flex flex-col items-center sm:flex-row sm:items-end gap-4">
             <div className="relative group">
                <img 
                    src={formData.avatar || user.avatar} 
                    alt="Profile" 
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white"
                />
                <button className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-md border border-gray-100 text-gray-600 hover:text-indigo-600 transition-colors">
                    <Camera size={18} />
                </button>
             </div>
             <div className="text-center sm:text-left pb-2">
                 <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                 <p className="text-sm text-gray-500">{user.role}</p>
             </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <input 
                        type="text" 
                        className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Admin Email</label>
                    <input 
                        type="email" 
                        className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                </div>
                 <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-gray-700">Avatar URL</label>
                    <input 
                        type="text" 
                        className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        value={formData.avatar}
                        placeholder="https://example.com/photo.jpg"
                        onChange={e => setFormData({...formData, avatar: e.target.value})}
                    />
                </div>
             </div>

             <div className="flex justify-end border-b border-gray-100 pb-6">
                 <button 
                    type="submit"
                    disabled={loading}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-medium transition-all shadow-sm ${themeButtonClass}`}
                 >
                    {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={18} />}
                    Update Profile
                 </button>
             </div>
          </form>

          {/* Security / Password Reset */}
          <form onSubmit={handlePasswordSubmit} className="mt-8 space-y-6">
             <div>
                 <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
                     <ShieldCheck size={20} className="text-green-600" />
                     Security & Password
                 </h3>
                 <p className="text-xs text-gray-500 mb-6">Changing your password will update your Super Admin master record.</p>
                 
                 <div className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Current Password</label>
                        <input 
                            type="password" 
                            required
                            placeholder="••••••••"
                            className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-red-200 transition-all"
                            value={passwordData.current}
                            onChange={e => setPasswordData({...passwordData, current: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">New Password</label>
                            <input 
                                type="password" 
                                required
                                placeholder="Min 6 characters"
                                className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                                value={passwordData.new}
                                onChange={e => setPasswordData({...passwordData, new: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                            <input 
                                type="password" 
                                required
                                placeholder="••••••••"
                                className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                                value={passwordData.confirm}
                                onChange={e => setPasswordData({...passwordData, confirm: e.target.value})}
                            />
                        </div>
                    </div>
                 </div>
             </div>

             <div className="flex justify-end pt-2">
                 <button 
                    type="submit"
                    disabled={passwordLoading}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-medium bg-gray-800 hover:bg-black transition-all shadow-md active:scale-95"
                 >
                    {passwordLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Reset Password"}
                 </button>
             </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;

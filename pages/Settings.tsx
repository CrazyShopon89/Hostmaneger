
import React, { useState, useRef } from 'react';
import { useData } from '../context/DataContext';
import { Save, Plus, X, Mail, Globe, Palette, Settings as SettingsIcon, Server, Upload, Trash2, CheckCircle2 } from 'lucide-react';

const Settings: React.FC = () => {
  const { settings, updateSettings, dropdownOptions, updateDropdownOptions } = useData();
  const [localSettings, setLocalSettings] = useState(settings);
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'email' | 'dropdowns'>('general');
  const [showSaved, setShowSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newOption, setNewOption] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<'status' | 'paymentMethods' | 'invoiceStatus'>('status');

  const handleSave = () => {
    updateSettings(localSettings);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File too large. Max size is 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalSettings({ ...localSettings, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLocalSettings({ ...localSettings, logoUrl: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddOption = () => {
      if (!newOption.trim()) return;
      const current = dropdownOptions[activeDropdown];
      if (!current.includes(newOption)) {
          updateDropdownOptions({
              [activeDropdown]: [...current, newOption]
          });
      }
      setNewOption('');
  };

  const handleRemoveOption = (option: string) => {
      const current = dropdownOptions[activeDropdown];
      updateDropdownOptions({
          [activeDropdown]: current.filter(item => item !== option)
      });
  };

  const themeColors = ['indigo', 'blue', 'green', 'purple', 'rose', 'slate'];
  const fontFamilies = ['Inter', 'Roboto', 'Poppins'];

  const tabItemClass = (id: typeof activeTab) => 
    `flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
        activeTab === id 
        ? `border-${settings.themeColor}-600 text-${settings.themeColor}-600 bg-${settings.themeColor}-50/30` 
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
    }`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20 relative">
      {showSaved && (
        <div className="fixed top-20 right-10 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slide-up z-50">
          <CheckCircle2 size={20} />
          <span className="font-bold">Settings saved!</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>
        <button 
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-bold transition-all shadow-md active:scale-95 bg-${settings.themeColor}-600 hover:bg-${settings.themeColor}-700`}
        >
          <Save size={18} />
          Save Changes
        </button>
      </div>

      <div className="flex border-b border-gray-200 bg-white rounded-t-xl overflow-hidden">
          <button onClick={() => setActiveTab('general')} className={tabItemClass('general')}>
              <Globe size={16} />
              Company Info
          </button>
           <button onClick={() => setActiveTab('appearance')} className={tabItemClass('appearance')}>
              <Palette size={16} />
              Branding & UI
          </button>
           <button onClick={() => setActiveTab('email')} className={tabItemClass('email')}>
              <Mail size={16} />
              Email (SMTP)
          </button>
           <button onClick={() => setActiveTab('dropdowns')} className={tabItemClass('dropdowns')}>
              <SettingsIcon size={16} />
              Data Fields
          </button>
      </div>

      {activeTab === 'general' && (
        <div className="bg-white rounded-b-xl shadow-sm border border-gray-200 p-6 space-y-6 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-bold text-gray-700">Company Brand Logo</label>
                    <div className="flex flex-col sm:flex-row items-center gap-6 p-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                        <div className="shrink-0 flex items-center justify-center bg-white border border-gray-100 w-24 h-24 rounded-2xl shadow-sm overflow-hidden p-2">
                            {localSettings.logoUrl ? (
                                <img src={localSettings.logoUrl} alt="Logo Preview" className="w-full h-full object-contain" />
                            ) : (
                                <div className="text-gray-300 flex flex-col items-center gap-1">
                                    <Globe size={32} />
                                    <span className="text-[10px] font-bold uppercase">No Logo</span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 space-y-3 text-center sm:text-left">
                            <div>
                                <h4 className="font-bold text-gray-800">Update Profile Logo</h4>
                                <p className="text-xs text-gray-500">Logo will appear on invoices and sidebar</p>
                            </div>
                            <div className="flex items-center gap-2 justify-center sm:justify-start">
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`px-4 py-2 text-xs font-bold text-white rounded-lg transition-all flex items-center gap-2 bg-${settings.themeColor}-600 hover:bg-${settings.themeColor}-700 shadow-sm`}
                                >
                                    <Upload size={14} />
                                    Choose File
                                </button>
                                {localSettings.logoUrl && (
                                    <button 
                                        onClick={handleRemoveLogo}
                                        className="px-4 py-2 text-xs font-bold text-red-600 border border-red-100 hover:bg-red-50 rounded-lg transition-all flex items-center gap-2"
                                    >
                                        <Trash2 size={14} />
                                        Remove
                                    </button>
                                )}
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                className="hidden" 
                                accept="image/*"
                                onChange={handleLogoUpload}
                            />
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Company Name</label>
                    <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={localSettings.companyName}
                        onChange={e => setLocalSettings({...localSettings, companyName: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Support Email</label>
                    <input 
                        type="email" 
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={localSettings.companyEmail}
                        onChange={e => setLocalSettings({...localSettings, companyEmail: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Phone Number</label>
                    <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={localSettings.companyPhone}
                        onChange={e => setLocalSettings({...localSettings, companyPhone: e.target.value})}
                    />
                </div>
                <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-gray-700">Office Address</label>
                    <textarea 
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={localSettings.companyAddress}
                        onChange={e => setLocalSettings({...localSettings, companyAddress: e.target.value})}
                    />
                </div>
            </div>
        </div>
      )}

      {activeTab === 'appearance' && (
          <div className="bg-white rounded-b-xl shadow-sm border border-gray-200 p-6 space-y-8 animate-slide-up">
             <div>
                 <h3 className="text-lg font-semibold text-gray-800 mb-4">Theme Color</h3>
                 <div className="flex flex-wrap gap-4">
                     {themeColors.map(color => (
                         <button 
                            key={color}
                            onClick={() => setLocalSettings({...localSettings, themeColor: color as any})}
                            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110 ${localSettings.themeColor === color ? 'border-gray-800' : 'border-transparent'}`}
                         >
                             <div className={`w-8 h-8 rounded-full bg-${color}-600`}></div>
                         </button>
                     ))}
                 </div>
             </div>

             <div className="border-t border-gray-100 pt-6">
                 <h3 className="text-lg font-semibold text-gray-800 mb-4">Invoice Format</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Invoice Prefix</label>
                        <input 
                            type="text" 
                            className="w-full border border-gray-300 rounded-lg p-2.5"
                            value={localSettings.invoicePrefix}
                            onChange={e => setLocalSettings({...localSettings, invoicePrefix: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Currency Symbol</label>
                        <input 
                            type="text" 
                            className="w-full border border-gray-300 rounded-lg p-2.5"
                            value={localSettings.currency}
                            onChange={e => setLocalSettings({...localSettings, currency: e.target.value})}
                        />
                    </div>
                     <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Tax Rate (%)</label>
                        <input 
                            type="number" 
                            className="w-full border border-gray-300 rounded-lg p-2.5"
                            value={localSettings.taxRate}
                            onChange={e => setLocalSettings({...localSettings, taxRate: Number(e.target.value)})}
                        />
                    </div>
                 </div>
             </div>
          </div>
      )}

      {activeTab === 'email' && (
        <div className="bg-white rounded-b-xl shadow-sm border border-gray-200 p-6 space-y-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-2 p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-800">
                <Server size={20} />
                <div className="text-sm font-medium">Configure your SMTP server for invoice delivery.</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">SMTP Host</label>
                    <input 
                        type="text" 
                        placeholder="smtp.example.com"
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={localSettings.smtpHost}
                        onChange={e => setLocalSettings({...localSettings, smtpHost: e.target.value})}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Port</label>
                        <input 
                            type="number" 
                            placeholder="587"
                            className="w-full border border-gray-300 rounded-lg p-2.5"
                            value={localSettings.smtpPort}
                            onChange={e => setLocalSettings({...localSettings, smtpPort: Number(e.target.value)})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Encryption</label>
                        <select 
                            className="w-full border border-gray-300 rounded-lg p-2.5"
                            value={localSettings.smtpEncryption}
                            onChange={e => setLocalSettings({...localSettings, smtpEncryption: e.target.value as any})}
                        >
                            <option value="SSL/TLS">SSL/TLS</option>
                            <option value="STARTTLS">STARTTLS</option>
                            <option value="None">None</option>
                        </select>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Username</label>
                    <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded-lg p-2.5"
                        value={localSettings.smtpUser}
                        onChange={e => setLocalSettings({...localSettings, smtpUser: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Password</label>
                    <input 
                        type="password" 
                        className="w-full border border-gray-300 rounded-lg p-2.5"
                        value={localSettings.smtpPass}
                        onChange={e => setLocalSettings({...localSettings, smtpPass: e.target.value})}
                    />
                </div>
            </div>
        </div>
      )}

      {activeTab === 'dropdowns' && (
          <div className="bg-white rounded-b-xl shadow-sm border border-gray-200 p-6 animate-slide-up">
              <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-48 space-y-2">
                      {(['status', 'paymentMethods', 'invoiceStatus'] as const).map(key => (
                          <button
                            key={key}
                            onClick={() => setActiveDropdown(key)}
                            className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeDropdown === key ? `bg-${settings.themeColor}-50 text-${settings.themeColor}-700` : 'hover:bg-gray-50 text-gray-600'}`}
                          >
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </button>
                      ))}
                  </div>

                  <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">Manage Options</h3>
                      <div className="flex gap-2 mb-4">
                          <input 
                            type="text" 
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Add new option..."
                            value={newOption}
                            onChange={(e) => setNewOption(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddOption()}
                          />
                          <button onClick={handleAddOption} className={`bg-${settings.themeColor}-600 text-white p-2 rounded-lg hover:bg-${settings.themeColor}-700 shadow-sm transition-all active:scale-95`}>
                              <Plus size={20} />
                          </button>
                      </div>
                      <div className="space-y-2 max-h-80 overflow-y-auto pr-2 no-scrollbar">
                          {dropdownOptions[activeDropdown].map((option) => (
                              <div key={option} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100 group">
                                  <span className="text-gray-700 text-sm">{option}</span>
                                  <button onClick={() => handleRemoveOption(option)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors">
                                      <X size={16} />
                                  </button>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Settings;

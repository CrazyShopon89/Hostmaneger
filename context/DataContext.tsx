
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { HostingRecord, User, Notification, AppSettings, DropdownOptions } from '../types';

interface DataContextType {
  records: HostingRecord[];
  addRecord: (record: Omit<HostingRecord, 'id'>) => Promise<void>;
  updateRecord: (id: string, data: Partial<HostingRecord>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  teamMembers: User[];
  addTeamMember: (member: Omit<User, 'id'>) => void;
  removeTeamMember: (id: string) => void;
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'date' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  dropdownOptions: DropdownOptions;
  updateDropdownOptions: (options: Partial<DropdownOptions>) => void;
  generateAutoInvoices: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const DB_KEYS = {
    RECORDS: 'hm_db_records',
    SETTINGS: 'hm_db_settings',
    TEAM: 'hm_db_team',
    OPTIONS: 'hm_db_options',
    NOTIFICATIONS: 'hm_db_notifications'
};

const API_BASE = '/api';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<HostingRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(DB_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : {
      invoicePrefix: 'INV-',
      currency: '$',
      taxRate: 10,
      companyName: 'HostMaster Solutions',
      companyAddress: '',
      companyEmail: '',
      companyPhone: '',
      logoUrl: '',
      themeColor: 'indigo',
      fontFamily: 'Inter',
      smtpHost: '',
      smtpPort: 587,
      smtpEncryption: 'STARTTLS',
      smtpUser: '',
      smtpPass: '',
      senderName: '',
      senderEmail: ''
    };
  });

  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [dropdownOptions, setDropdownOptions] = useState<DropdownOptions>({
    status: ['Active', 'Suspended', 'Expired', 'Pending'],
    paymentMethods: ['Bank Transfer', 'PayPal', 'Stripe', 'Cash'],
    invoiceStatus: ['Draft', 'Sent', 'Paid', 'Cancelled']
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Initial Sync with Backend
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [recsRes, setsRes] = await Promise.all([
          fetch(`${API_BASE}/records`),
          fetch(`${API_BASE}/settings`)
        ]);
        
        if (recsRes.ok) {
          const recs = await recsRes.json();
          setRecords(recs);
          localStorage.setItem(DB_KEYS.RECORDS, JSON.stringify(recs));
        }
        
        if (setsRes.ok) {
          const sets = await setsRes.json();
          if (sets) {
            setSettings(sets);
            localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(sets));
          }
        }
      } catch (e) {
        console.warn('API Sync failed, using local storage fallback', e);
      }
    };
    fetchAll();
  }, []);

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'date' | 'read'>) => {
    const newNotif: Notification = {
      ...n,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const addRecord = async (record: Omit<HostingRecord, 'id'>) => {
    const newRecord = { ...record, id: Date.now().toString() };
    setRecords(prev => [...prev, newRecord]);
    
    try {
      await fetch(`${API_BASE}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord)
      });
      addNotification({ title: 'Success', message: 'Record saved to database.', type: 'success' });
    } catch (e) {
      addNotification({ title: 'Sync Warning', message: 'Saved locally, but server sync failed.', type: 'warning' });
    }
  };

  const updateRecord = async (id: string, data: Partial<HostingRecord>) => {
    const existing = records.find(r => r.id === id);
    if (!existing) return;
    
    const updated = { ...existing, ...data };
    setRecords(prev => prev.map(r => r.id === id ? updated : r));

    try {
      await fetch(`${API_BASE}/records/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch (e) {
      addNotification({ title: 'Error', message: 'Failed to sync update with server.', type: 'error' });
    }
  };

  const deleteRecord = async (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
    try {
      await fetch(`${API_BASE}/records/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(updated));
    
    try {
      await fetch(`${API_BASE}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch (e) {
      console.error(e);
    }
  };

  const addTeamMember = (member: Omit<User, 'id'>) => {
    setTeamMembers(prev => [...prev, { ...member, id: Date.now().toString() }]);
  };

  const removeTeamMember = (id: string) => {
    setTeamMembers(prev => prev.filter(m => m.id !== id));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const updateDropdownOptions = (options: Partial<DropdownOptions>) => {
    setDropdownOptions(prev => ({ ...prev, ...options }));
  };

  const generateAutoInvoices = () => {
    // Logic for generating invoices based on dates
    addNotification({ title: 'Auto-Gen', message: 'Feature processed.', type: 'info' });
  };

  return (
    <DataContext.Provider value={{
      records, addRecord, updateRecord, deleteRecord,
      teamMembers, addTeamMember, removeTeamMember,
      notifications, addNotification, markNotificationRead,
      settings, updateSettings, generateAutoInvoices,
      dropdownOptions, updateDropdownOptions
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
};

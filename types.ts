
export interface HostingRecord {
  id: string;
  serialNumber: number;
  clientName: string;
  website: string;
  email: string;
  phone: string;
  storageGB: number;
  setupDate: string; // YYYY-MM-DD
  validationDate: string; // Renewal Date YYYY-MM-DD
  amount: number;
  status: string;
  invoiceNumber: string;
  invoiceDate: string;
  paidDate?: string;
  sendingDate?: string;
  paymentStatus: 'Paid' | 'Unpaid' | 'Overdue';
  invoiceStatus: string;
  paymentMethod: string;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Team Member';
  avatar?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  date: string;
  read: boolean;
}

export interface AppSettings {
  invoicePrefix: string;
  currency: string;
  taxRate: number;
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  companyPhone: string;
  logoUrl: string;
  themeColor: 'indigo' | 'blue' | 'green' | 'purple' | 'rose' | 'slate';
  fontFamily: 'Inter' | 'Roboto' | 'Poppins';
  // SMTP Settings
  smtpHost: string;
  smtpPort: number;
  smtpEncryption: 'SSL/TLS' | 'STARTTLS' | 'None';
  smtpUser: string;
  smtpPass: string;
  senderName: string;
  senderEmail: string;
}

export interface DropdownOptions {
  status: string[];
  paymentMethods: string[];
  invoiceStatus: string[];
}

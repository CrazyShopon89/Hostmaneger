
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Server, 
  FileText, 
  Settings, 
  Users,
} from 'lucide-react';
import { useData } from '../context/DataContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { settings } = useData();
  
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/clients', label: 'Hosting Records', icon: Server },
    { path: '/invoices', label: 'Invoices', icon: FileText },
    { path: '/team', label: 'Team', icon: Users },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const getThemeColorClass = (type: 'bg' | 'text' | 'border') => {
     const color = settings.themeColor || 'indigo';
     if (type === 'bg') return `bg-${color}-50`;
     if (type === 'text') return `text-${color}-600`;
     if (type === 'border') return `border-${color}-200`;
     return '';
  };

  const logoColorClass = `bg-${settings.themeColor || 'indigo'}-600`;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col h-screen sticky top-0 no-print">
      <div className="p-6 border-b border-gray-100 flex items-center gap-2">
        {settings.logoUrl ? (
            <img src={settings.logoUrl} alt="Logo" className="w-8 h-8 object-contain rounded" />
        ) : (
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold ${logoColorClass}`}>
            HM
            </div>
        )}
        <span className="text-xl font-bold text-gray-800 truncate">{settings.companyName || 'HostMaster'}</span>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                active 
                  ? `${getThemeColorClass('bg')} ${getThemeColorClass('text')}`
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;

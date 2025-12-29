
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import { DataProvider, useData } from './context/DataContext.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Clients from './pages/Clients.tsx';
import Invoices from './pages/Invoices.tsx';
import Settings from './pages/Settings.tsx';
import Team from './pages/Team.tsx';
import Profile from './pages/Profile.tsx';
import Login from './pages/Login.tsx';
import AIAssistant from './components/AIAssistant.tsx';
import { 
  Bell, 
  LogOut, 
  User, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Clock,
  Check
} from 'lucide-react';
import { Notification } from './types.ts';

const Header: React.FC = () => {
  const { notifications, markNotificationRead, settings } = useData();
  const { user, logout } = useAuth();
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  if (!user) return null;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={18} className="text-green-500" />;
      case 'error': return <AlertCircle size={18} className="text-red-500" />;
      case 'warning': return <AlertTriangle size={18} className="text-yellow-500" />;
      default: return <Info size={18} className="text-blue-500" />;
    }
  };

  const handleNotificationClick = (n: Notification) => {
    markNotificationRead(n.id);
    setSelectedNotification(n);
    setShowNotifs(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-30 no-print">
       <button className="md:hidden text-gray-600">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
       </button>
       <h2 className="text-lg font-semibold text-gray-700 hidden md:block">Admin Panel</h2>
       <div className="flex items-center gap-4">
           <div className="relative">
              <button onClick={() => setShowNotifs(!showNotifs)} className="p-2 rounded-full hover:bg-gray-100 text-gray-600 relative transition-colors">
                  <Bell size={20} />
                  {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
              </button>
              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-40">
                    <div className="px-4 py-2 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                        <span className="font-bold text-sm text-gray-800">Notifications</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto no-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-xs text-gray-400">No new alerts.</p>
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} onClick={() => handleNotificationClick(n)} className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 flex gap-3 ${!n.read ? 'bg-indigo-50/30' : ''}`}>
                                    <div className="mt-0.5">{getNotificationIcon(n.type)}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate text-gray-900">{n.title}</p>
                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
              )}
           </div>
           <div className="relative">
              <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-lg transition-colors">
                  <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`} alt={user.name} className="w-8 h-8 rounded-full border border-gray-200" />
                  <div className="hidden md:block text-left">
                      <div className="text-sm text-gray-700 font-medium leading-none">{user.name}</div>
                  </div>
              </button>
              {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-40">
                      <Link to="/profile" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <User size={16} /> My Profile
                      </Link>
                      <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                          <LogOut size={16} /> Log Out
                      </button>
                  </div>
              )}
           </div>
       </div>
    </header>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const Layout: React.FC = () => {
    const { user } = useAuth();
    if (!user) return <Login />;
    return (
        <div className="flex min-h-screen bg-[#f3f4f6]">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Header />
                <main className="flex-1 p-6 overflow-y-auto overflow-x-hidden no-scrollbar">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/clients" element={<Clients />} />
                        <Route path="/invoices" element={<Invoices />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/team" element={<Team />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="*" element={<div className="text-center mt-20 text-gray-500">Page not found</div>} />
                    </Routes>
                </main>
            </div>
            <AIAssistant />
        </div>
    );
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
           <Routes>
             <Route path="/login" element={<Login />} />
             <Route path="/*" element={<ProtectedRoute><Layout /></ProtectedRoute>} />
           </Routes>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;

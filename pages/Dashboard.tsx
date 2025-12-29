
import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import StatCard from '../components/StatCard';
import { 
    Users, 
    Wallet, 
    AlertCircle, 
    CheckCircle
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
  const { records, settings } = useData();

  const stats = useMemo(() => {
    const totalClients = records.length;
    const totalRevenue = records.reduce((acc, curr) => acc + curr.amount, 0);
    const overdue = records.filter(r => r.paymentStatus === 'Overdue' || r.paymentStatus === 'Unpaid').length;
    const upcomingRenewals = records.filter(r => {
       const d = new Date(r.validationDate);
       const now = new Date();
       const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 3600 * 24));
       return diff > 0 && diff <= 30;
    }).length;
    
    const statusData = [
      { name: 'Paid', value: records.filter(r => r.paymentStatus === 'Paid').length, color: '#10B981' },
      { name: 'Unpaid', value: records.filter(r => r.paymentStatus === 'Unpaid').length, color: '#F59E0B' },
      { name: 'Overdue', value: records.filter(r => r.paymentStatus === 'Overdue').length, color: '#EF4444' },
    ];

    return { totalClients, totalRevenue, overdue, upcomingRenewals, statusData };
  }, [records]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
            <p className="text-sm text-gray-500">Welcome back to your administration panel</p>
        </div>
        <div className="flex items-center gap-3">
             <span className="text-xs text-gray-400 bg-white border border-gray-100 px-3 py-1.5 rounded-lg shadow-sm font-medium">
               Last active: Just now
             </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Clients" 
          value={stats.totalClients} 
          icon={Users} 
          trend="+2 new this month" 
          color="blue" 
        />
        <StatCard 
          title="Expected Revenue" 
          value={`${settings.currency}${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} 
          icon={Wallet} 
          color="green" 
        />
        <StatCard 
          title="Upcoming Renewals" 
          value={stats.upcomingRenewals} 
          icon={AlertCircle} 
          trend="Action suggested"
          color="yellow" 
        />
        <StatCard 
          title="Pending Payments" 
          value={stats.overdue} 
          icon={CheckCircle} 
          color="red" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Payment Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Revenue Projection</h3>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                    { name: 'Jan', amt: 2400 },
                    { name: 'Feb', amt: 1398 },
                    { name: 'Mar', amt: 9800 },
                    { name: 'Apr', amt: 3908 },
                    { name: 'May', amt: 4800 },
                    { name: 'Jun', amt: 3800 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f3f4f6'}} formatter={(value: number) => [`${settings.currency}${value}`, 'Amount']} />
                <Bar dataKey="amt" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

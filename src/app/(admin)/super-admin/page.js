"use client";
import React from 'react';
import StatCard from '@/components/admin/StatCard';
import { 
  Users, Store, UserCheck, Building2, 
  Package, CheckCircle, Truck, AlertCircle, 
  ClipboardList, History, ArrowLeftRight, Map, LayoutGrid, Timer,
  DollarSign, Wallet, CreditCard, TrendingUp, Banknote, Receipt,
  UserPlus
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';

// Dummy Data for Line Chart
const logisticsData = [
  { date: '16 Oct', booking: 400, delivery: 240 },
  { date: '17 Oct', booking: 300, delivery: 139 },
  { date: '18 Oct', booking: 200, delivery: 980 },
  { date: '19 Oct', booking: 278, delivery: 390 },
  { date: '20 Oct', booking: 189, delivery: 480 },
  { date: '21 Oct', booking: 239, delivery: 380 },
  { date: '22 Oct', booking: 349, delivery: 430 },
];

// Dummy Data for Donut Chart
const operationalData = [
  { name: 'Delivered Complete', value: 400, color: '#10B981' },
  { name: 'Processing Loop', value: 300, color: '#3B82F6' },
  { name: 'Partial Delivery', value: 200, color: '#F59E0B' },
  { name: 'Cancelled Parcels', value: 100, color: '#EF4444' },
];

// Dummy Data for Recent Merchants
const recentMerchants = [
  { company: 'Meru', name: 'fatima jamant', phone: '01862399739' },
  { company: 'NK fashion', name: 'Md Asman khaten', phone: '01764864276' },
  { company: 'Tshop', name: 'Md Sajon', phone: '01712675370' },
  { company: 'Shaq By Mim', name: 'Sanjida Mim', phone: '01348070023' },
  { company: 'Fast Delivery', name: 'Rabbani Hasan', phone: '01903077390' },
];

// Dummy Data for Recent Riders
const recentRiders = [
  { name: 'Dolman Mridha', phone: '01347510039', joinDate: '28 Jul, 2026' },
  { name: 'Outside Rider', phone: '01601-822467', joinDate: '27 Jul, 2026' },
  { name: 'Hasan Ahmed', phone: '01348236542', joinDate: '23 Jul, 2026' },
  { name: 'Demo Rider 1', phone: '01000000000', joinDate: '1 Jul, 2026' },
];

export default function SuperAdminDashboard() {
  return (
    <div className="space-y-8 pb-10">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Super Admin Control Panel</h1>
        <div className="text-sm text-gray-500">
          Home / <span className="text-slate-800 font-medium">Dashboard</span>
        </div>
      </div>

      {/* Section 1: Core Entities */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
          <h2 className="text-lg font-semibold text-slate-700">Core Entities</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Rider" value="0" icon={<Users size={24} />} color="bg-gradient-to-br from-orange-400 to-orange-600" linkText="View List" linkPath="/super-admin/riders" />
          <StatCard title="Total Merchant" value="0" icon={<Store size={24} />} color="bg-gradient-to-br from-green-400 to-green-600" linkText="View List" linkPath="/super-admin/merchants" />
          <StatCard title="Active Merchants" value="0" icon={<UserCheck size={24} />} color="bg-gradient-to-br from-sky-400 to-sky-600" linkText="Manage" linkPath="#" />
          <StatCard title="Total Branch" value="0" icon={<Building2 size={24} />} color="bg-gradient-to-br from-purple-400 to-purple-600" linkText="View Operations" linkPath="/super-admin/branches" />
        </div>
      </section>

      {/* Section 2: Analytics Charts */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
          <h2 className="text-lg font-semibold text-slate-700">Super Admin Logistics & Performance Analytics</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-md font-bold text-slate-800 mb-6">Last 7 Days Logistics Trend (Booking vs Delivery Ratio)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={logisticsData}>
                  <defs>
                    <linearGradient id="colorBooking" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDelivery" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                  <Tooltip />
                  <Legend verticalAlign="top" align="right" height={36}/>
                  <Area type="monotone" dataKey="booking" stroke="#3B82F6" fillOpacity={1} fill="url(#colorBooking)" strokeWidth={3} />
                  <Area type="monotone" dataKey="delivery" stroke="#10B981" fillOpacity={1} fill="url(#colorDelivery)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-md font-bold text-slate-800 mb-6">Today's Operational Share</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={operationalData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {operationalData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Operational Logistics */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
          <h2 className="text-lg font-semibold text-slate-700">Operational Logistics</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Today Pickup Req." value="0" icon={<Package size={24} />} color="bg-gradient-to-br from-orange-400 to-orange-600" linkText="Details" linkPath="#" />
          <StatCard title="Today Pickup Done" value="0" icon={<CheckCircle size={24} />} color="bg-gradient-to-br from-green-400 to-green-600" linkText="Details" linkPath="#" />
          <StatCard title="Total Pickup Done" value="0" icon={<Truck size={24} />} color="bg-gradient-to-br from-sky-400 to-sky-600" linkText="Details" linkPath="#" />
          <StatCard title="Prev. Pending Parcel" value="0" icon={<AlertCircle size={24} />} color="bg-gradient-to-br from-purple-400 to-purple-600" linkText="Review" linkPath="#" />
          <StatCard title="Assigned For Delivery" value="0" icon={<ClipboardList size={24} />} color="bg-gradient-to-br from-orange-400 to-orange-600" linkText="Track" linkPath="#" />
          <StatCard title="Today Delivered" value="0" icon={<CheckCircle size={24} />} color="bg-gradient-to-br from-green-400 to-green-600" linkText="Details" linkPath="#" />
          <StatCard title="Today Partial Delv." value="0" icon={<AlertCircle size={24} />} color="bg-gradient-to-br from-sky-400 to-sky-600" linkText="Details" linkPath="#" />
          <StatCard title="Today Cancel Parcel" value="0" icon={<AlertCircle size={24} />} color="bg-gradient-to-br from-purple-400 to-purple-600" linkText="Details" linkPath="#" />
          <StatCard title="Today Pending Delv." value="0" icon={<Timer size={24} />} color="bg-gradient-to-br from-orange-400 to-orange-600" linkText="Check" linkPath="#" />
          <StatCard title="Total Delivered" value="0" icon={<History size={24} />} color="bg-gradient-to-br from-green-400 to-green-600" linkText="History" linkPath="#" />
          <StatCard title="Total Partial Delv." value="0" icon={<History size={24} />} color="bg-gradient-to-br from-sky-400 to-sky-600" linkText="History" linkPath="#" />
          <StatCard title="Total Cancel Parcel" value="0" icon={<History size={24} />} color="bg-gradient-to-br from-purple-400 to-purple-600" linkText="History" linkPath="#" />
          <StatCard title="Total Returned" value="0" icon={<ArrowLeftRight size={24} />} color="bg-gradient-to-br from-orange-400 to-orange-600" linkText="Details" linkPath="#" />
          <StatCard title="Waiting For Return" value="0" icon={<Timer size={24} />} color="bg-gradient-to-br from-green-400 to-green-600" linkText="Details" linkPath="#" />
          <StatCard title="Merchant Overview" value="0" icon={<LayoutGrid size={24} />} color="bg-gradient-to-br from-sky-400 to-sky-600" linkText="Open Insights" linkPath="#" />
          <StatCard title="Areawise Overview" value="0" icon={<Map size={24} />} color="bg-gradient-to-br from-purple-400 to-purple-600" linkText="Open Map List" linkPath="#" />
        </div>
      </section>

      {/* Section 4: Financial Analytics */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-green-600 rounded-full"></div>
          <h2 className="text-lg font-semibold text-slate-700">Financial Analytics & Cash Flow</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Today's Collection" value="৳ 0.00" icon={<DollarSign size={24} />} color="bg-gradient-to-br from-orange-400 to-orange-600" linkText="Customer Count" linkPath="#" />
          <StatCard title="Total Collection" value="৳ 0.00" icon={<Wallet size={24} />} color="bg-gradient-to-br from-green-400 to-green-600" linkText="Gross Aggregated" linkPath="#" />
          <StatCard title="Today Paid Merchant" value="৳ 0.00" icon={<CreditCard size={24} />} color="bg-gradient-to-br from-sky-400 to-sky-600" linkText="Disbursed Today" linkPath="#" />
          <StatCard title="Total Paid Merchant" value="৳ 0.00" icon={<TrendingUp size={24} />} color="bg-gradient-to-br from-purple-400 to-purple-600" linkText="Statement" linkPath="#" />
          <StatCard title="Today Pending Amt." value="৳ 0.00" icon={<Banknote size={24} />} color="bg-gradient-to-br from-orange-400 to-orange-600" linkText="Audit Pay" linkPath="#" />
          <StatCard title="Today Total Income" value="৳ 0.00" icon={<Receipt size={24} />} color="bg-gradient-to-br from-green-400 to-green-600" linkText="Net Operational" linkPath="#" />
          <StatCard title="Total Income Amt." value="৳ 0.00" icon={<TrendingUp size={24} />} color="bg-gradient-to-br from-sky-400 to-sky-600" linkText="Statement" linkPath="#" />
          <StatCard title="Total Expense" value="৳ 0.00" icon={<DollarSign size={24} />} color="bg-gradient-to-br from-purple-400 to-purple-600" linkText="Ledger" linkPath="#" />
        </div>
      </section>

      {/* Section 5: Recent System Onboarding Activity */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-teal-500 rounded-full"></div>
          <h2 className="text-lg font-semibold text-slate-700">Recent System Onboarding Activity</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Merchants Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
              <UserPlus size={18} className="text-teal-600" />
              <h3 className="font-bold text-slate-800">Recent Registered Merchants</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Merchant Name</th>
                    <th className="px-4 py-3">Phone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentMerchants.map((m, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-slate-600">{m.company}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{m.name}</td>
                      <td className="px-4 py-3 text-slate-600">{m.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Riders Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
              <UserPlus size={18} className="text-teal-600" />
              <h3 className="font-bold text-slate-800">Recent Registered Riders</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3">Rider Name</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Join Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentRiders.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800">{r.name}</td>
                      <td className="px-4 py-3 text-slate-600">{r.phone}</td>
                      <td className="px-4 py-3 text-slate-600">{r.joinDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Filter, Edit, Trash2, Download, Printer, Upload, Store, Calendar, Eye } from 'lucide-react';

const dummyPickupParcels = [
  { id: 'CR26115M', merchant: 'Fatima Jamant', address: 'House 12, Road 5, Dhanmondi', pickupTime: '11:00 AM', status: 'pending', parcelsCount: 5 },
  { id: 'CR26118Q', merchant: 'Md Sajon', address: 'Shop 4, Agrabad Market, CTG', pickupTime: '12:30 PM', status: 'pending', parcelsCount: 12 },
  { id: 'CR26120S', merchant: 'Sanjida Mim', address: 'House 45, Road 2, Mirpur 10', pickupTime: '02:00 PM', status: 'picked_up', parcelsCount: 3 },
  { id: 'CR26122U', merchant: 'Rabbani Hasan', address: 'Plot 10, Sector 4, Uttara', pickupTime: '03:30 PM', status: 'pending', parcelsCount: 8 },
  { id: 'CR26125X', merchant: 'Fatima Jamant', address: 'House 12, Road 5, Dhanmondi', pickupTime: '05:00 PM', status: 'pending', parcelsCount: 2 },
];

export default function MerchantPickupPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handlePrint = () => window.print();
  const handleBulkImport = () => fileInputRef.current.click();

  const handleExportCSV = () => {
    const headers = ["Consignment ID,Merchant,Pickup Address,Time,Parcels Count,Status\n"];
    const rows = dummyPickupParcels.map(p => `${p.id},${p.merchant},${p.address},${p.pickupTime},${p.parcelsCount},${p.status}`).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + headers.join("") + rows;
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "merchant_pickup_list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredPickups = dummyPickupParcels.filter(pickup => 
    pickup.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pickup.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pickup.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <input type="file" ref={fileInputRef} onChange={(e) => alert(`Selected file: ${e.target.files[0].name}`)} className="hidden" accept=".csv, .xlsx" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Merchant Today Pickup</h1>
          <p className="text-sm text-gray-500">Home / Admin / <span className="text-slate-800 font-medium">Merchant Pickup</span></p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handlePrint} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all shadow-sm">
            <Printer size={16} /> Print
          </button>
          <button onClick={handleBulkImport} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all shadow-sm">
            <Upload size={16} /> Bulk Import
          </button>
          <button onClick={() => router.push('/admin/parcels')} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md">
            <Store size={18} /> Manage All Parcels
          </button>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400"><Search size={18} /></span>
          <input 
            type="text" 
            placeholder="Search by merchant, address or ID..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-all">
            <Filter size={16} /> Filter
          </button>
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-all">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-blue-600" />
            <h3 className="font-semibold text-slate-700">Today's Scheduled Pickups</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
              <tr className="uppercase text-[11px] tracking-wider">
                <th className="px-6 py-4">Consignment ID</th>
                <th className="px-6 py-4">Merchant Name</th>
                <th className="px-6 py-4">Pickup Address</th>
                <th className="px-6 py-4">Scheduled Time</th>
                <th className="px-6 py-4 text-center">Parcels Count</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPickups.length > 0 ? (
                filteredPickups.map((pickup, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-blue-600">{pickup.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{pickup.merchant}</td>
                    <td className="px-6 py-4 text-slate-600">{pickup.address}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{pickup.pickupTime}</td>
                    <td className="px-6 py-4 text-center font-bold text-slate-800">{pickup.parcelsCount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium 
                        ${pickup.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                        {pickup.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View Details">
                          <Eye size={16} />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Cancel Pickup">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="px-6 py-10 text-center text-gray-500">No pickups scheduled for today.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
          <p className="text-xs text-gray-500">Showing 1 to {filteredPickups.length} of {filteredPickups.length} entries</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-50 transition-all" disabled>Previous</button>
            <button className="px-3 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-100 transition-all">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Filter, Edit, Trash2, Download, Printer, Upload, Package, Truck, Eye } from 'lucide-react';

const dummyParcels = [
  { id: 'CR26108F', merchant: 'Fatima Jamant', recipient: 'Jashim Ali', destination: 'Dhaka', status: 'pending', date: '28 Jul, 2026' },
  { id: 'CR26109G', merchant: 'Md Sajon', recipient: 'Sumi Akter', destination: 'Chattogram', status: 'picked_up', date: '27 Jul, 2026' },
  { id: 'CR26110H', merchant: 'Sanjida Mim', recipient: 'Karim Ullah', destination: 'Sylhet', status: 'in_transit', date: '26 Jul, 2026' },
  { id: 'CR26111I', merchant: 'Rabbani Hasan', recipient: 'Rahim Ahmed', destination: 'Rajshahi', status: 'ready_for_delivery', date: '25 Jul, 2026' },
  { id: 'CR26112J', merchant: 'Fatima Jamant', recipient: 'Hasan Ali', destination: 'Khulna', status: 'delivered', date: '24 Jul, 2026' },
  { id: 'CR26113K', merchant: 'Md Sajon', recipient: 'Mitu Akter', destination: 'Barishal', status: 'returned', date: '23 Jul, 2026' },
  { id: 'CR26114L', merchant: 'Sanjida Mim', recipient: 'Suman Das', destination: 'Rangpur', status: 'cancelled', date: '22 Jul, 2026' },
];

export default function AllParcelPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handlePrint = () => window.print();
  const handleAddParcel = () => router.push('/parcels/new');
  const handleBulkImport = () => fileInputRef.current.click();

  const handleExportCSV = () => {
    const headers = ["Consignment ID,Merchant,Recipient,Destination,Status,Date\n"];
    const rows = dummyParcels.map(p => `${p.id},${p.merchant},${p.recipient},${p.destination},${p.status},${p.date}`).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + headers.join("") + rows;
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "all_parcels_list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredParcels = dummyParcels.filter(parcel => 
    parcel.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parcel.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parcel.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parcel.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Status Badge Color Mapper
  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'picked_up': return 'bg-blue-100 text-blue-700';
      case 'in_transit': return 'bg-purple-100 text-purple-700';
      case 'ready_for_delivery': return 'bg-indigo-100 text-indigo-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'returned': return 'bg-orange-100 text-orange-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <input type="file" ref={fileInputRef} onChange={(e) => alert(`Selected file: ${e.target.files[0].name}`)} className="hidden" accept=".csv, .xlsx" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">All Parcel List</h1>
          <p className="text-sm text-gray-500">Home / Admin / <span className="text-slate-800 font-medium">All Parcels</span></p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handlePrint} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all shadow-sm">
            <Printer size={16} /> Print
          </button>
          <button onClick={handleBulkImport} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all shadow-sm">
            <Upload size={16} /> Bulk Import
          </button>
          <button onClick={handleAddParcel} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md">
            <Plus size={18} /> Add Parcel
          </button>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400"><Search size={18} /></span>
          <input 
            type="text" 
            placeholder="Search by ID, Merchant or Recipient..." 
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

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-semibold text-slate-700">System-wide Parcel Tracking</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
              <tr className="uppercase text-[11px] tracking-wider">
                <th className="px-6 py-4">Consignment ID</th>
                <th className="px-6 py-4">Merchant</th>
                <th className="px-6 py-4">Recipient</th>
                <th className="px-6 py-4">Destination</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredParcels.length > 0 ? (
                filteredParcels.map((parcel, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-blue-600">{parcel.id}</td>
                    <td className="px-6 py-4 text-slate-600">{parcel.merchant}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{parcel.recipient}</td>
                    <td className="px-6 py-4 text-slate-600">{parcel.destination}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(parcel.status)}`}>
                        {parcel.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{parcel.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => router.push(`/parcels/${parcel.id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="px-6 py-10 text-center text-gray-500">No parcels found matching your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
          <p className="text-xs text-gray-500">Showing 1 to {filteredParcels.length} of {filteredParcels.length} entries</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-50 transition-all" disabled>Previous</button>
            <button className="px-3 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-100 transition-all">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

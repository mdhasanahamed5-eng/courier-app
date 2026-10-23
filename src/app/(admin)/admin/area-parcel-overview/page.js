"use client";
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Filter, Edit, Trash2, Download, Printer, Upload, MapPin, Package, Eye } from 'lucide-react';

const dummyAreaOverview = [
  { id: 'AR-001', areaName: 'Dhanmondi', district: 'Dhaka', total: 450, pending: 50, delivered: 380, returned: 20, status: 'Active' },
  { id: 'AR-002', areaName: 'Uttara', district: 'Dhaka', total: 320, pending: 30, delivered: 270, returned: 20, status: 'Active' },
  { id: 'AR-003', areaName: 'Agrabad', district: 'Chattogram', total: 280, pending: 40, delivered: 210, returned: 30, status: 'Active' },
  { id: 'AR-004', areaName: 'Zindabazar', district: 'Sylhet', total: 190, pending: 20, delivered: 150, returned: 20, status: 'Active' },
  { id: 'AR-005', areaName: 'Saharpara', district: 'Rajshahi', total: 110, pending: 15, delivered: 80, returned: 15, status: 'Inactive' },
];

export default function AreaOverviewPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handlePrint = () => window.print();
  const handleBulkImport = () => fileInputRef.current.click();

  const handleExportCSV = () => {
    const headers = ["Area ID,Area Name,District,Total Parcels,Pending,Delivered,Returned,Status\n"];
    const rows = dummyAreaOverview.map(a => `${a.id},${a.areaName},${a.district},${a.total},${a.pending},${a.delivered},${a.returned},${a.status}`).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + headers.join("") + rows;
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "area_parcel_overview.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAreas = dummyAreaOverview.filter(area => 
    area.areaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    area.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
    area.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <input type="file" ref={fileInputRef} onChange={(e) => alert(`Selected file: ${e.target.files[0].name}`)} className="hidden" accept=".csv, .xlsx" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Area Wise Parcel Overview</h1>
          <p className="text-sm text-gray-500">Home / Admin / <span className="text-slate-800 font-medium">Area Overview</span></p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handlePrint} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all shadow-sm">
            <Printer size={16} /> Print
          </button>
          <button onClick={handleBulkImport} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all shadow-sm">
            <Upload size={16} /> Bulk Import
          </button>
          <button onClick={() => router.push('/admin/parcels')} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md">
            <Package size={18} /> View All Parcels
          </button>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400"><Search size={18} /></span>
          <input 
            type="text" 
            placeholder="Search by area, district or ID..." 
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
            <MapPin size={18} className="text-blue-600" />
            <h3 className="font-semibold text-slate-700">Geographic Parcel Distribution</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
              <tr className="uppercase text-[11px] tracking-wider">
                <th className="px-6 py-4">Area ID</th>
                <th className="px-6 py-4">Area Name</th>
                <th className="px-6 py-4">District</th>
                <th className="px-6 py-4 text-center">Total Parcels</th>
                <th className="px-6 py-4 text-center text-yellow-600">Pending</th>
                <th className="px-6 py-4 text-center text-green-600">Delivered</th>
                <th className="px-6 py-4 text-center text-red-600">Returned</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAreas.length > 0 ? (
                filteredAreas.map((area, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-blue-600">{area.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{area.areaName}</td>
                    <td className="px-6 py-4 text-slate-600">{area.district}</td>
                    <td className="px-6 py-4 text-center font-bold text-slate-800">{area.total}</td>
                    <td className="px-6 py-4 text-center text-slate-600">{area.pending}</td>
                    <td className="px-6 py-4 text-center text-slate-600">{area.delivered}</td>
                    <td className="px-6 py-4 text-center text-slate-600">{area.returned}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium 
                        ${area.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {area.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View Area Parcels">
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="9" className="px-6 py-10 text-center text-gray-500">No area data found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
          <p className="text-xs text-gray-500">Showing 1 to {filteredAreas.length} of {filteredAreas.length} entries</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-50 transition-all" disabled>Previous</button>
            <button className="px-3 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-100 transition-all">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

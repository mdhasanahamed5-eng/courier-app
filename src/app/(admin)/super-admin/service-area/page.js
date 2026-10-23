"use client";
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Filter, Edit, Trash2, Download, Printer, Upload, Eye } from 'lucide-react';

const dummyServiceAreas = [
  { sl: 1, name: 'Inside City', codPercent: '1%', defaultCharge: '70.00', weightType: 'KG', status: 'Active' },
  { sl: 2, name: 'Sub City', codPercent: '1%', defaultCharge: '90.00', weightType: 'KG', status: 'Active' },
  { sl: 3, name: 'Outside City', codPercent: '1%', defaultCharge: '120.00', weightType: 'KG', status: 'Active' },
];

export default function ServiceAreaPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handlePrint = () => window.print();
  const handleAddArea = () => router.push('/super-admin/service-area/new');
  const handleBulkImport = () => fileInputRef.current.click();

  const handleExportCSV = () => {
    const headers = ["SL,Name,COD %,Default Charge,Weight Type,Status\n"];
    const rows = dummyServiceAreas.map(s => `${s.sl},${s.name},${s.codPercent},${s.defaultCharge},${s.weightType},${s.status}`).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + headers.join("") + rows;
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "service_areas.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAreas = dummyServiceAreas.filter(area => 
    area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    area.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <input type="file" ref={fileInputRef} onChange={(e) => alert(`Selected file: ${e.target.files[0].name}`)} className="hidden" accept=".csv, .xlsx" />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Service Area Management</h1>
          <p className="text-sm text-gray-500">Home / Super Admin / <span className="text-slate-800 font-medium">Service Area</span></p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handlePrint} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all shadow-sm">
            <Printer size={16} /> Print
          </button>
          <button onClick={handleBulkImport} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all shadow-sm">
            <Upload size={16} /> Bulk Import
          </button>
          <button onClick={handleAddArea} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md">
            <Plus size={18} /> Add Area
          </button>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400"><Search size={18} /></span>
          <input 
            type="text" 
            placeholder="Search by area name..." 
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
          <h3 className="font-semibold text-slate-700">Service Areas List</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
              <tr className="uppercase text-[11px] tracking-wider">
                <th className="px-6 py-4 w-16 text-center">SL</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">COD %</th>
                <th className="px-6 py-4">Default Charge</th>
                <th className="px-6 py-4">Weight Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAreas.length > 0 ? (
                filteredAreas.map((area, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-center text-slate-600">{area.sl}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{area.name}</td>
                    <td className="px-6 py-4 text-slate-600">{area.codPercent}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{area.defaultCharge}</td>
                    <td className="px-6 py-4 text-slate-600">{area.weightType}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium 
                        ${area.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {area.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all" title="View">
                          <Eye size={16} />
                        </button>
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                          <Edit size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="px-6 py-10 text-center text-gray-500">No service areas found.</td></tr>
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

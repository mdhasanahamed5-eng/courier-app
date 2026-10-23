"use client";
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Filter, Edit, Trash2, Download, Printer, Upload, Store, FileText, Eye } from 'lucide-react'; // এখানে Eye যোগ করা হয়েছে

const dummyBranchReports = [
  { id: 'B-001', branchName: 'Dhaka Main Branch', total: 1250, pending: 120, inTransit: 300, delivered: 750, returned: 80 },
  { id: 'B-002', name: 'Chattogram Branch', total: 850, pending: 80, inTransit: 200, delivered: 500, returned: 70 },
  { id: 'B-003', name: 'Sylhet Branch', total: 600, pending: 150, inTransit: 100, delivered: 300, returned: 50 },
  { id: 'B-004', name: 'Rajshahi Branch', total: 400, pending: 40, inTransit: 80, delivered: 250, returned: 30 },
  { id: 'B-005', name: 'Khulna Branch', total: 700, pending: 90, inTransit: 150, delivered: 400, returned: 60 },
];

export default function BranchParcelReportPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handlePrint = () => window.print();
  const handleBulkImport = () => fileInputRef.current.click();

  const handleExportCSV = () => {
    const headers = ["Branch ID,Branch Name,Total Parcels,Pending,In-Transit,Delivered,Returned\n"];
    const rows = dummyBranchReports.map(b => `${b.id},${b.branchName || b.name},${b.total},${b.pending},${b.inTransit},${b.delivered},${b.returned}`).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + headers.join("") + rows;
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "branch_parcel_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredReports = dummyBranchReports.filter(report => 
    (report.branchName || report.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <input type="file" ref={fileInputRef} onChange={(e) => alert(`Selected file: ${e.target.files[0].name}`)} className="hidden" accept=".csv, .xlsx" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Branch Wise Parcel Report</h1>
          <p className="text-sm text-gray-500">Home / Admin / <span className="text-slate-800 font-medium">Branch Report</span></p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handlePrint} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all shadow-sm">
            <Printer size={16} /> Print
          </button>
          <button onClick={handleBulkImport} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all shadow-sm">
            <Upload size={16} /> Bulk Import
          </button>
          <button onClick={() => router.push('/admin/parcels')} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md">
            <FileText size={18} /> View All Parcels
          </button>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400"><Search size={18} /></span>
          <input 
            type="text" 
            placeholder="Search by branch name or ID..." 
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
          <h3 className="font-semibold text-slate-700">Branch Logistics Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
              <tr className="uppercase text-[11px] tracking-wider">
                <th className="px-6 py-4">Branch ID</th>
                <th className="px-6 py-4">Branch Name</th>
                <th className="px-6 py-4 text-center">Total Parcels</th>
                <th className="px-6 py-4 text-center text-yellow-600">Pending</th>
                <th className="px-6 py-4 text-center text-blue-600">In-Transit</th>
                <th className="px-6 py-4 text-center text-green-600">Delivered</th>
                <th className="px-6 py-4 text-center text-red-600">Returned</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredReports.length > 0 ? (
                filteredReports.map((report, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-blue-600">{report.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      <div className="flex items-center gap-2">
                        <Store size={14} className="text-gray-400" /> {report.branchName || report.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-800">{report.total}</td>
                    <td className="px-6 py-4 text-center text-slate-600">{report.pending}</td>
                    <td className="px-6 py-4 text-center text-slate-600">{report.inTransit}</td>
                    <td className="px-6 py-4 text-center text-slate-600">{report.delivered}</td>
                    <td className="px-6 py-4 text-center text-slate-600">{report.returned}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View Branch Parcels">
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="8" className="px-6 py-10 text-center text-gray-500">No branch reports found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
          <p className="text-xs text-gray-500">Showing 1 to {filteredReports.length} of {filteredReports.length} entries</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-50 transition-all" disabled>Previous</button>
            <button className="px-3 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-100 transition-all">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Filter, Edit, Trash2, Download, Printer, Upload, Store, FileText, Eye, TrendingUp } from 'lucide-react';

const dummyMerchantReports = [
  { id: 'REP-M01', merchant: 'Fatima Jamant', total: 1200, delivered: 1100, pending: 50, returned: 40, cancelled: 10 },
  { id: 'REP-M02', merchant: 'Md Sajon', total: 1800, delivered: 700, pending: 80, returned: 20, cancelled: 0 },
  { id: 'REP-M03', merchant: 'Sanjida Mim', total: 2500, delivered: 2300, pending: 100, returned: 140, cancelled: 0 },
  { id: 'REP-M04', merchant: 'Rabbani Hasan', total: 400, delivered: 300, pending: 50, returned: 40, cancelled: 10 },
  { id: 'REP-M05', merchant: 'Tshop Store', total: 3000, delivered: 2800, pending: 150, returned: 50, cancelled: 0 },
];

export default function MerchantParcelReportPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handlePrint = () => window.print();
  const handleBulkImport = () => fileInputRef.current.click();

  const handleExportCSV = () => {
    const headers = ["Report ID,Merchant Name,Total Parcels,Delivered,Pending,Returned,Cancelled,Success Rate\n"];
    const rows = dummyMerchantReports.map(r => {
      const successRate = ((r.delivered / r.total) * 100).toFixed(1) + '%';
      return `${r.id},${r.merchant},${r.total},${r.delivered},${r.pending},${r.returned},${r.cancelled},${successRate}`;
    }).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + headers.join("") + rows;
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "merchant_parcel_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredReports = dummyMerchantReports.filter(report => 
    report.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateSuccessRate = (delivered, total) => {
    return ((delivered / total) * 100).toFixed(1) + '%';
  };

  return (
    <div className="space-y-6">
      <input type="file" ref={fileInputRef} onChange={(e) => alert(`Selected file: ${e.target.files[0].name}`)} className="hidden" accept=".csv, .xlsx" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Merchant Parcel Report</h1>
          <p className="text-sm text-gray-500">Home / Admin / <span className="text-slate-800 font-medium">Merchant Report</span></p>
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

      {/* Action Bar with Date Filter Simulation */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4 justify-between items-center">
        <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400"><Search size={18} /></span>
            <input 
              type="text" 
              placeholder="Search merchant..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">From:</span>
            <input type="date" className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            <span className="text-xs text-gray-500 font-medium">To:</span>
            <input type="date" className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
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
            <TrendingUp size={18} className="text-blue-600" />
            <h3 className="font-semibold text-slate-700">Merchant Delivery Performance</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
              <tr className="uppercase text-[11px] tracking-wider">
                <th className="px-6 py-4">Report ID</th>
                <th className="px-6 py-4">Merchant Name</th>
                <th className="px-6 py-4 text-center">Total Parcels</th>
                <th className="px-6 py-4 text-center text-green-600">Delivered</th>
                <th className="px-6 py-4 text-center text-yellow-600">Pending</th>
                <th className="px-6 py-4 text-center text-red-600">Returned</th>
                <th className="px-6 py-4 text-center font-bold text-blue-600">Success Rate</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredReports.length > 0 ? (
                filteredReports.map((report, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-blue-600">{report.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{report.merchant}</td>
                    <td className="px-6 py-4 text-center font-bold text-slate-800">{report.total}</td>
                    <td className="px-6 py-4 text-center text-slate-600">{report.delivered}</td>
                    <td className="px-6 py-4 text-center text-slate-600">{report.pending}</td>
                    <td className="px-6 py-4 text-center text-slate-600">{report.returned}</td>
                    <td className="px-6 py-4 text-center font-bold text-blue-600">
                      {calculateSuccessRate(report.delivered, report.total)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View Detailed Report">
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="8" className="px-6 py-10 text-center text-gray-500">No reports found.</td></tr>
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

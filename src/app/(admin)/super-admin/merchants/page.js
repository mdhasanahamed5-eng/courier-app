"use client";
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Filter, MoreVertical, Edit, Trash2, Download, Printer, Upload } from 'lucide-react';

const dummyMerchants = [
  { id: 'M-0642', company: 'Merva', name: 'fatima jannat', email: 'fatimajannat@gmail.com', phone: '01886299739', date: '21 Oct, 2023', branch: 'Dhaka Main', status: 'Active' },
  { id: 'M-0641', company: 'NA fashion', name: 'Mot Asman', email: 'amenakhatun@gmail.com', phone: '01764864276', date: '21 Oct, 2023', branch: 'Chittagong', status: 'Inactive' },
  { id: 'M-0640', company: 'Grevento', name: 'Md Sajon', email: 'grevento@gmail.com', phone: '01712675370', date: '21 Oct, 2023', branch: 'Sylhet', status: 'Active' },
  { id: 'M-0639', company: 'Shaaj By Mim', name: 'Sanjida Mim', email: 'smim322@gmail.com', phone: '01348070023', date: '21 Oct, 2023', branch: 'Dhaka Main', status: 'Active' },
  { id: 'M-0638', company: 'premium', name: 'Rabbani Hasan', email: 'rabbani.res@gmail.com', phone: '01903077390', date: '19 Oct, 2023', branch: 'Rajshahi', status: 'Pending' },
];

export default function MerchantPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');

  // --- Functions ---

  const handlePrint = () => window.print();
  const handleAddMerchant = () => router.push('/super-admin/merchants/new');
  const handleBulkImport = () => fileInputRef.current.click();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) alert(`Selected file: ${file.name}. Backend integration pending.`);
  };

  // ১. CSV Export ফাংশন
  const handleExportCSV = () => {
    // CSV হেডার তৈরি
    const headers = ["ID,Company,Name,Email,Phone,Date,Branch,Status\n"];
    // ডাটাকে CSV ফরম্যাটে রূপান্তর
    const rows = dummyMerchants.map(m => 
      `${m.id},${m.company},${m.name},${m.email},${m.phone},${m.date},${m.branch},${m.status}`
    ).join("\n");

    const csvContent = "data:text/csv;charset=utf-8," + headers.join("") + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "merchants_list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ২. ডাটা ফিল্টারিং লজিক
  const filteredMerchants = dummyMerchants.filter(merchant => 
    merchant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    merchant.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    merchant.phone.includes(searchTerm) ||
    merchant.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv, .xlsx" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Merchant Management</h1>
          <p className="text-sm text-gray-500">Home / Super Admin / <span className="text-slate-800 font-medium">Merchants</span></p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handlePrint} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all shadow-sm">
            <Printer size={16} /> Print
          </button>
          <button onClick={handleBulkImport} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all shadow-sm">
            <Upload size={16} /> Bulk Import
          </button>
          <button onClick={handleAddMerchant} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md">
            <Plus size={18} /> Add Merchant
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400"><Search size={18} /></span>
          <input 
            type="text" 
            placeholder="Search by name, email, phone or ID..." 
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
              <tr className="uppercase text-[11px] tracking-wider">
                <th className="px-6 py-4">Merchant ID</th>
                <th className="px-6 py-4">Company Name</th>
                <th className="px-6 py-4">Merchant Name</th>
                <th className="px-6 py-4">Email & Phone</th>
                <th className="px-6 py-4">Join Date</th>
                <th className="px-6 py-4">Branch</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMerchants.length > 0 ? (
                filteredMerchants.map((merchant, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-blue-600">{merchant.id}</td>
                    <td className="px-6 py-4 text-slate-600">{merchant.company}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{merchant.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-slate-700">{merchant.email}</span>
                        <span className="text-xs text-gray-400">{merchant.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{merchant.date}</td>
                    <td className="px-6 py-4 text-slate-600">{merchant.branch}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium 
                        ${merchant.status === 'Active' ? 'bg-green-100 text-green-700' : 
                          merchant.status === 'Inactive' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {merchant.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit size={16} /></button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-10 text-center text-gray-500">No merchants found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
          <p className="text-xs text-gray-500">Showing 1 to {filteredMerchants.length} of 633 entries</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-50 transition-all" disabled>Previous</button>
            <button className="px-3 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-100 transition-all">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

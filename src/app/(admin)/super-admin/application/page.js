"use client";
import React, { useState } from 'react';
import { Save, Upload, Globe, CreditCard, Mail, Phone, MapPin, Building2 } from 'lucide-react';

export default function ApplicationSettingsPage() {
  const [settings, setSettings] = useState({
    companyName: 'YourBrand Courier',
    slogan: 'Fastest Delivery in Bangladesh',
    currency: 'BDT',
    currencySymbol: '৳',
    timezone: 'Asia/Dhaka',
    language: 'English',
    supportEmail: 'support@yourbrand.com',
    supportPhone: '01700000000',
    officeAddress: 'Dhaka, Bangladesh',
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API Call
    setTimeout(() => {
      setIsSaving(false);
      alert("Application settings updated successfully!");
    }, 1500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Application Settings</h1>
          <p className="text-sm text-gray-500">Home / Super Admin / <span className="text-slate-800 font-medium">Application</span></p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-md disabled:opacity-50"
        >
          <Save size={18} />
          {isSaving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Section 1: Company Branding */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center gap-2 border-b pb-4">
            <Building2 size={20} className="text-blue-600" />
            <h2 className="text-lg font-bold text-slate-800">Company Branding</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 cursor-pointer transition-all">
                <Upload size={24} />
                <span className="text-[10px] mt-1">Upload Logo</span>
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm text-gray-500">Upload your company logo. Recommended size: 200x200px.</p>
                <button type="button" className="text-xs text-blue-600 hover:underline">Change Logo</button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input 
                  type="text" name="companyName" value={settings.companyName} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Slogan</label>
                <input 
                  type="text" name="slogan" value={settings.slogan} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: General Settings */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center gap-2 border-b pb-4">
            <Globe size={20} className="text-blue-600" />
            <h2 className="text-lg font-bold text-slate-800">General Settings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select name="currency" value={settings.currency} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none">
                <option value="BDT">BDT (Bangladeshi Taka)</option>
                <option value="USD">USD (US Dollar)</option>
                <option value="EUR">EUR (Euro)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency Symbol</label>
              <input 
                type="text" name="currencySymbol" value={settings.currencySymbol} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
              <select name="timezone" value={settings.timezone} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none">
                <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Language</label>
              <select name="language" value={settings.language} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none">
                <option value="English">English</option>
                <option value="Bengali">Bengali</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Support & Contact */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6 lg:col-span-2">
          <div className="flex items-center gap-2 border-b pb-4">
            <Mail size={20} className="text-blue-600" />
            <h2 className="text-lg font-bold text-slate-800">Support & Contact Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input 
                  type="email" name="supportEmail" value={settings.supportEmail} onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Phone</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input 
                  type="text" name="supportPhone" value={settings.supportPhone} onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Office Address</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input 
                  type="text" name="officeAddress" value={settings.officeAddress} onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" 
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

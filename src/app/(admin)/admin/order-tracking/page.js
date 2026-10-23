"use client";
import React, { useState } from 'react';
import { Search, Package, Truck, CheckCircle, Clock, MapPin, User, Store, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Dummy data for tracking result
const dummyTrackingData = {
  consignmentId: 'CR26108F',
  status: 'in_transit',
  merchant: 'Fatima Jamant',
  recipient: 'Jashim Ali',
  destination: 'Dhanmondi, Dhaka',
  weight: '0.5 kg',
  type: 'Standard Delivery',
  events: [
    { status: 'Order Placed', date: '28 Jul, 2026 - 10:00 AM', location: 'Merchant Store', icon: <Package size={18} />, color: 'bg-blue-500' },
    { status: 'Picked Up', date: '28 Jul, 2026 - 02:00 PM', location: 'Merchant Store', icon: <Truck size={18} />, color: 'bg-indigo-500' },
    { status: 'Arrived at Hub', date: '29 Jul, 2026 - 09:00 AM', location: 'Dhaka Central Hub', icon: <MapPin size={18} />, color: 'bg-purple-500' },
    { status: 'Out for Delivery', date: '29 Jul, 2026 - 11:00 AM', location: 'Dhaka Local Hub', icon: <Truck size={18} />, color: 'bg-orange-500' },
    { status: 'Delivered', date: 'Pending', location: 'Recipient Address', icon: <CheckCircle size={18} />, color: 'bg-green-500' },
  ]
};

export default function OrderTrackingPage() {
  const [trackingId, setTrackingId] = useState('');
  const [result, setResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const handleTrack = (e) => {
    e.preventDefault();
    if (!trackingId) return;

    setIsSearching(true);
    // Simulate API Call
    setTimeout(() => {
      if (trackingId.toUpperCase() === 'CR26108F') {
        setResult(dummyTrackingData);
      } else {
        setResult('not_found');
      }
      setIsSearching(false);
    }, 800);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Order Tracking</h1>
          <p className="text-sm text-gray-500">Home / Admin / <span className="text-slate-800 font-medium">Order Tracking</span></p>
        </div>
        <button 
          onClick={() => router.push('/admin/parcels')} 
          className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
        >
          <ArrowLeft size={16} /> Back to All Parcels
        </button>
      </div>

      {/* Search Section */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold text-slate-700 mb-4">Track Your Parcel</h2>
        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <Search size={20} />
            </span>
            <input 
              type="text" 
              placeholder="Enter Consignment ID (e.g. CR26108F)" 
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={isSearching}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg disabled:opacity-50"
          >
            {isSearching ? 'Searching...' : 'Track Now'}
          </button>
        </form>
      </div>

      {/* Result Section */}
      {result === 'not_found' && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-center font-medium">
          No parcel found with the ID: {trackingId}. Please check and try again.
        </div>
      )}

      {result && result !== 'not_found' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Parcel Summary Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Package size={20} className="text-blue-600" /> Parcel Details
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500 text-sm">ID:</span>
                  <span className="font-bold text-blue-600">{result.consignmentId}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500 text-sm">Merchant:</span>
                  <span className="font-medium text-slate-800">{result.merchant}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500 text-sm">Recipient:</span>
                  <span className="font-medium text-slate-800">{result.recipient}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500 text-sm">Destination:</span>
                  <span className="font-medium text-slate-800">{result.destination}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500 text-sm">Status:</span>
                  <span className="px-2 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 uppercase">
                    {result.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline View */}
          <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2">
              <Clock size={20} className="text-blue-600" /> Delivery Timeline
            </h3>
            <div className="relative space-y-8">
              {/* Vertical Line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

              {result.events.map((event, index) => (
                <div key={index} className="relative pl-10">
                  {/* Timeline Circle */}
                  <div className={`absolute left-0 top-1 w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center text-white ${event.color}`}>
                    {event.icon}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <h4 className={`font-bold ${index === result.events.length - 1 && event.status === 'Delivered' ? 'text-green-600' : 'text-slate-800'}`}>
                        {event.status}
                      </h4>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin size={12} /> {event.location}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-gray-400">{event.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import React from 'react';
import { Menu, Bell, User } from 'lucide-react';

export default function AdminTopBar({ toggleSidebar }) {
  return (
    <div className="flex items-center justify-between w-full">
      {/* Left side: Hamburger and Breadcrumb */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar} 
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu size={20} className="text-gray-600" />
        </button>
        <div className="flex items-center text-sm text-gray-500">
          <span>Home</span>
          <span className="mx-2">/</span>
          <span className="text-gray-800 font-medium">Dashboard</span>
        </div>
      </div>

      {/* Right side: Notifications and User */}
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-gray-100 rounded-full relative">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-800 leading-none">Super Admin</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center">
            <User size={20} className="text-gray-600" />
          </div>
        </div>
      </div>
    </div>
  );
}

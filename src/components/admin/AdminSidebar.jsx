"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Globe, Users, UserCog, Store, Truck, 
  Package, FileText, MapPin, Settings, LogOut, ChevronDown, ChevronRight 
} from 'lucide-react';

const AdminSidebar = ({ isOpen }) => {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState({
    team: true,
    parcel: true,
    report: false,
    appSetting: false,
    setting: false,
  });

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const menuGroups = [
    {
      title: 'Home',
      icon: <LayoutDashboard size={20} />,
      items: [{ name: 'Dashboard', path: '/super-admin', icon: <LayoutDashboard size={18} /> }],
      groupKey: null,
    },
    {
      title: 'Website',
      icon: <Globe size={20} />,
      items: [], // Build this LAST as per instructions
      groupKey: 'website',
    },
    {
      title: 'Team',
      icon: <Users size={20} />,
      groupKey: 'team',
      items: [
        { name: 'Branch', path: '/super-admin/branches', icon: <Store size={18} /> },
        { name: 'Branch User', path: '/super-admin/branch-users', icon: <UserCog size={18} /> },
        { name: 'Merchant', path: '/super-admin/merchants', icon: <Store size={18} /> },
        { name: 'Rider', path: '/super-admin/riders', icon: <Truck size={18} /> },
      ],
    },
    {
      title: 'Parcel',
      icon: <Package size={20} />,
      groupKey: 'parcel',
      items: [
        { name: 'All Parcel List', path: '/admin/parcels', icon: <Package size={18} /> },
        { name: 'Branch Wise Parcel Report', path: '#', icon: <FileText size={18} /> },
        { name: 'Today Parcel For Delivery', path: '#', icon: <Truck size={18} /> },
        { name: 'Merchant Today Pickup', path: '#', icon: <Truck size={18} /> },
        { name: 'Merchant Wise Parcel Overview', path: '#', icon: <Store size={18} /> },
        { name: 'Area wise Parcel Overview', path: '#', icon: <MapPin size={18} /> },
        { name: 'Order Tracking', path: '#', icon: <Package size={18} /> },
        { name: 'Parcel Report', path: '#', icon: <FileText size={18} /> },
        { name: 'Merchant Pickup Parcel Report', path: '#', icon: <FileText size={18} /> },
      ],
    },
    {
      title: 'Report',
      icon: <FileText size={20} />,
      groupKey: 'report',
      items: [
        { name: 'Merchant Parcel Report', path: '#', icon: <Store size={18} /> },
        { name: 'Rider Delivery Parcel Report', path: '#', icon: <Truck size={18} /> },
      ],
    },
    {
      title: 'Application Setting',
      icon: <Settings size={20} />,
      groupKey: 'appSetting',
      items: [
        { name: 'Service Area', path: '#', icon: <MapPin size={18} /> },
        { name: 'Weight Package', path: '#', icon: <Package size={18} /> },
        { name: 'Weight Custom Charge', path: '#', icon: <Package size={18} /> },
        { name: 'Service Type', path: '#', icon: <Package size={18} /> },
        { name: 'Item Type', path: '#', icon: <Package size={18} /> },
        { name: 'District', path: '#', icon: <MapPin size={18} /> },
        { name: 'Area', path: '#', icon: <MapPin size={18} /> },
        { name: 'Notice OR News', path: '#', icon: <FileText size={18} /> },
      ],
    },
    {
      title: 'Setting',
      icon: <Settings size={20} />,
      groupKey: 'setting',
      items: [
        { name: 'Admin User', path: '#', icon: <UserCog size={18} /> },
        { name: 'Application', path: '#', icon: <Settings size={18} /> },
      ],
    },
  ];

  return (
    <div className="h-full bg-[#1e293b] text-slate-300 flex flex-col transition-all duration-300">
      {/* Logo Section */}
      <div className="p-6 flex items-center justify-center border-b border-slate-700 bg-[#0f172a]">
        <div className="text-white font-bold text-xl tracking-wider">
          {isOpen ? (
            <>
              <span className="text-blue-400">COURIER</span>
              <span>APP</span>
            </>
          ) : (
            <span className="text-blue-400">C</span>
          )}
        </div>
      </div>

      {/* Profile Section */}
      <div className="p-4 border-b border-slate-700 bg-[#1e293b] flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-slate-600 border-2 border-blue-500 mb-2 overflow-hidden">
          <img src="https://via.placeholder.com/64" alt="Avatar" className="w-full h-full object-cover" />
        </div>
        {isOpen && (
          <div className="mt-2">
            <p className="text-white font-medium text-sm">Super Admin</p>
            <p className="text-xs text-slate-400">System Owner</p>
          </div>
        )}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="mb-2">
            {/* Group Header */}
            <div 
              onClick={() => group.groupKey && toggleMenu(group.groupKey)}
              className={`flex items-center justify-between px-4 py-2 cursor-pointer transition-colors
                ${group.groupKey ? 'hover:bg-slate-800 text-slate-400' : 'text-white font-semibold'}
                ${isOpen ? 'px-6' : 'justify-center'}
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-blue-400">{group.icon}</span>
                {isOpen && <span className="text-sm">{group.title}</span>}
              </div>
              {isOpen && group.groupKey && (
                openMenus[group.groupKey] ? <ChevronDown size={16} /> : <ChevronRight size={16} />
              )}
            </div>

            {/* Sub-menu items */}
            {isOpen && (openMenus[group.groupKey] || !group.groupKey) && (
              <div className="bg-slate-900/50 py-1">
                {group.items.map((item, itemIdx) => (
                  <Link 
                    key={itemIdx} 
                    href={item.path}
                    className={`flex items-center gap-3 pl-12 pr-4 py-2 text-sm transition-colors
                      ${pathname === item.path ? 'text-blue-400 bg-blue-500/10 border-l-4 border-blue-500' : 'hover:bg-slate-800 hover:text-white'}
                    `}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                ))}
                {group.items.length === 0 && (
                  <div className="pl-12 pr-4 py-2 text-xs italic opacity-50">Coming Soon...</div>
                )}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-700">
        <button className="flex items-center gap-3 w-full p-3 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all">
          <LogOut size={20} />
          {isOpen && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;

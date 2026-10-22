"use client";
import React from 'react';

const StatCard = ({ title, value, icon, color, linkText, linkPath }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
      {/* Icon Tile */}
      <div className={`w-14 h-14 rounded-lg ${color} flex items-center justify-center text-white shadow-inner`}>
        {icon}
      </div>
      
      {/* Content */}
      <div className="flex-1">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        <a 
          href={linkPath} 
          className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1 transition-colors"
        >
          {linkText} <span className="text-[10px]">→</span>
        </a>
      </div>
    </div>
  );
};

export default StatCard;

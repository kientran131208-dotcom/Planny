'use client';

import React from 'react';

interface ExportButtonProps {
  data: any;
}

export default function ExportButton({ data }: ExportButtonProps) {
  const handleExport = () => {
    // We use native print functionality which is 100% compatible with modern CSS (lab, oklch, etc.)
    // and produces high-quality PDF vector output.
    window.print();
  };

  return (
    <button 
      id="export-btn"
      onClick={handleExport}
      className="flex items-center gap-2 px-6 py-2 rounded-full bg-[#1151d3] text-white text-sm font-bold shadow-md hover:opacity-90 transition-all cursor-pointer no-print"
    >
      <span className="material-symbols-outlined text-sm">print</span>
      Xuất PDF / In
    </button>
  );
}

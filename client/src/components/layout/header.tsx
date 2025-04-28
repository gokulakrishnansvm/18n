import React from 'react';

export default function Header() {
  return (
    <header className="bg-white border-b border-neutral-200 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <i className="ri-translate-2 text-primary-500 text-2xl"></i>
          <h1 className="text-xl font-semibold">I18N Standardization Tool</h1>
        </div>
        <div>
          <button className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-4 py-2 rounded-md text-sm flex items-center gap-1 transition-colors">
            <i className="ri-settings-3-line"></i>
            <span>Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
}

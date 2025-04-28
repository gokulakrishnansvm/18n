import React from 'react';

export default function Header() {
  return (
    <header className="bg-white border-b border-neutral-200 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {/* Primary icon with fallback */}
          <div className="text-primary-500 text-2xl">
            <i className="ri-translate-2"></i>
            <span className="ri-translate hidden">
              <i className="fa-solid fa-language"></i>
            </span>
          </div>
          <h1 className="text-xl font-semibold">I18N Standardization Tool</h1>
        </div>
        <div>
          <button className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-4 py-2 rounded-md text-sm flex items-center gap-1 transition-colors">
            {/* Settings icon with fallback */}
            <i className="ri-settings-3-line"></i>
            <span className="ri-settings-3-line hidden">
              <i className="fa-solid fa-gear"></i>
            </span>
            <span>Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
}

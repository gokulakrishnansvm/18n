import React from 'react';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-full p-2 shadow-sm">
            <i className="ri-translate-2 text-primary-600 text-2xl"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">I18N Standardization Tool</h1>
            <p className="text-xs text-primary-100 mt-0.5">Automate localization workflow</p>
          </div>
        </div>
      </div>
    </header>
  );
}

import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-neutral-50 border-t border-neutral-200 mt-6 py-2">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center">
          <div className="text-xs text-neutral-400 flex gap-2 items-center">
            <span className="bg-primary-100 px-2 py-1 rounded text-primary-700 font-medium">v1.0</span>
            <i className="ri-code-s-slash-line mr-1"></i>
            with
            <i className="ri-heart-3-fill text-red-500 mx-1"></i>
            by AI team
          </div>
        </div>
      </div>
    </footer>
  );
}

import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200 mt-6">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-neutral-500">
          <div>
            <p>© 2023 Internal I18N Standardization Tool</p>
          </div>
          <div className="mt-2 md:mt-0">
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-primary-600 transition-colors">Feedback</a>
              <a href="#" className="hover:text-primary-600 transition-colors">Support</a>
              <a href="#" className="hover:text-primary-600 transition-colors">Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

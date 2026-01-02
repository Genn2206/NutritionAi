import React from 'react';
import { ChefHat } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-2 rounded-lg">
              <ChefHat className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">NutriScan AI</h1>
              <p className="text-xs text-slate-500 font-medium">Food Recognition System</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-600">
            <span className="bg-slate-100 px-3 py-1 rounded-full text-xs font-semibold text-slate-700">Powered by Gemini 3 Pro</span>
          </div>
        </div>
      </div>
    </header>
  );
};
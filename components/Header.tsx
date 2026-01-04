import React from 'react';
import { ChefHat, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-2 rounded-lg">
              <ChefHat className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">{t.header_title}</h1>
              <p className="text-xs text-slate-500 font-medium">{t.header_subtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center text-sm font-medium text-slate-600">
              <span className="bg-slate-100 px-3 py-1 rounded-full text-xs font-semibold text-slate-700">
                {t.powered_by}
              </span>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                    onClick={() => setLanguage('it')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${language === 'it' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    IT
                </button>
                <button 
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${language === 'en' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    EN
                </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
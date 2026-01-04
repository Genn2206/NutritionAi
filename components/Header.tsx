import React from 'react';
import { ChefHat } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.location.reload()}>
            <div className="bg-gradient-to-br from-emerald-600 to-teal-500 p-2 rounded-xl shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
              <ChefHat className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-teal-600 leading-tight tracking-tight">
                {t.header_title}
              </h1>
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{t.header_subtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center text-sm font-medium text-slate-600">
              <span className="bg-slate-100/80 px-3 py-1 rounded-full text-xs font-semibold text-slate-600 border border-slate-200/60">
                {t.powered_by}
              </span>
            </div>

            <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
                <button 
                    onClick={() => setLanguage('it')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${language === 'it' ? 'bg-white text-emerald-700 shadow-sm scale-100' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                    IT
                </button>
                <button 
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${language === 'en' ? 'bg-white text-emerald-700 shadow-sm scale-100' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
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
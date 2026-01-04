import React, { useState, useEffect } from 'react';
import { AnalysisResult } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AlertTriangle, CheckCircle2, Flame, Wheat, Beef, Droplet, Edit2, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface AnalysisResultsProps {
  result: AnalysisResult;
  imagePreview: string;
  onReset: () => void;
  wasCorrected?: boolean;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b']; // Protein (Green), Carbs (Blue), Fat (Orange)

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result: initialResult, imagePreview, onReset, wasCorrected }) => {
  const { t } = useLanguage();
  const [currentResult, setCurrentResult] = useState<AnalysisResult>(initialResult);

  // Update local state if the prop changes (e.g. new analysis)
  useEffect(() => {
    setCurrentResult(initialResult);
  }, [initialResult]);

  const chartData = [
    { name: t.macro_protein, value: currentResult.totalMacros.protein, fill: COLORS[0] },
    { name: t.macro_carbs, value: currentResult.totalMacros.carbs, fill: COLORS[1] },
    { name: t.macro_fat, value: currentResult.totalMacros.fat, fill: COLORS[2] },
  ];

  // Helper for rendering reliability badge
  const getReliabilityColor = (score: number) => {
    if (score >= 80) return 'text-emerald-800 bg-emerald-50 border-emerald-200';
    if (score >= 50) return 'text-amber-800 bg-amber-50 border-amber-200';
    return 'text-red-800 bg-red-50 border-red-200';
  };

  const handlePortionChange = (index: number, newGramsStr: string) => {
    const newGrams = parseFloat(newGramsStr);
    if (isNaN(newGrams) || newGrams < 0) return;

    setCurrentResult(prev => {
      const newItems = [...prev.items];
      const item = newItems[index];
      const oldGrams = item.portionGrams;
      
      // Calculate ratio
      const ratio = oldGrams > 0 ? newGrams / oldGrams : 1;

      // Update item
      newItems[index] = {
        ...item,
        portionGrams: newGrams,
        calories: Math.round(item.calories * ratio),
        minCalories: Math.round(item.minCalories * ratio),
        maxCalories: Math.round(item.maxCalories * ratio),
        macros: {
          protein: parseFloat((item.macros.protein * ratio).toFixed(1)),
          carbs: parseFloat((item.macros.carbs * ratio).toFixed(1)),
          fat: parseFloat((item.macros.fat * ratio).toFixed(1)),
        }
      };

      // Recalculate totals
      const newTotalCalories = newItems.reduce((acc, curr) => acc + curr.calories, 0);
      const newMinTotal = newItems.reduce((acc, curr) => acc + curr.minCalories, 0);
      const newMaxTotal = newItems.reduce((acc, curr) => acc + curr.maxCalories, 0);
      
      const newTotalMacros = newItems.reduce((acc, curr) => ({
        protein: parseFloat((acc.protein + curr.macros.protein).toFixed(1)),
        carbs: parseFloat((acc.carbs + curr.macros.carbs).toFixed(1)),
        fat: parseFloat((acc.fat + curr.macros.fat).toFixed(1)),
      }), { protein: 0, carbs: 0, fat: 0 });

      return {
        ...prev,
        items: newItems,
        totalCalories: newTotalCalories,
        minTotalCalories: newMinTotal,
        maxTotalCalories: newMaxTotal,
        totalMacros: newTotalMacros
      };
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto pb-12">
      {wasCorrected && (
        <div className="mb-8 p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-4 animate-slide-up shadow-sm">
          <div className="p-2 bg-white rounded-xl shadow-sm border border-amber-100 shrink-0">
             <Info className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h4 className="font-bold text-amber-900 text-lg">{t.correction_alert_title}</h4>
            <p className="text-amber-800/80 mt-1 leading-relaxed">{t.correction_alert_desc}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Column 1: Image & Summary */}
        <div className="space-y-6">
          <div className="bg-white p-2 rounded-3xl shadow-lg border border-slate-100 animate-slide-up">
            <div className="relative aspect-square sm:aspect-video lg:aspect-square w-full rounded-2xl overflow-hidden group">
              <img 
                src={imagePreview} 
                alt="Analyzed food" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-100 transition-opacity" />
              <div className="absolute bottom-4 left-4">
                <span className="bg-black/40 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20">
                  {t.results_image_label}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8 animate-slide-up delay-100 hover:shadow-xl transition-shadow duration-300">
             <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Flame className="text-orange-500 h-5 w-5" />
              </div>
              {t.results_total_energy}
            </h3>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-black text-slate-900 tracking-tight">{currentResult.totalCalories}</span>
              <span className="text-lg text-slate-500 font-medium">kcal</span>
            </div>
            
            {/* Range Indicator */}
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 w-full relative overflow-hidden">
               <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-300 rounded-l-xl"></div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">
                {t.results_range_label}
              </p>
              <p className="text-base font-mono font-semibold text-slate-700">
                {currentResult.minTotalCalories} — {currentResult.maxTotalCalories} kcal
              </p>
            </div>
            
            <p className="text-sm text-slate-400 mt-4 leading-relaxed">{t.results_total_desc}</p>
          </div>
          
           {/* Reliability Card */}
           <div className={`rounded-3xl border p-6 animate-slide-up delay-200 ${getReliabilityColor(currentResult.reliabilityScore)}`}>
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="h-5 w-5 opacity-80" />
              <h4 className="font-bold">{t.results_reliability}: {currentResult.reliabilityScore}%</h4>
            </div>
            <p className="text-sm opacity-90 leading-relaxed font-medium">
              {currentResult.reliabilityNote}
            </p>
          </div>

           <button 
            onClick={onReset}
            className="w-full py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 animate-slide-up delay-300 shadow-sm"
          >
            {t.results_analyze_another}
          </button>
        </div>

        {/* Column 2 & 3: Detailed Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Macro Chart */}
          <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8 animate-slide-up delay-100">
            <h3 className="text-xl font-bold text-slate-900 mb-8">{t.macro_breakdown}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div className="h-64 w-full relative min-w-0">
                 <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} className="hover:opacity-80 transition-opacity cursor-pointer" />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value}g`, 'Quantità']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                      itemStyle={{ fontWeight: 600, color: '#334155' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text for Donut Chart */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold text-slate-800">100%</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Macro</span>
                </div>
              </div>
              
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 hover:bg-emerald-50 transition-colors duration-200">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-emerald-100 rounded-xl">
                        <Beef className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{t.macro_protein}</p>
                        <p className="text-xs font-medium text-emerald-600/70">{t.macro_protein_desc}</p>
                      </div>
                    </div>
                    <span className="text-2xl font-black text-emerald-700">{currentResult.totalMacros.protein}g</span>
                 </div>

                 <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 hover:bg-blue-50 transition-colors duration-200">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-blue-100 rounded-xl">
                        <Wheat className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{t.macro_carbs}</p>
                        <p className="text-xs font-medium text-blue-600/70">{t.macro_carbs_desc}</p>
                      </div>
                    </div>
                    <span className="text-2xl font-black text-blue-700">{currentResult.totalMacros.carbs}g</span>
                 </div>

                 <div className="flex items-center justify-between p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50 hover:bg-amber-50 transition-colors duration-200">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-amber-100 rounded-xl">
                         <Droplet className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{t.macro_fat}</p>
                        <p className="text-xs font-medium text-amber-600/70">{t.macro_fat_desc}</p>
                      </div>
                    </div>
                    <span className="text-2xl font-black text-amber-700">{currentResult.totalMacros.fat}g</span>
                 </div>
              </div>
            </div>
          </div>

          {/* Ingredients Table */}
          <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden animate-slide-up delay-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50/80 flex justify-between items-center backdrop-blur-sm">
              <h3 className="text-lg font-bold text-slate-800">{t.table_title}</h3>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5">
                <Edit2 size={12} />
                {t.table_edit_hint}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs font-bold tracking-wider text-slate-400 uppercase border-b border-slate-100">
                    <th className="px-6 py-5 bg-white">{t.table_col_ingredient}</th>
                    <th className="px-6 py-5 bg-white text-right">{t.table_col_portion}</th>
                    <th className="px-6 py-5 bg-white">{t.table_col_calories}</th>
                    <th className="px-6 py-5 bg-white text-right">{t.table_col_macros}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {currentResult.items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                        {t.table_empty}
                      </td>
                    </tr>
                  ) : (
                    currentResult.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-emerald-400 group-hover:scale-125 transition-transform"></div>
                            <div>
                              <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                              <p className="text-xs font-medium text-slate-400">{item.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm text-right">
                          <div className="flex items-center justify-end gap-1.5 group/input">
                            <input
                              type="number"
                              className="w-20 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-700 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-right font-bold transition-all shadow-sm"
                              value={item.portionGrams}
                              onChange={(e) => handlePortionChange(idx, e.target.value)}
                            />
                            <span className="text-slate-400 font-medium text-xs">g</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col items-start">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {item.calories} kcal
                            </span>
                             <span className="text-[10px] text-slate-400 font-mono mt-1.5 pl-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {item.minCalories}-{item.maxCalories} range
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm text-right text-slate-500 font-mono tracking-tight">
                           <span className="text-emerald-600 font-bold">{item.macros.protein}</span> / 
                           <span className="text-blue-600 font-bold">{item.macros.carbs}</span> / 
                           <span className="text-amber-600 font-bold">{item.macros.fat}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="bg-slate-50/50 px-6 py-4 border-t border-slate-100 text-[11px] text-slate-400 font-medium text-center uppercase tracking-wide">
              {t.table_disclaimer}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
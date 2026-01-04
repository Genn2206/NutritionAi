import React, { useState, useEffect } from 'react';
import { AnalysisResult, FoodItem } from '../types';
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
    if (score >= 80) return 'text-emerald-700 bg-emerald-100 border-emerald-200';
    if (score >= 50) return 'text-amber-700 bg-amber-100 border-amber-200';
    return 'text-red-700 bg-red-100 border-red-200';
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
    <div className="w-full max-w-6xl mx-auto animate-fade-in pb-12">
      {wasCorrected && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 animate-slide-down">
          <div className="p-2 bg-amber-100 rounded-lg shrink-0">
             <Info className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h4 className="font-semibold text-amber-900">{t.correction_alert_title}</h4>
            <p className="text-sm text-amber-700 mt-1">{t.correction_alert_desc}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Column 1: Image & Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="relative aspect-square sm:aspect-video lg:aspect-square w-full">
              <img 
                src={imagePreview} 
                alt="Analyzed food" 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-white font-medium text-sm">{t.results_image_label}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
             <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Flame className="text-orange-500 h-5 w-5" />
              {t.results_total_energy}
            </h3>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-extrabold text-slate-900">{currentResult.totalCalories}</span>
              <span className="text-slate-500 font-medium">kcal</span>
            </div>
            
            {/* Range Indicator */}
            <div className="mt-2 p-2 bg-slate-50 rounded-lg border border-slate-100 inline-block w-full">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">
                {t.results_range_label}
              </p>
              <p className="text-sm font-mono text-slate-700">
                {currentResult.minTotalCalories} - {currentResult.maxTotalCalories} kcal
              </p>
            </div>
            
            <p className="text-sm text-slate-500 mt-3">{t.results_total_desc}</p>
          </div>
          
           {/* Reliability Card */}
           <div className={`rounded-2xl border p-5 ${getReliabilityColor(currentResult.reliabilityScore)}`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5" />
              <h4 className="font-bold">{t.results_reliability}: {currentResult.reliabilityScore}%</h4>
            </div>
            <p className="text-sm opacity-90 leading-relaxed">
              {currentResult.reliabilityNote}
            </p>
          </div>

           <button 
            onClick={onReset}
            className="w-full py-3 bg-white border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
          >
            {t.results_analyze_another}
          </button>
        </div>

        {/* Column 2 & 3: Detailed Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Macro Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6">{t.macro_breakdown}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="h-64 w-full relative">
                 <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value}g`, 'Quantità']}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text for Donut Chart */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-sm font-medium text-slate-400">Macros</span>
                </div>
              </div>
              
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <Beef className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{t.macro_protein}</p>
                        <p className="text-xs text-slate-500">{t.macro_protein_desc}</p>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-emerald-700">{currentResult.totalMacros.protein}g</span>
                 </div>

                 <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Wheat className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{t.macro_carbs}</p>
                        <p className="text-xs text-slate-500">{t.macro_carbs_desc}</p>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-blue-700">{currentResult.totalMacros.carbs}g</span>
                 </div>

                 <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 rounded-lg">
                         <Droplet className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{t.macro_fat}</p>
                        <p className="text-xs text-slate-500">{t.macro_fat_desc}</p>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-amber-700">{currentResult.totalMacros.fat}g</span>
                 </div>
              </div>
            </div>
          </div>

          {/* Ingredients Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">{t.table_title}</h3>
              <span className="text-xs text-slate-500 italic flex items-center gap-1">
                <Edit2 size={12} />
                {t.table_edit_hint}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs font-semibold tracking-wide text-slate-500 uppercase border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-4">{t.table_col_ingredient}</th>
                    <th className="px-6 py-4">{t.table_col_portion}</th>
                    <th className="px-6 py-4">{t.table_col_calories}</th>
                    <th className="px-6 py-4">{t.table_col_macros}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentResult.items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                        {t.table_empty}
                      </td>
                    </tr>
                  ) : (
                    currentResult.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <div>
                              <p className="font-medium text-slate-900 text-sm">{item.name}</p>
                              <p className="text-xs text-slate-500">{item.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              className="w-20 px-2 py-1 rounded border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-right font-medium"
                              value={item.portionGrams}
                              onChange={(e) => handlePortionChange(idx, e.target.value)}
                            />
                            <span className="text-slate-400">g</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 w-fit">
                              {item.calories} kcal
                            </span>
                             <span className="text-[10px] text-slate-400 mt-1 pl-1">
                              {item.minCalories}-{item.maxCalories}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                          {item.macros.protein} / {item.macros.carbs} / {item.macros.fat}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 text-xs text-slate-500">
              {t.table_disclaimer}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
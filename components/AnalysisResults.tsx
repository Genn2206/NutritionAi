import React from 'react';
import { AnalysisResult, FoodItem } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AlertTriangle, CheckCircle2, Flame, Wheat, Beef, Droplet } from 'lucide-react';

interface AnalysisResultsProps {
  result: AnalysisResult;
  imagePreview: string;
  onReset: () => void;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b']; // Protein (Green), Carbs (Blue), Fat (Orange)

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result, imagePreview, onReset }) => {
  
  const chartData = [
    { name: 'Proteine', value: result.totalMacros.protein, fill: COLORS[0] },
    { name: 'Carboidrati', value: result.totalMacros.carbs, fill: COLORS[1] },
    { name: 'Grassi', value: result.totalMacros.fat, fill: COLORS[2] },
  ];

  // Helper for rendering reliability badge
  const getReliabilityColor = (score: number) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-100 border-emerald-200';
    if (score >= 50) return 'text-amber-700 bg-amber-100 border-amber-200';
    return 'text-red-700 bg-red-100 border-red-200';
  };

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in pb-12">
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
                <p className="text-white font-medium text-sm">Immagine Analizzata</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
             <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Flame className="text-orange-500 h-5 w-5" />
              Totale Energetico
            </h3>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-extrabold text-slate-900">{result.totalCalories}</span>
              <span className="text-slate-500 font-medium">kcal</span>
            </div>
            <p className="text-sm text-slate-500">Stima totale per il piatto riconosciuto.</p>
          </div>
          
           {/* Reliability Card */}
           <div className={`rounded-2xl border p-5 ${getReliabilityColor(result.reliabilityScore)}`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5" />
              <h4 className="font-bold">Affidabilità stima: {result.reliabilityScore}%</h4>
            </div>
            <p className="text-sm opacity-90 leading-relaxed">
              {result.reliabilityNote}
            </p>
          </div>

           <button 
            onClick={onReset}
            className="w-full py-3 bg-white border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
          >
            Analizza un'altra foto
          </button>
        </div>

        {/* Column 2 & 3: Detailed Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Macro Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Ripartizione Macronutrienti</h3>
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
                        <p className="font-semibold text-slate-900">Proteine</p>
                        <p className="text-xs text-slate-500">Costruzione muscolare</p>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-emerald-700">{result.totalMacros.protein}g</span>
                 </div>

                 <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Wheat className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Carboidrati</p>
                        <p className="text-xs text-slate-500">Energia rapida</p>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-blue-700">{result.totalMacros.carbs}g</span>
                 </div>

                 <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 rounded-lg">
                         <Droplet className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Grassi</p>
                        <p className="text-xs text-slate-500">Energia e ormoni</p>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-amber-700">{result.totalMacros.fat}g</span>
                 </div>
              </div>
            </div>
          </div>

          {/* Ingredients Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Dettaglio Ingredienti</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs font-semibold tracking-wide text-slate-500 uppercase border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-4">Ingrediente</th>
                    <th className="px-6 py-4">Porzione (g)</th>
                    <th className="px-6 py-4">Calorie</th>
                    <th className="px-6 py-4">Macros (P/C/G)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                        Nessun ingrediente specifico identificato.
                      </td>
                    </tr>
                  ) : (
                    result.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
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
                          {item.portionGrams}g
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                            {item.calories} kcal
                          </span>
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
              * I valori nutrizionali sono stime basate su database standard e porzioni visive.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
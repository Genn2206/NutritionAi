import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { AnalysisResults } from './components/AnalysisResults';
import { analyzeFoodImage } from './services/geminiService';
import { AnalysisResult } from './types';
import { ScanSearch } from 'lucide-react';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Cleanup object URL when file changes
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [file]);

  const handleImageSelected = async (selectedFile: File) => {
    setFile(selectedFile);
    setImagePreview(URL.createObjectURL(selectedFile));
    setError(null);
    setResult(null);
    setIsLoading(true);

    try {
      const analysis = await analyzeFoodImage(selectedFile);
      setResult(analysis);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Si è verificato un errore durante l'analisi dell'immagine. Riprova.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          
          {!result && !imagePreview && (
            <div className="max-w-2xl mx-auto mt-8 md:mt-16 text-center space-y-8 animate-fade-in-up">
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                  Cosa stai mangiando?
                </h2>
                <p className="text-lg text-slate-600 max-w-lg mx-auto leading-relaxed">
                  Carica una foto del tuo piatto. La nostra AI identificherà gli ingredienti, 
                  stimerà le porzioni e calcolerà i valori nutrizionali in pochi secondi.
                </p>
              </div>

              <div className="bg-white p-2 rounded-3xl shadow-lg border border-slate-100">
                <ImageUploader onImageSelected={handleImageSelected} isLoading={isLoading} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-3xl mx-auto pt-8">
                <Feature 
                  title="Riconoscimento Istantaneo" 
                  desc="Identifica ingredienti complessi e piatti pronti."
                />
                <Feature 
                  title="Stima Porzioni" 
                  desc="Calcolo del peso basato su riferimenti visivi."
                />
                <Feature 
                  title="Analisi Completa" 
                  desc="Calorie e macro dettagliati per ogni ingrediente."
                />
              </div>
            </div>
          )}

          {isLoading && imagePreview && !result && (
            <div className="max-w-2xl mx-auto mt-16 text-center animate-pulse">
               <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 inline-block mb-8">
                <img src={imagePreview} className="w-64 h-64 object-cover rounded-xl opacity-50" alt="Processing" />
               </div>
               <h3 className="text-2xl font-bold text-slate-800">Analisi in corso...</h3>
               <p className="text-slate-500 mt-2">Stiamo interrogando il database nutrizionale</p>
            </div>
          )}

          {error && (
            <div className="max-w-md mx-auto mt-12 bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-600 font-medium mb-4">{error}</p>
              <button 
                onClick={handleReset}
                className="text-sm font-semibold text-red-700 hover:text-red-800 underline"
              >
                Riprova con un'altra immagine
              </button>
            </div>
          )}

          {result && imagePreview && !isLoading && (
            <AnalysisResults 
              result={result} 
              imagePreview={imagePreview}
              onReset={handleReset}
            />
          )}

        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} NutriScan AI. Non sostituisce il parere medico professionale.
          </p>
        </div>
      </footer>
    </div>
  );
};

const Feature = ({ title, desc }: { title: string; desc: string }) => (
  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
    <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-3 text-emerald-600">
      <ScanSearch size={20} />
    </div>
    <h4 className="font-semibold text-slate-900 mb-1">{title}</h4>
    <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

export default App;
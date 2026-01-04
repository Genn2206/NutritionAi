import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { AnalysisResults } from './components/AnalysisResults';
import { analyzeFoodImage } from './services/geminiService';
import { AnalysisResult, PlateSize } from './types';
import { ScanSearch } from 'lucide-react';
import { useLanguage } from './contexts/LanguageContext';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plateSize, setPlateSize] = useState<PlateSize>('medium');
  const [wasCorrected, setWasCorrected] = useState(false);
  
  const { t, language } = useLanguage();

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
    setWasCorrected(false);
    setIsLoading(true);

    try {
      const analysis = await analyzeFoodImage(selectedFile, language, plateSize);
      
      // Check for auto-correction
      if (analysis.detectedPlateSize && analysis.detectedPlateSize !== plateSize) {
        setPlateSize(analysis.detectedPlateSize);
        setWasCorrected(true);
      }

      setResult(analysis);
    } catch (err: any) {
      console.error(err);
      setError(err.message || t.error_generic);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
    setWasCorrected(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 selection:bg-emerald-100 selection:text-emerald-900">
      <Header />

      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          
          {!result && !imagePreview && (
            <div className="max-w-2xl mx-auto mt-8 md:mt-16 text-center space-y-8 animate-slide-up">
              <div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700">
                  {t.hero_title}
                </h2>
                <p className="text-lg md:text-xl text-slate-600 max-w-lg mx-auto leading-relaxed">
                  {t.hero_subtitle}
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-3 rounded-[2rem] shadow-xl border border-white/50 ring-1 ring-slate-200 hover:shadow-2xl transition-all duration-500">
                <ImageUploader 
                  onImageSelected={handleImageSelected} 
                  isLoading={isLoading} 
                  selectedPlateSize={plateSize}
                  onPlateSizeChange={setPlateSize}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-3xl mx-auto pt-8">
                <Feature 
                  title={t.feature_recognition_title} 
                  desc={t.feature_recognition_desc}
                  delay="delay-100"
                />
                <Feature 
                  title={t.feature_portion_title} 
                  desc={t.feature_portion_desc}
                  delay="delay-200"
                />
                <Feature 
                  title={t.feature_analysis_title} 
                  desc={t.feature_analysis_desc}
                  delay="delay-300"
                />
              </div>
            </div>
          )}

          {isLoading && imagePreview && !result && (
            <div className="max-w-2xl mx-auto mt-16 text-center animate-slide-up">
               <div className="bg-white p-4 rounded-3xl shadow-lg border border-slate-100 inline-block mb-8 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <img src={imagePreview} className="w-64 h-64 object-cover rounded-2xl opacity-60 blur-[1px] scale-100 animate-pulse-soft" alt="Processing" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
               </div>
               <h3 className="text-2xl font-bold text-slate-800 animate-pulse">{t.analyzing_title}</h3>
               <p className="text-slate-500 mt-2">{t.analyzing_desc}</p>
            </div>
          )}

          {error && (
            <div className="max-w-md mx-auto mt-12 bg-red-50 border border-red-200 rounded-2xl p-6 text-center animate-scale-in shadow-lg">
              <p className="text-red-600 font-medium mb-4">{error}</p>
              <button 
                onClick={handleReset}
                className="px-6 py-2 bg-white border border-red-200 text-red-600 font-semibold rounded-lg shadow-sm hover:bg-red-50 transition-colors"
              >
                {t.error_retry}
              </button>
            </div>
          )}

          {result && imagePreview && !isLoading && (
            <AnalysisResults 
              result={result} 
              imagePreview={imagePreview}
              onReset={handleReset}
              wasCorrected={wasCorrected}
            />
          )}

        </div>
      </main>

      <footer className="bg-white/50 backdrop-blur-md border-t border-slate-200/60 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm font-medium">
            © {new Date().getFullYear()} NutriScan AI.
          </p>
        </div>
      </footer>
    </div>
  );
};

const Feature = ({ title, desc, delay }: { title: string; desc: string; delay?: string }) => (
  <div className={`p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-slide-up ${delay}`}>
    <div className="h-12 w-12 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl flex items-center justify-center mb-4 text-emerald-600 shadow-inner">
      <ScanSearch size={24} />
    </div>
    <h4 className="font-bold text-slate-900 mb-2">{title}</h4>
    <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

export default App;
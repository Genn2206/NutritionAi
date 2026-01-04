import React, { useRef, useState } from 'react';
import { Upload, Loader2, Ruler } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { PlateSize } from '../types';

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  isLoading: boolean;
  selectedPlateSize: PlateSize;
  onPlateSizeChange: (size: PlateSize) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageSelected, 
  isLoading, 
  selectedPlateSize, 
  onPlateSizeChange 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const { t } = useLanguage();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("Please upload a valid image file.");
      return;
    }
    onImageSelected(file);
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const plateOptions: { value: PlateSize; label: string }[] = [
    { value: 'small', label: t.plate_small },
    { value: 'medium', label: t.plate_medium },
    { value: 'large', label: t.plate_large },
    { value: 'bowl', label: t.plate_bowl },
  ];

  return (
    <div className="w-full space-y-5">
      
      {/* Plate Size Selector */}
      <div className={`transition-all duration-500 delay-100 ${isLoading ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
        <label className="text-sm font-bold text-slate-700 mb-3 flex items-center justify-center gap-2">
          <Ruler size={16} className="text-emerald-500" />
          {t.plate_size_label}
        </label>
        <div className="flex flex-wrap justify-center gap-3">
          {plateOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onPlateSizeChange(option.value)}
              className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all duration-200 shadow-sm ${
                selectedPlateSize === option.value
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-emerald-200 shadow-md transform scale-105"
                  : "bg-white text-slate-500 border-slate-200 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50"
              }`}
              title={option.label}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Upload Area */}
      <div 
        className={`relative w-full rounded-[1.5rem] border-2 border-dashed transition-all duration-300 ease-out p-10 flex flex-col items-center justify-center text-center cursor-pointer min-h-[280px] group overflow-hidden ${
          dragActive 
            ? "border-emerald-500 bg-emerald-50/50 scale-[1.02] shadow-xl shadow-emerald-100 ring-4 ring-emerald-50" 
            : "border-slate-300 bg-slate-50/50 hover:bg-white hover:border-emerald-400 hover:shadow-lg"
        } ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-emerald-50/30 pointer-events-none transition-opacity duration-500 opacity-0 group-hover:opacity-100" />
        
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
          disabled={isLoading}
        />
        
        <div className="relative z-10 flex flex-col items-center justify-center">
          {isLoading ? (
            <>
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-emerald-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <Loader2 className="h-12 w-12 text-emerald-600 animate-spin relative z-10" />
              </div>
              <p className="text-xl font-bold text-slate-800 animate-pulse">{t.analyzing_title}</p>
              <p className="text-sm text-slate-500 mt-2">{t.analyzing_desc}</p>
            </>
          ) : (
            <>
              <div className={`bg-white p-5 rounded-2xl shadow-md mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${dragActive ? 'scale-110 rotate-3' : ''}`}>
                <Upload className={`h-10 w-10 transition-colors duration-300 ${dragActive ? "text-emerald-600" : "text-emerald-500 group-hover:text-emerald-600"}`} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-emerald-700 transition-colors">
                {t.upload_drag}
              </h3>
              <p className="text-slate-500 max-w-sm mb-8 leading-relaxed">
                {t.upload_subtext}
              </p>
              <button className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:shadow-emerald-300 hover:-translate-y-0.5 transition-all duration-200">
                {t.upload_button}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
import React, { useRef, useState } from 'react';
import { Upload, Loader2, Utensils, Ruler } from 'lucide-react';
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
    <div className="w-full space-y-4">
      
      {/* Plate Size Selector */}
      <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
          <Ruler size={16} />
          {t.plate_size_label}
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {plateOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onPlateSizeChange(option.value)}
              className={`px-2 py-2 text-xs font-medium rounded-lg border transition-all truncate ${
                selectedPlateSize === option.value
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md transform scale-[1.02]"
                  : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50"
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
        className={`relative w-full rounded-2xl border-2 border-dashed transition-all duration-200 ease-in-out p-8 flex flex-col items-center justify-center text-center cursor-pointer min-h-[250px] bg-slate-50 hover:bg-slate-100 ${
          dragActive ? "border-emerald-500 bg-emerald-50" : "border-slate-300"
        } ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
          disabled={isLoading}
        />
        
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
          {isLoading ? (
            <>
              <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mb-4" />
              <p className="text-lg font-medium text-slate-700">{t.analyzing_title}</p>
              <p className="text-sm text-slate-500">{t.analyzing_desc}</p>
            </>
          ) : (
            <>
              <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                <Upload className={`h-8 w-8 ${dragActive ? "text-emerald-500" : "text-slate-400"}`} />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                {t.upload_drag}
              </h3>
              <p className="text-slate-500 max-w-sm mb-6">
                {t.upload_subtext}
              </p>
              <button className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-medium shadow-sm hover:bg-emerald-700 transition-colors">
                {t.upload_button}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
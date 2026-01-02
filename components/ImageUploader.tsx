import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  isLoading: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

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
      alert("Per favore carica un file immagine valido.");
      return;
    }
    onImageSelected(file);
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      className={`relative w-full rounded-2xl border-2 border-dashed transition-all duration-200 ease-in-out p-8 flex flex-col items-center justify-center text-center cursor-pointer min-h-[300px] bg-slate-50 hover:bg-slate-100 ${
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
            <p className="text-lg font-medium text-slate-700">Analisi in corso...</p>
            <p className="text-sm text-slate-500">Stiamo identificando gli ingredienti</p>
          </>
        ) : (
          <>
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
              <Upload className={`h-8 w-8 ${dragActive ? "text-emerald-500" : "text-slate-400"}`} />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              Carica la foto del tuo piatto
            </h3>
            <p className="text-slate-500 max-w-sm mb-6">
              Trascina l'immagine qui o clicca per selezionarla dalla galleria.
            </p>
            <button className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-medium shadow-sm hover:bg-emerald-700 transition-colors">
              Seleziona Immagine
            </button>
          </>
        )}
      </div>
    </div>
  );
};
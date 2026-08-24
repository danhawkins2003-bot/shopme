import React, { useState, useRef } from "react";
import { Upload, X, Check, Image as ImageIcon, Camera, RotateCcw, Sparkles } from "lucide-react";
import { fileToOptimizedDataUrl } from "../lib/imageUtils";

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  currentImageUrl: string;
  defaultImageUrl?: string;
  onSaveImage: (newImageDataUrl: string) => void | Promise<void>;
  aspectRatio?: "square" | "portrait" | "landscape" | "banner";
}

export const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  currentImageUrl,
  defaultImageUrl,
  onSaveImage,
  aspectRatio = "square"
}) => {
  const [selectedImage, setSelectedImage] = useState<string>(currentImageUrl);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Veuillez sélectionner un fichier image valide (JPG, PNG, WEBP, etc.)");
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);
    try {
      // High-res optimized compression directly on device
      const maxDim = aspectRatio === "banner" ? 1600 : 1200;
      const dataUrl = await fileToOptimizedDataUrl(file, maxDim, maxDim, 0.88);
      setSelectedImage(dataUrl);
    } catch (err: any) {
      setErrorMessage("Erreur lors du traitement de l'image. Veuillez réessayer.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onSaveImage(selectedImage);
      onClose();
    } catch (e: any) {
      setErrorMessage("Erreur lors de l'enregistrement de l'image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetToDefault = () => {
    if (defaultImageUrl) {
      setSelectedImage(defaultImageUrl);
    }
  };

  const getAspectClass = () => {
    switch (aspectRatio) {
      case "banner":
        return "aspect-21/9 max-h-56";
      case "portrait":
        return "aspect-3/4 max-h-72";
      case "landscape":
        return "aspect-16/9 max-h-60";
      case "square":
      default:
        return "aspect-square max-h-64";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-neutral-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-neutral-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">{title}</h3>
              <p className="text-xs text-emerald-200/90 font-medium">{subtitle || "Importez une photo depuis votre appareil"}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {errorMessage && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 font-medium">
              {errorMessage}
            </div>
          )}

          {/* Live Preview Canvas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Aperçu en direct</span>
              {defaultImageUrl && selectedImage !== defaultImageUrl && (
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Rétablir l'image originale</span>
                </button>
              )}
            </div>

            <div className={`w-full ${getAspectClass()} rounded-xl overflow-hidden bg-neutral-100 border-2 border-dashed border-neutral-300 relative flex items-center justify-center shadow-inner`}>
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt="Aperçu"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-center p-4 text-neutral-400">
                  <ImageIcon className="w-10 h-10 mx-auto mb-2 text-neutral-300" />
                  <p className="text-xs">Aucune image sélectionnée</p>
                </div>
              )}

              {isProcessing && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white backdrop-blur-2xs">
                  <div className="w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <span className="text-xs font-semibold">Optimisation de l'image...</span>
                </div>
              )}
            </div>
          </div>

          {/* Upload Drop Zone & Direct Device Buttons */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-5 text-center transition-all ${
              isDragging
                ? "border-emerald-600 bg-emerald-50/70"
                : "border-neutral-200 bg-neutral-50/70 hover:border-emerald-400 hover:bg-emerald-50/30"
            }`}
          >
            <Upload className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
            <p className="text-xs font-bold text-neutral-800">
              Glissez-déposez une image ici ou choisissez depuis votre appareil
            </p>
            <p className="text-[11px] text-neutral-500 mt-1">
              Prend en charge tous les formats photos (JPG, PNG, WEBP, HEIC...)
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
              {/* Photo Gallery / File Pick */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Parcourir les photos</span>
              </button>

              {/* Mobile Camera Direct Capture */}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-2xs transition-transform active:scale-95 cursor-pointer sm:hidden"
              >
                <Camera className="w-4 h-4 text-emerald-700" />
                <span>Prendre une photo</span>
              </button>
            </div>

            {/* Hidden native file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
            />
          </div>

          <div className="flex items-center gap-2 text-[11px] text-neutral-500 bg-amber-50/70 border border-amber-200/60 p-2.5 rounded-lg">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>L'image est automatiquement compressée et stockée localement sur votre boutique sans avoir besoin d'URL externe.</span>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-neutral-50 p-4 border-t border-neutral-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-200/60 transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={isProcessing || !selectedImage}
            onClick={handleConfirm}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 rounded-xl flex items-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Appliquer cette image</span>
          </button>
        </div>

      </div>
    </div>
  );
};

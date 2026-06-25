import { useState, useEffect } from "react";
import { X, ZoomIn, ZoomOut, Download } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface ImageModalProps {
  src: string | null;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageModal({ src, alt, isOpen, onClose }: ImageModalProps) {
  const [scale, setScale] = useState(1);
  const [isZooming, setIsZooming] = useState(false);

  // Réinitialiser le zoom quand l'image change
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setIsZooming(false);
    }
  }, [isOpen, src]);

  // Gérer les touches clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") handleZoomIn();
      if (e.key === "-") handleZoomOut();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setScale(1);

  const handleDownload = () => {
    if (!src) return;
    const link = document.createElement("a");
    link.href = src;
    link.download = alt || "image";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen || !src) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md transition-all duration-300"
      onClick={onClose}
    >
      {/* Conteneur de l'image avec zoom */}
      <div
        className="relative flex max-h-[90vh] max-w-[90vw] items-center justify-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className={cn(
            "max-h-[85vh] max-w-[85vw] rounded-lg object-contain transition-transform duration-300",
            isZooming && "cursor-grab"
          )}
          style={{ transform: `scale(${scale})` }}
          onMouseDown={() => setIsZooming(true)}
          onMouseUp={() => setIsZooming(false)}
          onMouseLeave={() => setIsZooming(false)}
        />

        {/* Contrôles */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <span className="min-w-[40px] text-center text-sm text-white">
            {Math.round(scale * 100)}%
          </span>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>

          <div className="mx-1 h-6 w-px bg-white/30" />

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={(e) => { e.stopPropagation(); handleResetZoom(); }}
          >
            <span className="text-xs font-medium">1:1</span>
          </Button>

          <div className="mx-1 h-6 w-px bg-white/30" />

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={(e) => { e.stopPropagation(); handleDownload(); }}
          >
            <Download className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
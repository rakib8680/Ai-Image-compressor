import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './Icon';
import { OutputFormat } from '../types';

interface ImageDetailModalProps {
  originalImage: string;
  compressedImage: string;
  onClose: () => void;
  outputFormat: OutputFormat;
}

const ToolbarButton: React.FC<{ onClick: () => void, children: React.ReactNode, active?: boolean }> = ({ onClick, children, active = false }) => (
    <button
        onClick={onClick}
        className={`p-2 rounded-lg transition-colors ${active ? 'bg-brand-purple text-white' : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'}`}
    >
        {children}
    </button>
);

export const ImageDetailModal: React.FC<ImageDetailModalProps> = ({ originalImage, compressedImage, onClose, outputFormat }) => {
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isComparing, setIsComparing] = useState(false);
    const [sliderPos, setSliderPos] = useState(50);
    const [naturalDims, setNaturalDims] = useState({ w: 0, h: 0 });

    const imageContainerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    const clampOffset = (newOffset: {x: number, y: number}, currentScale: number) => {
        if (!imageContainerRef.current || !naturalDims.w) return newOffset;

        const { clientWidth, clientHeight } = imageContainerRef.current;
        const { w: naturalWidth, h: naturalHeight } = naturalDims;

        const scaledWidth = naturalWidth * currentScale;
        const scaledHeight = naturalHeight * currentScale;

        const overpanX = Math.max(0, (scaledWidth - clientWidth) / 2);
        const overpanY = Math.max(0, (scaledHeight - clientHeight) / 2);
        
        const clampedX = Math.max(-overpanX, Math.min(overpanX, newOffset.x));
        const clampedY = Math.max(-overpanY, Math.min(overpanY, newOffset.y));

        return { x: clampedX, y: clampedY };
    }

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const newScale = Math.min(Math.max(0.5, scale - e.deltaY * 0.001), 4);
        setScale(newScale);
        setOffset(prevOffset => clampOffset(prevOffset, newScale));
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (scale <= 1 || isComparing) return;
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || scale <= 1 || isComparing) return;
        e.preventDefault();
        const newOffset = {
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
        };
        setOffset(clampOffset(newOffset, scale));
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const resetView = () => {
        setScale(1);
        setOffset({ x: 0, y: 0 });
    };
    
    const handleSliderMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.buttons !== 1) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        setSliderPos((x / rect.width) * 100);
    };
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const cursor = isDragging ? 'grabbing' : (scale > 1 && !isComparing) ? 'grab' : 'default';

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in-up" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
            <div 
                ref={imageContainerRef}
                className="relative w-full h-full flex items-center justify-center overflow-hidden"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                style={{ cursor: cursor }}
            >
                <div 
                    className="relative"
                    style={{ 
                        transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)`,
                        transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                    }}
                >
                    <img ref={imgRef} src={originalImage} alt="Original" className="max-w-[90vw] max-h-[90vh] object-contain select-none" draggable="false" onLoad={(e) => setNaturalDims({ w: (e.target as HTMLImageElement).naturalWidth, h: (e.target as HTMLImageElement).naturalHeight })} />
                    {isComparing && (
                        <>
                            <div className="absolute top-0 left-0 h-full w-full" style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}>
                                <img src={compressedImage} alt="Compressed" className="max-w-[90vw] max-h-[90vh] object-contain select-none" draggable="false" />
                            </div>
                             <div className="absolute top-0 bottom-0 bg-white w-1 cursor-ew-resize" style={{ left: `${sliderPos}%` }} onMouseDown={(e) => e.stopPropagation()}>
                                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-white shadow-lg flex items-center justify-center">
                                    <Icon name="compare" className="w-5 h-5 text-brand-purple rotate-90" />
                                </div>
                             </div>
                        </>
                    )}
                </div>
                 { isComparing && <div onMouseMove={handleSliderMove} className="absolute top-0 left-0 w-full h-full cursor-ew-resize"></div> }
            </div>
            
            <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-brand-purple transition-colors">
                <Icon name="close" className="w-10 h-10" />
            </button>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md p-2 rounded-xl shadow-lg border border-slate-700">
                <ToolbarButton onClick={() => setScale(s => Math.min(s * 1.2, 4))}>
                    <Icon name="zoom-in" className="w-6 h-6" />
                </ToolbarButton>
                <ToolbarButton onClick={() => setScale(s => Math.max(s / 1.2, 0.5))}>
                     <Icon name="zoom-out" className="w-6 h-6" />
                </ToolbarButton>
                <ToolbarButton onClick={resetView}>
                    <Icon name="reset" className="w-6 h-6" />
                </ToolbarButton>
                 <div className="w-px h-6 bg-slate-600 mx-2"></div>
                <ToolbarButton onClick={() => setIsComparing(!isComparing)} active={isComparing}>
                    <Icon name="compare" className="w-6 h-6" />
                </ToolbarButton>
                <div className="w-px h-6 bg-slate-600 mx-2"></div>
                <a
                  href={compressedImage}
                  download={`compressed_image.${outputFormat}`}
                  className="p-2 rounded-lg transition-colors bg-green-600 text-white hover:bg-green-500 flex items-center gap-2 px-4"
                >
                  <Icon name="download" className="w-6 h-6" />
                  <span className="font-semibold">Download</span>
                </a>
            </div>
        </div>
    );
};
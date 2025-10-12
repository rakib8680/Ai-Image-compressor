import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Icon } from './Icon';
import { OutputFormat } from '../types';
import { Tooltip } from './Tooltip';

interface ImageDetailModalProps {
  originalImage: string;
  compressedImage: string;
  onClose: () => void;
  outputFormat: OutputFormat;
  onCrop: (originalCropped: string, compressedCropped: string) => void;
}

type CropRect = { x: number, y: number, width: number, height: number };

const ToolbarButton: React.FC<{ onClick: () => void, children: React.ReactNode, active?: boolean }> = ({ onClick, children, active = false }) => (
    <button
        onClick={onClick}
        className={`p-2 rounded-lg transition-colors ${active ? 'bg-brand-purple text-white' : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'}`}
    >
        {children}
    </button>
);

export const ImageDetailModal: React.FC<ImageDetailModalProps> = ({ originalImage, compressedImage, onClose, outputFormat, onCrop }) => {
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [sliderPos, setSliderPos] = useState(50);
    const [naturalDims, setNaturalDims] = useState({ w: 0, h: 0 });
    const [isSpacebarDown, setIsSpacebarDown] = useState(false);
    
    const [isComparing, setIsComparing] = useState(true);
    const [isCropping, setIsCropping] = useState(false);
    const [cropRect, setCropRect] = useState<CropRect | null>(null);
    const [cropStartPoint, setCropStartPoint] = useState<{ x: number, y: number } | null>(null);

    const imageContainerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    const isInteractive = !isCropping && !cropStartPoint;

    const clampOffset = useCallback((newOffset: {x: number, y: number}, currentScale: number) => {
        if (!imageContainerRef.current || !naturalDims.w) return newOffset;

        const { clientWidth, clientHeight } = imageContainerRef.current;
        const scaledWidth = naturalDims.w * currentScale;
        const scaledHeight = naturalDims.h * currentScale;

        const overpanX = Math.max(0, (scaledWidth - clientWidth) / 2);
        const overpanY = Math.max(0, (scaledHeight - clientHeight) / 2);
        
        return { 
            x: Math.max(-overpanX, Math.min(overpanX, newOffset.x)), 
            y: Math.max(-overpanY, Math.min(overpanY, newOffset.y))
        };
    }, [naturalDims]);

    const resetView = useCallback(() => {
        setScale(1);
        setOffset({ x: 0, y: 0 });
    }, []);

    const handleWheel = (e: React.WheelEvent) => {
        if (!isInteractive) return;
        e.preventDefault();
        const newScale = Math.min(Math.max(0.5, scale - e.deltaY * 0.001), 8);
        setScale(newScale);
        setOffset(prevOffset => clampOffset(prevOffset, newScale));
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!isInteractive || (scale <= 1 && !isSpacebarDown)) return;
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !isInteractive) return;
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

    const getPointOnNaturalImage = useCallback((e: React.MouseEvent): { x: number, y: number } | null => {
        if (!imageRef.current || !naturalDims.w) return null;
        
        const imgRect = imageRef.current.getBoundingClientRect();
        
        const clickX = e.clientX - imgRect.left;
        const clickY = e.clientY - imgRect.top;
        
        const naturalX = (clickX / imgRect.width) * naturalDims.w;
        const naturalY = (clickY / imgRect.height) * naturalDims.h;
    
        return {
            x: Math.max(0, Math.min(naturalDims.w, naturalX)),
            y: Math.max(0, Math.min(naturalDims.h, naturalY)),
        };
    }, [naturalDims]);

    const handleCropMouseDown = (e: React.MouseEvent) => {
        if (!isCropping) return;
        e.preventDefault();
        setCropRect(null);
        setCropStartPoint(getPointOnNaturalImage(e));
    };

    const handleCropMouseMove = (e: React.MouseEvent) => {
        if (!isCropping || !cropStartPoint) return;
        e.preventDefault();
        const currentPoint = getPointOnNaturalImage(e);
        if (!currentPoint) return;

        const x = Math.min(cropStartPoint.x, currentPoint.x);
        const y = Math.min(cropStartPoint.y, currentPoint.y);
        const width = Math.abs(currentPoint.x - cropStartPoint.x);
        const height = Math.abs(currentPoint.y - cropStartPoint.y);
        setCropRect({ x, y, width, height });
    };

    const handleCropMouseUp = () => {
        setCropStartPoint(null);
    };

    const toggleCropMode = () => {
        setIsCropping(!isCropping);
        setCropRect(null);
        setCropStartPoint(null);
    };

    const handleConfirmCrop = async () => {
        if (!cropRect || cropRect.width < 1 || cropRect.height < 1) return;

        const cropImage = (base64: string): Promise<string> => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = cropRect.width;
                    canvas.height = cropRect.height;
                    const ctx = canvas.getContext('2d');
                    if(ctx) {
                        ctx.drawImage(img, cropRect.x, cropRect.y, cropRect.width, cropRect.height, 0, 0, cropRect.width, cropRect.height);
                        resolve(canvas.toDataURL(outputFormat === 'jpeg' ? 'image/jpeg' : 'image/png'));
                    } else {
                        reject(new Error('Could not get canvas context'));
                    }
                };
                img.onerror = () => reject(new Error('Image failed to load for cropping'));
                img.src = base64;
            });
        };

        try {
            const [croppedOriginal, croppedCompressed] = await Promise.all([
                cropImage(originalImage),
                cropImage(compressedImage)
            ]);
            onCrop(croppedOriginal, croppedCompressed);
        } catch (error) {
            console.error("Cropping failed:", error);
        }
    };
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === ' ') {
                e.preventDefault();
                setIsSpacebarDown(true);
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === ' ') {
                setIsSpacebarDown(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        }
    }, [onClose]);
    
    useEffect(() => {
      if(isCropping) {
        resetView();
      }
    }, [isCropping, resetView]);

    const handleSliderMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.buttons !== 1 || !isComparing || isCropping) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
        setSliderPos((x / rect.width) * 100);
    };

    let cursor = 'default';
    if (isCropping) cursor = 'crosshair';
    else if (isDragging) cursor = 'grabbing';
    else if (isSpacebarDown) cursor = 'grab';
    else if (scale > 1 && isInteractive) cursor = 'grab';

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-fade-in-up" onMouseUp={isCropping ? handleCropMouseUp : handleMouseUp} onMouseLeave={isCropping ? handleCropMouseUp : handleMouseUp}>
            <div 
                ref={imageContainerRef}
                className="relative w-full h-full flex items-center justify-center overflow-hidden"
                onWheel={handleWheel}
                onMouseDown={isCropping ? handleCropMouseDown : handleMouseDown}
                onMouseMove={isCropping ? handleCropMouseMove : handleMouseMove}
                style={{ cursor }}
            >
                <div 
                    className="relative"
                    style={{ 
                        transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)`,
                        transition: isDragging || cropStartPoint ? 'none' : 'transform 0.1s ease-out',
                        touchAction: 'none',
                    }}
                >
                   <img 
                     ref={imageRef}
                     src={originalImage} 
                     alt="Original" 
                     className="max-w-[90vw] max-h-[90vh] object-contain select-none pointer-events-none" 
                     draggable="false" 
                     onLoad={(e) => setNaturalDims({ w: (e.target as HTMLImageElement).naturalWidth, h: (e.target as HTMLImageElement).naturalHeight })} 
                   />
                   
                    <div className="absolute top-0 left-0 h-full w-full" style={{ clipPath: isComparing ? `inset(0 ${100 - sliderPos}% 0 0)` : 'none' }}>
                        <img src={compressedImage} alt="Compressed" className="absolute top-0 left-0 w-full h-full object-contain select-none pointer-events-none" draggable="false" />
                    </div>
                   
                   {isComparing && (
                        <>
                            <div className="absolute top-0 bottom-0 bg-white w-1 z-10 pointer-events-none" style={{ left: `${sliderPos}%` }}>
                                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-white shadow-lg flex items-center justify-center">
                                    <Icon name="compare" className="w-5 h-5 text-brand-purple rotate-90" />
                                </div>
                            </div>
                            <div onMouseMove={handleSliderMove} className="absolute top-0 left-0 w-full h-full" style={{ cursor: 'ew-resize' }}></div>
                        </>
                    )}

                    {isCropping && cropRect && (
                        <div className="absolute border-2 border-dashed border-white bg-black/40 pointer-events-none" style={{
                            left: cropRect.x,
                            top: cropRect.y,
                            width: cropRect.width,
                            height: cropRect.height,
                        }} />
                    )}
                </div>
            </div>
            
            <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-brand-purple transition-colors z-20">
              <Tooltip text="Close (Esc)">
                <Icon name="close" className="w-10 h-10" />
              </Tooltip>
            </button>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md p-2 rounded-xl shadow-lg border border-slate-700 z-20">
                {!isCropping ? (
                    <>
                        <Tooltip text="Zoom In"><ToolbarButton onClick={() => setScale(s => Math.min(s * 1.2, 8))}><Icon name="zoom-in" className="w-6 h-6" /></ToolbarButton></Tooltip>
                        <Tooltip text="Zoom Out"><ToolbarButton onClick={() => setScale(s => Math.max(s / 1.2, 0.5))}><Icon name="zoom-out" className="w-6 h-6" /></ToolbarButton></Tooltip>
                        <Tooltip text="Reset View / Pan (Hold Space)"><ToolbarButton onClick={resetView}><Icon name="reset" className="w-6 h-6" /></ToolbarButton></Tooltip>
                        <div className="w-px h-6 bg-slate-600 mx-2"></div>
                        <Tooltip text="Toggle Comparison Slider"><ToolbarButton onClick={() => setIsComparing(!isComparing)} active={isComparing}><Icon name="compare" className="w-6 h-6" /></ToolbarButton></Tooltip>
                        <Tooltip text="Crop Image"><ToolbarButton onClick={toggleCropMode} active={isCropping}><Icon name="crop" className="w-6 h-6" /></ToolbarButton></Tooltip>
                    </>
                ) : (
                    <>
                       <Tooltip text="Cancel cropping and return">
                          <button onClick={toggleCropMode} className="p-2 rounded-lg transition-colors bg-slate-600 text-white hover:bg-slate-500 flex items-center gap-2 px-4">
                              <span className="font-semibold">Cancel</span>
                          </button>
                        </Tooltip>
                        <Tooltip text="Apply the crop to both images">
                          <button onClick={handleConfirmCrop} disabled={!cropRect || cropRect.width < 1} className="p-2 rounded-lg transition-colors bg-green-600 text-white hover:bg-green-500 flex items-center gap-2 px-4 disabled:bg-green-800 disabled:cursor-not-allowed">
                              <span className="font-semibold">Confirm Crop</span>
                          </button>
                        </Tooltip>
                    </>
                )}
            </div>
        </div>
    );
};

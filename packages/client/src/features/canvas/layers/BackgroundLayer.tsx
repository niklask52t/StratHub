/**
 * Background layer — renders the map floor image on a canvas element.
 *
 * When in "real view" mode, hides the raster canvas and renders
 * the SVG map view component instead (lazy-loaded to keep the
 * initial bundle small).
 */

import { useRef, useEffect, lazy, Suspense } from 'react';

const SvgMapView = lazy(() => import('@/features/strat/components/SvgMapView'));

interface BackgroundLayerProps {
  imagePath?: string;
  isRealView: boolean;
  mapSlug?: string;
  floorNumber?: number;
  onImageLoaded: (width: number, height: number) => void;
}

export function BackgroundLayer({
  imagePath,
  isRealView,
  mapSlug,
  floorNumber,
  onImageLoaded,
}: BackgroundLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!imagePath) return;

    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.addEventListener('load', () => {
      if (cancelled) return;

      onImageLoaded(img.width, img.height);

      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, img.width, img.height);
        ctx.drawImage(img, 0, 0);
      }
    }, { once: true });

    img.src = `/uploads${imagePath}`;

    return () => { cancelled = true; };
  }, [imagePath, onImageLoaded]);

  return (
    <>
      {isRealView && mapSlug && floorNumber != null && (
        <Suspense fallback={null}>
          <SvgMapView mapSlug={mapSlug} floorNumber={floorNumber} />
        </Suspense>
      )}
      <canvas
        ref={canvasRef}
        style={{
          imageRendering: 'auto',
          position: 'absolute',
          inset: 0,
          display: isRealView ? 'none' : undefined,
        }}
      />
    </>
  );
}

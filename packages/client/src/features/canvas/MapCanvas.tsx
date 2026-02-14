import { useState, useMemo, useRef, useCallback } from 'react';
import { useCanvasStore } from '@/stores/canvas.store';
import { ZOOM_STEP } from '@tactihub/shared';
import type { ViewMode } from '@tactihub/shared';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, ZoomIn, ZoomOut, Maximize, Camera, FileDown } from 'lucide-react';
import { hasSvgMap } from '@/data/svgMapIndex';
import LayerTogglePanel from '@/features/strat/components/LayerTogglePanel';
import { BackgroundLayer } from './layers/BackgroundLayer';
import { DrawLayer } from './layers/DrawLayer';
import { ActiveLayer } from './layers/ActiveLayer';
import { Compass } from './Compass';
import { useViewport } from './hooks/useViewport';
import { useToolRouter } from './tools/useToolRouter';
import { exportFloorAsPng, exportAllFloorsAsPdf } from './utils/exportCanvas';
import type { Floor, LaserLineData, CursorData } from './types';

const VIEW_MODE_LABELS: Record<ViewMode, string> = {
  blueprint: 'Blueprint',
  dark: 'Darkprint',
  white: 'Whiteprint',
  realview: 'Real View',
};

interface MapCanvasProps {
  floors: Floor[];
  readOnly?: boolean;
  onDrawCreate?: (floorId: string, draws: any[]) => void;
  onDrawDelete?: (drawIds: string[]) => void;
  onDrawUpdate?: (drawId: string, updates: any) => void;
  onLaserLine?: (points: Array<{ x: number; y: number }>, color: string) => void;
  onCursorMove?: (x: number, y: number, isLaser: boolean) => void;
  peerLaserLines?: LaserLineData[];
  cursors?: Map<string, CursorData>;
  localDraws?: Record<string, any[]>;
  currentUserId?: string | null;
  activePhaseId?: string | null;
  visibleSlotIds?: Set<string> | null;
  landscapeVisible?: boolean;
  mapSlug?: string;
}

export default function MapCanvas({
  floors, readOnly = false,
  onDrawCreate, onDrawDelete, onDrawUpdate,
  onLaserLine, onCursorMove,
  peerLaserLines, cursors,
  localDraws, currentUserId,
  activePhaseId, visibleSlotIds, landscapeVisible = true,
  mapSlug,
}: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeCanvasRef = useRef<HTMLCanvasElement>(null);
  const { offsetX, offsetY, scale, zoomTo, resetViewport, containerWidth, containerHeight, selectedDrawId } = useCanvasStore();

  // Floor management
  const sortedFloors = useMemo(() =>
    [...floors].sort((a, b) => (a.mapFloor?.floorNumber ?? 0) - (b.mapFloor?.floorNumber ?? 0)),
    [floors],
  );
  const [currentFloorIndex, setCurrentFloorIndex] = useState(0);
  const currentFloor = sortedFloors[currentFloorIndex];

  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>('blueprint');
  const svgAvailable = !!mapSlug && hasSvgMap(mapSlug);
  const availableModes = useMemo<ViewMode[]>(() => {
    const mf = currentFloor?.mapFloor;
    if (!mf) return svgAvailable ? ['realview'] : ['blueprint'];
    const modes: ViewMode[] = ['blueprint'];
    if (mf.darkImagePath) modes.push('dark');
    if (mf.whiteImagePath) modes.push('white');
    if (svgAvailable) modes.push('realview');
    return modes;
  }, [currentFloor?.mapFloor, svgAvailable]);

  const activeImagePath = useMemo(() => {
    const mf = currentFloor?.mapFloor;
    if (!mf) return undefined;
    if (viewMode === 'dark' && mf.darkImagePath) return mf.darkImagePath;
    if (viewMode === 'white' && mf.whiteImagePath) return mf.whiteImagePath;
    return mf.imagePath;
  }, [currentFloor?.mapFloor, viewMode]);

  const isRealView = viewMode === 'realview';

  // Canvas sizing
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 });

  const handleImageLoaded = useCallback((imgW: number, imgH: number) => {
    setCanvasSize({ width: imgW, height: imgH });
    // Center the image in the viewport
    requestAnimationFrame(() => {
      const container = containerRef.current;
      if (container) {
        const store = useCanvasStore.getState();
        store.setDimensions(imgW, imgH, container.clientWidth, container.clientHeight);
        store.resetViewport();
      }
    });
  }, []);

  // Viewport (resize observer, WASD panning, floor change reset)
  useViewport(containerRef, currentFloorIndex);

  // All draws for this floor (server + local)
  const allDraws = useMemo(() => {
    if (!currentFloor) return [];
    return [...(currentFloor.draws || []), ...(localDraws?.[currentFloor.id] || [])];
  }, [currentFloor, localDraws]);

  // Tool router
  const toolRouter = useToolRouter({
    containerRef,
    floorId: currentFloor?.id || '',
    allDraws,
    readOnly,
    currentUserId: currentUserId ?? null,
    activePhaseId,
    visibleSlotIds,
    landscapeVisible,
    onDrawCreate,
    onDrawDelete,
    onDrawUpdate,
    onLaserLine,
    onCursorMove,
    activeCanvasRef,
  });

  // Floor navigation
  const goUp = () => setCurrentFloorIndex(i => Math.min(i + 1, sortedFloors.length - 1));
  const goDown = () => setCurrentFloorIndex(i => Math.max(i - 1, 0));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'k' || e.key === 'K') goUp();
    if (e.key === 'j' || e.key === 'J') goDown();
  };

  // Zoom buttons
  const zoomIn = () => {
    const cx = (containerWidth || 1200) / 2;
    const cy = (containerHeight || 800) / 2;
    zoomTo(scale + ZOOM_STEP, cx, cy);
  };
  const zoomOut = () => {
    const cx = (containerWidth || 1200) / 2;
    const cy = (containerHeight || 800) / 2;
    zoomTo(scale - ZOOM_STEP, cx, cy);
  };

  if (sortedFloors.length === 0) {
    return <div className="flex items-center justify-center h-96 text-muted-foreground">No floors available</div>;
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden border rounded-lg bg-black/50"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onContextMenu={e => e.preventDefault()}
    >
      {/* Floor switcher — top right */}
      <div className="absolute top-4 right-4 z-10 flex flex-col items-center gap-1 bg-background/90 rounded-lg border p-2">
        <Button variant="ghost" size="sm" onClick={goUp} disabled={currentFloorIndex >= sortedFloors.length - 1}>
          <ChevronUp className="h-4 w-4" />
        </Button>
        <span className="text-xs font-medium px-2">
          {currentFloor?.mapFloor?.name || `Floor ${currentFloorIndex + 1}`}
        </span>
        <Button variant="ghost" size="sm" onClick={goDown} disabled={currentFloorIndex <= 0}>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      {/* View mode switcher — top left */}
      {availableModes.length > 1 && (
        <div className="absolute top-4 left-4 z-10 flex items-center gap-1 bg-background/90 rounded-lg border p-1">
          {availableModes.map(mode => (
            <Button
              key={mode}
              variant={viewMode === mode ? 'default' : 'ghost'}
              size="sm"
              className="text-xs px-2 h-7"
              onClick={() => setViewMode(mode)}
            >
              {VIEW_MODE_LABELS[mode]}
            </Button>
          ))}
        </div>
      )}

      {/* Export + Zoom controls — bottom right */}
      <div className="absolute bottom-4 right-4 z-10 flex items-end gap-2">
        <div className="flex flex-col items-center gap-1 bg-background/90 rounded-lg border p-1">
          <Button
            variant="ghost" size="sm" title="Export floor as PNG"
            onClick={() => currentFloor && exportFloorAsPng(currentFloor, localDraws?.[currentFloor.id] || [], activeImagePath)}
          >
            <Camera className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost" size="sm" title="Export all floors as PDF"
            onClick={() => exportAllFloorsAsPdf([...sortedFloors].reverse(), localDraws || {}, currentFloor?.mapFloor?.name?.split(' ')[0] || 'strategy')}
          >
            <FileDown className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-col items-center gap-1 bg-background/90 rounded-lg border p-1">
          <Button variant="ghost" size="sm" onClick={zoomIn}><ZoomIn className="h-4 w-4" /></Button>
          <span className="text-xs font-medium px-2">{Math.round(scale * 100)}%</span>
          <Button variant="ghost" size="sm" onClick={zoomOut}><ZoomOut className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={resetViewport}><Maximize className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* Compass — bottom left */}
      <Compass />

      {/* Layer toggle panel — visible in real view mode */}
      {isRealView && (
        <div className="absolute bottom-4 left-4 z-10">
          <LayerTogglePanel />
        </div>
      )}

      {/* Viewport transform container */}
      <div
        className="relative"
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
          transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
          transformOrigin: '0 0',
        }}
      >
        <BackgroundLayer
          imagePath={activeImagePath}
          isRealView={isRealView}
          mapSlug={mapSlug}
          floorNumber={currentFloor?.mapFloor?.floorNumber}
          onImageLoaded={handleImageLoaded}
        />
        <DrawLayer
          width={canvasSize.width}
          height={canvasSize.height}
          draws={allDraws}
          currentUserId={currentUserId}
          selectedDrawId={selectedDrawId}
          draggedDrawId={toolRouter.draggedDrawId}
          activePhaseId={activePhaseId}
          visibleSlotIds={visibleSlotIds}
          landscapeVisible={landscapeVisible}
        />
        <ActiveLayer
          width={canvasSize.width}
          height={canvasSize.height}
          cursor={toolRouter.getCursor()}
          drawPreview={toolRouter.drawPreview}
          localLaserPos={toolRouter.localLaserPos}
          laserFadeLines={toolRouter.laserFadeLines}
          laserPreviewPath={toolRouter.laserPreviewPath}
          peerLaserLines={peerLaserLines}
          cursors={cursors}
          onMouseDown={toolRouter.onMouseDown}
          onMouseMove={toolRouter.onMouseMove}
          onMouseUp={toolRouter.onMouseUp}
          onMouseLeave={toolRouter.onMouseLeave}
        />
      </div>
    </div>
  );
}

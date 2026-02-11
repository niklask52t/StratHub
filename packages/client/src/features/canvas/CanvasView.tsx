import { useState, useMemo } from 'react';
import { CanvasLayer } from './CanvasLayer';
import { Compass } from './Compass';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { useCanvasStore } from '@/stores/canvas.store';
import { ZOOM_STEP } from '@tactihub/shared';

interface Floor {
  id: string;
  mapFloorId: string;
  mapFloor?: { id: string; name: string; floorNumber: number; imagePath: string };
  draws?: any[];
}

interface CanvasViewProps {
  floors: Floor[];
  readOnly?: boolean;
  onDrawCreate?: (floorId: string, draws: any[]) => void;
  onDrawDelete?: (drawIds: string[]) => void;
}

export function CanvasView({ floors, readOnly = false, onDrawCreate, onDrawDelete }: CanvasViewProps) {
  const { scale, zoomTo, resetViewport, offsetX, offsetY } = useCanvasStore();

  const sortedFloors = useMemo(() =>
    [...floors].sort((a, b) => (a.mapFloor?.floorNumber ?? 0) - (b.mapFloor?.floorNumber ?? 0)),
    [floors],
  );

  const [currentFloorIndex, setCurrentFloorIndex] = useState(0);
  const currentFloor = sortedFloors[currentFloorIndex];

  const goUp = () => setCurrentFloorIndex((i) => Math.min(i + 1, sortedFloors.length - 1));
  const goDown = () => setCurrentFloorIndex((i) => Math.max(i - 1, 0));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'k' || e.key === 'K') goUp();
    if (e.key === 'j' || e.key === 'J') goDown();
  };

  // Zoom via buttons — zoom centered on current viewport center
  const zoomIn = () => {
    const cx = -offsetX + 600;
    const cy = -offsetY + 400;
    zoomTo(scale + ZOOM_STEP, cx, cy);
  };
  const zoomOut = () => {
    const cx = -offsetX + 600;
    const cy = -offsetY + 400;
    zoomTo(scale - ZOOM_STEP, cx, cy);
  };

  if (sortedFloors.length === 0) {
    return <div className="flex items-center justify-center h-96 text-muted-foreground">No floors available</div>;
  }

  return (
    <div className="relative" tabIndex={0} onKeyDown={handleKeyDown}>
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

      {/* Zoom controls — bottom right */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col items-center gap-1 bg-background/90 rounded-lg border p-1">
        <Button variant="ghost" size="sm" onClick={zoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <span className="text-xs font-medium px-2">{Math.round(scale * 100)}%</span>
        <Button variant="ghost" size="sm" onClick={zoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={resetViewport}>
          <Maximize className="h-4 w-4" />
        </Button>
      </div>

      {/* Compass — bottom left */}
      <Compass />

      {/* Canvas */}
      <CanvasLayer
        floor={currentFloor!}
        readOnly={readOnly}
        onDrawCreate={onDrawCreate}
        onDrawDelete={onDrawDelete}
      />
    </div>
  );
}

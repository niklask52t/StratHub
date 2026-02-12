import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { CanvasView } from '@/features/canvas/CanvasView';
import { Toolbar } from '@/features/canvas/tools/Toolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, AlertTriangle, Gamepad2 } from 'lucide-react';
import { useCanvasStore } from '@/stores/canvas.store';

interface Game {
  id: string; name: string; slug: string; icon: string | null;
}

interface MapData {
  id: string; name: string; slug: string; thumbnail: string | null;
}

interface GameWithMaps extends Game {
  maps: MapData[];
}

interface MapFloor {
  id: string; name: string; floorNumber: number; imagePath: string;
  darkImagePath?: string | null; whiteImagePath?: string | null;
}

interface MapWithFloors extends MapData {
  floors: MapFloor[];
}

export default function SandboxPage() {
  const [step, setStep] = useState<'game' | 'map' | 'canvas'>('game');
  const [selectedGame, setSelectedGame] = useState<GameWithMaps | null>(null);
  const [selectedMap, setSelectedMap] = useState<MapWithFloors | null>(null);

  // Local draws state (no persistence)
  const [localDraws, setLocalDraws] = useState<Map<string, any[]>>(new Map());
  const { pushMyDraw, popUndo, popRedo } = useCanvasStore();

  const { data: gamesData, isLoading: gamesLoading } = useQuery({
    queryKey: ['games'],
    queryFn: () => apiGet<{ data: Game[] }>('/games'),
  });

  const { data: gameDetailData } = useQuery({
    queryKey: ['game', selectedGame?.slug],
    queryFn: () => apiGet<{ data: GameWithMaps }>(`/games/${selectedGame!.slug}`),
    enabled: !!selectedGame?.slug,
  });

  const { data: mapDetailData } = useQuery({
    queryKey: ['map', selectedGame?.slug, selectedMap?.slug],
    queryFn: () => apiGet<{ data: MapWithFloors }>(`/games/${selectedGame!.slug}/maps/${selectedMap!.slug}`),
    enabled: !!selectedGame?.slug && !!selectedMap?.slug,
  });

  const handleSelectGame = (game: Game) => {
    setSelectedGame(game as GameWithMaps);
    setStep('map');
  };

  const handleSelectMap = (map: MapData) => {
    setSelectedMap(map as MapWithFloors);
    setStep('canvas');
  };

  const handleDrawCreate = useCallback((floorId: string, draws: any[]) => {
    const newDraws = draws.map((d) => ({
      ...d,
      id: crypto.randomUUID(),
      battleplanFloorId: floorId,
      isDeleted: false,
    }));
    setLocalDraws((prev) => {
      const next = new Map(prev);
      const existing = next.get(floorId) || [];
      next.set(floorId, [...existing, ...newDraws]);
      return next;
    });
    for (const draw of newDraws) {
      pushMyDraw({ id: draw.id, floorId, payload: draws[0] });
    }
  }, [pushMyDraw]);

  const handleDrawDelete = useCallback((drawIds: string[]) => {
    setLocalDraws((prev) => {
      const next = new Map(prev);
      for (const [floorId, draws] of next) {
        next.set(floorId, draws.filter((d) => !drawIds.includes(d.id)));
      }
      return next;
    });
  }, []);

  const handleUndo = useCallback(() => {
    const entry = popUndo();
    if (entry) handleDrawDelete([entry.id]);
  }, [popUndo, handleDrawDelete]);

  const handleRedo = useCallback(() => {
    const entry = popRedo();
    if (entry) handleDrawCreate(entry.floorId, [entry.payload]);
  }, [popRedo, handleDrawCreate]);

  // Build floors with local draws for CanvasView
  const floors = (mapDetailData?.data?.floors || []).map((floor) => ({
    id: floor.id,
    mapFloorId: floor.id,
    mapFloor: floor,
    draws: localDraws.get(floor.id) || [],
  }));

  if (step === 'canvas' && selectedMap) {
    return (
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center gap-2 mb-4 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg text-sm text-primary">
          <AlertTriangle className="h-4 w-4" />
          Sandbox Mode — Draws are not saved. Log in to persist your work.
        </div>

        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" onClick={() => { setStep('map'); setSelectedMap(null); }}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Maps
          </Button>
          <h2 className="text-lg font-bold">{selectedMap.name}</h2>
        </div>

        <div className="flex justify-center mb-4">
          <Toolbar onUndo={handleUndo} onRedo={handleRedo} />
        </div>

        <CanvasView
          floors={floors}
          onDrawCreate={handleDrawCreate}
          onDrawDelete={handleDrawDelete}
        />
      </div>
    );
  }

  if (step === 'map' && selectedGame) {
    const maps = gameDetailData?.data?.maps || [];
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => { setStep('game'); setSelectedGame(null); }}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h1 className="text-3xl font-bold">{selectedGame.name} — Choose a Map</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {maps.map((map) => (
            <Card key={map.id} className="hover:border-primary transition-colors cursor-pointer" onClick={() => handleSelectMap(map)}>
              <CardHeader>
                {map.thumbnail ? (
                  <img src={`/uploads${map.thumbnail}`} className="w-full h-32 object-cover rounded" alt="" />
                ) : (
                  <div className="w-full h-32 bg-muted rounded flex items-center justify-center text-muted-foreground">No preview</div>
                )}
              </CardHeader>
              <CardContent><CardTitle className="text-lg">{map.name}</CardTitle></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Step: game
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Sandbox — Choose a Game</h1>
      <div className="flex items-center justify-center gap-2 mb-6 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg text-sm text-primary">
        <AlertTriangle className="h-4 w-4" />
        Sandbox Mode — Your drawings won't be saved. Log in to create persistent plans.
      </div>
      {gamesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gamesData?.data.map((game) => (
            <Card key={game.id} className="hover:border-primary transition-colors cursor-pointer" onClick={() => handleSelectGame(game)}>
              <CardHeader className="flex flex-row items-center gap-4">
                {game.icon ? (
                  <img src={`/uploads${game.icon}`} className="h-16 w-16 rounded-lg" alt="" />
                ) : (
                  <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                    <Gamepad2 className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <CardTitle className="text-xl">{game.name}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

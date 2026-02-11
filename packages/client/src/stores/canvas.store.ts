import { create } from 'zustand';
import { Tool, DEFAULT_COLOR, DEFAULT_LINE_WIDTH, DEFAULT_FONT_SIZE, ZOOM_MIN, ZOOM_MAX } from '@tactihub/shared';

interface DrawHistoryEntry {
  id: string;
  floorId: string;
  payload: any;
}

interface CanvasStoreState {
  // Drawing tools
  tool: Tool;
  color: string;
  lineWidth: number;
  fontSize: number;
  selectedIcon: { type: 'operator' | 'gadget'; id: string; url: string } | null;
  setTool: (tool: Tool) => void;
  setColor: (color: string) => void;
  setLineWidth: (width: number) => void;
  setFontSize: (size: number) => void;
  setSelectedIcon: (icon: { type: 'operator' | 'gadget'; id: string; url: string } | null) => void;

  // Viewport (zoom + pan)
  offsetX: number;
  offsetY: number;
  scale: number;
  zoomTo: (newScale: number, pivotX: number, pivotY: number) => void;
  panBy: (dx: number, dy: number) => void;
  resetViewport: () => void;

  // Undo/Redo history
  myDrawHistory: DrawHistoryEntry[];
  undoStack: DrawHistoryEntry[];
  pushMyDraw: (entry: DrawHistoryEntry) => void;
  popUndo: () => DrawHistoryEntry | null;
  popRedo: () => DrawHistoryEntry | null;
  clearHistory: () => void;
}

export const useCanvasStore = create<CanvasStoreState>((set, get) => ({
  // Drawing tools
  tool: Tool.Pen,
  color: DEFAULT_COLOR,
  lineWidth: DEFAULT_LINE_WIDTH,
  fontSize: DEFAULT_FONT_SIZE,
  selectedIcon: null,
  setTool: (tool) => set({ tool }),
  setColor: (color) => set({ color }),
  setLineWidth: (lineWidth) => set({ lineWidth }),
  setFontSize: (fontSize) => set({ fontSize }),
  setSelectedIcon: (selectedIcon) => set({ selectedIcon }),

  // Viewport
  offsetX: 0,
  offsetY: 0,
  scale: 1,
  zoomTo: (newScale, pivotX, pivotY) => {
    const s = get();
    const clamped = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, newScale));
    const ratio = clamped / s.scale;
    set({
      scale: clamped,
      offsetX: pivotX - (pivotX - s.offsetX) * ratio,
      offsetY: pivotY - (pivotY - s.offsetY) * ratio,
    });
  },
  panBy: (dx, dy) => set((s) => ({ offsetX: s.offsetX + dx, offsetY: s.offsetY + dy })),
  resetViewport: () => set({ offsetX: 0, offsetY: 0, scale: 1 }),

  // Undo/Redo
  myDrawHistory: [],
  undoStack: [],
  pushMyDraw: (entry) => set((s) => ({
    myDrawHistory: [...s.myDrawHistory, entry],
    undoStack: [],
  })),
  popUndo: () => {
    const s = get();
    if (s.myDrawHistory.length === 0) return null;
    const entry = s.myDrawHistory[s.myDrawHistory.length - 1]!;
    set({
      myDrawHistory: s.myDrawHistory.slice(0, -1),
      undoStack: [...s.undoStack, entry],
    });
    return entry;
  },
  popRedo: () => {
    const s = get();
    if (s.undoStack.length === 0) return null;
    const entry = s.undoStack[s.undoStack.length - 1]!;
    set({
      undoStack: s.undoStack.slice(0, -1),
      myDrawHistory: [...s.myDrawHistory, entry],
    });
    return entry;
  },
  clearHistory: () => set({ myDrawHistory: [], undoStack: [] }),
}));

import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useStratStore } from '@/stores/strat.store';
import { mapLayers, objectiveLayerCodes, structuralLayerCodes, tacticalLayerCodes } from '@/data/mainData';

interface LayerTogglePanelProps {
  compact?: boolean;
}

interface LayerGroupProps {
  label: string;
  codes: readonly string[];
  defaultOpen?: boolean;
}

function LayerGroup({ label, codes, defaultOpen = true }: LayerGroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  const { svgLayerVisibility, setSvgLayerVisibility } = useStratStore();

  const layers = mapLayers.filter((l) => codes.includes(l.short));
  const allChecked = layers.every((l) => svgLayerVisibility[l.short]);
  const noneChecked = layers.every((l) => !svgLayerVisibility[l.short]);

  const toggleAll = () => {
    const newVal = !allChecked;
    for (const layer of layers) {
      setSvgLayerVisibility(layer.short, newVal);
    }
  };

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 w-full text-[10px] text-muted-foreground uppercase tracking-wider py-0.5 hover:text-foreground transition-colors"
      >
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        <span className="flex-1 text-left">{label}</span>
        <input
          type="checkbox"
          checked={allChecked}
          ref={(el) => { if (el) el.indeterminate = !allChecked && !noneChecked; }}
          onChange={toggleAll}
          onClick={(e) => e.stopPropagation()}
          className="w-3 h-3 accent-primary cursor-pointer"
        />
      </button>
      {open && (
        <div className="pl-4 space-y-0.5">
          {layers.map((layer) => (
            <label
              key={layer.short}
              className="flex items-center gap-1.5 cursor-pointer py-0.5 text-xs hover:text-foreground transition-colors"
            >
              <input
                type="checkbox"
                checked={svgLayerVisibility[layer.short] ?? layer.default}
                onChange={(e) => setSvgLayerVisibility(layer.short, e.target.checked)}
                className="w-3 h-3 accent-primary cursor-pointer"
              />
              <span className={svgLayerVisibility[layer.short] ? 'text-foreground' : 'text-muted-foreground'}>
                {layer.full}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LayerTogglePanel({ compact }: LayerTogglePanelProps) {
  const [open, setOpen] = useState(!compact);
  const { resetSvgLayerVisibility } = useStratStore();

  // Extra layers not in the main groups (cmp = compass, lg = legend)
  const miscCodes = ['cmp', 'lg'] as const;

  return (
    <div className="bg-card border border-border rounded-lg shadow-lg">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-2.5 py-1.5 text-xs font-medium"
      >
        <span>Layers</span>
        {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>
      {open && (
        <div className="px-2.5 pb-2 space-y-1.5">
          <LayerGroup label="Objectives" codes={objectiveLayerCodes} />
          <LayerGroup label="Structural" codes={structuralLayerCodes} />
          <LayerGroup label="Tactical" codes={tacticalLayerCodes} />
          <LayerGroup label="Other" codes={miscCodes} defaultOpen={false} />

          <button
            onClick={resetSvgLayerVisibility}
            className="w-full text-[10px] text-muted-foreground hover:text-foreground py-0.5 transition-colors"
          >
            Reset defaults
          </button>
        </div>
      )}
    </div>
  );
}

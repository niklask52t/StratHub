import { useState } from 'react';
import { Eye, EyeOff, X, Palette } from 'lucide-react';
import { getStratAvatarUrl } from '@/data/stratData';
import { useStratStore } from '@/stores/strat.store';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import LoadoutPanel from './LoadoutPanel';
import type { StratOperatorSlot } from '@tactihub/shared';

interface OperatorSlotCardProps {
  slot: StratOperatorSlot;
  onSlotClick: () => void;
  onClearOperator: () => void;
  onVisibilityToggle: (visible: boolean) => void;
  onColorChange: (color: string) => void;
  onLoadoutChange: (slotId: string, field: string, value: string | null) => void;
  readOnly?: boolean;
}

export default function OperatorSlotCard({
  slot,
  onSlotClick,
  onClearOperator,
  onVisibilityToggle,
  onColorChange,
  onLoadoutChange,
  readOnly,
}: OperatorSlotCardProps) {
  const { activeOperatorSlotId, setActiveOperatorSlotId } = useStratStore();
  const [showLoadout, setShowLoadout] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const isActive = activeOperatorSlotId === slot.id;

  const handleSelectForDrawing = () => {
    setActiveOperatorSlotId(isActive ? null : slot.id);
  };

  return (
    <div className="relative group">
      <div
        className={`flex items-center gap-1.5 p-1.5 rounded-lg transition-all cursor-pointer border ${
          isActive
            ? 'border-primary bg-primary/10 shadow-[0_0_8px_oklch(0.68_0.19_45/0.3)]'
            : 'border-transparent hover:bg-secondary/50'
        }`}
        onClick={handleSelectForDrawing}
      >
        {/* Color indicator */}
        <div
          className="w-1 h-10 rounded-full shrink-0"
          style={{ backgroundColor: slot.color }}
        />

        {/* Avatar or empty slot */}
        {slot.operatorName ? (
          <div
            className="w-9 h-9 rounded-full overflow-hidden border-2 shrink-0"
            style={{ borderColor: slot.color }}
            onClick={(e) => {
              e.stopPropagation();
              if (!readOnly) setShowLoadout(!showLoadout);
            }}
          >
            <img
              src={getStratAvatarUrl(slot.operatorName)}
              alt={slot.operatorName}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!readOnly) onSlotClick();
            }}
            className="w-9 h-9 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground/50 hover:border-muted-foreground/60 hover:text-muted-foreground/80 transition-colors shrink-0"
          >
            <span className="text-sm">+</span>
          </button>
        )}

        {/* Name + loadout preview */}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium truncate">
            {slot.operatorName || `Slot ${slot.slotNumber}`}
          </div>
          {slot.operatorName && (slot.primaryWeapon || slot.primaryEquipment) && (
            <div className="text-[10px] text-muted-foreground truncate">
              {[slot.primaryWeapon, slot.primaryEquipment].filter(Boolean).join(' / ')}
            </div>
          )}
        </div>

        {/* Actions */}
        {!readOnly && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            {/* Color picker */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowColorPicker(!showColorPicker);
                  }}
                  className="p-0.5 rounded text-muted-foreground hover:text-foreground"
                >
                  <Palette className="w-3 h-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left"><p>Color</p></TooltipContent>
            </Tooltip>

            {/* Visibility toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onVisibilityToggle(!slot.visible);
                  }}
                  className="p-0.5 rounded text-muted-foreground hover:text-foreground"
                >
                  {slot.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="left"><p>{slot.visible ? 'Hide draws' : 'Show draws'}</p></TooltipContent>
            </Tooltip>

            {/* Clear operator */}
            {slot.operatorName && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClearOperator();
                    }}
                    className="p-0.5 rounded text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left"><p>Remove operator</p></TooltipContent>
              </Tooltip>
            )}
          </div>
        )}
      </div>

      {/* Color picker dropdown */}
      {showColorPicker && (
        <div
          className="absolute z-30 top-full mt-1 left-0 bg-card border border-border rounded-lg shadow-xl p-2"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="color"
            value={slot.color}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-8 h-8 cursor-pointer border-0 p-0 bg-transparent"
          />
          <button
            onClick={() => setShowColorPicker(false)}
            className="ml-1 text-xs text-muted-foreground hover:text-foreground"
          >
            Done
          </button>
        </div>
      )}

      {/* Loadout panel */}
      {showLoadout && slot.operatorName && (
        <LoadoutPanel
          slot={slot}
          onLoadoutChange={onLoadoutChange}
          onClose={() => setShowLoadout(false)}
        />
      )}
    </div>
  );
}

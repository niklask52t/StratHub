import { useState } from 'react';
import { X } from 'lucide-react';
import { useStratStore } from '@/stores/strat.store';
import { getStratAvatarUrl, attackers, defenders } from '@/data/stratData';
import StratConfigBar from './StratConfigBar';
import type { StratSide, StratMode, StratSite } from '@tactihub/shared';

interface BanBarProps {
  onBanUpdate?: (operatorName: string, side: 'attacker' | 'defender', slotIndex: number) => void;
  onBanRemove?: (banId: string) => void;
  onConfigChange?: (config: { side?: StratSide; mode?: StratMode; site?: StratSite }) => void;
  readOnly?: boolean;
}

interface BanSlotProps {
  side: 'attacker' | 'defender';
  slotIndex: number;
  onBanUpdate?: (operatorName: string, side: 'attacker' | 'defender', slotIndex: number) => void;
  onBanRemove?: (banId: string) => void;
  readOnly?: boolean;
}

function BanSlot({ side, slotIndex, onBanUpdate, onBanRemove, readOnly }: BanSlotProps) {
  const { bans, getBannedOperatorNames } = useStratStore();
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState('');

  const ban = bans.find((b) => b.side === side && b.slotIndex === slotIndex);
  const bannedNames = getBannedOperatorNames();
  const operators = side === 'attacker' ? attackers : defenders;

  const filtered = operators.filter((op) => {
    if (search && !op.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (bannedNames.has(op.name) && ban?.operatorName !== op.name) return false;
    return true;
  });

  return (
    <div className="relative">
      {ban ? (
        <div className="group flex items-center gap-1 px-1.5 py-0.5 rounded bg-destructive/10 border border-destructive/30">
          <div className="w-6 h-6 rounded-full overflow-hidden">
            <img
              src={getStratAvatarUrl(ban.operatorName)}
              alt={ban.operatorName}
              className="w-full h-full object-cover grayscale"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
          <span className="text-[10px] text-destructive line-through">{ban.operatorName}</span>
          {!readOnly && (
            <button
              onClick={() => onBanRemove?.(ban.id)}
              className="opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground hover:text-destructive transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={() => !readOnly && setShowPicker(true)}
          disabled={readOnly}
          className="flex items-center gap-1 px-2 py-1 rounded border border-dashed border-muted-foreground/30 text-[10px] text-muted-foreground/50 hover:border-muted-foreground/50 transition-colors"
        >
          Ban {slotIndex + 1}
        </button>
      )}

      {/* Inline ban picker */}
      {showPicker && (
        <div
          className="absolute z-40 top-full mt-1 bg-card border border-border rounded-lg shadow-xl w-48 max-h-48"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-1.5 border-b border-border">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full h-6 px-2 text-xs bg-secondary border border-border rounded"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto max-h-32 p-1">
            {filtered.map((op) => (
              <button
                key={op.name}
                onClick={() => {
                  onBanUpdate?.(op.name, side, slotIndex);
                  setShowPicker(false);
                  setSearch('');
                }}
                className="flex items-center gap-1.5 w-full px-1.5 py-1 rounded text-xs hover:bg-secondary transition-colors"
              >
                <div className="w-5 h-5 rounded-full overflow-hidden">
                  <img
                    src={getStratAvatarUrl(op.name)}
                    alt={op.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
                {op.name}
              </button>
            ))}
          </div>
          <div className="p-1 border-t border-border">
            <button
              onClick={() => { setShowPicker(false); setSearch(''); }}
              className="w-full text-xs text-muted-foreground hover:text-foreground py-0.5"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BanBar({ onBanUpdate, onBanRemove, onConfigChange, readOnly }: BanBarProps) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-background/80">
      {/* ATK bans (left) */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">ATK Ban</span>
        <BanSlot side="attacker" slotIndex={0} onBanUpdate={onBanUpdate} onBanRemove={onBanRemove} readOnly={readOnly} />
        <BanSlot side="attacker" slotIndex={1} onBanUpdate={onBanUpdate} onBanRemove={onBanRemove} readOnly={readOnly} />
      </div>

      {/* Config center */}
      <StratConfigBar onConfigChange={onConfigChange} readOnly={readOnly} />

      {/* DEF bans (right) */}
      <div className="flex items-center gap-1.5">
        <BanSlot side="defender" slotIndex={0} onBanUpdate={onBanUpdate} onBanRemove={onBanRemove} readOnly={readOnly} />
        <BanSlot side="defender" slotIndex={1} onBanUpdate={onBanUpdate} onBanRemove={onBanRemove} readOnly={readOnly} />
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">DEF Ban</span>
      </div>
    </div>
  );
}

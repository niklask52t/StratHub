import { useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import { attackers, defenders, getStratAvatarUrl } from '@/data/stratData';
import type { OperatorLoadout } from '@/data/stratData';
import { useStratStore } from '@/stores/strat.store';

interface OperatorPickerModalProps {
  side: 'attacker' | 'defender';
  onSelect: (operatorName: string) => void;
  onClose: () => void;
}

export default function OperatorPickerModal({ side, onSelect, onClose }: OperatorPickerModalProps) {
  const [search, setSearch] = useState('');
  const { operatorSlots, getBannedOperatorNames } = useStratStore();
  const bannedNames = getBannedOperatorNames();

  const operators: OperatorLoadout[] = side === 'attacker' ? attackers : defenders;

  // Already picked operators on this side
  const pickedNames = useMemo(() => {
    const names = new Set<string>();
    for (const slot of operatorSlots) {
      if (slot.side === side && slot.operatorName) {
        names.add(slot.operatorName);
      }
    }
    return names;
  }, [operatorSlots, side]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return operators.filter((op) => {
      if (!q) return true;
      return op.name.toLowerCase().includes(q);
    });
  }, [operators, search]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-lg shadow-xl w-[480px] max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-medium">
            Select {side === 'attacker' ? 'Attacker' : 'Defender'}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-2 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search operators..."
              className="w-full h-7 pl-7 pr-2 text-xs bg-secondary border border-border rounded"
              autoFocus
            />
          </div>
        </div>

        {/* Operator Grid */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-6 gap-2">
            {filtered.map((op) => {
              const isPicked = pickedNames.has(op.name);
              const isBanned = bannedNames.has(op.name);
              const disabled = isPicked || isBanned;

              return (
                <button
                  key={op.name}
                  onClick={() => !disabled && onSelect(op.name)}
                  disabled={disabled}
                  className={`flex flex-col items-center gap-1 p-1.5 rounded transition-colors ${
                    disabled
                      ? 'opacity-30 cursor-not-allowed'
                      : 'hover:bg-secondary cursor-pointer'
                  }`}
                >
                  <div
                    className="w-12 h-12 rounded-full overflow-hidden border-2"
                    style={{ borderColor: op.color }}
                  >
                    <img
                      src={getStratAvatarUrl(op.name)}
                      alt={op.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-center leading-tight truncate w-full">
                    {op.name}
                  </span>
                  {isBanned && (
                    <span className="text-[8px] text-destructive font-medium">BANNED</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

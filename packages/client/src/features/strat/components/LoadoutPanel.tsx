import { useMemo } from 'react';
import { X } from 'lucide-react';
import { attackers, defenders, getWeaponUrl, getEquipmentUrl } from '@/data/stratData';
import type { OperatorLoadout } from '@/data/stratData';
import type { StratOperatorSlot } from '@tactihub/shared';

interface LoadoutPanelProps {
  slot: StratOperatorSlot;
  onLoadoutChange: (slotId: string, field: string, value: string | null) => void;
  onClose: () => void;
}

function ItemButton({
  name,
  imgUrl,
  selected,
  onClick,
}: {
  name: string;
  imgUrl: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 p-1 rounded transition-colors ${
        selected
          ? 'bg-primary/20 ring-1 ring-primary'
          : 'hover:bg-secondary'
      }`}
      title={name}
    >
      <div className="w-8 h-8 flex items-center justify-center">
        <img
          src={imgUrl}
          alt={name}
          className="max-w-full max-h-full object-contain"
          onError={(e) => {
            const el = e.target as HTMLImageElement;
            el.style.display = 'none';
            el.parentElement!.innerHTML = `<span class="text-[8px] text-muted-foreground text-center">${name}</span>`;
          }}
        />
      </div>
      <span className="text-[9px] text-center leading-tight truncate w-full">{name}</span>
    </button>
  );
}

export default function LoadoutPanel({ slot, onLoadoutChange, onClose }: LoadoutPanelProps) {
  const opData: OperatorLoadout | undefined = useMemo(() => {
    if (!slot.operatorName) return undefined;
    const all = [...attackers, ...defenders];
    return all.find((op) => op.name === slot.operatorName);
  }, [slot.operatorName]);

  if (!opData) return null;

  const sections: { label: string; field: string; items: string[]; getUrl: (name: string) => string; selected: string | null }[] = [
    { label: 'Primary', field: 'primaryWeapon', items: opData.primaryWeapons, getUrl: getWeaponUrl, selected: slot.primaryWeapon },
    { label: 'Secondary', field: 'secondaryWeapon', items: opData.secondaryWeapons, getUrl: getWeaponUrl, selected: slot.secondaryWeapon },
    { label: 'Equipment 1', field: 'primaryEquipment', items: opData.primaryEquipments, getUrl: getEquipmentUrl, selected: slot.primaryEquipment },
    { label: 'Equipment 2', field: 'secondaryEquipment', items: opData.secondaryEquipments, getUrl: getEquipmentUrl, selected: slot.secondaryEquipment },
  ];

  return (
    <div className="absolute z-20 top-0 left-full ml-2 w-56 bg-card border border-border rounded-lg shadow-xl">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-xs font-medium">{slot.operatorName} Loadout</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="p-2 space-y-2 max-h-72 overflow-y-auto">
        {sections.map((section) => {
          if (section.items.length === 0) return null;
          return (
            <div key={section.field}>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{section.label}</span>
              <div className="grid grid-cols-3 gap-1 mt-0.5">
                {section.items.map((item) => (
                  <ItemButton
                    key={item}
                    name={item}
                    imgUrl={section.getUrl(item)}
                    selected={section.selected === item}
                    onClick={() => {
                      const newVal = section.selected === item ? null : item;
                      onLoadoutChange(slot.id, section.field, newVal);
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

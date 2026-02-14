import { useState } from 'react';
import { useStratStore } from '@/stores/strat.store';
import OperatorSlotCard from './OperatorSlotCard';
import OperatorPickerModal from './OperatorPickerModal';
import type { StratOperatorSlot } from '@tactihub/shared';

interface OperatorColumnProps {
  side: 'attacker' | 'defender';
  onSlotUpdate: (slotId: string, data: Partial<StratOperatorSlot>) => void;
  onLoadoutChange: (slotId: string, field: string, value: string | null) => void;
  onVisibilityToggle: (slotId: string, visible: boolean) => void;
  onColorChange: (slotId: string, color: string) => void;
  readOnly?: boolean;
}

export default function OperatorColumn({
  side,
  onSlotUpdate,
  onLoadoutChange,
  onVisibilityToggle,
  onColorChange,
  readOnly,
}: OperatorColumnProps) {
  const { getAttackerSlots, getDefenderSlots } = useStratStore();
  const [pickerSlotId, setPickerSlotId] = useState<string | null>(null);

  const slots = side === 'attacker' ? getAttackerSlots() : getDefenderSlots();
  const label = side === 'attacker' ? 'ATK' : 'DEF';
  const labelColor = side === 'attacker' ? '#1487e1' : '#ff3232';

  const handleOperatorSelect = (operatorName: string) => {
    if (pickerSlotId) {
      onSlotUpdate(pickerSlotId, { operatorName });
      setPickerSlotId(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-2 py-1.5 border-b border-border">
        <span
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: labelColor }}
        >
          {label}
        </span>
      </div>

      {/* Slots */}
      <div className="flex-1 overflow-y-auto p-1 space-y-0.5">
        {slots.map((slot) => (
          <OperatorSlotCard
            key={slot.id}
            slot={slot}
            onSlotClick={() => setPickerSlotId(slot.id)}
            onClearOperator={() => onSlotUpdate(slot.id, { operatorName: null, operatorId: null })}
            onVisibilityToggle={(visible) => onVisibilityToggle(slot.id, visible)}
            onColorChange={(color) => onColorChange(slot.id, color)}
            onLoadoutChange={onLoadoutChange}
            readOnly={readOnly}
          />
        ))}
      </div>

      {/* Operator Picker Modal */}
      {pickerSlotId && (
        <OperatorPickerModal
          side={side}
          onSelect={handleOperatorSelect}
          onClose={() => setPickerSlotId(null)}
        />
      )}
    </div>
  );
}

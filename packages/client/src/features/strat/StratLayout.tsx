import type { ReactNode } from 'react';
import type { StratOperatorSlot, StratSide, StratMode, StratSite } from '@tactihub/shared';
import BanBar from './components/BanBar';
import OperatorColumn from './components/OperatorColumn';
import PhaseStrip from './components/PhaseStrip';

interface StratLayoutProps {
  children: ReactNode;
  onSlotUpdate: (slotId: string, data: Partial<StratOperatorSlot>) => void;
  onLoadoutChange: (slotId: string, field: string, value: string | null) => void;
  onVisibilityToggle: (slotId: string, visible: boolean) => void;
  onColorChange: (slotId: string, color: string) => void;
  onBanUpdate?: (operatorName: string, side: 'attacker' | 'defender', slotIndex: number) => void;
  onBanRemove?: (banId: string) => void;
  onConfigChange?: (config: { side?: StratSide; mode?: StratMode; site?: StratSite }) => void;
  onPhaseCreate?: (name: string) => void;
  onPhaseUpdate?: (phaseId: string, name: string) => void;
  onPhaseDelete?: (phaseId: string) => void;
  onPhaseSwitch?: (phaseId: string) => void;
  readOnly?: boolean;
}

export default function StratLayout({
  children,
  onSlotUpdate,
  onLoadoutChange,
  onVisibilityToggle,
  onColorChange,
  onBanUpdate,
  onBanRemove,
  onConfigChange,
  onPhaseCreate,
  onPhaseUpdate,
  onPhaseDelete,
  onPhaseSwitch,
  readOnly,
}: StratLayoutProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Ban bar + strat config */}
      <BanBar
        onBanUpdate={onBanUpdate}
        onBanRemove={onBanRemove}
        onConfigChange={onConfigChange}
        readOnly={readOnly}
      />

      {/* Main content area: ATK column | Canvas | DEF column */}
      <div className="flex-1 flex overflow-hidden">
        {/* ATK column (left) */}
        <div className="w-48 shrink-0 border-r border-border bg-background/50 overflow-hidden">
          <OperatorColumn
            side="attacker"
            onSlotUpdate={onSlotUpdate}
            onLoadoutChange={onLoadoutChange}
            onVisibilityToggle={onVisibilityToggle}
            onColorChange={onColorChange}
            readOnly={readOnly}
          />
        </div>

        {/* Canvas area (center) */}
        <div className="flex-1 overflow-hidden relative">
          {children}
        </div>

        {/* DEF column (right) */}
        <div className="w-48 shrink-0 border-l border-border bg-background/50 overflow-hidden">
          <OperatorColumn
            side="defender"
            onSlotUpdate={onSlotUpdate}
            onLoadoutChange={onLoadoutChange}
            onVisibilityToggle={onVisibilityToggle}
            onColorChange={onColorChange}
            readOnly={readOnly}
          />
        </div>
      </div>

      {/* Phase strip (bottom toolbar area) */}
      <div className="flex items-center justify-center px-3 py-1.5 border-t border-border bg-background/80">
        <PhaseStrip
          onPhaseCreate={onPhaseCreate}
          onPhaseUpdate={onPhaseUpdate}
          onPhaseDelete={onPhaseDelete}
          onPhaseSwitch={onPhaseSwitch}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
}

import { useStratStore } from '@/stores/strat.store';
import { sides, modes, sitesInfo } from '@/data/stratData';
import type { StratSide, StratMode, StratSite } from '@tactihub/shared';

interface StratConfigBarProps {
  onConfigChange?: (config: { side?: StratSide; mode?: StratMode; site?: StratSite }) => void;
  readOnly?: boolean;
}

export default function StratConfigBar({ onConfigChange, readOnly }: StratConfigBarProps) {
  const { stratConfig, setStratConfig } = useStratStore();

  const handleChange = (key: 'side' | 'mode' | 'site', value: string) => {
    const update = { [key]: value } as Partial<typeof stratConfig>;
    setStratConfig(update);
    onConfigChange?.(update);
  };

  return (
    <div className="flex items-center gap-3">
      {/* Side selector */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">Side</span>
        <div className="flex gap-0.5">
          {sides.map((s) => (
            <button
              key={s.name}
              disabled={readOnly}
              onClick={() => handleChange('side', s.name as StratSide)}
              className={`px-2 py-0.5 text-xs rounded transition-colors ${
                stratConfig.side === s.name
                  ? 'text-white font-medium'
                  : 'text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary'
              } ${readOnly ? 'cursor-default opacity-70' : 'cursor-pointer'}`}
              style={stratConfig.side === s.name ? { backgroundColor: s.color } : undefined}
            >
              {s.name === 'Attackers' ? 'ATK' : s.name === 'Defenders' ? 'DEF' : '?'}
            </button>
          ))}
        </div>
      </div>

      <div className="w-px h-5 bg-border" />

      {/* Mode selector */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">Mode</span>
        <div className="flex gap-0.5">
          {modes.map((m) => (
            <button
              key={m.name}
              disabled={readOnly}
              onClick={() => handleChange('mode', m.name as StratMode)}
              className={`px-2 py-0.5 text-xs rounded transition-colors ${
                stratConfig.mode === m.name
                  ? 'text-white font-medium'
                  : 'text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary'
              } ${readOnly ? 'cursor-default opacity-70' : 'cursor-pointer'}`}
              style={stratConfig.mode === m.name ? { backgroundColor: m.color } : undefined}
            >
              {m.name === 'Unknown' ? '?' : m.name}
            </button>
          ))}
        </div>
      </div>

      <div className="w-px h-5 bg-border" />

      {/* Site selector */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">Site</span>
        <div className="flex gap-0.5">
          {sitesInfo.map((s) => (
            <button
              key={s.name}
              disabled={readOnly}
              onClick={() => handleChange('site', s.name as StratSite)}
              className={`w-6 h-6 text-xs rounded transition-colors ${
                stratConfig.site === s.name
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary'
              } ${readOnly ? 'cursor-default opacity-70' : 'cursor-pointer'}`}
            >
              {s.name === 'Unknown' ? '?' : s.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { useStratStore } from '@/stores/strat.store';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { BattleplanPhase } from '@tactihub/shared';

interface PhaseStripProps {
  onPhaseCreate?: (name: string) => void;
  onPhaseUpdate?: (phaseId: string, name: string) => void;
  onPhaseDelete?: (phaseId: string) => void;
  onPhaseSwitch?: (phaseId: string) => void;
  readOnly?: boolean;
}

export default function PhaseStrip({
  onPhaseCreate,
  onPhaseUpdate,
  onPhaseDelete,
  onPhaseSwitch,
  readOnly,
}: PhaseStripProps) {
  const { phases, activePhaseId, setActivePhaseId } = useStratStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const handleSwitch = (phase: BattleplanPhase) => {
    setActivePhaseId(phase.id);
    onPhaseSwitch?.(phase.id);
  };

  const handleStartEdit = (phase: BattleplanPhase) => {
    setEditingId(phase.id);
    setEditName(phase.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editName.trim()) {
      onPhaseUpdate?.(editingId, editName.trim());
      setEditingId(null);
    }
  };

  const handleCreate = () => {
    if (newName.trim()) {
      onPhaseCreate?.(newName.trim());
      setNewName('');
      setIsCreating(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-muted-foreground uppercase tracking-wider mr-1">Phases</span>

      {phases
        .sort((a, b) => a.index - b.index)
        .map((phase) => (
          <div key={phase.id} className="flex items-center">
            {editingId === phase.id ? (
              <div className="flex items-center gap-0.5">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit();
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  className="h-6 w-24 px-1 text-xs bg-secondary border border-border rounded"
                  autoFocus
                />
                <button onClick={handleSaveEdit} className="p-0.5 text-green-400 hover:text-green-300">
                  <Check className="w-3 h-3" />
                </button>
                <button onClick={() => setEditingId(null)} className="p-0.5 text-muted-foreground hover:text-foreground">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="group flex items-center">
                <button
                  onClick={() => handleSwitch(phase)}
                  className={`px-2 py-0.5 text-xs rounded-l transition-colors ${
                    activePhaseId === phase.id
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  {phase.name}
                </button>
                {!readOnly && (
                  <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleStartEdit(phase)}
                          className="px-0.5 py-0.5 text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom"><p>Rename</p></TooltipContent>
                    </Tooltip>
                    {phases.length > 1 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => onPhaseDelete?.(phase.id)}
                            className="px-0.5 py-0.5 text-muted-foreground hover:text-destructive bg-secondary/50 hover:bg-secondary rounded-r"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom"><p>Delete</p></TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

      {!readOnly && (
        <>
          {isCreating ? (
            <div className="flex items-center gap-0.5">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                  if (e.key === 'Escape') { setIsCreating(false); setNewName(''); }
                }}
                placeholder="Phase name..."
                className="h-6 w-24 px-1 text-xs bg-secondary border border-border rounded"
                autoFocus
              />
              <button onClick={handleCreate} className="p-0.5 text-green-400 hover:text-green-300">
                <Check className="w-3 h-3" />
              </button>
              <button onClick={() => { setIsCreating(false); setNewName(''); }} className="p-0.5 text-muted-foreground hover:text-foreground">
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-6 h-6 flex items-center justify-center rounded bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom"><p>Add phase</p></TooltipContent>
            </Tooltip>
          )}
        </>
      )}
    </div>
  );
}

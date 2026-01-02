import { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  BLOCK_TEMPLATES,
  PRESET_TEMPLATES,
  BlockTemplate,
  PresetTemplate,
} from './block-templates';
import { useEditorStore } from './editor-context';

interface AddBlockMenuProps {
  parentId: string;
  index?: number;
  placeholder?: boolean;
}

export function AddBlockMenu({ parentId, index, placeholder }: AddBlockMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const addBlock = useEditorStore((s) => s.addBlock);

  const handleAddBlock = (template: BlockTemplate) => {
    const block = template.createBlock();
    addBlock(block, parentId, index);
    setIsOpen(false);
  };

  const handleAddPreset = (preset: PresetTemplate) => {
    const blocks = preset.createBlocks();
    let insertIndex = index;
    for (const block of blocks) {
      addBlock(block, parentId, insertIndex);
      if (insertIndex !== undefined) {
        insertIndex++;
      }
    }
    setIsOpen(false);
  };

  if (placeholder) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
        <p className="text-sm text-muted-foreground mb-4">No blocks yet</p>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Block
          </button>
          {isOpen && (
            <BlockPicker
              onSelect={handleAddBlock}
              onSelectPreset={handleAddPreset}
              onClose={() => setIsOpen(false)}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative group flex items-center justify-center h-0">
      <div className="absolute inset-x-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <div className="absolute inset-x-4 border-t border-dashed border-primary/40" />
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="relative flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
      {isOpen && (
        <div className="absolute top-6 z-20">
          <BlockPicker
            onSelect={handleAddBlock}
            onSelectPreset={handleAddPreset}
            onClose={() => setIsOpen(false)}
          />
        </div>
      )}
    </div>
  );
}

interface AddBlockMenuColumnProps {
  parentId: string;
  columnIndex: number;
  index?: number;
  placeholder?: boolean;
}

export function AddBlockMenuColumn({
  parentId,
  columnIndex,
  index,
  placeholder,
}: AddBlockMenuColumnProps) {
  const [isOpen, setIsOpen] = useState(false);
  const addBlockToColumn = useEditorStore((s) => s.addBlockToColumn);

  const handleAddBlock = (template: BlockTemplate) => {
    const block = template.createBlock();
    addBlockToColumn(block, parentId, columnIndex, index);
    setIsOpen(false);
  };

  const handleAddPreset = (preset: PresetTemplate) => {
    const blocks = preset.createBlocks();
    let insertIndex = index;
    for (const block of blocks) {
      addBlockToColumn(block, parentId, columnIndex, insertIndex);
      if (insertIndex !== undefined) {
        insertIndex++;
      }
    }
    setIsOpen(false);
  };

  if (placeholder) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="flex items-center gap-2 px-3 py-1.5 text-xs bg-muted text-muted-foreground rounded hover:bg-muted/80 transition-colors"
        >
          <Plus className="h-3 w-3" />
          Add
        </button>
        {isOpen && (
          <div className="absolute top-full mt-2 z-20">
            <BlockPicker
              onSelect={handleAddBlock}
              onSelectPreset={handleAddPreset}
              onClose={() => setIsOpen(false)}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative group flex items-center justify-center h-0">
      <div className="absolute inset-x-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <div className="absolute inset-x-2 border-t border-dashed border-primary/40" />
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="relative flex items-center justify-center w-5 h-5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="h-2.5 w-2.5" />
        </button>
      </div>
      {isOpen && (
        <div className="absolute top-5 z-20">
          <BlockPicker
            onSelect={handleAddBlock}
            onSelectPreset={handleAddPreset}
            onClose={() => setIsOpen(false)}
          />
        </div>
      )}
    </div>
  );
}

interface BlockPickerProps {
  onSelect: (template: BlockTemplate) => void;
  onSelectPreset?: (preset: PresetTemplate) => void;
  onClose: () => void;
}

function BlockPicker({ onSelect, onSelectPreset, onClose }: BlockPickerProps) {
  const [tab, setTab] = useState<'blocks' | 'presets'>('blocks');

  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="relative z-20 bg-popover border rounded-lg shadow-lg min-w-[320px]">
        <div className="flex border-b">
          <button
            onClick={() => setTab('blocks')}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              tab === 'blocks'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Blocks
          </button>
          <button
            onClick={() => setTab('presets')}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              tab === 'presets'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Presets
          </button>
        </div>
        <div className="p-2">
          {tab === 'blocks' ? (
            <div className="grid grid-cols-3 gap-1">
              {BLOCK_TEMPLATES.map((template) => (
                <button
                  key={template.type}
                  onClick={() => onSelect(template)}
                  className="flex flex-col items-center gap-1 p-3 rounded-md hover:bg-muted transition-colors text-center"
                >
                  <span className="text-lg font-mono">{template.icon}</span>
                  <span className="text-xs text-muted-foreground">{template.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {PRESET_TEMPLATES.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => onSelectPreset?.(preset)}
                  className="flex flex-col items-start gap-1 p-3 rounded-md hover:bg-muted transition-colors text-left border"
                >
                  <span className="text-lg">{preset.icon}</span>
                  <span className="text-sm font-medium">{preset.label}</span>
                  <span className="text-xs text-muted-foreground">{preset.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

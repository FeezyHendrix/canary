import { ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, ChevronUp, ChevronDown, GripVertical, Copy } from 'lucide-react';
import { useEditorStore } from './editor-context';
import { cn } from '@/lib/utils';
import { PaddingResizeHandles } from './padding-resize-handles';

interface BlockWrapperProps {
  blockId: string;
  parentId: string;
  children: ReactNode;
}

export function BlockWrapper({ blockId, parentId, children }: BlockWrapperProps) {
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const setSelectedBlockId = useEditorStore((s) => s.setSelectedBlockId);
  const deleteBlock = useEditorStore((s) => s.deleteBlock);
  const moveBlockUp = useEditorStore((s) => s.moveBlockUp);
  const moveBlockDown = useEditorStore((s) => s.moveBlockDown);
  const duplicateBlock = useEditorStore((s) => s.duplicateBlock);

  const isSelected = selectedBlockId === blockId;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBlockId(blockId);
  };

  return (
    <div
      className={cn(
        'relative group cursor-pointer transition-all',
        isSelected
          ? 'ring-2 ring-primary ring-offset-2'
          : 'hover:ring-2 hover:ring-primary/30 hover:ring-offset-1'
      )}
      onClick={handleClick}
    >
      {children}

      {isSelected && (
        <>
          <PaddingResizeHandles blockId={blockId} />
          <BlockToolbar
            blockId={blockId}
            parentId={parentId}
            onMoveUp={() => moveBlockUp(blockId, parentId)}
            onMoveDown={() => moveBlockDown(blockId, parentId)}
            onDuplicate={() => duplicateBlock(blockId)}
            onDelete={() => deleteBlock(blockId)}
          />
        </>
      )}
    </div>
  );
}

interface SortableBlockWrapperProps {
  blockId: string;
  parentId: string;
  index: number;
  columnIndex?: number;
  children: ReactNode;
}

export function SortableBlockWrapper({
  blockId,
  parentId,
  index,
  columnIndex,
  children,
}: SortableBlockWrapperProps) {
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const setSelectedBlockId = useEditorStore((s) => s.setSelectedBlockId);
  const deleteBlock = useEditorStore((s) => s.deleteBlock);
  const moveBlockUp = useEditorStore((s) => s.moveBlockUp);
  const moveBlockDown = useEditorStore((s) => s.moveBlockDown);
  const duplicateBlock = useEditorStore((s) => s.duplicateBlock);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: blockId,
    data: {
      parentId,
      index,
      columnIndex,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isSelected = selectedBlockId === blockId;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBlockId(blockId);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group cursor-pointer transition-all',
        isSelected
          ? 'ring-2 ring-primary ring-offset-2'
          : 'hover:ring-2 hover:ring-primary/30 hover:ring-offset-1',
        isDragging && 'z-50'
      )}
      onClick={handleClick}
    >
      {children}

      {isSelected && (
        <>
          <PaddingResizeHandles blockId={blockId} />
          <BlockToolbar
            blockId={blockId}
            parentId={parentId}
            onMoveUp={() => moveBlockUp(blockId, parentId)}
            onMoveDown={() => moveBlockDown(blockId, parentId)}
            onDuplicate={() => duplicateBlock(blockId)}
            onDelete={() => deleteBlock(blockId)}
            dragHandleProps={{ ...attributes, ...listeners }}
          />
        </>
      )}

      {!isSelected && (
        <div
          className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10"
          {...attributes}
          {...listeners}
        >
          <div className="p-1 bg-muted/80 rounded">
            <GripVertical className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>
      )}
    </div>
  );
}

interface BlockToolbarProps {
  blockId: string;
  parentId: string;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  dragHandleProps?: Record<string, unknown>;
}

function BlockToolbar({
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  dragHandleProps,
}: BlockToolbarProps) {
  return (
    <div className="absolute -top-8 right-0 flex items-center gap-0.5 bg-primary text-primary-foreground rounded-md shadow-lg p-0.5 z-20">
      {dragHandleProps && (
        <button
          className="p-1.5 hover:bg-white/20 rounded transition-colors cursor-grab active:cursor-grabbing"
          title="Drag to reorder"
          {...dragHandleProps}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onMoveUp();
        }}
        className="p-1.5 hover:bg-white/20 rounded transition-colors"
        title="Move up"
      >
        <ChevronUp className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onMoveDown();
        }}
        className="p-1.5 hover:bg-white/20 rounded transition-colors"
        title="Move down"
      >
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDuplicate();
        }}
        className="p-1.5 hover:bg-white/20 rounded transition-colors"
        title="Duplicate"
      >
        <Copy className="h-3.5 w-3.5" />
      </button>
      <div className="w-px h-4 bg-white/30" />
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="p-1.5 hover:bg-red-500 rounded transition-colors"
        title="Delete"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

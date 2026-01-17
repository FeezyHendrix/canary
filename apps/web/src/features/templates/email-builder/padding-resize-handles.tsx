import { useState, useCallback, useEffect } from 'react';
import { useEditorStore } from './editor-context';

interface PaddingResizeHandlesProps {
  blockId: string;
}

type ResizeDirection = 'top' | 'bottom' | 'left' | 'right';

interface DragState {
  direction: ResizeDirection;
  startY: number;
  startX: number;
  startPadding: number;
}

export function PaddingResizeHandles({ blockId }: PaddingResizeHandlesProps) {
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const document = useEditorStore((s) => s.document);
  const block = document[blockId];

  const [dragState, setDragState] = useState<DragState | null>(null);
  const [currentPadding, setCurrentPadding] = useState<number | null>(null);

  const style = (block?.data?.style || {}) as Record<string, unknown>;
  const padding = (style.padding || { top: 0, bottom: 0, left: 0, right: 0 }) as {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };

  const handleMouseDown = useCallback(
    (direction: ResizeDirection) => (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const startPadding = padding[direction];
      setDragState({
        direction,
        startY: e.clientY,
        startX: e.clientX,
        startPadding,
      });
      setCurrentPadding(startPadding);
    },
    [padding]
  );

  useEffect(() => {
    if (!dragState) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { direction, startY, startX, startPadding } = dragState;

      let delta: number;
      if (direction === 'top') {
        delta = startY - e.clientY; // Dragging up increases top padding
      } else if (direction === 'bottom') {
        delta = e.clientY - startY; // Dragging down increases bottom padding
      } else if (direction === 'left') {
        delta = startX - e.clientX; // Dragging left increases left padding
      } else {
        delta = e.clientX - startX; // Dragging right increases right padding
      }

      const newPaddingValue = Math.max(0, Math.round(startPadding + delta));
      setCurrentPadding(newPaddingValue);

      // Get current block data to ensure we have latest state
      const currentBlock = document[blockId];
      if (!currentBlock) return;

      const currentStyle = (currentBlock.data.style || {}) as Record<string, unknown>;
      const currentPaddingObj = (currentStyle.padding || { top: 0, bottom: 0, left: 0, right: 0 }) as {
        top: number;
        bottom: number;
        left: number;
        right: number;
      };

      // Update in real-time for immediate feedback - deep merge the style object
      updateBlock(blockId, {
        style: {
          ...currentStyle,
          padding: { ...currentPaddingObj, [direction]: newPaddingValue },
        },
      });
    };

    const handleMouseUp = () => {
      setDragState(null);
      setCurrentPadding(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, blockId, document, updateBlock]);

  // Don't show for Spacer blocks (they use height instead)
  if (block?.type === 'Spacer') return null;

  const isVerticalDrag = dragState?.direction === 'top' || dragState?.direction === 'bottom';

  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      {/* Padding visualization overlay when dragging */}
      {dragState && (
        <div className="absolute inset-0">
          {/* Top padding area */}
          <div
            className="absolute top-0 left-0 right-0 bg-blue-500/20 border-b border-blue-500/50"
            style={{ height: padding.top }}
          />
          {/* Bottom padding area */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-blue-500/20 border-t border-blue-500/50"
            style={{ height: padding.bottom }}
          />
          {/* Left padding area */}
          <div
            className="absolute top-0 left-0 bottom-0 bg-blue-500/20 border-r border-blue-500/50"
            style={{ width: padding.left, top: padding.top, bottom: padding.bottom }}
          />
          {/* Right padding area */}
          <div
            className="absolute top-0 right-0 bottom-0 bg-blue-500/20 border-l border-blue-500/50"
            style={{ width: padding.right, top: padding.top, bottom: padding.bottom }}
          />
        </div>
      )}

      {/* Top handle - positioned outside block bounds to avoid overlap with add-block menu */}
      <div
        className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-auto cursor-ns-resize group z-30"
        onMouseDown={handleMouseDown('top')}
      >
        <div
          className={`w-16 h-3 rounded-full transition-all shadow-sm ${
            dragState?.direction === 'top'
              ? 'bg-blue-500 scale-110'
              : 'bg-blue-500/80 hover:bg-blue-500 hover:scale-110'
          }`}
        />
        {(dragState?.direction === 'top' || (!dragState && padding.top > 0)) && (
          <div
            className={`absolute -top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 text-[10px] font-medium rounded whitespace-nowrap ${
              dragState?.direction === 'top'
                ? 'bg-blue-500 text-white'
                : 'bg-muted text-muted-foreground opacity-0 group-hover:opacity-100'
            }`}
          >
            {dragState?.direction === 'top' ? currentPadding : padding.top}px
          </div>
        )}
      </div>

      {/* Bottom handle - positioned outside block bounds */}
      <div
        className="absolute -bottom-3 left-1/2 -translate-x-1/2 pointer-events-auto cursor-ns-resize group z-30"
        onMouseDown={handleMouseDown('bottom')}
      >
        <div
          className={`w-16 h-3 rounded-full transition-all shadow-sm ${
            dragState?.direction === 'bottom'
              ? 'bg-blue-500 scale-110'
              : 'bg-blue-500/80 hover:bg-blue-500 hover:scale-110'
          }`}
        />
        {(dragState?.direction === 'bottom' || (!dragState && padding.bottom > 0)) && (
          <div
            className={`absolute -bottom-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 text-[10px] font-medium rounded whitespace-nowrap ${
              dragState?.direction === 'bottom'
                ? 'bg-blue-500 text-white'
                : 'bg-muted text-muted-foreground opacity-0 group-hover:opacity-100'
            }`}
          >
            {dragState?.direction === 'bottom' ? currentPadding : padding.bottom}px
          </div>
        )}
      </div>

      {/* Left handle */}
      <div
        className="absolute top-1/2 -left-3 -translate-y-1/2 pointer-events-auto cursor-ew-resize group z-30"
        onMouseDown={handleMouseDown('left')}
      >
        <div
          className={`w-3 h-16 rounded-full transition-all shadow-sm ${
            dragState?.direction === 'left'
              ? 'bg-blue-500 scale-110'
              : 'bg-blue-500/80 hover:bg-blue-500 hover:scale-110'
          }`}
        />
        {(dragState?.direction === 'left' || (!dragState && padding.left > 0)) && (
          <div
            className={`absolute top-1/2 -translate-y-1/2 -left-8 px-1.5 py-0.5 text-[10px] font-medium rounded whitespace-nowrap ${
              dragState?.direction === 'left'
                ? 'bg-blue-500 text-white'
                : 'bg-muted text-muted-foreground opacity-0 group-hover:opacity-100'
            }`}
          >
            {dragState?.direction === 'left' ? currentPadding : padding.left}px
          </div>
        )}
      </div>

      {/* Right handle */}
      <div
        className="absolute top-1/2 -right-3 -translate-y-1/2 pointer-events-auto cursor-ew-resize group z-30"
        onMouseDown={handleMouseDown('right')}
      >
        <div
          className={`w-3 h-16 rounded-full transition-all shadow-sm ${
            dragState?.direction === 'right'
              ? 'bg-blue-500 scale-110'
              : 'bg-blue-500/80 hover:bg-blue-500 hover:scale-110'
          }`}
        />
        {(dragState?.direction === 'right' || (!dragState && padding.right > 0)) && (
          <div
            className={`absolute top-1/2 -translate-y-1/2 -right-8 px-1.5 py-0.5 text-[10px] font-medium rounded whitespace-nowrap ${
              dragState?.direction === 'right'
                ? 'bg-blue-500 text-white'
                : 'bg-muted text-muted-foreground opacity-0 group-hover:opacity-100'
            }`}
          >
            {dragState?.direction === 'right' ? currentPadding : padding.right}px
          </div>
        )}
      </div>

      {/* Global cursor style when dragging */}
      {dragState && (
        <style>{`
          body {
            cursor: ${isVerticalDrag ? 'ns-resize' : 'ew-resize'} !important;
            user-select: none !important;
          }
        `}</style>
      )}
    </div>
  );
}

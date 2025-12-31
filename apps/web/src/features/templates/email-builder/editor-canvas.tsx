import { Fragment } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Reader } from '@usewaypoint/email-builder';
import { useEditorStore, EditorDocument } from './editor-context';
import { AddBlockMenu, AddBlockMenuColumn } from './add-block-menu';
import { SortableBlockWrapper } from './block-wrapper';
import { useState } from 'react';

interface EditorCanvasProps {
  screenSize: 'desktop' | 'mobile';
}

export function EditorCanvas({ screenSize }: EditorCanvasProps) {
  const document = useEditorStore((s) => s.document);
  const setSelectedBlockId = useEditorStore((s) => s.setSelectedBlockId);
  const moveBlock = useEditorStore((s) => s.moveBlock);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const rootBlock = document.root;
  const childrenIds = (rootBlock?.data?.childrenIds as string[]) || [];

  const rootStyles = rootBlock?.data as {
    backdropColor?: string;
    canvasColor?: string;
    textColor?: string;
    fontFamily?: string;
  };

  const getFontFamily = (fontFamily?: string) => {
    const fonts: Record<string, string> = {
      MODERN_SANS: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      BOOK_SANS: 'Georgia, "Times New Roman", Times, serif',
      ORGANIC_SANS: '"Segoe UI", Roboto, "Helvetica Neue", sans-serif',
      GEOMETRIC_SANS: 'Futura, "Trebuchet MS", Arial, sans-serif',
      HEAVY_SANS: 'Impact, Haettenschweiler, "Franklin Gothic Bold", sans-serif',
      ROUNDED_SANS: '"Comic Sans MS", cursive, sans-serif',
      MODERN_SERIF: 'Cambria, Georgia, Times, "Times New Roman", serif',
      BOOK_SERIF: '"Palatino Linotype", "Book Antiqua", Palatino, serif',
      MONOSPACE: '"Courier New", Courier, monospace',
    };
    return fonts[fontFamily || 'MODERN_SANS'] || fonts.MODERN_SANS;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const activeData = active.data.current as
      | { parentId: string; columnIndex?: number }
      | undefined;
    const overData = over.data.current as
      | { parentId: string; index: number; columnIndex?: number }
      | undefined;

    if (!activeData || !overData) return;

    const fromParentId = activeData.parentId;
    const toParentId = overData.parentId;
    const toIndex = overData.index;
    const toColumnIndex = overData.columnIndex;

    moveBlock(active.id as string, fromParentId, toParentId, toIndex, toColumnIndex);
  };

  const activeBlock = activeId ? document[activeId] : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        className={`mx-auto transition-all duration-300 ${
          screenSize === 'mobile' ? 'max-w-[375px]' : 'max-w-[600px]'
        }`}
        style={{ backgroundColor: rootStyles.backdropColor || '#F5F5F5' }}
        onClick={() => setSelectedBlockId(null)}
      >
        <div
          style={{
            backgroundColor: rootStyles.canvasColor || '#FFFFFF',
            color: rootStyles.textColor || '#242424',
            fontFamily: getFontFamily(rootStyles.fontFamily),
            minHeight: '400px',
          }}
        >
          <SortableContext items={childrenIds} strategy={verticalListSortingStrategy}>
            {childrenIds.length === 0 ? (
              <AddBlockMenu parentId="root" placeholder />
            ) : (
              <>
                {childrenIds.map((childId, index) => (
                  <Fragment key={childId}>
                    <AddBlockMenu parentId="root" index={index} />
                    <SortableBlockWrapper blockId={childId} parentId="root" index={index}>
                      <BlockRenderer blockId={childId} document={document} />
                    </SortableBlockWrapper>
                  </Fragment>
                ))}
                <AddBlockMenu parentId="root" index={childrenIds.length} />
              </>
            )}
          </SortableContext>
        </div>
      </div>

      <DragOverlay>
        {activeBlock && (
          <div className="opacity-80 shadow-lg">
            <BlockRenderer blockId={activeId!} document={document} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

interface BlockRendererProps {
  blockId: string;
  document: EditorDocument;
}

export function BlockRenderer({ blockId, document }: BlockRendererProps) {
  const block = document[blockId];
  if (!block) return null;

  const singleBlockDoc = {
    root: {
      type: 'EmailLayout',
      data: {
        backdropColor: 'transparent',
        canvasColor: 'transparent',
        textColor: 'inherit',
        fontFamily: 'MODERN_SANS',
        childrenIds: [blockId],
      },
    },
    [blockId]: block,
  };

  if (block.type === 'Container') {
    return <ContainerRenderer blockId={blockId} block={block} document={document} />;
  }

  if (block.type === 'ColumnsContainer') {
    return <ColumnsContainerRenderer blockId={blockId} block={block} document={document} />;
  }

  return (
    <Reader
      document={singleBlockDoc as Parameters<typeof Reader>[0]['document']}
      rootBlockId="root"
    />
  );
}

interface ContainerRendererProps {
  blockId: string;
  block: { type: string; data: Record<string, unknown> };
  document: EditorDocument;
}

function ContainerRenderer({ blockId, block, document }: ContainerRendererProps) {
  const containerChildrenIds =
    ((block.data.props as Record<string, unknown>)?.childrenIds as string[]) || [];

  return (
    <div
      style={{
        backgroundColor: (block.data.style as Record<string, unknown>)?.backgroundColor as string,
        padding: formatPadding((block.data.style as Record<string, unknown>)?.padding),
      }}
    >
      <SortableContext items={containerChildrenIds} strategy={verticalListSortingStrategy}>
        {containerChildrenIds.length === 0 ? (
          <AddBlockMenu parentId={blockId} placeholder />
        ) : (
          <>
            {containerChildrenIds.map((childId, index) => (
              <Fragment key={childId}>
                <AddBlockMenu parentId={blockId} index={index} />
                <SortableBlockWrapper blockId={childId} parentId={blockId} index={index}>
                  <BlockRenderer blockId={childId} document={document} />
                </SortableBlockWrapper>
              </Fragment>
            ))}
            <AddBlockMenu parentId={blockId} index={containerChildrenIds.length} />
          </>
        )}
      </SortableContext>
    </div>
  );
}

interface ColumnsContainerRendererProps {
  blockId: string;
  block: { type: string; data: Record<string, unknown> };
  document: EditorDocument;
}

function ColumnsContainerRenderer({ blockId, block, document }: ColumnsContainerRendererProps) {
  const props = block.data.props as Record<string, unknown>;
  const style = block.data.style as Record<string, unknown>;
  const columns = (props?.columns as Array<{ childrenIds: string[] }>) || [];
  const columnsCount = (props?.columnsCount as number) || 2;
  const columnsGap = (props?.columnsGap as number) || 16;

  const visibleColumns = columns.slice(0, columnsCount);

  return (
    <div style={{ padding: formatPadding(style?.padding) }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'separate',
          borderSpacing: `${columnsGap / 2}px 0`,
        }}
      >
        <tbody>
          <tr>
            {visibleColumns.map((column, colIndex) => (
              <td
                key={colIndex}
                style={{
                  width: `${100 / columnsCount}%`,
                  verticalAlign: 'top',
                  padding: 0,
                }}
              >
                <ColumnRenderer
                  parentId={blockId}
                  columnIndex={colIndex}
                  childrenIds={column.childrenIds}
                  document={document}
                />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

interface ColumnRendererProps {
  parentId: string;
  columnIndex: number;
  childrenIds: string[];
  document: EditorDocument;
}

function ColumnRenderer({ parentId, columnIndex, childrenIds, document }: ColumnRendererProps) {
  return (
    <div className="min-h-[60px] border border-dashed border-gray-200 rounded">
      <SortableContext items={childrenIds} strategy={verticalListSortingStrategy}>
        {childrenIds.length === 0 ? (
          <AddBlockMenuColumn parentId={parentId} columnIndex={columnIndex} placeholder />
        ) : (
          <>
            {childrenIds.map((childId, index) => (
              <Fragment key={childId}>
                <AddBlockMenuColumn parentId={parentId} columnIndex={columnIndex} index={index} />
                <SortableBlockWrapper
                  blockId={childId}
                  parentId={parentId}
                  index={index}
                  columnIndex={columnIndex}
                >
                  <BlockRenderer blockId={childId} document={document} />
                </SortableBlockWrapper>
              </Fragment>
            ))}
            <AddBlockMenuColumn
              parentId={parentId}
              columnIndex={columnIndex}
              index={childrenIds.length}
            />
          </>
        )}
      </SortableContext>
    </div>
  );
}

function formatPadding(padding: unknown): string {
  if (!padding || typeof padding !== 'object') return '0';
  const p = padding as { top?: number; bottom?: number; left?: number; right?: number };
  return `${p.top || 0}px ${p.right || 0}px ${p.bottom || 0}px ${p.left || 0}px`;
}

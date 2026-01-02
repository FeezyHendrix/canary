import { Fragment, useEffect } from 'react';
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

  const googleFonts = [
    'Inter',
    'Roboto',
    'Open Sans',
    'Lato',
    'Poppins',
    'Montserrat',
    'Source Sans 3',
    'Nunito',
    'Raleway',
    'Playfair Display',
    'Merriweather',
    'Lora',
    'Fira Code',
    'JetBrains Mono',
  ];

  useEffect(() => {
    const fontFamily = rootStyles.fontFamily || 'Inter';
    if (googleFonts.includes(fontFamily)) {
      const fontId = `google-font-${fontFamily.replace(/\s+/g, '-')}`;
      if (!window.document.getElementById(fontId)) {
        const link = window.document.createElement('link');
        link.id = fontId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@400;500;600;700&display=swap`;
        window.document.head.appendChild(link);
      }
    }
  }, [rootStyles.fontFamily]);

  const getFontFamily = (fontFamily?: string) => {
    const font = fontFamily || 'Inter';
    if (googleFonts.includes(font)) {
      return `"${font}", sans-serif`;
    }
    return '"Inter", sans-serif';
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
            paddingTop: '40px',
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

  const style = (block.data.style || {}) as {
    backgroundColor?: string;
    textColor?: string;
    fontSize?: number;
    textAlign?: string;
  };

  const blockStyle: React.CSSProperties = {
    backgroundColor: style.backgroundColor,
    color: style.textColor,
    fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
    textAlign: style.textAlign as React.CSSProperties['textAlign'],
  };

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

  if (block.type === 'Video') {
    return <VideoRenderer block={block} />;
  }

  if (block.type === 'SocialIcons') {
    return <SocialIconsRenderer block={block} />;
  }

  if (block.type === 'Quote') {
    return <QuoteRenderer block={block} />;
  }

  if (block.type === 'List') {
    return <ListRenderer block={block} />;
  }

  if (block.type === 'Table') {
    return <TableRenderer block={block} />;
  }

  if (block.type === 'Code') {
    return <CodeRenderer block={block} />;
  }

  if (block.type === 'Badge') {
    return <BadgeRenderer block={block} />;
  }

  if (block.type === 'Icon') {
    return <IconRenderer block={block} />;
  }

  return (
    <div style={blockStyle}>
      <Reader
        document={singleBlockDoc as Parameters<typeof Reader>[0]['document']}
        rootBlockId="root"
      />
    </div>
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

interface CustomBlockRendererProps {
  block: { type: string; data: Record<string, unknown> };
}

function VideoRenderer({ block }: CustomBlockRendererProps) {
  const props = block.data.props as {
    thumbnailUrl?: string;
    videoUrl?: string;
    alt?: string;
  };
  const style = block.data.style as Record<string, unknown>;

  return (
    <div style={{ padding: formatPadding(style?.padding), textAlign: 'center' }}>
      <a
        href={props.videoUrl || '#'}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'inline-block', position: 'relative' }}
      >
        <img
          src={props.thumbnailUrl || 'https://placehold.co/600x340/1a1a2e/ffffff?text=Video'}
          alt={props.alt || 'Video thumbnail'}
          style={{ maxWidth: '100%', height: 'auto', display: 'block', borderRadius: '8px' }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '64px',
            height: '64px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderTop: '12px solid transparent',
              borderBottom: '12px solid transparent',
              borderLeft: '20px solid white',
              marginLeft: '4px',
            }}
          />
        </div>
      </a>
    </div>
  );
}

const SOCIAL_ICONS: Record<string, { color: string; path: string }> = {
  twitter: {
    color: '#1DA1F2',
    path: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z',
  },
  facebook: {
    color: '#1877F2',
    path: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z',
  },
  instagram: {
    color: '#E4405F',
    path: 'M16 4H8a4 4 0 00-4 4v8a4 4 0 004 4h8a4 4 0 004-4V8a4 4 0 00-4-4zm2 12a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8a2 2 0 012 2v8zm-6-7a3 3 0 100 6 3 3 0 000-6zm4.5-.5a1 1 0 100-2 1 1 0 000 2z',
  },
  linkedin: {
    color: '#0A66C2',
    path: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z',
  },
  youtube: {
    color: '#FF0000',
    path: 'M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2A29 29 0 0023 12a29.001 29.001 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z',
  },
};

function SocialIconsRenderer({ block }: CustomBlockRendererProps) {
  const props = block.data.props as {
    alignment?: string;
    iconSize?: number;
    iconSpacing?: number;
    iconStyle?: string;
    icons?: Array<{ platform: string; url: string }>;
  };
  const style = block.data.style as Record<string, unknown>;

  const icons = props.icons || [];
  const size = props.iconSize || 32;
  const spacing = props.iconSpacing || 12;

  return (
    <div
      style={{
        padding: formatPadding(style?.padding),
        textAlign: (props.alignment as 'left' | 'center' | 'right') || 'center',
      }}
    >
      {icons.map((icon, index) => {
        const iconData = SOCIAL_ICONS[icon.platform];
        if (!iconData) return null;
        return (
          <a
            key={index}
            href={icon.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              marginLeft: index > 0 ? spacing : 0,
              width: size,
              height: size,
              backgroundColor: props.iconStyle === 'filled' ? iconData.color : 'transparent',
              borderRadius: '50%',
              padding: '6px',
              boxSizing: 'border-box',
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill={props.iconStyle === 'filled' ? 'white' : iconData.color}
              style={{ width: '100%', height: '100%' }}
            >
              <path d={iconData.path} />
            </svg>
          </a>
        );
      })}
    </div>
  );
}

function QuoteRenderer({ block }: CustomBlockRendererProps) {
  const props = block.data.props as {
    text?: string;
    author?: string;
    authorTitle?: string;
    borderColor?: string;
    showQuoteMark?: boolean;
  };
  const style = block.data.style as Record<string, unknown>;

  return (
    <div style={{ padding: formatPadding(style?.padding) }}>
      <div
        style={{
          borderLeft: `4px solid ${props.borderColor || '#3b82f6'}`,
          paddingLeft: '20px',
          position: 'relative',
        }}
      >
        {props.showQuoteMark && (
          <span
            style={{
              position: 'absolute',
              top: '-10px',
              left: '20px',
              fontSize: '48px',
              color: props.borderColor || '#3b82f6',
              opacity: 0.3,
              fontFamily: 'Georgia, serif',
              lineHeight: 1,
            }}
          >
            "
          </span>
        )}
        <p
          style={{
            fontSize: '18px',
            fontStyle: 'italic',
            margin: 0,
            paddingTop: props.showQuoteMark ? '20px' : 0,
          }}
        >
          {props.text || 'Quote text here...'}
        </p>
        {(props.author || props.authorTitle) && (
          <p style={{ marginTop: '12px', marginBottom: 0, fontSize: '14px', color: '#64748b' }}>
            {props.author && <strong>{props.author}</strong>}
            {props.authorTitle && <span>, {props.authorTitle}</span>}
          </p>
        )}
      </div>
    </div>
  );
}

function ListRenderer({ block }: CustomBlockRendererProps) {
  const props = block.data.props as {
    listType?: string;
    items?: string[];
    bulletColor?: string;
  };
  const style = block.data.style as Record<string, unknown>;

  const items = props.items || [];
  const isOrdered = props.listType === 'number';

  return (
    <div style={{ padding: formatPadding(style?.padding) }}>
      {isOrdered ? (
        <ol style={{ margin: 0, paddingLeft: '24px' }}>
          {items.map((item, index) => (
            <li key={index} style={{ marginBottom: '8px' }}>
              {item}
            </li>
          ))}
        </ol>
      ) : (
        <ul style={{ margin: 0, paddingLeft: '24px', listStyleType: 'disc' }}>
          {items.map((item, index) => (
            <li key={index} style={{ marginBottom: '8px', color: props.bulletColor }}>
              <span style={{ color: 'inherit' }}>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TableRenderer({ block }: CustomBlockRendererProps) {
  const props = block.data.props as {
    headers?: string[];
    rows?: string[][];
    headerBackground?: string;
    borderColor?: string;
    stripedRows?: boolean;
  };
  const style = block.data.style as Record<string, unknown>;

  const headers = props.headers || [];
  const rows = props.rows || [];

  return (
    <div style={{ padding: formatPadding(style?.padding) }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: `1px solid ${props.borderColor || '#e2e8f0'}`,
        }}
      >
        {headers.length > 0 && (
          <thead>
            <tr style={{ backgroundColor: props.headerBackground || '#f1f5f9' }}>
              {headers.map((header, index) => (
                <th
                  key={index}
                  style={{
                    padding: '12px',
                    textAlign: 'left',
                    borderBottom: `1px solid ${props.borderColor || '#e2e8f0'}`,
                    fontWeight: 600,
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              style={{
                backgroundColor:
                  props.stripedRows && rowIndex % 2 === 1 ? '#f8fafc' : 'transparent',
              }}
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  style={{
                    padding: '12px',
                    borderBottom: `1px solid ${props.borderColor || '#e2e8f0'}`,
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CodeRenderer({ block }: CustomBlockRendererProps) {
  const props = block.data.props as {
    code?: string;
    language?: string;
    showLineNumbers?: boolean;
    backgroundColor?: string;
    textColor?: string;
  };
  const style = block.data.style as Record<string, unknown>;

  const lines = (props.code || '').split('\n');

  return (
    <div style={{ padding: formatPadding(style?.padding) }}>
      <pre
        style={{
          backgroundColor: props.backgroundColor || '#1e293b',
          color: props.textColor || '#e2e8f0',
          padding: '16px',
          borderRadius: '8px',
          overflow: 'auto',
          fontSize: '14px',
          fontFamily: '"Fira Code", "JetBrains Mono", monospace',
          margin: 0,
        }}
      >
        <code>
          {props.showLineNumbers
            ? lines.map((line, i) => (
                <div key={i}>
                  <span style={{ color: '#64748b', marginRight: '16px', userSelect: 'none' }}>
                    {String(i + 1).padStart(2, ' ')}
                  </span>
                  {line}
                </div>
              ))
            : props.code}
        </code>
      </pre>
    </div>
  );
}

function BadgeRenderer({ block }: CustomBlockRendererProps) {
  const props = block.data.props as {
    text?: string;
    backgroundColor?: string;
    textColor?: string;
    alignment?: string;
    size?: string;
  };
  const style = block.data.style as Record<string, unknown>;

  const sizeStyles = {
    small: { fontSize: '12px', padding: '4px 8px' },
    medium: { fontSize: '14px', padding: '6px 12px' },
    large: { fontSize: '16px', padding: '8px 16px' },
  };
  const sizeStyle = sizeStyles[(props.size as keyof typeof sizeStyles) || 'medium'];

  return (
    <div
      style={{
        padding: formatPadding(style?.padding),
        textAlign: (props.alignment as 'left' | 'center' | 'right') || 'left',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          backgroundColor: props.backgroundColor || '#3b82f6',
          color: props.textColor || '#ffffff',
          borderRadius: '9999px',
          fontWeight: 500,
          ...sizeStyle,
        }}
      >
        {props.text || 'Badge'}
      </span>
    </div>
  );
}

const ICONS: Record<string, string> = {
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  heart:
    'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z',
  check: 'M20 6L9 17l-5-5',
  mail: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm16 2l-8 5-8-5v2l8 5 8-5V6z',
  phone:
    'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z',
  location: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0zm-9 3a3 3 0 100-6 3 3 0 000 6z',
  gift: 'M20 12v10H4V12m16 0H4m16 0l-4-4m-8 4l4-4m-4 4V6a2 2 0 114 0v6m-4 0h4',
  trophy:
    'M6 9H4.5a2.5 2.5 0 010-5H6m12 5h1.5a2.5 2.5 0 000-5H18M6 9v7c0 1.1.9 2 2 2h8a2 2 0 002-2V9M6 9h12M9 21h6m-3-3v3',
};

function IconRenderer({ block }: CustomBlockRendererProps) {
  const props = block.data.props as {
    icon?: string;
    size?: number;
    color?: string;
    alignment?: string;
    label?: string;
  };
  const style = block.data.style as Record<string, unknown>;

  const iconPath = ICONS[props.icon || 'star'] || ICONS.star;
  const size = props.size || 48;

  return (
    <div
      style={{
        padding: formatPadding(style?.padding),
        textAlign: (props.alignment as 'left' | 'center' | 'right') || 'center',
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke={props.color || '#3b82f6'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ width: size, height: size, display: 'inline-block' }}
      >
        <path d={iconPath} />
      </svg>
      {props.label && (
        <p style={{ marginTop: '8px', marginBottom: 0, fontSize: '14px' }}>{props.label}</p>
      )}
    </div>
  );
}

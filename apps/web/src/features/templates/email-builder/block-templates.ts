import { EditorBlock } from './editor-context';

export type BlockType =
  | 'Text'
  | 'Heading'
  | 'Button'
  | 'Image'
  | 'Divider'
  | 'Spacer'
  | 'Container'
  | 'ColumnsContainer'
  | 'Avatar'
  | 'Html';

export interface BlockTemplate {
  type: BlockType;
  label: string;
  icon: string;
  createBlock: () => EditorBlock;
}

export const BLOCK_TEMPLATES: BlockTemplate[] = [
  {
    type: 'Heading',
    label: 'Heading',
    icon: 'H',
    createBlock: () => ({
      type: 'Heading',
      data: {
        style: {
          padding: { top: 16, bottom: 16, left: 24, right: 24 },
        },
        props: {
          text: 'Heading',
          level: 'h2',
        },
      },
    }),
  },
  {
    type: 'Text',
    label: 'Text',
    icon: 'T',
    createBlock: () => ({
      type: 'Text',
      data: {
        style: {
          padding: { top: 16, bottom: 16, left: 24, right: 24 },
        },
        props: {
          text: 'Enter your text here...',
        },
      },
    }),
  },
  {
    type: 'Button',
    label: 'Button',
    icon: 'B',
    createBlock: () => ({
      type: 'Button',
      data: {
        style: {
          padding: { top: 16, bottom: 16, left: 24, right: 24 },
        },
        props: {
          text: 'Click me',
          url: 'https://example.com',
          buttonBackgroundColor: '#3b82f6',
          buttonTextColor: '#ffffff',
          buttonStyle: 'rounded',
        },
      },
    }),
  },
  {
    type: 'Image',
    label: 'Image',
    icon: 'I',
    createBlock: () => ({
      type: 'Image',
      data: {
        style: {
          padding: { top: 16, bottom: 16, left: 24, right: 24 },
        },
        props: {
          url: 'https://placehold.co/600x200/e2e8f0/64748b?text=Your+Image',
          alt: 'Image description',
          contentAlignment: 'center',
        },
      },
    }),
  },
  {
    type: 'Divider',
    label: 'Divider',
    icon: '—',
    createBlock: () => ({
      type: 'Divider',
      data: {
        style: {
          padding: { top: 16, bottom: 16, left: 24, right: 24 },
        },
        props: {
          lineColor: '#e2e8f0',
          lineHeight: 1,
        },
      },
    }),
  },
  {
    type: 'Spacer',
    label: 'Spacer',
    icon: '↕',
    createBlock: () => ({
      type: 'Spacer',
      data: {
        props: {
          height: 32,
        },
      },
    }),
  },
  {
    type: 'Container',
    label: 'Container',
    icon: '□',
    createBlock: () => ({
      type: 'Container',
      data: {
        style: {
          padding: { top: 16, bottom: 16, left: 16, right: 16 },
          backgroundColor: '#f8fafc',
        },
        props: {
          childrenIds: [],
        },
      },
    }),
  },
  {
    type: 'ColumnsContainer',
    label: '2 Columns',
    icon: '▥',
    createBlock: () => ({
      type: 'ColumnsContainer',
      data: {
        style: {
          padding: { top: 16, bottom: 16, left: 0, right: 0 },
        },
        props: {
          columnsCount: 2,
          columnsGap: 16,
          columns: [{ childrenIds: [] }, { childrenIds: [] }, { childrenIds: [] }],
        },
      },
    }),
  },
  {
    type: 'Avatar',
    label: 'Avatar',
    icon: '◉',
    createBlock: () => ({
      type: 'Avatar',
      data: {
        style: {
          padding: { top: 16, bottom: 16, left: 24, right: 24 },
        },
        props: {
          imageUrl: 'https://placehold.co/80x80/e2e8f0/64748b?text=A',
          size: 64,
          shape: 'circle',
        },
      },
    }),
  },
  {
    type: 'Html',
    label: 'HTML',
    icon: '</>',
    createBlock: () => ({
      type: 'Html',
      data: {
        style: {
          padding: { top: 16, bottom: 16, left: 24, right: 24 },
        },
        props: {
          contents: '<p>Custom HTML content</p>',
        },
      },
    }),
  },
];

export function getBlockTemplate(type: BlockType): BlockTemplate | undefined {
  return BLOCK_TEMPLATES.find((t) => t.type === type);
}

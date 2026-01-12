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
  | 'Html'
  | 'Video'
  | 'SocialIcons'
  | 'Quote'
  | 'List'
  | 'Table'
  | 'Code'
  | 'Badge'
  | 'Icon'
  | 'Chart';

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
  {
    type: 'Video',
    label: 'Video',
    icon: '▶',
    createBlock: () => ({
      type: 'Video',
      data: {
        style: {
          padding: { top: 16, bottom: 16, left: 24, right: 24 },
        },
        props: {
          thumbnailUrl: 'https://placehold.co/600x340/1a1a2e/ffffff?text=Video+Thumbnail',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          alt: 'Video thumbnail',
        },
      },
    }),
  },
  {
    type: 'SocialIcons',
    label: 'Social Icons',
    icon: '🔗',
    createBlock: () => ({
      type: 'SocialIcons',
      data: {
        style: {
          padding: { top: 16, bottom: 16, left: 24, right: 24 },
        },
        props: {
          alignment: 'center',
          iconSize: 32,
          iconSpacing: 12,
          iconStyle: 'filled',
          icons: [
            { platform: 'twitter', url: 'https://twitter.com' },
            { platform: 'facebook', url: 'https://facebook.com' },
            { platform: 'instagram', url: 'https://instagram.com' },
            { platform: 'linkedin', url: 'https://linkedin.com' },
          ],
        },
      },
    }),
  },
  {
    type: 'Quote',
    label: 'Quote',
    icon: '"',
    createBlock: () => ({
      type: 'Quote',
      data: {
        style: {
          padding: { top: 24, bottom: 24, left: 32, right: 32 },
        },
        props: {
          text: 'This is a powerful quote that captures attention and adds credibility to your message.',
          author: 'John Doe',
          authorTitle: 'CEO, Example Company',
          borderColor: '#3b82f6',
          showQuoteMark: true,
        },
      },
    }),
  },
  {
    type: 'List',
    label: 'List',
    icon: '•',
    createBlock: () => ({
      type: 'List',
      data: {
        style: {
          padding: { top: 16, bottom: 16, left: 24, right: 24 },
        },
        props: {
          listType: 'bullet',
          items: ['First item in the list', 'Second item in the list', 'Third item in the list'],
          bulletColor: '#3b82f6',
        },
      },
    }),
  },
  {
    type: 'Table',
    label: 'Table',
    icon: '▦',
    createBlock: () => ({
      type: 'Table',
      data: {
        style: {
          padding: { top: 16, bottom: 16, left: 24, right: 24 },
        },
        props: {
          headers: ['Column 1', 'Column 2', 'Column 3'],
          rows: [
            ['Row 1, Cell 1', 'Row 1, Cell 2', 'Row 1, Cell 3'],
            ['Row 2, Cell 1', 'Row 2, Cell 2', 'Row 2, Cell 3'],
          ],
          headerBackground: '#f1f5f9',
          borderColor: '#e2e8f0',
          stripedRows: true,
        },
      },
    }),
  },
  {
    type: 'Code',
    label: 'Code',
    icon: '{ }',
    createBlock: () => ({
      type: 'Code',
      data: {
        style: {
          padding: { top: 16, bottom: 16, left: 24, right: 24 },
        },
        props: {
          code: 'const greeting = "Hello, World!";\nconsole.log(greeting);',
          language: 'javascript',
          showLineNumbers: true,
          backgroundColor: '#1e293b',
          textColor: '#e2e8f0',
        },
      },
    }),
  },
  {
    type: 'Badge',
    label: 'Badge',
    icon: '●',
    createBlock: () => ({
      type: 'Badge',
      data: {
        style: {
          padding: { top: 8, bottom: 8, left: 24, right: 24 },
        },
        props: {
          text: 'New Feature',
          backgroundColor: '#3b82f6',
          textColor: '#ffffff',
          alignment: 'left',
          size: 'medium',
        },
      },
    }),
  },
  {
    type: 'Icon',
    label: 'Icon',
    icon: '★',
    createBlock: () => ({
      type: 'Icon',
      data: {
        style: {
          padding: { top: 16, bottom: 16, left: 24, right: 24 },
        },
        props: {
          icon: 'star',
          size: 48,
          color: '#3b82f6',
          alignment: 'center',
          label: '',
        },
      },
    }),
  },
  {
    type: 'Chart',
    label: 'Chart',
    icon: '📊',
    createBlock: () => ({
      type: 'Chart',
      data: {
        style: {
          padding: { top: 16, bottom: 16, left: 24, right: 24 },
        },
        props: {
          chartType: 'bar',
          title: 'Chart Title',
          dataSource: 'static',
          staticData: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr'],
            datasets: [{ name: 'Series 1', values: [100, 150, 120, 180] }],
          },
          colors: ['#3b82f6', '#ef4444', '#22c55e'],
          showLegend: true,
          legendPosition: 'bottom',
          showGridLines: true,
          width: 500,
          height: 300,
        },
      },
    }),
  },
];

export function getBlockTemplate(type: BlockType): BlockTemplate | undefined {
  return BLOCK_TEMPLATES.find((t) => t.type === type);
}

export interface PresetTemplate {
  id: string;
  label: string;
  icon: string;
  description: string;
  createBlocks: () => EditorBlock[];
}

export const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    id: 'header',
    label: 'Header',
    icon: '🔝',
    description: 'Logo + navigation header',
    createBlocks: () => [
      {
        type: 'Container',
        data: {
          style: {
            padding: { top: 24, bottom: 24, left: 24, right: 24 },
            backgroundColor: '#ffffff',
          },
          props: {
            childrenIds: [],
          },
        },
      },
      {
        type: 'Image',
        data: {
          style: {
            padding: { top: 0, bottom: 16, left: 0, right: 0 },
          },
          props: {
            url: 'https://placehold.co/150x50/3b82f6/ffffff?text=LOGO',
            alt: 'Company Logo',
            contentAlignment: 'center',
          },
        },
      },
      {
        type: 'Text',
        data: {
          style: {
            padding: { top: 0, bottom: 0, left: 0, right: 0 },
            textAlign: 'center',
          },
          props: {
            text: '<a href="#">Home</a> &nbsp;&nbsp;|&nbsp;&nbsp; <a href="#">Products</a> &nbsp;&nbsp;|&nbsp;&nbsp; <a href="#">About</a> &nbsp;&nbsp;|&nbsp;&nbsp; <a href="#">Contact</a>',
          },
        },
      },
    ],
  },
  {
    id: 'hero',
    label: 'Hero Section',
    icon: '🌟',
    description: 'Large image + heading + CTA',
    createBlocks: () => [
      {
        type: 'Image',
        data: {
          style: {
            padding: { top: 0, bottom: 0, left: 0, right: 0 },
          },
          props: {
            url: 'https://placehold.co/600x300/3b82f6/ffffff?text=Hero+Image',
            alt: 'Hero image',
            contentAlignment: 'center',
          },
        },
      },
      {
        type: 'Heading',
        data: {
          style: {
            padding: { top: 32, bottom: 16, left: 24, right: 24 },
            textAlign: 'center',
          },
          props: {
            text: 'Welcome to Our Newsletter',
            level: 'h1',
          },
        },
      },
      {
        type: 'Text',
        data: {
          style: {
            padding: { top: 0, bottom: 24, left: 24, right: 24 },
            textAlign: 'center',
          },
          props: {
            text: "Stay updated with our latest news, products, and exclusive offers. We're excited to have you here!",
          },
        },
      },
      {
        type: 'Button',
        data: {
          style: {
            padding: { top: 0, bottom: 32, left: 24, right: 24 },
          },
          props: {
            text: 'Get Started',
            url: 'https://example.com',
            buttonBackgroundColor: '#3b82f6',
            buttonTextColor: '#ffffff',
            buttonStyle: 'rounded',
            fullWidth: false,
          },
        },
      },
    ],
  },
  {
    id: 'cta',
    label: 'Call to Action',
    icon: '🎯',
    description: 'Highlighted CTA section',
    createBlocks: () => [
      {
        type: 'Container',
        data: {
          style: {
            padding: { top: 32, bottom: 32, left: 24, right: 24 },
            backgroundColor: '#3b82f6',
          },
          props: {
            childrenIds: [],
          },
        },
      },
      {
        type: 'Heading',
        data: {
          style: {
            padding: { top: 0, bottom: 16, left: 0, right: 0 },
            textAlign: 'center',
            color: '#ffffff',
          },
          props: {
            text: 'Ready to Get Started?',
            level: 'h2',
          },
        },
      },
      {
        type: 'Text',
        data: {
          style: {
            padding: { top: 0, bottom: 24, left: 0, right: 0 },
            textAlign: 'center',
            color: '#ffffff',
          },
          props: {
            text: 'Join thousands of happy customers today.',
          },
        },
      },
      {
        type: 'Button',
        data: {
          style: {
            padding: { top: 0, bottom: 0, left: 0, right: 0 },
          },
          props: {
            text: 'Sign Up Now',
            url: 'https://example.com/signup',
            buttonBackgroundColor: '#ffffff',
            buttonTextColor: '#3b82f6',
            buttonStyle: 'rounded',
            fullWidth: false,
          },
        },
      },
    ],
  },
  {
    id: 'social',
    label: 'Social Links',
    icon: '📱',
    description: 'Social media icons',
    createBlocks: () => [
      {
        type: 'Container',
        data: {
          style: {
            padding: { top: 24, bottom: 24, left: 24, right: 24 },
            backgroundColor: '#f8fafc',
          },
          props: {
            childrenIds: [],
          },
        },
      },
      {
        type: 'Text',
        data: {
          style: {
            padding: { top: 0, bottom: 16, left: 0, right: 0 },
            textAlign: 'center',
          },
          props: {
            text: '<strong>Follow Us</strong>',
          },
        },
      },
      {
        type: 'Text',
        data: {
          style: {
            padding: { top: 0, bottom: 0, left: 0, right: 0 },
            textAlign: 'center',
          },
          props: {
            text: '<a href="#">Twitter</a> &nbsp;&nbsp;•&nbsp;&nbsp; <a href="#">Facebook</a> &nbsp;&nbsp;•&nbsp;&nbsp; <a href="#">Instagram</a> &nbsp;&nbsp;•&nbsp;&nbsp; <a href="#">LinkedIn</a>',
          },
        },
      },
    ],
  },
  {
    id: 'footer',
    label: 'Footer',
    icon: '📝',
    description: 'Standard email footer',
    createBlocks: () => [
      {
        type: 'Divider',
        data: {
          style: {
            padding: { top: 32, bottom: 32, left: 24, right: 24 },
          },
          props: {
            lineColor: '#e2e8f0',
            lineHeight: 1,
          },
        },
      },
      {
        type: 'Text',
        data: {
          style: {
            padding: { top: 0, bottom: 8, left: 24, right: 24 },
            textAlign: 'center',
            fontSize: 12,
            color: '#64748b',
          },
          props: {
            text: '© {{year}} {{companyName}}. All rights reserved.',
          },
        },
      },
      {
        type: 'Text',
        data: {
          style: {
            padding: { top: 0, bottom: 8, left: 24, right: 24 },
            textAlign: 'center',
            fontSize: 12,
            color: '#64748b',
          },
          props: {
            text: '123 Main Street, City, State 12345',
          },
        },
      },
      {
        type: 'Text',
        data: {
          style: {
            padding: { top: 0, bottom: 24, left: 24, right: 24 },
            textAlign: 'center',
            fontSize: 12,
            color: '#64748b',
          },
          props: {
            text: '<a href="#">Unsubscribe</a> &nbsp;|&nbsp; <a href="#">Privacy Policy</a> &nbsp;|&nbsp; <a href="#">View in Browser</a>',
          },
        },
      },
    ],
  },
  {
    id: 'testimonial',
    label: 'Testimonial',
    icon: '💬',
    description: 'Customer quote section',
    createBlocks: () => [
      {
        type: 'Container',
        data: {
          style: {
            padding: { top: 32, bottom: 32, left: 32, right: 32 },
            backgroundColor: '#f8fafc',
          },
          props: {
            childrenIds: [],
          },
        },
      },
      {
        type: 'Text',
        data: {
          style: {
            padding: { top: 0, bottom: 16, left: 0, right: 0 },
            textAlign: 'center',
            fontSize: 18,
            fontStyle: 'italic',
          },
          props: {
            text: '"This product has completely transformed the way we work. Highly recommended!"',
          },
        },
      },
      {
        type: 'Avatar',
        data: {
          style: {
            padding: { top: 16, bottom: 8, left: 0, right: 0 },
          },
          props: {
            imageUrl: 'https://placehold.co/60x60/3b82f6/ffffff?text=JD',
            size: 60,
            shape: 'circle',
          },
        },
      },
      {
        type: 'Text',
        data: {
          style: {
            padding: { top: 0, bottom: 0, left: 0, right: 0 },
            textAlign: 'center',
          },
          props: {
            text: '<strong>John Doe</strong><br/>CEO, Example Company',
          },
        },
      },
    ],
  },
];

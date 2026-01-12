import { TReaderDocument } from '@usewaypoint/email-builder';

export type EditorBlock = {
  type: string;
  data: {
    style?: Record<string, unknown>;
    props?: Record<string, unknown>;
  };
};

export type EditorDocument = TReaderDocument;

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
  | 'Chart';

export type FontFamily =
  | 'MODERN_SANS'
  | 'BOOK_SANS'
  | 'ORGANIC_SANS'
  | 'GEOMETRIC_SANS'
  | 'HEAVY_SANS'
  | 'ROUNDED_SANS'
  | 'MODERN_SERIF'
  | 'BOOK_SERIF'
  | 'MONOSPACE';

export interface TextBlockProps {
  text: string;
}

export interface HeadingBlockProps {
  text: string;
  level: 'h1' | 'h2' | 'h3';
}

export interface ButtonBlockProps {
  text: string;
  url: string;
  fullWidth?: boolean;
  size?: 'x-small' | 'small' | 'medium' | 'large';
  buttonStyle?: 'rectangle' | 'pill' | 'rounded';
  buttonTextColor?: string;
  buttonBackgroundColor?: string;
}

export interface ImageBlockProps {
  url: string;
  alt: string;
  linkHref?: string;
  contentAlignment?: 'left' | 'center' | 'right';
}

export interface SpacerBlockProps {
  height: number;
}

export interface DividerBlockProps {
  lineColor?: string;
  lineHeight?: number;
}

export interface ContainerBlockProps {
  childrenIds: string[];
}

export interface ColumnsContainerBlockProps {
  columns: Array<{ childrenIds: string[] }>;
  columnsCount?: 2 | 3;
  columnsGap?: number;
}

export interface AvatarBlockProps {
  imageUrl: string;
  shape?: 'circle' | 'square' | 'rounded';
  size?: number;
}

export interface HtmlBlockProps {
  contents: string;
}

export interface ChartBlockProps {
  chartType: 'bar' | 'line' | 'pie' | 'doughnut' | 'area';
  title?: string;
  dataSource: 'static' | 'dynamic';
  staticData?: {
    labels: string[];
    datasets: Array<{ name: string; values: number[] }>;
  };
  dynamicVariable?: string;
  colors: string[];
  showLegend: boolean;
  legendPosition: 'top' | 'bottom' | 'left' | 'right';
  showGridLines: boolean;
  axisLabels?: { x?: string; y?: string };
  width: number;
  height: number;
  prerenderedImageUrl?: string;
}

export interface BlockStyle {
  padding?: { top?: number; bottom?: number; left?: number; right?: number };
  backgroundColor?: string;
  fontWeight?: 'normal' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
}

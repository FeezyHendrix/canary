export type ChartType = 'bar' | 'line' | 'pie' | 'doughnut' | 'area';

export type LegendPosition = 'top' | 'bottom' | 'left' | 'right';

export interface ChartDataset {
  name: string;
  values: number[];
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartBlockProps {
  chartType: ChartType;
  title?: string;

  // Data source
  dataSource: 'static' | 'dynamic';
  staticData?: ChartData;
  dynamicVariable?: string;

  // Styling
  colors: string[];
  showLegend: boolean;
  legendPosition: LegendPosition;
  showGridLines: boolean;
  axisLabels?: {
    x?: string;
    y?: string;
  };

  // Dimensions
  width: number;
  height: number;

  // Pre-rendered image URL (for static charts saved to storage)
  prerenderedImageUrl?: string;
}

// Default colors for charts
export const DEFAULT_CHART_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#22c55e', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

// Default chart configuration
export const DEFAULT_CHART_CONFIG: Omit<ChartBlockProps, 'chartType'> = {
  dataSource: 'static',
  staticData: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr'],
    datasets: [{ name: 'Series 1', values: [100, 150, 120, 180] }],
  },
  colors: DEFAULT_CHART_COLORS.slice(0, 3),
  showLegend: true,
  legendPosition: 'bottom',
  showGridLines: true,
  width: 500,
  height: 300,
};

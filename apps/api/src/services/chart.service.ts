import { env } from '../lib/env';
import { AppError } from '../lib/errors';
import { ERROR_CODES } from '@canary/shared';
import type { ChartType, ChartData, ChartBlockProps, LegendPosition } from '@canary/shared';

const DEFAULT_COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#f97316',
];

interface ChartRenderOptions {
  chartType: ChartType;
  data: ChartData;
  title?: string;
  colors?: string[];
  showLegend?: boolean;
  legendPosition?: LegendPosition;
  showGridLines?: boolean;
  axisLabels?: { x?: string; y?: string };
  width?: number;
  height?: number;
}

/**
 * Generate SVG chart from data
 */
function generateChartSvg(options: ChartRenderOptions): string {
  const {
    chartType,
    data,
    title,
    colors = DEFAULT_COLORS,
    showLegend = true,
    legendPosition = 'bottom',
    showGridLines = true,
    axisLabels,
    width = 500,
    height = 300,
  } = options;

  const padding = { top: title ? 40 : 20, right: 20, bottom: showLegend && legendPosition === 'bottom' ? 60 : 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  if (chartType === 'pie' || chartType === 'doughnut') {
    return generatePieChart(options, chartWidth, chartHeight, padding, width, height);
  }

  return generateCartesianChart(options, chartWidth, chartHeight, padding, width, height);
}

function generateCartesianChart(
  options: ChartRenderOptions,
  chartWidth: number,
  chartHeight: number,
  padding: { top: number; right: number; bottom: number; left: number },
  width: number,
  height: number
): string {
  const {
    chartType,
    data,
    title,
    colors = DEFAULT_COLORS,
    showLegend = true,
    legendPosition = 'bottom',
    showGridLines = true,
    axisLabels,
  } = options;

  const { labels, datasets } = data;

  // Calculate max value for scaling
  const allValues = datasets.flatMap(d => d.values);
  const maxValue = Math.max(...allValues, 0);
  const minValue = Math.min(...allValues, 0);
  const valueRange = maxValue - minValue || 1;

  // Generate grid lines
  const gridLines: string[] = [];
  if (showGridLines) {
    const gridCount = 5;
    for (let i = 0; i <= gridCount; i++) {
      const y = padding.top + (chartHeight * i) / gridCount;
      gridLines.push(`<line x1="${padding.left}" y1="${y}" x2="${padding.left + chartWidth}" y2="${y}" stroke="#e5e7eb" stroke-width="1" />`);
    }
  }

  // Generate Y-axis labels
  const yAxisLabels: string[] = [];
  const yLabelCount = 5;
  for (let i = 0; i <= yLabelCount; i++) {
    const value = maxValue - (valueRange * i) / yLabelCount;
    const y = padding.top + (chartHeight * i) / yLabelCount;
    yAxisLabels.push(`<text x="${padding.left - 10}" y="${y + 4}" text-anchor="end" fill="#6b7280" font-size="11">${formatNumber(value)}</text>`);
  }

  // Generate X-axis labels
  const xAxisLabels: string[] = [];
  const barGroupWidth = chartWidth / labels.length;
  labels.forEach((label, i) => {
    const x = padding.left + barGroupWidth * (i + 0.5);
    xAxisLabels.push(`<text x="${x}" y="${padding.top + chartHeight + 20}" text-anchor="middle" fill="#6b7280" font-size="11">${label}</text>`);
  });

  // Generate chart elements based on type
  let chartElements: string[] = [];

  if (chartType === 'bar') {
    const barWidth = (barGroupWidth * 0.8) / datasets.length;
    const barGap = barGroupWidth * 0.1;

    datasets.forEach((dataset, datasetIndex) => {
      dataset.values.forEach((value, valueIndex) => {
        const barHeight = ((value - minValue) / valueRange) * chartHeight;
        const x = padding.left + barGroupWidth * valueIndex + barGap + barWidth * datasetIndex;
        const y = padding.top + chartHeight - barHeight;
        const color = colors[datasetIndex % colors.length];
        chartElements.push(`<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${color}" rx="2" />`);
      });
    });
  } else if (chartType === 'line' || chartType === 'area') {
    datasets.forEach((dataset, datasetIndex) => {
      const color = colors[datasetIndex % colors.length];
      const points: string[] = [];

      dataset.values.forEach((value, valueIndex) => {
        const x = padding.left + barGroupWidth * (valueIndex + 0.5);
        const y = padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight;
        points.push(`${x},${y}`);
      });

      if (chartType === 'area') {
        const areaPoints = [
          `${padding.left + barGroupWidth * 0.5},${padding.top + chartHeight}`,
          ...points,
          `${padding.left + barGroupWidth * (labels.length - 0.5)},${padding.top + chartHeight}`,
        ];
        chartElements.push(`<polygon points="${areaPoints.join(' ')}" fill="${color}" fill-opacity="0.3" />`);
      }

      chartElements.push(`<polyline points="${points.join(' ')}" fill="none" stroke="${color}" stroke-width="2" />`);

      // Add dots
      dataset.values.forEach((value, valueIndex) => {
        const x = padding.left + barGroupWidth * (valueIndex + 0.5);
        const y = padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight;
        chartElements.push(`<circle cx="${x}" cy="${y}" r="4" fill="${color}" />`);
      });
    });
  }

  // Generate legend
  let legend = '';
  if (showLegend && datasets.length > 0) {
    const legendItems = datasets.map((dataset, i) => {
      const color = colors[i % colors.length];
      return `<g transform="translate(${i * 100}, 0)">
        <rect x="0" y="0" width="12" height="12" fill="${color}" rx="2" />
        <text x="18" y="10" fill="#374151" font-size="12">${dataset.name}</text>
      </g>`;
    }).join('');

    const legendY = legendPosition === 'bottom' ? height - 25 : padding.top - 25;
    const legendX = padding.left + chartWidth / 2 - (datasets.length * 50);
    legend = `<g transform="translate(${legendX}, ${legendY})">${legendItems}</g>`;
  }

  // Build SVG
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="${width}" height="${height}" fill="white" />
    ${title ? `<text x="${width / 2}" y="25" text-anchor="middle" fill="#111827" font-size="16" font-weight="600">${escapeXml(title)}</text>` : ''}
    ${gridLines.join('\n')}
    <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + chartHeight}" stroke="#d1d5db" stroke-width="1" />
    <line x1="${padding.left}" y1="${padding.top + chartHeight}" x2="${padding.left + chartWidth}" y2="${padding.top + chartHeight}" stroke="#d1d5db" stroke-width="1" />
    ${yAxisLabels.join('\n')}
    ${xAxisLabels.join('\n')}
    ${axisLabels?.y ? `<text x="15" y="${padding.top + chartHeight / 2}" text-anchor="middle" fill="#6b7280" font-size="12" transform="rotate(-90, 15, ${padding.top + chartHeight / 2})">${escapeXml(axisLabels.y)}</text>` : ''}
    ${axisLabels?.x ? `<text x="${padding.left + chartWidth / 2}" y="${height - 5}" text-anchor="middle" fill="#6b7280" font-size="12">${escapeXml(axisLabels.x)}</text>` : ''}
    ${chartElements.join('\n')}
    ${legend}
  </svg>`;
}

function generatePieChart(
  options: ChartRenderOptions,
  chartWidth: number,
  chartHeight: number,
  padding: { top: number; right: number; bottom: number; left: number },
  width: number,
  height: number
): string {
  const {
    chartType,
    data,
    title,
    colors = DEFAULT_COLORS,
    showLegend = true,
  } = options;

  const { labels, datasets } = data;
  const values = datasets[0]?.values || [];
  const total = values.reduce((sum, v) => sum + v, 0) || 1;

  const centerX = padding.left + chartWidth / 2;
  const centerY = padding.top + chartHeight / 2;
  const radius = Math.min(chartWidth, chartHeight) / 2 - 10;
  const innerRadius = chartType === 'doughnut' ? radius * 0.5 : 0;

  let currentAngle = -Math.PI / 2;
  const slices: string[] = [];

  values.forEach((value, index) => {
    const sliceAngle = (value / total) * 2 * Math.PI;
    const color = colors[index % colors.length];

    const x1 = centerX + radius * Math.cos(currentAngle);
    const y1 = centerY + radius * Math.sin(currentAngle);
    const x2 = centerX + radius * Math.cos(currentAngle + sliceAngle);
    const y2 = centerY + radius * Math.sin(currentAngle + sliceAngle);

    const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

    if (chartType === 'doughnut') {
      const ix1 = centerX + innerRadius * Math.cos(currentAngle);
      const iy1 = centerY + innerRadius * Math.sin(currentAngle);
      const ix2 = centerX + innerRadius * Math.cos(currentAngle + sliceAngle);
      const iy2 = centerY + innerRadius * Math.sin(currentAngle + sliceAngle);

      slices.push(`<path d="M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${ix1} ${iy1} Z" fill="${color}" />`);
    } else {
      slices.push(`<path d="M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z" fill="${color}" />`);
    }

    currentAngle += sliceAngle;
  });

  // Generate legend
  let legend = '';
  if (showLegend) {
    const legendItems = labels.map((label, i) => {
      const color = colors[i % colors.length];
      const percentage = ((values[i] / total) * 100).toFixed(1);
      return `<g transform="translate(0, ${i * 20})">
        <rect x="0" y="0" width="12" height="12" fill="${color}" rx="2" />
        <text x="18" y="10" fill="#374151" font-size="11">${escapeXml(label)} (${percentage}%)</text>
      </g>`;
    }).join('');

    legend = `<g transform="translate(${width - 120}, ${padding.top})">${legendItems}</g>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="${width}" height="${height}" fill="white" />
    ${title ? `<text x="${width / 2}" y="25" text-anchor="middle" fill="#111827" font-size="16" font-weight="600">${escapeXml(title)}</text>` : ''}
    ${slices.join('\n')}
    ${legend}
  </svg>`;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toFixed(0);
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate HTML page containing the chart for Gotenberg rendering
 */
function generateChartHtml(svg: string, width: number, height: number): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: ${width}px;
      height: ${height}px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
  </style>
</head>
<body>
  ${svg}
</body>
</html>`;
}

/**
 * Render a chart to PNG image using Gotenberg
 */
export async function renderChartToImage(config: ChartBlockProps, data?: ChartData): Promise<Buffer> {
  if (!env.GOTENBERG_URL) {
    throw new AppError(ERROR_CODES.PDF_NOT_CONFIGURED, 'Chart rendering not configured (Gotenberg URL missing)', 500);
  }

  const chartData = data || config.staticData;
  if (!chartData) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'Chart data is required', 400);
  }

  const svg = generateChartSvg({
    chartType: config.chartType,
    data: chartData,
    title: config.title,
    colors: config.colors,
    showLegend: config.showLegend,
    legendPosition: config.legendPosition,
    showGridLines: config.showGridLines,
    axisLabels: config.axisLabels,
    width: config.width,
    height: config.height,
  });

  const html = generateChartHtml(svg, config.width, config.height);

  const formData = new FormData();
  formData.append('files', new Blob([html], { type: 'text/html' }), 'index.html');
  formData.append('format', 'png');
  formData.append('width', String(config.width));
  formData.append('height', String(config.height));
  formData.append('optimizeForSpeed', 'true');

  const response = await fetch(`${env.GOTENBERG_URL}/forms/chromium/screenshot`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new AppError(
      ERROR_CODES.PDF_GENERATION_FAILED,
      `Chart rendering failed: ${response.statusText} - ${errorText}`,
      500
    );
  }

  return Buffer.from(await response.arrayBuffer());
}

/**
 * Check if chart rendering is available
 */
export function isChartRenderingEnabled(): boolean {
  return !!env.GOTENBERG_URL;
}

/**
 * Generate chart SVG (for preview purposes without PNG conversion)
 */
export function generateChartSvgPreview(config: ChartBlockProps, data?: ChartData): string {
  const chartData = data || config.staticData;
  if (!chartData) {
    return '';
  }

  return generateChartSvg({
    chartType: config.chartType,
    data: chartData,
    title: config.title,
    colors: config.colors,
    showLegend: config.showLegend,
    legendPosition: config.legendPosition,
    showGridLines: config.showGridLines,
    axisLabels: config.axisLabels,
    width: config.width,
    height: config.height,
  });
}

import { env } from '../lib/env';
import { AppError } from '../lib/errors';
import { ERROR_CODES } from '@canary/shared';

export async function generatePdfFromHtml(html: string): Promise<Buffer> {
  if (!env.GOTENBERG_URL) {
    throw new AppError(ERROR_CODES.PDF_NOT_CONFIGURED, 'PDF generation not configured', 500);
  }

  const formData = new FormData();
  formData.append('files', new Blob([html], { type: 'text/html' }), 'index.html');
  formData.append('marginTop', '0.5');
  formData.append('marginBottom', '0.5');
  formData.append('marginLeft', '0.5');
  formData.append('marginRight', '0.5');

  const response = await fetch(`${env.GOTENBERG_URL}/forms/chromium/convert/html`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new AppError(
      ERROR_CODES.PDF_GENERATION_FAILED,
      `PDF generation failed: ${response.statusText} - ${errorText}`,
      500
    );
  }

  return Buffer.from(await response.arrayBuffer());
}

export function isPdfEnabled(): boolean {
  return !!env.GOTENBERG_URL;
}

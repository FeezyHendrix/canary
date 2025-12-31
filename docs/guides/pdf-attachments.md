---
title: PDF Attachments
layout: default
parent: Guides
nav_order: 2
---

# PDF Attachments Guide

Generate PDF documents from your email templates and attach them to emails automatically. This is perfect for invoices, receipts, reports, and other documents.

## Overview

Canary uses [Gotenberg](https://gotenberg.dev/) to convert HTML templates to PDF. You can:

- Generate PDFs from any email template
- Attach multiple PDFs to a single email
- Use different variables for each PDF
- Customize PDF filenames

## Prerequisites

### Gotenberg Setup

Gotenberg is included in the Docker Compose setup. Verify it's running:

```bash
docker compose ps | grep gotenberg
```

If not running:

```bash
docker compose up -d gotenberg
```

### Environment Configuration

Ensure `GOTENBERG_URL` is set in your `.env`:

```env
GOTENBERG_URL=http://localhost:3100
```

For Docker Compose deployments, use the service name:

```env
GOTENBERG_URL=http://gotenberg:3000
```

## Method 1: Template Default PDF

Configure a template to always generate a PDF attachment.

### Via Dashboard

1. Open your template in the editor
2. In the template settings, enable **Generate PDF**
3. Set the **PDF Filename** (e.g., `invoice.pdf`)
4. Save the template

### Via API

```bash
curl -X PUT "https://your-domain.com/api/templates/invoice-template" \
  -H "Cookie: session=..." \
  -H "Content-Type: application/json" \
  -d '{
    "generatePdf": true,
    "pdfFilename": "invoice.pdf"
  }'
```

Now every email sent with this template will include a PDF attachment:

```bash
curl -X POST https://your-domain.com/api/v1/send \
  -H "X-API-Key: cnry_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "invoice-template",
    "to": "customer@example.com",
    "variables": {
      "invoiceNumber": "INV-001",
      "amount": "$100.00"
    }
  }'
```

## Method 2: Per-Request PDF Attachments

Generate PDFs on demand using the `pdfAttachments` field.

### Single PDF Attachment

```bash
curl -X POST https://your-domain.com/api/v1/send \
  -H "X-API-Key: cnry_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "order-confirmation-email",
    "to": "customer@example.com",
    "variables": {
      "customerName": "Jane Doe",
      "orderNumber": "ORD-12345"
    },
    "pdfAttachments": [
      {
        "templateId": "invoice-pdf-template",
        "filename": "invoice-ORD-12345.pdf"
      }
    ]
  }'
```

### Multiple PDF Attachments

Attach multiple PDFs to a single email:

```bash
curl -X POST https://your-domain.com/api/v1/send \
  -H "X-API-Key: cnry_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "order-confirmation-email",
    "to": "customer@example.com",
    "variables": {
      "customerName": "Jane Doe",
      "orderNumber": "ORD-12345"
    },
    "pdfAttachments": [
      {
        "templateId": "invoice-pdf-template",
        "filename": "invoice.pdf"
      },
      {
        "templateId": "receipt-pdf-template",
        "filename": "receipt.pdf"
      },
      {
        "templateId": "terms-pdf-template",
        "filename": "terms-and-conditions.pdf"
      }
    ]
  }'
```

### Different Variables per PDF

Each PDF can use different variables:

```bash
curl -X POST https://your-domain.com/api/v1/send \
  -H "X-API-Key: cnry_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "monthly-statement-email",
    "to": "customer@example.com",
    "variables": {
      "customerName": "Jane Doe",
      "month": "January 2024"
    },
    "pdfAttachments": [
      {
        "templateId": "statement-pdf",
        "filename": "statement-january-2024.pdf",
        "variables": {
          "month": "January 2024",
          "transactions": [...],
          "openingBalance": "$1,000.00",
          "closingBalance": "$1,250.00"
        }
      }
    ]
  }'
```

If `variables` is not specified for a PDF attachment, it inherits the email's variables.

## Creating PDF-Optimized Templates

While any email template can be converted to PDF, some design considerations help create better documents:

### Page Layout

- Use a fixed-width container (600-800px works well)
- Avoid horizontal scrolling elements
- Consider A4 or Letter page proportions

### Typography

- Use web-safe fonts or embed fonts
- Ensure adequate font sizes (12-14px minimum for body text)
- Use high contrast colors

### Images

- Use absolute URLs for images
- Ensure images are publicly accessible
- Consider image resolution for print quality

### Content Structure

- Use clear headings and sections
- Include all necessary information (no interactive elements in PDF)
- Add page breaks where appropriate using CSS

### Example Invoice Template Structure

```html
<div style="max-width: 800px; margin: 0 auto; padding: 40px;">
  <!-- Header -->
  <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
    <div>
      <img src="{{logoUrl}}" alt="Company Logo" style="height: 60px;" />
    </div>
    <div style="text-align: right;">
      <h1 style="margin: 0; font-size: 24px;">INVOICE</h1>
      <p style="margin: 5px 0;">{{invoiceNumber}}</p>
      <p style="margin: 5px 0;">{{invoiceDate}}</p>
    </div>
  </div>

  <!-- Bill To -->
  <div style="margin-bottom: 30px;">
    <h3 style="margin-bottom: 10px;">Bill To:</h3>
    <p>{{customerName}}</p>
    <p>{{customerAddress}}</p>
    <p>{{customerEmail}}</p>
  </div>

  <!-- Line Items -->
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
    <thead>
      <tr style="background: #f5f5f5;">
        <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Description</th>
        <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Qty</th>
        <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
        <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
      </tr>
    </thead>
    <tbody>
      {{#each lineItems}}
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">{{this.description}}</td>
        <td style="padding: 10px; text-align: right; border-bottom: 1px solid #eee;">
          {{this.quantity}}
        </td>
        <td style="padding: 10px; text-align: right; border-bottom: 1px solid #eee;">
          {{this.price}}
        </td>
        <td style="padding: 10px; text-align: right; border-bottom: 1px solid #eee;">
          {{this.total}}
        </td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  <!-- Totals -->
  <div style="text-align: right;">
    <p><strong>Subtotal:</strong> {{subtotal}}</p>
    <p><strong>Tax ({{taxRate}}%):</strong> {{taxAmount}}</p>
    <p style="font-size: 18px;"><strong>Total:</strong> {{total}}</p>
  </div>

  <!-- Footer -->
  <div
    style="margin-top: 60px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;"
  >
    <p>Payment due within 30 days. Thank you for your business!</p>
  </div>
</div>
```

## Checking PDF Status

When you send an email with PDF attachments, check the status to confirm PDF generation:

```bash
curl https://your-domain.com/api/v1/eml_abc123/status \
  -H "X-API-Key: cnry_xxx"
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "eml_abc123",
    "status": "delivered",
    "sentAt": "2024-01-20T10:30:00.000Z",
    "hasPdfAttachment": true
  }
}
```

## Error Handling

### PDF Generation Failed

If PDF generation fails, the email send will fail with:

```json
{
  "success": false,
  "error": {
    "code": "PDF_GENERATION_FAILED",
    "message": "Failed to generate PDF attachment"
  }
}
```

Common causes:

- Gotenberg service not running
- Invalid template HTML
- Network connectivity issues

### PDF Not Configured

If Gotenberg is not configured:

```json
{
  "success": false,
  "error": {
    "code": "PDF_NOT_CONFIGURED",
    "message": "PDF generation is not configured. Set GOTENBERG_URL environment variable."
  }
}
```

## Performance Considerations

- PDF generation adds processing time (typically 1-5 seconds per PDF)
- Multiple PDFs are generated sequentially
- Large or complex templates take longer to render
- Consider the total email size when attaching multiple PDFs

## Production Deployment

### Docker Compose

Gotenberg is included in the production Docker Compose:

```yaml
services:
  gotenberg:
    image: gotenberg/gotenberg:8
    restart: unless-stopped
    command:
      - 'gotenberg'
      - '--chromium-disable-javascript=true'
      - '--api-timeout=60s'
```

### Environment Variables

```env
GOTENBERG_URL=http://gotenberg:3000
```

### Health Checks

Monitor Gotenberg health:

```bash
curl http://localhost:3100/health
```

Response: `{"status":"up"}`

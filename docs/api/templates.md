---
title: Templates
layout: default
parent: API Reference
nav_order: 2
---

# Templates API

Manage email templates programmatically. Templates are designed using the visual editor and can be used to send emails via the API.

## Authentication

All template endpoints require session authentication (dashboard API). These endpoints are typically used by the web application.

---

## List Templates

Get a paginated list of templates.

```
GET /api/templates
```

### Query Parameters

| Parameter  | Type    | Default | Description             |
| ---------- | ------- | ------- | ----------------------- |
| `page`     | number  | 1       | Page number (min: 1)    |
| `pageSize` | number  | 20      | Items per page (1-100)  |
| `search`   | string  | -       | Search by name or slug  |
| `isActive` | boolean | -       | Filter by active status |

### Example Request

```bash
curl "https://your-domain.com/api/templates?page=1&pageSize=10&search=welcome" \
  -H "Cookie: session=..."
```

### Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "tpl_abc123",
        "name": "Welcome Email",
        "slug": "welcome-email",
        "description": "Sent to new users after signup",
        "subject": "Welcome to {{company}}!",
        "isActive": true,
        "generatePdf": false,
        "variables": ["company", "name", "loginUrl"],
        "thumbnailUrl": "https://...",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-15T12:00:00.000Z"
      }
    ],
    "total": 25,
    "page": 1,
    "pageSize": 10,
    "totalPages": 3
  }
}
```

---

## Get Template

Get a single template by ID or slug.

```
GET /api/templates/:id
```

### Path Parameters

| Parameter | Type   | Description         |
| --------- | ------ | ------------------- |
| `id`      | string | Template ID or slug |

### Example Request

```bash
curl "https://your-domain.com/api/templates/welcome-email" \
  -H "Cookie: session=..."
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "tpl_abc123",
    "teamId": "team_xyz",
    "name": "Welcome Email",
    "slug": "welcome-email",
    "description": "Sent to new users after signup",
    "subject": "Welcome to {{company}}!",
    "designJson": {
      "root": {
        "type": "EmailLayout",
        "data": { ... }
      }
    },
    "compiledHtml": "<html>...</html>",
    "variables": ["company", "name", "loginUrl"],
    "thumbnailUrl": "https://...",
    "currentVersionId": "ver_123",
    "isActive": true,
    "generatePdf": false,
    "pdfFilename": null,
    "createdBy": "usr_123",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

---

## Create Template

Create a new email template.

```
POST /api/templates
```

### Required Permission

`templates:create`

### Request Body

| Field         | Type    | Required | Description                                              |
| ------------- | ------- | -------- | -------------------------------------------------------- |
| `name`        | string  | Yes      | Template name (1-100 chars)                              |
| `slug`        | string  | No       | URL-friendly identifier (auto-generated if not provided) |
| `description` | string  | No       | Template description (max 500 chars)                     |
| `subject`     | string  | Yes      | Email subject line (supports variables)                  |
| `designJson`  | object  | Yes      | Email builder design JSON                                |
| `generatePdf` | boolean | No       | Enable PDF generation by default                         |
| `pdfFilename` | string  | No       | Default PDF filename                                     |

### Example Request

```bash
curl -X POST "https://your-domain.com/api/templates" \
  -H "Cookie: session=..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Order Confirmation",
    "slug": "order-confirmation",
    "description": "Sent after successful order placement",
    "subject": "Order #{{orderNumber}} Confirmed",
    "designJson": {
      "root": {
        "type": "EmailLayout",
        "data": {
          "backdropColor": "#f5f5f5",
          "canvasColor": "#ffffff",
          "textColor": "#333333",
          "fontFamily": "MODERN_SANS",
          "childrenIds": ["block_1"]
        }
      }
    }
  }'
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "tpl_new123",
    "name": "Order Confirmation",
    "slug": "order-confirmation",
    "subject": "Order #{{orderNumber}} Confirmed",
    "isActive": true,
    "createdAt": "2024-01-20T10:00:00.000Z"
  }
}
```

---

## Update Template

Update an existing template.

```
PUT /api/templates/:id
```

### Required Permission

`templates:update`

### Path Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | string | Template ID |

### Request Body

All fields are optional. Only provided fields will be updated.

| Field         | Type    | Description                          |
| ------------- | ------- | ------------------------------------ |
| `name`        | string  | Template name (1-100 chars)          |
| `slug`        | string  | URL-friendly identifier              |
| `description` | string  | Template description (max 500 chars) |
| `subject`     | string  | Email subject line                   |
| `designJson`  | object  | Email builder design JSON            |
| `isActive`    | boolean | Enable/disable template              |
| `generatePdf` | boolean | Enable PDF generation                |
| `pdfFilename` | string  | Default PDF filename                 |

### Example Request

```bash
curl -X PUT "https://your-domain.com/api/templates/tpl_abc123" \
  -H "Cookie: session=..." \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Your Order #{{orderNumber}} is Confirmed!",
    "isActive": true
  }'
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "tpl_abc123",
    "name": "Order Confirmation",
    "subject": "Your Order #{{orderNumber}} is Confirmed!",
    "isActive": true,
    "updatedAt": "2024-01-20T15:00:00.000Z"
  }
}
```

---

## Delete Template

Delete a template.

```
DELETE /api/templates/:id
```

### Required Permission

`templates:delete`

### Path Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | string | Template ID |

### Example Request

```bash
curl -X DELETE "https://your-domain.com/api/templates/tpl_abc123" \
  -H "Cookie: session=..."
```

### Response

```json
{
  "success": true
}
```

---

## Duplicate Template

Create a copy of an existing template.

```
POST /api/templates/:id/duplicate
```

### Required Permission

`templates:create`

### Path Parameters

| Parameter | Type   | Description              |
| --------- | ------ | ------------------------ |
| `id`      | string | Template ID to duplicate |

### Example Request

```bash
curl -X POST "https://your-domain.com/api/templates/tpl_abc123/duplicate" \
  -H "Cookie: session=..."
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "tpl_copy456",
    "name": "Order Confirmation (Copy)",
    "slug": "order-confirmation-copy",
    "createdAt": "2024-01-20T16:00:00.000Z"
  }
}
```

---

## Template Versions

Templates support versioning to track changes and restore previous states.

### List Versions

```
GET /api/templates/:id/versions
```

### Example Response

```json
{
  "success": true,
  "data": [
    {
      "id": "ver_123",
      "name": "Version 3",
      "createdBy": "usr_abc",
      "createdAt": "2024-01-20T12:00:00.000Z"
    },
    {
      "id": "ver_122",
      "name": "Version 2",
      "createdBy": "usr_abc",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Create Version

Create a snapshot of the current template state.

```
POST /api/templates/:id/versions
```

### Request Body

| Field  | Type   | Required | Description                                   |
| ------ | ------ | -------- | --------------------------------------------- |
| `name` | string | No       | Version name (auto-generated if not provided) |

### Example Request

```bash
curl -X POST "https://your-domain.com/api/templates/tpl_abc123/versions" \
  -H "Cookie: session=..." \
  -H "Content-Type: application/json" \
  -d '{"name": "Before redesign"}'
```

### Restore Version

Restore a template to a previous version.

```
PUT /api/templates/:id/versions/:versionId/restore
```

### Example Request

```bash
curl -X PUT "https://your-domain.com/api/templates/tpl_abc123/versions/ver_122/restore" \
  -H "Cookie: session=..."
```

---

## Preview Template

Preview a template with sample variables.

```
POST /api/templates/:id/preview
```

### Request Body

| Field       | Type   | Required | Description                           |
| ----------- | ------ | -------- | ------------------------------------- |
| `variables` | object | Yes      | Variables to render the template with |

### Example Request

```bash
curl -X POST "https://your-domain.com/api/templates/tpl_abc123/preview" \
  -H "Cookie: session=..." \
  -H "Content-Type: application/json" \
  -d '{
    "variables": {
      "name": "John Doe",
      "orderNumber": "ORD-12345"
    }
  }'
```

### Response

```json
{
  "success": true,
  "data": {
    "html": "<html>...</html>",
    "subject": "Your Order #ORD-12345 is Confirmed!"
  }
}
```

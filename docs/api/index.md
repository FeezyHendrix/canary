---
title: API Reference
layout: default
nav_order: 2
has_children: true
---

# API Overview

The Canary API provides programmatic access to send emails, manage templates, configure email providers, and more.

## Base URL

```
https://your-domain.com
```

For local development:

```
http://localhost:3001
```

## Authentication

### API Key Authentication

For programmatic access, use API key authentication. Include your API key in the `X-API-Key` header:

```bash
curl -X POST https://your-domain.com/api/v1/send \
  -H "X-API-Key: cnry_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{"templateId": "welcome", "to": "user@example.com"}'
```

API keys are prefixed with `cnry_` and can be created in the dashboard under **Settings > API Keys**.

### API Key Scopes

API keys can be restricted to specific scopes:

| Scope             | Description                    |
| ----------------- | ------------------------------ |
| `send`            | Send emails via the API        |
| `templates:read`  | Read template information      |
| `templates:write` | Create and modify templates    |
| `logs:read`       | Read email logs and statistics |

### Session Authentication

The dashboard API uses session-based authentication via cookies. This is used by the web application and supports OAuth login via Google and GitHub.

## Rate Limiting

API keys can have rate limits configured (1-10,000 requests per minute). When rate limited, the API returns a `429 Too Many Requests` response.

## Request Format

All request bodies should be JSON with the `Content-Type: application/json` header.

```bash
curl -X POST https://your-domain.com/api/v1/send \
  -H "X-API-Key: cnry_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "welcome-email",
    "to": "user@example.com",
    "variables": {
      "name": "John"
    }
  }'
```

## Response Format

All responses are JSON with a consistent structure.

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "data": {
    "items": [],
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

## Error Codes

| Code                    | HTTP Status | Description                       |
| ----------------------- | ----------- | --------------------------------- |
| `UNAUTHORIZED`          | 401         | Missing or invalid authentication |
| `FORBIDDEN`             | 403         | Insufficient permissions          |
| `INVALID_TOKEN`         | 401         | Invalid API key                   |
| `TOKEN_EXPIRED`         | 401         | API key has expired               |
| `VALIDATION_ERROR`      | 400         | Request validation failed         |
| `INVALID_INPUT`         | 400         | Invalid input data                |
| `NOT_FOUND`             | 404         | Resource not found                |
| `ALREADY_EXISTS`        | 409         | Resource already exists           |
| `CONFLICT`              | 409         | Conflict with existing resource   |
| `RATE_LIMITED`          | 429         | Rate limit exceeded               |
| `INTERNAL_ERROR`        | 500         | Internal server error             |
| `SERVICE_UNAVAILABLE`   | 503         | Service temporarily unavailable   |
| `SEND_FAILED`           | 500         | Email sending failed              |
| `INVALID_TEMPLATE`      | 400         | Template not found or invalid     |
| `ADAPTER_ERROR`         | 500         | Email adapter error               |
| `S3_NOT_CONFIGURED`     | 500         | S3 storage not configured         |
| `INVALID_FILE_TYPE`     | 400         | Invalid file type for upload      |
| `FILE_TOO_LARGE`        | 400         | File exceeds size limit           |
| `PDF_NOT_CONFIGURED`    | 500         | Gotenberg not configured          |
| `PDF_GENERATION_FAILED` | 500         | PDF generation failed             |

## API Endpoints

### Public API (API Key Required)

These endpoints require the `X-API-Key` header:

| Method | Endpoint             | Description                                 |
| ------ | -------------------- | ------------------------------------------- |
| POST   | `/api/v1/send`       | [Send an email](emails#send-email)          |
| GET    | `/api/v1/:id/status` | [Get email status](emails#get-email-status) |

### Dashboard API (Session Required)

These endpoints require session authentication:

**Templates**

- `GET /api/templates` - [List templates](templates#list-templates)
- `POST /api/templates` - [Create template](templates#create-template)
- `GET /api/templates/:id` - [Get template](templates#get-template)
- `PUT /api/templates/:id` - [Update template](templates#update-template)
- `DELETE /api/templates/:id` - [Delete template](templates#delete-template)

**Email Logs**

- `GET /api/logs` - [List email logs](logs#list-email-logs)
- `GET /api/logs/stats` - [Get email statistics](logs#get-email-statistics)
- `GET /api/logs/:id` - [Get email log](logs#get-email-log)
- `POST /api/logs/:id/resend` - [Resend failed email](logs#resend-email)

**Adapters**

- `GET /api/adapters` - [List adapters](adapters#list-adapters)
- `POST /api/adapters` - [Create adapter](adapters#create-adapter)
- `GET /api/adapters/:id` - [Get adapter](adapters#get-adapter)
- `PUT /api/adapters/:id` - [Update adapter](adapters#update-adapter)
- `DELETE /api/adapters/:id` - [Delete adapter](adapters#delete-adapter)

**API Keys**

- `GET /api/api-keys` - [List API keys](api-keys#list-api-keys)
- `POST /api/api-keys` - [Create API key](api-keys#create-api-key)
- `DELETE /api/api-keys/:id` - [Delete API key](api-keys#delete-api-key)

**Webhooks**

- `GET /api/webhooks` - [List webhooks](webhooks#list-webhooks)
- `POST /api/webhooks` - [Create webhook](webhooks#create-webhook)
- `PUT /api/webhooks/:id` - [Update webhook](webhooks#update-webhook)
- `DELETE /api/webhooks/:id` - [Delete webhook](webhooks#delete-webhook)

## OpenAPI / Swagger

Interactive API documentation is available at `/docs` when running the API server:

- Development: [http://localhost:3001/docs](http://localhost:3001/docs)
- Production: `https://your-domain.com/docs`

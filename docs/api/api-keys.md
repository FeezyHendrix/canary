---
title: API Keys
layout: default
parent: API Reference
nav_order: 5
---

# API Keys Management

Create and manage API keys for programmatic access to the Canary API. API keys allow external applications to send emails and access resources without user session authentication.

## Authentication

All API key management endpoints require session authentication (dashboard API).

---

## API Key Format

API keys are prefixed with `cnry_` followed by a random string:

```
cnry_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

The full key is only shown once when created. After that, only the prefix (`cnry_a1b2c3`) is visible.

---

## API Key Scopes

Restrict what actions an API key can perform:

| Scope             | Description                       |
| ----------------- | --------------------------------- |
| `send`            | Send emails via POST /api/v1/send |
| `templates:read`  | Read template information         |
| `templates:write` | Create and modify templates       |
| `logs:read`       | Read email logs and statistics    |

If no scopes are specified, the key defaults to `send` only.

---

## List API Keys

Get all API keys for the current team.

```
GET /api/api-keys
```

### Required Permission

`api-keys:view`

### Example Request

```bash
curl "https://your-domain.com/api/api-keys" \
  -H "Cookie: session=..."
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "key_abc123",
      "name": "Production API Key",
      "keyPrefix": "cnry_a1b",
      "scopes": ["send"],
      "rateLimit": 1000,
      "expiresAt": null,
      "lastUsedAt": "2024-01-20T15:30:00.000Z",
      "isActive": true,
      "createdBy": "usr_xyz",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "key_def456",
      "name": "Development Key",
      "keyPrefix": "cnry_b2c",
      "scopes": ["send", "templates:read"],
      "rateLimit": 100,
      "expiresAt": "2024-12-31T23:59:59.000Z",
      "lastUsedAt": null,
      "isActive": true,
      "createdBy": "usr_xyz",
      "createdAt": "2024-01-15T00:00:00.000Z"
    }
  ]
}
```

---

## Get API Key

Get a single API key by ID.

```
GET /api/api-keys/:id
```

### Required Permission

`api-keys:view`

### Path Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | string | API key ID  |

### Example Request

```bash
curl "https://your-domain.com/api/api-keys/key_abc123" \
  -H "Cookie: session=..."
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "key_abc123",
    "name": "Production API Key",
    "keyPrefix": "cnry_a1b",
    "scopes": ["send"],
    "rateLimit": 1000,
    "expiresAt": null,
    "lastUsedAt": "2024-01-20T15:30:00.000Z",
    "isActive": true,
    "createdBy": "usr_xyz",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Create API Key

Create a new API key.

```
POST /api/api-keys
```

### Required Permission

`api-keys:create`

### Request Body

| Field       | Type     | Required | Description                             |
| ----------- | -------- | -------- | --------------------------------------- |
| `name`      | string   | Yes      | Key name (1-100 chars)                  |
| `scopes`    | string[] | No       | Allowed scopes (defaults to `["send"]`) |
| `rateLimit` | number   | No       | Requests per minute (1-10,000)          |
| `expiresAt` | string   | No       | Expiration date (ISO 8601)              |

### Example Request

```bash
curl -X POST "https://your-domain.com/api/api-keys" \
  -H "Cookie: session=..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production API Key",
    "scopes": ["send", "logs:read"],
    "rateLimit": 1000
  }'
```

### Response

The full API key is only returned in this response. Save it securely - it cannot be retrieved later.

```json
{
  "success": true,
  "data": {
    "id": "key_new789",
    "name": "Production API Key",
    "key": "cnry_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    "keyPrefix": "cnry_a1b",
    "scopes": ["send", "logs:read"],
    "rateLimit": 1000,
    "expiresAt": null,
    "isActive": true,
    "createdBy": "usr_xyz",
    "createdAt": "2024-01-20T10:00:00.000Z"
  }
}
```

{: .warning }

> Save the `key` value immediately - it will not be shown again. If lost, you must regenerate the key.

### Example with Expiration

```bash
curl -X POST "https://your-domain.com/api/api-keys" \
  -H "Cookie: session=..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Temporary Integration Key",
    "scopes": ["send"],
    "rateLimit": 500,
    "expiresAt": "2024-06-30T23:59:59.000Z"
  }'
```

---

## Update API Key

Update an existing API key.

```
PUT /api/api-keys/:id
```

### Required Permission

`api-keys:create`

### Path Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | string | API key ID  |

### Request Body

All fields are optional. Only provided fields will be updated.

| Field       | Type     | Description                    |
| ----------- | -------- | ------------------------------ |
| `name`      | string   | Key name (1-100 chars)         |
| `scopes`    | string[] | Allowed scopes                 |
| `rateLimit` | number   | Requests per minute (1-10,000) |
| `isActive`  | boolean  | Enable/disable the key         |

### Example Request

```bash
curl -X PUT "https://your-domain.com/api/api-keys/key_abc123" \
  -H "Cookie: session=..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production API Key (Updated)",
    "rateLimit": 2000,
    "isActive": true
  }'
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "key_abc123",
    "name": "Production API Key (Updated)",
    "keyPrefix": "cnry_a1b",
    "scopes": ["send"],
    "rateLimit": 2000,
    "isActive": true,
    "updatedAt": "2024-01-20T15:00:00.000Z"
  }
}
```

---

## Delete API Key

Permanently delete an API key.

```
DELETE /api/api-keys/:id
```

### Required Permission

`api-keys:delete`

### Path Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | string | API key ID  |

### Example Request

```bash
curl -X DELETE "https://your-domain.com/api/api-keys/key_abc123" \
  -H "Cookie: session=..."
```

### Response

```json
{
  "success": true
}
```

---

## Regenerate API Key

Generate a new key value for an existing API key. The old key immediately stops working.

```
POST /api/api-keys/:id/regenerate
```

### Required Permission

`api-keys:create`

### Path Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | string | API key ID  |

### Example Request

```bash
curl -X POST "https://your-domain.com/api/api-keys/key_abc123/regenerate" \
  -H "Cookie: session=..."
```

### Response

The new key is only returned in this response.

```json
{
  "success": true,
  "data": {
    "id": "key_abc123",
    "name": "Production API Key",
    "key": "cnry_x9y8z7w6v5u4t3s2r1q0p9o8n7m6l5k4",
    "keyPrefix": "cnry_x9y",
    "scopes": ["send"],
    "rateLimit": 1000,
    "isActive": true
  }
}
```

{: .warning }

> The previous key is invalidated immediately. Update all applications using this key.

---

## Using API Keys

Include the API key in the `X-API-Key` header:

```bash
curl -X POST "https://your-domain.com/api/v1/send" \
  -H "X-API-Key: cnry_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "welcome",
    "to": "user@example.com"
  }'
```

### Rate Limiting

When the rate limit is exceeded, the API returns:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Rate limit exceeded. Try again later."
  }
}
```

HTTP Status: `429 Too Many Requests`

### Expired Keys

When using an expired key:

```json
{
  "success": false,
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "API key has expired"
  }
}
```

HTTP Status: `401 Unauthorized`

---

## Best Practices

1. **Use separate keys** - Create different keys for development, staging, and production
2. **Limit scopes** - Only grant the scopes each integration actually needs
3. **Set rate limits** - Protect against runaway scripts or abuse
4. **Use expiration** - Set expiration dates for temporary integrations
5. **Rotate regularly** - Regenerate keys periodically for security
6. **Monitor usage** - Check `lastUsedAt` to identify unused keys
7. **Secure storage** - Store keys in environment variables or secret managers, never in code

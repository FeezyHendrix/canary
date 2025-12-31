---
title: Adapters
layout: default
parent: API Reference
nav_order: 3
---

# Adapters API

Configure email provider adapters to send emails through your preferred service. Canary supports multiple email providers and can be configured with different adapters per team.

## Supported Providers

| Provider   | Type       | Description                            |
| ---------- | ---------- | -------------------------------------- |
| SendGrid   | `sendgrid` | Twilio SendGrid email delivery service |
| Resend     | `resend`   | Modern email API built for developers  |
| Mailgun    | `mailgun`  | Powerful email delivery by Mailgun     |
| Amazon SES | `ses`      | Amazon Simple Email Service            |
| Postmark   | `postmark` | Transactional email service by Wildbit |
| SMTP       | `smtp`     | Generic SMTP server connection         |

## Authentication

All adapter endpoints require session authentication (dashboard API).

---

## Get Available Adapter Types

Get information about all supported adapter types and their configuration requirements.

```
GET /api/adapters/types
```

### Example Request

```bash
curl "https://your-domain.com/api/adapters/types"
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "type": "sendgrid",
      "name": "SendGrid",
      "description": "Twilio SendGrid email delivery service",
      "configFields": [
        {
          "name": "apiKey",
          "label": "API Key",
          "type": "password",
          "required": true,
          "placeholder": "SG.xxxx"
        }
      ]
    },
    {
      "type": "resend",
      "name": "Resend",
      "description": "Modern email API built for developers",
      "configFields": [
        {
          "name": "apiKey",
          "label": "API Key",
          "type": "password",
          "required": true,
          "placeholder": "re_xxxx"
        }
      ]
    }
  ]
}
```

---

## List Adapters

Get all configured adapters for the current team.

```
GET /api/adapters
```

### Example Request

```bash
curl "https://your-domain.com/api/adapters" \
  -H "Cookie: session=..."
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "adp_abc123",
      "name": "Production SendGrid",
      "type": "sendgrid",
      "defaultFrom": "noreply@example.com",
      "isDefault": true,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T12:00:00.000Z"
    }
  ]
}
```

---

## Get Adapter

Get a single adapter with its decrypted configuration.

```
GET /api/adapters/:id
```

### Required Permission

`adapters:view-config`

### Path Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | string | Adapter ID  |

### Example Request

```bash
curl "https://your-domain.com/api/adapters/adp_abc123" \
  -H "Cookie: session=..."
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "adp_abc123",
    "name": "Production SendGrid",
    "type": "sendgrid",
    "config": {
      "apiKey": "SG.xxxx..."
    },
    "defaultFrom": "noreply@example.com",
    "isDefault": true,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

---

## Create Adapter

Create a new email adapter.

```
POST /api/adapters
```

### Required Permission

`adapters:create`

### Request Body

| Field         | Type    | Required | Description                            |
| ------------- | ------- | -------- | -------------------------------------- |
| `name`        | string  | Yes      | Adapter name (1-100 chars)             |
| `type`        | string  | Yes      | Adapter type (see supported providers) |
| `config`      | object  | Yes      | Provider-specific configuration        |
| `defaultFrom` | string  | No       | Default sender email address           |
| `isDefault`   | boolean | No       | Set as team's default adapter          |

### Configuration by Provider

#### SendGrid

```json
{
  "name": "SendGrid Production",
  "type": "sendgrid",
  "config": {
    "apiKey": "SG.xxxxxxxxxxxxxxxxxxxx"
  },
  "defaultFrom": "noreply@example.com",
  "isDefault": true
}
```

#### Resend

```json
{
  "name": "Resend Production",
  "type": "resend",
  "config": {
    "apiKey": "re_xxxxxxxxxxxxxxxxxxxx"
  },
  "defaultFrom": "noreply@example.com"
}
```

#### Mailgun

```json
{
  "name": "Mailgun Production",
  "type": "mailgun",
  "config": {
    "apiKey": "key-xxxxxxxxxxxxxxxxxxxx",
    "domain": "mg.example.com",
    "region": "us"
  },
  "defaultFrom": "noreply@mg.example.com"
}
```

| Field    | Type   | Required | Description             |
| -------- | ------ | -------- | ----------------------- |
| `apiKey` | string | Yes      | Mailgun API key         |
| `domain` | string | Yes      | Verified sending domain |
| `region` | string | No       | `us` (default) or `eu`  |

#### Amazon SES

```json
{
  "name": "AWS SES Production",
  "type": "ses",
  "config": {
    "accessKeyId": "AKIAXXXXXXXXXXXXXXXX",
    "secretAccessKey": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "region": "us-east-1"
  },
  "defaultFrom": "noreply@example.com"
}
```

| Field             | Type   | Required | Description                                                                            |
| ----------------- | ------ | -------- | -------------------------------------------------------------------------------------- |
| `accessKeyId`     | string | Yes      | AWS access key ID                                                                      |
| `secretAccessKey` | string | Yes      | AWS secret access key                                                                  |
| `region`          | string | Yes      | AWS region (us-east-1, us-west-2, eu-west-1, eu-central-1, ap-south-1, ap-southeast-2) |

#### Postmark

```json
{
  "name": "Postmark Production",
  "type": "postmark",
  "config": {
    "serverToken": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  },
  "defaultFrom": "noreply@example.com"
}
```

#### SMTP

```json
{
  "name": "Custom SMTP",
  "type": "smtp",
  "config": {
    "host": "smtp.example.com",
    "port": 587,
    "secure": false,
    "username": "smtp_user",
    "password": "smtp_password"
  },
  "defaultFrom": "noreply@example.com"
}
```

| Field      | Type    | Required | Description                           |
| ---------- | ------- | -------- | ------------------------------------- |
| `host`     | string  | Yes      | SMTP server hostname                  |
| `port`     | number  | Yes      | SMTP port (typically 25, 465, or 587) |
| `secure`   | boolean | No       | Use SSL/TLS (true for port 465)       |
| `username` | string  | No       | SMTP authentication username          |
| `password` | string  | No       | SMTP authentication password          |

### Example Request

```bash
curl -X POST "https://your-domain.com/api/adapters" \
  -H "Cookie: session=..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production SendGrid",
    "type": "sendgrid",
    "config": {
      "apiKey": "SG.xxxx"
    },
    "defaultFrom": "noreply@example.com",
    "isDefault": true
  }'
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "adp_new123",
    "name": "Production SendGrid",
    "type": "sendgrid",
    "defaultFrom": "noreply@example.com",
    "isDefault": true,
    "isActive": true,
    "createdAt": "2024-01-20T10:00:00.000Z"
  }
}
```

---

## Update Adapter

Update an existing adapter.

```
PUT /api/adapters/:id
```

### Required Permission

`adapters:update`

### Path Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | string | Adapter ID  |

### Request Body

All fields are optional. Only provided fields will be updated.

| Field         | Type    | Description                     |
| ------------- | ------- | ------------------------------- |
| `name`        | string  | Adapter name (1-100 chars)      |
| `config`      | object  | Provider-specific configuration |
| `defaultFrom` | string  | Default sender email address    |
| `isDefault`   | boolean | Set as team's default adapter   |
| `isActive`    | boolean | Enable/disable adapter          |

### Example Request

```bash
curl -X PUT "https://your-domain.com/api/adapters/adp_abc123" \
  -H "Cookie: session=..." \
  -H "Content-Type: application/json" \
  -d '{
    "defaultFrom": "hello@example.com",
    "isActive": true
  }'
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "adp_abc123",
    "name": "Production SendGrid",
    "defaultFrom": "hello@example.com",
    "isActive": true,
    "updatedAt": "2024-01-20T15:00:00.000Z"
  }
}
```

---

## Delete Adapter

Delete an adapter.

```
DELETE /api/adapters/:id
```

### Required Permission

`adapters:delete`

### Path Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | string | Adapter ID  |

### Example Request

```bash
curl -X DELETE "https://your-domain.com/api/adapters/adp_abc123" \
  -H "Cookie: session=..."
```

### Response

```json
{
  "success": true
}
```

---

## Test Adapter Connection

Test that an adapter is properly configured and can connect to the email provider.

```
POST /api/adapters/:id/test
```

### Required Permission

`adapters:update`

### Path Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | string | Adapter ID  |

### Example Request

```bash
curl -X POST "https://your-domain.com/api/adapters/adp_abc123/test" \
  -H "Cookie: session=..."
```

### Success Response

```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Connection successful"
  }
}
```

### Failure Response

```json
{
  "success": true,
  "data": {
    "success": false,
    "message": "Invalid API key"
  }
}
```

---

## Security Notes

- Adapter configurations are encrypted at rest using AES-256 encryption
- API keys and secrets are only returned when explicitly fetching a single adapter with proper permissions
- List endpoints do not return sensitive configuration data
- Always use HTTPS in production to protect credentials in transit

---
title: Email Logs
layout: default
parent: API Reference
nav_order: 6
---

# Email Logs API

View email logs, check delivery statistics, and resend failed emails. The logs API provides visibility into all emails sent through Canary.

## Authentication

All log endpoints require session authentication (dashboard API) with the `logs:view` permission.

---

## List Email Logs

Get a paginated list of email logs with filtering options.

```
GET /api/logs
```

### Required Permission

`logs:view`

### Query Parameters

| Parameter    | Type    | Default | Description                              |
| ------------ | ------- | ------- | ---------------------------------------- |
| `page`       | number  | 1       | Page number (min: 1)                     |
| `pageSize`   | number  | 20      | Items per page (1-100)                   |
| `status`     | string  | -       | Filter by status (see Email Statuses)   |
| `templateId` | string  | -       | Filter by template ID                   |
| `from`       | string  | -       | Start date filter (ISO 8601)            |
| `to`         | string  | -       | End date filter (ISO 8601)              |
| `search`     | string  | -       | Search in recipient addresses or subject |

### Email Statuses

| Status      | Description                              |
| ----------- | ---------------------------------------- |
| `queued`    | Email is queued for sending              |
| `sent`      | Email was sent to the email provider     |
| `delivered` | Email was delivered to recipient         |
| `opened`    | Recipient opened the email               |
| `clicked`   | Recipient clicked a link in the email    |
| `bounced`   | Email bounced (invalid address)          |
| `failed`    | Sending failed                           |
| `spam`      | Email was marked as spam                 |

### Example Request

```bash
curl "https://your-domain.com/api/logs?page=1&pageSize=20&status=delivered" \
  -H "Cookie: session=..."
```

### Example with Date Range

```bash
# Get logs from the last 7 days
curl "https://your-domain.com/api/logs?from=2024-01-13T00:00:00Z&to=2024-01-20T23:59:59Z" \
  -H "Cookie: session=..."
```

### Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "eml_abc123",
        "templateId": "tpl_xyz789",
        "templateName": "Welcome Email",
        "toAddresses": ["user@example.com"],
        "subject": "Welcome to Our Service!",
        "status": "delivered",
        "createdAt": "2024-01-20T10:30:00.000Z",
        "sentAt": "2024-01-20T10:30:05.000Z"
      }
    ],
    "total": 150,
    "page": 1,
    "pageSize": 20,
    "totalPages": 8
  }
}
```

---

## Get Email Log

Get detailed information about a specific email log.

```
GET /api/logs/:id
```

### Required Permission

`logs:view`

### Path Parameters

| Parameter | Type   | Description  |
| --------- | ------ | ------------ |
| `id`      | string | Email log ID |

### Example Request

```bash
curl "https://your-domain.com/api/logs/eml_abc123" \
  -H "Cookie: session=..."
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "eml_abc123",
    "teamId": "team_xyz",
    "templateId": "tpl_xyz789",
    "templateVersionId": "ver_456",
    "adapterId": "adp_789",
    "apiKeyId": "key_abc",
    "toAddresses": ["user@example.com"],
    "fromAddress": "noreply@example.com",
    "subject": "Welcome to Our Service!",
    "variables": {
      "name": "John",
      "company": "Acme Inc"
    },
    "status": "delivered",
    "providerMessageId": "msg_provider_123",
    "errorMessage": null,
    "hasPdfAttachment": false,
    "jobId": "job_xyz",
    "createdAt": "2024-01-20T10:30:00.000Z",
    "sentAt": "2024-01-20T10:30:05.000Z",
    "deliveredAt": "2024-01-20T10:30:10.000Z"
  }
}
```

### Response Fields

| Field               | Type     | Description                                  |
| ------------------- | -------- | -------------------------------------------- |
| `id`                | string   | Unique email log ID                          |
| `teamId`            | string   | Team that sent the email                     |
| `templateId`        | string   | Template used (null if template deleted)     |
| `templateVersionId` | string   | Specific template version used               |
| `adapterId`         | string   | Email adapter used to send                   |
| `apiKeyId`          | string   | API key used (null if sent via dashboard)    |
| `toAddresses`       | string[] | Recipient email addresses                    |
| `fromAddress`       | string   | Sender email address                         |
| `subject`           | string   | Email subject (with variables rendered)      |
| `variables`         | object   | Variables passed when sending                |
| `status`            | string   | Current delivery status                      |
| `providerMessageId` | string   | Message ID from email provider               |
| `errorMessage`      | string   | Error message (if failed or bounced)         |
| `hasPdfAttachment`  | boolean  | Whether email included a PDF attachment      |
| `jobId`             | string   | Background job ID                            |
| `createdAt`         | string   | When the email was queued                    |
| `sentAt`            | string   | When the email was sent to provider          |
| `deliveredAt`       | string   | When delivery was confirmed                  |

---

## Get Email Statistics

Get aggregated statistics about email delivery.

```
GET /api/logs/stats
```

### Required Permission

`logs:view`

### Query Parameters

| Parameter | Type   | Description                    |
| --------- | ------ | ------------------------------ |
| `from`    | string | Start date filter (ISO 8601)   |
| `to`      | string | End date filter (ISO 8601)     |

### Example Request

```bash
# Get stats for the last 30 days
curl "https://your-domain.com/api/logs/stats?from=2023-12-21T00:00:00Z&to=2024-01-20T23:59:59Z" \
  -H "Cookie: session=..."
```

### Response

```json
{
  "success": true,
  "data": {
    "total": 1500,
    "queued": 5,
    "sent": 20,
    "delivered": 1350,
    "opened": 890,
    "clicked": 320,
    "bounced": 45,
    "failed": 75,
    "spam": 5
  }
}
```

### Response Fields

| Field       | Type   | Description                           |
| ----------- | ------ | ------------------------------------- |
| `total`     | number | Total emails in the period            |
| `queued`    | number | Emails currently in queue             |
| `sent`      | number | Emails sent but not yet delivered     |
| `delivered` | number | Successfully delivered emails         |
| `opened`    | number | Emails that were opened               |
| `clicked`   | number | Emails with clicked links             |
| `bounced`   | number | Bounced emails                        |
| `failed`    | number | Failed to send                        |
| `spam`      | number | Marked as spam                        |

---

## Resend Email

Resend a failed or bounced email. Creates a new email log entry.

```
POST /api/logs/:id/resend
```

### Required Permission

`logs:resend`

### Path Parameters

| Parameter | Type   | Description  |
| --------- | ------ | ------------ |
| `id`      | string | Email log ID |

### Constraints

- Only emails with status `failed` or `bounced` can be resent
- The original template must still exist

### Example Request

```bash
curl -X POST "https://your-domain.com/api/logs/eml_abc123/resend" \
  -H "Cookie: session=..."
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "eml_new456",
    "jobId": "job_xyz789",
    "status": "queued"
  }
}
```

### Error Responses

**Cannot Resend (400)**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Only failed or bounced emails can be resent"
  }
}
```

**Template Deleted (400)**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Original template no longer exists"
  }
}
```

---

## Time Range Filtering

The dashboard provides preset time range filters for common use cases:

| Preset        | Description                      |
| ------------- | -------------------------------- |
| Today         | Emails from today                |
| Last 7 Days   | Emails from the past week        |
| Last 30 Days  | Emails from the past month       |
| Custom        | Specify custom from/to dates     |

### Example: Today's Logs

```bash
# Get today's date in ISO format
TODAY=$(date -u +%Y-%m-%dT00:00:00Z)
TOMORROW=$(date -u -d tomorrow +%Y-%m-%dT00:00:00Z)

curl "https://your-domain.com/api/logs?from=$TODAY&to=$TOMORROW" \
  -H "Cookie: session=..."
```

### Example: Last 7 Days

```bash
# Get date 7 days ago
WEEK_AGO=$(date -u -d '7 days ago' +%Y-%m-%dT00:00:00Z)
NOW=$(date -u +%Y-%m-%dT23:59:59Z)

curl "https://your-domain.com/api/logs?from=$WEEK_AGO&to=$NOW" \
  -H "Cookie: session=..."
```

---

## Permissions

| Permission    | Description                               |
| ------------- | ----------------------------------------- |
| `logs:view`   | View email logs and statistics            |
| `logs:resend` | Resend failed or bounced emails           |

These permissions can be granted via team role settings in the dashboard.

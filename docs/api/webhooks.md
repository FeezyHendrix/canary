---
title: Webhooks
layout: default
parent: API Reference
nav_order: 4
---

# Webhooks API

Receive real-time notifications when email events occur. Configure webhook endpoints to track email delivery, opens, clicks, bounces, and more.

## Authentication

All webhook endpoints require session authentication (dashboard API).

---

## Webhook Events

Subscribe to any combination of these events:

| Event             | Description                                     |
| ----------------- | ----------------------------------------------- |
| `email.queued`    | Email has been added to the send queue          |
| `email.sent`      | Email was sent to the email provider            |
| `email.delivered` | Email was delivered to the recipient's mailbox  |
| `email.opened`    | Recipient opened the email                      |
| `email.clicked`   | Recipient clicked a link in the email           |
| `email.bounced`   | Email bounced (invalid address or mailbox full) |
| `email.failed`    | Email failed to send                            |
| `email.spam`      | Email was marked as spam by the recipient       |

---

## Webhook Payload

When an event occurs, Canary sends a POST request to your webhook URL with the following payload:

```json
{
  "event": "email.delivered",
  "timestamp": "2024-01-20T15:30:00.000Z",
  "data": {
    "emailId": "eml_abc123",
    "templateId": "tpl_xyz789",
    "to": ["user@example.com"],
    "subject": "Welcome to Our Service",
    "status": "delivered"
  }
}
```

### Payload Fields

| Field             | Type     | Description                                   |
| ----------------- | -------- | --------------------------------------------- |
| `event`           | string   | The event type that triggered the webhook     |
| `timestamp`       | string   | ISO 8601 timestamp of when the event occurred |
| `data.emailId`    | string   | Unique identifier for the email               |
| `data.templateId` | string   | Template ID used (if applicable)              |
| `data.to`         | string[] | Recipient email addresses                     |
| `data.subject`    | string   | Email subject line                            |
| `data.status`     | string   | Current email status                          |
| `data.error`      | string   | Error message (only for failed events)        |

### Example Payloads

**Email Sent**

```json
{
  "event": "email.sent",
  "timestamp": "2024-01-20T15:30:00.000Z",
  "data": {
    "emailId": "eml_abc123",
    "templateId": "tpl_welcome",
    "to": ["user@example.com"],
    "subject": "Welcome!",
    "status": "sent"
  }
}
```

**Email Failed**

```json
{
  "event": "email.failed",
  "timestamp": "2024-01-20T15:30:05.000Z",
  "data": {
    "emailId": "eml_abc123",
    "templateId": "tpl_welcome",
    "to": ["invalid@nonexistent.com"],
    "subject": "Welcome!",
    "status": "failed",
    "error": "Recipient address rejected: User unknown"
  }
}
```

**Email Bounced**

```json
{
  "event": "email.bounced",
  "timestamp": "2024-01-20T15:35:00.000Z",
  "data": {
    "emailId": "eml_abc123",
    "templateId": "tpl_welcome",
    "to": ["bounced@example.com"],
    "subject": "Welcome!",
    "status": "bounced",
    "error": "Mailbox not found"
  }
}
```

---

## List Webhooks

Get all webhooks for the current team.

```
GET /api/webhooks
```

### Required Permission

`webhooks:create`

### Example Request

```bash
curl "https://your-domain.com/api/webhooks" \
  -H "Cookie: session=..."
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "whk_abc123",
      "name": "Production Webhook",
      "url": "https://api.example.com/webhooks/canary",
      "events": ["email.sent", "email.delivered", "email.bounced", "email.failed"],
      "isActive": true,
      "lastTriggeredAt": "2024-01-20T15:30:00.000Z",
      "lastSuccessAt": "2024-01-20T15:30:00.000Z",
      "consecutiveFailures": 0,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T12:00:00.000Z"
    }
  ]
}
```

---

## Get Webhook

Get a single webhook by ID.

```
GET /api/webhooks/:id
```

### Required Permission

`webhooks:create`

### Path Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | string | Webhook ID  |

### Example Request

```bash
curl "https://your-domain.com/api/webhooks/whk_abc123" \
  -H "Cookie: session=..."
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "whk_abc123",
    "name": "Production Webhook",
    "url": "https://api.example.com/webhooks/canary",
    "events": ["email.sent", "email.delivered", "email.bounced", "email.failed"],
    "isActive": true,
    "lastTriggeredAt": "2024-01-20T15:30:00.000Z",
    "lastSuccessAt": "2024-01-20T15:30:00.000Z",
    "consecutiveFailures": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

---

## Create Webhook

Create a new webhook endpoint.

```
POST /api/webhooks
```

### Required Permission

`webhooks:create`

### Request Body

| Field    | Type     | Required | Description                                        |
| -------- | -------- | -------- | -------------------------------------------------- |
| `name`   | string   | Yes      | Webhook name (1-100 chars)                         |
| `url`    | string   | Yes      | Webhook endpoint URL (must be HTTPS in production) |
| `events` | string[] | Yes      | Array of events to subscribe to                    |

### Example Request

```bash
curl -X POST "https://your-domain.com/api/webhooks" \
  -H "Cookie: session=..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production Webhook",
    "url": "https://api.example.com/webhooks/canary",
    "events": ["email.sent", "email.delivered", "email.bounced", "email.failed"]
  }'
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "whk_new123",
    "name": "Production Webhook",
    "url": "https://api.example.com/webhooks/canary",
    "events": ["email.sent", "email.delivered", "email.bounced", "email.failed"],
    "isActive": true,
    "consecutiveFailures": 0,
    "createdAt": "2024-01-20T10:00:00.000Z"
  }
}
```

---

## Update Webhook

Update an existing webhook.

```
PUT /api/webhooks/:id
```

### Required Permission

`webhooks:update`

### Path Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | string | Webhook ID  |

### Request Body

All fields are optional. Only provided fields will be updated.

| Field      | Type     | Description                     |
| ---------- | -------- | ------------------------------- |
| `name`     | string   | Webhook name (1-100 chars)      |
| `url`      | string   | Webhook endpoint URL            |
| `events`   | string[] | Array of events to subscribe to |
| `isActive` | boolean  | Enable/disable webhook          |

### Example Request

```bash
curl -X PUT "https://your-domain.com/api/webhooks/whk_abc123" \
  -H "Cookie: session=..." \
  -H "Content-Type: application/json" \
  -d '{
    "events": ["email.sent", "email.delivered", "email.opened", "email.clicked", "email.bounced", "email.failed"],
    "isActive": true
  }'
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "whk_abc123",
    "name": "Production Webhook",
    "url": "https://api.example.com/webhooks/canary",
    "events": [
      "email.sent",
      "email.delivered",
      "email.opened",
      "email.clicked",
      "email.bounced",
      "email.failed"
    ],
    "isActive": true,
    "updatedAt": "2024-01-20T15:00:00.000Z"
  }
}
```

---

## Delete Webhook

Delete a webhook.

```
DELETE /api/webhooks/:id
```

### Required Permission

`webhooks:delete`

### Path Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | string | Webhook ID  |

### Example Request

```bash
curl -X DELETE "https://your-domain.com/api/webhooks/whk_abc123" \
  -H "Cookie: session=..."
```

### Response

```json
{
  "success": true
}
```

---

## List Webhook Deliveries

Get the delivery history for a webhook.

```
GET /api/webhooks/:id/deliveries
```

### Required Permission

`webhooks:create`

### Path Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | string | Webhook ID  |

### Example Request

```bash
curl "https://your-domain.com/api/webhooks/whk_abc123/deliveries" \
  -H "Cookie: session=..."
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "del_xyz789",
      "webhookId": "whk_abc123",
      "event": "email.delivered",
      "payload": {
        "event": "email.delivered",
        "timestamp": "2024-01-20T15:30:00.000Z",
        "data": {
          "emailId": "eml_abc123",
          "to": ["user@example.com"],
          "subject": "Welcome!",
          "status": "delivered"
        }
      },
      "responseStatus": 200,
      "responseBody": "{\"received\": true}",
      "success": true,
      "attemptCount": 1,
      "createdAt": "2024-01-20T15:30:01.000Z"
    },
    {
      "id": "del_xyz788",
      "webhookId": "whk_abc123",
      "event": "email.sent",
      "payload": { ... },
      "responseStatus": 500,
      "responseBody": "Internal Server Error",
      "success": false,
      "attemptCount": 3,
      "createdAt": "2024-01-20T15:29:55.000Z"
    }
  ]
}
```

### Delivery Fields

| Field            | Type    | Description                     |
| ---------------- | ------- | ------------------------------- |
| `id`             | string  | Delivery record ID              |
| `webhookId`      | string  | Associated webhook ID           |
| `event`          | string  | Event type                      |
| `payload`        | object  | Full payload that was sent      |
| `responseStatus` | number  | HTTP response status code       |
| `responseBody`   | string  | HTTP response body (truncated)  |
| `success`        | boolean | Whether delivery was successful |
| `attemptCount`   | number  | Number of delivery attempts     |
| `createdAt`      | string  | When the delivery was attempted |

---

## Receiving Webhooks

### Endpoint Requirements

Your webhook endpoint should:

1. Accept POST requests with JSON body
2. Return a 2xx status code to acknowledge receipt
3. Respond within 30 seconds
4. Be idempotent (handle duplicate deliveries gracefully)

### Example Endpoint (Node.js/Express)

```javascript
app.post('/webhooks/canary', express.json(), (req, res) => {
  const { event, timestamp, data } = req.body;

  console.log(`Received ${event} for email ${data.emailId}`);

  switch (event) {
    case 'email.delivered':
      // Update your database, notify user, etc.
      break;
    case 'email.bounced':
      // Mark email as invalid, notify admin, etc.
      break;
    case 'email.failed':
      // Log error, trigger retry logic, etc.
      break;
  }

  res.status(200).json({ received: true });
});
```

### Example Endpoint (Python/Flask)

```python
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/webhooks/canary', methods=['POST'])
def handle_webhook():
    payload = request.get_json()
    event = payload.get('event')
    data = payload.get('data')

    print(f"Received {event} for email {data.get('emailId')}")

    if event == 'email.delivered':
        # Handle delivered event
        pass
    elif event == 'email.bounced':
        # Handle bounced event
        pass
    elif event == 'email.failed':
        # Handle failed event
        pass

    return jsonify({'received': True}), 200
```

---

## Best Practices

1. **Use HTTPS** - Always use HTTPS endpoints in production to protect webhook data
2. **Respond quickly** - Return a 2xx response as soon as possible; process asynchronously if needed
3. **Handle duplicates** - Webhooks may be delivered multiple times; use emailId for deduplication
4. **Monitor failures** - Check the `consecutiveFailures` count and delivery history regularly
5. **Log payloads** - Store webhook payloads for debugging and audit purposes

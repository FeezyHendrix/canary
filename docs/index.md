---
title: Home
layout: home
nav_order: 1
---

# Canary Documentation

Open-source email template designer with a visual drag-and-drop builder. Self-host your email infrastructure with support for multiple email providers.

## Features

- **Visual Email Editor** - Drag-and-drop builder with live preview, 19 block types including charts, tables, code blocks, and multi-column layouts
- **Dynamic Charts** - Embed bar, line, pie, area, and doughnut charts with static or dynamic data
- **PDF Attachments** - Generate PDF versions of your templates and attach them to emails automatically
- **Multiple Email Providers** - Connect SendGrid, Resend, Mailgun, Amazon SES, Postmark, or generic SMTP
- **Background Processing** - Reliable email delivery with async job queue and automatic retries
- **Webhooks** - Receive real-time notifications for email events (sent, delivered, opened, bounced, etc.)
- **Email Logs** - Track sent emails, filter by date/status, view delivery details, and resend failed emails
- **Team Management** - OAuth login, role-based access control, and multi-team support
- **REST API** - Full API access with key-based authentication and rate limiting

## Block Types

The visual editor includes 19 block types:

| Category | Blocks |
|----------|--------|
| Basic | Heading, Text, Button, Image, Divider, Spacer |
| Layout | Container, 2-Column, 3-Column |
| Content | Avatar, Quote, List, Table, Code, Badge, Icon |
| Media | Video, Social Icons |
| Advanced | HTML, Chart (with dynamic data support) |

## Quick Links

| Resource                                        | Description                        |
| ----------------------------------------------- | ---------------------------------- |
| [Quick Start Guide](guides/quickstart)          | Get up and running in 5 minutes    |
| [Template Designer](guides/template-designer)   | Learn the visual email editor      |
| [API Overview](api/)                            | Introduction to the Canary API     |
| [Send Email API](api/emails)                    | Send emails programmatically       |
| [Templates API](api/templates)                  | Manage email templates             |
| [Email Logs API](api/logs)                      | View logs and resend emails        |
| [PDF Attachments Guide](guides/pdf-attachments) | Generate and attach PDFs to emails |

## Architecture Overview

```
                                 +------------------+
                                 |   Web Frontend   |
                                 |   (React/Vite)   |
                                 +--------+---------+
                                          |
                                          v
+------------------+            +------------------+            +------------------+
|    PostgreSQL    |<---------->|    API Server    |<---------->|      Redis       |
|    (Database)    |            |    (Fastify)     |            |  (Queue/Cache)   |
+------------------+            +--------+---------+            +------------------+
                                          |
                       +------------------+------------------+
                       |                                     |
                       v                                     v
              +------------------+                  +------------------+
              |  Background      |                  |    Gotenberg     |
              |  Worker          |----------------->|    (PDF Gen)     |
              +------------------+                  +------------------+
                       |
                       v
              +------------------+
              |  Email Providers |
              |  (SendGrid, etc) |
              +------------------+
```

## Authentication

Canary supports two authentication methods:

### Session Authentication (Web UI)

Used by the dashboard web application. Supports OAuth via Google and GitHub.

### API Key Authentication (Programmatic Access)

Used for programmatic access to the API. Include your API key in the `X-API-Key` header:

```bash
curl -X POST https://your-domain.com/api/v1/send \
  -H "X-API-Key: cnry_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{"templateId": "welcome", "to": "user@example.com"}'
```

API keys can be created in the dashboard under Settings > API Keys.

## Base URLs

| Environment | URL                     |
| ----------- | ----------------------- |
| Development | `http://localhost:3001` |
| Production  | Your deployed API URL   |

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data here
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

## Support

- [GitHub Issues](https://github.com/your-org/canary/issues) - Report bugs or request features
- [GitHub Discussions](https://github.com/your-org/canary/discussions) - Ask questions and share ideas

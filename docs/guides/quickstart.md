---
title: Quick Start
layout: default
parent: Guides
nav_order: 1
---

# Quick Start Guide

Get Canary up and running in 5 minutes and send your first email.

## Prerequisites

- Node.js >= 20
- pnpm >= 9
- Docker & Docker Compose

## Step 1: Clone and Setup

```bash
# Clone the repository
git clone https://github.com/your-org/canary.git
cd canary

# Start infrastructure services (PostgreSQL, Redis, MinIO, Gotenberg)
docker compose up -d

# Copy environment file
cp .env.example .env
```

## Step 2: Configure Environment

Edit `.env` and set the required secrets:

```bash
# Generate ENCRYPTION_KEY (32 characters)
openssl rand -hex 16

# Generate SESSION_SECRET
openssl rand -hex 32
```

Add these to your `.env` file:

```env
ENCRYPTION_KEY=your-32-character-key-here
SESSION_SECRET=your-64-character-secret-here
```

## Step 3: Install and Run

```bash
# Install dependencies
pnpm install

# Run database migrations
pnpm db:migrate

# Start development servers
pnpm dev
```

## Step 4: Access the Dashboard

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Development URLs

| Service            | URL                        |
| ------------------ | -------------------------- |
| Web App            | http://localhost:3000      |
| API                | http://localhost:3001      |
| API Docs (Swagger) | http://localhost:3001/docs |
| MinIO Console      | http://localhost:9001      |

## Step 5: Create Your First Template

1. Log in to the dashboard using OAuth (Google or GitHub)
2. Click **Templates** in the sidebar
3. Click **Create Template**
4. Design your email using the drag-and-drop editor
5. Add variables using `{{variableName}}` syntax
6. Save your template

### Example Template

Create a simple welcome email:

1. Add a **Heading** block: "Welcome, {{name}}!"
2. Add a **Text** block: "Thanks for signing up for {{company}}."
3. Add a **Button** block: "Get Started" linking to `{{loginUrl}}`
4. Set the subject: "Welcome to {{company}}"
5. Save with slug: `welcome-email`

## Step 6: Configure an Email Adapter

1. Go to **Settings > Email Adapters**
2. Click **Add Adapter**
3. Select your provider (e.g., SendGrid)
4. Enter your API credentials
5. Set a default from address
6. Click **Test Connection** to verify
7. Save the adapter

### Quick Setup with SendGrid

1. Create a [SendGrid account](https://sendgrid.com)
2. Generate an API key with "Mail Send" permission
3. In Canary, add SendGrid adapter with your API key
4. Verify a sender identity in SendGrid

## Step 7: Create an API Key

1. Go to **Settings > API Keys**
2. Click **Create API Key**
3. Name it "Development Key"
4. Select scope: `send`
5. Click **Create**
6. **Copy the key immediately** - it won't be shown again

## Step 8: Send Your First Email

Using curl:

```bash
curl -X POST http://localhost:3001/api/v1/send \
  -H "X-API-Key: cnry_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "welcome-email",
    "to": "your-email@example.com",
    "variables": {
      "name": "John",
      "company": "Acme Inc",
      "loginUrl": "https://example.com/login"
    }
  }'
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "eml_abc123",
    "jobId": "job_xyz789",
    "status": "queued"
  }
}
```

## Step 9: Check Email Status

```bash
curl http://localhost:3001/api/v1/eml_abc123/status \
  -H "X-API-Key: cnry_your_api_key_here"
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "eml_abc123",
    "status": "delivered",
    "sentAt": "2024-01-20T10:30:00.000Z"
  }
}
```

## Next Steps

- [Send emails with PDF attachments](pdf-attachments)
- [Configure webhooks](../api/webhooks) to track delivery events
- [Set up multiple email adapters](../api/adapters) for different use cases
- Explore the [API Reference](../api/) for all available endpoints

## Common Issues

### "No active email adapter configured"

You need to create and activate an email adapter in Settings > Email Adapters.

### "Template not found"

Make sure you're using the correct template ID or slug. Check the Templates page to see available templates.

### "Invalid API key"

Verify your API key is correct and hasn't expired. Create a new key if needed.

### Database connection error

Ensure Docker containers are running:

```bash
docker compose ps
```

If not running, start them:

```bash
docker compose up -d
```

### Port already in use

If ports 3000 or 3001 are in use, stop the conflicting service or modify the ports in `.env`.

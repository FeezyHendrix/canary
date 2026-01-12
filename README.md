# Canary

Open-source email template designer with a visual drag-and-drop builder. Self-host your email infrastructure with support for multiple email providers.

<p align="center">
  <a href="https://imgur.com/a/L0ULkBK">
    <img src="https://i.imgur.com/L0ULkBK.png" alt="Canary Email Editor" width="800">
  </a>
</p>

## Features

- **Visual Email Editor** - Drag-and-drop builder with live preview
  - 10 block types: Heading, Text, Button, Image, Divider, Spacer, Container, Columns, Avatar, HTML
  - Nested containers and multi-column layouts
  - Undo/redo, copy/paste, keyboard shortcuts
  - Real-time HTML preview and export

- **PDF Attachments** - Generate PDF versions of your templates
  - Attach PDF to emails automatically
  - Uses the same drag-and-drop designed templates
  - Powered by Gotenberg (included in Docker setup)

- **Background Processing** - Reliable email delivery
  - Async email sending via job queue
  - Automatic retries with exponential backoff
  - Job status tracking

- **Multiple Email Providers** - Connect your preferred service
  - SendGrid
  - Resend
  - Mailgun
  - Amazon SES
  - Postmark
  - Generic SMTP

- **Image Uploads** - S3-compatible storage
  - Drag-and-drop image upload in editor
  - Works with MinIO (local) or AWS S3

- **Team Management** - Collaborate with your team
  - OAuth login (Google, GitHub)
  - Role-based access control
  - Multiple teams per user

- **Developer Experience**
  - REST API with OpenAPI documentation
  - API key authentication for programmatic access
  - Webhook support for email events
  - Email logs and delivery tracking

## Architecture

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

## Tech Stack

| Layer    | Technology                                               |
| -------- | -------------------------------------------------------- |
| Frontend | React, Vite, TypeScript, Tailwind CSS, Radix UI, Zustand |
| Backend  | Node.js, Fastify, TypeScript, Drizzle ORM                |
| Database | PostgreSQL                                               |
| Queue    | Redis + BullMQ                                           |
| Storage  | MinIO / AWS S3                                           |
| PDF      | Gotenberg                                                |

## Quick Start (Development)

### Prerequisites

- Node.js >= 20
- pnpm >= 9
- Docker & Docker Compose

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-org/canary.git
cd canary

# 2. Start infrastructure services
docker compose up -d

# 3. Copy environment file
cp .env.example .env

# 4. Generate required secrets and edit .env
#    ENCRYPTION_KEY (32 chars): openssl rand -hex 16
#    SESSION_SECRET: openssl rand -hex 32

# 5. Install dependencies
pnpm install

# 6. Run database migrations
pnpm db:migrate

# 7. Start development servers
pnpm dev
```

### URLs (Development)

| Service            | URL                        |
| ------------------ | -------------------------- |
| Web App            | http://localhost:3000      |
| API                | http://localhost:3001      |
| API Docs (Swagger) | http://localhost:3001/docs |
| MinIO Console      | http://localhost:9001      |
| Gotenberg          | http://localhost:3100      |

## Production Deployment

### Using Docker Compose

```bash
# 1. Copy production environment template
cp .env.production.example .env

# 2. Edit .env with your values (required):
#    - ENCRYPTION_KEY
#    - SESSION_SECRET
#    - POSTGRES_PASSWORD
#    - Update URLs for your domain

# 3. Deploy
docker compose -f docker-compose.prod.yml up -d
```

### Configuration via Environment Variables

All configuration is done through environment variables. Pass them to the container:

```bash
docker run -d \
  -e DATABASE_URL=postgres://user:pass@host:5432/canary \
  -e REDIS_URL=redis://host:6379 \
  -e ENCRYPTION_KEY=your-32-char-key \
  -e SESSION_SECRET=your-secret \
  -e GOTENBERG_URL=http://gotenberg:3000 \
  -p 3001:3001 \
  canary/api:latest
```

Or with Docker Compose, use an `.env` file:

```yaml
services:
  api:
    image: canary/api:latest
    env_file:
      - .env
    ports:
      - '3001:3001'
```

### Required Environment Variables

| Variable         | Description                                                           |
| ---------------- | --------------------------------------------------------------------- |
| `DATABASE_URL`   | PostgreSQL connection string                                          |
| `REDIS_URL`      | Redis connection string                                               |
| `ENCRYPTION_KEY` | 32-char key for encrypting secrets (generate: `openssl rand -hex 16`) |
| `SESSION_SECRET` | Secret for signing cookies (generate: `openssl rand -hex 32`)         |

### Optional Environment Variables

| Variable               | Default               | Description                              |
| ---------------------- | --------------------- | ---------------------------------------- |
| `APP_URL`              | http://localhost:3000 | Frontend URL                             |
| `API_URL`              | http://localhost:3001 | API URL                                  |
| `GOTENBERG_URL`        | -                     | Gotenberg service URL for PDF generation |
| `WORKER_ENABLED`       | true                  | Enable background worker                 |
| `WORKER_CONCURRENCY`   | 5                     | Number of concurrent jobs                |
| `GOOGLE_CLIENT_ID`     | -                     | Google OAuth client ID                   |
| `GOOGLE_CLIENT_SECRET` | -                     | Google OAuth secret                      |
| `GITHUB_CLIENT_ID`     | -                     | GitHub OAuth client ID                   |
| `GITHUB_CLIENT_SECRET` | -                     | GitHub OAuth secret                      |
| `S3_ENDPOINT`          | -                     | S3-compatible endpoint                   |
| `S3_BUCKET`            | canary-uploads        | Bucket name                              |
| `S3_ACCESS_KEY`        | -                     | S3 access key                            |
| `S3_SECRET_KEY`        | -                     | S3 secret key                            |
| `S3_REGION`            | us-east-1             | S3 region                                |
| `S3_PUBLIC_URL`        | -                     | Public URL for serving files             |

## PDF Generation

Canary uses [Gotenberg](https://gotenberg.dev/) for PDF generation. Gotenberg is included in the Docker Compose setup.

### How it works

1. Design your email template using the visual editor
2. Enable "Generate PDF" on the template or per-send request
3. When sending, Canary renders the template to HTML
4. Gotenberg converts the HTML to PDF
5. PDF is attached to the email automatically

### API Usage

```bash
# Send email with PDF attachment
curl -X POST http://localhost:3001/api/v1/send \
  -H "X-API-Key: cnry_your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "invoice-template",
    "to": "customer@example.com",
    "subject": "Your Invoice",
    "variables": {
      "invoiceNumber": "INV-001",
      "amount": "$100.00"
    },
    "generatePdf": true
  }'
```

### Check Email Status

```bash
curl http://localhost:3001/api/v1/{emailId}/status \
  -H "X-API-Key: cnry_your_key"
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "email-uuid",
    "status": "sent",
    "sentAt": "2024-01-15T10:30:00Z",
    "hasPdfAttachment": true
  }
}
```

## Project Structure

```
canary/
├── apps/
│   ├── web/                    # React frontend
│   │   └── src/
│   │       ├── components/     # Shared UI components
│   │       └── features/       # Feature modules
│   │           └── templates/email-builder/  # Visual editor
│   │
│   └── api/                    # Fastify backend
│       └── src/
│           ├── modules/        # API routes & services
│           ├── jobs/           # Background job processing
│           │   ├── queues.ts   # Queue definitions
│           │   ├── worker.ts   # Worker startup
│           │   └── processors/ # Job handlers
│           ├── services/       # Shared services
│           │   └── pdf.service.ts  # Gotenberg integration
│           ├── adapters/       # Email provider implementations
│           └── db/             # Drizzle schema & migrations
│
├── packages/
│   └── shared/                 # Shared TypeScript types
│
├── docker/                     # Docker configuration
├── docker-compose.yml          # Development services
└── docker-compose.prod.yml     # Production deployment
```

## Development

```bash
# Start all services (web + api)
pnpm dev

# Run only web
pnpm --filter @canary/web dev

# Run only api
pnpm --filter @canary/api dev

# Database commands
pnpm db:generate    # Generate migrations from schema changes
pnpm db:migrate     # Apply pending migrations
pnpm db:studio      # Open Drizzle Studio (database GUI)

# Code quality
pnpm lint           # Run linting
pnpm format         # Format code with Prettier
pnpm build          # Build all packages
```

## MinIO Setup (Image Uploads)

1. Open MinIO Console at http://localhost:9001
2. Login with `minioadmin` / `minioadmin`
3. Create a bucket named `canary-uploads`
4. Set bucket policy to public (for image serving)

## License

This project is licensed under the [GNU Affero General Public License v3.0](LICENSE).

See [LICENSE](LICENSE) for the full terms.

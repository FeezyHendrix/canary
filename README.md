# Canary

Open-source email template designer with a visual drag-and-drop builder. Self-host your email infrastructure with support for multiple email providers.

## Features

- **Visual Email Editor** - Drag-and-drop builder with live preview
  - 10 block types: Heading, Text, Button, Image, Divider, Spacer, Container, Columns, Avatar, HTML
  - Nested containers and multi-column layouts
  - Undo/redo, copy/paste, keyboard shortcuts
  - Real-time HTML preview and export

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

## Tech Stack

| Layer    | Technology                                               |
| -------- | -------------------------------------------------------- |
| Frontend | React, Vite, TypeScript, Tailwind CSS, Radix UI, Zustand |
| Backend  | Node.js, Fastify, TypeScript, Drizzle ORM                |
| Database | PostgreSQL                                               |
| Cache    | Redis                                                    |
| Storage  | MinIO / AWS S3                                           |

## Quick Start

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

# 4. Generate required secrets
# Edit .env and set:
#   ENCRYPTION_KEY (32 chars): openssl rand -hex 16
#   SESSION_SECRET: openssl rand -hex 32
#   OAuth credentials (optional for local dev)

# 5. Install dependencies
pnpm install

# 6. Run database migrations
pnpm db:migrate

# 7. Start development servers
pnpm dev
```

### URLs

| Service            | URL                        |
| ------------------ | -------------------------- |
| Web App            | http://localhost:3000      |
| API                | http://localhost:3001      |
| API Docs (Swagger) | http://localhost:3001/docs |
| MinIO Console      | http://localhost:9001      |

### MinIO Setup (Image Uploads)

1. Open MinIO Console at http://localhost:9001
2. Login with `minioadmin` / `minioadmin`
3. Create a bucket named `canary-uploads`
4. Set bucket policy to public (for image serving)

## Project Structure

```
canary/
├── apps/
│   ├── web/                    # React frontend
│   │   └── src/
│   │       ├── components/     # Shared UI components
│   │       ├── features/       # Feature modules
│   │       │   ├── templates/  # Email template management
│   │       │   │   └── email-builder/  # Visual editor
│   │       │   ├── adapters/   # Email provider config
│   │       │   ├── api-keys/   # API key management
│   │       │   ├── auth/       # Authentication
│   │       │   ├── logs/       # Email logs
│   │       │   ├── settings/   # Team settings
│   │       │   └── webhooks/   # Webhook config
│   │       └── lib/            # Utilities
│   │
│   └── api/                    # Fastify backend
│       └── src/
│           ├── modules/        # API routes & services
│           │   ├── auth/       # OAuth, sessions, API keys
│           │   ├── templates/  # Template CRUD
│           │   ├── emails/     # Email sending
│           │   ├── adapters/   # Provider configuration
│           │   ├── uploads/    # S3 image uploads
│           │   ├── teams/      # Team management
│           │   ├── webhooks/   # Webhook management
│           │   ├── api-keys/   # API key management
│           │   └── logs/       # Email log queries
│           ├── adapters/       # Email provider implementations
│           ├── db/             # Drizzle schema & migrations
│           └── lib/            # Shared utilities
│
├── packages/
│   └── shared/                 # Shared TypeScript types
│
├── docker/                     # Docker configuration
└── docker-compose.yml          # Local development services
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

## Environment Variables

See [.env.example](.env.example) for all available options.

### Required

| Variable         | Description                                |
| ---------------- | ------------------------------------------ |
| `DATABASE_URL`   | PostgreSQL connection string               |
| `REDIS_URL`      | Redis connection string                    |
| `ENCRYPTION_KEY` | 32-char key for encrypting adapter secrets |
| `SESSION_SECRET` | Secret for signing session cookies         |

### Optional

| Variable               | Description                           |
| ---------------------- | ------------------------------------- |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID                |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret            |
| `GITHUB_CLIENT_ID`     | GitHub OAuth client ID                |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret            |
| `S3_ENDPOINT`          | S3-compatible endpoint (MinIO or AWS) |
| `S3_BUCKET`            | Bucket name for uploads               |
| `S3_ACCESS_KEY`        | S3 access key                         |
| `S3_SECRET_KEY`        | S3 secret key                         |

## API Usage

### Authentication

Use API keys for programmatic access:

```bash
# Create an API key in the web UI, then:
curl -H "X-API-Key: cnry_your_key_here" \
  http://localhost:3001/api/templates
```

### Send Email

```bash
curl -X POST http://localhost:3001/api/emails/send \
  -H "X-API-Key: cnry_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "template-uuid",
    "to": "user@example.com",
    "subject": "Hello!",
    "variables": {
      "name": "John"
    }
  }'
```

See full API documentation at http://localhost:3001/docs

## License

MIT

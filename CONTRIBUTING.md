# Contributing to Canary

Thank you for your interest in contributing to Canary! This guide will help you get started.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Submitting Changes](#submitting-changes)
- [Guidelines](#guidelines)

## Prerequisites

- **Node.js** >= 20
- **pnpm** >= 9
- **Docker** & **Docker Compose** (for infrastructure services)
- **Git** (for version control)

## Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
git clone https://github.com/YOUR_USERNAME/canary.git
cd canary
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Start Infrastructure

```bash
docker compose up -d postgres redis minio gotenberg
```

This starts:

- PostgreSQL on port 5432
- Redis on port 6379
- MinIO (S3-compatible storage) on ports 9000/9001
- Gotenberg (PDF generation) on port 3100

### 4. Setup Environment

```bash
cp .env.example .env
```

Generate required secrets:

```bash
openssl rand -hex 16  # 32 chars for ENCRYPTION_KEY
openssl rand -hex 32  # 64 chars for SESSION_SECRET
```

Edit `.env` and add your secrets.

### 5. Run Migrations

```bash
pnpm db:migrate
```

### 6. Start Development Servers

```bash
# All services
pnpm dev

# Only API
pnpm --filter @canary/api dev

# Only Web
pnpm --filter @canary/web dev
```

Services will be available at:

- Web App: http://localhost:3000
- API: http://localhost:3001
- API Docs: http://localhost:3001/docs
- MinIO Console: http://localhost:9001

## Development Workflow

### Branch Strategy

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Or a bugfix branch
git checkout -b fix/bug-description
```

### Making Changes

1. **Work in monorepo context** - The project uses pnpm workspaces
2. **Follow the modular structure** - Code is organized by domain (auth, templates, emails, etc.)
3. **Write tests** - Add tests for new functionality (see [Testing](#testing))
4. **Type-check** - Ensure TypeScript compiles
5. **Format code** - Run Prettier before committing

```bash
pnpm typecheck  # Type checking
pnpm format       # Format code
pnpm lint         # Linting
```

## Code Style

### Formatting

We use [Prettier](https://prettier.io/) with the following config:

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

Run `pnpm format` before committing.

### TypeScript

- **Strict mode** is enabled
- No `any` types - Use proper types
- No type suppression - Avoid `@ts-ignore`, `as any`
- Shared types in `packages/shared/`

### Naming Conventions

```typescript
// Files: kebab-case
auth.service.ts
user-profile.tsx

// Variables/Functions: camelCase
const userEmail = '...';
function getUserById() { }

// Classes/Interfaces: PascalCase
class UserService { }
interface UserProfile { }

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const DATABASE_URL = '...';

// Types: PascalCase with prefix if needed
type User = { ... };
type TeamRole = 'owner' | 'admin' | 'member';
```

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# With coverage
pnpm test:coverage
```

### Test Structure

```
apps/api/src/modules/
├── auth/
│   ├── auth.routes.test.ts      # Integration tests for routes
│   └── password.service.test.ts  # Unit tests for services
├── templates/
│   ├── templates.service.test.ts
│   └── templates.routes.test.ts
└── ...
```

### Writing Tests

Follow the Arrange-Act-Assert (AAA) pattern:

```typescript
describe('feature', () => {
  it('should do something', async () => {
    // Arrange
    const testData = await createTestUser();

    // Act
    const result = await serviceFunction(testData.id, input);

    // Assert
    expect(result).toBeDefined();
    expect(result.name).toBe('Expected Name');
  });
});
```

### Test Utilities

Use test helpers from `src/test/utils.ts`:

```typescript
import { createTestUser, createTestApiKey, createTestTeam } from '../test/utils';

// Creates user with team and session
const { user, teamId, sessionId } = await createTestUser();

// Creates API key
const { apiKey } = await createTestApiKey(teamId);

// Creates additional team
const team = await createTestTeam(userId);
```

See [TESTING.md](apps/api/TESTING.md) for detailed testing guide.

## Project Structure

```
canary/
├── apps/
│   ├── web/                      # React frontend (Vite)
│   │   ├── src/
│   │   │   ├── components/        # Shared UI components
│   │   │   ├── features/          # Feature modules (auth, dashboard, templates)
│   │   │   └── lib/              # Utilities (api-client, utils)
│   │   └── package.json
│   │
│   └── api/                      # Fastify backend
│       ├── src/
│       │   ├── modules/           # Domain modules (auth, templates, emails, etc.)
│       │   │   ├── auth/         # Authentication & users
│       │   │   ├── templates/     # Email templates
│       │   │   ├── emails/       # Email sending
│       │   │   ├── adapters/     # Email providers
│       │   │   ├── api-keys/     # API key management
│       │   │   ├── webhooks/     # Webhook configuration
│       │   │   └── teams/        # Team management
│       │   ├── services/          # Shared services (PDF, encryption)
│       │   ├── jobs/             # Background jobs
│       │   ├── adapters/          # Email provider implementations
│       │   ├── db/               # Drizzle schema & migrations
│       │   ├── lib/              # Utilities (errors, env, validation)
│       │   └── test/             # Test utilities & setup
│       └── package.json
│
├── packages/
│   └── shared/                   # Shared TypeScript types
│       ├── src/
│       │   ├── types/            # Domain types
│       │   └── constants/        # Shared constants
│       └── package.json
│
├── docs/                        # Documentation
├── docker/                      # Docker files
├── package.json                  # Root package (pnpm workspace)
└── pnpm-workspace.yaml
```

### Module Structure

Each module in `apps/api/src/modules/` follows this pattern:

```
module-name/
├── module-name.routes.ts       # Fastify route definitions
├── module-name.service.ts      # Business logic
├── module-name.schema.ts       # Zod validation schemas
├── middleware/                 # Module-specific middleware
└── *.test.ts                 # Tests
```

## Submitting Changes

### 1. Update Tests

Ensure your changes are tested:

```bash
pnpm test
```

### 2. Type Check

```bash
pnpm typecheck
```

### 3. Format Code

```bash
pnpm format
```

### 4. Commit Changes

Use clear, descriptive commit messages:

```bash
git add .
git commit -m "feat(templates): add duplicate template endpoint

- Allows users to duplicate existing templates
- Automatically appends ' (Copy)' to name
- Creates new slug for duplicated template"
```

### 5. Push to Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request

1. Go to the original repository on GitHub
2. Click "New Pull Request"
3. Select your branch
4. Fill out the PR template:
   - Description of changes
   - Link to related issues
   - Screenshots if UI changes
   - Breaking changes

## Guidelines

### Do

- **Write tests** for new features and bug fixes
- **Follow existing patterns** - Look at similar code for style
- **Keep changes focused** - One PR should do one thing
- **Use TypeScript** types - No `any`, no type suppression
- **Document breaking changes** - Update README and docs
- **Be respectful** - Assume good intentions

### Don't

- **Suppress type errors** - Fix the underlying issue
- **Commit sensitive data** - Never commit secrets or API keys
- **Mix concerns** - Keep modules focused on their domain
- **Break existing tests** - Update them if your changes affect them
- **Make large refactors** in one PR - Break into smaller, reviewable pieces

### Architecture Principles

This project follows [Tao of Node](https://alexkondov.com/tao-of-node/) principles:

- **Modular structure** - Organized by domain, not technical layers
- **Layered architecture** - Routes → Services → Database
- **Service communication** - Modules talk via services, not directly to other modules' DB
- **Validation in middleware** - Use Zod schemas for request validation
- **Centralized error handling** - Use `AppError` and throw, let handler format response
- **Functional over OOP** - Prefer functions and composition over classes

## Common Tasks

### Adding a New Module

```bash
# 1. Create module directory
mkdir -p apps/api/src/modules/new-module

# 2. Add files
touch apps/api/src/modules/new-module/new-module.service.ts
touch apps/api/src/modules/new-module/new-module.routes.ts
touch apps/api/src/modules/new-module/new-module.schema.ts

# 3. Register routes in apps/api/src/app.ts
import { newModuleRoutes } from './modules/new-module/new-module.routes';

await app.register(newModuleRoutes, { prefix: '/api/new-module' });
```

### Adding a New Email Adapter

1. Create `apps/api/src/adapters/YOUR_ADAPTER.adapter.ts`
2. Implement the adapter interface
3. Add to adapter types in `packages/shared/src/constants/adapter-types.ts`
4. Register in `apps/api/src/adapters/adapter.factory.ts`

### Database Changes

```bash
# 1. Update schema
vim apps/api/src/db/schema.ts

# 2. Generate migration
pnpm db:generate

# 3. Apply migration
pnpm db:migrate

# 4. Update shared types if needed
vim packages/shared/src/types/...
```

## Troubleshooting

### Docker Issues

```bash
# Restart infrastructure
docker compose down
docker compose up -d

# View logs
docker compose logs postgres
docker compose logs redis
```

### Dependency Issues

```bash
# Clear pnpm cache
rm -rf node_modules
pnpm install

# Or rebuild
pnpm rebuild
```

### TypeScript Errors

```bash
# Check for type errors
pnpm typecheck

# Regenerate types if needed
rm -rf node_modules/.cache
```

## Resources

- [README.md](README.md) - Project overview and quick start
- [TESTING.md](apps/api/TESTING.md) - Testing guide
- [API Documentation](docs/api/) - API documentation
- [Guides](docs/guides/) - Feature guides

## Getting Help

- **Issues** - Check existing [GitHub Issues](../../issues)
- **Discussions** - Start a [GitHub Discussion](../../discussions)
- **Email** - Contact maintainers (if provided)

## License

By contributing to Canary, you agree that your contributions will be licensed under the [GNU Affero General Public License v3.0](LICENSE).

---

Thank you for contributing! 🎉

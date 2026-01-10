# Testing Guide

This application uses Vitest for testing. Tests are organized by module and include both service-level unit tests and route integration tests.

## Setup

### Prerequisites

1. Start test infrastructure (PostgreSQL and Redis):

```bash
cd /path/to/canary
docker compose up -d postgres redis
```

2. Or use existing running services by updating `.env.test`

### Running Tests

```bash
# Run all tests
pnpm test

# Run in watch mode
pnpm test:watch

# Run with coverage
pnpm test:coverage
```

## Test Structure

```
apps/api/src/modules/
├── auth/
│   ├── auth.routes.test.ts      # Authentication route tests
│   └── password.service.test.ts  # Password service tests
├── templates/
│   ├── templates.service.test.ts # Template CRUD tests
│   └── templates.routes.test.ts  # Template API tests
├── emails/
│   └── emails.routes.test.ts      # Email sending API tests
├── adapters/
│   └── adapters.routes.test.ts   # Email provider adapter tests
├── api-keys/
│   └── api-keys.routes.test.ts   # API key management tests
├── webhooks/
│   └── webhooks.routes.test.ts   # Webhook configuration tests
└── teams/
    └── teams.routes.test.ts        # Team management tests
```

## Test Utilities

Located in `src/test/utils.ts`:

- `getTestApp()` - Returns Fastify app instance
- `closeTestApp()` - Closes app instance
- `createTestUser()` - Creates test user with team and session
- `createTestApiKey()` - Creates test API key
- `createTestTeam()` - Creates test team

## Database Setup

Tests use automatic database setup/teardown:

- `beforeAll` - Drops all tables, runs migrations
- `beforeEach` - Truncates all tables (clean slate)
- Database is isolated per test suite

## Test Coverage

### Auth Module (password.service.test.ts)

- Password strength validation
- Password hashing (Argon2)
- Password verification
- Email verification tokens
- Password reset tokens
- Token expiration handling

### Auth Routes (auth.routes.test.ts)

- User registration
- User login/logout
- Password management (reset, verify)
- Team switching
- Session management
- Authentication middleware

### Templates Module (templates.service.test.ts, templates.routes.test.ts)

- Template CRUD operations
- Variable extraction from designs
- Template duplication
- Version management
- Preview rendering
- Search and filtering
- Pagination

### Email Sending (emails.routes.test.ts)

- Email sending via API key
- Status tracking
- API key authentication
- Request validation

### Adapters Module (adapters.routes.test.ts)

- Email provider configuration
- Adapter testing
- Multiple provider types (SendGrid, Resend, etc.)
- Configuration validation

### API Keys Module (api-keys.routes.test.ts)

- API key creation
- Scopes management
- Rate limiting
- Key revocation
- Security headers

### Webhooks Module (webhooks.routes.test.ts)

- Webhook creation
- Event subscription
- URL validation
- Secret management
- Webhook testing

### Teams Module (teams.routes.test.ts)

- Team listing
- Team details
- Member management
- Permission checks
- Team updates

## Writing New Tests

Follow these patterns:

### Service Tests

```typescript
describe('module.service', () => {
  describe('functionName', () => {
    it('should do something', async () => {
      // Arrange
      const testData = await createTestUser();

      // Act
      const result = await serviceFunction(testData.id, input);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe('Expected');
    });
  });
});
```

### Route Tests

```typescript
describe('module routes', () => {
  describe('METHOD /api/endpoint', () => {
    it('should handle request', async () => {
      const { sessionId } = await createTestUser();

      const response = await app.inject({
        method: 'POST',
        url: '/api/endpoint',
        cookies: { session: sessionId },
        payload: { ... },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        success: true,
        data: { ... }
      });
    });
  });
});
```

## Notes

- Tests use in-memory PostgreSQL for isolation
- All tests clean up after themselves
- Authentication middleware is tested via session cookies
- API key authentication uses `X-API-Key` header
- Database migrations are run before test suite
- Tests follow Arrange-Act-Assert (AAA) pattern

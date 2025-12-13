# NestJS Backend + REST API Migration

## Quick Start Guide

### Running the New Backend

```bash
# Install dependencies
cd backend
npm install

# Start the server
npm run start:dev
```

The backend will run on `http://localhost:3000`

### Testing the API

You can test the REST endpoints using curl:

#### Sign Up
```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123","nickname":"Test User"}'
```

#### Sign In
```bash
curl -X POST http://localhost:3000/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

Save the `accessToken` from the response.

#### Create a Memo
```bash
curl -X POST http://localhost:3000/api/v1/memos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"content":"My first memo!","visibility":"PRIVATE"}'
```

#### List Memos
```bash
curl http://localhost:3000/api/v1/memos
```

#### Get Current User
```bash
curl http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### API Endpoints Available

**Authentication**
- `POST /api/v1/auth/signup` - Register
- `POST /api/v1/auth/signin` - Login
- `GET /api/v1/auth/me` - Get current user (requires auth)

**Users**
- `GET /api/v1/users` - List users (requires auth)
- `GET /api/v1/users/:id` - Get user (requires auth)
- `PATCH /api/v1/users/:id` - Update user (requires auth)
- `DELETE /api/v1/users/:id` - Delete user (requires auth)

**Memos**
- `POST /api/v1/memos` - Create memo (requires auth)
- `GET /api/v1/memos` - List memos (public + own)
- `GET /api/v1/memos/:id` - Get memo
- `PATCH /api/v1/memos/:id` - Update memo (requires auth)
- `DELETE /api/v1/memos/:id` - Delete memo (requires auth)

**Workspace**
- `GET /api/v1/workspace/profile` - Get workspace info
- `PATCH /api/v1/workspace/setting` - Update workspace (requires auth)

**Markdown**
- `POST /api/v1/markdown/parse` - Parse markdown

### Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=3000
DATABASE_PATH=memos.db
JWT_SECRET=your-super-secret-jwt-key
```

### Database

The backend uses SQLite by default. The database file `memos.db` will be created automatically in the backend directory.

### Frontend Status

⚠️ **The frontend is partially migrated but not yet functional.**

The frontend requires significant updates to:
1. Use the new REST API instead of gRPC
2. Update all components and stores
3. Remove Protocol Buffer dependencies

The backend is fully functional and can be tested independently using curl or Postman.

### Development Workflow

1. Make changes to backend code
2. The dev server will auto-reload
3. Test endpoints with curl or API client
4. Check logs in terminal

### Project Structure

```
backend/
├── src/
│   ├── auth/           # Authentication (JWT)
│   ├── user/           # User management
│   ├── memo/           # Memo CRUD
│   ├── workspace/      # Workspace settings
│   ├── markdown/       # Markdown parsing
│   └── common/         # Shared entities, DTOs
├── package.json
└── nest-cli.json
```

### Next Steps

To complete the migration:
1. Implement remaining backend services (attachments, webhooks, etc.)
2. Update frontend to use REST API
3. Remove Go backend files
4. Update documentation

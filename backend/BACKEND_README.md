# Memos NestJS Backend

This is the NestJS backend for the Memos application, replacing the previous Go/gRPC backend with a RESTful API.

## Features

- RESTful API endpoints (no gRPC)
- TypeScript with NestJS framework
- SQLite database support (with TypeORM)
- JWT authentication
- Password hashing with bcrypt
- CORS enabled for frontend integration

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
cd backend
npm install
```

### Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The backend will start on port 3000 by default.

### Environment Variables

Create a `.env` file in the backend directory:

```
PORT=3000
DATABASE_PATH=memos.db
JWT_SECRET=your-secret-key-here
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Register a new user
- `POST /api/v1/auth/signin` - Sign in
- `GET /api/v1/auth/me` - Get current user (requires auth)

### Users
- `GET /api/v1/users` - List all users (requires auth)
- `GET /api/v1/users/:id` - Get user by ID (requires auth)
- `PATCH /api/v1/users/:id` - Update user (requires auth)
- `DELETE /api/v1/users/:id` - Delete user (requires auth)

### Memos
- `POST /api/v1/memos` - Create memo (requires auth)
- `GET /api/v1/memos` - List memos
- `GET /api/v1/memos/:id` - Get memo by ID
- `PATCH /api/v1/memos/:id` - Update memo (requires auth)
- `DELETE /api/v1/memos/:id` - Delete memo (requires auth)

## Database Schema

### User Entity
- `id` - Primary key
- `username` - Unique username
- `role` - User role (HOST, ADMIN, USER)
- `email` - Email address
- `nickname` - Display name
- `passwordHash` - Hashed password
- `avatarUrl` - Avatar URL
- `description` - User bio
- `rowStatus` - Row status (NORMAL, ARCHIVED)
- `createdTs` - Creation timestamp
- `updatedTs` - Update timestamp

### Memo Entity
- `id` - Primary key
- `uid` - Unique identifier
- `creatorId` - Foreign key to User
- `content` - Memo content
- `visibility` - Visibility (PUBLIC, PROTECTED, PRIVATE)
- `pinned` - Pinned status
- `rowStatus` - Row status (NORMAL, ARCHIVED)
- `parentId` - Parent memo ID (for comments)
- `createdTs` - Creation timestamp
- `updatedTs` - Update timestamp

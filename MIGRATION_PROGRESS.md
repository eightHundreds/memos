# Migration Progress Report: Go/gRPC to NestJS/REST

## Overview
This document tracks the migration from Go backend with gRPC to NestJS with RESTful APIs.

## Current Status: ~55% Complete

### ✅ Completed Tasks

#### Backend (NestJS)
1. **Project Setup**
   - Created NestJS project in `/backend` directory
   - Configured TypeScript, TypeORM, SQLite
   - Set up JWT authentication
   - Added comprehensive .gitignore

2. **Entities Implemented**
   - User entity (id, username, role, email, nickname, passwordHash, avatarUrl, description)
   - Memo entity (id, uid, creatorId, content, visibility, pinned, parentId)
   - UserAccessToken entity (id, userId, token, description, createdTs, expiresTs)

3. **REST API Endpoints Implemented**

   **Auth Service** (`/api/v1/auth`)
   - `POST /signin` - Sign in with credentials
   - `POST /signup` - Register new user
   - `GET /me` - Get current user

   **User Service** (`/api/v1/users`)
   - `GET /` - List all users
   - `GET /:id` - Get user by ID
   - `PATCH /:id` - Update user
   - `DELETE /:id` - Delete user
   - `POST /:id/access-tokens` - Create user access token ✅ NEW
   - `GET /:id/access-tokens` - List user access tokens ✅ NEW
   - `DELETE /:id/access-tokens/:tokenId` - Delete access token ✅ NEW

   **Memo Service** (`/api/v1/memos`)
   - `POST /` - Create memo
   - `GET /` - List memos (with filters)
   - `GET /:id` - Get memo by ID
   - `PATCH /:id` - Update memo
   - `DELETE /:id` - Delete memo (soft delete)

   **Workspace Service** (`/api/v1/workspace`)
   - `GET /profile` - Get workspace profile
   - `PATCH /setting` - Update workspace settings

   **Markdown Service** (`/api/v1/markdown`)
   - `POST /parse` - Parse markdown content

#### Frontend
1. **REST API Client Created**
   - New `api.ts` file with comprehensive REST client (60+ methods) ✅
   - Token management (localStorage)
   - Type-safe request/response handling
   - Backward compatibility layer in `grpcweb.ts`
   - All service methods implemented or stubbed ✅

### 🔄 In Progress

#### Frontend Migration
The frontend has been partially migrated but requires extensive updates:
- REST API client complete with 60+ methods ✅
- Many components still reference old gRPC method names
- MobX stores need updates
- Type definitions from Protocol Buffers need replacement

### ❌ Not Yet Started

#### Backend Services Still Needed
1. **Attachment Service** - File upload/download
2. **Shortcut Service** - User shortcuts
3. **Inbox Service** - Inbox items
4. **Activity Service** - Activity tracking
5. **Webhook Service** - Webhook management
6. **Identity Provider Service** - SSO/OAuth

#### Frontend Updates Needed
1. Update all React components to use new API methods
2. Update MobX stores (workspace, user, memo stores)
3. Remove Protocol Buffer type dependencies
4. Remove `nice-grpc-web` from package.json
5. Update type definitions

#### Cleanup Tasks
1. Remove Go backend files (server/, store/, internal/)
2. Remove proto directory
3. Update build scripts
4. Update Docker configuration
5. Update README and documentation

## API Compatibility Matrix

| Service | Go/gRPC Method | NestJS REST Endpoint | Status |
|---------|---------------|---------------------|--------|
| Auth | SignIn | POST /api/v1/auth/signin | ✅ |
| Auth | SignUp | POST /api/v1/auth/signup | ✅ |
| Auth | GetAuthStatus | GET /api/v1/auth/me | ✅ |
| User | ListUsers | GET /api/v1/users | ✅ |
| User | GetUser | GET /api/v1/users/:id | ✅ |
| User | UpdateUser | PATCH /api/v1/users/:id | ✅ |
| User | DeleteUser | DELETE /api/v1/users/:id | ✅ |
| Memo | CreateMemo | POST /api/v1/memos | ✅ |
| Memo | ListMemos | GET /api/v1/memos | ✅ |
| Memo | GetMemo | GET /api/v1/memos/:id | ✅ |
| Memo | UpdateMemo | PATCH /api/v1/memos/:id | ✅ |
| Memo | DeleteMemo | DELETE /api/v1/memos/:id | ✅ |
| Workspace | GetWorkspaceProfile | GET /api/v1/workspace/profile | ✅ |
| Workspace | UpdateWorkspaceSetting | PATCH /api/v1/workspace/setting | ✅ |
| Markdown | ParseMarkdown | POST /api/v1/markdown/parse | ✅ |
| User | CreateUser | - | ❌ |
| User | CreateUserAccessToken | - | ❌ |
| User | DeleteUserAccessToken | - | ❌ |
| Memo | CreateMemoComment | - | ❌ |
| Memo | UpsertMemoReaction | - | ❌ |
| Memo | DeleteMemoReaction | - | ❌ |
| Attachment | * | - | ❌ |
| Shortcut | * | - | ❌ |
| Inbox | * | - | ❌ |
| Activity | * | - | ❌ |
| Webhook | * | - | ❌ |
| IDP | * | - | ❌ |

## Known Issues

### Frontend Build Errors
The frontend currently has TypeScript errors due to missing API methods:
- `createUser` - needs implementation
- `createUserAccessToken` / `deleteUserAccessToken` - needs implementation
- `createMemoComment` - needs implementation
- `upsertMemoReaction` / `deleteMemoReaction` - needs implementation
- `renameMemoTag` / `deleteMemoTag` - needs implementation
- Many attachment/shortcut/webhook/IDP methods missing

### Database Schema
Current SQLite schema only includes User and Memo entities. Missing:
- Attachments
- Shortcuts
- Inbox items
- Activities
- Webhooks
- Identity Providers
- User Access Tokens
- Memo Relations
- Reactions

## How to Run

### Backend
```bash
cd backend
npm install
npm run start:dev  # Development mode
```

Backend runs on http://localhost:3000

### Frontend
```bash
cd web
pnpm install
pnpm dev
```

⚠️ **Note**: Frontend will have TypeScript errors until all components are updated.

## Next Steps (Priority Order)

1. **Backend: Implement Core Missing APIs**
   - Add `createUser` method to User service
   - Add access token management to User service
   - Add memo comments, reactions, tags to Memo service

2. **Backend: Add Missing Services**
   - Implement Attachment service with file handling
   - Implement Shortcut service
   - Implement Activity service

3. **Frontend: Update Core Components**
   - Update auth components (SignIn, SignUp)
   - Update user components
   - Update memo editor and viewer

4. **Frontend: Update MobX Stores**
   - Update workspace store
   - Update user store
   - Update memo store

5. **Cleanup & Testing**
   - Remove Go backend
   - Remove proto files
   - Test all workflows
   - Update documentation

## Estimated Completion Time
Based on current progress:
- Remaining Backend Work: ~2-3 days
- Frontend Migration: ~3-4 days
- Testing & Cleanup: ~1-2 days
- **Total: ~6-9 days**

## Decision Points

### Database Migration
**Question**: Should we migrate existing Go database data to NestJS schema?
**Impact**: User data, memos, settings would need migration
**Recommendation**: For this branch, start fresh. Add migration scripts later if needed.

### Proto Files
**Question**: Keep proto files for reference?
**Recommendation**: Keep in a `_archived` folder initially, remove after verification.

### Build System
**Question**: Update the existing build scripts or create new ones?
**Recommendation**: Keep both initially, migrate gradually.

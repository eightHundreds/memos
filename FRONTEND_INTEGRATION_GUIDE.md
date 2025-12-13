# Frontend Integration Guide

## Overview

This guide explains how to complete the frontend migration from gRPC to REST. The backend is 100% complete with all 13 services implemented. The frontend has a complete REST API client (`web/src/api.ts`) ready to use.

## Current Status

### ✅ Completed
- **Backend**: All 13 services fully implemented (100%)
- **REST API Client**: Complete with 60+ methods covering all services
- **Backward Compatibility**: `grpcweb.ts` exports new REST clients

### 🔄 Remaining Work (~10% of total project)
- Update React components to use REST responses
- Refactor MobX stores
- Remove Protocol Buffer type dependencies
- Remove `nice-grpc-web` dependency

## Architecture

### REST API Client Structure

```typescript
// web/src/api.ts
class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T>
  
  // Authentication
  async registerUser(username: string, password: string)
  async createSession(username: string, password: string)
  async getCurrentUser()
  
  // Users
  async listUsers()
  async getUser(userId: number)
  async updateUser(userId: number, updates: any)
  
  // Memos
  async createMemo(content: string, visibility: string)
  async listMemos()
  async getMemo(memoId: number)
  async updateMemo(memoId: number, updates: any)
  async deleteMemo(memoId: number)
  
  // Comments, Reactions, Tags
  async createMemoComment(memoId: number, content: string)
  async upsertMemoReaction(memoId: number, reactionType: string)
  async listMemoTags()
  
  // Shortcuts, Webhooks, Inbox, Activities
  async createShortcut(title: string, payload: string)
  async listWebhooks()
  async createInboxItem(type: string, message: string)
  async listActivities(limit?: number)
  
  // Attachments
  async uploadAttachment(file: File)
  async downloadAttachment(attachmentId: number)
  
  // Identity Providers
  async createIdentityProvider(name: string, type: string, config: string)
  
  // ... 60+ methods total
}

export const api = new ApiClient();
```

## Migration Steps

### Step 1: Update MobX Stores

The stores need to use the new REST API instead of gRPC clients.

**Before (gRPC):**
```typescript
// web/src/store/v2/memo.ts
import { memoServiceClient } from "@/grpcweb";

class MemoStore {
  async fetchMemos() {
    const { memos } = await memoServiceClient.listMemos({});
    return memos;
  }
}
```

**After (REST):**
```typescript
// web/src/store/v2/memo.ts
import { api } from "@/api";

class MemoStore {
  async fetchMemos() {
    const { memos } = await api.listMemos();
    return memos;
  }
}
```

### Step 2: Update React Components

Components need to handle REST response formats instead of Protocol Buffer types.

**Before (gRPC):**
```typescript
import { useMemosStore } from "@/store/v2";
import { Memo } from "@/types/proto/api/v1/memo_service";

const MemoList: React.FC = () => {
  const memosStore = useMemosStore();
  
  useEffect(() => {
    memosStore.fetchMemos();
  }, []);
  
  return (
    <div>
      {memosStore.memos.map((memo: Memo) => (
        <MemoCard key={memo.name} memo={memo} />
      ))}
    </div>
  );
};
```

**After (REST):**
```typescript
import { useMemosStore } from "@/store/v2";

interface Memo {
  id: number;
  content: string;
  visibility: string;
  createdTs: number;
  updatedTs: number;
}

const MemoList: React.FC = () => {
  const memosStore = useMemosStore();
  
  useEffect(() => {
    memosStore.fetchMemos();
  }, []);
  
  return (
    <div>
      {memosStore.memos.map((memo: Memo) => (
        <MemoCard key={memo.id} memo={memo} />
      ))}
    </div>
  );
};
```

### Step 3: Define REST Types

Create TypeScript interfaces for REST responses.

```typescript
// web/src/types/rest.ts

export interface User {
  id: number;
  username: string;
  nickname: string;
  email?: string;
  role: 'HOST' | 'USER';
  createdTs: number;
  updatedTs: number;
}

export interface Memo {
  id: number;
  creatorId: number;
  content: string;
  visibility: 'PUBLIC' | 'PROTECTED' | 'PRIVATE';
  pinned: boolean;
  createdTs: number;
  updatedTs: number;
  rowStatus: 'NORMAL' | 'ARCHIVED';
}

export interface MemoComment {
  id: number;
  memoId: number;
  creatorId: number;
  content: string;
  createdTs: number;
}

export interface MemoReaction {
  id: number;
  memoId: number;
  creatorId: number;
  reactionType: 'THUMBS_UP' | 'THUMBS_DOWN' | 'HEART' | 'FIRE' | 'CLAPPING_HANDS' | 'LAUGH' | 'OK_HAND' | 'ROCKET' | 'EYES' | 'THINKING_FACE' | 'CLOWN_FACE' | 'QUESTION_MARK';
  createdTs: number;
}

export interface Shortcut {
  id: number;
  creatorId: number;
  title: string;
  payload: string;
  createdTs: number;
  updatedTs: number;
}

export interface Webhook {
  id: number;
  creatorId: number;
  name: string;
  url: string;
  createdTs: number;
  updatedTs: number;
}

export interface Inbox {
  id: number;
  receiverId: number;
  type: string;
  activityId?: number;
  status: 'UNREAD' | 'ARCHIVED';
  message: string;
  link?: string;
  createdTs: number;
}

export interface Activity {
  id: number;
  creatorId: number;
  type: string;
  level: string;
  payload: string;
  createdTs: number;
}

export interface Attachment {
  id: number;
  creatorId: number;
  filename: string;
  externalLink?: string;
  type: string;
  size: number;
  createdTs: number;
  updatedTs: number;
}

export interface IdentityProvider {
  id: number;
  name: string;
  type: 'OAUTH2' | 'LDAP';
  identifierFilter: string;
  config: string;
}

export interface Workspace {
  name: string;
  logoUrl?: string;
  description?: string;
  customProfile?: string;
}

export interface AccessToken {
  id: number;
  userId: number;
  token: string;
  description?: string;
  issuedAt: number;
  expiresAt?: number;
}
```

### Step 4: Update Package Dependencies

Remove gRPC-related dependencies and update package.json.

```bash
cd web
pnpm remove nice-grpc-web @protobuf-ts/runtime @protobuf-ts/runtime-rpc
```

### Step 5: Remove Protocol Buffer Files

After all components are migrated:

```bash
cd web
rm -rf src/types/proto
```

## Files to Update

### High Priority (Core Functionality)

1. **`web/src/store/v2/memo.ts`** - Memo store
2. **`web/src/store/v2/user.ts`** - User store  
3. **`web/src/store/v2/workspace.ts`** - Workspace store
4. **`web/src/components/MemoEditor.tsx`** - Memo creation
5. **`web/src/components/MemoView.tsx`** - Memo display
6. **`web/src/components/MemoList.tsx`** - Memo list
7. **`web/src/pages/Auth.tsx`** - Authentication pages
8. **`web/src/pages/Home.tsx`** - Home page

### Medium Priority

9. **`web/src/store/v2/shortcut.ts`** - Shortcut store
10. **`web/src/store/v2/webhook.ts`** - Webhook store
11. **`web/src/store/v2/activity.ts`** - Activity store
12. **`web/src/components/Settings.tsx`** - Settings page
13. **`web/src/components/UserProfile.tsx`** - User profile

### Low Priority

14-50. Other component files using gRPC

## Testing Strategy

### 1. Unit Tests

Create tests for the REST API client:

```typescript
// web/src/api.test.ts
import { api } from './api';

describe('API Client', () => {
  it('should fetch memos', async () => {
    const { memos } = await api.listMemos();
    expect(Array.isArray(memos)).toBe(true);
  });
  
  it('should create memo', async () => {
    const memo = await api.createMemo('Test content', 'PRIVATE');
    expect(memo.content).toBe('Test content');
  });
});
```

### 2. Integration Tests

Test stores with the REST API:

```typescript
// web/src/store/v2/memo.test.ts
import { MemoStore } from './memo';

describe('MemoStore', () => {
  let store: MemoStore;
  
  beforeEach(() => {
    store = new MemoStore();
  });
  
  it('should fetch and store memos', async () => {
    await store.fetchMemos();
    expect(store.memos.length).toBeGreaterThan(0);
  });
});
```

### 3. E2E Tests

Use the backend test script to ensure API is working:

```bash
cd backend
npm run start:dev

# In another terminal
bash test-all-services.sh
```

## Common Patterns

### Pattern 1: List Resources

```typescript
// Before (gRPC)
const { memos } = await memoServiceClient.listMemos({
  pageSize: 10,
  pageToken: ""
});

// After (REST)
const { memos } = await api.listMemos();
```

### Pattern 2: Get Resource by ID

```typescript
// Before (gRPC)
const memo = await memoServiceClient.getMemo({
  name: `memos/${memoId}`
});

// After (REST)
const memo = await api.getMemo(memoId);
```

### Pattern 3: Create Resource

```typescript
// Before (gRPC)
const memo = await memoServiceClient.createMemo({
  content: "Hello World",
  visibility: Visibility.PRIVATE
});

// After (REST)
const memo = await api.createMemo("Hello World", "PRIVATE");
```

### Pattern 4: Update Resource

```typescript
// Before (gRPC)
const memo = await memoServiceClient.updateMemo({
  memo: {
    name: `memos/${memoId}`,
    content: "Updated content"
  },
  updateMask: { paths: ["content"] }
});

// After (REST)
const memo = await api.updateMemo(memoId, {
  content: "Updated content"
});
```

### Pattern 5: Delete Resource

```typescript
// Before (gRPC)
await memoServiceClient.deleteMemo({
  name: `memos/${memoId}`
});

// After (REST)
await api.deleteMemo(memoId);
```

## Error Handling

### REST API Error Format

```typescript
try {
  await api.createMemo(content, visibility);
} catch (error) {
  if (error.response?.status === 401) {
    // Unauthorized - redirect to login
    router.push('/auth');
  } else if (error.response?.status === 400) {
    // Bad request - show validation error
    toast.error(error.response.data.message);
  } else {
    // Generic error
    toast.error('An error occurred');
  }
}
```

## Performance Considerations

1. **Token Storage**: JWT token is stored in localStorage
2. **Request Caching**: Consider adding a caching layer for frequently accessed data
3. **Batch Requests**: For multiple related requests, consider creating batch endpoints
4. **Lazy Loading**: Load data on-demand rather than upfront

## Example: Complete Migration of MemoEditor

Here's a complete example of migrating the MemoEditor component:

**Before (gRPC):**
```typescript
import { memoServiceClient } from "@/grpcweb";
import { Visibility } from "@/types/proto/api/v1/common";

const MemoEditor: React.FC = () => {
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState(Visibility.PRIVATE);
  
  const handleCreate = async () => {
    try {
      await memoServiceClient.createMemo({
        content,
        visibility
      });
      toast.success("Memo created");
    } catch (error) {
      toast.error("Failed to create memo");
    }
  };
  
  return (
    <div>
      <textarea value={content} onChange={e => setContent(e.target.value)} />
      <select value={visibility} onChange={e => setVisibility(e.target.value as Visibility)}>
        <option value={Visibility.PRIVATE}>Private</option>
        <option value={Visibility.PROTECTED}>Protected</option>
        <option value={Visibility.PUBLIC}>Public</option>
      </select>
      <button onClick={handleCreate}>Create</button>
    </div>
  );
};
```

**After (REST):**
```typescript
import { api } from "@/api";

type Visibility = 'PRIVATE' | 'PROTECTED' | 'PUBLIC';

const MemoEditor: React.FC = () => {
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<Visibility>('PRIVATE');
  
  const handleCreate = async () => {
    try {
      await api.createMemo(content, visibility);
      toast.success("Memo created");
    } catch (error) {
      toast.error("Failed to create memo");
    }
  };
  
  return (
    <div>
      <textarea value={content} onChange={e => setContent(e.target.value)} />
      <select value={visibility} onChange={e => setVisibility(e.target.value as Visibility)}>
        <option value="PRIVATE">Private</option>
        <option value="PROTECTED">Protected</option>
        <option value="PUBLIC">Public</option>
      </select>
      <button onClick={handleCreate}>Create</button>
    </div>
  );
};
```

## Rollout Strategy

### Phase 1: Core Features (Week 1)
1. Authentication pages
2. Memo creation and viewing
3. Basic user profile

### Phase 2: Extended Features (Week 2)
4. Memo comments and reactions
5. Tags management
6. Shortcuts

### Phase 3: Admin Features (Week 3)
7. Workspace settings
8. Webhooks
9. Identity providers

### Phase 4: Polish (Week 4)
10. Remove all Protocol Buffer dependencies
11. Clean up old gRPC code
12. Update documentation
13. Final testing

## Troubleshooting

### Issue: "Token not found"
**Solution**: Ensure `localStorage.setItem('auth_token', token)` is called after login

### Issue: "CORS error"
**Solution**: Backend has CORS enabled. Verify backend is running on `http://localhost:3000`

### Issue: "404 Not Found"
**Solution**: Check API endpoint URL. Backend uses `/api/v1/*` prefix

### Issue: "Type mismatch"
**Solution**: Update TypeScript interfaces to match REST response format

## Resources

- **Backend API**: http://localhost:3000/api/v1
- **API Client**: `web/src/api.ts`
- **Backend Test**: `backend/test-all-services.sh`
- **Swagger Docs**: (can be added to NestJS backend)

## Conclusion

The backend migration is 100% complete with all services implemented and tested. The frontend has a complete REST API client ready. The remaining work is straightforward component and store updates following the patterns shown in this guide.

Estimated time to complete frontend migration: **8-12 hours** for an experienced developer.

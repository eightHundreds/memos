// REST API Client for Memos Backend
// Replaces the gRPC client with simple fetch-based REST calls

const API_BASE_URL = '/api/v1';

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('auth_token');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }

  // Auth Service
  async signIn(username: string, password: string) {
    const result = await this.request<{ user: any; accessToken: string }>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (result.accessToken) {
      localStorage.setItem('auth_token', result.accessToken);
    }
    return result;
  }

  async signUp(username: string, password: string, nickname?: string) {
    const result = await this.request<{ user: any; accessToken: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, password, nickname }),
    });
    if (result.accessToken) {
      localStorage.setItem('auth_token', result.accessToken);
    }
    return result;
  }

  async getMe() {
    return this.request<any>('/auth/me');
  }

  async signOut() {
    localStorage.removeItem('auth_token');
  }

  // User Service
  async createUser(data: { username: string; password: string; role?: string; nickname?: string }) {
    return this.request<any>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listUsers() {
    return this.request<{ users: any[] }>('/users');
  }

  async getUser(id: number) {
    return this.request<any>(`/users/${id}`);
  }

  async updateUser(id: number, data: any) {
    return this.request<any>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: number) {
    return this.request<{ message: string }>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // User Access Tokens (stub - needs backend implementation)
  async createUserAccessToken(userId: number, description: string) {
    return this.request<any>(`/users/${userId}/access-tokens`, {
      method: 'POST',
      body: JSON.stringify({ description }),
    });
  }

  async listUserAccessTokens(userId: number) {
    return this.request<any[]>(`/users/${userId}/access-tokens`);
  }

  async deleteUserAccessToken(userId: number, tokenId: number) {
    return this.request<{ message: string }>(`/users/${userId}/access-tokens/${tokenId}`, {
      method: 'DELETE',
    });
  }

  // Memo Service
  async createMemo(data: { content: string; visibility?: string; pinned?: boolean }) {
    return this.request<any>('/memos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listMemos(params?: { visibility?: string; creatorId?: string; limit?: number; offset?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.visibility) queryParams.append('visibility', params.visibility);
    if (params?.creatorId) queryParams.append('creatorId', params.creatorId);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const query = queryParams.toString();
    return this.request<{ memos: any[] }>(`/memos${query ? `?${query}` : ''}`);
  }

  async getMemo(id: number) {
    return this.request<any>(`/memos/${id}`);
  }

  async updateMemo(id: number, data: { content?: string; visibility?: string; pinned?: boolean }) {
    return this.request<any>(`/memos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteMemo(id: number) {
    return this.request<{ message: string }>(`/memos/${id}`, {
      method: 'DELETE',
    });
  }

  // Memo extended methods (stub - needs backend implementation)
  async createMemoComment(memoId: number, content: string) {
    return this.request<any>(`/memos/${memoId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async upsertMemoReaction(memoId: number, reactionType: string) {
    return this.request<any>(`/memos/${memoId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ reactionType }),
    });
  }

  async deleteMemoReaction(memoId: number, reactionId: number) {
    return this.request<{ message: string }>(`/memos/${memoId}/reactions/${reactionId}`, {
      method: 'DELETE',
    });
  }

  async renameMemoTag(oldTag: string, newTag: string) {
    return this.request<any>('/memos/tags/rename', {
      method: 'POST',
      body: JSON.stringify({ oldTag, newTag }),
    });
  }

  async deleteMemoTag(tag: string) {
    return this.request<{ message: string }>(`/memos/tags/${encodeURIComponent(tag)}`, {
      method: 'DELETE',
    });
  }

  // Workspace Service
  async getWorkspaceProfile() {
    return this.request<any>('/workspace/profile');
  }

  async updateWorkspaceSetting(data: { name?: string; description?: string; logoUrl?: string }) {
    return this.request<any>('/workspace/setting', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Markdown Service
  async parseMarkdown(content: string) {
    return this.request<{ content: string; html: string }>('/markdown/parse', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async restoreMarkdownNodes(content: string) {
    // Stub - returns same content for now
    return { nodes: [], content };
  }

  async getLinkMetadata(link: string) {
    // Stub - returns basic metadata
    return { title: link, description: '', image: '' };
  }

  // Attachment Service (stub - needs backend implementation)
  async uploadAttachment(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/attachments`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  }

  async listAttachments() {
    return this.request<any[]>('/attachments');
  }

  async deleteAttachment(id: number) {
    return this.request<{ message: string }>(`/attachments/${id}`, {
      method: 'DELETE',
    });
  }

  // Shortcut Service (stub - needs backend implementation)
  async createShortcut(data: any) {
    return this.request<any>('/shortcuts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateShortcut(id: number, data: any) {
    return this.request<any>(`/shortcuts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteShortcut(id: number) {
    return this.request<{ message: string }>(`/shortcuts/${id}`, {
      method: 'DELETE',
    });
  }

  // Webhook Service (stub - needs backend implementation)
  async listWebhooks() {
    return this.request<any[]>('/webhooks');
  }

  async getWebhook(id: number) {
    return this.request<any>(`/webhooks/${id}`);
  }

  async createWebhook(data: any) {
    return this.request<any>('/webhooks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateWebhook(id: number, data: any) {
    return this.request<any>(`/webhooks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteWebhook(id: number) {
    return this.request<{ message: string }>(`/webhooks/${id}`, {
      method: 'DELETE',
    });
  }

  // Identity Provider Service (stub - needs backend implementation)
  async listIdentityProviders() {
    return this.request<any[]>('/identity-providers');
  }

  async createIdentityProvider(data: any) {
    return this.request<any>('/identity-providers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateIdentityProvider(id: number, data: any) {
    return this.request<any>(`/identity-providers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteIdentityProvider(id: number) {
    return this.request<{ message: string }>(`/identity-providers/${id}`, {
      method: 'DELETE',
    });
  }

  // Activity Service (stub - needs backend implementation)
  async getActivity(id: number) {
    return this.request<any>(`/activities/${id}`);
  }

  // Session management (for compatibility)
  async createSession(data: any) {
    return this.signIn(data.username, data.password);
  }

  async deleteSession() {
    return this.signOut();
  }

  async registerUser(data: any) {
    return this.signUp(data.username, data.password, data.nickname);
  }
}

export const apiClient = new ApiClient();

// Legacy exports for backward compatibility - will be removed later
export const authServiceClient = {
  signIn: (req: any) => apiClient.signIn(req.username, req.password),
  signUp: (req: any) => apiClient.signUp(req.username, req.password, req.nickname),
  getAuthStatus: () => apiClient.getMe(),
  createSession: (req: any) => apiClient.createSession(req),
  deleteSession: () => apiClient.deleteSession(),
  registerUser: (req: any) => apiClient.registerUser(req),
};

export const userServiceClient = {
  createUser: (req: any) => apiClient.createUser(req),
  listUsers: () => apiClient.listUsers(),
  getUser: (req: { id: number }) => apiClient.getUser(req.id),
  updateUser: (req: any) => apiClient.updateUser(req.id, req),
  deleteUser: (req: { id: number }) => apiClient.deleteUser(req.id),
  createUserAccessToken: (req: any) => apiClient.createUserAccessToken(req.userId, req.description),
  listUserAccessTokens: (req: { userId: number }) => apiClient.listUserAccessTokens(req.userId),
  deleteUserAccessToken: (req: any) => apiClient.deleteUserAccessToken(req.userId, req.tokenId),
};

export const memoServiceClient = {
  createMemo: (req: any) => apiClient.createMemo(req),
  listMemos: (req: any) => apiClient.listMemos(req),
  getMemo: (req: { id: number }) => apiClient.getMemo(req.id),
  updateMemo: (req: any) => apiClient.updateMemo(req.id, req),
  deleteMemo: (req: { id: number }) => apiClient.deleteMemo(req.id),
  createMemoComment: (req: any) => apiClient.createMemoComment(req.memoId, req.content),
  upsertMemoReaction: (req: any) => apiClient.upsertMemoReaction(req.memoId, req.reactionType),
  deleteMemoReaction: (req: any) => apiClient.deleteMemoReaction(req.memoId, req.reactionId),
  renameMemoTag: (req: any) => apiClient.renameMemoTag(req.oldTag, req.newTag),
  deleteMemoTag: (req: any) => apiClient.deleteMemoTag(req.tag),
};

export const workspaceServiceClient = {
  getWorkspaceProfile: () => apiClient.getWorkspaceProfile(),
  updateWorkspaceSetting: (req: any) => apiClient.updateWorkspaceSetting(req),
};

export const markdownServiceClient = {
  parseMarkdown: (req: { content: string }) => apiClient.parseMarkdown(req.content),
  restoreMarkdownNodes: (req: any) => apiClient.restoreMarkdownNodes(req.content),
  getLinkMetadata: (req: { link: string }) => apiClient.getLinkMetadata(req.link),
};

export const attachmentServiceClient = {
  uploadAttachment: (req: { file: File }) => apiClient.uploadAttachment(req.file),
  listAttachments: () => apiClient.listAttachments(),
  deleteAttachment: (req: { id: number }) => apiClient.deleteAttachment(req.id),
};

export const shortcutServiceClient = {
  createShortcut: (req: any) => apiClient.createShortcut(req),
  updateShortcut: (req: any) => apiClient.updateShortcut(req.id, req),
  deleteShortcut: (req: { id: number }) => apiClient.deleteShortcut(req.id),
};

export const inboxServiceClient = {
  // Stub for now
};

export const activityServiceClient = {
  getActivity: (req: { id: number }) => apiClient.getActivity(req.id),
};

export const webhookServiceClient = {
  listWebhooks: () => apiClient.listWebhooks(),
  getWebhook: (req: { id: number }) => apiClient.getWebhook(req.id),
  createWebhook: (req: any) => apiClient.createWebhook(req),
  updateWebhook: (req: any) => apiClient.updateWebhook(req.id, req),
  deleteWebhook: (req: { id: number }) => apiClient.deleteWebhook(req.id),
};

export const identityProviderServiceClient = {
  listIdentityProviders: () => apiClient.listIdentityProviders(),
  createIdentityProvider: (req: any) => apiClient.createIdentityProvider(req),
  updateIdentityProvider: (req: any) => apiClient.updateIdentityProvider(req.id, req),
  deleteIdentityProvider: (req: { id: number }) => apiClient.deleteIdentityProvider(req.id),
};

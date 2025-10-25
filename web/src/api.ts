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
}

export const apiClient = new ApiClient();

// Legacy exports for backward compatibility - will be removed later
export const authServiceClient = {
  signIn: (req: any) => apiClient.signIn(req.username, req.password),
  signUp: (req: any) => apiClient.signUp(req.username, req.password, req.nickname),
  getAuthStatus: () => apiClient.getMe(),
};

export const userServiceClient = {
  listUsers: () => apiClient.listUsers(),
  getUser: (req: { id: number }) => apiClient.getUser(req.id),
  updateUser: (req: any) => apiClient.updateUser(req.id, req),
  deleteUser: (req: { id: number }) => apiClient.deleteUser(req.id),
};

export const memoServiceClient = {
  createMemo: (req: any) => apiClient.createMemo(req),
  listMemos: (req: any) => apiClient.listMemos(req),
  getMemo: (req: { id: number }) => apiClient.getMemo(req.id),
  updateMemo: (req: any) => apiClient.updateMemo(req.id, req),
  deleteMemo: (req: { id: number }) => apiClient.deleteMemo(req.id),
};

export const workspaceServiceClient = {
  getWorkspaceProfile: () => apiClient.getWorkspaceProfile(),
  updateWorkspaceSetting: (req: any) => apiClient.updateWorkspaceSetting(req),
};

export const markdownServiceClient = {
  parseMarkdown: (req: { content: string }) => apiClient.parseMarkdown(req.content),
};

// Stub implementations for other services (to be implemented)
export const attachmentServiceClient = {};
export const shortcutServiceClient = {};
export const inboxServiceClient = {};
export const activityServiceClient = {};
export const webhookServiceClient = {};
export const identityProviderServiceClient = {};

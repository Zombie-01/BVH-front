// API Service for external backend calls
// All data except auth/profiles comes from external API

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://your-api-domain.com/api/v1";

interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  headers?: Record<string, string>;
}

class ApiService {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<T> {
    const { method = "GET", body, headers = {} } = options;

    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    };

    if (this.authToken) {
      requestHeaders["Authorization"] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Request failed" }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Stores
  async getStores(params?: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.category) query.set("category", params.category);
    if (params?.search) query.set("search", params.search);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    return this.request(`/stores?${query.toString()}`);
  }

  async getStore(id: string) {
    return this.request(`/stores/${id}`);
  }

  // Products
  async getProducts(
    storeId: string,
    params?: { category?: string; search?: string }
  ) {
    const query = new URLSearchParams();
    if (params?.category) query.set("category", params.category);
    if (params?.search) query.set("search", params.search);
    return this.request(`/stores/${storeId}/products?${query.toString()}`);
  }

  async getProduct(id: string) {
    return this.request(`/products/${id}`);
  }

  // Orders
  async getOrders(params?: { status?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    return this.request(`/orders?${query.toString()}`);
  }

  async getOrder(id: string) {
    return this.request(`/orders/${id}`);
  }

  async createOrder(data: unknown) {
    return this.request("/orders", { method: "POST", body: data });
  }

  async updateOrderStatus(id: string, status: string) {
    return this.request(`/orders/${id}/status`, {
      method: "PUT",
      body: { status },
    });
  }

  // Service Workers
  async getWorkers(params?: { specialty?: string; available?: boolean }) {
    const query = new URLSearchParams();
    if (params?.specialty) query.set("specialty", params.specialty);
    if (params?.available !== undefined)
      query.set("available", String(params.available));
    return this.request(`/workers?${query.toString()}`);
  }

  async getWorker(id: string) {
    return this.request(`/workers/${id}`);
  }

  // Service Jobs
  async getJobs(params?: { status?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    return this.request(`/jobs?${query.toString()}`);
  }

  async getJob(id: string) {
    return this.request(`/jobs/${id}`);
  }

  async createJob(data: unknown) {
    return this.request("/jobs", { method: "POST", body: data });
  }

  // Chats
  async getChats() {
    return this.request("/chats");
  }

  async getChat(id: string) {
    return this.request(`/chats/${id}`);
  }

  async getChatMessages(
    chatId: string,
    params?: { before?: string; limit?: number }
  ) {
    const query = new URLSearchParams();
    if (params?.before) query.set("before", params.before);
    if (params?.limit) query.set("limit", String(params.limit));
    return this.request(`/chats/${chatId}/messages?${query.toString()}`);
  }

  async sendMessage(chatId: string, data: { content: string; type?: string }) {
    return this.request(`/chats/${chatId}/messages`, {
      method: "POST",
      body: data,
    });
  }

  // Delivery Tasks (for drivers)
  async getDeliveryTasks(params?: { status?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    return this.request(`/delivery-tasks?${query.toString()}`);
  }

  async updateDeliveryTask(id: string, data: unknown) {
    return this.request(`/delivery-tasks/${id}`, { method: "PUT", body: data });
  }
}

export const api = new ApiService(API_BASE_URL);
export default api;

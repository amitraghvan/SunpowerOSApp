const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1`
  : 'http://localhost:4000/api/v1';

export class ApiClient {
  private static token: string | null = null;

  static setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('solaros_platform_token', token);
      } else {
        localStorage.removeItem('solaros_platform_token');
        localStorage.removeItem('solaros_platform_admin');
      }
    }
  }

  static getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('solaros_platform_token');
    }
    return this.token;
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> || {}),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch {
          // ignore
        }
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      return (await response.json()) as T;
    } catch (err: any) {
      console.warn(`[Platform Admin API Error] ${endpoint}:`, err.message);
      throw err;
    }
  }

  // --- Auth ---
  static async login(data: { email: string; password: string }) {
    const res = await this.request<any>('/platform-admin/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res?.accessToken) {
      this.setToken(res.accessToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem('solaros_platform_admin', JSON.stringify(res.admin));
      }
    }
    return res;
  }

  static async getMe() {
    return this.request<any>('/platform-admin/auth/me');
  }

  // --- Overview ---
  static async getOverview() {
    return this.request<any>('/platform-admin/overview');
  }

  // --- Organizations ---
  static async getOrganizations(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any>(`/platform-admin/organizations${query}`);
  }

  static async getOrganizationDetail(id: string) {
    return this.request<any>(`/platform-admin/organizations/${id}`);
  }

  static async suspendOrganization(id: string, reason: string) {
    return this.request<any>(`/platform-admin/organizations/${id}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  static async reactivateOrganization(id: string, notes?: string) {
    return this.request<any>(`/platform-admin/organizations/${id}/reactivate`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  static async updateOrganizationSubscription(id: string, data: any) {
    return this.request<any>(`/platform-admin/organizations/${id}/subscription`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // --- Global Users ---
  static async getUsers(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any>(`/platform-admin/users${query}`);
  }

  // --- Enquiries ---
  static async getEnquiries(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any>(`/platform-admin/enquiries${query}`);
  }

  static async getEnquiryDetail(id: string) {
    return this.request<any>(`/platform-admin/enquiries/${id}`);
  }

  static async updateEnquiryStatus(id: string, status: string, notes?: string) {
    return this.request<any>(`/platform-admin/enquiries/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  }

  static async assignEnquiry(id: string, assignedToId: string) {
    return this.request<any>(`/platform-admin/enquiries/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ assignedToId }),
    });
  }

  static async addEnquiryNote(id: string, notes: string) {
    return this.request<any>(`/platform-admin/enquiries/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  // --- Support Tickets ---
  static async getSupportTickets(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any>(`/platform-admin/support/tickets${query}`);
  }

  static async getSupportTicketDetail(id: string) {
    return this.request<any>(`/platform-admin/support/tickets/${id}`);
  }

  static async replySupportTicket(id: string, message: string, isInternalOnly?: boolean) {
    return this.request<any>(`/platform-admin/support/tickets/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify({ message, isInternalOnly }),
    });
  }

  static async updateSupportTicketStatus(id: string, status: string, resolutionNotes?: string) {
    return this.request<any>(`/platform-admin/support/tickets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, resolutionNotes }),
    });
  }

  static async assignSupportTicket(id: string, assignedToId: string) {
    return this.request<any>(`/platform-admin/support/tickets/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ assignedToId }),
    });
  }

  // --- Analytics ---
  static async getAnalytics() {
    return this.request<any>('/platform-admin/analytics');
  }

  // --- Health & Alerts ---
  static async getHealth() {
    return this.request<any>('/platform-admin/health');
  }

  static async getAlerts(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any>(`/platform-admin/alerts${query}`);
  }

  static async acknowledgeAlert(id: string) {
    return this.request<any>(`/platform-admin/alerts/${id}/acknowledge`, {
      method: 'POST',
    });
  }

  static async resolveAlert(id: string, notes?: string) {
    return this.request<any>(`/platform-admin/alerts/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  // --- Audit Logs ---
  static async getAuditLogs(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any>(`/platform-admin/audit-logs${query}`);
  }

  // --- Administrators ---
  static async getAdministrators() {
    return this.request<any>('/platform-admin/administrators');
  }

  static async createAdministrator(data: any) {
    return this.request<any>('/platform-admin/administrators', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateAdministrator(id: string, data: any) {
    return this.request<any>(`/platform-admin/administrators/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // --- SaaS Plans ---
  static async getPlans() {
    return this.request<any>('/platform-admin/plans');
  }

  static async createPlan(data: any) {
    return this.request<any>('/platform-admin/plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updatePlan(id: string, data: any) {
    return this.request<any>(`/platform-admin/plans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

import { API_CONSTANTS } from '@solaros/config';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

// Default tenant for development demo / frontend session context
const DEFAULT_TENANT_ID = 'demo-tenant-id';

export class ApiClient {
  private static organizationId: string = DEFAULT_TENANT_ID;
  private static sessionToken: string | null = null;

  static setOrganizationId(orgId: string) {
    this.organizationId = orgId;
  }

  static getOrganizationId(): string {
    return this.organizationId;
  }

  static setSessionToken(token: string | null) {
    this.sessionToken = token;
  }

  static getSessionToken(): string | null {
    return this.sessionToken;
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      [API_CONSTANTS.TENANT_ID_HEADER]: this.organizationId,
      ...(this.sessionToken ? { Authorization: `Bearer ${this.sessionToken}` } : {}),
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
          // ignore parsing error
        }
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      return (await response.json()) as T;
    } catch (err: any) {
      console.warn(`API Error [${endpoint}]:`, err.message);
      throw err;
    }
  }

  // ---------------------------------------------------------------------------
  // CRM & Leads
  // ---------------------------------------------------------------------------
  static async getLeads(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any>(`/crm/leads${query}`);
  }

  static async getLeadById(id: string) {
    return this.request<any>(`/crm/leads/${id}`);
  }

  static async createLead(data: any) {
    return this.request<any>('/crm/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateLead(id: string, data: any) {
    return this.request<any>(`/crm/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  static async changeLeadStatus(id: string, status: string, reason?: string) {
    return this.request<any>(`/crm/leads/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, reason }),
    });
  }

  static async addLeadActivity(id: string, activity: any) {
    return this.request<any>(`/crm/leads/${id}/activities`, {
      method: 'POST',
      body: JSON.stringify(activity),
    });
  }

  static async convertLead(id: string, data?: any) {
    return this.request<any>(`/crm/leads/${id}/convert`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  static async checkDuplicateLead(phone: string, email?: string) {
    const params = new URLSearchParams({ phone });
    if (email) params.append('email', email);
    return this.request<any>(`/crm/leads/duplicates?${params.toString()}`);
  }

  static async getCrmAnalytics() {
    return this.request<any>('/crm/analytics');
  }

  // ---------------------------------------------------------------------------
  // Customers & Customer 360
  // ---------------------------------------------------------------------------
  static async getCustomers(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any>(`/customers${query}`);
  }

  static async getCustomerById(id: string) {
    return this.request<any>(`/customers/${id}`);
  }

  static async getCustomer360(id: string) {
    return this.request<any>(`/customers/${id}/360`);
  }

  static async createCustomer(data: any) {
    return this.request<any>('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateCustomer(id: string, data: any) {
    return this.request<any>(`/customers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  static async addCustomerContact(customerId: string, data: any) {
    return this.request<any>(`/customers/${customerId}/contacts`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async addCustomerAddress(customerId: string, data: any) {
    return this.request<any>(`/customers/${customerId}/addresses`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async addCustomerSite(customerId: string, data: any) {
    return this.request<any>(`/customers/${customerId}/sites`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getCustomerSites(customerId: string) {
    return this.request<any>(`/customers/${customerId}/sites`);
  }

  // ---------------------------------------------------------------------------
  // Surveys & Assessments
  // ---------------------------------------------------------------------------
  static async getSurveys(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any>(`/surveys${query}`);
  }

  static async getSurveyById(id: string) {
    return this.request<any>(`/surveys/${id}`);
  }

  static async createSurvey(data: any) {
    return this.request<any>('/surveys', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async scheduleSurvey(id: string, data: any) {
    return this.request<any>(`/surveys/${id}/schedule`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async submitSurveyAssessment(id: string, data: any) {
    return this.request<any>(`/surveys/${id}/assessment`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async reviewSurvey(id: string, action: 'APPROVE' | 'REQUEST_REVISION', rejectionReason?: string) {
    return this.request<any>(`/surveys/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ action, rejectionReason }),
    });
  }

  static async requestPhotoUploadUrl(id: string, data: any) {
    return this.request<any>(`/surveys/${id}/photos/upload-url`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async confirmPhotoUpload(id: string, data: any) {
    return this.request<any>(`/surveys/${id}/photos/confirm`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getSurveyPhotos(id: string) {
    return this.request<any>(`/surveys/${id}/photos`);
  }

  static async getSurveyReport(id: string) {
    return this.request<any>(`/surveys/${id}/report`);
  }

  // ---------------------------------------------------------------------------
  // Catalog & Products
  // ---------------------------------------------------------------------------
  static async getCategories() {
    return this.request<any>('/catalog/categories');
  }

  static async createCategory(data: any) {
    return this.request<any>('/catalog/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getManufacturers() {
    return this.request<any>('/catalog/manufacturers');
  }

  static async createManufacturer(data: any) {
    return this.request<any>('/catalog/manufacturers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getProducts(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any>(`/catalog/products${query}`);
  }

  static async getProductById(id: string) {
    return this.request<any>(`/catalog/products/${id}`);
  }

  static async createProduct(data: any) {
    return this.request<any>('/catalog/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async createVariant(productId: string, data: any) {
    return this.request<any>(`/catalog/products/${productId}/variants`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateVariantPrice(variantId: string, data: any) {
    return this.request<any>(`/catalog/variants/${variantId}/price`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  static async getPriceHistory(variantId: string) {
    return this.request<any>(`/catalog/variants/${variantId}/price-history`);
  }

  static async getAttributeDefinitions(categoryId: string) {
    return this.request<any>(`/catalog/categories/${categoryId}/attribute-definitions`);
  }

  static async createAttributeDefinition(data: any) {
    return this.request<any>('/catalog/attribute-definitions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async setProductAttributes(productId: string, attributes: any[]) {
    return this.request<any>(`/catalog/products/${productId}/attributes`, {
      method: 'POST',
      body: JSON.stringify({ attributes }),
    });
  }

  // ---------------------------------------------------------------------------
  // Authentication & Identity
  // ---------------------------------------------------------------------------
  static async login(data: { email: string; password?: string; organizationSlug?: string; rememberMe?: boolean }) {
    const res = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.sessionToken) {
      this.setSessionToken(res.sessionToken);
    }
    if (res.activeOrganization?.id) {
      this.setOrganizationId(res.activeOrganization.id);
    }
    return res;
  }

  static async logout() {
    try {
      await this.request<any>('/auth/logout', { method: 'POST' });
    } finally {
      this.setSessionToken(null);
    }
  }

  static async getMe() {
    return this.request<any>('/auth/me');
  }

  static async forgotPassword(email: string) {
    return this.request<any>('/auth/password/forgot', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  static async resetPassword(token: string, newPassword: string) {
    return this.request<any>('/auth/password/reset', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  // ---------------------------------------------------------------------------
  // User Administration & Roles
  // ---------------------------------------------------------------------------
  static async getUsers() {
    return this.request<any[]>('/users');
  }

  static async getUserById(id: string) {
    return this.request<any>(`/users/${id}`);
  }

  static async createUser(data: any) {
    return this.request<any>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateUser(id: string, data: any) {
    return this.request<any>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  static async assignRoles(userId: string, roleIds: string[]) {
    return this.request<any>(`/users/${userId}/roles`, {
      method: 'PUT',
      body: JSON.stringify({ roleIds }),
    });
  }

  // ---------------------------------------------------------------------------
  // Access Control & Permissions
  // ---------------------------------------------------------------------------
  static async getPermissions() {
    return this.request<any[]>('/access-control/permissions');
  }

  static async getRoles() {
    return this.request<any[]>('/access-control/roles');
  }

  static async getRoleById(id: string) {
    return this.request<any>(`/access-control/roles/${id}`);
  }

  static async createRole(data: any) {
    return this.request<any>('/access-control/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateRole(id: string, data: any) {
    return this.request<any>(`/access-control/roles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  static async deleteRole(id: string) {
    return this.request<any>(`/access-control/roles/${id}`, {
      method: 'DELETE',
    });
  }

  // ---------------------------------------------------------------------------
  // Organizations & Branches
  // ---------------------------------------------------------------------------
  static async getOrganizations() {
    return this.request<any[]>('/organizations');
  }

  static async switchOrganization(organizationId: string, branchId?: string) {
    const res = await this.request<any>(`/organizations/${organizationId}/switch`, {
      method: 'POST',
      body: JSON.stringify({ branchId }),
    });
    if (res.sessionToken) {
      this.setSessionToken(res.sessionToken);
    }
    if (res.activeOrganization?.id) {
      this.setOrganizationId(res.activeOrganization.id);
    }
    return res;
  }

  static async getBranches(organizationId: string) {
    return this.request<any[]>(`/organizations/${organizationId}/branches`);
  }

  static async createBranch(organizationId: string, data: any) {
    return this.request<any>(`/organizations/${organizationId}/branches`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getInvitations(organizationId: string) {
    return this.request<any[]>(`/organizations/${organizationId}/invitations`);
  }

  static async createInvitation(organizationId: string, data: any) {
    return this.request<any>(`/organizations/${organizationId}/invitations`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async acceptInvitation(data: any) {
    return this.request<any>('/organizations/invitations/accept', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ---------------------------------------------------------------------------
  // Sessions & Device Security
  // ---------------------------------------------------------------------------
  static async getSessions() {
    return this.request<any[]>('/sessions');
  }

  static async revokeSession(id: string) {
    return this.request<any>(`/sessions/${id}`, {
      method: 'DELETE',
    });
  }

  static async revokeOtherSessions() {
    return this.request<any>('/sessions', {
      method: 'DELETE',
    });
  }

  // ---------------------------------------------------------------------------
  // Engineering & Technical Design (Phase 2)
  // ---------------------------------------------------------------------------
  static async getDesigns(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any[]>(`/engineering/designs${query}`);
  }

  static async getDesignById(id: string) {
    return this.request<any>(`/engineering/designs/${id}`);
  }

  static async createDesign(data: any) {
    return this.request<any>('/engineering/designs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async configureDesignRevision(designId: string, revNum: number, data: any) {
    return this.request<any>(`/engineering/designs/${designId}/revisions/${revNum}/configure`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async runCalculations(designId: string, revNum: number, data: any) {
    return this.request<any>(`/engineering/designs/${designId}/revisions/${revNum}/calculate`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async approveDesign(designId: string) {
    return this.request<any>(`/engineering/designs/${designId}/approve`, {
      method: 'POST',
    });
  }

  static async generateBom(designId: string, revNum: number) {
    return this.request<any>(`/engineering/designs/${designId}/revisions/${revNum}/generate-bom`, {
      method: 'POST',
    });
  }

  static async getBomById(bomId: string) {
    return this.request<any>(`/engineering/boms/${bomId}`);
  }

  static async approveBom(bomId: string) {
    return this.request<any>(`/engineering/boms/${bomId}/approve`, {
      method: 'POST',
    });
  }

  // ---------------------------------------------------------------------------
  // Quotations & Pricing (Phase 2)
  // ---------------------------------------------------------------------------
  static async getQuotations(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any[]>(`/quotations${query}`);
  }

  static async getQuotationById(id: string) {
    return this.request<any>(`/quotations/${id}`);
  }

  static async createQuotation(data: any) {
    return this.request<any>('/quotations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async approveQuotation(id: string) {
    return this.request<any>(`/quotations/${id}/approve`, {
      method: 'POST',
    });
  }

  static async recordQuotationAcceptance(id: string, data: any) {
    return this.request<any>(`/quotations/${id}/accept`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ---------------------------------------------------------------------------
  // Contracts & Milestones (Phase 2)
  // ---------------------------------------------------------------------------
  static async getContracts(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any[]>(`/contracts${query}`);
  }

  static async getContractById(id: string) {
    return this.request<any>(`/contracts/${id}`);
  }

  static async generateContract(data: any) {
    return this.request<any>('/contracts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async signContract(id: string, data: any) {
    return this.request<any>(`/contracts/${id}/sign`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ---------------------------------------------------------------------------
  // Sales Orders & Project Handoff (Phase 2)
  // ---------------------------------------------------------------------------
  static async getSalesOrders(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any[]>(`/sales-orders${query}`);
  }

  static async getSalesOrderById(id: string) {
    return this.request<any>(`/sales-orders/${id}`);
  }

  static async createSalesOrder(data: any) {
    return this.request<any>('/sales-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async recordAdvancePayment(id: string, data: any) {
    return this.request<any>(`/sales-orders/${id}/advance-payment`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async confirmSalesOrder(id: string, data: any) {
    return this.request<any>(`/sales-orders/${id}/confirm`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

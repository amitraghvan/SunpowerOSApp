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
  static async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    country?: string;
    organizationName: string;
    organizationSlug?: string;
    businessCategory?: string;
    city?: string;
    state?: string;
    timezone?: string;
    currency?: string;
    termsAccepted: boolean;
    privacyAccepted: boolean;
  }) {
    const res = await this.request<any>('/auth/register', {
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

  // ===========================================================================
  // Phase 3: Suppliers, Vendor Product Catalog & Pricing
  // ===========================================================================
  static async getSuppliers(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any[]>(`/suppliers${query}`);
  }

  static async getSupplierById(id: string) {
    return this.request<any>(`/suppliers/${id}`);
  }

  static async createSupplier(data: any) {
    return this.request<any>('/suppliers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateSupplier(id: string, data: any) {
    return this.request<any>(`/suppliers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  static async addSupplierContact(supplierId: string, data: any) {
    return this.request<any>(`/suppliers/${supplierId}/contacts`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async addSupplierAddress(supplierId: string, data: any) {
    return this.request<any>(`/suppliers/${supplierId}/addresses`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async addSupplierBankAccount(supplierId: string, data: any) {
    return this.request<any>(`/suppliers/${supplierId}/bank-accounts`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async addSupplierDocument(supplierId: string, data: any) {
    return this.request<any>(`/suppliers/${supplierId}/documents`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async createSupplierProductMapping(supplierId: string, data: any) {
    return this.request<any>(`/suppliers/${supplierId}/product-mappings`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getSupplierPriceHistory(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any[]>(`/suppliers/price-history${query}`);
  }

  // ===========================================================================
  // Phase 3: Procurement, MRP, Requisitions, RFQs & Purchase Orders
  // ===========================================================================
  static async getProcurementKPIs() {
    return this.request<any>('/procurement/analytics/kpis');
  }

  static async getMaterialRequirements(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any[]>(`/procurement/mrp${query}`);
  }

  static async getMaterialRequirementById(id: string) {
    return this.request<any>(`/procurement/mrp/${id}`);
  }

  static async generateMRPFromProject(data: any) {
    return this.request<any>('/procurement/mrp/from-project', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async convertMRPToRequisition(mrpId: string) {
    return this.request<any>(`/procurement/mrp/${mrpId}/convert-to-pr`, {
      method: 'POST',
    });
  }

  static async getPurchaseRequisitions(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any[]>(`/procurement/requisitions${query}`);
  }

  static async getPurchaseRequisitionById(id: string) {
    return this.request<any>(`/procurement/requisitions/${id}`);
  }

  static async createPurchaseRequisition(data: any) {
    return this.request<any>('/procurement/requisitions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async submitPurchaseRequisition(id: string) {
    return this.request<any>(`/procurement/requisitions/${id}/submit`, {
      method: 'POST',
    });
  }

  static async approvePurchaseRequisition(id: string, data: any) {
    return this.request<any>(`/procurement/requisitions/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async rejectPurchaseRequisition(id: string, data: any) {
    return this.request<any>(`/procurement/requisitions/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getRFQs(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any[]>(`/procurement/rfqs${query}`);
  }

  static async getRFQById(id: string) {
    return this.request<any>(`/procurement/rfqs/${id}`);
  }

  static async createRFQ(data: any) {
    return this.request<any>('/procurement/rfqs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async submitSupplierQuotation(rfqId: string, data: any) {
    return this.request<any>(`/procurement/rfqs/${rfqId}/quotations`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async compareRFQQuotes(rfqId: string) {
    return this.request<any>(`/procurement/rfqs/${rfqId}/compare`);
  }

  static async awardRFQ(rfqId: string, data: any) {
    return this.request<any>(`/procurement/rfqs/${rfqId}/award`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getPurchaseOrders(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any[]>(`/procurement/purchase-orders${query}`);
  }

  static async getPurchaseOrderById(id: string) {
    return this.request<any>(`/procurement/purchase-orders/${id}`);
  }

  static async createPurchaseOrder(data: any) {
    return this.request<any>('/procurement/purchase-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async approvePurchaseOrder(id: string, data: any) {
    return this.request<any>(`/procurement/purchase-orders/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async createPurchaseOrderRevision(id: string, data: any) {
    return this.request<any>(`/procurement/purchase-orders/${id}/revise`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async createDeliverySchedule(poId: string, data: any) {
    return this.request<any>(`/procurement/purchase-orders/${poId}/delivery-schedules`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getDeliverySchedules(poId: string) {
    return this.request<any[]>(`/procurement/purchase-orders/${poId}/delivery-schedules`);
  }

  // ===========================================================================
  // Phase 3: Inward Inventory, GRN, Quality Inspection, Serials & Returns
  // ===========================================================================
  static async getInventoryLocations() {
    return this.request<any[]>('/inventory/locations');
  }

  static async createInventoryLocation(data: any) {
    return this.request<any>('/inventory/locations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getGoodsReceiptNotes(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any[]>(`/inventory/grns${query}`);
  }

  static async getGoodsReceiptNoteById(id: string) {
    return this.request<any>(`/inventory/grns/${id}`);
  }

  static async createGoodsReceiptNote(data: any) {
    return this.request<any>('/inventory/grns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async performQualityInspection(data: any) {
    return this.request<any>('/inventory/inspections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getQualityInspections(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any[]>(`/inventory/inspections${query}`);
  }

  static async registerProductSerials(data: any) {
    return this.request<any>('/inventory/serials', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getProductSerials(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any[]>(`/inventory/serials${query}`);
  }

  static async getProductSerialById(id: string) {
    return this.request<any>(`/inventory/serials/${id}`);
  }

  static async getInventoryMovements(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any[]>(`/inventory/movements${query}`);
  }

  static async getSupplierReturns(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any[]>(`/inventory/returns${query}`);
  }

  static async getSupplierReturnById(id: string) {
    return this.request<any>(`/inventory/returns/${id}`);
  }

  static async createSupplierReturn(data: any) {
    return this.request<any>('/inventory/returns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ===========================================================================
  // Phase 4: Warehouses, Stock, Reservations, Transfers, Dispatch & Returns
  // ===========================================================================

  // 1. Warehouses
  static async getWarehouses(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any[]>(`/warehouses${query}`);
  }

  static async createWarehouse(data: any) {
    return this.request<any>('/warehouses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getWarehouseById(id: string) {
    return this.request<any>(`/warehouses/${id}`);
  }

  static async updateWarehouse(id: string, data: any) {
    return this.request<any>(`/warehouses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  static async createWarehouseLocation(warehouseId: string, data: any) {
    return this.request<any>(`/warehouses/${warehouseId}/locations`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getWarehouseLocations(warehouseId: string) {
    return this.request<any[]>(`/warehouses/${warehouseId}/locations`);
  }

  // 2. Stock Visibility
  static async getStockOverview(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any[]>(`/inventory/stock${query}`);
  }

  static async getProductStockDetails(productVariantId: string) {
    return this.request<any>(`/inventory/stock/${productVariantId}`);
  }

  // 3. Stock Reservations
  static async getStockReservations(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any>(`/inventory/reservations${query}`);
  }

  static async createStockReservation(data: any) {
    return this.request<any>('/inventory/reservations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getStockReservationById(id: string) {
    return this.request<any>(`/inventory/reservations/${id}`);
  }

  static async releaseStockReservation(id: string, data?: any) {
    return this.request<any>(`/inventory/reservations/${id}/release`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  // 4. Warehouse Transfers
  static async getStockTransfers(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any>(`/inventory/transfers${query}`);
  }

  static async createStockTransfer(data: any) {
    return this.request<any>('/inventory/transfers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getStockTransferById(id: string) {
    return this.request<any>(`/inventory/transfers/${id}`);
  }

  static async approveStockTransfer(id: string) {
    return this.request<any>(`/inventory/transfers/${id}/approve`, {
      method: 'POST',
    });
  }

  static async shipStockTransfer(id: string, data?: any) {
    return this.request<any>(`/inventory/transfers/${id}/ship`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  static async receiveStockTransfer(id: string, data?: any) {
    return this.request<any>(`/inventory/transfers/${id}/receive`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  // 5. Stock Counts & Adjustments
  static async getStockCounts(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any[]>(`/inventory/counts${query}`);
  }

  static async createStockCount(data: any) {
    return this.request<any>('/inventory/counts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async submitStockCount(id: string, data: any) {
    return this.request<any>(`/inventory/counts/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getStockAdjustments(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any[]>(`/inventory/adjustments${query}`);
  }

  static async createStockAdjustment(data: any) {
    return this.request<any>('/inventory/adjustments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async approveStockAdjustment(id: string, data?: any) {
    return this.request<any>(`/inventory/adjustments/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  // 6. Picking & Packing
  static async getPickingOrders(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any[]>(`/inventory/picking${query}`);
  }

  static async createPickingOrder(data: any) {
    return this.request<any>('/inventory/picking', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getPickingOrderById(id: string) {
    return this.request<any>(`/inventory/picking/${id}`);
  }

  static async confirmPickingOrder(id: string, data: any) {
    return this.request<any>(`/inventory/picking/${id}/confirm`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getPackingOrders(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any[]>(`/inventory/packing${query}`);
  }

  static async createPackingOrder(data: any) {
    return this.request<any>('/inventory/packing', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getPackingOrderById(id: string) {
    return this.request<any>(`/inventory/packing/${id}`);
  }

  static async confirmPackingOrder(id: string, data: any) {
    return this.request<any>(`/inventory/packing/${id}/confirm`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 7. Dispatch, Delivery Challan & POD
  static async getDispatchOrders(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any[]>(`/dispatch${query}`);
  }

  static async createDispatchOrder(data: any) {
    return this.request<any>('/dispatch', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getDispatchOrderById(id: string) {
    return this.request<any>(`/dispatch/${id}`);
  }

  static async approveDispatchOrder(id: string) {
    return this.request<any>(`/dispatch/${id}/approve`, {
      method: 'POST',
    });
  }

  static async postDispatchOrder(id: string) {
    return this.request<any>(`/dispatch/${id}/post`, {
      method: 'POST',
    });
  }

  static async confirmDispatchDelivery(id: string, data: any) {
    return this.request<any>(`/dispatch/${id}/confirm-delivery`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getDeliveryChallans(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any[]>(`/delivery-challans${query}`);
  }

  static async createDeliveryChallan(data: any) {
    return this.request<any>('/delivery-challans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getDeliveryChallanById(id: string) {
    return this.request<any>(`/delivery-challans/${id}`);
  }

  // 8. Customer Returns
  static async getCustomerReturns(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any[]>(`/inventory/returns${query}`);
  }

  static async createCustomerReturn(data: any) {
    return this.request<any>('/inventory/returns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getCustomerReturnById(id: string) {
    return this.request<any>(`/inventory/returns/${id}`);
  }

  static async receiveCustomerReturn(id: string) {
    return this.request<any>(`/inventory/returns/${id}/receive`, {
      method: 'POST',
    });
  }

  static async inspectCustomerReturn(id: string, data: any) {
    return this.request<any>(`/inventory/returns/${id}/inspect`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

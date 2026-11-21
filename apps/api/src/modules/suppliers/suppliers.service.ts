import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NumberingService } from '../../common/services/numbering.service';
import {
  CreateSupplierDto,
  UpdateSupplierDto,
  CreateSupplierContactDto,
  CreateSupplierAddressDto,
  CreateSupplierBankAccountDto,
  CreateSupplierDocumentDto,
  CreateSupplierProductMappingDto,
  UpdateSupplierProductMappingDto,
} from '@solaros/contracts';
import { SupplierStatus } from '@solaros/types';

@Injectable()
export class SuppliersService {
  private readonly logger = new Logger(SuppliersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly numberingService: NumberingService,
  ) {}

  private validateGstin(gstin?: string) {
    if (!gstin) return;
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstinRegex.test(gstin)) {
      throw new BadRequestException(`Invalid Indian GSTIN format: ${gstin}`);
    }
  }

  private validatePan(pan?: string) {
    if (!pan) return;
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(pan)) {
      throw new BadRequestException(`Invalid Indian PAN format: ${pan}`);
    }
  }

  /**
   * 1. Create Supplier Master Record
   */
  async createSupplier(organizationId: string, dto: CreateSupplierDto, userId?: string) {
    this.validateGstin(dto.gstin);
    this.validatePan(dto.pan);

    const supplierCode =
      dto.supplierCode ||
      (await this.numberingService.getNextDocumentNumber(organizationId, 'SUPPLIER', 'SUP'));

    return await this.prisma.forTenant(organizationId, async (tx) => {
      const existing = await tx.supplier.findFirst({
        where: {
          organizationId,
          supplierCode,
          deletedAt: null,
        },
      });

      if (existing) {
        throw new ConflictException(`Supplier with code '${supplierCode}' already exists`);
      }

      const supplier = await tx.supplier.create({
        data: {
          organizationId,
          supplierCode,
          legalName: dto.legalName,
          tradeName: dto.tradeName,
          category: dto.category,
          supplierType: dto.supplierType,
          gstin: dto.gstin,
          pan: dto.pan,
          msmeNumber: dto.msmeNumber,
          status: SupplierStatus.ACTIVE,
          paymentTerms: dto.paymentTerms || 'NET_30',
          creditPeriodDays: dto.creditPeriodDays ?? 30,
          creditLimit: dto.creditLimit ?? 0,
          currency: dto.currency || 'INR',
          notes: dto.notes,
        },
        include: {
          contacts: true,
          addresses: true,
          bankAccounts: true,
        },
      });

      this.logger.log(`Created supplier ${supplier.supplierCode} (${supplier.legalName}) for tenant ${organizationId}`);
      return supplier;
    });
  }

  /**
   * 2. List Suppliers
   */
  async listSuppliers(
    organizationId: string,
    filters?: {
      category?: string;
      supplierType?: string;
      status?: string;
      search?: string;
      skip?: number;
      take?: number;
    },
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const where: any = {
        organizationId,
        deletedAt: null,
      };

      if (filters?.category) {
        where.category = filters.category;
      }
      if (filters?.supplierType) {
        where.supplierType = filters.supplierType;
      }
      if (filters?.status) {
        where.status = filters.status;
      }
      if (filters?.search) {
        where.OR = [
          { legalName: { contains: filters.search, mode: 'insensitive' } },
          { tradeName: { contains: filters.search, mode: 'insensitive' } },
          { supplierCode: { contains: filters.search, mode: 'insensitive' } },
          { gstin: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      const [total, items] = await Promise.all([
        tx.supplier.count({ where }),
        tx.supplier.findMany({
          where,
          include: {
            contacts: { where: { isPrimary: true } },
            _count: {
              select: {
                productMappings: true,
                purchaseOrders: true,
                goodsReceiptNotes: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: filters?.skip ?? 0,
          take: filters?.take ?? 50,
        }),
      ]);

      return { total, items };
    });
  }

  /**
   * 3. Get Supplier by ID (Complete 360 View)
   */
  async getSupplier(organizationId: string, id: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const supplier = await tx.supplier.findFirst({
        where: { id, organizationId, deletedAt: null },
        include: {
          contacts: true,
          addresses: true,
          bankAccounts: true,
          documents: true,
          productMappings: {
            include: {
              productVariant: {
                include: {
                  product: true,
                },
              },
            },
          },
          purchaseOrders: {
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
          goodsReceiptNotes: {
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
          supplierReturns: {
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!supplier) {
        throw new NotFoundException(`Supplier ${id} not found`);
      }

      return supplier;
    });
  }

  /**
   * 4. Update Supplier
   */
  async updateSupplier(organizationId: string, id: string, dto: UpdateSupplierDto) {
    if (dto.gstin) this.validateGstin(dto.gstin);
    if (dto.pan) this.validatePan(dto.pan);

    return await this.prisma.forTenant(organizationId, async (tx) => {
      const existing = await tx.supplier.findFirst({
        where: { id, organizationId, deletedAt: null },
      });

      if (!existing) {
        throw new NotFoundException(`Supplier ${id} not found`);
      }

      return await tx.supplier.update({
        where: { id },
        data: {
          legalName: dto.legalName,
          tradeName: dto.tradeName,
          category: dto.category,
          supplierType: dto.supplierType,
          gstin: dto.gstin,
          pan: dto.pan,
          msmeNumber: dto.msmeNumber,
          status: dto.status,
          paymentTerms: dto.paymentTerms,
          creditPeriodDays: dto.creditPeriodDays,
          creditLimit: dto.creditLimit,
          currency: dto.currency,
          rating: dto.rating,
          notes: dto.notes,
          isActive: dto.isActive,
        },
      });
    });
  }

  /**
   * 5. Add Contact
   */
  async addContact(organizationId: string, supplierId: string, dto: CreateSupplierContactDto) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const supplier = await tx.supplier.findFirst({
        where: { id: supplierId, organizationId, deletedAt: null },
      });
      if (!supplier) throw new NotFoundException(`Supplier ${supplierId} not found`);

      if (dto.isPrimary) {
        await tx.supplierContact.updateMany({
          where: { supplierId, organizationId },
          data: { isPrimary: false },
        });
      }

      return await tx.supplierContact.create({
        data: {
          organizationId,
          supplierId,
          name: dto.name,
          designation: dto.designation,
          department: dto.department,
          email: dto.email,
          phone: dto.phone,
          alternatePhone: dto.alternatePhone,
          isPrimary: dto.isPrimary ?? false,
        },
      });
    });
  }

  /**
   * 6. Add Address
   */
  async addAddress(organizationId: string, supplierId: string, dto: CreateSupplierAddressDto) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const supplier = await tx.supplier.findFirst({
        where: { id: supplierId, organizationId, deletedAt: null },
      });
      if (!supplier) throw new NotFoundException(`Supplier ${supplierId} not found`);

      if (dto.isDefault) {
        await tx.supplierAddress.updateMany({
          where: { supplierId, organizationId },
          data: { isDefault: false },
        });
      }

      return await tx.supplierAddress.create({
        data: {
          organizationId,
          supplierId,
          type: dto.type,
          addressLine1: dto.addressLine1,
          addressLine2: dto.addressLine2,
          landmark: dto.landmark,
          city: dto.city,
          state: dto.state,
          postalCode: dto.postalCode,
          country: dto.country || 'IN',
          isDefault: dto.isDefault ?? false,
        },
      });
    });
  }

  /**
   * 7. Add Bank Account
   */
  async addBankAccount(organizationId: string, supplierId: string, dto: CreateSupplierBankAccountDto) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const supplier = await tx.supplier.findFirst({
        where: { id: supplierId, organizationId, deletedAt: null },
      });
      if (!supplier) throw new NotFoundException(`Supplier ${supplierId} not found`);

      if (dto.isPrimary) {
        await tx.supplierBankAccount.updateMany({
          where: { supplierId, organizationId },
          data: { isPrimary: false },
        });
      }

      return await tx.supplierBankAccount.create({
        data: {
          organizationId,
          supplierId,
          bankName: dto.bankName,
          accountNumber: dto.accountNumber,
          ifscCode: dto.ifscCode.toUpperCase(),
          branchName: dto.branchName,
          accountType: dto.accountType || 'CURRENT',
          isPrimary: dto.isPrimary ?? false,
        },
      });
    });
  }

  /**
   * 8. Add Document
   */
  async addDocument(organizationId: string, supplierId: string, dto: CreateSupplierDocumentDto) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const supplier = await tx.supplier.findFirst({
        where: { id: supplierId, organizationId, deletedAt: null },
      });
      if (!supplier) throw new NotFoundException(`Supplier ${supplierId} not found`);

      return await tx.supplierDocument.create({
        data: {
          organizationId,
          supplierId,
          documentType: dto.documentType,
          documentNumber: dto.documentNumber,
          fileUrl: dto.fileUrl,
          fileName: dto.fileName,
          fileSizeBytes: dto.fileSizeBytes,
          mimeType: dto.mimeType,
          expiryDate: dto.expiryDate,
        },
      });
    });
  }

  /**
   * 9. Create / Map Product to Supplier
   */
  async createProductMapping(
    organizationId: string,
    supplierId: string,
    dto: CreateSupplierProductMappingDto,
    userId?: string,
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const [supplier, variant] = await Promise.all([
        tx.supplier.findFirst({ where: { id: supplierId, organizationId, deletedAt: null } }),
        tx.productVariant.findFirst({ where: { id: dto.productVariantId, organizationId } }),
      ]);

      if (!supplier) throw new NotFoundException(`Supplier ${supplierId} not found`);
      if (!variant) throw new NotFoundException(`ProductVariant ${dto.productVariantId} not found`);

      if (dto.isPreferred) {
        await tx.supplierProductMapping.updateMany({
          where: {
            organizationId,
            productVariantId: dto.productVariantId,
          },
          data: { isPreferred: false },
        });
      }

      const mapping = await tx.supplierProductMapping.create({
        data: {
          organizationId,
          supplierId,
          productVariantId: dto.productVariantId,
          supplierPartCode: dto.supplierPartCode,
          supplierPartName: dto.supplierPartName,
          leadTimeDays: dto.leadTimeDays ?? 7,
          minimumOrderQuantity: dto.minimumOrderQuantity ?? 1,
          unitPrice: dto.unitPrice,
          taxRatePercent: dto.taxRatePercent ?? 18,
          isPreferred: dto.isPreferred ?? false,
          currency: dto.currency || 'INR',
          effectiveFrom: dto.effectiveFrom || new Date(),
          effectiveTo: dto.effectiveTo,
        },
      });

      // Log Price History
      await tx.supplierPriceHistory.create({
        data: {
          organizationId,
          supplierProductMappingId: mapping.id,
          supplierId,
          productVariantId: dto.productVariantId,
          oldPrice: 0,
          newPrice: dto.unitPrice,
          currency: dto.currency || 'INR',
          reason: 'INITIAL_MAPPING',
          changedById: userId,
        },
      });

      return mapping;
    });
  }

  /**
   * 10. Update Supplier Product Mapping & Track Price History
   */
  async updateProductMapping(
    organizationId: string,
    supplierId: string,
    mappingId: string,
    dto: UpdateSupplierProductMappingDto,
    userId?: string,
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const existing = await tx.supplierProductMapping.findFirst({
        where: { id: mappingId, supplierId, organizationId },
      });

      if (!existing) {
        throw new NotFoundException(`Mapping ${mappingId} not found for supplier ${supplierId}`);
      }

      if (dto.isPreferred) {
        await tx.supplierProductMapping.updateMany({
          where: {
            organizationId,
            productVariantId: existing.productVariantId,
            id: { not: mappingId },
          },
          data: { isPreferred: false },
        });
      }

      const priceChanged = dto.unitPrice !== undefined && Number(dto.unitPrice) !== Number(existing.unitPrice);

      const updated = await tx.supplierProductMapping.update({
        where: { id: mappingId },
        data: {
          supplierPartCode: dto.supplierPartCode,
          supplierPartName: dto.supplierPartName,
          leadTimeDays: dto.leadTimeDays,
          minimumOrderQuantity: dto.minimumOrderQuantity,
          unitPrice: dto.unitPrice,
          taxRatePercent: dto.taxRatePercent,
          isPreferred: dto.isPreferred,
          currency: dto.currency,
          effectiveTo: dto.effectiveTo,
          isActive: dto.isActive,
        },
      });

      if (priceChanged && dto.unitPrice !== undefined) {
        await tx.supplierPriceHistory.create({
          data: {
            organizationId,
            supplierProductMappingId: mappingId,
            supplierId,
            productVariantId: existing.productVariantId,
            oldPrice: existing.unitPrice,
            newPrice: dto.unitPrice,
            currency: dto.currency || existing.currency,
            reason: dto.priceChangeReason || 'SUPPLIER_PRICE_UPDATE',
            changedById: userId,
          },
        });
      }

      return updated;
    });
  }

  /**
   * 11. Get Price History for Product Variant
   */
  async getPriceHistory(organizationId: string, supplierId?: string, productVariantId?: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const where: any = { organizationId };
      if (supplierId) where.supplierId = supplierId;
      if (productVariantId) where.productVariantId = productVariantId;

      return await tx.supplierPriceHistory.findMany({
        where,
        include: {
          supplier: { select: { supplierCode: true, legalName: true } },
          productVariant: { select: { sku: true, name: true } },
          changedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { effectiveDate: 'desc' },
      });
    });
  }
}

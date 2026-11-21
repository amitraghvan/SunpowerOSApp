import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export type SequenceEntityType =
  | 'DESIGN'
  | 'BOM'
  | 'QUOTATION'
  | 'CONTRACT'
  | 'SALES_ORDER'
  | 'PROJECT'
  | 'SUPPLIER'
  | 'REQUISITION'
  | 'RFQ'
  | 'SUPPLIER_QUOTE'
  | 'PURCHASE_ORDER'
  | 'GRN'
  | 'INSPECTION'
  | 'SERIAL'
  | 'MOVEMENT'
  | 'SUPPLIER_RETURN'
  // Phase 4 Sequence Types
  | 'WAREHOUSE'
  | 'RESERVATION'
  | 'TRANSFER'
  | 'COUNT'
  | 'ADJUSTMENT'
  | 'PICKING'
  | 'PACKING'
  | 'DISPATCH'
  | 'CHALLAN'
  | 'CUSTOMER_RETURN'
  // Phase 5 Sequence Types
  | 'TECHNICIAN'
  | 'CREW'
  | 'SCHEDULE'
  | 'READINESS'
  | 'WORK_ORDER'
  | 'MATERIAL_HANDOVER'
  | 'CONSUMPTION'
  | 'SAFETY'
  | 'INCIDENT'
  | 'INSTALLATION_QUALITY'
  | 'COMMISSIONING'
  | 'UTILITY_TRACKING'
  | 'CUSTOMER_HANDOVER'
  | 'PROJECT_COST';

@Injectable()
export class NumberingService {
  private readonly logger = new Logger(NumberingService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a concurrency-safe, gap-free unique document number with tenant isolation
   * Format: {PREFIX}-{YYYY}-{000001}
   */
  async getNextDocumentNumber(
    organizationId: string,
    entityType: SequenceEntityType,
    prefix: string,
    targetYear?: number,
  ): Promise<string> {
    const year = targetYear || new Date().getFullYear();

    return await this.prisma.forTenant(organizationId, async (tx) => {
      const sequence = await tx.documentSequence.upsert({
        where: {
          organizationId_entityType_prefix_year: {
            organizationId,
            entityType,
            prefix,
            year,
          },
        },
        create: {
          organizationId,
          entityType,
          prefix,
          year,
          lastNumber: 1,
        },
        update: {
          lastNumber: {
            increment: 1,
          },
        },
      });

      const paddedNumber = String(sequence.lastNumber).padStart(6, '0');
      const documentNumber = `${prefix}-${year}-${paddedNumber}`;
      this.logger.debug(
        `Generated document number: ${documentNumber} for tenant: ${organizationId} [${entityType}]`,
      );
      return documentNumber;
    });
  }
}

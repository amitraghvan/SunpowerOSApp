import { SalesOrderStatus, FulfillmentStatus, PaymentStatus, ProjectHandoverStatus } from './domain-enums';

export interface SalesOrderMilestoneDto {
  id?: string;
  milestoneType: string;
  name: string;
  percentage: number;
  amount: number;
  isPaid: boolean;
}

export interface SalesOrderResponseDto {
  id: string;
  orderNumber: string;
  customerId: string;
  contractId?: string;
  quotationId: string;
  designId: string;
  bomId: string;
  orderDate: string;
  totalAmount: number;
  advanceRequired: number;
  advanceReceived: number;
  status: SalesOrderStatus;
  fulfillmentStatus: FulfillmentStatus;
  paymentStatus: PaymentStatus;
  prerequisitesMet: boolean;
  confirmedAt?: string;
  milestones: SalesOrderMilestoneDto[];
  projectInitiation?: ProjectInitiationDto;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectInitiationDto {
  id: string;
  projectCode: string;
  projectName: string;
  customerId: string;
  siteId: string;
  systemCapacityKw: number;
  systemType: string;
  handoverStatus: ProjectHandoverStatus;
  handedOverAt: string;
  createdAt: string;
}

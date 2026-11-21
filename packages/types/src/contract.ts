import { ContractStatus, PaymentMilestoneType, MilestoneStatus } from './domain-enums';

export interface ContractPaymentMilestoneDto {
  id?: string;
  milestoneType: PaymentMilestoneType;
  milestoneName: string;
  percentage: number;
  amount: number;
  status: MilestoneStatus;
  dueDate?: string;
  paidDate?: string;
  paidAmount?: number;
  referenceNote?: string;
}

export interface ContractResponseDto {
  id: string;
  contractNumber: string;
  customerId: string;
  quotationId: string;
  contractDate: string;
  systemCapacityKw: number;
  contractAmount: number;
  taxAmount: number;
  totalContractValue: number;
  paymentScheduleType: string;
  status: ContractStatus;
  termsAndConditions: string;
  signedByCustomerName?: string;
  signedDate?: string;
  contractDocumentUrl?: string;
  milestones: ContractPaymentMilestoneDto[];
  createdAt: string;
  updatedAt: string;
}

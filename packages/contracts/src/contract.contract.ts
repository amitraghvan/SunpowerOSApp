export interface GenerateContractDto {
  quotationId: string;
  paymentScheduleType?: 'MILESTONE_BASED' | 'ADVANCE_FULL' | 'CUSTOM';
  termsAndConditions?: string;
  milestones?: Array<{
    milestoneType: string;
    milestoneName: string;
    percentage: number;
  }>;
}

export interface SignContractDto {
  signedByCustomerName: string;
  signedDate?: string;
  contractDocumentUrl?: string;
}

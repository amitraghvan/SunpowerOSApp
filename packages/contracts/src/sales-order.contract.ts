export interface CreateSalesOrderDto {
  quotationId: string;
  contractId?: string;
  advanceRequiredPercentage?: number;
}

export interface RecordAdvancePaymentDto {
  amount: number;
  paymentMode: 'NEFT' | 'RTGS' | 'UPI' | 'CHEQUE' | 'CASH';
  referenceNumber: string;
}

export interface ConfirmSalesOrderDto {
  notes?: string;
}

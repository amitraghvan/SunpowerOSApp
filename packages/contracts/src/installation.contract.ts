import {
  TechnicianType,
  TechnicianAvailability,
  CrewRole,
  CrewStatus,
  InstallationVisitType,
  InstallationScheduleStatus,
  SiteReadinessStatus,
  WorkOrderStatus,
  WorkOrderPriority,
  InstallationTaskKey,
  TaskCategory,
  InstallationTaskStatus,
  InstallationMilestoneStatus,
  MaterialHandoverStatus,
  MaterialHandoverLineStatus,
  InstallationSafetyStatus,
  SafetyCheckStatus,
  SafetyObservationType,
  SafetySeverity,
  IncidentSeverity,
  InstallationQualityStage,
  QualityInspectionResult,
  CommissioningStatus,
  CommissioningTestCategory,
  CommissioningTestResult,
  DiscomTrackingStatus,
  SubsidyClaimStatus,
  CustomerHandoverStatus,
  PunchlistSeverity,
  HandoverDocumentType,
  ProjectCostCategory
} from '@solaros/types';

// =============================================================================
// 1. Technician & Crew DTOs
// =============================================================================

export interface CreateTechnicianProfileDto {
  userId: string;
  technicianCode?: string;
  technicianType?: TechnicianType | string;
  phone?: string;
  emergencyContact?: string;
  bloodGroup?: string;
  yearsOfExperience?: number;
  specializations?: string[];
  safetyInductionDate?: string | Date;
  safetyInductionValidUntil?: string | Date;
  notes?: string;
}

export interface UpdateTechnicianProfileDto {
  technicianType?: TechnicianType | string;
  phone?: string;
  emergencyContact?: string;
  bloodGroup?: string;
  yearsOfExperience?: number;
  specializations?: string[];
  availabilityStatus?: TechnicianAvailability | string;
  safetyInductionDate?: string | Date;
  safetyInductionValidUntil?: string | Date;
  notes?: string;
  isActive?: boolean;
}

export interface AddTechnicianSkillDto {
  skillName: string;
  proficiencyLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT' | string;
}

export interface AddTechnicianCertificationDto {
  certificateName: string;
  issuingAuthority: string;
  certificateNumber?: string;
  issueDate?: string | Date;
  expiryDate?: string | Date;
  documentUrl?: string;
}

export interface CreateInstallationCrewDto {
  crewCode?: string;
  crewName: string;
  crewLeaderId: string;
  maxConcurrentProjects?: number;
  serviceAreas?: string[];
  notes?: string;
  memberProfileIds?: string[];
}

export interface UpdateInstallationCrewDto {
  crewName?: string;
  crewLeaderId?: string;
  maxConcurrentProjects?: number;
  status?: CrewStatus | string;
  serviceAreas?: string[];
  notes?: string;
}

export interface AddCrewMemberDto {
  technicianProfileId: string;
  roleInCrew?: CrewRole | string;
}

export interface AssignProjectTechnicianDto {
  technicianProfileId: string;
  role?: string;
  notes?: string;
}

// =============================================================================
// 2. Installation Scheduling DTOs
// =============================================================================

export interface CreateInstallationScheduleDto {
  projectInitiationId: string;
  crewId?: string;
  visitType: InstallationVisitType | string;
  scheduledDate: string | Date;
  endDate?: string | Date;
  startTime?: string;
  endTime?: string;
  notes?: string;
}

export interface UpdateInstallationScheduleDto {
  crewId?: string;
  visitType?: InstallationVisitType | string;
  scheduledDate?: string | Date;
  endDate?: string | Date;
  startTime?: string;
  endTime?: string;
  status?: InstallationScheduleStatus | string;
  rescheduleReason?: string;
  notes?: string;
}

export interface RescheduleVisitDto {
  scheduledDate: string | Date;
  endDate?: string | Date;
  startTime?: string;
  endTime?: string;
  rescheduleReason: string;
}

// =============================================================================
// 3. Site Readiness DTOs
// =============================================================================

export interface CreateSiteReadinessRecordDto {
  projectInitiationId: string;
  roofAccessAvailable?: boolean;
  structuralIntegrityVerified?: boolean;
  shadowFreeAreaConfirmed?: boolean;
  storageAreaSecured?: boolean;
  waterAndElectricityAvailable?: boolean;
  discomNocAvailable?: boolean;
  notes?: string;
  checks?: {
    checkItemKey: string;
    description: string;
    isMandatory?: boolean;
    status: SafetyCheckStatus | string;
    remarks?: string;
  }[];
}

export interface RecordReadinessCheckDto {
  checkItemKey: string;
  description: string;
  isMandatory?: boolean;
  status: SafetyCheckStatus | string;
  remarks?: string;
  photoUrl?: string;
}

export interface AuthorizeReadinessExceptionDto {
  exceptionReason: string;
}

// =============================================================================
// 4. Installation Work Orders & Tasks DTOs
// =============================================================================

export interface CreateWorkOrderDto {
  projectInitiationId: string;
  crewId?: string;
  supervisorId?: string;
  priority?: WorkOrderPriority | string;
  plannedStartDate?: string | Date;
  plannedCompletionDate?: string | Date;
  workScope?: string;
  tasks?: {
    taskKey: InstallationTaskKey | string;
    taskName: string;
    category?: TaskCategory | string;
    sequenceOrder: number;
    plannedHours?: number;
  }[];
}

export interface UpdateWorkOrderDto {
  crewId?: string;
  supervisorId?: string;
  status?: WorkOrderStatus | string;
  priority?: WorkOrderPriority | string;
  plannedStartDate?: string | Date;
  plannedCompletionDate?: string | Date;
  actualStartDate?: string | Date;
  actualCompletionDate?: string | Date;
  workScope?: string;
  reworkNotes?: string;
}

export interface UpdateTaskStatusDto {
  status: InstallationTaskStatus | string;
  actualHours?: number;
  notes?: string;
  completionProofUrls?: string[];
}

export interface AssignTechnicianToWorkOrderDto {
  technicianProfileId: string;
  role?: string;
}

export interface UpdateMilestoneStatusDto {
  status: InstallationMilestoneStatus | string;
  notes?: string;
}

// =============================================================================
// 5. Material Handover & Custody DTOs
// =============================================================================

export interface CreateMaterialHandoverDto {
  projectInitiationId: string;
  dispatchOrderId?: string;
  deliveryChallanId?: string;
  receiverRole?: string;
  siteLocationNotes?: string;
  lines?: {
    productVariantId: string;
    expectedQuantity: number;
    serialNumbersExpected?: string[];
  }[];
}

export interface VerifyMaterialHandoverLineDto {
  lineId: string;
  verifiedQuantity: number;
  damagedQuantity?: number;
  missingQuantity?: number;
  serialNumbersVerified: string[];
  notes?: string;
}

export interface AcceptMaterialHandoverDto {
  custodySignatureUrl?: string;
  siteLocationNotes?: string;
  discrepancyNotes?: string;
}

export interface RecordMaterialConsumptionDto {
  projectInitiationId: string;
  workOrderId?: string;
  productVariantId: string;
  quantityUsed: number;
  serialNumbers?: string[];
  notes?: string;
}

// =============================================================================
// 6. Installation Safety Management DTOs
// =============================================================================

export interface CreateSafetyRecordDto {
  projectInitiationId: string;
  workOrderId?: string;
  toolboxTalkConducted?: boolean;
  toolboxTopic?: string;
  ppeComplianceVerified?: boolean;
  fallProtectionVerified?: boolean;
  electricalIsolationVerified?: boolean;
  weatherSafeForWork?: boolean;
  notes?: string;
  checklistItems?: {
    itemKey: string;
    description: string;
    isMandatory?: boolean;
    status: SafetyCheckStatus | string;
    remarks?: string;
  }[];
}

export interface AddSafetyObservationDto {
  observationType: SafetyObservationType | string;
  severity: SafetySeverity | string;
  description: string;
  correctiveAction?: string;
}

export interface IssueStopWorkDto {
  stopWorkReason: string;
}

export interface LiftStopWorkDto {
  resolutionNotes: string;
}

export interface ReportSafetyIncidentDto {
  projectInitiationId: string;
  workOrderId?: string;
  severity: IncidentSeverity | string;
  description: string;
  immediateActionTaken: string;
  rootCause?: string;
  preventiveAction?: string;
  regulatoryReportRequired?: boolean;
}

// =============================================================================
// 7. Installation Quality Inspection DTOs
// =============================================================================

export interface CreateQualityInspectionDto {
  projectInitiationId: string;
  workOrderId?: string;
  stage: InstallationQualityStage | string;
  notes?: string;
  items?: {
    checkpointKey: string;
    checkpointName: string;
    toleranceCriteria?: string;
    observedValue?: string;
    isMandatory?: boolean;
    result: QualityInspectionResult | string;
    deviationNotes?: string;
  }[];
}

export interface RecordQualityItemDto {
  checkpointKey: string;
  checkpointName: string;
  toleranceCriteria?: string;
  observedValue?: string;
  isMandatory?: boolean;
  result: QualityInspectionResult | string;
  deviationNotes?: string;
  photoUrl?: string;
}

export interface RecordReworkResolutionDto {
  reworkNotes: string;
}

// =============================================================================
// 8. Testing & Commissioning DTOs
// =============================================================================

export interface CreateCommissioningRecordDto {
  projectInitiationId: string;
  gridSyncSuccessful?: boolean;
  gridVoltageObserved?: number;
  gridFrequencyObserved?: number;
  acPowerOutputKw?: number;
  dcVoltageString1?: number;
  dcVoltageString2?: number;
  dcCurrentString1?: number;
  dcCurrentString2?: number;
  inverterSerialNumbers?: string[];
  netMeterSerialAssigned?: string;
  notes?: string;
  tests?: {
    testCategory: CommissioningTestCategory | string;
    testName: string;
    unit?: string;
    expectedValue?: string;
    measuredValue: string;
    isMandatory?: boolean;
    testResult: CommissioningTestResult | string;
    remarks?: string;
  }[];
}

export interface RecordCommissioningTestDto {
  testCategory: CommissioningTestCategory | string;
  testName: string;
  unit?: string;
  expectedValue?: string;
  measuredValue: string;
  isMandatory?: boolean;
  testResult: CommissioningTestResult | string;
  remarks?: string;
  evidenceUrl?: string;
}

export interface ApproveCommissioningDto {
  notes?: string;
}

export interface RejectCommissioningDto {
  rejectionReason: string;
}

// =============================================================================
// 9. DISCOM / Utility Tracking DTOs
// =============================================================================

export interface CreateUtilityTrackingDto {
  projectInitiationId: string;
  discomName: string;
  divisionOffice?: string;
  consumerNumber: string;
  sanctionedLoadKw: number;
  solarCapacityKw: number;
  applicationNumber?: string;
  applicationSubmittedDate?: string | Date;
  subsidyPortalRegistrationId?: string;
  notes?: string;
}

export interface UpdateUtilityTrackingDto {
  applicationNumber?: string;
  applicationSubmittedDate?: string | Date;
  technicalFeasibilityStatus?: string;
  feasibilityApprovalDate?: string | Date;
  discomWorkOrderNumber?: string;
  discomInspectionDate?: string | Date;
  discomInspectorName?: string;
  inspectionResult?: string;
  meterTestingDate?: string | Date;
  netMeterInstalledDate?: string | Date;
  netMeterSerialNumber?: string;
  gridSynchronizationDate?: string | Date;
  ppaAgreementDate?: string | Date;
  subsidyClaimStatus?: SubsidyClaimStatus | string;
  subsidyAmountEligible?: number;
  subsidyAmountDisbursed?: number;
  status?: DiscomTrackingStatus | string;
  notes?: string;
}

// =============================================================================
// 10. Customer Handover & Punchlist DTOs
// =============================================================================

export interface CreateCustomerHandoverDto {
  projectInitiationId: string;
  customerRepName: string;
  customerRepPhone: string;
  customerRepDesignation?: string;
  finalInstalledCapacityKw: number;
  customerFeedbackNotes?: string;
}

export interface AddPunchlistItemDto {
  itemNumber?: number;
  category?: string;
  description: string;
  severity?: PunchlistSeverity | string;
  targetResolutionDate?: string | Date;
}

export interface ResolvePunchlistItemDto {
  resolutionNotes: string;
}

export interface SignOffCustomerHandoverDto {
  customerSatisfactionScore?: number;
  customerSignatureUrl?: string;
  companyRepresentativeSignatureUrl?: string;
  warrantyPeriodMonths?: number;
}

// =============================================================================
// 11. Project Cost DTOs
// =============================================================================

export interface CreateProjectCostDto {
  projectInitiationId: string;
  workOrderId?: string;
  costCategory: ProjectCostCategory | string;
  amount: number;
  currency?: string;
  incurredDate?: string | Date;
  vendorName?: string;
  invoiceNumber?: string;
  notes?: string;
}

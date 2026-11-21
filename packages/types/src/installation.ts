import {
  ProjectInstallationStatus,
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
} from './domain-enums';

// -----------------------------------------------------------------------------
// 1. Technician & Crew Management
// -----------------------------------------------------------------------------

export interface TechnicianProfileRecord {
  id: string;
  organizationId: string;
  userId: string;
  technicianCode: string;
  technicianType: TechnicianType | string;
  phone?: string | null;
  emergencyContact?: string | null;
  bloodGroup?: string | null;
  yearsOfExperience?: number | null;
  specializations: string[];
  availabilityStatus: TechnicianAvailability | string;
  safetyInductionDate?: string | Date | null;
  safetyInductionValidUntil?: string | Date | null;
  notes?: string | null;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
  };
  skills?: TechnicianSkillRecord[];
  certifications?: TechnicianCertificationRecord[];
}

export interface TechnicianSkillRecord {
  id: string;
  organizationId: string;
  technicianProfileId: string;
  skillName: string;
  proficiencyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT' | string;
  verifiedByUserId?: string | null;
  verifiedAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface TechnicianCertificationRecord {
  id: string;
  organizationId: string;
  technicianProfileId: string;
  certificateName: string;
  issuingAuthority: string;
  certificateNumber?: string | null;
  issueDate?: string | Date | null;
  expiryDate?: string | Date | null;
  documentUrl?: string | null;
  isVerified: boolean;
  verifiedByUserId?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface InstallationCrewRecord {
  id: string;
  organizationId: string;
  crewCode: string;
  crewName: string;
  crewLeaderId: string;
  maxConcurrentProjects: number;
  status: CrewStatus | string;
  serviceAreas: string[];
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  crewLeader?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
  };
  members?: CrewMemberRecord[];
  activeProjectsCount?: number;
}

export interface CrewMemberRecord {
  id: string;
  organizationId: string;
  crewId: string;
  technicianProfileId: string;
  roleInCrew: CrewRole | string;
  joinedAt: string | Date;
  leftAt?: string | Date | null;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  technicianProfile?: TechnicianProfileRecord;
}

export interface ProjectTechnicianAssignmentRecord {
  id: string;
  organizationId: string;
  projectInitiationId: string;
  technicianProfileId: string;
  role: string;
  assignedAt: string | Date;
  releasedAt?: string | Date | null;
  isActive: boolean;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  technicianProfile?: TechnicianProfileRecord;
}

// -----------------------------------------------------------------------------
// 2. Installation Scheduling
// -----------------------------------------------------------------------------

export interface InstallationScheduleRecord {
  id: string;
  organizationId: string;
  scheduleCode: string;
  projectInitiationId: string;
  crewId?: string | null;
  visitType: InstallationVisitType | string;
  scheduledDate: string | Date;
  endDate?: string | Date | null;
  startTime?: string | null;
  endTime?: string | null;
  status: InstallationScheduleStatus | string;
  rescheduleReason?: string | null;
  notes?: string | null;
  createdById?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  project?: {
    id: string;
    projectCode: string;
    projectName: string;
    systemCapacityKw: number;
    site?: {
      city: string;
      state: string;
      addressLine1: string;
    };
  };
  crew?: InstallationCrewRecord;
}

// -----------------------------------------------------------------------------
// 3. Site Readiness
// -----------------------------------------------------------------------------

export interface SiteReadinessRecordType {
  id: string;
  organizationId: string;
  readinessCode: string;
  projectInitiationId: string;
  overallStatus: SiteReadinessStatus | string;
  inspectionDate: string | Date;
  inspectedById: string;
  approvedById?: string | null;
  approvedAt?: string | Date | null;
  exceptionReason?: string | null;
  exceptionAuthorizedById?: string | null;
  roofAccessAvailable: boolean;
  structuralIntegrityVerified: boolean;
  shadowFreeAreaConfirmed: boolean;
  storageAreaSecured: boolean;
  waterAndElectricityAvailable: boolean;
  discomNocAvailable: boolean;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  checks?: SiteReadinessCheckRecord[];
}

export interface SiteReadinessCheckRecord {
  id: string;
  organizationId: string;
  readinessRecordId: string;
  checkItemKey: string;
  description: string;
  isMandatory: boolean;
  status: SafetyCheckStatus | string;
  remarks?: string | null;
  photoUrl?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// -----------------------------------------------------------------------------
// 4. Installation Work Orders & Tasks
// -----------------------------------------------------------------------------

export interface InstallationWorkOrderRecord {
  id: string;
  organizationId: string;
  workOrderNumber: string;
  projectInitiationId: string;
  crewId?: string | null;
  supervisorId?: string | null;
  status: WorkOrderStatus | string;
  priority: WorkOrderPriority | string;
  plannedStartDate?: string | Date | null;
  plannedCompletionDate?: string | Date | null;
  actualStartDate?: string | Date | null;
  actualCompletionDate?: string | Date | null;
  workScope?: string | null;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  reworkNotes?: string | null;
  createdById?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  tasks?: InstallationTaskRecord[];
  assignedTechnicians?: WorkOrderTechnicianAssignmentRecord[];
  crew?: InstallationCrewRecord;
  supervisor?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface InstallationTaskRecord {
  id: string;
  organizationId: string;
  workOrderId: string;
  taskKey: InstallationTaskKey | string;
  taskName: string;
  category: TaskCategory | string;
  sequenceOrder: number;
  status: InstallationTaskStatus | string;
  plannedHours?: number | null;
  actualHours?: number | null;
  completedById?: string | null;
  completedAt?: string | Date | null;
  notes?: string | null;
  completionProofUrls: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface WorkOrderTechnicianAssignmentRecord {
  id: string;
  organizationId: string;
  workOrderId: string;
  technicianProfileId: string;
  assignedAt: string | Date;
  role: string;
  createdAt: string | Date;
  technicianProfile?: TechnicianProfileRecord;
}

export interface InstallationMilestoneRecord {
  id: string;
  organizationId: string;
  projectInitiationId: string;
  milestoneKey: string;
  milestoneName: string;
  weightagePercentage: number;
  status: InstallationMilestoneStatus | string;
  achievedAt?: string | Date | null;
  verifiedById?: string | null;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// -----------------------------------------------------------------------------
// 5. Material Handover (Site Custody) & Consumption
// -----------------------------------------------------------------------------

export interface ProjectMaterialHandoverRecord {
  id: string;
  organizationId: string;
  handoverNumber: string;
  projectInitiationId: string;
  dispatchOrderId?: string | null;
  deliveryChallanId?: string | null;
  handedOverById?: string | null;
  receivedById?: string | null;
  receiverRole: string;
  status: MaterialHandoverStatus | string;
  verificationDate?: string | Date | null;
  totalItemsExpected: number;
  totalItemsVerified: number;
  discrepancyNotes?: string | null;
  siteLocationNotes?: string | null;
  custodySignatureUrl?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  lines?: MaterialHandoverLineRecord[];
}

export interface MaterialHandoverLineRecord {
  id: string;
  organizationId: string;
  handoverId: string;
  productVariantId: string;
  expectedQuantity: number;
  verifiedQuantity: number;
  damagedQuantity: number;
  missingQuantity: number;
  serialNumbersExpected: string[];
  serialNumbersVerified: string[];
  status: MaterialHandoverLineStatus | string;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  productVariant?: {
    id: string;
    sku: string;
    name: string;
  };
}

export interface MaterialConsumptionRecord {
  id: string;
  organizationId: string;
  consumptionNumber: string;
  projectInitiationId: string;
  workOrderId?: string | null;
  productVariantId: string;
  quantityUsed: number;
  serialNumbers: string[];
  recordedById?: string | null;
  recordedAt: string | Date;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// -----------------------------------------------------------------------------
// 6. Installation Safety Management
// -----------------------------------------------------------------------------

export interface InstallationSafetyRecordType {
  id: string;
  organizationId: string;
  safetyNumber: string;
  projectInitiationId: string;
  workOrderId?: string | null;
  inspectionDate: string | Date;
  conductedById: string;
  supervisorSignOffId?: string | null;
  supervisorSignedAt?: string | Date | null;
  status: InstallationSafetyStatus | string;
  toolboxTalkConducted: boolean;
  toolboxTopic?: string | null;
  ppeComplianceVerified: boolean;
  fallProtectionVerified: boolean;
  electricalIsolationVerified: boolean;
  weatherSafeForWork: boolean;
  stopWorkIssued: boolean;
  stopWorkReason?: string | null;
  stopWorkLiftedAt?: string | Date | null;
  stopWorkLiftedById?: string | null;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  checklistItems?: SafetyChecklistItemRecord[];
  observations?: SafetyObservationRecord[];
}

export interface SafetyChecklistItemRecord {
  id: string;
  organizationId: string;
  safetyRecordId: string;
  itemKey: string;
  description: string;
  isMandatory: boolean;
  status: SafetyCheckStatus | string;
  photoUrl?: string | null;
  remarks?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface SafetyObservationRecord {
  id: string;
  organizationId: string;
  safetyRecordId: string;
  observationType: SafetyObservationType | string;
  severity: SafetySeverity | string;
  description: string;
  correctiveAction?: string | null;
  actionTakenById?: string | null;
  isResolved: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface SafetyIncidentRecord {
  id: string;
  organizationId: string;
  incidentNumber: string;
  projectInitiationId: string;
  workOrderId?: string | null;
  incidentDate: string | Date;
  reportedById: string;
  severity: IncidentSeverity | string;
  description: string;
  immediateActionTaken: string;
  rootCause?: string | null;
  preventiveAction?: string | null;
  regulatoryReportRequired: boolean;
  regulatoryReportStatus?: string | null;
  closedAt?: string | Date | null;
  closedById?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// -----------------------------------------------------------------------------
// 7. Installation Quality Inspection
// -----------------------------------------------------------------------------

export interface InstallationQualityInspectionRecord {
  id: string;
  organizationId: string;
  inspectionNumber: string;
  projectInitiationId: string;
  workOrderId?: string | null;
  stage: InstallationQualityStage | string;
  inspectorId: string;
  inspectionDate: string | Date;
  overallResult: QualityInspectionResult | string;
  reworkDeadline?: string | Date | null;
  reworkCompletedAt?: string | Date | null;
  reworkVerifiedById?: string | null;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  items?: QualityInspectionItemRecord[];
}

export interface QualityInspectionItemRecord {
  id: string;
  organizationId: string;
  qualityInspectionId: string;
  checkpointKey: string;
  checkpointName: string;
  toleranceCriteria?: string | null;
  observedValue?: string | null;
  isMandatory: boolean;
  result: QualityInspectionResult | string;
  deviationNotes?: string | null;
  photoUrl?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// -----------------------------------------------------------------------------
// 8. Testing & Commissioning
// -----------------------------------------------------------------------------

export interface CommissioningRecordType {
  id: string;
  organizationId: string;
  commissioningNumber: string;
  projectInitiationId: string;
  engineerId: string;
  commissioningDate: string | Date;
  status: CommissioningStatus | string;
  gridSyncSuccessful: boolean;
  gridSyncTimestamp?: string | Date | null;
  gridVoltageObserved?: number | null;
  gridFrequencyObserved?: number | null;
  acPowerOutputKw?: number | null;
  dcVoltageString1?: number | null;
  dcVoltageString2?: number | null;
  dcCurrentString1?: number | null;
  dcCurrentString2?: number | null;
  inverterSerialNumbers: string[];
  netMeterSerialAssigned?: string | null;
  approvedById?: string | null;
  approvedAt?: string | Date | null;
  rejectionReason?: string | null;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  tests?: CommissioningTestRecord[];
}

export interface CommissioningTestRecord {
  id: string;
  organizationId: string;
  commissioningRecordId: string;
  testCategory: CommissioningTestCategory | string;
  testName: string;
  unit?: string | null;
  expectedValue?: string | null;
  measuredValue: string;
  isMandatory: boolean;
  testResult: CommissioningTestResult | string;
  testedAt: string | Date;
  remarks?: string | null;
  evidenceUrl?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// -----------------------------------------------------------------------------
// 9. DISCOM & Utility Tracking
// -----------------------------------------------------------------------------

export interface UtilityConnectionTrackingRecord {
  id: string;
  organizationId: string;
  trackingCode: string;
  projectInitiationId: string;
  discomName: string;
  divisionOffice?: string | null;
  consumerNumber: string;
  sanctionedLoadKw: number;
  solarCapacityKw: number;
  applicationNumber?: string | null;
  applicationSubmittedDate?: string | Date | null;
  technicalFeasibilityStatus: string;
  feasibilityApprovalDate?: string | Date | null;
  discomWorkOrderNumber?: string | null;
  discomInspectionDate?: string | Date | null;
  discomInspectorName?: string | null;
  inspectionResult: string;
  meterTestingDate?: string | Date | null;
  netMeterInstalledDate?: string | Date | null;
  netMeterSerialNumber?: string | null;
  gridSynchronizationDate?: string | Date | null;
  ppaAgreementDate?: string | Date | null;
  subsidyPortalRegistrationId?: string | null;
  subsidyClaimStatus: SubsidyClaimStatus | string;
  subsidyAmountEligible?: number | null;
  subsidyAmountDisbursed?: number | null;
  status: DiscomTrackingStatus | string;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// -----------------------------------------------------------------------------
// 10. Customer Handover & Punchlist
// -----------------------------------------------------------------------------

export interface CustomerHandoverRecord {
  id: string;
  organizationId: string;
  handoverNumber: string;
  projectInitiationId: string;
  handoverDate: string | Date;
  conductedById: string;
  customerRepName: string;
  customerRepPhone: string;
  customerRepDesignation?: string | null;
  status: CustomerHandoverStatus | string;
  punchlistItemsCount: number;
  resolvedPunchlistCount: number;
  customerSatisfactionScore?: number | null;
  customerFeedbackNotes?: string | null;
  customerSignatureUrl?: string | null;
  companyRepresentativeSignatureUrl?: string | null;
  handoverPackGenerated: boolean;
  handoverPackUrl?: string | null;
  warrantyCertificateGenerated: boolean;
  warrantyStartDate?: string | Date | null;
  warrantyEndDate?: string | Date | null;
  finalInstalledCapacityKw: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  punchlistItems?: HandoverPunchlistItemRecord[];
  documents?: HandoverDocumentRecord[];
}

export interface HandoverPunchlistItemRecord {
  id: string;
  organizationId: string;
  handoverId: string;
  itemNumber: number;
  category: string;
  description: string;
  severity: PunchlistSeverity | string;
  targetResolutionDate?: string | Date | null;
  resolvedAt?: string | Date | null;
  resolvedById?: string | null;
  resolutionNotes?: string | null;
  isResolved: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface HandoverDocumentRecord {
  id: string;
  organizationId: string;
  handoverId: string;
  documentType: HandoverDocumentType | string;
  title: string;
  fileUrl: string;
  fileSize?: number | null;
  createdAt: string | Date;
}

// -----------------------------------------------------------------------------
// 11. Project Cost Records
// -----------------------------------------------------------------------------

export interface ProjectCostRecordType {
  id: string;
  organizationId: string;
  costRecordNumber: string;
  projectInitiationId: string;
  workOrderId?: string | null;
  costCategory: ProjectCostCategory | string;
  amount: number;
  currency: string;
  incurredDate: string | Date;
  vendorName?: string | null;
  invoiceNumber?: string | null;
  approvedById?: string | null;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// -----------------------------------------------------------------------------
// 12. Execution Cockpit KPIs
// -----------------------------------------------------------------------------

export interface InstallationCockpitKpis {
  totalActiveProjects: number;
  readyForInstallation: number;
  inProgressInstallation: number;
  qualityPending: number;
  commissioningPending: number;
  commissioned: number;
  customerHandoverPending: number;
  completed: number;
  totalActiveCrews: number;
  availableTechnicians: number;
  openSafetyObservations: number;
  stopWorkIncidentsActive: number;
}

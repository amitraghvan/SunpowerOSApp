import { SurveyStatus, SurveyPhotoCategory, RoofType, ElectricalPhase, InverterLocation } from './domain-enums';

export interface ISurveyTechnicalAssessment {
  roofType?: RoofType | string | null;
  roofAgeYears?: number | null;
  roofPitchDegrees?: number | null;
  roofAzimuthDegrees?: number | null;
  roofCondition?: string | null;
  usableAreaSqFt?: number | null;
  shadowObstacles?: string | null;
  recommendedCapacityKw?: number | null;

  sanctionedLoadKw?: number | null;
  currentVoltage?: number | null;
  phaseType?: ElectricalPhase | string | null;
  incomingCableCapacitySqMm?: number | null;
  cableLengthMeters?: number | null;
  earthingRequired?: boolean;
  earthResistanceOhms?: number | null;
  lightningArresterRequired?: boolean;
  mainSwitchboardCondition?: string | null;
  inverterLocation?: InverterLocation | string | null;
  distanceToMainPanelMeters?: number | null;

  accessibilityNotes?: string | null;
  craneRequired?: boolean;
  ladderRequired?: boolean;
  storageAvailableOnSite?: boolean;
  canSupportStructure?: boolean;
  reinforcementRequired?: boolean;
  remarks?: string | null;
}

export interface ISurvey extends ISurveyTechnicalAssessment {
  id: string;
  organizationId: string;
  surveyNumber: string;
  customerId: string;
  siteId: string;
  leadId?: string | null;
  assignedTechnicianId?: string | null;
  scheduledDate?: Date | string | null;
  completedDate?: Date | string | null;
  status: SurveyStatus | string;
  rejectionReason?: string | null;
  currentRevisionNumber: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ISurveyRevision {
  id: string;
  organizationId: string;
  surveyId: string;
  revisionNumber: number;
  changesSummary?: string | null;
  dataSnapshot: Record<string, any>;
  createdById?: string | null;
  createdAt: Date | string;
}

export interface ISurveyPhoto {
  id: string;
  organizationId: string;
  surveyId: string;
  category: SurveyPhotoCategory | string;
  objectKey: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  caption?: string | null;
  uploadedById?: string | null;
  createdAt: Date | string;
  downloadUrl?: string;
}

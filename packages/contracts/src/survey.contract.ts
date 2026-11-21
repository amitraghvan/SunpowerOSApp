import { PaginationQueryDto } from './pagination.contract';
import { SurveyStatus, SurveyPhotoCategory, RoofType, ElectricalPhase, InverterLocation } from '@solaros/types';

export interface CreateSurveyDto {
  customerId: string;
  siteId: string;
  leadId?: string;
  assignedTechnicianId?: string;
  scheduledDate?: string;
}

export interface ScheduleSurveyDto {
  assignedTechnicianId: string;
  scheduledDate: string;
}

export interface SubmitSurveyAssessmentDto {
  roofType?: RoofType | string;
  roofAgeYears?: number;
  roofPitchDegrees?: number;
  roofAzimuthDegrees?: number;
  roofCondition?: string;
  usableAreaSqFt?: number;
  shadowObstacles?: string;
  recommendedCapacityKw?: number;

  sanctionedLoadKw?: number;
  currentVoltage?: number;
  phaseType?: ElectricalPhase | string;
  incomingCableCapacitySqMm?: number;
  cableLengthMeters?: number;
  earthingRequired?: boolean;
  earthResistanceOhms?: number;
  lightningArresterRequired?: boolean;
  mainSwitchboardCondition?: string;
  inverterLocation?: InverterLocation | string;
  distanceToMainPanelMeters?: number;

  accessibilityNotes?: string;
  craneRequired?: boolean;
  ladderRequired?: boolean;
  storageAvailableOnSite?: boolean;
  canSupportStructure?: boolean;
  reinforcementRequired?: boolean;
  remarks?: string;
}

export interface ReviewSurveyDto {
  action: 'APPROVE' | 'REQUEST_REVISION';
  rejectionReason?: string;
  changesSummary?: string;
}

export interface PresignedUploadRequestDto {
  fileName: string;
  mimeType: string;
  category: SurveyPhotoCategory | string;
  caption?: string;
}

export interface ConfirmPhotoUploadDto {
  category: SurveyPhotoCategory | string;
  objectKey: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  caption?: string;
}

export interface SurveyFilterQueryDto extends PaginationQueryDto {
  status?: string;
  customerId?: string;
  assignedTechnicianId?: string;
}

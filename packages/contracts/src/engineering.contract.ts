import { SolarSystemType, ElectricalPhase } from '@solaros/types';

export interface CreateDesignDto {
  customerId: string;
  siteId: string;
  surveyId: string;
  title: string;
  systemType: SolarSystemType;
  connectionType?: ElectricalPhase;
  targetCapacityKw: number;
}

export interface ConfigureDesignRevisionDto {
  panelVariantId: string;
  moduleQuantity?: number;
  inverterVariantId: string;
  inverterQuantity?: number;
  batteryVariantId?: string;
  batteryQuantity?: number;
  structureVariantId?: string;
  tiltDegrees?: number;
  azimuthDegrees?: number;
  stringCount?: number;
  modulesPerString?: number;
}

export interface RunCalculationDto {
  designId: string;
  revisionNumber?: number;
  minDesignTempCelsius?: number;
  maxCellTempCelsius?: number;
  dailyPeakSunHours?: number;
}

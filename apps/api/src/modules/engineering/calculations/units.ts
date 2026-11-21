/**
 * Pure engineering unit conversion functions
 */

export function wattsToKw(watts: number): number {
  return Number((watts / 1000).toFixed(4));
}

export function kwToWatts(kw: number): number {
  return Number((kw * 1000).toFixed(2));
}

export function whToKwh(wh: number): number {
  return Number((wh / 1000).toFixed(4));
}

export function kwhToWh(kwh: number): number {
  return Number((kwh * 1000).toFixed(2));
}

export function sqFtToSqMeters(sqFt: number): number {
  return Number((sqFt * 0.092903).toFixed(2));
}

export function sqMetersToSqFt(sqMeters: number): number {
  return Number((sqMeters / 0.092903).toFixed(2));
}

export function celsiusToKelvin(celsius: number): number {
  return Number((celsius + 273.15).toFixed(2));
}

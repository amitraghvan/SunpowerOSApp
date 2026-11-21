/**
 * DC / AC Ratio Calculation and Threshold Validation
 */

export interface DcAcRatioEvaluation {
  ratio: number;
  status: 'OPTIMAL' | 'ACCEPTABLE' | 'UNDERSIZED' | 'OVERSIZED';
  isCompliant: boolean;
  message: string;
}

export function evaluateDcAcRatio(
  totalDcCapacityKw: number,
  totalAcCapacityKw: number,
  minAllowed = 1.05,
  maxAllowed = 1.40,
): DcAcRatioEvaluation {
  if (totalAcCapacityKw <= 0) {
    throw new Error('Total AC inverter capacity must be greater than zero');
  }

  const ratio = Number((totalDcCapacityKw / totalAcCapacityKw).toFixed(3));

  if (ratio < 1.0) {
    return {
      ratio,
      status: 'UNDERSIZED',
      isCompliant: false,
      message: `DC/AC ratio (${ratio}) is under 1.00. Inverter capacity is oversized for solar array, increasing project LCOE.`,
    };
  }

  if (ratio < minAllowed) {
    return {
      ratio,
      status: 'ACCEPTABLE',
      isCompliant: true,
      message: `DC/AC ratio (${ratio}) is slightly conservative. Consider adding modules to maximize inverter utilization.`,
    };
  }

  if (ratio <= 1.30) {
    return {
      ratio,
      status: 'OPTIMAL',
      isCompliant: true,
      message: `DC/AC ratio (${ratio}) is in optimal engineering range (1.15 - 1.30) for rooftop systems in India.`,
    };
  }

  if (ratio <= maxAllowed) {
    return {
      ratio,
      status: 'ACCEPTABLE',
      isCompliant: true,
      message: `DC/AC ratio (${ratio}) is within acceptable peak clipping margin. Peak power clipping will be minimal (<1.5%).`,
    };
  }

  return {
    ratio,
    status: 'OVERSIZED',
    isCompliant: false,
    message: `DC/AC ratio (${ratio}) exceeds maximum standard limit (${maxAllowed}). High risk of inverter overheating and significant clipping losses.`,
  };
}

/**
 * Analyzes stadium gate telemetry data and computes crowd advisories based on occupancy thresholds and trends.
 * 
 * @param {Array<import('./utils.js').GateData>} gates - Array of raw gate telemetry objects
 * @returns {Array<import('./utils.js').GateAdvisory>} Array of evaluated gate advisory objects
 */
export function analyzeGateAdvisories(gates) {
  if (!Array.isArray(gates)) {
    return [];
  }

  return gates.map(gate => evaluateSingleGate(gate));
}

/**
 * Evaluates advisory status, recommended action, and rationale for a single gate.
 * 
 * @param {import('./utils.js').GateData} gate - Raw gate telemetry object
 * @returns {import('./utils.js').GateAdvisory}
 */
function evaluateSingleGate(gate) {
  const { occupancy = 0, trend = 'stable' } = gate || {};
  const { status, action, explanation } = determineGateStatusAndAction(occupancy, trend);

  return {
    ...gate,
    status,
    action,
    explanation
  };
}

/**
 * Determines status level, operational action, and reasoning based on occupancy percentage and flow trend.
 * 
 * @param {number} occupancy - Gate occupancy percentage (0-100)
 * @param {string} trend - Ingress/egress flow direction ('rising' | 'falling' | 'stable')
 * @returns {{ status: import('./utils.js').AdvisoryStatus, action: string, explanation: string }}
 */
function determineGateStatusAndAction(occupancy, trend) {
  if (occupancy >= 90) {
    return {
      status: 'critical',
      action: 'TEMPORARY GATE CLOSURE & CROWD REDIRECTION',
      explanation: `CRITICAL: Occupancy is at ${occupancy}%, exceeding the critical safety limit (>= 90%). Direct volunteers to close entry turnstiles immediately and divert arriving spectators to adjacent gates.`
    };
  }

  if (occupancy >= 75) {
    return {
      status: 'warning',
      action: 'DISPATCH ADDITIONAL GATE STEWARDS',
      explanation: `WARNING: Occupancy has reached ${occupancy}%, exceeding the queue warning limit (>= 75%). Deploy extra ticket scanning personnel and queue management volunteers to expedite flow.`
    };
  }

  if (occupancy >= 60 && trend === 'rising') {
    return {
      status: 'info',
      action: 'MONITOR ACTIVE FLOW',
      explanation: `INFO: Occupancy is moderate at ${occupancy}%, but the trend is rising. Volunteers should keep lanes clear and monitor for potential bottlenecking.`
    };
  }

  return {
    status: 'normal',
    action: 'Maintain normal operations.',
    explanation: trend === 'rising'
      ? `Gate occupancy is low at ${occupancy}% but the flow is rising. Normal monitor status.`
      : `Gate occupancy is at ${occupancy}%, which is within safe operating limits under normal flow conditions.`
  };
}

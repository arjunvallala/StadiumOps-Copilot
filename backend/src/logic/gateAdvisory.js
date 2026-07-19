/**
 * Analyzes gate data and computes crowd advisories based on occupancy thresholds and trends.
 * 
 * @param {Array<{ id: string, name: string, occupancy: number, capacity: number, trend: 'rising' | 'falling' | 'stable' }>} gates 
 * @returns {Array<{
 *   id: string,
 *   name: string,
 *   occupancy: number,
 *   capacity: number,
 *   trend: string,
 *   status: 'critical' | 'warning' | 'info' | 'normal',
 *   action: string,
 *   explanation: string
 * }>}
 */
export function analyzeGateAdvisories(gates) {
  if (!Array.isArray(gates)) {
    return [];
  }

  return gates.map(gate => {
    const { occupancy, trend } = gate;
    let status = 'normal';
    let action = 'Maintain normal operations.';
    let explanation = `Gate occupancy is at ${occupancy}%, which is within safe operating limits under normal flow conditions.`;

    if (occupancy >= 90) {
      status = 'critical';
      action = 'TEMPORARY GATE CLOSURE & CROWD REDIRECTION';
      explanation = `CRITICAL: Occupancy is at ${occupancy}%, exceeding the critical safety limit (>= 90%). Direct volunteers to close entry turnstiles immediately and divert arriving spectators to adjacent gates.`;
    } else if (occupancy >= 75) {
      status = 'warning';
      action = 'DISPATCH ADDITIONAL GATE STEWARDS';
      explanation = `WARNING: Occupancy has reached ${occupancy}%, exceeding the queue warning limit (>= 75%). Deploy extra ticket scanning personnel and queue management volunteers to expedite flow.`;
    } else if (occupancy >= 60 && trend === 'rising') {
      status = 'info';
      action = 'MONITOR ACTIVE FLOW';
      explanation = `INFO: Occupancy is moderate at ${occupancy}%, but the trend is rising. Volunteers should keep lanes clear and monitor for potential bottlenecking.`;
    } else if (trend === 'rising') {
      explanation = `Gate occupancy is low at ${occupancy}% but the flow is rising. Normal monitor status.`;
    }

    return {
      ...gate,
      status,
      action,
      explanation
    };
  });
}

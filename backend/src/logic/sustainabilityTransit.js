/**
 * Pure function to compute sustainability and transportation advisories for FIFA World Cup 2026.
 * 
 * @param {'pre-match' | 'live' | 'halftime' | 'post-match'} phase - Current tournament match phase
 * @param {Array<{ id: string, name: string, occupancy: number, status: string }>} gateAdvisories - Analyzed gate status array
 * @returns {{
 *   sustainability: { level: 'normal' | 'warning' | 'high-surge', wasteBinFocus: string, recyclingRatio: number, recommendation: string, reasoning: string },
 *   transportation: { shuttleStatus: 'standby' | 'active' | 'peak-frequency', primaryHub: string, transitAction: string, reasoning: string }
 * }}
 */
export function computeSustainabilityTransitAdvisory(phase = 'pre-match', gateAdvisories = []) {
  const normalizedPhase = (phase || 'pre-match').toLowerCase();
  const criticalOrWarningGates = gateAdvisories.filter(g => g.status === 'critical' || g.status === 'warning');

  const sustainability = calculateSustainabilityAdvisory(normalizedPhase, criticalOrWarningGates);
  const transportation = calculateTransportationAdvisory(normalizedPhase, criticalOrWarningGates);

  return {
    phase: normalizedPhase,
    sustainability,
    transportation
  };
}

/**
 * Calculates sustainability and waste management metrics.
 * 
 * @param {string} phase 
 * @param {Array<object>} highLoadGates 
 * @returns {object}
 */
function calculateSustainabilityAdvisory(phase, highLoadGates) {
  switch (phase) {
    case 'halftime':
      return {
        level: 'warning',
        wasteBinFocus: 'Concourse Concessions & Restroom Plazas',
        recyclingRatio: 40,
        recommendation: 'Deploy mobile waste sorting stewards to concession exits.',
        reasoning: 'Halftime food and beverage surge generates peak compostable/recyclable packaging waste across concourses.'
      };
    case 'post-match':
      return {
        level: 'high-surge',
        wasteBinFocus: 'Stadium Exit Gates & Transit Clearance Hubs',
        recyclingRatio: 60,
        recommendation: 'Activate post-match stadium sweep and zero-waste sorting teams.',
        reasoning: 'Spectators clearing seating bowls leave high volume of recyclable beverage containers and souvenir packaging.'
      };
    case 'live':
      return {
        level: 'normal',
        wasteBinFocus: 'Perimeter Sorting Stations',
        recyclingRatio: 25,
        recommendation: 'Maintain standard waste container compaction schedule.',
        reasoning: 'Low active movement in concourses; waste accumulation is steady and manageable.'
      };
    case 'pre-match':
    default:
      return {
        level: 'normal',
        wasteBinFocus: 'Outer Security Checkpoints & Entry Gates',
        recyclingRatio: 30,
        recommendation: 'Ensure entry perimeter recycling receptacles are empty prior to gate opening.',
        reasoning: 'Inbound spectators dispose of non-permitted food/drink items at outer security lines.'
      };
  }
}

/**
 * Calculates transportation and spectator egress flow advisories.
 * 
 * @param {string} phase 
 * @param {Array<object>} highLoadGates 
 * @returns {object}
 */
function calculateTransportationAdvisory(phase, highLoadGates) {
  const gateAlertActive = highLoadGates.length > 0;
  const gateNames = highLoadGates.map(g => g.name).join(', ');

  switch (phase) {
    case 'post-match':
      return {
        shuttleStatus: 'peak-frequency',
        primaryHub: 'North Rail Terminal & South Bus Loop',
        transitAction: 'Dispatch shuttle fleet at maximum 2-minute headway intervals.',
        reasoning: gateAlertActive
          ? `CRITICAL EGRESS SURGE: Heavy exit flow detected at ${gateNames}. Expedite bus loading and direct spectators to underutilized East Transit Hub.`
          : 'Post-match egress phase: 80,000+ spectators leaving simultaneously. Maximum transit capacity deployed.'
      };
    case 'pre-match':
      return {
        shuttleStatus: 'active',
        primaryHub: 'Outer Park & Ride Garages to Stadium Entry Gates',
        transitAction: 'Continuous park-and-ride shuttle operations.',
        reasoning: gateAlertActive
          ? `INBOUND BOTTLENECK: High arrival density near ${gateNames}. Adjust shuttle drop-off point 200m south to balance gate queues.`
          : 'Pre-match arrival phase: Inbound spectators arriving via metro and express shuttles.'
      };
    case 'halftime':
    case 'live':
    default:
      return {
        shuttleStatus: 'standby',
        primaryHub: 'Central Transit Operations Yard',
        transitAction: 'Maintain standby fleet readiness for post-match departure phase.',
        reasoning: 'Match in progress: Minimal transit demand. Vehicles staging for post-match egress.'
      };
  }
}

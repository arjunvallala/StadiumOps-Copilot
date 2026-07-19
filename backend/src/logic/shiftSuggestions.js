/**
 * Computes shift suggestions and volunteer positioning based on match phase and gate advisories.
 * 
 * @param {'pre-match' | 'live' | 'halftime' | 'post-match'} phase - Current tournament match phase
 * @param {Array<import('./utils.js').GateAdvisory>} gateAdvisories - Analyzed gate advisory objects
 * @returns {{
 *   phase: string,
 *   summary: string,
 *   suggestions: Array<import('./utils.js').ShiftSuggestion>
 * }}
 */
export function getShiftSuggestions(phase, gateAdvisories = []) {
  const normalizedPhase = (phase || 'pre-match').toLowerCase();
  const safeGates = Array.isArray(gateAdvisories) ? gateAdvisories : [];
  
  const criticalGates = safeGates.filter(g => g && g.status === 'critical');
  const warningGates = safeGates.filter(g => g && g.status === 'warning');

  switch (normalizedPhase) {
    case 'pre-match':
      return buildPreMatchSuggestions(criticalGates, warningGates);
    case 'live':
      return buildLiveSuggestions();
    case 'halftime':
      return buildHalftimeSuggestions();
    case 'post-match':
      return buildPostMatchSuggestions(criticalGates, warningGates);
    default:
      return buildDefaultSuggestions();
  }
}

/**
 * Builds pre-match volunteer force positioning suggestions.
 * @param {Array<import('./utils.js').GateAdvisory>} criticalGates 
 * @param {Array<import('./utils.js').GateAdvisory>} warningGates 
 * @returns {object}
 */
function buildPreMatchSuggestions(criticalGates, warningGates) {
  const summary = 'Inbound flow phase: Focus heavily on gate entry scanning, ticket validation, and queue sorting.';
  
  let suggestions = [
    {
      location: 'Outer Security Perimeter',
      allocationPercentage: 30,
      task: 'Spectator sorting and bag checks guidance',
      reasoning: 'Pre-match phase has heavy incoming foot traffic; volunteers filter fans before they reach gates.'
    },
    {
      location: 'Main Entry Gates',
      allocationPercentage: 50,
      task: 'Ticket scanning and lane flow control',
      reasoning: 'Primary entry point processing is active, necessitating maximum scanner operations.'
    },
    {
      location: 'Concourse Information Desks',
      allocationPercentage: 20,
      task: 'Directional assistance and seat finding',
      reasoning: 'Early arrivals require help locating sections, food stalls, and amenities.'
    }
  ];

  if (criticalGates.length > 0) {
    const names = criticalGates.map(g => g.name).join(', ');
    suggestions = suggestions.map(s => {
      if (s.location === 'Concourse Information Desks') return { ...s, allocationPercentage: 10 };
      if (s.location === 'Main Entry Gates') {
        return {
          location: 'Main Entry Gates (RE-ROUTE TO CRITICAL GATES)',
          allocationPercentage: 60,
          task: 'Emergency flow diversion and manual scanning override',
          reasoning: `DANGER: Critical overcrowding detected at ${names} (${criticalGates[0].occupancy}%). 10% staff reallocated here to manage crowd diversion and prevent gate blockages.`
        };
      }
      return s;
    });
  } else if (warningGates.length > 0) {
    const names = warningGates.map(g => g.name).join(', ');
    suggestions = suggestions.map(s => {
      if (s.location === 'Main Entry Gates') {
        return {
          location: 'Main Entry Gates (SUPPORT HIGH LOAD GATES)',
          allocationPercentage: 55,
          task: 'Queue management and additional ticket scanning assistance',
          reasoning: `Queue backup detected at ${names} (${warningGates[0].occupancy}%). Deploying extra support to clear lines.`
        };
      }
      if (s.location === 'Concourse Information Desks') return { ...s, allocationPercentage: 15 };
      return s;
    });
  }

  return { phase: 'pre-match', summary, suggestions };
}

/**
 * Builds live match volunteer force positioning suggestions.
 * @returns {object}
 */
function buildLiveSuggestions() {
  return {
    phase: 'live',
    summary: 'Match active phase: Spectators are in seats. Focus on concourse patrol, emergency corridors, and concessions monitoring.',
    suggestions: [
      {
        location: 'Concourse & Aisles Patrol',
        allocationPercentage: 40,
        task: 'Monitoring exit routes and looking out for security or medical incidents',
        reasoning: 'Crowd is static in seats; focus shifts to patrolling corridors to maintain clear evacuation pathways.'
      },
      {
        location: 'Food & Beverage / Concession Areas',
        allocationPercentage: 35,
        task: 'Queue flow organization and cleanliness checks',
        reasoning: 'Spectators slip out during the match for snacks, requiring moderate service queue support.'
      },
      {
        location: 'First Aid & Medical Tents Guide',
        allocationPercentage: 25,
        task: 'Escorting fans to first-aid stations and greeting medical vehicles',
        reasoning: 'Medical emergencies during play need clear, direct volunteer guidance to medical points.'
      }
    ]
  };
}

/**
 * Builds halftime volunteer force positioning suggestions.
 * @returns {object}
 */
function buildHalftimeSuggestions() {
  return {
    phase: 'halftime',
    summary: 'Halftime rush phase: Peak crowd movement in concourses. Prioritize concessions, restrooms, and main corridor safety.',
    suggestions: [
      {
        location: 'Concessions Queue Control',
        allocationPercentage: 45,
        task: 'Organizing long lines, preventing corridor blockages',
        reasoning: 'Massive rush for refreshments within a 15-minute window requires active queue organization.'
      },
      {
        location: 'Restroom Entrances',
        allocationPercentage: 35,
        task: 'Directing spectators to low-occupancy restrooms, queue sorting',
        reasoning: 'Directing fans to underutilized restrooms reduces crowd density and speeds up flow.'
      },
      {
        location: 'Corridor Flow Regulators',
        allocationPercentage: 20,
        task: 'Directing bidirectional foot traffic to avoid head-on crowd blockages',
        reasoning: 'Keeping concourse paths split helps prevent bottlenecks when spectators cross directions.'
      }
    ]
  };
}

/**
 * Builds post-match spectator egress volunteer positioning suggestions.
 * @param {Array<import('./utils.js').GateAdvisory>} criticalGates 
 * @param {Array<import('./utils.js').GateAdvisory>} warningGates 
 * @returns {object}
 */
function buildPostMatchSuggestions(criticalGates, warningGates) {
  const summary = 'Outbound flow phase: Spectators exiting stadium. Focus on exit gates, public transit terminals, and perimeter safety.';
  let suggestions = [
    {
      location: 'Exit Gates & Exit Paths',
      allocationPercentage: 50,
      task: 'Ensuring doors are pinned open and flow is unimpeded',
      reasoning: 'High volume exiting requires all pathways to remain fully clear to avoid gate-crush incidents.'
    },
    {
      location: 'Transit Terminals (Bus/Train)',
      allocationPercentage: 40,
      task: 'Queue management and train/bus boarding guidance',
      reasoning: 'Exiting crowds cluster at bus/rail lanes. Volunteers prevent crowding on platform edges.'
    },
    {
      location: 'Lost & Found / Info Points',
      allocationPercentage: 10,
      task: 'Handling claims and post-event enquiries',
      reasoning: 'A small portion of fans need lost item reports or exit directions.'
    }
  ];

  const targetGates = criticalGates.length > 0 ? criticalGates : warningGates;
  if (targetGates.length > 0) {
    const names = targetGates.map(g => g.name).join(', ');
    suggestions = suggestions.map(s => {
      if (s.location === 'Exit Gates & Exit Paths') {
        return {
          location: 'Exit Gates & Exit Paths (CRITICAL EXIT)',
          allocationPercentage: 60,
          task: 'Emergency egress management, keeping bottlenecks clear',
          reasoning: `Bottlenecks detected at egress points: ${names}. Reallocated 10% staff to guide exiting spectators smoothly and prevent crowd build-up.`
        };
      }
      if (s.location === 'Lost & Found / Info Points') return { ...s, allocationPercentage: 0 };
      return s;
    });
  }

  return { phase: 'post-match', summary, suggestions };
}

/**
 * Default fallback positioning suggestion.
 * @returns {object}
 */
function buildDefaultSuggestions() {
  return {
    phase: 'unknown',
    summary: 'Unknown tournament phase. Distribute volunteers evenly across gates.',
    suggestions: [
      {
        location: 'All Gates',
        allocationPercentage: 100,
        task: 'General monitoring',
        reasoning: 'Default standby posture.'
      }
    ]
  };
}

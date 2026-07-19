/**
 * Pure function to classify incidents using rule-based keyword matching.
 * Returns classification details if a rule matches, or matches: false if LLM fallback is needed.
 * 
 * @param {string} rawText 
 * @returns {{ matches: boolean, classification?: { category: string, severity: string, action: string, explanation: string } }}
 */
export function classifyIncidentRules(rawText) {
  const text = rawText.toLowerCase();

  // 1. MEDICAL - CRITICAL
  const medicalCriticalKeywords = ['collapsed', 'unconscious', 'heart attack', 'cardiac', 'chest pain', 'seizure', 'stroke', 'unresponsive', 'bleeding heavily', 'no breathing'];
  if (medicalCriticalKeywords.some(kw => text.includes(kw))) {
    return {
      matches: true,
      classification: {
        category: 'medical',
        severity: 'critical',
        action: 'Dispatch Medical First Responders & Notify Command Center',
        explanation: `Rule Match (Medical-Critical): Report contains urgent medical indicator terms (${medicalCriticalKeywords.filter(kw => text.includes(kw)).map(kw => `'${kw}'`).join(', ')}). Immediate response protocol triggered.`
      }
    };
  }

  // 2. MEDICAL - HIGH/MEDIUM
  const medicalMediumKeywords = ['fainted', 'injury', 'asthma', 'breathing difficulty', 'broken bone', 'fracture', 'bleeding', 'burn', 'vomiting', 'heat stroke'];
  if (medicalMediumKeywords.some(kw => text.includes(kw))) {
    return {
      matches: true,
      classification: {
        category: 'medical',
        severity: 'high',
        action: 'Alert Nearest Medical Station & Dispatch Volunteer Guide',
        explanation: `Rule Match (Medical-High): Report contains standard medical or injury terms (${medicalMediumKeywords.filter(kw => text.includes(kw)).map(kw => `'${kw}'`).join(', ')}). Standard medical dispatch initiated.`
      }
    };
  }

  // 3. SECURITY - CRITICAL
  const securityCriticalKeywords = ['weapon', 'bomb', 'gun', 'knife', 'threat', 'explosion', 'terrorist', 'shooter', 'active threat'];
  if (securityCriticalKeywords.some(kw => text.includes(kw))) {
    return {
      matches: true,
      classification: {
        category: 'security',
        severity: 'critical',
        action: 'Initiate Emergency Evacuation & Dispatch Security/Law Enforcement',
        explanation: `Rule Match (Security-Critical): Report contains high-threat weapons or active terror terms (${securityCriticalKeywords.filter(kw => text.includes(kw)).map(kw => `'${kw}'`).join(', ')}). Immediate security escalation triggered.`
      }
    };
  }

  // 4. SECURITY - HIGH
  const securityHighKeywords = ['fight', 'brawl', 'punch', 'stolen', 'theft', 'pickpocket', 'flare', 'smoke bomb', 'assault', 'robbery', 'hooligan', 'violence'];
  if (securityHighKeywords.some(kw => text.includes(kw))) {
    return {
      matches: true,
      classification: {
        category: 'security',
        severity: 'high',
        action: 'Dispatch Security Team & Alert Local Police',
        explanation: `Rule Match (Security-High): Report contains security breach or physical altercation terms (${securityHighKeywords.filter(kw => text.includes(kw)).map(kw => `'${kw}'`).join(', ')}). Dispatching venue security.`
      }
    };
  }

  // 5. CROWD - HIGH
  const crowdHighKeywords = ['crowd crush', 'overcrowding', 'gate blocked', 'stampede', 'crowded', 'crush', 'bottleneck', 'gate overflow'];
  if (crowdHighKeywords.some(kw => text.includes(kw))) {
    return {
      matches: true,
      classification: {
        category: 'crowd',
        severity: 'high',
        action: 'Implement Crowd Diverting Protocols & Dispatch Gate Stewards',
        explanation: `Rule Match (Crowd-High): Report indicates active congestion or flow blockage (${crowdHighKeywords.filter(kw => text.includes(kw)).map(kw => `'${kw}'`).join(', ')}). High severity crowd management actions active.`
      }
    };
  }

  // 6. CROWD - MEDIUM
  const crowdMediumKeywords = ['long queue', 'slow entry', 'ticket scanner broken', 'scanner down', 'gate slow', 'turnstile stuck'];
  if (crowdMediumKeywords.some(kw => text.includes(kw))) {
    return {
      matches: true,
      classification: {
        category: 'crowd',
        severity: 'medium',
        action: 'Dispatch Additional Gate Support & Open Overflow Lanes',
        explanation: `Rule Match (Crowd-Medium): Report refers to slow-downs or queue bottlenecks (${crowdMediumKeywords.filter(kw => text.includes(kw)).map(kw => `'${kw}'`).join(', ')}). Response focused on restoring entry throughput.`
      }
    };
  }

  // 7. LOST-PERSON - MEDIUM
  const lostPersonMediumKeywords = ['lost child', 'crying child', 'lost boy', 'lost girl', 'missing child', 'separated child', 'lost son', 'lost daughter'];
  if (lostPersonMediumKeywords.some(kw => text.includes(kw))) {
    return {
      matches: true,
      classification: {
        category: 'lost-person',
        severity: 'medium',
        action: 'Alert Lost Child Center & Broadcast Volunteer Network',
        explanation: `Rule Match (Lost-Person-Medium): Report contains child separation indicators (${lostPersonMediumKeywords.filter(kw => text.includes(kw)).map(kw => `'${kw}'`).join(', ')}). Standard child location protocols activated.`
      }
    };
  }

  // 8. LOST-PERSON - LOW
  const lostPersonLowKeywords = ['lost phone', 'lost wallet', 'lost keys', 'lost bag', 'lost passport', 'lost backpack', 'lost item', 'found wallet', 'found keys'];
  if (lostPersonLowKeywords.some(kw => text.includes(kw))) {
    return {
      matches: true,
      classification: {
        category: 'lost-person',
        severity: 'low',
        action: 'Direct to Nearest Lost & Found Office',
        explanation: `Rule Match (Lost-Person-Low): Report refers to lost personal items (${lostPersonLowKeywords.filter(kw => text.includes(kw)).map(kw => `'${kw}'`).join(', ')}). Low severity logistics recommendation.`
      }
    };
  }

  // 9. FACILITIES - HIGH/MEDIUM
  const facilitiesMediumKeywords = ['power outage', 'dark section', 'elevator stuck', 'escalator broken', 'barrier broken', 'leak spraying', 'flooding'];
  if (facilitiesMediumKeywords.some(kw => text.includes(kw))) {
    return {
      matches: true,
      classification: {
        category: 'facilities',
        severity: 'medium',
        action: 'Dispatch Facilities Technician immediately',
        explanation: `Rule Match (Facilities-Medium): Report contains infrastructure issues affecting operations (${facilitiesMediumKeywords.filter(kw => text.includes(kw)).map(kw => `'${kw}'`).join(', ')}).`
      }
    };
  }

  // 10. FACILITIES - LOW
  const facilitiesLowKeywords = ['leak', 'water leak', 'broken seat', 'no water', 'restroom dirty', 'toilet clogged', 'trash full', 'garbage overflow'];
  if (facilitiesLowKeywords.some(kw => text.includes(kw))) {
    return {
      matches: true,
      classification: {
        category: 'facilities',
        severity: 'low',
        action: 'Log Facilities Maintenance Request',
        explanation: `Rule Match (Facilities-Low): Report contains standard maintenance or cleaning terms (${facilitiesLowKeywords.filter(kw => text.includes(kw)).map(kw => `'${kw}'`).join(', ')}).`
      }
    };
  }

  // No rules match, require LLM fallback
  return {
    matches: false
  };
}

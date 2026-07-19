import { formatRuleClassification, matchesAnyKeyword, getMatchedKeywordsString } from './utils.js';

/**
 * Pure function to classify incidents using rule-based keyword matching.
 * Returns classification details if a rule matches, or matches: false if LLM fallback is needed.
 * 
 * @param {string} rawText - Free-text incident report string
 * @returns {{ matches: boolean, classification?: import('./utils.js').ClassificationResult }}
 */
export function classifyIncidentRules(rawText) {
  if (typeof rawText !== 'string' || !rawText.trim()) {
    return { matches: false };
  }

  const text = rawText.toLowerCase();

  return (
    evaluateMedicalRules(text) ||
    evaluateSecurityRules(text) ||
    evaluateCrowdRules(text) ||
    evaluateLostPersonRules(text) ||
    evaluateFacilitiesRules(text) ||
    { matches: false }
  );
}

/**
 * Evaluates medical critical and high/medium category rules.
 * @param {string} text 
 * @returns {{ matches: boolean, classification?: import('./utils.js').ClassificationResult } | null}
 */
function evaluateMedicalRules(text) {
  const criticalKws = ['collapsed', 'unconscious', 'heart attack', 'cardiac', 'chest pain', 'seizure', 'stroke', 'unresponsive', 'bleeding heavily', 'no breathing'];
  if (matchesAnyKeyword(text, criticalKws)) {
    const matched = getMatchedKeywordsString(text, criticalKws);
    return formatRuleClassification(
      'medical',
      'critical',
      'Dispatch Medical First Responders & Notify Command Center',
      `Rule Match (Medical-Critical): Report contains urgent medical indicator terms (${matched}). Immediate response protocol triggered.`
    );
  }

  const mediumKws = ['fainted', 'injury', 'asthma', 'breathing difficulty', 'broken bone', 'fracture', 'bleeding', 'burn', 'vomiting', 'heat stroke'];
  if (matchesAnyKeyword(text, mediumKws)) {
    const matched = getMatchedKeywordsString(text, mediumKws);
    return formatRuleClassification(
      'medical',
      'high',
      'Alert Nearest Medical Station & Dispatch Volunteer Guide',
      `Rule Match (Medical-High): Report contains standard medical or injury terms (${matched}). Standard medical dispatch initiated.`
    );
  }

  return null;
}

/**
 * Evaluates security critical and high category rules.
 * @param {string} text 
 * @returns {{ matches: boolean, classification?: import('./utils.js').ClassificationResult } | null}
 */
function evaluateSecurityRules(text) {
  const criticalKws = ['weapon', 'bomb', 'gun', 'knife', 'threat', 'explosion', 'terrorist', 'shooter', 'active threat'];
  if (matchesAnyKeyword(text, criticalKws)) {
    const matched = getMatchedKeywordsString(text, criticalKws);
    return formatRuleClassification(
      'security',
      'critical',
      'Initiate Emergency Evacuation & Dispatch Security/Law Enforcement',
      `Rule Match (Security-Critical): Report contains high-threat weapons or active terror terms (${matched}). Immediate security escalation triggered.`
    );
  }

  const highKws = ['fight', 'brawl', 'punch', 'stolen', 'theft', 'pickpocket', 'flare', 'smoke bomb', 'assault', 'robbery', 'hooligan', 'violence'];
  if (matchesAnyKeyword(text, highKws)) {
    const matched = getMatchedKeywordsString(text, highKws);
    return formatRuleClassification(
      'security',
      'high',
      'Dispatch Security Team & Alert Local Police',
      `Rule Match (Security-High): Report contains security breach or physical altercation terms (${matched}). Dispatching venue security.`
    );
  }

  return null;
}

/**
 * Evaluates crowd management high and medium category rules.
 * @param {string} text 
 * @returns {{ matches: boolean, classification?: import('./utils.js').ClassificationResult } | null}
 */
function evaluateCrowdRules(text) {
  const highKws = ['crowd crush', 'overcrowding', 'gate blocked', 'stampede', 'crowded', 'crush', 'bottleneck', 'gate overflow'];
  if (matchesAnyKeyword(text, highKws)) {
    const matched = getMatchedKeywordsString(text, highKws);
    return formatRuleClassification(
      'crowd',
      'high',
      'Implement Crowd Diverting Protocols & Dispatch Gate Stewards',
      `Rule Match (Crowd-High): Report indicates active congestion or flow blockage (${matched}). High severity crowd management actions active.`
    );
  }

  const mediumKws = ['long queue', 'slow entry', 'ticket scanner broken', 'scanner down', 'gate slow', 'turnstile stuck'];
  if (matchesAnyKeyword(text, mediumKws)) {
    const matched = getMatchedKeywordsString(text, mediumKws);
    return formatRuleClassification(
      'crowd',
      'medium',
      'Dispatch Additional Gate Support & Open Overflow Lanes',
      `Rule Match (Crowd-Medium): Report refers to slow-downs or queue bottlenecks (${matched}). Response focused on restoring entry throughput.`
    );
  }

  return null;
}

/**
 * Evaluates lost person and lost item category rules.
 * @param {string} text 
 * @returns {{ matches: boolean, classification?: import('./utils.js').ClassificationResult } | null}
 */
function evaluateLostPersonRules(text) {
  const mediumKws = ['lost child', 'crying child', 'lost boy', 'lost girl', 'missing child', 'separated child', 'lost son', 'lost daughter'];
  if (matchesAnyKeyword(text, mediumKws)) {
    const matched = getMatchedKeywordsString(text, mediumKws);
    return formatRuleClassification(
      'lost-person',
      'medium',
      'Alert Lost Child Center & Broadcast Volunteer Network',
      `Rule Match (Lost-Person-Medium): Report contains child separation indicators (${matched}). Standard child location protocols activated.`
    );
  }

  const lowKws = ['lost phone', 'lost wallet', 'lost keys', 'lost bag', 'lost passport', 'lost backpack', 'lost item', 'found wallet', 'found keys'];
  if (matchesAnyKeyword(text, lowKws)) {
    const matched = getMatchedKeywordsString(text, lowKws);
    return formatRuleClassification(
      'lost-person',
      'low',
      'Direct to Nearest Lost & Found Office',
      `Rule Match (Lost-Person-Low): Report refers to lost personal items (${matched}). Low severity logistics recommendation.`
    );
  }

  return null;
}

/**
 * Evaluates facilities maintenance category rules.
 * @param {string} text 
 * @returns {{ matches: boolean, classification?: import('./utils.js').ClassificationResult } | null}
 */
function evaluateFacilitiesRules(text) {
  const mediumKws = ['power outage', 'dark section', 'elevator stuck', 'escalator broken', 'barrier broken', 'leak spraying', 'flooding'];
  if (matchesAnyKeyword(text, mediumKws)) {
    const matched = getMatchedKeywordsString(text, mediumKws);
    return formatRuleClassification(
      'facilities',
      'medium',
      'Dispatch Facilities Technician immediately',
      `Rule Match (Facilities-Medium): Report contains infrastructure issues affecting operations (${matched}).`
    );
  }

  const lowKws = ['leak', 'water leak', 'broken seat', 'no water', 'restroom dirty', 'toilet clogged', 'trash full', 'garbage overflow'];
  if (matchesAnyKeyword(text, lowKws)) {
    const matched = getMatchedKeywordsString(text, lowKws);
    return formatRuleClassification(
      'facilities',
      'low',
      'Log Facilities Maintenance Request',
      `Rule Match (Facilities-Low): Report contains standard maintenance or cleaning terms (${matched}).`
    );
  }

  return null;
}

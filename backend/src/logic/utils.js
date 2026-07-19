/**
 * Shared Type Definitions and Helper Utilities for StadiumOps Copilot.
 * @module logic/utils
 */

/**
 * @typedef {'medical' | 'security' | 'crowd' | 'lost-person' | 'facilities' | 'other'} IncidentCategory
 */

/**
 * @typedef {'low' | 'medium' | 'high' | 'critical'} SeverityLevel
 */

/**
 * @typedef {'critical' | 'warning' | 'info' | 'normal'} AdvisoryStatus
 */

/**
 * @typedef {'rising' | 'falling' | 'stable' | 'manual update'} FlowTrend
 */

/**
 * @typedef {Object} ClassificationResult
 * @property {IncidentCategory} category - Incident category classification
 * @property {SeverityLevel} severity - Urgency severity level
 * @property {string} action - Recommended operational action
 * @property {string} explanation - Transparent reasoning explanation
 */

/**
 * @typedef {Object} GateData
 * @property {string} id - Unique gate identifier
 * @property {string} name - Human-readable gate name
 * @property {number} occupancy - Current occupancy percentage (0-100)
 * @property {number} capacity - Design seating/entry capacity
 * @property {FlowTrend} trend - Ingress/egress flow direction
 */

/**
 * @typedef {GateData & { status: AdvisoryStatus, action: string, explanation: string }} GateAdvisory
 */

/**
 * @typedef {Object} ShiftSuggestion
 * @property {string} location - Assigned operational zone
 * @property {number} allocationPercentage - Percentage of volunteer force assigned
 * @property {string} task - Primary assigned volunteer duty
 * @property {string} reasoning - Tactical rationale for force positioning
 */

/**
 * @typedef {Object} SustainabilityAdvisory
 * @property {'normal' | 'warning' | 'high-surge'} level - Waste accumulation alert level
 * @property {string} wasteBinFocus - Priority concourse waste zone
 * @property {number} recyclingRatio - Target recycling compaction ratio
 * @property {string} recommendation - Tactical recycling steward instruction
 * @property {string} reasoning - Waste management rationale
 */

/**
 * @typedef {Object} TransportationAdvisory
 * @property {'standby' | 'active' | 'peak-frequency'} shuttleStatus - Transit fleet operational status
 * @property {string} primaryHub - Key transit terminal/loop
 * @property {string} transitAction - Egress/ingress shuttle dispatch action
 * @property {string} reasoning - Transportation flow rationale
 */

/**
 * Formats a successful rule classification result object.
 * 
 * @param {IncidentCategory} category 
 * @param {SeverityLevel} severity 
 * @param {string} action 
 * @param {string} explanation 
 * @returns {{ matches: true, classification: ClassificationResult }}
 */
export function formatRuleClassification(category, severity, action, explanation) {
  return {
    matches: true,
    classification: {
      category,
      severity,
      action,
      explanation
    }
  };
}

/**
 * Checks whether any keyword in a given list is present in the input text.
 * 
 * @param {string} text - Lowercase input text to evaluate
 * @param {string[]} keywords - List of target keywords
 * @returns {boolean} True if text contains at least one keyword
 */
export function matchesAnyKeyword(text, keywords) {
  if (typeof text !== 'string' || !Array.isArray(keywords)) {
    return false;
  }
  return keywords.some(kw => text.includes(kw));
}

/**
 * Extracts matched keywords from text for explainability logs.
 * 
 * @param {string} text - Lowercase input text
 * @param {string[]} keywords - List of keywords
 * @returns {string} Formatted quoted keyword list (e.g. "'collapsed', 'unconscious'")
 */
export function getMatchedKeywordsString(text, keywords) {
  if (typeof text !== 'string' || !Array.isArray(keywords)) {
    return '';
  }
  return keywords
    .filter(kw => text.includes(kw))
    .map(kw => `'${kw}'`)
    .join(', ');
}

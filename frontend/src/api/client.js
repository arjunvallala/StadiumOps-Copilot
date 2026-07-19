const API_BASE = '/api';

/**
 * Fetches triaged incident log feed.
 * @returns {Promise<{ success: boolean, count: number, data: Array<object> }>}
 */
export async function fetchIncidents() {
  const res = await fetch(`${API_BASE}/incidents`);
  if (!res.ok) throw new Error('Failed to fetch incidents');
  return res.json();
}

/**
 * Submits a raw incident report for triage.
 * @param {string} text 
 * @returns {Promise<{ success: boolean, data: object }>}
 */
export async function submitIncident(text) {
  const res = await fetch(`${API_BASE}/incident/triage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to triage incident');
  return data;
}

/**
 * Fetches real-time gate occupancy telemetry and advisories.
 * @returns {Promise<{ success: boolean, timestamp: string, data: Array<object> }>}
 */
export async function fetchGates() {
  const res = await fetch(`${API_BASE}/gates`);
  if (!res.ok) throw new Error('Failed to fetch gate advisories');
  return res.json();
}

/**
 * Overrides gate occupancy percentage for testing/simulation.
 * @param {string} id 
 * @param {number} occupancy 
 * @returns {Promise<{ success: boolean, data: Array<object> }>}
 */
export async function updateGateOccupancy(id, occupancy) {
  const res = await fetch(`${API_BASE}/gates/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, occupancy })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update gate metric');
  return data;
}

/**
 * Requests LLM translation into a target fan language.
 * @param {string} text 
 * @param {string} targetLanguage 
 * @returns {Promise<{ success: boolean, originalText: string, targetLanguage: string, translation: string, explanation: string }>}
 */
export async function translateMessage(text, targetLanguage) {
  const res = await fetch(`${API_BASE}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, targetLanguage })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to translate text');
  return data;
}

/**
 * Fetches volunteer shift positioning recommendations based on phase and gate advisories.
 * @param {string} phase 
 * @returns {Promise<{ success: boolean, timestamp: string, data: object }>}
 */
export async function fetchShiftSuggestions(phase) {
  const res = await fetch(`${API_BASE}/shifts?phase=${encodeURIComponent(phase)}`);
  if (!res.ok) throw new Error('Failed to fetch shift suggestions');
  return res.json();
}

/**
 * Fetches sustainability (waste/recycling) and transportation (shuttle/transit) advisories.
 * @param {string} phase 
 * @returns {Promise<{ success: boolean, timestamp: string, data: object }>}
 */
export async function fetchSustainabilityTransit(phase) {
  const res = await fetch(`${API_BASE}/sustainability-transit?phase=${encodeURIComponent(phase)}`);
  if (!res.ok) throw new Error('Failed to fetch sustainability and transit advisories');
  return res.json();
}

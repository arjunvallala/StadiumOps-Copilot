const API_BASE = '/api';

export async function fetchIncidents() {
  const res = await fetch(`${API_BASE}/incidents`);
  if (!res.ok) throw new Error('Failed to fetch incidents');
  return res.json();
}

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

export async function fetchGates() {
  const res = await fetch(`${API_BASE}/gates`);
  if (!res.ok) throw new Error('Failed to fetch gate advisories');
  return res.json();
}

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

export async function fetchShiftSuggestions(phase) {
  const res = await fetch(`${API_BASE}/shifts?phase=${encodeURIComponent(phase)}`);
  if (!res.ok) throw new Error('Failed to fetch shift suggestions');
  return res.json();
}

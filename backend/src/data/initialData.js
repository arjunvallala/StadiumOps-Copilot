export const initialGates = [
  {
    id: 'gate-a',
    name: 'Gate A (North Entrance)',
    occupancy: 65,
    capacity: 10000,
    trend: 'rising'
  },
  {
    id: 'gate-b',
    name: 'Gate B (South Entrance)',
    occupancy: 92,
    capacity: 8000,
    trend: 'rising'
  },
  {
    id: 'gate-c',
    name: 'Gate C (East Entrance)',
    occupancy: 45,
    capacity: 12000,
    trend: 'falling'
  },
  {
    id: 'gate-d',
    name: 'Gate D (West Entrance)',
    occupancy: 78,
    capacity: 9000,
    trend: 'stable'
  },
  {
    id: 'gate-e',
    name: 'Gate E (VIP/Media Entrance)',
    occupancy: 30,
    capacity: 3000,
    trend: 'stable'
  }
];

export const initialIncidents = [
  {
    id: 'inc-1',
    rawText: 'Fan collapsed near Section B, seems to be unconscious but breathing.',
    category: 'medical',
    severity: 'critical',
    action: 'Dispatch Medical First Responders & Notify Command Center',
    explanation: "Rule Match (Medical-Critical): Report contains urgent medical terms ('collapsed', 'unconscious'). Triggered deterministic medical severity categorization.",
    timestamp: '2026-07-19T20:15:00.000Z'
  },
  {
    id: 'inc-2',
    rawText: 'Overcrowding at Gate B, fans are pushing and gate is blocked.',
    category: 'crowd',
    severity: 'high',
    action: 'Implement Crowd Diverting Protocols & Dispatch Gate Stewards',
    explanation: "Rule Match (Crowd-High): Report contains terms indicating gate blockages or overcrowding ('overcrowding', 'gate blocked'). Triggered crowd safety intervention rules.",
    timestamp: '2026-07-19T20:30:00.000Z'
  },
  {
    id: 'inc-3',
    rawText: 'Water leak reported in the restrooms near Sector 4.',
    category: 'facilities',
    severity: 'low',
    action: 'Log Facilities Maintenance Request',
    explanation: "Rule Match (Facilities-Low): Report contains facilities-related maintenance terms ('water leak', 'restroom'). Low urgency rule matched.",
    timestamp: '2026-07-19T21:00:00.000Z'
  }
];

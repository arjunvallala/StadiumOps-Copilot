import { describe, it, expect } from 'vitest';
import { analyzeGateAdvisories } from '../src/logic/gateAdvisory.js';

describe('Gate Advisory Threshold Logic', () => {
  it('should flag critical advisory when occupancy is exactly 90% or above', () => {
    const gates = [
      { id: 'gate-1', name: 'Gate 1', occupancy: 90, capacity: 10000, trend: 'rising' },
      { id: 'gate-2', name: 'Gate 2', occupancy: 95, capacity: 10000, trend: 'stable' }
    ];
    const results = analyzeGateAdvisories(gates);

    expect(results[0].status).toBe('critical');
    expect(results[0].action).toContain('TEMPORARY GATE CLOSURE');
    expect(results[0].explanation).toContain('CRITICAL');

    expect(results[1].status).toBe('critical');
  });

  it('should flag warning advisory when occupancy is exactly 75% up to 89%', () => {
    const gates = [
      { id: 'gate-1', name: 'Gate 1', occupancy: 75, capacity: 10000, trend: 'rising' },
      { id: 'gate-2', name: 'Gate 2', occupancy: 89, capacity: 10000, trend: 'falling' }
    ];
    const results = analyzeGateAdvisories(gates);

    expect(results[0].status).toBe('warning');
    expect(results[0].action).toContain('ADDITIONAL GATE STEWARDS');
    expect(results[0].explanation).toContain('WARNING');

    expect(results[1].status).toBe('warning');
  });

  it('should flag info advisory when occupancy is exactly 60% and trend is rising', () => {
    const gates = [
      { id: 'gate-1', name: 'Gate 1', occupancy: 60, capacity: 10000, trend: 'rising' },
      { id: 'gate-2', name: 'Gate 2', occupancy: 60, capacity: 10000, trend: 'stable' },
      { id: 'gate-3', name: 'Gate 3', occupancy: 60, capacity: 10000, trend: 'falling' }
    ];
    const results = analyzeGateAdvisories(gates);

    expect(results[0].status).toBe('info');
    expect(results[0].action).toContain('MONITOR ACTIVE FLOW');

    expect(results[1].status).toBe('normal');
    expect(results[2].status).toBe('normal');
  });

  it('should return normal status for low occupancy gates below 60%', () => {
    const gates = [
      { id: 'gate-1', name: 'Gate 1', occupancy: 59, capacity: 10000, trend: 'rising' },
      { id: 'gate-2', name: 'Gate 2', occupancy: 0, capacity: 10000, trend: 'stable' }
    ];
    const results = analyzeGateAdvisories(gates);

    expect(results[0].status).toBe('normal');
    expect(results[1].status).toBe('normal');
  });

  it('should handle empty or non-array inputs gracefully', () => {
    expect(analyzeGateAdvisories([])).toEqual([]);
    expect(analyzeGateAdvisories(null)).toEqual([]);
    expect(analyzeGateAdvisories(undefined)).toEqual([]);
  });
});

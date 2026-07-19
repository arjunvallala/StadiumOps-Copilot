import { describe, it, expect } from 'vitest';
import { getShiftSuggestions } from '../src/logic/shiftSuggestions.js';

describe('Shift suggestions and volunteer positioning', () => {
  it('should return pre-match suggestion structure under normal conditions', () => {
    const results = getShiftSuggestions('pre-match', []);
    
    expect(results.phase).toBe('pre-match');
    expect(results.summary).toContain('Inbound flow phase');
    expect(results.suggestions.length).toBe(3);
    
    const infoDesk = results.suggestions.find(s => s.location.includes('Concourse Information'));
    expect(infoDesk.allocationPercentage).toBe(20);
  });

  it('should reallocate staff in pre-match phase if there is a critical gate', () => {
    const gates = [
      { id: 'gate-a', name: 'Gate A', occupancy: 95, status: 'critical' }
    ];
    const results = getShiftSuggestions('pre-match', gates);

    const criticalRealloc = results.suggestions.find(s => s.location.includes('RE-ROUTE'));
    expect(criticalRealloc).toBeDefined();
    expect(criticalRealloc.allocationPercentage).toBe(60);

    const infoDesk = results.suggestions.find(s => s.location.includes('Concourse Information'));
    expect(infoDesk.allocationPercentage).toBe(10); // reduced from 20%
  });

  it('should adjust suggestions in pre-match phase if there is a warning gate', () => {
    const gates = [
      { id: 'gate-a', name: 'Gate A', occupancy: 80, status: 'warning' }
    ];
    const results = getShiftSuggestions('pre-match', gates);

    const warningSupport = results.suggestions.find(s => s.location.includes('SUPPORT HIGH LOAD'));
    expect(warningSupport).toBeDefined();
    expect(warningSupport.allocationPercentage).toBe(55); // increased from 50%
  });

  it('should handle live phase suggestions', () => {
    const results = getShiftSuggestions('live', []);

    expect(results.phase).toBe('live');
    expect(results.summary).toContain('Match active phase');
    expect(results.suggestions.some(s => s.location.includes('Patrol'))).toBe(true);
  });

  it('should handle halftime phase suggestions', () => {
    const results = getShiftSuggestions('halftime', []);

    expect(results.phase).toBe('halftime');
    expect(results.summary).toContain('Halftime rush phase');
    expect(results.suggestions.some(s => s.location.includes('Concessions'))).toBe(true);
  });

  it('should handle post-match phase suggestions and apply egress warning reallocations', () => {
    const normalResults = getShiftSuggestions('post-match', []);
    expect(normalResults.phase).toBe('post-match');
    expect(normalResults.summary).toContain('Outbound flow phase');

    const gates = [
      { id: 'gate-b', name: 'Gate B', occupancy: 82, status: 'warning' }
    ];
    const alertResults = getShiftSuggestions('post-match', gates);
    const criticalEgress = alertResults.suggestions.find(s => s.location.includes('CRITICAL EXIT'));
    expect(criticalEgress).toBeDefined();
    expect(criticalEgress.allocationPercentage).toBe(60); // increased from 50%
  });
});

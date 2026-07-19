import { describe, it, expect } from 'vitest';
import { computeSustainabilityTransitAdvisory } from '../src/logic/sustainabilityTransit.js';

describe('Sustainability & Transportation Advisory Logic', () => {
  it('should return default pre-match advisories under normal conditions', () => {
    const result = computeSustainabilityTransitAdvisory('pre-match', []);
    
    expect(result.phase).toBe('pre-match');
    expect(result.sustainability.level).toBe('normal');
    expect(result.sustainability.wasteBinFocus).toContain('Outer Security Checkpoints');
    expect(result.transportation.shuttleStatus).toBe('active');
    expect(result.transportation.primaryHub).toContain('Park & Ride');
  });

  it('should adjust transportation reasoning when critical gate alerts exist pre-match', () => {
    const mockGates = [
      { id: 'gate-b', name: 'Gate B (South Entrance)', occupancy: 92, status: 'critical' }
    ];
    const result = computeSustainabilityTransitAdvisory('pre-match', mockGates);

    expect(result.transportation.reasoning).toContain('INBOUND BOTTLENECK');
    expect(result.transportation.reasoning).toContain('Gate B (South Entrance)');
  });

  it('should return halftime waste surge advisories', () => {
    const result = computeSustainabilityTransitAdvisory('halftime', []);

    expect(result.phase).toBe('halftime');
    expect(result.sustainability.level).toBe('warning');
    expect(result.sustainability.recyclingRatio).toBe(40);
    expect(result.sustainability.recommendation).toContain('mobile waste sorting');
    expect(result.transportation.shuttleStatus).toBe('standby');
  });

  it('should return high-surge post-match sustainability and peak transit advisories', () => {
    const result = computeSustainabilityTransitAdvisory('post-match', []);

    expect(result.phase).toBe('post-match');
    expect(result.sustainability.level).toBe('high-surge');
    expect(result.sustainability.recyclingRatio).toBe(60);
    expect(result.transportation.shuttleStatus).toBe('peak-frequency');
  });

  it('should handle invalid or uppercase phase inputs gracefully', () => {
    const resultUpper = computeSustainabilityTransitAdvisory('POST-MATCH', []);
    expect(resultUpper.phase).toBe('post-match');

    const resultNull = computeSustainabilityTransitAdvisory(null, null);
    expect(resultNull.phase).toBe('pre-match');
  });
});

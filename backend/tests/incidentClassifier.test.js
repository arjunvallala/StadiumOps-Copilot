import { describe, it, expect } from 'vitest';
import { classifyIncidentRules } from '../src/logic/incidentClassifier.js';

describe('Incident Classification Rules Engine', () => {
  it('should match critical medical incident when fan collapsed', () => {
    const report = 'A spectator collapsed in row 12 of section C, unresponsive';
    const result = classifyIncidentRules(report);
    
    expect(result.matches).toBe(true);
    expect(result.classification.category).toBe('medical');
    expect(result.classification.severity).toBe('critical');
    expect(result.classification.action).toContain('Dispatch Medical First Responders');
    expect(result.classification.explanation).toContain('Rule Match (Medical-Critical)');
  });

  it('should match high security incident when a fight breaks out', () => {
    const report = 'There is a fist fight happening between two fans near the snack bar';
    const result = classifyIncidentRules(report);
    
    expect(result.matches).toBe(true);
    expect(result.classification.category).toBe('security');
    expect(result.classification.severity).toBe('high');
    expect(result.classification.action).toContain('Dispatch Security Team');
    expect(result.classification.explanation).toContain('Rule Match (Security-High)');
  });

  it('should match critical security incident when weapon is mentioned', () => {
    const report = 'Security alert: a suspicious person might have a knife in their bag';
    const result = classifyIncidentRules(report);

    expect(result.matches).toBe(true);
    expect(result.classification.category).toBe('security');
    expect(result.classification.severity).toBe('critical');
    expect(result.classification.action).toContain('Emergency Evacuation');
    expect(result.classification.explanation).toContain('Rule Match (Security-Critical)');
  });

  it('should match high crowd incident when overcrowding occurs', () => {
    const report = 'Severe overcrowding at Gate B, the crowd is starting to press';
    const result = classifyIncidentRules(report);

    expect(result.matches).toBe(true);
    expect(result.classification.category).toBe('crowd');
    expect(result.classification.severity).toBe('high');
    expect(result.classification.action).toContain('Crowd Diverting Protocols');
    expect(result.classification.explanation).toContain('Rule Match (Crowd-High)');
  });

  it('should match lost-person medium incident when lost child is reported', () => {
    const report = 'A lost child is crying here, looking for parents';
    const result = classifyIncidentRules(report);

    expect(result.matches).toBe(true);
    expect(result.classification.category).toBe('lost-person');
    expect(result.classification.severity).toBe('medium');
    expect(result.classification.action).toContain('Lost Child Center');
    expect(result.classification.explanation).toContain('Rule Match (Lost-Person-Medium)');
  });

  it('should match lost-person low incident when phone is lost', () => {
    const report = 'I found a lost phone on seat 43';
    const result = classifyIncidentRules(report);

    expect(result.matches).toBe(true);
    expect(result.classification.category).toBe('lost-person');
    expect(result.classification.severity).toBe('low');
    expect(result.classification.action).toContain('Lost & Found');
    expect(result.classification.explanation).toContain('Rule Match (Lost-Person-Low)');
  });

  it('should match facilities low incident for a broken seat', () => {
    const report = 'Broken seat detected at row B';
    const result = classifyIncidentRules(report);

    expect(result.matches).toBe(true);
    expect(result.classification.category).toBe('facilities');
    expect(result.classification.severity).toBe('low');
    expect(result.classification.action).toContain('Facilities Maintenance');
    expect(result.classification.explanation).toContain('Rule Match (Facilities-Low)');
  });

  it('should return matches: false for ambiguous inputs that require LLM fallback', () => {
    const report = 'The ticket scanner is functioning, but the volunteer is feeling slightly tired.';
    const result = classifyIncidentRules(report);

    expect(result.matches).toBe(false);
    expect(result.classification).toBeUndefined();
  });
});

import express from 'express';
import cors from 'cors';

import { sanitizeText, validateLength } from './logic/sanitization.js';
import { classifyIncidentRules } from './logic/incidentClassifier.js';
import { analyzeGateAdvisories } from './logic/gateAdvisory.js';
import { getShiftSuggestions } from './logic/shiftSuggestions.js';
import { classifyAmbiguousIncident, translateText } from './services/llm.js';

// Static JSON imports - bundled directly into serverless builds
import initialGates from './data/gates.json' assert { type: 'json' };
import initialIncidents from './data/incidents.json' assert { type: 'json' };

const app = express();

// Security and middleware
app.use(cors());
app.use(express.json({ limit: '50kb' })); // Restrict payload size

// Middleware for Netlify serverless routing compatibility
app.use((req, res, next) => {
  if (req.url.startsWith('/.netlify/functions/api')) {
    req.url = req.url.replace('/.netlify/functions/api', '/api');
  }
  next();
});

// Memory stores initialized from bundled JSON
let gatesStore = Array.isArray(initialGates) ? [...initialGates] : [];
let incidentsStore = Array.isArray(initialIncidents) ? [...initialIncidents] : [];

// Helper to apply subtle dynamic fluctuations for telemetry simulation
function getFluctuatedGates() {
  gatesStore = gatesStore.map(gate => {
    const delta = Math.floor(Math.random() * 5) - 2; // -2% to +2% shift
    let newOccupancy = Math.max(15, Math.min(98, gate.occupancy + delta));
    let newTrend = delta > 0 ? 'rising' : delta < 0 ? 'falling' : 'stable';
    return {
      ...gate,
      occupancy: newOccupancy,
      trend: newTrend
    };
  });
  return gatesStore;
}

// ROUTES

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET /api/incidents - Retrieve triaged incidents
app.get('/api/incidents', (req, res) => {
  res.json({ success: true, count: incidentsStore.length, data: incidentsStore });
});

// POST /api/incident/triage - Triage a free-text incident report
app.post('/api/incident/triage', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ success: false, error: 'Report text is required and must be a string.' });
    }

    const sanitized = sanitizeText(text);

    if (!validateLength(sanitized, 500)) {
      return res.status(400).json({ success: false, error: 'Report text must be between 1 and 500 characters long.' });
    }

    // Step 1: Hybrid approach - Check deterministic rules FIRST
    const ruleResult = classifyIncidentRules(sanitized);

    let classification;
    let source = 'rule-engine';

    if (ruleResult.matches) {
      classification = ruleResult.classification;
    } else {
      // Step 2: Fallback to LLM for ambiguous cases
      source = 'llm-fallback';
      classification = await classifyAmbiguousIncident(sanitized);
    }

    const newIncident = {
      id: `inc-${Date.now()}`,
      rawText: sanitized,
      ...classification,
      source,
      timestamp: new Date().toISOString()
    };

    // Prepend to store
    incidentsStore.unshift(newIncident);

    res.status(201).json({
      success: true,
      data: newIncident
    });

  } catch (err) {
    console.error('Error processing triage request:', err);
    res.status(500).json({ success: false, error: 'Internal server error processing triage.' });
  }
});

// GET /api/gates - Get real-time crowd advisory data for all gates
app.get('/api/gates', (req, res) => {
  try {
    const updatedGates = getFluctuatedGates();
    const advisories = analyzeGateAdvisories(updatedGates);
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: advisories
    });
  } catch (err) {
    console.error('Error analyzing gates:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve gate advisories.' });
  }
});

// POST /api/gates/update - Simulate manual gate occupancy override
app.post('/api/gates/update', (req, res) => {
  try {
    const { id, occupancy } = req.body;
    if (!id || typeof occupancy !== 'number') {
      return res.status(400).json({ success: false, error: 'Valid gate id and numeric occupancy percentage required.' });
    }

    const gateIndex = gatesStore.findIndex(g => g.id === id);
    if (gateIndex === -1) {
      return res.status(404).json({ success: false, error: 'Gate not found.' });
    }

    gatesStore[gateIndex].occupancy = Math.max(0, Math.min(100, occupancy));
    gatesStore[gateIndex].trend = 'manual update';

    const updatedAdvisories = analyzeGateAdvisories(gatesStore);
    res.json({ success: true, data: updatedAdvisories });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update gate metric.' });
  }
});

// POST /api/translate - Multilingual Fan Communication Helper
app.post('/api/translate', async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({ success: false, error: 'Text and targetLanguage are required.' });
    }

    const sanitizedText = sanitizeText(text);
    const sanitizedLang = sanitizeText(targetLanguage);

    if (!validateLength(sanitizedText, 250)) {
      return res.status(400).json({ success: false, error: 'Text to translate must be between 1 and 250 characters.' });
    }

    const result = await translateText(sanitizedText, sanitizedLang);
    res.json({
      success: true,
      originalText: sanitizedText,
      targetLanguage: sanitizedLang,
      translation: result.translation,
      explanation: result.explanation
    });

  } catch (err) {
    console.error('Error translating text:', err);
    res.status(500).json({ success: false, error: 'Failed to process translation request.' });
  }
});

// GET /api/shifts - Retrieve volunteer shift positioning suggestions
app.get('/api/shifts', (req, res) => {
  try {
    const phase = req.query.phase || 'pre-match';
    const advisories = analyzeGateAdvisories(gatesStore);
    const suggestions = getShiftSuggestions(phase, advisories);
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: suggestions
    });
  } catch (err) {
    console.error('Error computing shift suggestions:', err);
    res.status(500).json({ success: false, error: 'Failed to generate shift suggestions.' });
  }
});

export default app;

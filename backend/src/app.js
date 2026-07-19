import express from 'express';
import cors from 'cors';

import { sanitizeText, validateLength } from './logic/sanitization.js';
import { classifyIncidentRules } from './logic/incidentClassifier.js';
import { analyzeGateAdvisories } from './logic/gateAdvisory.js';
import { getShiftSuggestions } from './logic/shiftSuggestions.js';
import { computeSustainabilityTransitAdvisory } from './logic/sustainabilityTransit.js';
import { classifyAmbiguousIncident, translateText } from './services/llm.js';
import { initialGates, initialIncidents } from './data/initialData.js';

const app = express();

// Security and middleware
app.use(cors());
app.use(express.json({ limit: '50kb' })); // Restrict payload size

// Memory stores initialized from pure JS module
let gatesStore = [...initialGates];
let incidentsStore = [...initialIncidents];

/**
 * Helper to apply subtle dynamic fluctuations for telemetry simulation
 * @returns {Array<import('./logic/utils.js').GateData>}
 */
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

/**
 * Sends a standardized API error response.
 * @param {import('express').Response} res 
 * @param {number} status 
 * @param {string} error 
 * @param {string} code 
 */
function sendApiError(res, status, error, code) {
  return res.status(status).json({ success: false, error, code });
}

// Router containing all API routes
const router = express.Router();

// GET /health - System health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET /incidents - Retrieve triaged incidents
router.get('/incidents', (req, res) => {
  res.json({ success: true, count: incidentsStore.length, data: incidentsStore });
});

// POST /incident/triage - Triage a free-text incident report
router.post('/incident/triage', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return sendApiError(res, 400, 'Report text is required and must be a string.', 'INVALID_INPUT');
    }

    const sanitized = sanitizeText(text);

    if (!validateLength(sanitized, 500)) {
      return sendApiError(res, 400, 'Report text must be between 1 and 500 characters long.', 'INVALID_INPUT');
    }

    const ruleResult = classifyIncidentRules(sanitized);

    let classification;
    let source = 'rule-engine';

    if (ruleResult.matches) {
      classification = ruleResult.classification;
    } else {
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

    incidentsStore.unshift(newIncident);

    res.status(201).json({
      success: true,
      data: newIncident
    });

  } catch (err) {
    console.error('Error processing triage request:', err);
    sendApiError(res, 500, 'Internal server error processing triage.', 'INTERNAL_ERROR');
  }
});

// GET /gates - Get real-time crowd advisory data for all gates
router.get('/gates', (req, res) => {
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
    sendApiError(res, 500, 'Failed to retrieve gate advisories.', 'INTERNAL_ERROR');
  }
});

// POST /gates/update - Simulate manual gate occupancy override
router.post('/gates/update', (req, res) => {
  try {
    const { id, occupancy } = req.body;
    if (!id || typeof occupancy !== 'number') {
      return sendApiError(res, 400, 'Valid gate id and numeric occupancy percentage required.', 'INVALID_INPUT');
    }

    const gateIndex = gatesStore.findIndex(g => g.id === id);
    if (gateIndex === -1) {
      return sendApiError(res, 404, 'Gate not found.', 'NOT_FOUND');
    }

    gatesStore[gateIndex].occupancy = Math.max(0, Math.min(100, occupancy));
    gatesStore[gateIndex].trend = 'manual update';

    const updatedAdvisories = analyzeGateAdvisories(gatesStore);
    res.json({ success: true, data: updatedAdvisories });
  } catch (err) {
    sendApiError(res, 500, 'Failed to update gate metric.', 'INTERNAL_ERROR');
  }
});

// POST /translate - Multilingual Fan Communication Helper
router.post('/translate', async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
      return sendApiError(res, 400, 'Text and targetLanguage are required.', 'INVALID_INPUT');
    }

    const sanitizedText = sanitizeText(text);
    const sanitizedLang = sanitizeText(targetLanguage);

    if (!validateLength(sanitizedText, 250)) {
      return sendApiError(res, 400, 'Text to translate must be between 1 and 250 characters.', 'INVALID_INPUT');
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
    sendApiError(res, 500, 'Failed to process translation request.', 'INTERNAL_ERROR');
  }
});

// GET /shifts - Retrieve volunteer shift positioning suggestions
router.get('/shifts', (req, res) => {
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
    sendApiError(res, 500, 'Failed to generate shift suggestions.', 'INTERNAL_ERROR');
  }
});

// GET /sustainability-transit - Retrieve sustainability & transportation advisories
router.get('/sustainability-transit', (req, res) => {
  try {
    const phase = req.query.phase || 'pre-match';
    const advisories = analyzeGateAdvisories(gatesStore);
    const result = computeSustainabilityTransitAdvisory(phase, advisories);
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: result
    });
  } catch (err) {
    console.error('Error computing sustainability & transit advisories:', err);
    sendApiError(res, 500, 'Failed to generate sustainability & transit advisories.', 'INTERNAL_ERROR');
  }
});

// Mount router on all potential Netlify and local path prefixes
app.use('/api', router);
app.use('/.netlify/functions/api', router);
app.use('/', router);

export default app;

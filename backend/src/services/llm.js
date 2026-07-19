import dotenv from 'dotenv';
dotenv.config();

// Simple in-memory response cache to prevent unnecessary duplicate API calls
const llmCache = new Map();

// In-memory rate limiting simple counter (max requests per minute window)
let requestCount = 0;
let lastReset = Date.now();
const RATE_LIMIT_MAX = 30; // Max 30 LLM requests per minute
const RATE_LIMIT_WINDOW_MS = 60000;

/**
 * Enforces in-memory rate limiting window for AI calls.
 * @throws {Error} If request count exceeds RATE_LIMIT_MAX
 */
function checkRateLimit() {
  const now = Date.now();
  if (now - lastReset > RATE_LIMIT_WINDOW_MS) {
    requestCount = 0;
    lastReset = now;
  }
  if (requestCount >= RATE_LIMIT_MAX) {
    throw new Error('Rate limit exceeded for AI operations. Please try again in a minute.');
  }
  requestCount++;
}

// Model identifier
const GEMINI_MODEL = 'gemini-3.5-flash';

/**
 * Retrieves the Gemini API key from environment configuration.
 * @returns {string | undefined}
 */
function getApiKey() {
  return process.env.GEMINI_API_KEY;
}

/**
 * Executes an HTTP fetch request against the Gemini API.
 * 
 * @param {string} prompt - Prompt string
 * @returns {Promise<string>} Raw text output from candidate response
 */
async function executeGeminiRequest(prompt) {
  const apiKey = getApiKey();
  checkRateLimit();

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error status ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

/**
 * Parses JSON response from LLM output string safely.
 * 
 * @param {string} rawContent 
 * @returns {import('../logic/utils.js').ClassificationResult}
 */
function parseLlmJsonResponse(rawContent) {
  const jsonString = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(jsonString);

  return {
    category: parsed.category || 'other',
    severity: parsed.severity || 'medium',
    action: parsed.action || 'Contact supervisor for evaluation',
    explanation: `LLM Reasoning: ${parsed.explanation || 'Analyzed via Gemini model reasoning.'}`
  };
}

/**
 * Uses Gemini API to classify ambiguous incident reports.
 * 
 * @param {string} text - Sanitized incident text string
 * @returns {Promise<import('../logic/utils.js').ClassificationResult>}
 */
export async function classifyAmbiguousIncident(text) {
  const cacheKey = `classify:${text.trim().toLowerCase()}`;
  if (llmCache.has(cacheKey)) {
    const cached = llmCache.get(cacheKey);
    return {
      ...cached,
      explanation: `${cached.explanation} (Served from session cache)`
    };
  }

  const apiKey = getApiKey();
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    return {
      category: 'other',
      severity: 'medium',
      action: 'Forward report to Stadium Command Center for manual review',
      explanation: 'LLM Fallback (No Gemini API Key set): Deterministic rules did not trigger and LLM key is unconfigured. Defaulted to manual triage.'
    };
  }

  try {
    const prompt = `You are an AI Incident Classifier for Stadium Operations at the FIFA World Cup 2026.
Classify the following ambiguous stadium incident report.

Report: "${text}"

Respond STRICTLY in JSON format with NO markdown wrapping, matching this schema:
{
  "category": "medical" | "security" | "crowd" | "lost-person" | "facilities" | "other",
  "severity": "low" | "medium" | "high" | "critical",
  "action": "Clear, concise recommended action step for stadium staff",
  "explanation": "Brief reasoning explaining why this category and severity were selected based on the incident text"
}`;

    const rawContent = await executeGeminiRequest(prompt);
    const result = parseLlmJsonResponse(rawContent);

    llmCache.set(cacheKey, result);
    return result;

  } catch (error) {
    console.error('LLM classification error:', error.message);
    return {
      category: 'other',
      severity: 'medium',
      action: 'Notify Sector Supervisor for manual inspection',
      explanation: `LLM Fallback: Classification API encountered an issue (${error.message}). Defaulted to manual inspection.`
    };
  }
}

/**
 * Translates staff messages into a target fan language.
 * 
 * @param {string} text - English text to translate
 * @param {string} targetLanguage - Desired output language
 * @returns {Promise<{ translation: string, explanation: string }>}
 */
export async function translateText(text, targetLanguage) {
  const cacheKey = `translate:${targetLanguage.toLowerCase()}:${text.trim().toLowerCase()}`;
  if (llmCache.has(cacheKey)) {
    const cached = llmCache.get(cacheKey);
    return {
      ...cached,
      explanation: `${cached.explanation} (Served from session cache)`
    };
  }

  const apiKey = getApiKey();
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    return {
      translation: `[Translation key not configured] ${text}`,
      explanation: 'Translation fallback: GEMINI_API_KEY missing in environment variables.'
    };
  }

  try {
    const prompt = `You are a professional multilingual stadium assistant for the FIFA World Cup 2026.
Translate the following message accurately into ${targetLanguage}. Maintain a polite, clear, and calm tone suitable for crowd assistance. Return ONLY the translated string with no explanations or quotes.

Message: "${text}"`;

    const rawOutput = await executeGeminiRequest(prompt);
    const translation = rawOutput.trim() || text;

    const result = {
      translation,
      explanation: `Translated to ${targetLanguage} using Gemini AI (${GEMINI_MODEL}).`
    };

    llmCache.set(cacheKey, result);
    return result;

  } catch (error) {
    console.error('LLM translation error:', error.message);
    return {
      translation: `[Translation service unavailable] ${text}`,
      explanation: `Translation service error: ${error.message}`
    };
  }
}

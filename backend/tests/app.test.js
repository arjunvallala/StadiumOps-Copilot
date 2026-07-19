import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import app from '../src/app.js';

let server;
let baseUrl;

beforeAll(() => {
  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

afterAll(() => {
  return new Promise((resolve) => {
    server.close(resolve);
  });
});

describe('Express API Integration Tests', () => {
  it('GET /api/health should return ok status', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('ok');
  });

  it('GET /api/incidents should return pre-loaded sample incidents', async () => {
    const res = await fetch(`${baseUrl}/api/incidents`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
  });

  it('POST /api/incident/triage should triage medical incident correctly', async () => {
    const res = await fetch(`${baseUrl}/api/incident/triage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'A fan collapsed near entrance gate' })
    });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.category).toBe('medical');
    expect(json.data.severity).toBe('critical');
    expect(json.data.source).toBe('rule-engine');
  });

  it('POST /api/incident/triage should reject invalid/empty inputs with 400', async () => {
    const res = await fetch(`${baseUrl}/api/incident/triage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '' })
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it('GET /api/gates should return analyzed gate advisories', async () => {
    const res = await fetch(`${baseUrl}/api/gates`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data[0]).toHaveProperty('status');
    expect(json.data[0]).toHaveProperty('explanation');
  });

  it('POST /api/translate should validate targetLanguage presence', async () => {
    const res = await fetch(`${baseUrl}/api/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Hello' })
    });
    expect(res.status).toBe(400);
  });

  it('GET /api/shifts should return shift positioning suggestions', async () => {
    const res = await fetch(`${baseUrl}/api/shifts?phase=halftime`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.phase).toBe('halftime');
    expect(Array.isArray(json.data.suggestions)).toBe(true);
  });
});

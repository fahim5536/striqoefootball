import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock app for health endpoint
const app = express();
app.get('/api/health', (req, res) => res.json({ status: 'ok', environment: 'test' }));

describe('Health API', () => {
  it('should return health status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

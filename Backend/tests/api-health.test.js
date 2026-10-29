import test from 'node:test';
import assert from 'node:assert/strict';

const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000';

test('API health and error contract', async () => {
  const health = await fetch(`${baseUrl}/api/health`);
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { status: 'ok', service: 'drishya-api' });

  const missing = await fetch(`${baseUrl}/api/does-not-exist`);
  assert.equal(missing.status, 404);
  assert.equal((await missing.json()).message, 'Route not found');
});

test('protected booking endpoint rejects missing credentials', async () => {
  const response = await fetch(`${baseUrl}/api/bookings/mine`);
  assert.equal(response.status, 401);
  assert.equal((await response.json()).message, 'Authentication required');
});

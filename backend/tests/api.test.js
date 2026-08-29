// tests/api.test.js
// Full API test suite (requires server running + valid .env)

const http = require('http');
const https = require('https');

const BASE_URL = process.env.API_URL || 'http://localhost:5000';
let adminToken = null;
let testTokenId = null;

let passed = 0;
let failed = 0;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const lib = url.protocol === 'https:' ? https : http;
    const bodyStr = body ? JSON.stringify(body) : null;

    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (bodyStr) headers['Content-Length'] = Buffer.byteLength(bodyStr);

    const req = lib.request({
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers,
    }, (res) => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err) {
    console.log(`  ❌ ${name}: ${err.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

async function runTests() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  SSEC Token Management API — Test Suite`);
  console.log(`  API: ${BASE_URL}`);
  console.log(`${'='.repeat(60)}\n`);

  // ── Health Check ──────────────────────────────────────
  console.log('  [Health]');
  await test('Server health check', async () => {
    const r = await request('GET', '/health');
    assert(r.status === 200, `Expected 200, got ${r.status}`);
    assert(r.body.status === 'ok', 'Expected status "ok"');
  });

  // ── Student Registration ──────────────────────────────
  console.log('\n  [Registration]');

  const testStudent = {
    studentName: 'API Test Student',
    studentType: 'Hostel',
    section: 'A',
    parentNumber: '9876543210',
    studentMobile: '9123456789',
  };

  await test('1. Normal registration succeeds', async () => {
    const r = await request('POST', '/api/student/register', testStudent);
    assert(r.status === 201, `Expected 201, got ${r.status}: ${JSON.stringify(r.body)}`);
    assert(r.body.success, 'Expected success=true');
    assert(r.body.tokenId, 'Expected tokenId in response');
    assert(r.body.tokenId.startsWith('SSEC-'), `Token format wrong: ${r.body.tokenId}`);
    testTokenId = r.body.tokenId;
    console.log(`     → Generated: ${testTokenId}`);
  });

  await test('3. Missing required fields return 400', async () => {
    const r = await request('POST', '/api/student/register', { studentName: 'Test' });
    assert(r.status === 400, `Expected 400, got ${r.status}`);
  });

  await test('4. Invalid mobile number rejected', async () => {
    const r = await request('POST', '/api/student/register', {
      ...testStudent,
      studentMobile: '123',
    });
    assert(r.status === 400, `Expected 400, got ${r.status}`);
  });

  // ── Token Retrieval ───────────────────────────────────
  console.log('\n  [Token Retrieval]');

  await test('5. Get token by ID', async () => {
    if (!testTokenId) throw new Error('No testTokenId from registration');
    const r = await request('GET', `/api/token/${testTokenId}`);
    assert(r.status === 200, `Expected 200, got ${r.status}`);
    assert(r.body.token.tokenId === testTokenId, 'Token ID mismatch');
  });

  await test('6. Get non-existent token returns 404', async () => {
    const r = await request('GET', '/api/token/SSEC-2026-99999');
    assert(r.status === 404, `Expected 404, got ${r.status}`);
  });

  await test('7. PDF download returns binary', async () => {
    if (!testTokenId) throw new Error('No testTokenId');
    const url = new URL(BASE_URL + `/api/token/${testTokenId}/pdf`);
    const lib = url.protocol === 'https:' ? https : http;
    await new Promise((resolve, reject) => {
      const req = lib.request({ hostname: url.hostname, port: url.port || 80, path: url.pathname, method: 'GET' }, (res) => {
        assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        assert(res.headers['content-type'] === 'application/pdf', `Expected PDF content type, got ${res.headers['content-type']}`);
        res.resume();
        resolve();
      });
      req.on('error', reject);
      req.end();
    });
  });

  // ── QR Verification ───────────────────────────────────
  console.log('\n  [QR Verification]');

  await test('8. Verify valid token', async () => {
    if (!testTokenId) throw new Error('No testTokenId');
    const r = await request('GET', `/api/verify/${testTokenId}`);
    assert(r.status === 200, `Expected 200, got ${r.status}`);
    assert(r.body.valid === true, 'Expected valid=true');
  });

  await test('9. Verify non-existent token returns invalid', async () => {
    const r = await request('GET', '/api/verify/SSEC-2026-99999');
    assert(r.status === 200, `Expected 200 with valid=false`);
    assert(r.body.valid === false, 'Expected valid=false');
  });

  // ── Admin Auth ────────────────────────────────────────
  console.log('\n  [Admin Authentication]');

  await test('10. Admin login with wrong password fails', async () => {
    const r = await request('POST', '/api/admin/login', { username: 'admin', password: 'wrongpassword' });
    assert(r.status === 401, `Expected 401, got ${r.status}`);
  });

  await test('11. Admin login succeeds', async () => {
    const password = process.env.ADMIN_PASSWORD || 'changeme123';
    const r = await request('POST', '/api/admin/login', { username: 'admin', password });
    assert(r.status === 200, `Expected 200, got ${r.status}: ${JSON.stringify(r.body)}`);
    assert(r.body.token, 'Expected JWT token in response');
    adminToken = r.body.token;
  });

  await test('12. Unauthorized access to admin route fails', async () => {
    const r = await request('GET', '/api/admin/students');
    assert(r.status === 401, `Expected 401, got ${r.status}`);
  });

  // ── Admin Operations ──────────────────────────────────
  console.log('\n  [Admin Operations]');

  await test('13. Dashboard loads', async () => {
    if (!adminToken) throw new Error('No admin token');
    const r = await request('GET', '/api/admin/dashboard', null, adminToken);
    assert(r.status === 200, `Expected 200, got ${r.status}`);
    assert(typeof r.body.stats.total === 'number', 'Expected numeric total');
  });

  await test('14. List students', async () => {
    if (!adminToken) throw new Error('No admin token');
    const r = await request('GET', '/api/admin/students', null, adminToken);
    assert(r.status === 200, `Expected 200, got ${r.status}`);
    assert(Array.isArray(r.body.tokens), 'Expected tokens array');
  });

  await test('15. Cancel token', async () => {
    if (!adminToken || !testTokenId) throw new Error('Missing token/admin');
    const r = await request('PATCH', `/api/admin/token/${testTokenId}/status`, { status: 'CANCELLED' }, adminToken);
    assert(r.status === 200, `Expected 200, got ${r.status}: ${JSON.stringify(r.body)}`);
    assert(r.body.token.status === 'CANCELLED', 'Expected CANCELLED status');
  });

  await test('16. Cancelled token verification shows cancelled', async () => {
    if (!testTokenId) throw new Error('No testTokenId');
    const r = await request('GET', `/api/verify/${testTokenId}`);
    assert(r.body.cancelled === true, 'Expected cancelled=true');
    assert(r.body.valid === false, 'Expected valid=false for cancelled token');
  });

  await test('17. Audit logs contain entries', async () => {
    if (!adminToken) throw new Error('No admin token');
    const r = await request('GET', '/api/admin/audit-logs', null, adminToken);
    assert(r.status === 200, `Expected 200, got ${r.status}`);
    assert(Array.isArray(r.body.logs), 'Expected logs array');
  });

  // ── Summary ───────────────────────────────────────────
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
  console.log(`${'='.repeat(60)}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});

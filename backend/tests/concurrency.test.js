// tests/concurrency.test.js
// Tests simultaneous registrations to verify token uniqueness

const http = require('http');
const https = require('https');

const BASE_URL = process.env.API_URL || 'http://localhost:5000';
const COUNT = parseInt(process.argv[2] || process.env.COUNT || '10', 10);

const DEPARTMENTS = [
  'Computer Science Engineering',
  'Electronics and Communication Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Information Technology',
];

function generateStudent(i) {
  return {
    studentName: `Test Student ${String(i).padStart(4, '0')}`,
    registerNumber: `CONCTEST${String(i).padStart(6, '0')}`,
    department: DEPARTMENTS[i % DEPARTMENTS.length],
    parentNumber: `9${String(Math.floor(Math.random() * 900000000) + 100000000)}`,
    studentWhatsApp: `8${String(Math.floor(Math.random() * 900000000) + 100000000)}`,
  };
}

function postJSON(url, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const urlObj = new URL(url);
    const lib = urlObj.protocol === 'https:' ? https : http;

    const req = lib.request({
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(raw) });
        } catch {
          resolve({ status: res.statusCode, body: raw });
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function runConcurrencyTest() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  SSEC Token Concurrency Test — ${COUNT} simultaneous requests`);
  console.log(`${'='.repeat(60)}\n`);
  console.log(`  API: ${BASE_URL}`);
  console.log(`  Count: ${COUNT}\n`);

  const students = Array.from({ length: COUNT }, (_, i) => generateStudent(i));
  const startTime = Date.now();

  // Fire ALL requests simultaneously
  const promises = students.map(s => postJSON(`${BASE_URL}/api/student/register`, s));
  const results = await Promise.allSettled(promises);

  const elapsed = Date.now() - startTime;
  console.log(`  All ${COUNT} requests completed in ${elapsed}ms\n`);

  // Analyze results
  const successful = [];
  const failed = [];
  const errors = [];

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r.status === 'fulfilled') {
      if (r.value.status === 201 && r.value.body.success) {
        successful.push({ student: students[i].registerNumber, tokenId: r.value.body.tokenId });
      } else {
        failed.push({ student: students[i].registerNumber, status: r.value.status, message: r.value.body.message });
      }
    } else {
      errors.push({ student: students[i].registerNumber, error: r.reason?.message });
    }
  }

  // Check uniqueness
  const tokenIds = successful.map(s => s.tokenId);
  const uniqueTokenIds = new Set(tokenIds);
  const hasDuplicates = uniqueTokenIds.size !== tokenIds.length;

  console.log(`${'─'.repeat(60)}`);
  console.log(`  Results:`);
  console.log(`    ✅ Successful registrations: ${successful.length}`);
  console.log(`    ❌ Failed registrations:    ${failed.length}`);
  console.log(`    💥 Network errors:          ${errors.length}`);
  console.log(`${'─'.repeat(60)}`);
  console.log(`  Token Uniqueness:`);
  console.log(`    Total tokens generated: ${tokenIds.length}`);
  console.log(`    Unique token IDs:       ${uniqueTokenIds.size}`);

  if (hasDuplicates) {
    console.log(`    ❌ FAIL: DUPLICATE TOKENS DETECTED!`);
    const seen = new Set();
    for (const id of tokenIds) {
      if (seen.has(id)) console.log(`       Duplicate: ${id}`);
      seen.add(id);
    }
  } else {
    console.log(`    ✅ PASS: All tokens are unique`);
  }

  console.log(`${'─'.repeat(60)}`);

  if (successful.length > 0) {
    console.log(`\n  Sample tokens generated:`);
    successful.slice(0, 5).forEach(s => {
      console.log(`    ${s.student} → ${s.tokenId}`);
    });
    if (successful.length > 5) console.log(`    ... and ${successful.length - 5} more`);
  }

  if (failed.length > 0) {
    console.log(`\n  Failed registrations:`);
    failed.slice(0, 5).forEach(f => {
      console.log(`    ${f.student}: ${f.message}`);
    });
  }

  console.log(`\n${'='.repeat(60)}\n`);

  // Exit with error code if duplicates found
  process.exit(hasDuplicates ? 1 : 0);
}

runConcurrencyTest().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});

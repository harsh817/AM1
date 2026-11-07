import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
const policy = config.headers.find(({ source }) => source === '/(.*)').headers
  .find(({ key }) => key === 'Content-Security-Policy').value;
const directives = Object.fromEntries(policy.split(';').map((part) => {
  const [name, ...sources] = part.trim().split(/\s+/);
  return [name, sources];
}));

test('shared policy permits the existing Meta managed production gateway and fallback', () => {
  for (const origin of [
    'https://d3-36c34dc0877246a0b32c4f4e24be6ce8.ecs.us-east-1.on.aws',
    'https://demo-1.conversionsapigateway.com',
  ]) assert.ok(directives['connect-src'].includes(origin), origin);
  assert.ok(!directives['connect-src'].includes('*'));
  assert.ok(!directives['connect-src'].includes('https:'));
  assert.ok(!directives['connect-src'].includes('https://*.on.aws'));
});

test('Meta pixel frame works while unrelated framing remains restricted', () => {
  assert.deepEqual(directives['frame-src'], ['https://*.phonepe.com', 'https://www.facebook.com']);
  assert.deepEqual(directives['frame-ancestors'], ["'none'"]);
});

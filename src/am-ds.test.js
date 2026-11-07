import test from 'node:test';
import assert from 'node:assert/strict';
import { getPageRoute } from './routes.js';
import { getExperimentContext, resolveLandingRoute } from './lib/ab-testing.js';
test('short persona URL keeps campaign attribution through checkout', () => {
 const memory = new Map();
 const sessionStorage = { getItem: k => memory.get(k), setItem: (k,v) => memory.set(k,v) };
 const location = new URL('https://thriveonp.com/am-ds?utm_source=facebook&utm_medium=Dark+Skin');
 const ctx = { location, sessionStorage, document: {cookie:''}, history: {replaceState(){}} };
 assert.deepEqual(getPageRoute('/am-ds'), {page:'complexion'});
 assert.deepEqual(resolveLandingRoute(ctx), {page:'complexion'});
 location.pathname='/a-m-checkout';
 assert.equal(getExperimentContext(ctx).page_variant, 'COMPLEXION');
 assert.equal(getExperimentContext(ctx).entry_type, 'direct');
});

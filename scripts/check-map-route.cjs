// Run: rtk proxy node scripts/check-map-route.cjs
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const Module = require('node:module');
const ts = require('typescript');

const filename = path.resolve(__dirname, '../src/data/demoRoute.ts');
const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText;
const loaded = new Module(filename, module);
loaded.filename = filename;
loaded.paths = module.paths;
loaded._compile(compiled, filename);
const { DEMO_ROUTE, ROUTE_BOUNDS, positionAtProgress } = loaded.exports;

assert(DEMO_ROUTE.length > 2);
assert.deepEqual(positionAtProgress(0), DEMO_ROUTE[0]);
assert.deepEqual(positionAtProgress(-1), DEMO_ROUTE[0]);
assert.deepEqual(positionAtProgress(NaN), DEMO_ROUTE[0]);
assert.deepEqual(positionAtProgress(1), DEMO_ROUTE.at(-1));
assert.deepEqual(positionAtProgress(2), DEMO_ROUTE.at(-1));
for (let i = 0; i <= 1000; i++) {
  const point = positionAtProgress(i / 1000);
  assert(point.every(Number.isFinite));
  assert(point[0] >= ROUTE_BOUNDS[0] && point[0] <= ROUTE_BOUNDS[2]);
  assert(point[1] >= ROUTE_BOUNDS[1] && point[1] <= ROUTE_BOUNDS[3]);
}
console.log('Map route checks passed: endpoints, clamping, nonfinite input, 1001 positions within bounds.');

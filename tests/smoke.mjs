import fs from "node:fs";
import vm from "node:vm";
import { webcrypto } from "node:crypto";
import assert from "node:assert/strict";

const sandbox = {
  console,
  crypto: webcrypto,
  structuredClone,
  Blob,
  URL,
  setTimeout,
  clearTimeout,
  window: {
    addEventListener() {},
    clearTimeout,
    setTimeout,
    innerWidth: 1440,
  },
  document: {
    addEventListener() {},
    getElementById() { return null; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    documentElement: { style: { setProperty() {} } },
  },
  localStorage: {
    getItem() { return null; },
    setItem() {},
    removeItem() {},
  },
  globalThis: null,
};

sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(new URL("../app.js", import.meta.url), "utf8"), sandbox);

const result = vm.runInContext(`
  state = normalizeState(clone(sampleState));
  const sampleHealth = analyzeResume();
  const sampleText = buildPlainTextResume();
  const malformed = normalizeState({
    personal: { name: 123, email: 456 },
    experience: [{ role: 789 }],
    settings: { visibility: { summary: 0 } },
  });
  const hostile = normalizeState(JSON.parse('{"__proto__":{"polluted":true}}'));
  ({ sampleHealth, sampleText, malformed, hostile, unsafeUrl: safeUrl("javascript:alert(1)") });
`, sandbox);

assert.equal(result.sampleHealth.passed, 6, "sample resume should pass all health checks");
assert.match(result.sampleText, /王小明/);
assert.match(result.sampleText, /工作經歷/);
assert.equal(result.malformed.personal.name, "123");
assert.equal(result.malformed.personal.email, "456");
assert.equal(result.malformed.experience[0].role, "789");
assert.equal(result.malformed.settings.visibility.summary, false);
assert.equal(result.unsafeUrl, "#");
assert.equal(Object.prototype.polluted, undefined);

console.log("Resume builder smoke tests passed");

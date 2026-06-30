const test = require('node:test');
const assert = require('node:assert');
const { decide, classifyTool } = require('./browser-safety-guard');

const NOW = 1_000_000_000_000;
const fresh = NOW - 1000;             // לפני שנייה
const stale = NOW - (6 * 60 * 1000);  // לפני 6 דקות (> TTL)

const missingStat = () => () => { const e = new Error('ENOENT'); throw e; };
const fakeStat = (mtimeMs) => () => ({ mtimeMs });
const fakeRead = (obj) => () => JSON.stringify(obj);

test('readonly tool allowed without attestation', () => {
  const r = decide({ toolName: 'mcp__plugin_playwright_playwright__browser_take_screenshot', now: NOW, statFn: missingStat() });
  assert.equal(r.permissionDecision, 'allow');
});

test('guarded click denied when no attestation', () => {
  const r = decide({ toolName: 'mcp__plugin_playwright_playwright__browser_click', now: NOW, statFn: missingStat() });
  assert.equal(r.permissionDecision, 'deny');
});

test('guarded click allowed with fresh conforming attestation', () => {
  const r = decide({ toolName: 'mcp__plugin_playwright_playwright__browser_click', now: NOW, statFn: fakeStat(fresh), readFileFn: fakeRead({ conforms: true }) });
  assert.equal(r.permissionDecision, 'allow');
});

test('stale attestation denied', () => {
  const r = decide({ toolName: 'mcp__plugin_playwright_playwright__browser_click', now: NOW, statFn: fakeStat(stale), readFileFn: fakeRead({ conforms: true }) });
  assert.equal(r.permissionDecision, 'deny');
});

test('conforms:false denied', () => {
  const r = decide({ toolName: 'mcp__plugin_playwright_playwright__browser_click', now: NOW, statFn: fakeStat(fresh), readFileFn: fakeRead({ conforms: false }) });
  assert.equal(r.permissionDecision, 'deny');
});

test('evaluate_script is guarded (backdoor closed)', () => {
  assert.equal(classifyTool('mcp__plugin_chrome-devtools-mcp_chrome-devtools__evaluate_script'), 'guarded');
  const r = decide({ toolName: 'mcp__plugin_chrome-devtools-mcp_chrome-devtools__evaluate_script', now: NOW, statFn: missingStat() });
  assert.equal(r.permissionDecision, 'deny');
});

test('browser_run_code_unsafe is guarded', () => {
  assert.equal(classifyTool('mcp__plugin_playwright_playwright__browser_run_code_unsafe'), 'guarded');
});

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const HOOK = path.join(__dirname, 'browser-safety-guard.js');

test('browser_evaluate is guarded (backdoor closed)', () => {
  assert.equal(classifyTool('mcp__plugin_playwright_playwright__browser_evaluate'), 'guarded');
});

test('wrapper denies guarded tool via stdin (integration)', () => {
  const tmp = path.join(os.tmpdir(), 'mcp-bsg-no-attestation.json');
  try { fs.unlinkSync(tmp); } catch {}
  const out = execFileSync(process.execPath, [HOOK], {
    input: JSON.stringify({ tool_name: 'mcp__x__browser_click', tool_input: {} }),
    env: { ...process.env, BROWSER_ATTESTATION_PATH: tmp },
    encoding: 'utf8',
  });
  assert.equal(JSON.parse(out).hookSpecificOutput.permissionDecision, 'deny');
});

test('wrapper allows readonly tool via stdin (integration)', () => {
  const out = execFileSync(process.execPath, [HOOK], {
    input: JSON.stringify({ tool_name: 'mcp__x__browser_take_screenshot', tool_input: {} }),
    encoding: 'utf8',
  });
  const parsed = JSON.parse(out);
  assert.equal(parsed.hookSpecificOutput.permissionDecision, 'allow');
  assert.equal(parsed.hookSpecificOutput.hookEventName, 'PreToolUse');
});

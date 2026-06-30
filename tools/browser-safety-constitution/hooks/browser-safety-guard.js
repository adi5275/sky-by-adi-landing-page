const fs = require('fs');
const os = require('os');
const path = require('path');

const TTL_MS = 5 * 60 * 1000; // 5 דקות
const ATTESTATION_PATH = process.env.BROWSER_ATTESTATION_PATH
  || path.join(os.homedir(), '.claude', '.browser-attestation.json');

// כלי דפדפן לקריאה בלבד — לעולם לא דורשים הצהרה.
const READONLY = new Set([
  // chrome-devtools
  'take_screenshot', 'take_snapshot', 'list_pages', 'new_page', 'select_page',
  'close_page', 'navigate_page', 'list_console_messages', 'get_console_message',
  'list_network_requests', 'get_network_request', 'performance_start_trace',
  'performance_stop_trace', 'performance_analyze_insight', 'take_heapsnapshot',
  'resize_page', 'emulate', 'wait_for', 'hover', 'lighthouse_audit',
  // playwright
  'browser_snapshot', 'browser_take_screenshot', 'browser_console_messages',
  'browser_network_requests', 'browser_network_request', 'browser_navigate',
  'browser_navigate_back', 'browser_tabs', 'browser_wait_for', 'browser_resize',
  'browser_hover', 'browser_close',
]);

function toolSegment(toolName) {
  const parts = String(toolName).split('__');
  return parts[parts.length - 1];
}

function classifyTool(toolName) {
  // ברירת מחדל בטוחה: כל מה שאינו READONLY מפורש נחשב שמור.
  return READONLY.has(toolSegment(toolName)) ? 'readonly' : 'guarded';
}

function readAttestation(now, readFileFn, statFn) {
  let stat;
  try { stat = statFn(ATTESTATION_PATH); }
  catch { return { valid: false, reason: 'אין הצהרה' }; }
  if (now - stat.mtimeMs > TTL_MS) return { valid: false, reason: 'הצהרה ישנה (פג TTL)' };
  let data;
  try { data = JSON.parse(readFileFn(ATTESTATION_PATH, 'utf8')); }
  catch { return { valid: false, reason: 'הצהרה לא קריאה' }; }
  if (data.conforms !== true) return { valid: false, reason: 'ההצהרה אינה conforms:true' };
  return { valid: true, reason: 'תקין' };
}

function denyMessage(reason) {
  return [
    'פעולת דפדפן שמשנה מצב נחסמה ע"י פרוטוקול המצפן.',
    `סיבה: ${reason}.`,
    'לפני שתמשיך: הפעל את הסקיל browser-safety-constitution —',
    'קרא את ~/.claude/safety-constitution.md, ודא שהפעולה תואמת סעיף-סעיף,',
    'וכתוב הצהרה תקפה ל-~/.claude/.browser-attestation.json עם conforms:true.',
    'אם יש ספק כלשהו (סכום/חשבון/נמען/תוכן) — עצור ושאל את עדי, אל תכתוב הצהרה.',
  ].join(' ');
}

function decide({ toolName, now, readFileFn = fs.readFileSync, statFn = fs.statSync }) {
  if (classifyTool(toolName) === 'readonly') {
    return { permissionDecision: 'allow', reason: 'כלי קריאה בלבד' };
  }
  const att = readAttestation(now, readFileFn, statFn);
  if (att.valid) return { permissionDecision: 'allow', reason: 'הצהרה תקפה' };
  return { permissionDecision: 'deny', reason: denyMessage(att.reason) };
}

module.exports = { decide, classifyTool, readAttestation, toolSegment, denyMessage, TTL_MS, ATTESTATION_PATH };

if (require.main === module) {
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (d) => { input += d; });
  process.stdin.on('end', () => {
    let toolName = '';
    try { toolName = (JSON.parse(input).tool_name) || ''; } catch { /* קלט לא תקין -> שם ריק -> guarded -> deny */ }
    const result = decide({ toolName, now: Date.now() });
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: result.permissionDecision,
        permissionDecisionReason: result.reason,
      },
    }));
    process.exit(0);
  });
}

# פרוטוקול המצפן - גיבוי הכלי

גיבוי מגורסה בגיט של כלי בטיחות הדפדפן. **העותק החי** שרץ בפועל יושב ב-`~/.claude/`
(`safety-constitution.md`, `skills/browser-safety-constitution/SKILL.md`,
`hooks/browser-safety-guard.js`). הקבצים כאן הם תמונת מצב לשחזור.

מה הכלי עושה: לפני כל פעולת דפדפן שמשנה מצב (שליחה / פרסום / תשלום / הגשת טופס),
hook מסוג PreToolUse חוסם את הפעולה עד שקלוד קורא את החוקה וכותב הצהרה תקפה
(`~/.claude/.browser-attestation.json`, `conforms:true`, mtime < 5 דקות). פרסום /
תשלום / שליחה המונית דורשים תמיד אישור מפורש של עדי.

תיעוד מלא: `docs/superpowers/specs/2026-06-29-browser-safety-constitution-design.md`
ו-`docs/superpowers/plans/2026-06-30-browser-safety-constitution.md`.

## שחזור להתקנה חיה
העתק את שלושת הקבצים חזרה למיקומים שלהם תחת `~/.claude/`, ורשום את ה-hook
ב-`~/.claude/settings.json` תחת `hooks.PreToolUse` עם
matcher `mcp__.*(chrome-devtools|playwright).*`.

/* =============================================
   SQL TRAINER — APP LOGIC  (v2)
   Features: CodeMirror · ERD modal · Diff view ·
             Error translation · Capstones · Quiz · Notes
   ============================================= */

// ── State ─────────────────────────────────────────────────────────────────────
let SQL       = null;   // sql.js constructor
let db        = null;   // active database instance
let sqlEditor = null;   // CodeMirror instance

let currentLessonId    = null;  // positive = lesson, negative = capstone
let currentExerciseIdx = null;

let currentQuiz = null; // { questions[], idx, score, wrong[] }

// ── Progress (localStorage) ───────────────────────────────────────────────────
const STORAGE_KEY = 'sql-trainer-progress';

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}

function saveProgress(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getProgress() { return loadProgress(); }

function markLessonDone(id) {
  const p = getProgress();
  if (!p.completedLessons) p.completedLessons = {};
  if (!p.completedLessons[id]) {
    p.completedLessons[id] = true;
    recordSession(p);
  }
  saveProgress(p);
}

function markExerciseDone(lessonId, exerciseId) {
  const p = getProgress();
  if (!p.completedExercises) p.completedExercises = {};
  p.completedExercises[`${lessonId}_${exerciseId}`] = true;
  saveProgress(p);
}

function isExerciseDone(lessonId, exerciseId) {
  return !!(getProgress().completedExercises || {})[`${lessonId}_${exerciseId}`];
}

function isLessonDone(id) {
  return !!(getProgress().completedLessons || {})[id];
}

function recordSession(p) {
  const today = new Date().toISOString().split('T')[0];
  if (!p.sessionsToday) p.sessionsToday = {};
  p.sessionsToday[today] = (p.sessionsToday[today] || 0) + 1;

  if (!p.streak) p.streak = { lastDate: null, count: 0 };
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (p.streak.lastDate === today) {
    // same day — no change
  } else if (p.streak.lastDate === yesterday) {
    p.streak.count += 1;
    p.streak.lastDate = today;
  } else {
    p.streak.count = 1;
    p.streak.lastDate = today;
  }
}

function getTodaySessions() {
  const today = new Date().toISOString().split('T')[0];
  return (getProgress().sessionsToday || {})[today] || 0;
}

// ── Notes ─────────────────────────────────────────────────────────────────────
let _noteTimer = null;

function loadNote(lessonId) {
  const notes = (getProgress().lessonNotes || {});
  document.getElementById('lesson-notes').value = notes[lessonId] || '';
}

function saveNote(lessonId) {
  const p = getProgress();
  if (!p.lessonNotes) p.lessonNotes = {};
  const text = document.getElementById('lesson-notes').value;
  if (text.trim()) {
    p.lessonNotes[lessonId] = text;
  } else {
    delete p.lessonNotes[lessonId];
  }
  saveProgress(p);
}

function getNote(lessonId) {
  return (getProgress().lessonNotes || {})[lessonId] || '';
}

// ── Data helpers ──────────────────────────────────────────────────────────────
function getLessonById(id) {
  if (id > 0) return LESSONS.find(l => l.id === id) || null;
  return CAPSTONES.find(c => c.id === id) || null;
}

function isModuleComplete(moduleId) {
  return LESSONS
    .filter(l => l.module === moduleId)
    .every(l => isLessonDone(l.id));
}

// ── Boot ──────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {

  // Nav
  document.querySelectorAll('.nav-btn[data-view]').forEach(btn => {
    btn.addEventListener('click', () => showView(btn.dataset.view));
  });

  document.getElementById('back-btn').addEventListener('click', () => showView('dashboard'));
  document.getElementById('btn-prev').addEventListener('click', () => navigateLesson(-1));
  document.getElementById('btn-next').addEventListener('click', () => navigateLesson(1));

  document.getElementById('btn-reset-db').addEventListener('click', resetDatabase);
  document.getElementById('btn-check').addEventListener('click', checkCurrentExercise);
  document.getElementById('btn-hint').addEventListener('click', showHint);
  document.getElementById('btn-solution').addEventListener('click', showSolution);

  document.getElementById('modal-keep-going').addEventListener('click', dismissBreak);
  document.getElementById('modal-break').addEventListener('click', dismissBreak);

  // Schema modal
  document.getElementById('btn-schema').addEventListener('click', () => {
    document.getElementById('schema-modal').classList.remove('hidden');
  });
  document.getElementById('btn-schema-close').addEventListener('click', () => {
    document.getElementById('schema-modal').classList.add('hidden');
  });
  document.getElementById('schema-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) e.currentTarget.classList.add('hidden');
  });

  // Panel tabs
  document.querySelectorAll('.ptab').forEach(tab => {
    tab.addEventListener('click', () => switchPanelTab(tab.dataset.tab));
  });

  // Run button
  document.getElementById('btn-run').addEventListener('click', runQuery);

  // Clear button — wired after CM init

  // Notes auto-save (debounced)
  document.getElementById('lesson-notes').addEventListener('input', () => {
    clearTimeout(_noteTimer);
    _noteTimer = setTimeout(() => {
      if (currentLessonId !== null) saveNote(currentLessonId);
    }, 400);
  });

  // Quiz
  // Sync
  document.getElementById('btn-export').addEventListener('click', exportSyncCode);
  document.getElementById('btn-import-toggle').addEventListener('click', () => {
    const panel = document.getElementById('import-panel');
    const isOpen = !panel.classList.contains('hidden');
    panel.classList.toggle('hidden', isOpen);
    if (!isOpen) document.getElementById('sync-input').focus();
  });
  document.getElementById('btn-import-apply').addEventListener('click', importSyncCode);
  document.getElementById('btn-import-cancel').addEventListener('click', () => {
    document.getElementById('import-panel').classList.add('hidden');
    document.getElementById('sync-input').value = '';
  });

  document.getElementById('btn-start-quiz').addEventListener('click', startQuiz);
  document.getElementById('btn-quiz-retry').addEventListener('click', () => {
    document.getElementById('quiz-results').classList.add('hidden');
    document.getElementById('quiz-start').classList.remove('hidden');
  });
  document.getElementById('btn-quiz-dash').addEventListener('click', () => showView('dashboard'));

  // Load SQL.js + init everything
  try {
    SQL = await initSqlJs({
      // WASM must be fetched over HTTPS — CDN works everywhere;
      // the service worker will cache it after the first Netlify load.
      locateFile: file => `https://cdn.jsdelivr.net/npm/sql.js@1.10.2/dist/${file}`,
    });
    initDatabase();

    // Initialize CodeMirror now that DOM is ready
    initEditor();

    document.getElementById('loading-overlay').style.display = 'none';
    showView('dashboard');
    renderDashboard();
    updateSessionUI();
    updateGreeting();
    updateContinueBanner();
  } catch (err) {
    const overlay = document.getElementById('loading-overlay');
    overlay.innerHTML = `
      <div style="font-size:48px">⚠️</div>
      <h2 style="color:#ef4444">Failed to load SQL engine</h2>
      <p style="max-width:400px;text-align:center">
        Could not load sql.js from CDN. Check your internet connection and reload.
      </p>
      <code style="background:#1a1d26;padding:12px;border-radius:8px;font-size:12px;color:#94a3b8;">${err.message}</code>
      <button onclick="location.reload()" style="padding:10px 24px;background:#6366f1;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;margin-top:8px;">Reload</button>`;
  }
});

// ── CodeMirror ────────────────────────────────────────────────────────────────
function initEditor() {
  const textarea = document.getElementById('sql-editor');
  sqlEditor = CodeMirror.fromTextArea(textarea, {
    mode: 'text/x-sql',
    theme: 'material-darker',
    lineNumbers: true,
    matchBrackets: true,
    autoCloseBrackets: true,
    indentWithTabs: false,
    indentUnit: 2,
    lineWrapping: false,
    extraKeys: {
      'Ctrl-Enter': runQuery,
      'Cmd-Enter':  runQuery,
      'Tab': cm => cm.replaceSelection('  '),
    },
  });

  // Wire clear button after editor exists
  document.getElementById('btn-clear').addEventListener('click', () => {
    sqlEditor.setValue('');
    sqlEditor.focus();
  });
}

function getEditorValue() {
  return sqlEditor ? sqlEditor.getValue().trim() : '';
}

function setEditorValue(val) {
  if (sqlEditor) {
    sqlEditor.setValue(val);
    sqlEditor.focus();
  }
}

// ── Database ──────────────────────────────────────────────────────────────────
function initDatabase() {
  if (db) db.close();
  db = new SQL.Database();
  db.run(BASE_SCHEMA);
}

function resetDatabase() {
  initDatabase();
  showToast('Database reset to initial state');
}

// ── Views ─────────────────────────────────────────────────────────────────────
function showView(name) {
  ['dashboard', 'lesson', 'review', 'quiz'].forEach(v => {
    document.getElementById(`view-${v}`).classList.toggle('hidden', v !== name);
  });

  document.querySelectorAll('.nav-btn[data-view]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === name);
  });

  if (name === 'review')    renderReview();
  if (name === 'dashboard') { renderDashboard(); updateContinueBanner(); }
  if (name === 'quiz')      renderQuizStart();
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function renderDashboard() {
  const p = getProgress();
  const completed = Object.keys(p.completedLessons || {}).length;
  const exercises = Object.keys(p.completedExercises || {}).length;
  const streak    = (p.streak || {}).count || 0;

  document.getElementById('stat-completed').textContent = completed;
  document.getElementById('stat-exercises').textContent = exercises;
  document.getElementById('stat-streak').textContent    = streak;

  const grid = document.getElementById('modules-grid');
  grid.innerHTML = '';

  MODULES.forEach(mod => {
    const modLessons = LESSONS.filter(l => l.module === mod.id);
    const doneCnt    = modLessons.filter(l => isLessonDone(l.id)).length;
    const pct        = modLessons.length ? Math.round((doneCnt / modLessons.length) * 100) : 0;
    const modDone    = isModuleComplete(mod.id);
    const cap        = CAPSTONES.find(c => c.moduleId === mod.id);
    const capDone    = cap ? isLessonDone(cap.id) : false;

    const card = document.createElement('div');
    card.className = 'module-card';
    card.innerHTML = `
      <div class="module-header">
        <span class="module-dot" style="background:${mod.color}"></span>
        <span class="module-title">Module ${mod.id} — ${mod.name}</span>
        <div class="module-progress-bar">
          <div class="module-progress-fill" style="width:${pct}%;background:${mod.color}"></div>
        </div>
        <span class="module-progress-label">${doneCnt}/${modLessons.length}</span>
      </div>
      <div class="lessons-list">
        ${modLessons.map(l => lessonRowHTML(l)).join('')}
        ${cap ? capstoneRowHTML(cap, modDone, capDone, mod.color) : ''}
      </div>`;

    card.querySelectorAll('.lesson-row').forEach(row => {
      row.addEventListener('click', () => loadLesson(+row.dataset.id));
    });

    if (modDone && cap) {
      const capRow = card.querySelector('.capstone-row:not(.locked)');
      if (capRow) capRow.addEventListener('click', () => loadLesson(cap.id));
    }

    grid.appendChild(card);
  });
}

function lessonRowHTML(lesson) {
  const done   = isLessonDone(lesson.id);
  const exDone = lesson.exercises.filter(e => isExerciseDone(lesson.id, e.id)).length;
  const cls    = done ? 'done' : '';
  return `
    <div class="lesson-row ${cls}" data-id="${lesson.id}">
      <span class="lesson-row-num">${done ? '✓' : lesson.id}</span>
      <div class="lesson-row-info">
        <div class="lesson-row-title">${lesson.title}</div>
        <div class="lesson-row-meta">${lesson.duration} · ${exDone}/${lesson.exercises.length} exercises</div>
      </div>
      <span class="lesson-row-status">${done ? 'Done ✓' : '→'}</span>
    </div>`;
}

function capstoneRowHTML(cap, unlocked, done, color) {
  const cls = done ? 'done' : unlocked ? '' : 'locked';
  const icon = done ? '🏆' : unlocked ? '⭐' : '🔒';
  const status = done ? 'Done 🏆' : unlocked ? 'Try it →' : 'Complete module to unlock';
  return `
    <div class="capstone-row ${cls}">
      <span class="capstone-icon">${icon}</span>
      <div class="capstone-info">
        <div class="capstone-title">${cap.title}</div>
        <div class="capstone-meta">${cap.duration} · Challenge · No hints</div>
      </div>
      <span class="capstone-status">${status}</span>
    </div>`;
}

function updateContinueBanner() {
  const nextLesson = LESSONS.find(l => !isLessonDone(l.id));
  const banner = document.getElementById('continue-banner');
  if (!nextLesson) { banner.classList.add('hidden'); return; }

  const mod = MODULES.find(m => m.id === nextLesson.module);
  document.getElementById('continue-title').textContent = nextLesson.title;
  document.getElementById('continue-sub').textContent = `Module ${mod.id} · ${mod.name} · ${nextLesson.duration}`;
  document.getElementById('continue-btn').onclick = () => loadLesson(nextLesson.id);
  banner.classList.remove('hidden');
}

function updateGreeting() {
  const h = new Date().getHours();
  const g = h < 12 ? 'Good morning!' : h < 18 ? 'Good afternoon!' : 'Good evening!';
  document.getElementById('hero-greeting').textContent = g;
}

function updateSessionUI() {
  const s = getTodaySessions();
  document.getElementById('session-label').textContent = `${s} / 3 today`;
  [1,2,3].forEach(i => document.getElementById(`dot-${i}`).classList.toggle('done', i <= s));
}

// ── Load Lesson / Capstone ────────────────────────────────────────────────────
function loadLesson(id) {
  const lesson = getLessonById(id);
  if (!lesson) return;

  currentLessonId    = id;
  currentExerciseIdx = null;

  const mod = MODULES.find(m => m.id === lesson.module || m.id === lesson.moduleId);

  // Breadcrumb
  const tag = document.getElementById('lb-module');
  tag.textContent  = lesson.isCapstone
    ? `Module ${mod.id} · ${mod.name}`
    : `Module ${mod.id} · ${mod.name}`;
  tag.style.background = mod.color;
  document.getElementById('lb-title').textContent    = lesson.title;
  document.getElementById('lb-duration').textContent = lesson.duration;

  // Prev/Next — disabled for capstones
  if (lesson.isCapstone) {
    document.getElementById('btn-prev').disabled = true;
    document.getElementById('btn-next').disabled = true;
  } else {
    const idx = LESSONS.findIndex(l => l.id === id);
    document.getElementById('btn-prev').disabled = idx === 0;
    document.getElementById('btn-next').disabled = idx === LESSONS.length - 1;
  }

  // Theory
  document.getElementById('theory-content').innerHTML = lesson.theory;

  // Exercises
  renderExercises(lesson);
  updateExBadge(lesson);

  // Editor + results
  setEditorValue('');
  clearResults();
  resetChecker();

  // Notes
  loadNote(id);

  // Reset DB
  initDatabase();

  switchPanelTab('theory');
  showView('lesson');
}

function navigateLesson(dir) {
  if (currentLessonId === null || currentLessonId < 0) return;
  const idx  = LESSONS.findIndex(l => l.id === currentLessonId);
  const next = LESSONS[idx + dir];
  if (next) loadLesson(next.id);
}

// ── Exercises ─────────────────────────────────────────────────────────────────
function renderExercises(lesson) {
  const list = document.getElementById('exercises-list');
  list.innerHTML = '';
  lesson.exercises.forEach((ex, i) => {
    const done = isExerciseDone(lesson.id, ex.id);
    const card = document.createElement('div');
    card.className = `exercise-card${done ? ' solved' : ''}`;
    card.dataset.idx = i;
    card.innerHTML = `
      <div class="ex-header">
        <span class="ex-num">Exercise ${i + 1}</span>
        ${done ? '<span class="ex-solved-badge">✓ Solved</span>' : ''}
      </div>
      <div class="ex-prompt">${ex.prompt}</div>`;
    card.addEventListener('click', () => selectExercise(i));
    list.appendChild(card);
  });
}

function selectExercise(idx) {
  currentExerciseIdx = idx;
  const lesson = getLessonById(currentLessonId);
  const ex     = lesson.exercises[idx];

  document.querySelectorAll('.exercise-card').forEach((c, i) => {
    c.classList.toggle('active', i === idx);
  });

  document.getElementById('active-ex-label').textContent =
    `Exercise ${idx + 1}: ${ex.prompt}`;
  document.getElementById('checker-wrap').classList.remove('hidden');
  resetChecker();
  switchPanelTab('exercises');
}

function updateExBadge(lesson) {
  const done  = lesson.exercises.filter(e => isExerciseDone(lesson.id, e.id)).length;
  const total = lesson.exercises.length;
  document.getElementById('ex-badge').textContent = `${done} / ${total}`;
}

// ── Panel Tabs ────────────────────────────────────────────────────────────────
function switchPanelTab(tab) {
  document.querySelectorAll('.ptab').forEach(t =>
    t.classList.toggle('active', t.dataset.tab === tab));
  document.getElementById('tab-theory').classList.toggle('hidden', tab !== 'theory');
  document.getElementById('tab-exercises').classList.toggle('hidden', tab !== 'exercises');
}

// ── SQL Runner ────────────────────────────────────────────────────────────────
function runQuery() {
  const sql = getEditorValue();
  if (!sql) return;
  displayResult(execSQL(sql));
}

function execSQL(sql) {
  try {
    const results = db.exec(sql);
    if (!results.length) return { type: 'empty', message: 'Query executed. No rows returned.' };
    return { type: 'table', data: results[0] };
  } catch (err) {
    return { type: 'error', message: translateError(err.message) };
  }
}

function execSQLClean(sql) {
  const tmp = new SQL.Database();
  tmp.run(BASE_SCHEMA);
  try {
    const results = tmp.exec(sql);
    tmp.close();
    return results.length ? results[0] : null;
  } catch {
    tmp.close();
    return null;
  }
}

// ── Error Translation ─────────────────────────────────────────────────────────
function translateError(raw) {
  const r = raw || '';

  const m1 = r.match(/no such column:\s*(\S+)/i);
  if (m1) return `Column "${m1[1]}" doesn't exist. Check spelling — column names are case-sensitive.`;

  const m2 = r.match(/no such table:\s*(\S+)/i);
  if (m2) return `Table "${m2[1]}" doesn't exist. Available tables: employees, departments, projects, employee_projects`;

  const m3 = r.match(/near "(.+?)":\s*syntax error/i);
  if (m3) return `Syntax error near "${m3[1]}". Check for typos, missing commas, or misspelled keywords.`;

  if (/syntax error/i.test(r))
    return 'SQL syntax error. Check for missing commas, unclosed parentheses, or typos.';

  const m4 = r.match(/ambiguous column name:\s*(\S+)/i);
  if (m4) return `Column "${m4[1]}" exists in multiple tables. Prefix it with a table alias, e.g. e.${m4[1]}.`;

  const m5 = r.match(/no such function:\s*(\S+)/i);
  if (m5) return `Function "${m5[1]}" doesn't exist in SQLite. Check the function name.`;

  if (/misuse of aggregate/i.test(r))
    return "Aggregate functions (COUNT, SUM, AVG…) can't be used in WHERE. Use HAVING after GROUP BY, or wrap in a subquery.";

  if (/no tables specified/i.test(r))
    return 'No table specified. Did you forget the FROM clause?';

  return `SQL error: ${raw}`;
}

// ── Display Results ───────────────────────────────────────────────────────────
function displayResult(result) {
  const area = document.getElementById('results-area');
  const meta = document.getElementById('results-meta');

  if (result.type === 'error') {
    area.innerHTML = `<div class="results-error">⚠ ${escapeHtml(result.message)}</div>`;
    meta.textContent = 'Error';
    return;
  }
  if (result.type === 'empty') {
    area.innerHTML = `<div class="results-empty"><span class="results-icon">✓</span><span>${escapeHtml(result.message)}</span></div>`;
    meta.textContent = 'OK';
    return;
  }

  const { columns, values } = result.data;
  meta.textContent = `${values.length} row${values.length !== 1 ? 's' : ''} · ${columns.length} col${columns.length !== 1 ? 's' : ''}`;
  area.innerHTML = buildResultTable(columns, values);
}

function buildResultTable(columns, values) {
  const rows = values.map(row =>
    `<tr>${row.map(v =>
      v === null
        ? `<td><span class="null-val">NULL</span></td>`
        : `<td>${escapeHtml(String(v))}</td>`
    ).join('')}</tr>`
  ).join('');
  return `
    <div class="results-table-wrap">
      <table class="results-table">
        <thead><tr>${columns.map(c => `<th>${escapeHtml(c)}</th>`).join('')}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function clearResults() {
  document.getElementById('results-area').innerHTML = `
    <div class="results-empty">
      <span class="results-icon">▷</span>
      <span>Run a query to see results here</span>
    </div>`;
  document.getElementById('results-meta').textContent = '';
}

// ── Exercise Checker ──────────────────────────────────────────────────────────
function checkCurrentExercise() {
  if (currentExerciseIdx === null) return;
  const lesson  = getLessonById(currentLessonId);
  const ex      = lesson.exercises[currentExerciseIdx];
  const userSQL = getEditorValue();

  if (!userSQL) { showCheckResult(false, 'Write a query first.'); return; }

  const userExec = execSQL(userSQL);
  displayResult(userExec);

  if (userExec.type === 'error') {
    showCheckResult(false, userExec.message);
    hideDiffView();
    return;
  }

  const expData  = execSQLClean(ex.solution);
  const userData = userExec.type === 'table' ? userExec.data : null;
  const { pass, message } = compareResults(userData, expData);

  if (pass) {
    markExerciseDone(currentLessonId, ex.id);
    updateExBadge(lesson);
    renderExercises(lesson);
    selectExercise(currentExerciseIdx);
    showCheckResult(true, '✓ Correct! Well done.');
    hideDiffView();

    const allDone = lesson.exercises.every(e => isExerciseDone(lesson.id, e.id));
    if (allDone && !isLessonDone(lesson.id)) {
      setTimeout(offerLessonComplete, 600);
    }
  } else {
    showCheckResult(false, `✗ Not quite. ${message}`);
    renderDiffView(userData, expData);
  }
}

function compareResults(userData, expData) {
  if (!userData && !expData) return { pass: true, message: '' };
  if (!userData && expData) {
    const n = (expData.values || []).length;
    return n === 0
      ? { pass: true, message: '' }
      : { pass: false, message: `Expected ${n} row(s), got 0.` };
  }
  if (userData && !expData) {
    const n = (userData.values || []).length;
    return n === 0
      ? { pass: true, message: '' }
      : { pass: false, message: 'Expected no rows.' };
  }

  const uRows = userData.values || [];
  const eRows = expData.values  || [];

  if (uRows.length !== eRows.length)
    return { pass: false, message: `Expected ${eRows.length} row(s), got ${uRows.length}.` };

  const norm = rows =>
    rows.map(r => r.map(v => v === null ? '\x00NULL\x00' : String(v).trim()).join('\x01')).sort();

  if (JSON.stringify(norm(uRows)) !== JSON.stringify(norm(eRows)))
    return { pass: false, message: "Values don't match expected output. See comparison below." };

  return { pass: true, message: '' };
}

// ── Diff View ─────────────────────────────────────────────────────────────────
function renderDiffView(userData, expData) {
  const dv = document.getElementById('diff-view');
  dv.classList.remove('hidden');

  const uCols = userData ? userData.columns : [];
  const uRows = userData ? userData.values  : [];
  const eCols = expData  ? expData.columns  : [];
  const eRows = expData  ? expData.values   : [];

  document.getElementById('diff-yours-count').textContent =
    `(${uRows.length} row${uRows.length !== 1 ? 's' : ''})`;
  document.getElementById('diff-exp-count').textContent =
    `(${eRows.length} row${eRows.length !== 1 ? 's' : ''})`;

  document.getElementById('diff-yours-table').innerHTML =
    uRows.length ? buildResultTable(uCols, uRows)
                 : `<div class="diff-empty">No rows</div>`;
  document.getElementById('diff-exp-table').innerHTML =
    eRows.length ? buildResultTable(eCols, eRows)
                 : `<div class="diff-empty">No rows</div>`;
}

function hideDiffView() {
  document.getElementById('diff-view').classList.add('hidden');
}

// ── Hint / Solution / Check Result ───────────────────────────────────────────
function showCheckResult(pass, message) {
  const el = document.getElementById('check-result');
  el.className = `check-result ${pass ? 'pass' : 'fail'}`;
  el.textContent = message;
  el.classList.remove('hidden');
}

function showHint() {
  if (currentExerciseIdx === null) return;
  const ex  = getLessonById(currentLessonId).exercises[currentExerciseIdx];
  const box = document.getElementById('hint-box');
  box.textContent = `💡 ${ex.hint}`;
  box.classList.toggle('hidden');
  document.getElementById('solution-box').classList.add('hidden');
}

function showSolution() {
  if (currentExerciseIdx === null) return;
  const ex  = getLessonById(currentLessonId).exercises[currentExerciseIdx];
  const box = document.getElementById('solution-box');
  box.textContent = ex.solution;
  box.classList.toggle('hidden');
  document.getElementById('hint-box').classList.add('hidden');
}

function resetChecker() {
  document.getElementById('check-result').classList.add('hidden');
  document.getElementById('hint-box').classList.add('hidden');
  document.getElementById('solution-box').classList.add('hidden');
  hideDiffView();
}

// ── Lesson Completion ─────────────────────────────────────────────────────────
function offerLessonComplete() {
  markLessonDone(currentLessonId);
  updateSessionUI();
  document.getElementById('break-modal').classList.remove('hidden');
}

function dismissBreak() {
  document.getElementById('break-modal').classList.add('hidden');
  renderDashboard();
  updateContinueBanner();
}

// ── Review View ───────────────────────────────────────────────────────────────
function renderReview() {
  const grid = document.getElementById('review-grid');
  grid.innerHTML = '';

  MODULES.forEach(mod => {
    const section = document.createElement('div');
    section.className = 'review-module-section';
    section.innerHTML = `<div class="review-module-title" style="color:${mod.color}">Module ${mod.id} — ${mod.name}</div>`;
    grid.appendChild(section);

    const row = document.createElement('div');
    row.className = 'review-grid';
    row.style.marginBottom = '24px';

    LESSONS.filter(l => l.module === mod.id).forEach(lesson => {
      const rc   = lesson.reviewCard;
      const note = getNote(lesson.id);
      const card = document.createElement('div');
      card.className = 'review-card';
      card.innerHTML = `
        <div class="rc-header">
          <span class="rc-dot" style="background:${mod.color}"></span>
          <span class="rc-title">${rc.title}</span>
          <span class="rc-lesson-num">Lesson ${lesson.id}</span>
        </div>
        <div class="rc-body">
          <div class="rc-desc">${rc.description}</div>
          <pre>${escapeHtml(rc.syntax)}</pre>
          ${note ? `
            <details class="rc-notes">
              <summary>My notes</summary>
              <div class="rc-notes-text">${escapeHtml(note)}</div>
            </details>` : ''}
        </div>`;
      row.appendChild(card);
    });

    grid.appendChild(row);
  });
}

// ── Quiz Mode ─────────────────────────────────────────────────────────────────
function renderQuizStart() {
  ['quiz-start','quiz-question','quiz-results'].forEach(id => {
    document.getElementById(id).classList.toggle('hidden', id !== 'quiz-start');
  });

  const p = getProgress();
  const completedLessons = Object.keys(p.completedLessons || {}).map(Number)
    .filter(id => id > 0); // exclude capstones

  const hasQuestions = QUIZ_QUESTIONS.some(q => completedLessons.includes(q.lessonId));
  document.getElementById('quiz-no-lessons').classList.toggle('hidden', hasQuestions);
  document.getElementById('btn-start-quiz').disabled = !hasQuestions;

  if (hasQuestions) {
    const available = QUIZ_QUESTIONS.filter(q => completedLessons.includes(q.lessonId)).length;
    document.getElementById('quiz-start-desc').textContent =
      `${Math.min(10, available)} question${Math.min(10, available) !== 1 ? 's' : ''} drawn from your ${completedLessons.length} completed lesson${completedLessons.length !== 1 ? 's' : ''}, weighted toward concepts you've struggled with.`;
  }
}

function buildQuizDeck() {
  const p               = getProgress();
  const history         = p.quizHistory || {};
  const completedLessons = Object.keys(p.completedLessons || {}).map(Number)
    .filter(id => id > 0);

  const pool = [];
  QUIZ_QUESTIONS.forEach(q => {
    if (!completedLessons.includes(q.lessonId)) return;
    const h = history[`q${q.id}`] || { attempts: 0, correct: 0 };
    const weight = h.attempts === 0 ? 1.5 : (h.correct / h.attempts < 0.7) ? 2 : 0.5;
    const copies = Math.ceil(weight);
    for (let i = 0; i < copies; i++) pool.push(q);
  });

  // Shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Deduplicate and cap at 10
  const seen = new Set(), deck = [];
  for (const q of pool) {
    if (!seen.has(q.id) && deck.length < 10) { seen.add(q.id); deck.push(q); }
  }
  return deck;
}

function startQuiz() {
  const deck = buildQuizDeck();
  if (!deck.length) return;

  currentQuiz = { questions: deck, idx: 0, score: 0, wrong: [] };

  document.getElementById('quiz-q-total').textContent = deck.length;
  document.getElementById('quiz-start').classList.add('hidden');
  document.getElementById('quiz-question').classList.remove('hidden');

  renderQuizQuestion();
}

function renderQuizQuestion() {
  const q   = currentQuiz.questions[currentQuiz.idx];
  const pct = (currentQuiz.idx / currentQuiz.questions.length) * 100;

  document.getElementById('quiz-progress-fill').style.width = `${pct}%`;
  document.getElementById('quiz-q-num').textContent = currentQuiz.idx + 1;

  const lesson = LESSONS.find(l => l.id === q.lessonId);
  const mod    = lesson ? MODULES.find(m => m.id === lesson.module) : null;
  const tag    = document.getElementById('quiz-lesson-tag');
  tag.textContent = lesson ? `${lesson.title}` : '';
  if (mod) { tag.style.background = mod.color + '22'; tag.style.color = mod.color; tag.style.borderColor = mod.color; }

  document.getElementById('quiz-question-text').textContent = q.question;

  // Shuffle option order
  const opts = [...q.options].sort(() => Math.random() - 0.5);
  const container = document.getElementById('quiz-options');
  container.innerHTML = '';
  opts.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.textContent = opt;
    btn.addEventListener('click', () => answerQuizQuestion(opt, q));
    container.appendChild(btn);
  });
}

function answerQuizQuestion(selected, q) {
  // Disable all options
  document.querySelectorAll('.quiz-option').forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === q.answer) btn.classList.add('correct');
    else if (btn.textContent === selected && selected !== q.answer) btn.classList.add('wrong');
  });

  const correct = selected === q.answer;

  // Update quiz history
  const p = getProgress();
  if (!p.quizHistory) p.quizHistory = {};
  const key = `q${q.id}`;
  if (!p.quizHistory[key]) p.quizHistory[key] = { attempts: 0, correct: 0 };
  p.quizHistory[key].attempts += 1;
  if (correct) p.quizHistory[key].correct += 1;
  saveProgress(p);

  if (correct) {
    currentQuiz.score += 1;
  } else {
    currentQuiz.wrong.push({ question: q.question, answer: q.answer, yours: selected });
  }

  setTimeout(() => {
    currentQuiz.idx += 1;
    if (currentQuiz.idx >= currentQuiz.questions.length) {
      showQuizResults();
    } else {
      renderQuizQuestion();
    }
  }, 900);
}

function showQuizResults() {
  document.getElementById('quiz-question').classList.add('hidden');
  document.getElementById('quiz-results').classList.remove('hidden');

  const total = currentQuiz.questions.length;
  const score = currentQuiz.score;
  const pct   = Math.round((score / total) * 100);

  document.getElementById('quiz-score-ring').style.borderColor =
    pct >= 80 ? 'var(--success)' : pct >= 60 ? 'var(--warning)' : 'var(--error)';
  document.getElementById('quiz-score-ring').style.background =
    pct >= 80 ? 'var(--success-bg)' : pct >= 60 ? 'var(--warning-bg)' : 'var(--error-bg)';
  const ringColor = pct >= 80 ? 'var(--success)' : pct >= 60 ? 'var(--warning)' : 'var(--error)';
  document.getElementById('quiz-score-ring').style.color = ringColor;
  document.getElementById('quiz-score-text').textContent = `${score}/${total}`;

  document.getElementById('quiz-results-title').textContent =
    pct === 100 ? 'Perfect score! 🎉' : pct >= 80 ? 'Great work! 👏' : pct >= 60 ? 'Good effort!' : 'Keep practicing!';
  document.getElementById('quiz-results-sub').textContent =
    `${score} correct out of ${total} (${pct}%)${currentQuiz.wrong.length ? ' — review the ones below.' : '!'}`;

  const wrongList = document.getElementById('quiz-wrong-list');
  wrongList.innerHTML = '';
  currentQuiz.wrong.forEach(w => {
    const item = document.createElement('div');
    item.className = 'quiz-wrong-item';
    item.innerHTML = `
      <div class="quiz-wrong-q">${escapeHtml(w.question)}</div>
      <div class="quiz-wrong-ans">✓ Correct: ${escapeHtml(w.answer)}</div>
      <div class="quiz-wrong-yours">✗ Your answer: ${escapeHtml(w.yours)}</div>`;
    wrongList.appendChild(item);
  });
}

// ── Sync ──────────────────────────────────────────────────────────────────────
function exportSyncCode() {
  const raw  = localStorage.getItem(STORAGE_KEY) || '{}';
  const code = btoa(unescape(encodeURIComponent(raw)));

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(code)
      .then(() => showToast('Sync code copied! Paste it on your other device.'))
      .catch(() => fallbackCopy(code));
  } else {
    fallbackCopy(code);
  }
}

function fallbackCopy(code) {
  // prompt() works on mobile as a reliable clipboard fallback
  prompt('Copy this sync code and paste it on your other device:', code);
}

function importSyncCode() {
  const code = document.getElementById('sync-input').value.trim();
  if (!code) { showToast('Paste a sync code first.'); return; }

  try {
    const json = decodeURIComponent(escape(atob(code)));
    const data = JSON.parse(json);
    saveProgress(data);
    document.getElementById('import-panel').classList.add('hidden');
    document.getElementById('sync-input').value = '';
    renderDashboard();
    updateContinueBanner();
    updateSessionUI();
    showToast('Progress imported! All caught up.');
  } catch {
    showToast('Invalid sync code — make sure you copied the whole thing.');
  }
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function showToast(message) {
  const existing = document.getElementById('toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.style.cssText = `
    position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
    background:#1d2030; border:1px solid #2a2e45; border-radius:8px;
    padding:10px 20px; color:#e2e8f0; font-size:13px; z-index:999;
    box-shadow:0 4px 24px #00000060; transition:opacity 0.3s;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; }, 2000);
  setTimeout(() => toast.remove(), 2400);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

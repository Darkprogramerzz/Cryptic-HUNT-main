/* ============================================================
   RECORDS DIVISION — MH370 UNSEAL TERMINAL ENGINE
   No browser storage, no server calls. Everything lives in
   memory for the length of the visit; a refresh is a real reset.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- BOOT SEQUENCE ---------- */
  const bootLines = [
    'INITIALIZING RECORDS DIVISION TERMINAL...',
    'AUTHENTICATING CLEARANCE... OK',
    'MOUNTING OCCURRENCE 9M-MRO / MAS370...',
    'LOADING CASE FILE: MALAYSIA AIRLINES FLIGHT 370...',
    'REPLAYING SATELLITE HANDSHAKES... 7 OF 7',
    'STATUS: UNRESOLVED',
    '',
    '> press SKIP or wait to continue_'
  ];

  const bootLinesEl = document.getElementById('boot-lines');
  const bootScreen = document.getElementById('boot-screen');
  const skipBtn = document.getElementById('skip-boot');
  const app = document.getElementById('app');
  let bootTimers = [];
  let booted = false;

  bootLines.forEach((line, i) => {
    bootTimers.push(setTimeout(() => {
      const div = document.createElement('div');
      div.className = 'line';
      div.textContent = line;
      bootLinesEl.appendChild(div);
    }, i * 320));
  });
  bootTimers.push(setTimeout(finishBoot, bootLines.length * 320 + 500));

  function finishBoot() {
    if (booted) return;
    booted = true;
    bootTimers.forEach(clearTimeout);
    bootScreen.hidden = true;
    app.hidden = false;
    printConsoleClue();
  }
  skipBtn.addEventListener('click', finishBoot);

  /* ---------- PROGRESS STATE (memory only) ---------- */
  // Each note owns one arc on the ping monitor.
  const ARC = { comment: 1, console: 2, konami: 3, keyword: 4, selection: 5 };
  const notes = { comment: false, console: false, konami: false, keyword: false, selection: false };
  const clueCountEl = document.getElementById('clue-count');

  function lightArc(key) {
    const arc = document.getElementById('arc-' + ARC[key]);
    arc.classList.remove('pulse');
    void arc.getBoundingClientRect();
    arc.classList.add('lit', 'pulse');
  }

  function markFound(key) {
    if (notes[key]) return;
    notes[key] = true;
    clueCountEl.textContent = String(Object.values(notes).filter(Boolean).length);
    lightArc(key);
  }

  /* ---------- TOAST ---------- */
  const toastEl = document.getElementById('toast');
  let toastTimer = null;
  function toast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3600);
  }

  /* ---------- CLERK'S NOTE 2 — CONSOLE ---------- */
  function printConsoleClue() {
    console.log('%cRECORDS DIVISION — you found the console.',
      'color:#ededed; font-family:monospace; font-size:14px; font-weight:bold;');
    console.log("%cClerk's Note 2 of 5 \u2014 Segment shapes: three letters, four digits, three letters, four digits. The two three-letter tags are already stamped in this file; the two four-digit groups are times. Tag, then time, then tag, then time.",
      'color:#bdbdbd; font-family:monospace; font-size:12px;');
    console.log('%c(If this counts as finding it for you, report it down in the Unseal Terminal.)',
      'color:#8d8d8d; font-family:monospace; font-size:11px; font-style:italic;');
  }

  /* ---------- CLERK'S NOTE 3 — KONAMI ---------- */
  const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
  let konamiBuffer = [];
  const konamiPanel = document.getElementById('konami-panel');

  document.addEventListener('keydown', (e) => {
    konamiBuffer = konamiBuffer.concat(e.code).slice(-KONAMI.length);
    if (konamiBuffer.length === KONAMI.length && konamiBuffer.every((c, i) => c === KONAMI[i])) {
      if (notes.konami) return;
      konamiPanel.hidden = false;
      konamiPanel.innerHTML =
        "<strong>Clerk's Note 3 of 5</strong> \u2014 An old cheat code, still good for something. " +
        "Segments follow the order the signals happened in: the last voice contact goes first (its tag, then its time), " +
        "the last satellite handshake second (its tag, then its time). Don't swap them.";
      markFound('konami');
      toast("Clerk's Note 3 of 5 recovered.");
    }
  });

  /* ---------- CLERK'S NOTE 4 — TYPE "INMARSAT" ---------- */
  const KEYWORD = 'inmarsat';
  let keywordBuffer = '';
  const keywordPanel = document.getElementById('keyword-panel');

  document.addEventListener('keydown', (e) => {
    if (e.key && e.key.length === 1) {
      keywordBuffer = (keywordBuffer + e.key.toLowerCase()).slice(-KEYWORD.length);
      if (keywordBuffer === KEYWORD && !notes.keyword) {
        keywordPanel.hidden = false;
        keywordPanel.innerHTML =
          "<strong>Clerk's Note 4 of 5</strong> \u2014 You named the satellite operator, and something opened. " +
          "A satellite keeps no local time. Convert both times from Malaysia Time to UTC (Malaysia is eight hours ahead), " +
          "and write each as four digits with no colon. Then join everything with hyphens \u2014 uppercase, no spaces.";
        markFound('keyword');
        toast("Clerk's Note 4 of 5 recovered.");
      }
    }
  });

  /* ---------- CLERK'S NOTE 5 — SELECT THE REDACTED LINE ---------- */
  const redactedClue = document.getElementById('redacted-clue');

  function checkRedactedSelection() {
    if (notes.selection || !redactedClue) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
    if (sel.toString().replace(/\s+/g, ' ').includes("Clerk's Note 5")) {
      redactedClue.classList.add('revealed');
      markFound('selection');
      toast("Clerk's Note 5 of 5 recovered.");
    }
  }
  document.addEventListener('mouseup', checkRedactedSelection);
  document.addEventListener('selectionchange', checkRedactedSelection);

  /* ---------- MANUAL REPORTS — Notes 1 & 2 ---------- */
  const reportComment = document.getElementById('report-comment');
  const reportConsole = document.getElementById('report-console');

  function bindReport(btn, key, label, num) {
    btn.addEventListener('click', () => {
      if (notes[key]) return;
      btn.dataset.found = 'true';
      btn.textContent = "Clerk's Note " + num + ' \u2014 logged';
      markFound(key);
      toast("Clerk's Note " + num + ' of 5 logged.');
    });
  }
  bindReport(reportComment, 'comment', 'page source', 1);
  bindReport(reportConsole, 'console', 'console', 2);

  /* ---------- DECOY — INTERCEPTED PING ---------- */
  const decodeBtn = document.getElementById('decode-btn');
  const transmissionOutput = document.getElementById('transmission-output');
  let typeTimer = null;

  decodeBtn.addEventListener('click', () => {
    let decoded;
    try { decoded = atob(decodeBtn.dataset.transmission); }
    catch (err) { decoded = '[CORRUPTED TRANSMISSION \u2014 UNRECOVERABLE]'; }
    clearInterval(typeTimer);
    transmissionOutput.textContent = '';
    let i = 0;
    typeTimer = setInterval(() => {
      transmissionOutput.textContent += decoded[i++];
      if (i >= decoded.length) clearInterval(typeTimer);
    }, 14);
  });

  /* ---------- HINTS ---------- */
  const HINTS = [
    "Every good investigator checks the paper trail before the people. There's more on this page than what's rendered on screen.",
    "Try View Source. Try the console (F12, or right-click \u2192 Inspect). Old cheat codes still open some doors, and so does naming the company that ran the satellite.",
    'The unseal code is two stamps and two times: three letters, four digits \u2014 twice over.',
    'Which stamp goes with each signal, and what time was each one \u2014 on the satellite\'s clock, not the cockpit\'s? Four segments, one hyphen between each, no colons, no spaces.'
  ];
  let hintIndex = 0;
  const hintBtn = document.getElementById('hint-btn');
  const hintText = document.getElementById('hint-text');

  hintBtn.addEventListener('click', () => {
    hintText.textContent = HINTS[hintIndex];
    if (hintIndex < HINTS.length - 1) hintIndex++;
    else hintBtn.textContent = 'No further nudges \u2014 you have everything';
  });

  /* ---------- UNSEAL TERMINAL ----------
     Only the djb2 hash of the code is stored, never the code itself. */
  const TARGET_HASH = 3979774878;

  function djb2(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
      hash = hash >>> 0;
    }
    return hash >>> 0;
  }
  const normalize = (s) => s.trim().replace(/\s+/g, '').toUpperCase();

  const unsealForm = document.getElementById('unseal-form');
  const codeInput = document.getElementById('code-input');
  const unsealBtn = document.getElementById('unseal-btn');
  const unsealResult = document.getElementById('unseal-result');
  let attempts = 0;

  unsealForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const normalized = normalize(codeInput.value);

    if (!normalized) {
      unsealResult.textContent = 'Enter a code first.';
      unsealResult.className = 'fail';
      return;
    }

    if (djb2(normalized) === TARGET_HASH) {
      unsealResult.textContent =
        'ARCHIVE UNSEALED. The signals were real; the aircraft is still unfound. Nice work, Clerk.';
      unsealResult.className = 'ok';
      codeInput.disabled = true;
      unsealBtn.disabled = true;
      toast('Archive unsealed.');
    } else {
      attempts++;
      unsealResult.textContent = `Access denied. That code doesn't match the record. (Attempt ${attempts})`;
      unsealResult.className = 'fail';
      if (attempts === 3) {
        hintText.textContent =
          'Struggling? Every raw piece is already printed under "The Last Signals" \u2014 the only work left is the clock.';
      }
    }
  });

  /* ---------- RESET ---------- */
  document.getElementById('reset-btn').addEventListener('click', () => {
    Object.keys(notes).forEach((k) => {
      notes[k] = false;
      document.getElementById('arc-' + ARC[k]).classList.remove('lit', 'pulse');
    });
    clueCountEl.textContent = '0';

    konamiPanel.hidden = true;
    konamiPanel.innerHTML = '';
    keywordPanel.hidden = true;
    keywordPanel.innerHTML = '';
    redactedClue.classList.remove('revealed');

    reportComment.dataset.found = 'false';
    reportComment.textContent = 'I found the note in the page source';
    reportConsole.dataset.found = 'false';
    reportConsole.textContent = 'I found the note in the console';

    hintIndex = 0;
    hintBtn.textContent = 'Request a nudge';
    hintText.textContent = '';

    codeInput.value = '';
    codeInput.disabled = false;
    unsealBtn.disabled = false;
    unsealResult.textContent = '';
    unsealResult.className = '';
    attempts = 0;

    transmissionOutput.textContent = '';
    konamiBuffer = [];
    keywordBuffer = '';

    toast('Investigation reset.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

})();

/* ============================================================
   LEVEL 4 — SATCOM ANALYST
   Memory only; no storage, no network. Only the djb2 hash of
   the code is stored.
   ============================================================ */
(function () {
  'use strict';

  // Public-record handshake times (UTC) and who started each exchange.
  const SHAKES = [
    { utc: '18:25', myt: '02:25', by: 'Aircraft (log-on request)' },
    { utc: '19:41', myt: '03:41', by: 'Ground station' },
    { utc: '20:41', myt: '04:41', by: 'Ground station' },
    { utc: '21:41', myt: '05:41', by: 'Ground station' },
    { utc: '22:41', myt: '06:41', by: 'Ground station' },
    { utc: '00:10', myt: '08:10', by: 'Ground station' },
    { utc: '00:19', myt: '08:19', by: 'Aircraft (partial log-on)' }
  ];
  const TARGET_HASH = 2088252527;
  const NEXT_PAGE = 'login2.html';   // EDIT ME: where a correct code sends the visitor
  const REDIRECT_DELAY = 2200;       // ms the success message stays on screen

  const $ = (id) => document.getElementById(id);
  const rings = $('rings'), rows = $('rows'), recv = $('recv'), armed = $('armed');
  const dialsEl = $('dials'), send = $('send'), result = $('result');
  const NS = 'http://www.w3.org/2000/svg';

  let received = 0;
  const values = [0, 0, 0, 0];

  /* ---- scope: seven rings, drawn dim until received ---- */
  const ringEls = [], labelEls = [];
  SHAKES.forEach((_, i) => {
    const r = 46 + i * 48;
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', 24); c.setAttribute('cy', 150); c.setAttribute('r', r);
    c.setAttribute('class', 'ring');
    rings.appendChild(c);
    ringEls.push(c);
    const t = document.createElementNS(NS, 'text');
    t.setAttribute('x', 24 + r - 8); t.setAttribute('y', 144);
    t.setAttribute('class', 'lbl');
    t.textContent = String(i + 1);
    rings.appendChild(t);
    labelEls.push(t);
  });

  /* ---- receive handshakes ---- */
  function receiveNext() {
    if (received >= SHAKES.length) return;
    const s = SHAKES[received];
    ringEls[received].classList.add('on');
    labelEls[received].classList.add('on');

    const tr = document.createElement('tr');
    tr.innerHTML = '<td>' + (received + 1) + '</td><td>' + s.utc + '</td>' +
      '<td class="myt"' + (mytShown ? '' : ' hidden') + '>' + s.myt + '</td><td>' + s.by + '</td>';
    rows.appendChild(tr);
    received++;

    if (received < SHAKES.length) {
      recv.textContent = 'Receive handshake ' + (received + 1) + ' of 7';
    } else {
      recv.textContent = 'All 7 received';
      recv.disabled = true;
      armed.textContent = 'Lock armed. Enter the time of the FINAL handshake, as the satellite logged it: four digits.';
      armed.classList.add('ready');
      send.disabled = false;
    }
  }
  recv.addEventListener('click', receiveNext);

  /* ---- malaysia-time column toggle ---- */
  let mytShown = false;
  $('clock').addEventListener('click', () => {
    mytShown = !mytShown;
    document.querySelectorAll('.myt').forEach((el) => { el.hidden = !mytShown; });
    $('clock').textContent = mytShown ? 'Hide Malaysia time column' : 'Show Malaysia time column';
  });

  /* ---- four dials ---- */
  const outs = [];
  [0, 1, 2, 3].forEach((i) => {
    const d = document.createElement('div');
    d.className = 'dial';
    d.innerHTML = '<button type="button" aria-label="Dial ' + (i + 1) + ' up">\u25B2</button>' +
      '<output tabindex="0" aria-label="Dial ' + (i + 1) + '">0</output>' +
      '<button type="button" aria-label="Dial ' + (i + 1) + ' down">\u25BC</button>' +
      '<small>' + (i + 1) + '</small>';
    const [up, down] = d.querySelectorAll('button');
    const out = d.querySelector('output');
    const set = (v) => { values[i] = (v + 10) % 10; out.textContent = String(values[i]); };
    up.addEventListener('click', () => set(values[i] + 1));
    down.addEventListener('click', () => set(values[i] - 1));
    out.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') { e.preventDefault(); set(values[i] + 1); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); set(values[i] - 1); }
      else if (/^[0-9]$/.test(e.key)) { set(Number(e.key)); }
    });
    outs.push(out);
    dialsEl.appendChild(d);
  });

  /* ---- check ---- */
  function djb2(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) { h = ((h << 5) + h) + str.charCodeAt(i); h = h >>> 0; }
    return h >>> 0;
  }

  send.addEventListener('click', () => {
    if (djb2(values.join('')) === TARGET_HASH) {
      result.textContent = 'ACCESS GRANTED. The last signal is the last thing anyone heard. Opening the next file\u2026';
      result.className = 'ok';
      ringEls.forEach((r) => r.classList.add('win'));
      send.disabled = true;
      dialsEl.classList.add('locked');
      setTimeout(() => { window.location.href = NEXT_PAGE; }, REDIRECT_DELAY);
    } else {
      result.textContent = 'ACCESS DENIED.';
      result.className = 'fail';
    }
  });

  /* ---- analyst briefs (escalating) ---- */
  const BRIEFS = [
    'The lock takes one time: the final row of the log. Read it the way the satellite wrote it.',
    'Four digits, no colon. The satellite keeps UTC, so ignore the Malaysia-time column.'
  ];
  let briefIndex = 0;
  $('brief').addEventListener('click', () => {
    $('brief-text').textContent = BRIEFS[briefIndex];
    if (briefIndex < BRIEFS.length - 1) briefIndex++;
    else $('brief').textContent = 'No further briefs';
  });

  /* ---- reset ---- */
  $('reset').addEventListener('click', () => {
    received = 0;
    rows.innerHTML = '';
    ringEls.forEach((r) => r.classList.remove('on', 'win'));
    labelEls.forEach((l) => l.classList.remove('on'));
    recv.textContent = 'Receive handshake 1 of 7';
    recv.disabled = false;
    armed.textContent = 'Receive all seven handshakes to arm the lock.';
    armed.classList.remove('ready');
    send.disabled = true;
    dialsEl.classList.remove('locked');
    values.fill(0);
    outs.forEach((o) => { o.textContent = '0'; });
    result.textContent = '';
    result.className = '';
    $('brief-text').textContent = '';
    $('brief').textContent = 'Analyst brief';
    briefIndex = 0;
  });
})();
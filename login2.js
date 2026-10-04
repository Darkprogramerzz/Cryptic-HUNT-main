/* ============================================================
   RECORDS DIVISION — REQUEST DESK (login for the level in 2.html)
   No storage, no network. Only djb2 hashes of accepted answers
   are kept; the plain answer is never in this file.
   ============================================================ */
(function () {
  'use strict';

  const CONFIG = {
    nextPage: 'Columbia-HCA.html',     // EDIT ME: where a correct slip sends the visitor
    redirectDelay: 2000     // ms the APPROVED stamp stays on screen first
  };

  // Accepted spellings, hashed after stripping everything but letters/digits.
  const ACCEPTED = [3745765437, 193457681, 3382464177];

  function djb2(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) { h = ((h << 5) + h) + str.charCodeAt(i); h = h >>> 0; }
    return h >>> 0;
  }
  const normalize = (s) => s.toUpperCase().replace(/[^A-Z0-9]/g, '');

  const form = document.getElementById('slip-form');
  const input = document.getElementById('slip-input');
  const btn = document.getElementById('slip-btn');
  const result = document.getElementById('slip-result');
  const stamp = document.getElementById('approved');
  let attempts = 0;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const n = normalize(input.value);

    if (!n) {
      result.textContent = 'The slip is blank. Write a name on it.';
      result.className = 'fail';
      return;
    }

    if (ACCEPTED.includes(djb2(n))) {
      result.textContent = 'Slip approved. Retrieving the file\u2026';
      result.className = 'ok';
      input.disabled = true;
      btn.disabled = true;
      stamp.hidden = false;
      void stamp.offsetWidth;
      stamp.classList.add('slam');
      setTimeout(() => { window.location.href = CONFIG.nextPage; }, CONFIG.redirectDelay);
    } else {
      attempts++;
      result.textContent = 'Slip rejected. No file is held under that name. (Attempt ' + attempts + ')';
      result.className = 'fail';
    }
  });

  /* ---- one hint only ---- */
  const hintBtn = document.getElementById('hint-btn');
  const hintText = document.getElementById('hint-text');
  hintBtn.addEventListener('click', () => {
    hintText.textContent = 'It is two names joined by a slash. The second one is only three letters.';
    hintBtn.disabled = true;
    hintBtn.textContent = 'The clerk has said all they will say';
  });
})();

// Where to send the player when loading finishes. Change to your next level file.
const NEXT_PAGE = "aviation-diasater.html";

// Total time the loading screen runs, in milliseconds.
const DURATION = 6500;

// Status lines appear when progress passes each threshold.
const STEPS = [
  { at: 0,  text: "Verifying clearance... OK" },
  { at: 18, text: "Mounting restricted archive..." },
  { at: 38, text: "Retrieving satellite log..." },
  { at: 58, text: "Replaying seven handshakes..." },
  { at: 78, text: "Reconstructing timeline..." },
  { at: 94, text: "Unsealing file..." }
];

const fill = document.getElementById("fill");
const pct = document.getElementById("pct");
const meter = document.getElementById("meter");
const log = document.getElementById("log");
const skip = document.getElementById("skip");
const panel = document.querySelector(".loading");

let shown = 0;
let finished = false;
let start = null;

function addLine(text, cls) {
  const d = document.createElement("div");
  if (cls) d.className = cls;
  d.textContent = text;
  log.appendChild(d);
  if (log.children.length > 1) log.children[log.children.length - 2].classList.add("done");
}

function go() {
  window.location.href = NEXT_PAGE;
}

function finish() {
  if (finished) return;
  finished = true;
  fill.style.width = "100%";
  pct.textContent = "100%";
  meter.setAttribute("aria-valuenow", "100");
  panel.setAttribute("aria-busy", "false");
  skip.disabled = true;
  addLine("FILE READY. Opening...", "final");
  setTimeout(go, 900);
}

function frame(now) {
  if (finished) return;
  if (start === null) start = now;
  const t = Math.min((now - start) / DURATION, 1);
  // ease in-out with a slight stall in the middle, so it feels like real work
  const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const p = Math.floor(eased * 100);

  fill.style.width = p + "%";
  pct.textContent = p + "%";
  meter.setAttribute("aria-valuenow", String(p));

  while (shown < STEPS.length && p >= STEPS[shown].at) {
    addLine(STEPS[shown].text);
    shown++;
  }

  if (t >= 1) finish();
  else requestAnimationFrame(frame);
}

skip.addEventListener("click", go);
requestAnimationFrame(frame);

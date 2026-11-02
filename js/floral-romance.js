/**
 * ═══════════════════════════════════════════════════════
 * FLORAL ROMANCE — floral-romance.js
 * Continuous Falling Petals & Click/Tap Flower Bursts
 * Shanmugasundaram × Srimathi | 16 November 2026
 * ═══════════════════════════════════════════════════════
 */

'use strict';

(function FloralRomance() {

  /* ── Reduced-motion guard ─────────────────────────── */
  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reducedMotion = mq.matches;
  mq.addEventListener('change', function (e) {
    reducedMotion = e.matches;
    if (reducedMotion) { destroyFalling(); } else { buildFalling(); }
  });

  /* ── SVG gradient defs (injected once into <body>) ── */
  var DEFS_ID = 'fr-svg-defs';
  var DEFS_SVG = '<svg id="' + DEFS_ID + '" class="floral-svg-defs" aria-hidden="true">' +
    '<defs>' +
      /* Blush rose */
      '<linearGradient id="fr-rg" x1="0%" y1="0%" x2="100%" y2="100%">' +
        '<stop offset="0%"   stop-color="#FFF2F4"/>' +
        '<stop offset="42%"  stop-color="#F8C8D2"/>' +
        '<stop offset="100%" stop-color="#E07090"/>' +
      '</linearGradient>' +
      /* Rose inner highlight */
      '<linearGradient id="fr-rh" x1="20%" y1="0%" x2="50%" y2="80%">' +
        '<stop offset="0%"   stop-color="#FFFFFF" stop-opacity="0.82"/>' +
        '<stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>' +
      '</linearGradient>' +
      /* Ivory */
      '<linearGradient id="fr-iv" x1="0%" y1="0%" x2="100%" y2="100%">' +
        '<stop offset="0%"   stop-color="#FFFFFF"/>' +
        '<stop offset="60%"  stop-color="#FCF9F3"/>' +
        '<stop offset="100%" stop-color="#F0E4D4"/>' +
      '</linearGradient>' +
      /* Gold edge */
      '<linearGradient id="fr-ge" x1="0%" y1="0%" x2="100%" y2="100%">' +
        '<stop offset="0%"   stop-color="#E8CA76"/>' +
        '<stop offset="100%" stop-color="#B88A2D"/>' +
      '</linearGradient>' +
      /* Blossom radial */
      '<radialGradient id="fr-bl" cx="45%" cy="45%" r="55%">' +
        '<stop offset="0%"   stop-color="#FFF5F7"/>' +
        '<stop offset="60%"  stop-color="#F8CCD5"/>' +
        '<stop offset="100%" stop-color="#E892A5"/>' +
      '</radialGradient>' +
      /* Flutter */
      '<linearGradient id="fr-fl" x1="0%" y1="0%" x2="100%" y2="100%">' +
        '<stop offset="0%"   stop-color="#FFF4F6"/>' +
        '<stop offset="50%"  stop-color="#F5C0CB"/>' +
        '<stop offset="100%" stop-color="#D86E85"/>' +
      '</linearGradient>' +
      /* Gold petal */
      '<linearGradient id="fr-gp" x1="0%" y1="0%" x2="100%" y2="100%">' +
        '<stop offset="0%"   stop-color="#FFFDF7"/>' +
        '<stop offset="50%"  stop-color="#F4E5BE"/>' +
        '<stop offset="100%" stop-color="#D4AF37"/>' +
      '</linearGradient>' +
    '</defs>' +
  '</svg>';

  /* ── Five petal / blossom SVG templates ─────────────
     All reference global gradient IDs from DEFS_SVG.
     viewBox is consistent so CSS width/height scales them. */
  var PETALS = [
    /* 0 — Soft blush rose petal */
    '<svg class="fp-svg" viewBox="0 0 32 36" aria-hidden="true">' +
      '<path d="M16 3C25 3 30 11 30 20 30 28 22 34 16 35 10 34 2 28 2 20 2 11 7 3 16 3Z" fill="url(#fr-rg)"/>' +
      '<path d="M16 6C22 6 26 12 26 19 26 25 20 29 16 31 12 29 6 25 6 19 6 12 10 6 16 6Z" fill="url(#fr-rh)" opacity=".58"/>' +
      '<path d="M14 8C18 8 21 13 20 18 19 22 16 26 14 27" stroke="#D47388" stroke-width=".75" stroke-linecap="round" fill="none" opacity=".35"/>' +
    '</svg>',

    /* 1 — Warm ivory petal with gold rim */
    '<svg class="fp-svg" viewBox="0 0 30 36" aria-hidden="true">' +
      '<path d="M15 2C23 2 28 10 28 19 28 27 21 33 15 34 9 33 2 27 2 19 2 10 7 2 15 2Z" fill="url(#fr-iv)"/>' +
      '<path d="M15 2C23 2 28 10 28 19 28 27 21 33 15 34 9 33 2 27 2 19 2 10 7 2 15 2Z" stroke="url(#fr-ge)" stroke-width=".8" fill="none" opacity=".48"/>' +
      '<path d="M15 6C17 12 17 22 15 28" stroke="url(#fr-ge)" stroke-width=".65" stroke-dasharray="1 2.5" stroke-linecap="round" fill="none" opacity=".32"/>' +
    '</svg>',

    /* 2 — Mini 5-petal jasmine blossom */
    '<svg class="fp-svg" viewBox="0 0 36 36" aria-hidden="true">' +
      '<g transform="translate(18,18)">' +
        '<circle cx="0"    cy="-8"  r="6.4" fill="url(#fr-bl)"/>' +
        '<circle cx="7.6"  cy="-2.5" r="6.4" fill="url(#fr-bl)"/>' +
        '<circle cx="4.7"  cy="6.5" r="6.4" fill="url(#fr-bl)"/>' +
        '<circle cx="-4.7" cy="6.5" r="6.4" fill="url(#fr-bl)"/>' +
        '<circle cx="-7.6" cy="-2.5" r="6.4" fill="url(#fr-bl)"/>' +
        '<circle cx="0"    cy="0"   r="3.5" fill="#D4AF37"/>' +
        '<circle cx="0"    cy="0"   r="1.9" fill="#FFF2B2"/>' +
      '</g>' +
    '</svg>',

    /* 3 — Fluttering side-profile petal */
    '<svg class="fp-svg" viewBox="0 0 26 36" aria-hidden="true">' +
      '<path d="M13 2C20 7 24 16 22 24 20 31 12 34 8 32 4 30 2 24 3 16 4 9 8 3 13 2Z" fill="url(#fr-fl)"/>' +
      '<path d="M13 4C18 9 20 17 18 23 16 28 11 30 8 28" stroke="#D47388" stroke-width=".75" fill="none" opacity=".4"/>' +
    '</svg>',

    /* 4 — Champagne gold accent petal */
    '<svg class="fp-svg" viewBox="0 0 28 34" aria-hidden="true">' +
      '<path d="M14 2C21 3 26 11 25 19 24 26 18 31 14 32 10 31 4 26 3 19 2 11 7 3 14 2Z" fill="url(#fr-gp)" opacity=".92"/>' +
      '<path d="M14 5C18 5 21 11 20 17 19 22 16 26 14 27" fill="url(#fr-rh)" opacity=".55"/>' +
    '</svg>'
  ];

  function randPetal() {
    return PETALS[Math.floor(Math.random() * PETALS.length)];
  }

  /* ── Utility ────────────────────────────────────────  */
  function rnd(min, max) { return min + Math.random() * (max - min); }
  function rndInt(min, max) { return Math.floor(rnd(min, max + 1)); }
  function px(n) { return n.toFixed(1) + 'px'; }
  function pct(n) { return n.toFixed(2) + '%'; }
  function sec(n) { return n.toFixed(2) + 's'; }

  /* ── SVG defs injection ────────────────────────────  */
  function ensureDefs() {
    if (!document.getElementById(DEFS_ID)) {
      document.body.insertAdjacentHTML('afterbegin', DEFS_SVG);
    }
  }

  /* ════════════════════════════════════════════════════
     CONTINUOUS FALLING PETALS
     ════════════════════════════════════════════════════ */
  var fallingLayer = null;

  function petalCount() {
    return window.innerWidth <= 680 ? 14 : 24;
  }

  function buildFalling() {
    if (reducedMotion) return;
    ensureDefs();

    /* Reuse existing layer or create new one */
    if (!fallingLayer) {
      fallingLayer = document.createElement('div');
      fallingLayer.className = 'floral-falling-layer';
      fallingLayer.setAttribute('aria-hidden', 'true');
      document.body.appendChild(fallingLayer);
    } else {
      fallingLayer.innerHTML = '';
    }

    var n = petalCount();

    for (var i = 0; i < n; i++) {
      /* Even horizontal spread with organic jitter */
      var baseLeft = (i / n) * 100;
      var jitter   = (Math.random() - 0.5) * (100 / n) * 0.85;
      var left     = Math.max(0.5, Math.min(99.5, baseLeft + jitter));

      var fd  = rnd(8.5, 14.2);   /* fall duration  */
      var sd  = rnd(2.9, 4.8);    /* sway duration  */
      var del = -rnd(0.5, fd);    /* negative delay = already mid-fall on load */
      var sx  = rnd(22, 54);      /* sway amplitude */
      var sz  = rnd(17, 29);      /* petal size px  */
      var sc  = rnd(0.76, 1.18);  /* 3-D scale factor */
      var r0  = rnd(-45, 45);     /* start rotation */
      var r1  = rnd(220, 520);    /* end rotation   */
      var op  = rnd(0.52, 0.88);  /* opacity        */

      var wrap = document.createElement('div');
      wrap.className = 'fp-wrap';
      wrap.style.setProperty('--left', pct(left));
      wrap.style.setProperty('--fd',   sec(fd));
      wrap.style.setProperty('--sd',   sec(sd));
      wrap.style.setProperty('--del',  sec(del));
      wrap.style.setProperty('--sx',   px(sx));
      wrap.style.setProperty('--sz',   px(sz));
      wrap.style.setProperty('--sc',   sc.toFixed(2));
      wrap.style.setProperty('--r0',   r0.toFixed(1) + 'deg');
      wrap.style.setProperty('--r1',   r1.toFixed(1) + 'deg');
      wrap.style.setProperty('--op',   op.toFixed(2));

      wrap.innerHTML =
        '<div class="fp-sway">' +
          '<div class="fp-tumble">' +
            randPetal() +
          '</div>' +
        '</div>';

      fallingLayer.appendChild(wrap);
    }
  }

  function destroyFalling() {
    if (fallingLayer) {
      fallingLayer.innerHTML = '';
    }
  }

  /* ════════════════════════════════════════════════════
     CLICK / TAP BURST
     ════════════════════════════════════════════════════ */
  var burstLayer = null;
  var lastBurst  = 0;
  var THROTTLE   = 120;  /* ms between bursts           */
  var MAX_BURSTS = 4;    /* max simultaneous origins    */

  function ensureBurstLayer() {
    if (!burstLayer || !burstLayer.parentNode) {
      burstLayer = document.createElement('div');
      burstLayer.className = 'floral-burst-layer';
      burstLayer.setAttribute('aria-hidden', 'true');
      document.body.appendChild(burstLayer);
    }
  }

  function spawnBurst(cx, cy) {
    if (reducedMotion) return;
    ensureBurstLayer();

    /* Drop oldest origin if cap reached */
    if (burstLayer.children.length >= MAX_BURSTS) {
      var oldest = burstLayer.firstElementChild;
      if (oldest) oldest.remove();
    }

    var origin = document.createElement('div');
    origin.className = 'fb-origin';
    origin.style.left = cx + 'px';
    origin.style.top  = cy + 'px';

    var count    = rndInt(10, 14);
    var maxEndMs = 0;

    for (var i = 0; i < count; i++) {
      var angle  = (i / count) * 2 * Math.PI + rnd(-0.4, 0.4);
      var dist   = rnd(42, 105);
      var tx     = Math.cos(angle) * dist;
      var ty     = Math.sin(angle) * dist + rnd(16, 28); /* slight gravity */
      var mx     = tx * 0.55;
      var my     = ty * 0.44 - rnd(10, 18);              /* initial arc up */
      var rot    = rnd(-220, 220);
      var sc     = rnd(0.55, 1.0);
      var sz     = rndInt(17, 27);
      var bd     = rndInt(740, 1000);
      var bdel   = rndInt(0, 55);

      if (bd + bdel > maxEndMs) maxEndMs = bd + bdel;

      var p = document.createElement('div');
      p.className = 'fb-particle';
      p.style.setProperty('--tx',   px(tx));
      p.style.setProperty('--ty',   px(ty));
      p.style.setProperty('--mx',   px(mx));
      p.style.setProperty('--my',   px(my));
      p.style.setProperty('--rot',  rot.toFixed(1) + 'deg');
      p.style.setProperty('--sc',   sc.toFixed(2));
      p.style.setProperty('--sz',   sz + 'px');
      p.style.setProperty('--bd',   bd + 'ms');
      p.style.setProperty('--bdel', bdel + 'ms');
      p.innerHTML = randPetal();

      origin.appendChild(p);
    }

    burstLayer.appendChild(origin);

    /* Guaranteed cleanup: safety timer */
    var timer = setTimeout(function () {
      if (origin.parentNode) origin.remove();
    }, maxEndMs + 120);

    /* Early cleanup when last particle finishes */
    origin.addEventListener('animationend', function (e) {
      if (e.target === origin.lastElementChild) {
        clearTimeout(timer);
        if (origin.parentNode) origin.remove();
      }
    }, { passive: true });
  }

  /* ── Click handler ─────────────────────────────────  */
  function onDocClick(e) {
    if (reducedMotion) return;

    /* Throttle */
    var now = Date.now();
    if (now - lastBurst < THROTTLE) return;

    /* Skip if user was selecting text */
    var sel = window.getSelection();
    if (sel && sel.toString().trim().length > 0) return;

    /* Skip inside form controls */
    if (e.target && e.target.closest('input,textarea,select,[contenteditable]')) return;

    /* Skip inside the theme studio panel */
    if (e.target && e.target.closest('#theme-panel')) return;

    /* Extract coordinates */
    var cx = e.clientX;
    var cy = e.clientY;

    /* Keyboard-triggered click (Enter/Space) → skip (0,0 coords) */
    if (cx === 0 && cy === 0) return;

    lastBurst = now;
    spawnBurst(cx, cy);
  }

  window.addEventListener('click', onDocClick, { passive: true });

  /* ── Tab visibility: pause to save CPU/battery ─────  */
  document.addEventListener('visibilitychange', function () {
    document.documentElement.classList.toggle('fr-paused', document.hidden);
  }, { passive: true });

  /* ── Responsive rebuild on breakpoint crossing ─────  */
  var wasMobile = window.innerWidth <= 680;
  var resizeTmr = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTmr);
    resizeTmr = setTimeout(function () {
      var isMobile = window.innerWidth <= 680;
      if (isMobile !== wasMobile) {
        wasMobile = isMobile;
        buildFalling();
      }
    }, 250);
  }, { passive: true });

  /* ── Initialise ─────────────────────────────────────  */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildFalling, { once: true });
  } else {
    buildFalling();
  }

})();


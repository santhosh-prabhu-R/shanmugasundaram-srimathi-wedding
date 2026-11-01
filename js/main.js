/**
 * =====================================================
 * TAMIL WEDDING INVITATION — main.js
 * Shanmugasundaram × Srimathi | 16 November 2026
 * =====================================================
 *
 * Modules:
 *  1. Reduced-motion guard
 *  2. Scroll-reveal (IntersectionObserver)
 *  3. Language toggle (EN / Tamil)
 *  4. Countdown timer (IST – Asia/Kolkata)
 *  5. Shared guest wishes (Google Apps Script)
 *  6. Add to Calendar (ICS download)
 */

'use strict';

/* ── 1. REDUCED MOTION GUARD ────────────────────── */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── 2. SCROLL REVEAL ──────────────────────────── */
(function initReveal() {
  if (prefersReducedMotion) {
    document.querySelectorAll('.reveal-up').forEach(el => {
      el.classList.add('visible');
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));
})();

/* ── 3. LANGUAGE TOGGLE ────────────────────────── */
(function initLang() {
  const langToggle  = document.getElementById('lang-toggle');
  const htmlEl      = document.documentElement;
  const langSpan    = langToggle ? langToggle.querySelector('span') : null;

  if (!langToggle) return;

  let currentLang = localStorage.getItem('weddingLang') || 'en';
  applyLanguage(currentLang);

  langToggle.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'ta' : 'en';
    applyLanguage(currentLang);
    localStorage.setItem('weddingLang', currentLang);
  });

  function applyLanguage(lang) {
    htmlEl.setAttribute('data-lang', lang);
    htmlEl.setAttribute('lang', lang === 'ta' ? 'ta' : 'en');

    const isTA = lang === 'ta';

    // Update toggle button label
    if (langSpan) {
      langSpan.textContent = isTA ? 'English' : 'தமிழ்';
    }
    langToggle.setAttribute('aria-pressed', isTA.toString());
    langToggle.setAttribute('aria-label', isTA ? 'Switch language to English' : 'Switch language to Tamil');

    // Swap all [data-en] / [data-ta] elements
    document.querySelectorAll('[data-en][data-ta]').forEach(el => {
      const text = isTA ? el.getAttribute('data-ta') : el.getAttribute('data-en');
      if (text) el.textContent = text;
    });

    // Swap placeholder text
    document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(el => {
      if (isTA) {
        if (!el.dataset.placeholderOrig) el.dataset.placeholderOrig = el.placeholder;
        const taMap = {
          'Enter your name':                          'உங்கள் பெயரை உள்ளிடுங்கள்',
          'Write your wishes for the couple...':      'தம்பதியினருக்கு உங்கள் வாழ்த்துக்களை எழுதுங்கள்...'
        };
        el.placeholder = taMap[el.dataset.placeholderOrig] || el.placeholder;
      } else {
        if (el.dataset.placeholderOrig) el.placeholder = el.dataset.placeholderOrig;
      }
    });

    if (window.updateWishesLanguage) window.updateWishesLanguage();
  }
})();

/* ── 4. COUNTDOWN TIMER ────────────────────────── */
(function initCountdown() {
  // Wedding Reception: 16 November 2026, 11:00 AM IST
  // Target = start of reception
  const TARGET_ISO = '2026-11-16T11:00:00+05:30';
  const targetTime = new Date(TARGET_ISO).getTime();

  const daysEl    = document.getElementById('cd-days');
  const hoursEl   = document.getElementById('cd-hours');
  const minsEl    = document.getElementById('cd-minutes');
  const secsEl    = document.getElementById('cd-seconds');
  const displayEl = document.getElementById('countdown-display');
  const postEl    = document.getElementById('countdown-post');
  const labelEl   = document.querySelector('.countdown-event-label');

  if (!daysEl) return;

  let prevValues = { d: null, h: null, m: null, s: null };

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick(el, newVal, key) {
    if (prevValues[key] !== newVal) {
      el.textContent = pad(newVal);
      if (!prefersReducedMotion) {
        el.classList.remove('tick');
        void el.offsetWidth; // reflow
        el.classList.add('tick');
      }
      prevValues[key] = newVal;
    }
  }

  function update() {
    const now  = Date.now();
    const diff = targetTime - now;

    if (diff <= 0) {
      // Event has started / passed
      if (displayEl) displayEl.style.display = 'none';
      if (labelEl)   labelEl.style.display   = 'none';
      if (postEl) {
        postEl.style.display = 'block';
        // Apply current language
        const lang = document.documentElement.getAttribute('data-lang') || 'en';
        postEl.textContent = lang === 'ta'
          ? postEl.getAttribute('data-ta')
          : postEl.getAttribute('data-en');
      }
      return;
    }

    const totalSecs = Math.floor(diff / 1000);
    const s = totalSecs % 60;
    const totalMins = Math.floor(totalSecs / 60);
    const m = totalMins % 60;
    const totalHrs = Math.floor(totalMins / 60);
    const h = totalHrs % 24;
    const d = Math.floor(totalHrs / 24);

    tick(daysEl,  d, 'd');
    tick(hoursEl, h, 'h');
    tick(minsEl,  m, 'm');
    tick(secsEl,  s, 's');
  }

  update();
  setInterval(update, 1000);
})();

/* ── 5. SHARED WISHES (Google Apps Script) ─────── */
(function initWishes() {
  const form     = document.getElementById('wishes-form');
  const display  = document.getElementById('wishes-display');
  const status   = document.getElementById('wishes-status');
  const submit   = document.getElementById('wishes-submit');
  const loadMore = document.getElementById('wishes-load-more');

  if (!form || !display || !status || !submit) return;

  const config   = window.WEDDING_CONFIG || {};
  const pageSize = 20;
  let loading    = false;
  let submitting = false;
  let currentStatus = null;
  let allWishes  = [];   // full list from server
  let visibleCount = 0;  // how many are currently rendered

  /**
   * Validate the Apps Script Web App URL.
   */
  function getEndpoint() {
    const url = config.appsScriptUrl;
    if (!url || typeof url !== 'string') return null;
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:') return null;
      if (!parsed.hostname.endsWith('script.google.com') &&
          !parsed.hostname.endsWith('script.googleusercontent.com') &&
          !parsed.hostname.endsWith('googleusercontent.com')) return null;
      return url;
    } catch (err) {
      console.error('Invalid Apps Script URL.', err);
      return null;
    }
  }

  const endpoint = getEndpoint();

  function localized(en, ta) {
    return document.documentElement.getAttribute('data-lang') === 'ta' ? ta : en;
  }

  function setStatus(en, ta, isError) {
    currentStatus = { en, ta, isError: Boolean(isError) };
    status.textContent = localized(currentStatus.en, currentStatus.ta);
    status.classList.toggle('is-error', currentStatus.isError);
  }

  window.updateWishesLanguage = () => {
    if (currentStatus) status.textContent = localized(currentStatus.en, currentStatus.ta);
  };

  /**
   * Format an ISO date string to a human-readable form.
   */
  function formatDate(isoStr) {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
    } catch (e) {
      return '';
    }
  }

  /**
   * Load all wishes from the Google Apps Script backend.
   */
  async function loadWishes() {
    if (loading || !endpoint) return;
    loading = true;
    if (loadMore) loadMore.disabled = true;

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        redirect: 'follow'
      });
      if (!response.ok) throw new Error('Wish list request failed (' + response.status + ').');

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Server returned an error.');
      if (!Array.isArray(data.wishes)) throw new Error('Invalid response format.');

      allWishes = data.wishes;
      visibleCount = Math.min(pageSize, allWishes.length);
      renderWishes();

      if (loadMore) {
        loadMore.hidden = visibleCount >= allWishes.length;
        loadMore.disabled = false;
      }

      setStatus(
        allWishes.length
          ? 'Your wishes are shared with the couple and their families.'
          : 'No wishes yet — be the first to send your blessings.',
        allWishes.length
          ? 'உங்கள் வாழ்த்துகள் தம்பதியினருடனும் குடும்பத்தினருடனும் பகிரப்படும்.'
          : 'இன்னும் வாழ்த்துகள் இல்லை — முதலில் உங்கள் வாழ்த்துகளைப் பகிருங்கள்.',
        false
      );
    } catch (error) {
      console.error('Unable to load guest wishes.', error);
      setStatus(
        'Guest wishes could not be loaded. Please refresh the page to try again.',
        'வாழ்த்துகளை ஏற்ற முடியவில்லை. மீண்டும் முயற்சிக்கப் பக்கத்தைப் புதுப்பிக்கவும்.',
        true
      );
      if (loadMore) loadMore.hidden = true;
    } finally {
      loading = false;
      submit.disabled = false;
    }
  }

  /**
   * Show more wishes (client-side pagination).
   */
  function showMore() {
    visibleCount = Math.min(visibleCount + pageSize, allWishes.length);
    renderWishes();
    if (loadMore) loadMore.hidden = visibleCount >= allWishes.length;
  }

  if (loadMore) loadMore.addEventListener('click', showMore);

  /* ── Guard: endpoint not configured ── */
  if (!endpoint) {
    setStatus(
      'Guest wishes are not available yet. Please check back soon.',
      'விருந்தினர் வாழ்த்துகள் விரைவில் கிடைக்கும். மீண்டும் பார்க்கவும்.',
      true
    );
    submit.disabled = true;
    return;
  }

  /* ── Initial load ── */
  loadWishes();

  /* ── Form submission ── */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (loading || submitting) return;

    const nameEl = document.getElementById('wish-name');
    const msgEl  = document.getElementById('wish-message');
    const name    = nameEl.value.trim();
    const message = msgEl.value.trim();

    if (!name || !message || name.length > 80 || message.length > 1000) {
      setStatus(
        'Please enter a name (up to 80 characters) and message (up to 1,000 characters).',
        'பெயரை (அதிகபட்சம் 80 எழுத்துகள்) மற்றும் செய்தியை (அதிகபட்சம் 1,000 எழுத்துகள்) உள்ளிடவும்.',
        true
      );
      return;
    }

    submitting = true;
    submit.disabled = true;
    setStatus('Sending your wishes…', 'உங்கள் வாழ்த்துகள் அனுப்பப்படுகின்றன…', false);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ name, message })
      });
      if (!response.ok) throw new Error('Wish submission failed (' + response.status + ').');

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Server returned an error.');
      if (!data.wish) throw new Error('The saved wish was not returned.');

      // Prepend the new wish and re-render
      allWishes.unshift(data.wish);
      visibleCount = Math.min(visibleCount + 1, allWishes.length);
      renderWishes();
      if (loadMore && allWishes.length > visibleCount) loadMore.hidden = false;

      form.reset();
      setStatus(
        'Thank you — your wishes have been saved and shared.',
        'நன்றி — உங்கள் வாழ்த்துகள் சேமிக்கப்பட்டு பகிரப்பட்டன.',
        false
      );
    } catch (error) {
      console.error('Unable to save guest wish.', error);
      setStatus(
        'Your wish could not be saved. Please try again in a moment.',
        'உங்கள் வாழ்த்தைச் சேமிக்க முடியவில்லை. சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.',
        true
      );
    } finally {
      submitting = false;
      submit.disabled = false;
    }
  });

  /**
   * Render wish cards (XSS-safe via textContent).
   */
  function renderWishes() {
    display.replaceChildren();
    const visible = allWishes.slice(0, visibleCount);
    visible.forEach((wish) => {
      const card = document.createElement('article');
      card.className = 'wish-card';

      const guestName = document.createElement('p');
      guestName.className = 'wish-name';
      guestName.textContent = wish.name;

      const msg = document.createElement('p');
      msg.className = 'wish-text';
      msg.textContent = '\u201C' + wish.message + '\u201D';

      card.append(guestName, msg);

      const dateStr = formatDate(wish.created_at);
      if (dateStr) {
        const dateEl = document.createElement('time');
        dateEl.className = 'wish-date';
        dateEl.setAttribute('datetime', wish.created_at);
        dateEl.textContent = dateStr;
        card.appendChild(dateEl);
      }

      display.appendChild(card);
    });
  }
})();

/* ── 6. ADD TO CALENDAR (Google Calendar) ───────── */
function addToCalendar() {
  // Google Calendar event creation URL
  // Event: 16 Nov 2026, 11:00 AM – 3:00 PM IST (Asia/Kolkata)
  var eventTitle = 'N. Shanmugasundaram \u2665 R. Srimathi \u2013 Wedding Reception';
  var startDate  = '20261116T110000';
  var endDate    = '20261116T150000';
  var location   = 'Kongu Mahal, Chengapalli Road, Kunnathur';
  var details    = 'You are cordially invited to the Wedding Reception of N. Shanmugasundaram & R. Srimathi.'
    + ' Please join us with your family and friends.'
    + '\n\nDate: Monday, 16 November 2026'
    + '\nTime: 11:00 AM \u2013 3:00 PM'
    + '\nVenue: Kongu Mahal, Chengapalli Road, Kunnathur'
    + '\n\n\u23F0 Reminder tip: After saving, open the event and set a reminder for 2 hours before (9:00 AM).';
  var timezone   = 'Asia/Kolkata';

  var url = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
    + '&text='     + encodeURIComponent(eventTitle)
    + '&dates='    + encodeURIComponent(startDate) + '%2F' + encodeURIComponent(endDate)
    + '&location=' + encodeURIComponent(location)
    + '&details='  + encodeURIComponent(details)
    + '&ctz='      + encodeURIComponent(timezone);

  window.open(url, '_blank', 'noopener,noreferrer');
}

/* ── 7. DOM READY ───────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('#hero .reveal-up').forEach(el => el.classList.add('visible'));

  // ── Footer WhatsApp share button ─────────────────
  var waBtn = document.getElementById('footer-whatsapp-btn');
  if (waBtn) {
    var waMessage = 'After years of debugging life, we have finally decided to deploy Marriage v1.0! \u2764\uFE0F\n\n'
      + 'N. Shanmugasundaram & R. Srimathi cordially invite you!\n\n'
      + '\uD83D\uDCC5 16 November 2026 \u2013 Wedding Reception\n'
      + '\u23F0 11:00 AM \u2013 03:00 PM\n\n'
      + 'The countdown is over. The big day is here! \uD83D\uDC8D\n'
      + 'One lifetime commitment. Unlimited memories.\n'
      + 'Let\u2019s celebrate this beautiful new beginning!\n\n'
      + '\uD83D\uDCCD Venue: Kongu Mahal, Chengapalli Road, Kunnathur.\n\n'
      + 'Don\u2019t miss this live event\u2014there won\u2019t be a replay!\n\n'
      + 'See you there! \u2764\uFE0F\n\n'
      + '\uD83D\uDD17 ' + window.location.href;
    waBtn.href = 'https://wa.me/?text=' + encodeURIComponent(waMessage);
  }

  // Remove loading state after fonts are ready
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      document.body.classList.add('fonts-loaded');
    });
  }
});

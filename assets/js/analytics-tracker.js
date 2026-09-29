(function () {
  'use strict';

  // ── Konfiguration ─────────────────────────────────────────────────────────
  // Fürst Analytics – selbstgehostetes Backend (Docker) über Cloudflare Tunnel.
  var API = 'https://analytics.fuerst-software.com'; // -> Server Port 3099
  var SITE = 'loegl.at';

  // Wird nur nach Cookie-Zustimmung geladen (Einbindung in main.js -> applyConsent).
  // Admin-Dashboard nicht tracken (main.js ist dort ohnehin nicht eingebunden).
  if (window.location.pathname.indexOf('/admin') !== -1) return;

  // ── IDs ───────────────────────────────────────────────────────────────────
  function uid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  var visitorId = localStorage.getItem('_fst_vid');
  if (!visitorId) { visitorId = uid(); localStorage.setItem('_fst_vid', visitorId); }

  var sessionId = sessionStorage.getItem('_fst_sid');
  if (!sessionId) { sessionId = uid(); sessionStorage.setItem('_fst_sid', sessionId); }

  var sessionStart = parseInt(sessionStorage.getItem('_fst_start') || '0') || Date.now();
  sessionStorage.setItem('_fst_start', sessionStart);

  // ── Hilfsfunktionen ───────────────────────────────────────────────────────
  function getDevice() {
    var ua = navigator.userAgent;
    if (/Mobi|Android/i.test(ua)) return 'mobile';
    if (/Tablet|iPad/i.test(ua)) return 'tablet';
    return 'desktop';
  }

  function send(endpoint, data) {
    try {
      fetch(API + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true
      }).catch(function () {});
    } catch (e) { /* silent fail */ }
  }

  // ── Pageview tracken ──────────────────────────────────────────────────────
  send('/api/track/pageview', {
    visitor_id: visitorId,
    session_id: sessionId,
    site: SITE,
    page: window.location.pathname || '/',
    referrer: document.referrer || '',
    device: getDevice(),
    screen_w: screen.width,
    screen_h: screen.height
  });

  // ── Session-Ende tracken ──────────────────────────────────────────────────
  function sendSessionEnd() {
    var duration = Date.now() - sessionStart;
    send('/api/track/session-end', {
      session_id: sessionId,
      duration: duration
    });
  }

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') sendSessionEnd();
  });
  window.addEventListener('pagehide', sendSessionEnd);

  // ── Klick-Tracking ────────────────────────────────────────────────────────
  document.addEventListener('click', function (e) {
    var el = e.target;
    var depth = 0;
    while (el && el !== document.body && depth < 5) {
      var t = el.tagName ? el.tagName.toLowerCase() : '';
      if (t === 'a' || t === 'button' || el.onclick ||
          (el.getAttribute && el.getAttribute('role') === 'button')) break;
      el = el.parentElement;
      depth++;
    }
    if (!el || el === document.body) el = e.target;

    var rect = document.documentElement;
    var xPct = Math.round((e.pageX / rect.scrollWidth) * 10000) / 100;
    var yPct = Math.round((e.pageY / rect.scrollHeight) * 10000) / 100;

    var tag = el.tagName ? el.tagName.toLowerCase() : 'unknown';
    var text = (el.innerText || el.textContent || el.alt || el.title || '').trim().substring(0, 80);
    var href = el.href || (el.getAttribute && el.getAttribute('href')) || '';
    var elId = el.id || '';
    var elClass = el.className && typeof el.className === 'string' ? el.className.split(' ').filter(Boolean).slice(0, 3).join(' ') : '';

    send('/api/track/click', {
      visitor_id: visitorId,
      session_id: sessionId,
      site: SITE,
      page: window.location.pathname || '/',
      element_tag: tag,
      element_id: elId,
      element_class: elClass,
      element_text: text,
      href: href,
      x_pct: xPct,
      y_pct: yPct
    });
  }, { passive: true });

})();

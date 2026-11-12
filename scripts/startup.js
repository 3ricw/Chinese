/* Runs inline before stylesheets. The old app-ready flag is intentionally
   separate: it predates the final UI modules and cannot mean boot complete. */
(function () {
  'use strict';
  var root = document.documentElement, phase = 'pending', slow = false;
  var params = new URLSearchParams(location.search || '');
  var small = window.innerWidth <= 260 && window.innerHeight <= 520;
  var coarse = window.matchMedia && matchMedia('(pointer: coarse)').matches;
  if (/^https?:$/.test(location.protocol) && params.get('full') !== '1' &&
      (params.get('watch') === '1' || /watch/i.test(navigator.userAgent || '') || (small && coarse))) {
    var watchURL = new URL('watch/', location.href);
    if (params.get('q')) watchURL.searchParams.set('q', params.get('q').slice(0,80));
    location.replace(watchURL.href);
  }
  root.setAttribute('data-app-boot', 'pending');
  try {
    var settings = JSON.parse(localStorage.getItem('hanzi-reading-room-v2') || '{}').settings || {};
    var dark = settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) || !settings.theme;
    var colors = {jade:['#F0F6F2','#070E0A'],sky:['#EFF6F7','#050E10'],blue:['#F1F5FB','#080C13'],lavender:['#F5F3FA','#0D0B12'],rose:['#F9F2F4','#110A0C'],imperial:['#FAF3F1','#120A09'],amber:['#F7F4EF','#100B07'],sage:['#F3F5F0','#0B0D08'],black:['#F4F4F4','#0C0C0C']};
    var pair = colors[settings.palette] || colors.jade;
    root.style.setProperty('--boot-bg', pair[dark ? 1 : 0]);
    root.style.setProperty('--boot-ink', dark ? '#F0F5F2' : '#161E19');
    root.style.setProperty('--boot-muted', dark ? '#ADBBB2' : '#58625C');
    root.style.colorScheme = dark ? 'dark' : 'light';
    if (settings.animations === false) root.setAttribute('data-boot-motion', 'off');
  } catch (_) {}
  function update() {
    var message = document.getElementById('app-startup-message');
    var retry = document.getElementById('app-startup-retry');
    if (message) message.textContent = phase === 'failed' ? 'The app couldn’t finish loading. Please try again.' : slow ? 'Still loading. Check your connection, or try again.' : 'Opening your study desk…';
    if (retry) retry.hidden = phase !== 'failed' && !slow;
  }
  function fail() {
    if (phase === 'ready') return;
    phase = 'failed'; root.setAttribute('data-app-boot', 'failed'); update();
  }
  window.appBoot = {
    ready: function () {
      if (phase !== 'pending') return false;
      phase = 'committing';
      try { if (typeof window.save === 'function') window.save(); }
      catch (_) { phase = 'failed'; root.setAttribute('data-app-boot', 'failed'); update(); return false; }
      phase = 'ready'; clearTimeout(timer);
      root.removeAttribute('data-app-boot'); root.removeAttribute('data-boot-motion');
      root.style.removeProperty('color-scheme');
      var modal = document.querySelector('.companion-modal input,.companion-modal button');
      if (modal) modal.focus();
      return true;
    },
    retry: function () {
      var url = new URL(location.href); url.searchParams.set('reload', String(Date.now()));
      location.replace(url.href);
    },
    status: function () { return phase; }
  };
  window.addEventListener('error', function (event) {
    var target = event.target;
    var ownResource = target && ((target.tagName === 'SCRIPT' && /assets\//.test(target.src || '')) || (target.tagName === 'LINK' && /assets\//.test(target.href || '')));
    if (ownResource || (event.message && /assets\//.test(event.filename || ''))) fail();
  }, true);
  document.addEventListener('DOMContentLoaded', update);
  var timer = setTimeout(function () { if (phase === 'pending') { slow = true; update(); } }, 12000);
})();

(function () {
  'use strict';

  var HASH = '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8';
  var STORAGE_KEY = 'gmi_auth';
  var EXPIRY_DAYS = 30;

  function isAuthenticated() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      var data = JSON.parse(raw);
      if (Date.now() > data.exp) { localStorage.removeItem(STORAGE_KEY); return false; }
      return data.ok === true;
    } catch (e) { return false; }
  }

  function setAuthenticated() {
    var exp = Date.now() + EXPIRY_DAYS * 864e5;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ok: true, exp: exp }));
  }

  async function sha256(text) {
    var enc = new TextEncoder();
    var buf = await crypto.subtle.digest('SHA-256', enc.encode(text));
    return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
  }

  if (isAuthenticated()) return;

  document.documentElement.style.overflow = 'hidden';

  var overlay = document.createElement('div');
  overlay.id = 'gmi-gate';
  overlay.innerHTML =
    '<div style="max-width:380px;width:90%;background:#1a1a2e;border:1px solid #2a2a4a;border-radius:12px;padding:40px 32px;text-align:center;box-shadow:0 24px 80px rgba(0,0,0,.6)">' +
      '<div style="font-size:28px;font-weight:700;letter-spacing:-.5px;color:#fff;margin-bottom:6px">Global Mining Intel</div>' +
      '<div style="font-size:13px;color:#94a3b8;margin-bottom:28px">Enter password to access the platform</div>' +
      '<input id="gmi-pw" type="password" placeholder="Password" autocomplete="off" style="width:100%;box-sizing:border-box;padding:12px 16px;border:1px solid #334155;border-radius:8px;background:#0f172a;color:#f1f5f9;font-size:15px;outline:none;margin-bottom:12px;transition:border-color .2s" />' +
      '<div id="gmi-err" style="color:#f87171;font-size:12px;min-height:18px;margin-bottom:12px"></div>' +
      '<button id="gmi-btn" style="width:100%;padding:12px;border:none;border-radius:8px;background:linear-gradient(135deg,#d97706,#f59e0b);color:#000;font-weight:700;font-size:15px;cursor:pointer;transition:opacity .2s">Enter</button>' +
    '</div>';

  overlay.style.cssText = 'position:fixed;inset:0;z-index:999999;display:flex;align-items:center;justify-content:center;background:rgba(2,6,23,.97);backdrop-filter:blur(12px)';

  function tryAuth() {
    var pw = document.getElementById('gmi-pw').value;
    if (!pw) { document.getElementById('gmi-err').textContent = 'Please enter a password'; return; }
    sha256(pw).then(function (h) {
      if (h === HASH) {
        setAuthenticated();
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity .3s';
        setTimeout(function () { overlay.remove(); document.documentElement.style.overflow = ''; }, 300);
      } else {
        document.getElementById('gmi-err').textContent = 'Incorrect password';
        document.getElementById('gmi-pw').value = '';
        document.getElementById('gmi-pw').focus();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.body.appendChild(overlay);
    var inp = document.getElementById('gmi-pw');
    inp.focus();
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') tryAuth(); });
    document.getElementById('gmi-btn').addEventListener('click', tryAuth);
    inp.addEventListener('focus', function () { inp.style.borderColor = '#f59e0b'; });
    inp.addEventListener('blur', function () { inp.style.borderColor = '#334155'; });
  });
})();

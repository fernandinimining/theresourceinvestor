(function () {
  'use strict';

  var MAINTENANCE = true;
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

  if (MAINTENANCE) {
    overlay.innerHTML =
      '<div style="max-width:480px;width:90%;text-align:center">' +
        '<div style="font-size:42px;font-weight:800;letter-spacing:-1px;color:#fff;margin-bottom:8px">Global Mining Intel</div>' +
        '<div style="width:60px;height:3px;background:linear-gradient(90deg,#d97706,#f59e0b);margin:0 auto 24px;border-radius:2px"></div>' +
        '<div style="font-size:20px;color:#e2e8f0;font-weight:500;margin-bottom:12px">Coming Soon</div>' +
        '<div style="font-size:14px;color:#94a3b8;line-height:1.7;margin-bottom:36px">We are building the most comprehensive mining stock intelligence platform.<br>Premium analysis for copper, gold, silver, and lithium investors.</div>' +
        '<div style="display:inline-flex;align-items:center;gap:8px;background:#1a1a2e;border:1px solid #2a2a4a;border-radius:8px;padding:12px 20px;margin-bottom:32px">' +
          '<svg width="16" height="16" fill="none" stroke="#f59e0b" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>' +
          '<span style="color:#cbd5e1;font-size:13px">Launch date to be announced</span>' +
        '</div>' +
        '<div id="gmi-admin-area" style="display:none;margin-top:20px">' +
          '<input id="gmi-pw" type="password" placeholder="Admin password" autocomplete="off" style="width:100%;max-width:280px;box-sizing:border-box;padding:10px 14px;border:1px solid #334155;border-radius:8px;background:#0f172a;color:#f1f5f9;font-size:14px;outline:none;margin-bottom:8px" />' +
          '<div id="gmi-err" style="color:#f87171;font-size:12px;min-height:16px;margin-bottom:8px"></div>' +
          '<button id="gmi-btn" style="padding:10px 28px;border:none;border-radius:8px;background:#334155;color:#e2e8f0;font-weight:600;font-size:13px;cursor:pointer">Access</button>' +
        '</div>' +
        '<div id="gmi-admin-hint" style="margin-top:16px;cursor:default;user-select:none">' +
          '<span style="color:#334155;font-size:11px">Admin</span>' +
        '</div>' +
      '</div>';
  } else {
    overlay.innerHTML =
      '<div style="max-width:380px;width:90%;background:#1a1a2e;border:1px solid #2a2a4a;border-radius:12px;padding:40px 32px;text-align:center;box-shadow:0 24px 80px rgba(0,0,0,.6)">' +
        '<div style="font-size:28px;font-weight:700;letter-spacing:-.5px;color:#fff;margin-bottom:6px">Global Mining Intel</div>' +
        '<div style="font-size:13px;color:#94a3b8;margin-bottom:28px">Enter password to access the platform</div>' +
        '<input id="gmi-pw" type="password" placeholder="Password" autocomplete="off" style="width:100%;box-sizing:border-box;padding:12px 16px;border:1px solid #334155;border-radius:8px;background:#0f172a;color:#f1f5f9;font-size:15px;outline:none;margin-bottom:12px;transition:border-color .2s" />' +
        '<div id="gmi-err" style="color:#f87171;font-size:12px;min-height:18px;margin-bottom:12px"></div>' +
        '<button id="gmi-btn" style="width:100%;padding:12px;border:none;border-radius:8px;background:linear-gradient(135deg,#d97706,#f59e0b);color:#000;font-weight:700;font-size:15px;cursor:pointer;transition:opacity .2s">Enter</button>' +
      '</div>';
  }

  overlay.style.cssText = 'position:fixed;inset:0;z-index:999999;display:flex;align-items:center;justify-content:center;background:rgba(2,6,23,.97);backdrop-filter:blur(12px)';

  function tryAuth() {
    var pw = document.getElementById('gmi-pw');
    if (!pw) return;
    var val = pw.value;
    if (!val) { document.getElementById('gmi-err').textContent = 'Please enter a password'; return; }
    sha256(val).then(function (h) {
      if (h === HASH) {
        setAuthenticated();
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity .3s';
        setTimeout(function () { overlay.remove(); document.documentElement.style.overflow = ''; }, 300);
      } else {
        document.getElementById('gmi-err').textContent = 'Incorrect password';
        pw.value = '';
        pw.focus();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.body.appendChild(overlay);

    var adminHint = document.getElementById('gmi-admin-hint');
    var adminArea = document.getElementById('gmi-admin-area');
    if (adminHint && adminArea) {
      adminHint.addEventListener('click', function () {
        adminArea.style.display = 'block';
        adminHint.style.display = 'none';
        var inp = document.getElementById('gmi-pw');
        if (inp) inp.focus();
      });
    }

    var inp = document.getElementById('gmi-pw');
    if (inp) {
      if (!MAINTENANCE) inp.focus();
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') tryAuth(); });
    }
    var btn = document.getElementById('gmi-btn');
    if (btn) btn.addEventListener('click', tryAuth);
  });
})();

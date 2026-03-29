(function () {
  'use strict';

  const STORAGE_KEY = 'dr_cookie_consent';
  if (localStorage.getItem(STORAGE_KEY)) return;

  /* ─────────────────────────────────────────────────────────────────────────
     STYLES
  ───────────────────────────────────────────────────────────────────────── */
  const css = `
    #dr-root *, #dr-root *::before, #dr-root *::after {
      box-sizing: border-box;
      margin: 0; padding: 0;
      -webkit-font-smoothing: antialiased;
      font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
    }

    /* ══════════════════════════════════════
       BANNER
    ══════════════════════════════════════ */
    #dr-banner {
      position: fixed;
      bottom: 28px;
      left: 50%;
      transform: translateX(-50%) translateY(24px);
      opacity: 0;
      z-index: 99998;
      width: calc(100vw - 48px);
      max-width: 700px;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(20px) saturate(160%);
      -webkit-backdrop-filter: blur(20px) saturate(160%);
      border: 1px solid rgba(0, 0, 0, 0.07);
      border-radius: 16px;
      box-shadow:
        0 2px 4px rgba(0,0,0,0.04),
        0 8px 24px rgba(0,0,0,0.09),
        0 24px 48px rgba(0,0,0,0.06);
      padding: 20px 24px 20px 24px;
      display: flex;
      align-items: center;
      gap: 28px;
      transition: opacity 0.38s ease, transform 0.48s cubic-bezier(0.34, 1.2, 0.64, 1);
      will-change: transform, opacity;
    }
    #dr-banner.dr-show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    #dr-banner.dr-hide {
      opacity: 0;
      transform: translateX(-50%) translateY(14px);
      pointer-events: none;
    }

    /* Cookie icon pill */
    .dr-icon-pill {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #f0fdf4, #dcfce7);
      border: 1px solid rgba(16,185,129,0.2);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 17px;
      flex-shrink: 0;
    }

    .dr-text { flex: 1; min-width: 0; }
    .dr-text strong {
      display: block;
      font-size: 13.5px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.01em;
      margin-bottom: 2px;
    }
    .dr-text span {
      font-size: 12.5px;
      color: #64748b;
      line-height: 1.5;
    }
    .dr-text a {
      color: #10b981;
      text-decoration: none;
      font-weight: 500;
    }
    .dr-text a:hover { text-decoration: underline; }

    /* Banner button group */
    .dr-btns {
      display: flex;
      gap: 7px;
      align-items: center;
      flex-shrink: 0;
    }

    /* ── Button base ── */
    .dr-btn {
      font-size: 12.5px;
      font-weight: 600;
      border-radius: 7px;
      padding: 9px 20px;
      cursor: pointer;
      border: none;
      line-height: 1;
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.17s ease;
      outline: none;
      letter-spacing: -0.01em;
    }
    .dr-btn:focus-visible {
      box-shadow: 0 0 0 3px rgba(16,185,129,0.35);
    }
    .dr-btn:active { transform: scale(0.96); }

    /* Accept All — solid green */
    .dr-btn-accept {
      background: #10b981;
      color: #fff;
      box-shadow: 0 1px 2px rgba(16,185,129,0.15), 0 3px 10px rgba(16,185,129,0.3);
    }
    .dr-btn-accept:hover {
      background: #059669;
      box-shadow: 0 1px 2px rgba(16,185,129,0.15), 0 5px 16px rgba(16,185,129,0.4);
      transform: translateY(-1px);
    }

    /* Reject All — light outline */
    .dr-btn-reject {
      background: transparent;
      color: #64748b;
      border: 1px solid #e2e8f0;
    }
    .dr-btn-reject:hover {
      background: #f8fafc;
      color: #334155;
      border-color: #cbd5e1;
    }

    /* Manage — ghost */
    .dr-btn-manage {
      background: transparent;
      color: #64748b;
      border: 1px solid transparent;
    }
    .dr-btn-manage:hover {
      background: #f1f5f9;
      color: #334155;
    }

    /* ══════════════════════════════════════
       OVERLAY
    ══════════════════════════════════════ */
    #dr-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(6px) saturate(120%);
      -webkit-backdrop-filter: blur(6px) saturate(120%);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.26s ease;
    }
    #dr-overlay.dr-show {
      opacity: 1;
      pointer-events: all;
    }

    /* ══════════════════════════════════════
       MODAL CARD
    ══════════════════════════════════════ */
    .dr-card {
      background: rgba(255,255,255,0.96);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      border: 1px solid rgba(0,0,0,0.07);
      border-radius: 20px;
      box-shadow:
        0 4px 6px rgba(0,0,0,0.04),
        0 12px 32px rgba(0,0,0,0.1),
        0 32px 64px rgba(0,0,0,0.07);
      width: 100%;
      max-width: 468px;
      max-height: 86vh;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      transform: translateY(18px) scale(0.97);
      transition: transform 0.38s cubic-bezier(0.34, 1.2, 0.64, 1);
      scrollbar-width: thin;
      scrollbar-color: #e2e8f0 transparent;
    }
    .dr-card::-webkit-scrollbar { width: 4px; }
    .dr-card::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
    #dr-overlay.dr-show .dr-card {
      transform: translateY(0) scale(1);
    }

    /* Modal header */
    .dr-card-head {
      padding: 24px 24px 0;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
    }
    .dr-card-head-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .dr-modal-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #f0fdf4, #dcfce7);
      border: 1px solid rgba(16,185,129,0.2);
      border-radius: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 19px;
      flex-shrink: 0;
    }
    .dr-card-head-left h2 {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.02em;
    }
    .dr-card-head-left p {
      font-size: 12px;
      color: #94a3b8;
      margin-top: 2px;
      line-height: 1.4;
    }
    .dr-close-btn {
      width: 28px;
      height: 28px;
      border-radius: 7px;
      background: #f1f5f9;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background 0.15s, color 0.15s;
      margin-top: 3px;
    }
    .dr-close-btn:hover { background: #e2e8f0; color: #475569; }
    .dr-close-btn:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(16,185,129,0.35); }

    /* Divider */
    .dr-hr {
      height: 1px;
      background: #f1f5f9;
      margin: 18px 24px 14px;
    }

    /* ── Category rows ── */
    .dr-cats {
      padding: 0 16px 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .dr-cat {
      border-radius: 11px;
      border: 1.5px solid #f1f5f9;
      padding: 13px 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      background: #fafafa;
      transition: border-color 0.2s ease, background 0.2s ease;
    }
    .dr-cat.dr-on {
      border-color: rgba(16,185,129,0.28);
      background: #f0fdf8;
    }

    /* Category icon */
    .dr-cat-ico {
      width: 34px;
      height: 34px;
      border-radius: 9px;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      flex-shrink: 0;
    }
    .dr-cat.dr-on .dr-cat-ico {
      background: #f0fdf4;
      border-color: rgba(16,185,129,0.2);
    }

    .dr-cat-info { flex: 1; min-width: 0; }
    .dr-cat-name {
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: 13px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 2px;
    }
    .dr-cat-desc {
      font-size: 11.5px;
      color: #94a3b8;
      line-height: 1.5;
    }

    /* Badge */
    .dr-badge {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #10b981;
      background: #dcfce7;
      border-radius: 4px;
      padding: 2px 6px;
    }

    /* ── Toggle switch ── */
    .dr-toggle {
      position: relative;
      width: 38px;
      height: 22px;
      flex-shrink: 0;
      cursor: pointer;
    }
    .dr-toggle input { position: absolute; opacity: 0; width: 0; height: 0; }
    .dr-track {
      position: absolute;
      inset: 0;
      background: #e2e8f0;
      border-radius: 99px;
      transition: background 0.22s ease;
    }
    .dr-toggle input:checked ~ .dr-track   { background: #10b981; }
    .dr-toggle input:disabled ~ .dr-track  { background: #a7f3d0; cursor: not-allowed; }
    .dr-track::after {
      content: '';
      position: absolute;
      top: 3px; left: 3px;
      width: 16px; height: 16px;
      background: #fff;
      border-radius: 50%;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      transition: transform 0.22s cubic-bezier(0.34,1.3,0.64,1);
    }
    .dr-toggle input:checked ~ .dr-track::after { transform: translateX(16px); }
    .dr-toggle:focus-within .dr-track { box-shadow: 0 0 0 3px rgba(16,185,129,0.25); }

    /* ── Modal footer ── */
    .dr-card-foot {
      padding: 12px 16px 18px;
      display: flex;
      gap: 7px;
      border-top: 1px solid #f1f5f9;
    }
    .dr-card-foot .dr-btn {
      flex: 1;
      padding: 10px 14px;
      font-size: 13px;
    }

    /* ══════════════════════════════════════
       MOBILE
    ══════════════════════════════════════ */
    @media (max-width: 580px) {
      #dr-banner {
        bottom: 12px;
        width: calc(100vw - 24px);
        flex-direction: column;
        align-items: flex-start;
        padding: 16px;
        gap: 14px;
      }
      .dr-btns {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 7px;
      }
      .dr-btn-accept { grid-column: 1 / -1; }
      .dr-icon-pill { display: none; }
    }
    @media (max-width: 480px) {
      .dr-card { border-radius: 16px; }
      .dr-card-foot { flex-direction: column; }
    }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ─────────────────────────────────────────────────────────────────────────
     ROOT
  ───────────────────────────────────────────────────────────────────────── */
  const root = document.createElement('div');
  root.id = 'dr-root';
  document.body.appendChild(root);

  /* ─────────────────────────────────────────────────────────────────────────
     BANNER
  ───────────────────────────────────────────────────────────────────────── */
  const banner = document.createElement('div');
  banner.id = 'dr-banner';
  banner.setAttribute('role', 'region');
  banner.setAttribute('aria-label', 'Cookie consent');
  banner.innerHTML = `
    <div class="dr-icon-pill" aria-hidden="true">🍪</div>
    <div class="dr-text">
      <strong>We use cookies</strong>
      <span>We use cookies to improve your experience and understand site usage. <a href="privacy.html">Privacy Policy</a>.</span>
    </div>
    <div class="dr-btns">
      <button class="dr-btn dr-btn-reject" id="dr-b-reject" aria-label="Reject all non-essential cookies">Reject All</button>
      <button class="dr-btn dr-btn-manage" id="dr-b-manage" aria-label="Open cookie preferences">Manage</button>
      <button class="dr-btn dr-btn-accept" id="dr-b-accept" aria-label="Accept all cookies">Accept All</button>
    </div>
  `;
  root.appendChild(banner);
  requestAnimationFrame(() => setTimeout(() => banner.classList.add('dr-show'), 180));

  /* ─────────────────────────────────────────────────────────────────────────
     OVERLAY + MODAL
  ───────────────────────────────────────────────────────────────────────── */
  const overlay = document.createElement('div');
  overlay.id = 'dr-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Cookie preferences');
  overlay.innerHTML = `
    <div class="dr-card" id="dr-card">

      <div class="dr-card-head">
        <div class="dr-card-head-left">
          <div class="dr-modal-icon" aria-hidden="true">🍪</div>
          <div>
            <h2>Cookie Preferences</h2>
            <p>Control what data we collect about you.</p>
          </div>
        </div>
        <button class="dr-close-btn" id="dr-m-close" aria-label="Close preferences">✕</button>
      </div>

      <div class="dr-hr"></div>

      <div class="dr-cats">

        <div class="dr-cat dr-on">
          <div class="dr-cat-ico" aria-hidden="true">🔒</div>
          <div class="dr-cat-info">
            <div class="dr-cat-name">Essential <span class="dr-badge">Always on</span></div>
            <div class="dr-cat-desc">Required for login, security, and core features. Cannot be disabled.</div>
          </div>
          <label class="dr-toggle" aria-label="Essential cookies — always active">
            <input type="checkbox" checked disabled>
            <span class="dr-track"></span>
          </label>
        </div>

        <div class="dr-cat" id="dr-row-analytics">
          <div class="dr-cat-ico" aria-hidden="true">📊</div>
          <div class="dr-cat-info">
            <div class="dr-cat-name">Analytics</div>
            <div class="dr-cat-desc">Helps us understand how visitors use the site so we can make it better.</div>
          </div>
          <label class="dr-toggle" aria-label="Toggle analytics cookies">
            <input type="checkbox" id="dr-t-analytics">
            <span class="dr-track"></span>
          </label>
        </div>

        <div class="dr-cat" id="dr-row-performance">
          <div class="dr-cat-ico" aria-hidden="true">⚡</div>
          <div class="dr-cat-info">
            <div class="dr-cat-name">Performance</div>
            <div class="dr-cat-desc">Monitor and optimise site speed and reliability for a faster experience.</div>
          </div>
          <label class="dr-toggle" aria-label="Toggle performance cookies">
            <input type="checkbox" id="dr-t-performance">
            <span class="dr-track"></span>
          </label>
        </div>

        <div class="dr-cat" id="dr-row-marketing">
          <div class="dr-cat-ico" aria-hidden="true">🎯</div>
          <div class="dr-cat-info">
            <div class="dr-cat-name">Marketing</div>
            <div class="dr-cat-desc">Show relevant content and measure campaign effectiveness across channels.</div>
          </div>
          <label class="dr-toggle" aria-label="Toggle marketing cookies">
            <input type="checkbox" id="dr-t-marketing">
            <span class="dr-track"></span>
          </label>
        </div>

      </div>

      <div class="dr-card-foot">
        <button class="dr-btn dr-btn-reject" id="dr-m-reject" aria-label="Reject all non-essential cookies">Reject All</button>
        <button class="dr-btn dr-btn-accept" id="dr-m-accept" aria-label="Accept all cookies">Accept All</button>
        <button class="dr-btn dr-btn-accept" id="dr-m-save"   aria-label="Save selected preferences" style="background:#1e293b;box-shadow:none;">Save Preferences</button>
      </div>

    </div>
  `;
  root.appendChild(overlay);

  /* ─────────────────────────────────────────────────────────────────────────
     TOGGLE → row highlight
  ───────────────────────────────────────────────────────────────────────── */
  ['analytics', 'performance', 'marketing'].forEach(id => {
    const input = document.getElementById(`dr-t-${id}`);
    const row   = document.getElementById(`dr-row-${id}`);
    input.addEventListener('change', () => row.classList.toggle('dr-on', input.checked));
  });

  /* ─────────────────────────────────────────────────────────────────────────
     HELPERS
  ───────────────────────────────────────────────────────────────────────── */
  function hideBanner() {
    banner.classList.replace('dr-show', 'dr-hide');
    setTimeout(() => banner.remove(), 420);
  }
  function openModal()  { overlay.classList.add('dr-show'); document.getElementById('dr-m-close').focus(); }
  function closeModal() { overlay.classList.remove('dr-show'); }
  function save(prefs)  {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ts: Date.now(), v: 1, ...prefs }));
    hideBanner();
    closeModal();
  }
  const acceptAll = () => save({ essential:true, analytics:true, performance:true, marketing:true });
  const rejectAll = () => save({ essential:true, analytics:false, performance:false, marketing:false });

  /* ─────────────────────────────────────────────────────────────────────────
     EVENTS
  ───────────────────────────────────────────────────────────────────────── */
  document.getElementById('dr-b-accept').addEventListener('click', acceptAll);
  document.getElementById('dr-b-reject').addEventListener('click', rejectAll);
  document.getElementById('dr-b-manage').addEventListener('click', openModal);
  document.getElementById('dr-m-close') .addEventListener('click', closeModal);
  document.getElementById('dr-m-accept').addEventListener('click', acceptAll);
  document.getElementById('dr-m-reject').addEventListener('click', rejectAll);
  document.getElementById('dr-m-save')  .addEventListener('click', () => save({
    essential:   true,
    analytics:   document.getElementById('dr-t-analytics').checked,
    performance: document.getElementById('dr-t-performance').checked,
    marketing:   document.getElementById('dr-t-marketing').checked,
  }));

  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('dr-show')) closeModal();
  });

  // Focus trap
  overlay.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const els   = [...overlay.querySelectorAll('button:not([disabled]), input:not([disabled])')];
    const first = els[0], last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

})();

(function () {
  'use strict';

  const KEY = 'dr_cookie_consent';
  if (localStorage.getItem(KEY)) return;

  /* ─── SVG Icons ──────────────────────────────────────────────────────── */
  const SVG = {
    shield: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    bar:    `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
    zap:    `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    target: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
    x:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    lock:   `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  };

  /* ─── CSS ─────────────────────────────────────────────────────────────── */
  const css = `
    #dr-root *, #dr-root *::before, #dr-root *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', system-ui, sans-serif;
    }

    /* ══ BANNER ══════════════════════════════════════════════════════════ */
    #dr-banner {
      position: fixed;
      bottom: 28px;
      left: 50%;
      transform: translateX(-50%) translateY(24px);
      opacity: 0;
      z-index: 99998;
      width: calc(100vw - 48px);
      max-width: 440px;
      background: linear-gradient(160deg, rgba(255,255,255,0.82) 0%, rgba(246,249,252,0.76) 100%);
      backdrop-filter: blur(72px) saturate(240%) brightness(1.02);
      -webkit-backdrop-filter: blur(72px) saturate(240%) brightness(1.02);
      border: 1px solid rgba(255, 255, 255, 0.55);
      border-bottom-color: rgba(0, 0, 0, 0.06);
      border-radius: 22px;
      box-shadow:
        0 1px 0 rgba(255, 255, 255, 0.95) inset,
        0 -1px 0 rgba(0, 0, 0, 0.03) inset,
        0 2px 4px rgba(0, 0, 0, 0.04),
        0 8px 24px rgba(0, 0, 0, 0.09),
        0 24px 56px rgba(0, 0, 0, 0.08),
        0 48px 80px rgba(0, 0, 0, 0.04);
      padding: 36px 36px 30px;
      transition: opacity 0.45s ease, transform 0.55s cubic-bezier(0.34, 1.08, 0.64, 1);
    }
    #dr-banner.dr-show { opacity: 1; transform: translateX(-50%) translateY(0); }
    #dr-banner.dr-hide { opacity: 0; transform: translateX(-50%) translateY(14px); pointer-events: none; }

    #dr-banner .dr-b-icon {
      width: 44px;
      height: 44px;
      background: rgba(220, 252, 231, 0.85);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #16a34a;
      margin-bottom: 20px;
      flex-shrink: 0;
      box-shadow: 0 0 0 7px rgba(22, 163, 74, 0.07), 0 1px 3px rgba(22,163,74,0.12) inset;
    }

    #dr-banner .dr-title {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.03em;
      line-height: 1.25;
      margin-bottom: 12px;
    }

    #dr-banner .dr-desc {
      font-size: 13.5px;
      color: #64748b;
      line-height: 1.72;
      margin-bottom: 26px;
    }

    #dr-banner .dr-desc a {
      color: #16a34a;
      font-weight: 500;
      text-decoration: underline;
      text-decoration-thickness: 1px;
      text-underline-offset: 3px;
      cursor: pointer;
      transition: color 0.15s;
    }
    #dr-banner .dr-desc a:hover { color: #15803d; }

    #dr-banner .dr-stack {
      display: flex;
      flex-direction: column;
      gap: 11px;
    }

    /* ══ BUTTONS ════════════════════════════════════════════════════════ */
    .dr-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      border: none;
      outline: none;
      cursor: pointer;
      font-family: inherit;
      font-weight: 600;
      letter-spacing: -0.015em;
      border-radius: 11px;
      transition: all 0.18s ease;
      white-space: nowrap;
      line-height: 1;
    }
    .dr-btn:active { transform: scale(0.975) !important; }

    .dr-btn-accept {
      background: #166534;
      color: #fff;
      font-size: 14.5px;
      padding: 16px 28px;
      width: 100%;
      box-shadow:
        0 1px 2px rgba(0,0,0,0.12),
        0 2px 6px rgba(22, 163, 74, 0.22),
        0 8px 24px rgba(22, 163, 74, 0.28);
    }
    .dr-btn-accept:hover {
      background: #145f30;
      transform: translateY(-1px);
      box-shadow:
        0 1px 2px rgba(0,0,0,0.14),
        0 4px 10px rgba(22,163,74,0.28),
        0 12px 32px rgba(22,163,74,0.32);
    }

    .dr-btn-reject {
      background: rgba(255,255,255,0.5);
      color: #374151;
      font-size: 14.5px;
      padding: 16px 28px;
      width: 100%;
      border: 2px solid rgba(0, 0, 0, 0.11);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    .dr-btn-reject:hover {
      background: rgba(255,255,255,0.75);
      border-color: rgba(0, 0, 0, 0.18);
      color: #1f2937;
    }

    #dr-banner .dr-ghost {
      background: none;
      border: none;
      cursor: pointer;
      font-family: inherit;
      font-size: 12.5px;
      font-weight: 500;
      color: #9ca3af;
      text-align: center;
      width: 100%;
      padding: 10px 0 0;
      display: block;
      transition: color 0.15s;
    }
    #dr-banner .dr-ghost:hover { color: #6b7280; }

    /* ══ OVERLAY ════════════════════════════════════════════════════════ */
    #dr-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease;
    }
    #dr-overlay.dr-show { opacity: 1; pointer-events: all; }

    /* ══ MODAL ══════════════════════════════════════════════════════════ */
    .dr-modal {
      background: linear-gradient(170deg, rgba(255,255,255,0.98) 0%, rgba(248,250,253,0.96) 100%);
      backdrop-filter: blur(80px) saturate(240%) brightness(1.01);
      -webkit-backdrop-filter: blur(80px) saturate(240%) brightness(1.01);
      border: 1px solid rgba(255, 255, 255, 0.65);
      border-bottom-color: rgba(0, 0, 0, 0.06);
      border-radius: 26px;
      box-shadow:
        0 1px 0 rgba(255, 255, 255, 1) inset,
        0 -1px 0 rgba(0, 0, 0, 0.03) inset,
        0 4px 12px rgba(0, 0, 0, 0.07),
        0 16px 48px rgba(0, 0, 0, 0.13),
        0 40px 80px rgba(0, 0, 0, 0.08),
        0 80px 120px rgba(0, 0, 0, 0.04);
      width: 100%;
      max-width: 560px;
      max-height: calc(100dvh - 48px);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transform: translateY(14px) scale(0.985);
      transition: transform 0.38s cubic-bezier(0.34, 1.08, 0.64, 1);
    }
    #dr-overlay.dr-show .dr-modal { transform: translateY(0) scale(1); }

    /* Modal Header — never scrolls */
    .dr-modal-head {
      flex-shrink: 0;
      padding: 32px 36px 28px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    }

    .dr-modal-head-row {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      margin-bottom: 14px;
    }

    .dr-modal-head-icon {
      width: 44px;
      height: 44px;
      background: rgba(220, 252, 231, 0.85);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #16a34a;
      flex-shrink: 0;
      margin-top: 1px;
      box-shadow: 0 0 0 6px rgba(22, 163, 74, 0.06), 0 1px 3px rgba(22,163,74,0.1) inset;
    }

    .dr-modal-head-text { flex: 1; min-width: 0; }

    .dr-modal-head h2 {
      font-size: 19px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.03em;
      line-height: 1.2;
      margin-bottom: 0;
    }

    .dr-modal-head p {
      font-size: 13.5px;
      color: #64748b;
      line-height: 1.6;
      margin-top: 6px;
    }

    .dr-x {
      width: 34px;
      height: 34px;
      border-radius: 9px;
      background: rgba(0, 0, 0, 0.05);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      flex-shrink: 0;
      transition: background 0.15s, color 0.15s;
      outline: none;
    }
    .dr-x:hover { background: rgba(0, 0, 0, 0.09); color: #475569; }
    .dr-x:focus-visible { box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.3); }

    /* Modal Body — scrollable */
    .dr-body {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 24px 36px 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      scrollbar-width: thin;
      scrollbar-color: rgba(0, 0, 0, 0.1) transparent;
    }
    .dr-body::-webkit-scrollbar { width: 4px; }
    .dr-body::-webkit-scrollbar-track { background: transparent; }
    .dr-body::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.1); border-radius: 4px; }

    /* Category Row */
    .dr-cat {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 20px 22px;
      border-radius: 14px;
      border: 1.5px solid rgba(0, 0, 0, 0.065);
      background: rgba(255, 255, 255, 0.55);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
    }
    .dr-cat.dr-on {
      border-color: rgba(22, 163, 74, 0.24);
      background: rgba(240, 253, 244, 0.65);
      box-shadow: 0 1px 3px rgba(22,163,74,0.06);
    }
    .dr-cat:hover { border-color: rgba(0, 0, 0, 0.11); box-shadow: 0 2px 6px rgba(0,0,0,0.06); }
    .dr-cat.dr-on:hover { border-color: rgba(22, 163, 74, 0.34); box-shadow: 0 2px 6px rgba(22,163,74,0.08); }

    .dr-cat-icon {
      width: 42px;
      height: 42px;
      border-radius: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .dr-cat-icon.ic-essential  { background: #ecfdf5; color: #16a34a; }
    .dr-cat-icon.ic-analytics  { background: #eff6ff; color: #3b82f6; }
    .dr-cat-icon.ic-perf       { background: #fff7ed; color: #f59e0b; }
    .dr-cat-icon.ic-marketing  { background: #fdf4ff; color: #a855f7; }

    .dr-cat-info {
      flex: 1;
      min-width: 0;
      padding-top: 1px;
    }

    .dr-cat-name {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 6px;
      letter-spacing: -0.01em;
    }

    .dr-cat-desc {
      font-size: 12.5px;
      color: #64748b;
      line-height: 1.6;
    }

    .dr-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.02em;
      color: #16a34a;
      background: #dcfce7;
      border-radius: 100px;
      padding: 3px 8px 3px 6px;
      white-space: nowrap;
    }

    .dr-cat-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      flex-shrink: 0;
      padding-top: 3px;
    }

    /* Toggle Switch */
    .dr-toggle { position: relative; width: 44px; height: 24px; flex-shrink: 0; }
    .dr-toggle input { position: absolute; opacity: 0; width: 0; height: 0; }
    .dr-track {
      position: absolute;
      inset: 0;
      background: #e2e8f0;
      border-radius: 100px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .dr-toggle input:checked  ~ .dr-track { background: #16a34a; }
    .dr-toggle input:disabled ~ .dr-track { background: #86efac; cursor: not-allowed; }
    .dr-track::after {
      content: '';
      position: absolute;
      top: 3px;
      left: 3px;
      width: 18px;
      height: 18px;
      background: #fff;
      border-radius: 50%;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
      transition: transform 0.22s cubic-bezier(0.34, 1.3, 0.64, 1);
    }
    .dr-toggle input:checked ~ .dr-track::after { transform: translateX(20px); }
    .dr-toggle:focus-within .dr-track { box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.28); }

    /* Modal Footer — never scrolls */
    .dr-foot {
      flex-shrink: 0;
      padding: 20px 36px 30px;
      border-top: 1px solid rgba(0, 0, 0, 0.055);
      background: linear-gradient(to bottom, rgba(248,250,252,0.6), rgba(245,247,250,0.8));
    }

    .dr-foot-btns {
      display: flex;
      gap: 10px;
    }

    .dr-foot-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 15px 14px;
      border-radius: 11px;
      font-size: 13.5px;
      font-weight: 600;
      letter-spacing: -0.015em;
      cursor: pointer;
      outline: none;
      font-family: inherit;
      white-space: nowrap;
      line-height: 1;
      transition: all 0.18s ease;
      border: none;
    }
    .dr-foot-btn:active { transform: scale(0.975); }

    .dr-foot-reject {
      background: rgba(255,255,255,0.55);
      color: #475569;
      border: 2px solid rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    .dr-foot-reject:hover { background: rgba(255,255,255,0.8); border-color: rgba(0, 0, 0, 0.16); color: #374151; }

    .dr-foot-save {
      background: rgba(255,255,255,0.55);
      color: #334155;
      border: 2px solid rgba(0, 0, 0, 0.08);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    .dr-foot-save:hover { background: rgba(255,255,255,0.8); border-color: rgba(0, 0, 0, 0.14); color: #1e293b; }

    .dr-foot-accept {
      background: #166534;
      color: #fff;
      border: 2px solid transparent;
      box-shadow:
        0 1px 2px rgba(0,0,0,0.1),
        0 2px 6px rgba(22, 163, 74, 0.22),
        0 6px 20px rgba(22, 163, 74, 0.25);
    }
    .dr-foot-accept:hover {
      background: #145f30;
      transform: translateY(-1px);
      box-shadow:
        0 1px 2px rgba(0,0,0,0.12),
        0 4px 10px rgba(22,163,74,0.28),
        0 10px 28px rgba(22,163,74,0.3);
    }

    /* ══ MOBILE ═════════════════════════════════════════════════════════ */
    @media (max-width: 540px) {
      #dr-banner {
        bottom: 16px;
        width: calc(100vw - 28px);
        padding: 30px 26px 26px;
        border-radius: 20px;
      }
      #dr-overlay { padding: 16px; }
      .dr-modal { border-radius: 22px; max-height: calc(100dvh - 32px); }
      .dr-modal-head { padding: 28px 26px 22px; }
      .dr-body { padding: 20px 26px 16px; gap: 10px; }
      .dr-cat { padding: 18px 18px; gap: 14px; }
      .dr-cat-icon { width: 38px; height: 38px; }
      .dr-foot { padding: 16px 26px 28px; }
      .dr-foot-btns { gap: 8px; }
      .dr-foot-btn { padding: 15px 10px; font-size: 13px; }
    }

    @media (max-width: 380px) {
      .dr-foot-btns { flex-direction: column; }
      .dr-foot-btn { width: 100%; }
    }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  const root = document.createElement('div');
  root.id = 'dr-root';
  document.body.appendChild(root);

  /* ─── Banner ──────────────────────────────────────────────────────── */
  const banner = document.createElement('div');
  banner.id = 'dr-banner';
  banner.setAttribute('role', 'region');
  banner.setAttribute('aria-label', 'Cookie consent');
  banner.innerHTML = `
    <div class="dr-b-icon">${SVG.shield}</div>
    <div class="dr-title">We value your privacy</div>
    <div class="dr-desc">
      We use cookies to improve your experience, analyse traffic, and personalise content.
      <a id="dr-b-manage">Manage preferences</a>
    </div>
    <div class="dr-stack">
      <button class="dr-btn dr-btn-accept" id="dr-b-accept">Accept all cookies</button>
      <button class="dr-btn dr-btn-reject" id="dr-b-reject">Reject non-essential</button>
      <button class="dr-ghost" id="dr-b-ghost">I'll decide later</button>
    </div>
  `;
  root.appendChild(banner);
  requestAnimationFrame(() => setTimeout(() => banner.classList.add('dr-show'), 150));

  /* ─── Modal ───────────────────────────────────────────────────────── */
  const overlay = document.createElement('div');
  overlay.id = 'dr-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Cookie preferences');
  overlay.innerHTML = `
    <div class="dr-modal">

      <div class="dr-modal-head">
        <div class="dr-modal-head-row">
          <div class="dr-modal-head-icon">${SVG.shield}</div>
          <div class="dr-modal-head-text">
            <h2>Cookie Preferences</h2>
            <p>Choose which cookies to allow. You can update this at any time from our privacy policy.</p>
          </div>
          <button class="dr-x" id="dr-m-close" aria-label="Close">${SVG.x}</button>
        </div>
      </div>

      <div class="dr-body">

        <div class="dr-cat dr-on">
          <div class="dr-cat-icon ic-essential">${SVG.shield}</div>
          <div class="dr-cat-info">
            <div class="dr-cat-name">Essential <span class="dr-badge">${SVG.lock} Always on</span></div>
            <div class="dr-cat-desc">Required for login, security, and core site functionality. These cannot be disabled.</div>
          </div>
          <div class="dr-cat-right">
            <label class="dr-toggle" aria-label="Essential — always active">
              <input type="checkbox" checked disabled>
              <span class="dr-track"></span>
            </label>
          </div>
        </div>

        <div class="dr-cat" id="dr-row-analytics">
          <div class="dr-cat-icon ic-analytics">${SVG.bar}</div>
          <div class="dr-cat-info">
            <div class="dr-cat-name">Analytics</div>
            <div class="dr-cat-desc">Helps us understand how visitors use the site so we can improve it.</div>
          </div>
          <div class="dr-cat-right">
            <label class="dr-toggle" aria-label="Toggle analytics">
              <input type="checkbox" id="dr-t-analytics">
              <span class="dr-track"></span>
            </label>
          </div>
        </div>

        <div class="dr-cat" id="dr-row-performance">
          <div class="dr-cat-icon ic-perf">${SVG.zap}</div>
          <div class="dr-cat-info">
            <div class="dr-cat-name">Performance</div>
            <div class="dr-cat-desc">Monitors site speed and reliability for a faster, smoother experience.</div>
          </div>
          <div class="dr-cat-right">
            <label class="dr-toggle" aria-label="Toggle performance">
              <input type="checkbox" id="dr-t-performance">
              <span class="dr-track"></span>
            </label>
          </div>
        </div>

        <div class="dr-cat" id="dr-row-marketing">
          <div class="dr-cat-icon ic-marketing">${SVG.target}</div>
          <div class="dr-cat-info">
            <div class="dr-cat-name">Marketing</div>
            <div class="dr-cat-desc">Shows relevant ads and measures campaign effectiveness based on your visits.</div>
          </div>
          <div class="dr-cat-right">
            <label class="dr-toggle" aria-label="Toggle marketing">
              <input type="checkbox" id="dr-t-marketing">
              <span class="dr-track"></span>
            </label>
          </div>
        </div>

      </div>

      <div class="dr-foot">
        <div class="dr-foot-btns">
          <button class="dr-foot-btn dr-foot-reject" id="dr-m-reject">Reject all</button>
          <button class="dr-foot-btn dr-foot-save"   id="dr-m-save">Save preferences</button>
          <button class="dr-foot-btn dr-foot-accept" id="dr-m-accept">Accept all</button>
        </div>
      </div>

    </div>
  `;
  root.appendChild(overlay);

  /* ─── Toggle row highlights ──────────────────────────────────────── */
  ['analytics', 'performance', 'marketing'].forEach(id => {
    const t = document.getElementById(`dr-t-${id}`);
    const r = document.getElementById(`dr-row-${id}`);
    t.addEventListener('change', () => r.classList.toggle('dr-on', t.checked));
  });

  /* ─── Helpers ────────────────────────────────────────────────────── */
  const hideBanner = () => {
    banner.classList.replace('dr-show', 'dr-hide');
    setTimeout(() => banner.remove(), 450);
  };
  const openModal  = () => { overlay.classList.add('dr-show'); document.getElementById('dr-m-close').focus(); };
  const closeModal = () => overlay.classList.remove('dr-show');
  const save = prefs => { localStorage.setItem(KEY, JSON.stringify({ ts: Date.now(), v: 1, ...prefs })); hideBanner(); closeModal(); };
  const acceptAll  = () => save({ essential: true, analytics: true,  performance: true,  marketing: true  });
  const rejectAll  = () => save({ essential: true, analytics: false, performance: false, marketing: false });

  /* ─── Events ─────────────────────────────────────────────────────── */
  document.getElementById('dr-b-accept').addEventListener('click', acceptAll);
  document.getElementById('dr-b-reject').addEventListener('click', rejectAll);
  document.getElementById('dr-b-ghost') .addEventListener('click', closeModal);
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
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('dr-show')) closeModal(); });

  /* Focus trap */
  overlay.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const els = [...overlay.querySelectorAll('button:not([disabled]), input:not([disabled])')];
    if (!els.length) return;
    const first = els[0], last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    if (!e.shiftKey && document.activeElement === last)  { e.preventDefault(); first.focus(); }
  });

})();

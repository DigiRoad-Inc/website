(function () {
  'use strict';

  const KEY = 'dr_cookie_consent';
  const VER = 3;

  if (location.pathname.includes('cookie-settings')) return;

  if (localStorage.getItem(KEY)) return;

  function writeStored(prefs) {
    localStorage.setItem(KEY, JSON.stringify({ ts: Date.now(), v: VER, ...prefs }));
  }

  /* ── CSS ──────────────────────────────────────────────────────────────── */
  const css = `
    #dr-host *, #dr-host *::before, #dr-host *::after {
      box-sizing: border-box; margin: 0; padding: 0;
      -webkit-font-smoothing: antialiased;
      font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    }

    /* ── Shared layer ─────────────────────────────────────────────────── */
    #dr-host {
      position: fixed;
      inset: 0;
      z-index: 99999;
      pointer-events: none;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding: 16px;
    }

    /* ── Banner ───────────────────────────────────────────────────────── */
    #dr-banner {
      pointer-events: auto;
      width: 100%;
      max-width: 720px;
      border-radius: 30px;
      border: 1px solid rgba(255,255,255,0.65);
      background: linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(248,250,252,0.82) 100%);
      backdrop-filter: blur(28px) saturate(180%);
      -webkit-backdrop-filter: blur(28px) saturate(180%);
      box-shadow: 0 28px 80px rgba(15,23,42,0.22);
      padding: 20px;
      color: #0f172a;
      opacity: 0;
      transform: translateY(16px);
      transition: opacity 0.22s ease, transform 0.28s cubic-bezier(0.34,1.08,0.64,1);
    }
    #dr-banner.dr-show { opacity: 1; transform: translateY(0); }
    #dr-banner.dr-hide { opacity: 0; transform: translateY(12px); pointer-events: none; }

    .dr-banner-top {
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }

    .dr-b-icon {
      flex-shrink: 0;
      width: 44px;
      height: 44px;
      border-radius: 16px;
      background: linear-gradient(135deg, #ecfdf5 0%, rgba(209,250,229,0.7) 100%);
      color: #15803d;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 0 1px rgba(187,247,208,0.8);
    }

    .dr-banner-content { flex: 1; min-width: 0; }

    .dr-title {
      font-size: 20px;
      font-weight: 600;
      letter-spacing: -0.03em;
      color: #020617;
      line-height: 1.25;
    }

    .dr-desc {
      margin-top: 8px;
      font-size: 14px;
      line-height: 1.6;
      color: #64748b;
    }

    .dr-manage {
      display: inline-flex;
      margin-top: 20px;
      font-size: 14px;
      font-weight: 500;
      color: #15803d;
      text-decoration: underline;
      text-decoration-color: #86efac;
      text-underline-offset: 4px;
      cursor: pointer;
      background: none;
      border: none;
      padding: 0;
      font-family: inherit;
      transition: color 0.15s;
    }
    .dr-manage:hover { color: #166534; }

    .dr-btns {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
      margin-top: 32px;
    }

    .dr-btn {
      min-height: 48px;
      width: 100%;
      border-radius: 16px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      font-family: inherit;
      line-height: 1;
      padding: 12px 16px;
      transition: all 0.16s ease;
      outline: none;
    }
    .dr-btn:active { transform: scale(0.975); }
    .dr-btn:focus-visible { outline: 2px solid rgba(22,163,74,0.45); outline-offset: 2px; }

    .dr-btn-accept {
      background: #166534;
      color: #fff;
      box-shadow: 0 18px 32px rgba(22,101,52,0.28);
      order: -1;
    }
    .dr-btn-accept:hover { background: #145a2f; }

    .dr-btn-reject {
      border: 1.5px solid rgba(203,213,225,0.8);
      background: rgba(255,255,255,0.72);
      color: #475569;
    }
    .dr-btn-reject:hover { background: #fff; }

    .dr-btn-dismiss {
      border: 1.5px solid rgba(226,232,240,0.9);
      background: rgba(241,245,249,0.9);
      color: #334155;
    }
    .dr-btn-dismiss:hover { background: #f1f5f9; }

    /* ── Overlay ──────────────────────────────────────────────────────── */
    #dr-overlay {
      position: fixed;
      inset: 0;
      z-index: 100000;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    #dr-overlay.dr-open { display: flex; }

    #dr-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(2,6,23,0.35);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }

    /* ── Modal ────────────────────────────────────────────────────────── */
    #dr-modal {
      position: relative;
      width: 100%;
      max-width: 720px;
      max-height: min(92dvh, 760px);
      border-radius: 30px;
      border: 1px solid rgba(255,255,255,0.75);
      background: linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(248,250,252,0.88) 100%);
      backdrop-filter: blur(28px) saturate(180%);
      -webkit-backdrop-filter: blur(28px) saturate(180%);
      box-shadow: 0 24px 60px rgba(15,23,42,0.14);
      color: #0f172a;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      transform: translateY(12px) scale(0.985);
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    #dr-modal.dr-open { opacity: 1; transform: translateY(0) scale(1); }

    /* Subtle top glow */
    #dr-modal::before {
      content: '';
      position: absolute;
      inset-x: 0; top: 0;
      height: 128px;
      background: radial-gradient(circle at top, rgba(16,185,129,0.07), transparent 72%);
      pointer-events: none;
    }

    .dr-modal-inner {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 12px;
      overflow: hidden;
      min-height: 0;
      flex: 1;
    }

    /* Modal header card */
    .dr-modal-head {
      flex-shrink: 0;
      border-radius: 24px;
      border: 1px solid rgba(255,255,255,0.85);
      background: rgba(255,255,255,0.78);
      padding: 14px;
      box-shadow: 0 12px 32px rgba(15,23,42,0.05);
      backdrop-filter: blur(16px);
    }

    .dr-head-row {
      display: flex;
      align-items: flex-start;
      gap: 14px;
    }

    .dr-head-icon {
      flex-shrink: 0;
      width: 44px;
      height: 44px;
      border-radius: 16px;
      background: linear-gradient(135deg, #ecfdf5 0%, rgba(209,250,229,0.7) 100%);
      color: #15803d;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 22px rgba(16,185,129,0.12), 0 0 0 1px rgba(187,247,208,0.8);
    }

    .dr-head-text { flex: 1; min-width: 0; }

    .dr-head-title {
      font-size: clamp(1.35rem, 3vw, 1.75rem);
      font-weight: 600;
      letter-spacing: -0.04em;
      color: #020617;
      line-height: 1.2;
    }

    .dr-head-desc {
      margin-top: 8px;
      font-size: 14px;
      line-height: 1.6;
      color: #64748b;
      max-width: 42ch;
    }

    .dr-head-link {
      display: inline-flex;
      margin-top: 10px;
      font-size: 14px;
      font-weight: 500;
      color: #15803d;
      text-decoration: underline;
      text-decoration-color: #86efac;
      text-underline-offset: 4px;
      transition: color 0.15s;
    }
    .dr-head-link:hover { color: #166534; }

    .dr-close {
      flex-shrink: 0;
      width: 36px;
      height: 36px;
      border-radius: 16px;
      border: 1px solid rgba(203,213,225,0.8);
      background: rgba(255,255,255,0.85);
      color: #94a3b8;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 18px rgba(15,23,42,0.06);
      transition: all 0.15s;
      outline: none;
      font-family: inherit;
    }
    .dr-close:hover { background: #fff; color: #475569; }
    .dr-close:focus-visible { outline: 2px solid rgba(22,163,74,0.45); outline-offset: 2px; }

    /* Category list */
    .dr-cats {
      flex: 1;
      overflow-y: auto;
      min-height: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding-right: 4px;
    }
    .dr-cats::-webkit-scrollbar { width: 4px; }
    .dr-cats::-webkit-scrollbar-track { background: transparent; }
    .dr-cats::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 4px; }

    .dr-cat {
      border-radius: 22px;
      border: 1px solid rgba(255,255,255,0.8);
      background: rgba(255,255,255,0.76);
      padding: 16px;
      box-shadow: 0 12px 30px rgba(15,23,42,0.055);
      backdrop-filter: blur(16px);
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .dr-cat-icon {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 2px;
    }
    .dr-cat-icon-essential { background: linear-gradient(135deg,#ecfdf5,rgba(209,250,229,0.7)); color:#15803d; box-shadow:0 0 0 1px rgba(187,247,208,0.8); }
    .dr-cat-icon-analytics  { background: linear-gradient(135deg,#f0f9ff,rgba(186,230,255,0.7)); color:#0369a1; box-shadow:0 0 0 1px rgba(186,230,255,0.8); }
    .dr-cat-icon-performance{ background: linear-gradient(135deg,#fffbeb,rgba(253,230,138,0.7)); color:#b45309; box-shadow:0 0 0 1px rgba(253,230,138,0.8); }
    .dr-cat-icon-marketing  { background: linear-gradient(135deg,#faf5ff,rgba(233,213,255,0.7)); color:#7c3aed; box-shadow:0 0 0 1px rgba(233,213,255,0.8); }

    .dr-cat-body { flex: 1; min-width: 0; }

    .dr-cat-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .dr-cat-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .dr-cat-title {
      font-size: 16px;
      font-weight: 600;
      letter-spacing: -0.02em;
      color: #0f172a;
    }

    .dr-always-on {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 600;
      color: #15803d;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 999px;
      padding: 2px 9px;
      white-space: nowrap;
    }

    .dr-cat-desc {
      margin-top: 8px;
      font-size: 14px;
      line-height: 1.6;
      color: #64748b;
    }

    /* Toggle */
    .dr-toggle {
      flex-shrink: 0;
      position: relative;
      width: 56px;
      height: 32px;
      cursor: pointer;
    }
    .dr-toggle input {
      position: absolute;
      opacity: 0;
      width: 0; height: 0;
    }
    .dr-toggle-track {
      position: absolute;
      inset: 0;
      border-radius: 999px;
      border: 1.5px solid rgba(203,213,225,0.8);
      background: rgba(203,213,225,0.9);
      transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
    }
    .dr-toggle input:checked ~ .dr-toggle-track {
      background: rgba(52,211,153,0.9);
      border-color: rgba(16,185,129,0.4);
      box-shadow: 0 8px 24px rgba(22,163,74,0.22);
    }
    .dr-toggle input:disabled ~ .dr-toggle-track {
      background: rgba(52,211,153,0.9);
      border-color: rgba(16,185,129,0.4);
      cursor: not-allowed;
      opacity: 0.9;
    }
    .dr-toggle-track::after {
      content: '';
      position: absolute;
      top: 3px; left: 3px;
      width: 22px; height: 22px;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 4px 12px rgba(15,23,42,0.18);
      transition: transform 0.2s ease;
    }
    .dr-toggle input:checked ~ .dr-toggle-track::after { transform: translateX(24px); }
    .dr-toggle:focus-within .dr-toggle-track { outline: 2px solid rgba(22,163,74,0.45); outline-offset: 2px; }

    /* Modal footer card */
    .dr-modal-foot {
      flex-shrink: 0;
      border-radius: 24px;
      border: 1px solid rgba(255,255,255,0.8);
      background: rgba(255,255,255,0.72);
      padding: 12px;
      box-shadow: 0 12px 32px rgba(15,23,42,0.05);
      backdrop-filter: blur(16px);
    }

    .dr-foot-btns {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .dr-foot-btn {
      min-height: 44px;
      flex: 1;
      border-radius: 16px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      line-height: 1;
      padding: 12px 20px;
      transition: all 0.16s ease;
      outline: none;
      border: none;
    }
    .dr-foot-btn:active { transform: scale(0.975); }
    .dr-foot-btn:focus-visible { outline: 2px solid rgba(22,163,74,0.45); outline-offset: 2px; }

    .dr-foot-reject {
      border: 1.5px solid rgba(203,213,225,0.8);
      background: rgba(255,255,255,0.84);
      color: #475569;
    }
    .dr-foot-reject:hover { background: #fff; }

    .dr-foot-save {
      border: 1.5px solid rgba(226,232,240,0.9);
      background: rgba(241,245,249,0.88);
      color: #334155;
    }
    .dr-foot-save:hover { background: #f1f5f9; }

    .dr-foot-accept {
      background: #166534;
      color: #fff;
      box-shadow: 0 14px 24px rgba(22,101,52,0.22);
    }
    .dr-foot-accept:hover { background: #145a2f; }

    /* ── Mobile ───────────────────────────────────────────────────────── */
    @media (min-width: 540px) {
      #dr-host { padding: 24px; }
      #dr-banner { padding: 24px; }
      .dr-modal-inner { padding: 20px; gap: 20px; }
      .dr-modal-head { padding: 20px; }
      .dr-modal-foot { padding: 16px; }
      .dr-foot-btns { flex-direction: row; gap: 12px; }
      .dr-foot-btn { min-height: 48px; }
      .dr-cats { gap: 16px; }
      .dr-head-icon { width: 48px; height: 48px; }
    }

    @media (max-width: 539px) {
      .dr-btns { grid-template-columns: 1fr; }
      .dr-btn-accept { order: 0; }
    }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ── SVG Icons ────────────────────────────────────────────────────────── */
  const SVG = {
    shield: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    bar:    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
    gauge:  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 12 8.56 7.05"/><path d="M12 7v1"/><path d="M17 12h1"/><path d="M12 17v1"/><path d="M7 12H6"/></svg>`,
    target: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
    lock:   `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    x:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  };

  /* ── Root ─────────────────────────────────────────────────────────────── */
  const host = document.createElement('div');
  host.id = 'dr-host';
  document.body.appendChild(host);

  /* ── Banner ───────────────────────────────────────────────────────────── */
  const banner = document.createElement('section');
  banner.id = 'dr-banner';
  banner.setAttribute('aria-label', 'Cookie consent');
  banner.innerHTML = `
    <div class="dr-banner-top">
      <div class="dr-b-icon">${SVG.shield}</div>
      <div class="dr-banner-content">
        <div class="dr-title">We value your privacy</div>
        <div class="dr-desc">We use cookies to improve your experience, analyse traffic, and personalise content.</div>
        <button class="dr-manage" id="dr-b-manage">Manage preferences</button>
      </div>
    </div>
    <div class="dr-btns">
      <button class="dr-btn dr-btn-accept"  id="dr-b-accept">Accept all cookies</button>
      <button class="dr-btn dr-btn-reject"  id="dr-b-reject">Reject non-essential</button>
      <button class="dr-btn dr-btn-dismiss" id="dr-b-dismiss">I'll decide later</button>
    </div>
  `;
  host.appendChild(banner);
  requestAnimationFrame(() => setTimeout(() => banner.classList.add('dr-show'), 80));

  /* ── Modal ────────────────────────────────────────────────────────────── */
  const overlay = document.createElement('div');
  overlay.id = 'dr-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Cookie preferences');
  overlay.innerHTML = `
    <div id="dr-backdrop"></div>
    <div id="dr-modal">
      <div class="dr-modal-inner">

        <header class="dr-modal-head">
          <div class="dr-head-row">
            <div class="dr-head-icon">${SVG.shield}</div>
            <div class="dr-head-text">
              <h2 class="dr-head-title">Cookie Preferences</h2>
              <p class="dr-head-desc">Choose which cookies you allow. You can update this at any time.</p>
              <a href="privacy.html#cookies" class="dr-head-link">Review our Privacy Policy</a>
            </div>
            <button class="dr-close" id="dr-m-close" aria-label="Close">${SVG.x}</button>
          </div>
        </header>

        <section class="dr-cats" aria-label="Cookie categories">

          <div class="dr-cat">
            <div class="dr-cat-icon dr-cat-icon-essential">${SVG.shield}</div>
            <div class="dr-cat-body">
              <div class="dr-cat-top">
                <div class="dr-cat-title-row">
                  <span class="dr-cat-title">Essential</span>
                  <span class="dr-always-on">${SVG.lock} Always on</span>
                </div>
                <label class="dr-toggle">
                  <input type="checkbox" checked disabled aria-label="Essential cookies">
                  <span class="dr-toggle-track"></span>
                </label>
              </div>
              <p class="dr-cat-desc">Required for login, security, and core site functionality. These cannot be disabled.</p>
            </div>
          </div>

          <div class="dr-cat">
            <div class="dr-cat-icon dr-cat-icon-analytics">${SVG.bar}</div>
            <div class="dr-cat-body">
              <div class="dr-cat-top">
                <span class="dr-cat-title">Analytics</span>
                <label class="dr-toggle">
                  <input type="checkbox" id="dr-tog-analytics" aria-label="Analytics cookies">
                  <span class="dr-toggle-track"></span>
                </label>
              </div>
              <p class="dr-cat-desc">Helps us understand how visitors use the site so we can improve journeys and content.</p>
            </div>
          </div>

          <div class="dr-cat">
            <div class="dr-cat-icon dr-cat-icon-performance">${SVG.gauge}</div>
            <div class="dr-cat-body">
              <div class="dr-cat-top">
                <span class="dr-cat-title">Performance</span>
                <label class="dr-toggle">
                  <input type="checkbox" id="dr-tog-performance" aria-label="Performance cookies">
                  <span class="dr-toggle-track"></span>
                </label>
              </div>
              <p class="dr-cat-desc">Monitors site speed and reliability so we can keep the experience fast and stable.</p>
            </div>
          </div>

          <div class="dr-cat">
            <div class="dr-cat-icon dr-cat-icon-marketing">${SVG.target}</div>
            <div class="dr-cat-body">
              <div class="dr-cat-top">
                <span class="dr-cat-title">Marketing</span>
                <label class="dr-toggle">
                  <input type="checkbox" id="dr-tog-marketing" aria-label="Marketing cookies">
                  <span class="dr-toggle-track"></span>
                </label>
              </div>
              <p class="dr-cat-desc">Measures campaign effectiveness and helps show more relevant outreach content.</p>
            </div>
          </div>

        </section>

        <footer class="dr-modal-foot">
          <div class="dr-foot-btns">
            <button class="dr-foot-btn dr-foot-reject"  id="dr-m-reject">Reject all</button>
            <button class="dr-foot-btn dr-foot-save"    id="dr-m-save">Save preferences</button>
            <button class="dr-foot-btn dr-foot-accept"  id="dr-m-accept">Accept all</button>
          </div>
        </footer>

      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  /* ── Logic ────────────────────────────────────────────────────────────── */
  const modal = document.getElementById('dr-modal');

  function getPrefs() {
    return {
      essential:   true,
      analytics:   document.getElementById('dr-tog-analytics').checked,
      performance: document.getElementById('dr-tog-performance').checked,
      marketing:   document.getElementById('dr-tog-marketing').checked,
    };
  }

  function save(prefs) {
    writeStored(prefs);
    hideBanner();
    closeModal();
    setTimeout(() => { host.remove(); overlay.remove(); }, 300);
  }

  function acceptAll() { save({ essential: true, analytics: true, performance: true, marketing: true }); }
  function rejectAll()  { save({ essential: true, analytics: false, performance: false, marketing: false }); }

  function openModal() {
    banner.classList.add('dr-hide');
    overlay.classList.add('dr-open');
    requestAnimationFrame(() => modal.classList.add('dr-open'));
    document.body.style.overflow = 'hidden';
    document.getElementById('dr-m-close').focus();
  }

  function closeModal() {
    modal.classList.remove('dr-open');
    overlay.classList.remove('dr-open');
    document.body.style.overflow = '';
    banner.classList.remove('dr-hide');
  }

  function hideBanner() {
    banner.classList.remove('dr-show');
    banner.classList.add('dr-hide');
  }

  document.getElementById('dr-b-accept').addEventListener('click', acceptAll);
  document.getElementById('dr-b-reject').addEventListener('click', rejectAll);
  document.getElementById('dr-b-dismiss').addEventListener('click', () => {
    save({ essential: true, analytics: false, performance: false, marketing: false });
  });
  document.getElementById('dr-b-manage').addEventListener('click', openModal);
  document.getElementById('dr-backdrop').addEventListener('click', closeModal);
  document.getElementById('dr-m-close').addEventListener('click', closeModal);
  document.getElementById('dr-m-accept').addEventListener('click', acceptAll);
  document.getElementById('dr-m-reject').addEventListener('click', rejectAll);
  document.getElementById('dr-m-save').addEventListener('click', () => save(getPrefs()));

  /* Auto-save when modal toggles change */
  ['dr-tog-analytics', 'dr-tog-performance', 'dr-tog-marketing'].forEach(id => {
    document.getElementById(id).addEventListener('change', () => writeStored(getPrefs()));
  });

  /* Escape key + focus trap */
  document.addEventListener('keydown', function (e) {
    if (!overlay.classList.contains('dr-open')) return;
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key !== 'Tab') return;
    const els = Array.from(modal.querySelectorAll('button:not([disabled]),a[href],input:not([disabled])'));
    if (!els.length) return;
    const first = els[0], last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
})();

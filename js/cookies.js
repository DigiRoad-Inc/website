(function () {
  'use strict';

  const KEY = 'dr_cookie_consent';
  if (localStorage.getItem(KEY)) return;

  /* ── SVG icons ─────────────────────────────────────────────────────────── */
  const ICON = {
    shield: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    bar:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
    zap:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    target: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
    x:      `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  };

  /* ── Styles ─────────────────────────────────────────────────────────────── */
  const css = `
    #dr-root *, #dr-root *::before, #dr-root *::after {
      box-sizing: border-box; margin: 0; padding: 0;
      -webkit-font-smoothing: antialiased;
      font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
    }

    /* ══════════════════════════════════════
       BANNER
    ══════════════════════════════════════ */
    #dr-banner {
      position: fixed;
      bottom: 32px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      opacity: 0;
      z-index: 99998;
      width: calc(100vw - 48px);
      max-width: 400px;

      /* Dark glassmorphism */
      background: rgba(7, 28, 20, 0.88);
      backdrop-filter: blur(28px) saturate(160%);
      -webkit-backdrop-filter: blur(28px) saturate(160%);
      border: 1px solid rgba(16, 185, 129, 0.18);
      border-radius: 20px;
      box-shadow:
        0 0 0 1px rgba(255,255,255,0.04) inset,
        0 8px 24px rgba(0,0,0,0.22),
        0 32px 64px rgba(0,0,0,0.18),
        0 0 80px rgba(16,185,129,0.06);

      padding: 36px 32px 32px;
      display: flex;
      flex-direction: column;
      gap: 0;

      transition: opacity 0.4s ease, transform 0.5s cubic-bezier(0.34,1.15,0.64,1);
      will-change: transform, opacity;
    }
    #dr-banner.dr-show { opacity:1; transform:translateX(-50%) translateY(0); }
    #dr-banner.dr-hide { opacity:0; transform:translateX(-50%) translateY(14px); pointer-events:none; }

    /* Title */
    #dr-banner .dr-title {
      font-size: 18px;
      font-weight: 700;
      color: #f0fdf4;
      letter-spacing: -0.03em;
      line-height: 1.2;
      margin-bottom: 12px;
    }

    /* Description */
    #dr-banner .dr-desc {
      font-size: 13.5px;
      color: rgba(209, 250, 229, 0.6);
      line-height: 1.7;
      margin-bottom: 10px;
    }

    /* Inline link */
    #dr-banner .dr-link {
      font-size: 13.5px;
      font-weight: 500;
      color: #10b981;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 28px;
      transition: color 0.15s;
    }
    #dr-banner .dr-link:hover { color: #34d399; }
    #dr-banner .dr-link svg {
      transition: transform 0.15s;
    }
    #dr-banner .dr-link:hover svg { transform: translateX(2px); }

    /* Button stack */
    #dr-banner .dr-btn-stack {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    /* ── Buttons ── */
    .dr-btn {
      width: 100%;
      font-size: 14px;
      font-weight: 600;
      border-radius: 7px;
      padding: 14px 24px;
      cursor: pointer;
      border: 1px solid transparent;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      letter-spacing: -0.01em;
      transition: all 0.18s ease;
      outline: none;
    }
    .dr-btn:focus-visible {
      box-shadow: 0 0 0 3px rgba(16,185,129,0.4);
    }
    .dr-btn:active { transform: scale(0.98); }

    /* Accept — solid green */
    .dr-btn-accept {
      background: #10b981;
      color: #fff;
      border-color: #10b981;
      box-shadow: 0 1px 0 rgba(255,255,255,0.12) inset, 0 2px 12px rgba(16,185,129,0.3);
    }
    .dr-btn-accept:hover {
      background: #059669;
      border-color: #059669;
      box-shadow: 0 1px 0 rgba(255,255,255,0.12) inset, 0 4px 20px rgba(16,185,129,0.45);
      transform: translateY(-1px);
    }

    /* Reject — subtle outline */
    .dr-btn-reject {
      background: rgba(255,255,255,0.05);
      color: rgba(209,250,229,0.65);
      border-color: rgba(209,250,229,0.12);
    }
    .dr-btn-reject:hover {
      background: rgba(255,255,255,0.09);
      color: rgba(209,250,229,0.9);
      border-color: rgba(209,250,229,0.22);
    }

    /* ══════════════════════════════════════
       OVERLAY
    ══════════════════════════════════════ */
    #dr-overlay {
      position: fixed;
      inset: 0;
      background: rgba(1, 12, 9, 0.6);
      backdrop-filter: blur(10px) saturate(120%);
      -webkit-backdrop-filter: blur(10px) saturate(120%);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.28s ease;
    }
    #dr-overlay.dr-show { opacity:1; pointer-events:all; }

    /* ══════════════════════════════════════
       MODAL CARD
    ══════════════════════════════════════ */
    .dr-modal {
      background: rgba(7, 28, 20, 0.92);
      backdrop-filter: blur(32px) saturate(160%);
      -webkit-backdrop-filter: blur(32px) saturate(160%);
      border: 1px solid rgba(16,185,129,0.18);
      border-radius: 20px;
      box-shadow:
        0 0 0 1px rgba(255,255,255,0.04) inset,
        0 8px 24px rgba(0,0,0,0.3),
        0 32px 64px rgba(0,0,0,0.25);
      width: 100%;
      max-width: 460px;
      max-height: calc(100vh - 40px);
      overflow-y: auto;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
      transform: translateY(16px) scale(0.98);
      transition: transform 0.38s cubic-bezier(0.34,1.15,0.64,1);
      scrollbar-width: thin;
      scrollbar-color: rgba(16,185,129,0.15) transparent;
    }
    #dr-overlay.dr-show .dr-modal { transform: translateY(0) scale(1); }

    /* Modal header */
    .dr-modal-head {
      padding: 24px 24px 18px;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      border-bottom: 1px solid rgba(209,250,229,0.07);
    }
    .dr-modal-head h2 {
      font-size: 17px;
      font-weight: 700;
      color: #f0fdf4;
      letter-spacing: -0.025em;
      margin-bottom: 5px;
    }
    .dr-modal-head p {
      font-size: 12.5px;
      color: rgba(209,250,229,0.45);
      line-height: 1.55;
    }
    .dr-x {
      width: 30px; height: 30px;
      border-radius: 7px;
      background: rgba(209,250,229,0.06);
      border: 1px solid rgba(209,250,229,0.08);
      color: rgba(209,250,229,0.4);
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      transition: all 0.15s;
      margin-top: 2px;
    }
    .dr-x:hover { background: rgba(209,250,229,0.1); color: rgba(209,250,229,0.8); }
    .dr-x:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(16,185,129,0.35); }

    /* Categories */
    .dr-cats { padding: 14px 16px 10px; display: flex; flex-direction: column; gap: 8px; }

    .dr-cat {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 16px;
      border-radius: 10px;
      border: 1px solid rgba(209,250,229,0.06);
      background: rgba(209,250,229,0.03);
      transition: border-color 0.2s, background 0.2s;
    }
    .dr-cat.dr-on {
      border-color: rgba(16,185,129,0.25);
      background: rgba(16,185,129,0.07);
    }

    .dr-cat-icon {
      width: 32px; height: 32px;
      border-radius: 8px;
      background: rgba(209,250,229,0.06);
      border: 1px solid rgba(209,250,229,0.08);
      color: rgba(209,250,229,0.35);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      transition: all 0.2s;
    }
    .dr-cat.dr-on .dr-cat-icon {
      background: rgba(16,185,129,0.12);
      border-color: rgba(16,185,129,0.2);
      color: #10b981;
    }

    .dr-cat-info { flex: 1; min-width: 0; }
    .dr-cat-name {
      display: flex; align-items: center; gap: 7px;
      font-size: 13px; font-weight: 600;
      color: rgba(209,250,229,0.9);
      margin-bottom: 2px;
    }
    .dr-cat-desc {
      font-size: 11.5px;
      color: rgba(209,250,229,0.4);
      line-height: 1.5;
    }

    .dr-badge {
      font-size: 9px; font-weight: 700;
      letter-spacing: 0.06em; text-transform: uppercase;
      color: #10b981;
      background: rgba(16,185,129,0.15);
      border: 1px solid rgba(16,185,129,0.2);
      border-radius: 4px;
      padding: 2px 5px;
    }

    /* Toggle */
    .dr-toggle { position: relative; width: 36px; height: 20px; flex-shrink: 0; }
    .dr-toggle input { position: absolute; opacity:0; width:0; height:0; }
    .dr-track {
      position: absolute; inset: 0;
      background: rgba(209,250,229,0.12);
      border-radius: 99px;
      border: 1px solid rgba(209,250,229,0.1);
      cursor: pointer;
      transition: background 0.22s, border-color 0.22s;
    }
    .dr-toggle input:checked  ~ .dr-track { background: #10b981; border-color: #10b981; }
    .dr-toggle input:disabled ~ .dr-track { background: rgba(16,185,129,0.5); border-color: transparent; cursor: not-allowed; }
    .dr-track::after {
      content: '';
      position: absolute;
      top: 2px; left: 2px;
      width: 14px; height: 14px;
      background: #fff;
      border-radius: 50%;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      transition: transform 0.22s cubic-bezier(0.34,1.3,0.64,1);
    }
    .dr-toggle input:checked ~ .dr-track::after { transform: translateX(16px); }
    .dr-toggle:focus-within .dr-track { box-shadow: 0 0 0 3px rgba(16,185,129,0.3); }

    /* Modal footer */
    .dr-modal-foot {
      padding: 14px 16px 20px;
      display: flex;
      gap: 8px;
      border-top: 1px solid rgba(209,250,229,0.07);
      flex-shrink: 0;
    }
    .dr-modal-foot .dr-btn {
      flex: 1;
      padding: 12px 10px;
      font-size: 12.5px;
      border-radius: 7px;
      white-space: nowrap;
    }
    /* Re-style for modal context */
    .dr-modal-foot .dr-btn-reject {
      color: rgba(209,250,229,0.5);
    }
    .dr-modal-foot .dr-btn-save {
      background: rgba(209,250,229,0.08);
      color: rgba(209,250,229,0.8);
      border-color: rgba(209,250,229,0.1);
    }
    .dr-modal-foot .dr-btn-save:hover {
      background: rgba(209,250,229,0.13);
      color: #f0fdf4;
      border-color: rgba(209,250,229,0.18);
    }

    /* ══════════════════════════════════════
       MOBILE
    ══════════════════════════════════════ */
    @media (max-width: 480px) {
      #dr-banner { bottom: 16px; width: calc(100vw - 24px); padding: 22px; }
      #dr-banner .dr-title { font-size: 16px; }
    }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ── Root ───────────────────────────────────────────────────────────────── */
  const root = document.createElement('div');
  root.id = 'dr-root';
  document.body.appendChild(root);

  /* ── Banner ─────────────────────────────────────────────────────────────── */
  const banner = document.createElement('div');
  banner.id = 'dr-banner';
  banner.setAttribute('role', 'region');
  banner.setAttribute('aria-label', 'Cookie consent');
  banner.innerHTML = `
    <div class="dr-title">Choose your cookies</div>
    <div class="dr-desc">We use cookies to improve your experience, analyse usage, and personalise content. You're in control.</div>
    <a href="#" class="dr-link" id="dr-b-manage">
      Learn more and manage
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
    </a>
    <div class="dr-btn-stack">
      <button class="dr-btn dr-btn-accept" id="dr-b-accept" aria-label="Accept all cookies">Accept all</button>
      <button class="dr-btn dr-btn-reject" id="dr-b-reject" aria-label="Reject non-essential cookies">Reject non-essential cookies</button>
    </div>
  `;
  root.appendChild(banner);
  requestAnimationFrame(() => setTimeout(() => banner.classList.add('dr-show'), 200));

  /* ── Modal ──────────────────────────────────────────────────────────────── */
  const overlay = document.createElement('div');
  overlay.id = 'dr-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Cookie preferences');
  overlay.innerHTML = `
    <div class="dr-modal">
      <div class="dr-modal-head">
        <div>
          <h2>Cookie Preferences</h2>
          <p>Choose which cookies you allow. You can update this any time.</p>
        </div>
        <button class="dr-x" id="dr-m-close" aria-label="Close">${ICON.x}</button>
      </div>

      <div class="dr-cats">
        <div class="dr-cat dr-on">
          <div class="dr-cat-icon">${ICON.shield}</div>
          <div class="dr-cat-info">
            <div class="dr-cat-name">Essential <span class="dr-badge">Always on</span></div>
            <div class="dr-cat-desc">Required for login, security, and core site functionality.</div>
          </div>
          <label class="dr-toggle" aria-label="Essential — always active">
            <input type="checkbox" checked disabled>
            <span class="dr-track"></span>
          </label>
        </div>

        <div class="dr-cat" id="dr-row-analytics">
          <div class="dr-cat-icon">${ICON.bar}</div>
          <div class="dr-cat-info">
            <div class="dr-cat-name">Analytics</div>
            <div class="dr-cat-desc">Helps us understand how visitors use the site so we can improve it.</div>
          </div>
          <label class="dr-toggle" aria-label="Toggle analytics cookies">
            <input type="checkbox" id="dr-t-analytics">
            <span class="dr-track"></span>
          </label>
        </div>

        <div class="dr-cat" id="dr-row-performance">
          <div class="dr-cat-icon">${ICON.zap}</div>
          <div class="dr-cat-info">
            <div class="dr-cat-name">Performance</div>
            <div class="dr-cat-desc">Monitors site speed and reliability for a faster experience.</div>
          </div>
          <label class="dr-toggle" aria-label="Toggle performance cookies">
            <input type="checkbox" id="dr-t-performance">
            <span class="dr-track"></span>
          </label>
        </div>

        <div class="dr-cat" id="dr-row-marketing">
          <div class="dr-cat-icon">${ICON.target}</div>
          <div class="dr-cat-info">
            <div class="dr-cat-name">Marketing</div>
            <div class="dr-cat-desc">Shows relevant content and measures campaign effectiveness.</div>
          </div>
          <label class="dr-toggle" aria-label="Toggle marketing cookies">
            <input type="checkbox" id="dr-t-marketing">
            <span class="dr-track"></span>
          </label>
        </div>
      </div>

      <div class="dr-modal-foot">
        <button class="dr-btn dr-btn-reject"  id="dr-m-reject">Reject all</button>
        <button class="dr-btn dr-btn-save"    id="dr-m-save">Save preferences</button>
        <button class="dr-btn dr-btn-accept"  id="dr-m-accept">Accept all</button>
      </div>
    </div>
  `;
  root.appendChild(overlay);

  /* ── Toggle highlights ──────────────────────────────────────────────────── */
  ['analytics', 'performance', 'marketing'].forEach(id => {
    const t = document.getElementById(`dr-t-${id}`);
    const r = document.getElementById(`dr-row-${id}`);
    t.addEventListener('change', () => r.classList.toggle('dr-on', t.checked));
  });

  /* ── Helpers ────────────────────────────────────────────────────────────── */
  const hideBanner = () => {
    banner.classList.replace('dr-show', 'dr-hide');
    setTimeout(() => banner.remove(), 450);
  };
  const openModal  = () => { overlay.classList.add('dr-show'); document.getElementById('dr-m-close').focus(); };
  const closeModal = () => overlay.classList.remove('dr-show');
  const save = p => {
    localStorage.setItem(KEY, JSON.stringify({ ts: Date.now(), v: 1, ...p }));
    hideBanner(); closeModal();
  };
  const acceptAll = () => save({ essential:true, analytics:true, performance:true, marketing:true });
  const rejectAll = () => save({ essential:true, analytics:false, performance:false, marketing:false });

  /* ── Events ─────────────────────────────────────────────────────────────── */
  document.getElementById('dr-b-accept').addEventListener('click', acceptAll);
  document.getElementById('dr-b-reject').addEventListener('click', rejectAll);
  document.getElementById('dr-b-manage').addEventListener('click', e => { e.preventDefault(); openModal(); });
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
    const els = [...overlay.querySelectorAll('button:not([disabled]), input:not([disabled])')];
    if (!els.length) return;
    const [first, last] = [els[0], els[els.length - 1]];
    if (e.shiftKey && document.activeElement === first)  { e.preventDefault(); last.focus(); }
    if (!e.shiftKey && document.activeElement === last)  { e.preventDefault(); first.focus(); }
  });

})();

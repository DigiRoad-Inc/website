(function () {
  const STORAGE_KEY = 'dr_cookie_consent';
  if (localStorage.getItem(STORAGE_KEY)) return;

  /* ── Styles ──────────────────────────────────────────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
    #dr-cookie-banner *, #dr-cookie-modal * {
      box-sizing: border-box; margin: 0; padding: 0;
    }

    /* ── Banner ── */
    #dr-cookie-banner {
      position: fixed;
      bottom: 28px;
      left: 50%;
      transform: translateX(-50%) translateY(140px);
      opacity: 0;
      width: calc(100% - 48px);
      max-width: 780px;
      background: #0b2e26;
      border: 1px solid rgba(209,250,229,0.1);
      border-radius: 14px;
      padding: 18px 20px;
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
      z-index: 99999;
      box-shadow: 0 12px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(16,185,129,0.06);
      transition: transform 0.45s cubic-bezier(0.34,1.3,0.64,1), opacity 0.35s ease;
      font-family: Inter, -apple-system, sans-serif;
    }
    #dr-cookie-banner.dr-visible {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
    #dr-cookie-banner p {
      flex: 1;
      font-size: 13px;
      line-height: 1.6;
      color: rgba(209,250,229,0.6);
      min-width: 220px;
    }
    #dr-cookie-banner p strong {
      color: #d1fae5;
      font-weight: 600;
    }
    #dr-cookie-banner p a {
      color: #10b981;
      text-decoration: none;
    }
    #dr-cookie-banner p a:hover {
      text-decoration: underline;
    }
    .dr-banner-actions {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
      align-items: center;
    }

    /* ── Shared button base ── */
    .dr-btn {
      font-family: Inter, -apple-system, sans-serif;
      font-size: 13px;
      font-weight: 600;
      border-radius: 7px;
      padding: 9px 18px;
      cursor: pointer;
      border: none;
      white-space: nowrap;
      line-height: 1;
      transition: background 0.15s, box-shadow 0.15s, transform 0.1s, opacity 0.15s, border-color 0.15s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .dr-btn:active { transform: scale(0.97); }

    /* Accept All — solid green */
    .dr-btn-accept {
      background: #10b981;
      color: #fff;
    }
    .dr-btn-accept:hover {
      background: #0ea570;
      box-shadow: 0 4px 14px rgba(16,185,129,0.35);
    }

    /* Reject All — subtle outline */
    .dr-btn-reject {
      background: transparent;
      color: rgba(209,250,229,0.55);
      border: 1.5px solid rgba(209,250,229,0.15);
    }
    .dr-btn-reject:hover {
      color: #d1fae5;
      border-color: rgba(209,250,229,0.35);
      background: rgba(209,250,229,0.05);
    }

    /* Manage — muted filled */
    .dr-btn-manage {
      background: rgba(209,250,229,0.07);
      color: rgba(209,250,229,0.8);
      border: 1.5px solid rgba(209,250,229,0.1);
    }
    .dr-btn-manage:hover {
      background: rgba(209,250,229,0.12);
      color: #d1fae5;
    }

    /* Save / confirm inside modal */
    .dr-btn-save {
      background: #10b981;
      color: #fff;
      flex: 1;
    }
    .dr-btn-save:hover {
      background: #0ea570;
      box-shadow: 0 4px 14px rgba(16,185,129,0.35);
    }

    /* ── Modal overlay ── */
    #dr-cookie-modal {
      position: fixed;
      inset: 0;
      background: rgba(1,13,10,0.72);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      z-index: 100000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      font-family: Inter, -apple-system, sans-serif;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease;
    }
    #dr-cookie-modal.dr-visible {
      opacity: 1;
      pointer-events: all;
    }

    /* ── Modal card ── */
    .dr-modal-card {
      background: #0b2e26;
      border: 1px solid rgba(209,250,229,0.1);
      border-radius: 16px;
      width: 100%;
      max-width: 500px;
      max-height: 88vh;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0;
      box-shadow: 0 24px 64px rgba(0,0,0,0.55);
      transform: translateY(16px) scale(0.98);
      transition: transform 0.3s cubic-bezier(0.34,1.2,0.64,1);
    }
    #dr-cookie-modal.dr-visible .dr-modal-card {
      transform: translateY(0) scale(1);
    }

    /* Modal header */
    .dr-modal-head {
      padding: 24px 24px 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .dr-modal-head h2 {
      font-size: 17px;
      font-weight: 700;
      color: #d1fae5;
      letter-spacing: -0.02em;
    }
    .dr-modal-close {
      background: rgba(209,250,229,0.07);
      border: 1px solid rgba(209,250,229,0.1);
      color: rgba(209,250,229,0.5);
      cursor: pointer;
      width: 28px;
      height: 28px;
      border-radius: 7px;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s, color 0.15s;
      flex-shrink: 0;
    }
    .dr-modal-close:hover {
      background: rgba(209,250,229,0.12);
      color: #d1fae5;
    }

    /* Modal description */
    .dr-modal-desc {
      padding: 12px 24px 20px;
      font-size: 13px;
      color: rgba(209,250,229,0.5);
      line-height: 1.65;
      border-bottom: 1px solid rgba(209,250,229,0.07);
    }

    /* Category list */
    .dr-categories {
      padding: 16px 24px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .dr-category {
      background: rgba(209,250,229,0.03);
      border: 1px solid rgba(209,250,229,0.07);
      border-radius: 10px;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 14px;
      transition: border-color 0.2s, background 0.2s;
    }
    .dr-category:has(input:checked) {
      border-color: rgba(16,185,129,0.25);
      background: rgba(16,185,129,0.05);
    }
    .dr-category-icon {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      background: rgba(16,185,129,0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: #10b981;
      font-size: 15px;
    }
    .dr-category-text { flex: 1; }
    .dr-category-text h3 {
      font-size: 13.5px;
      font-weight: 600;
      color: #d1fae5;
      margin-bottom: 2px;
    }
    .dr-category-text p {
      font-size: 12px;
      color: rgba(209,250,229,0.45);
      line-height: 1.5;
    }
    .dr-category-badge {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.04em;
      color: rgba(209,250,229,0.35);
      background: rgba(209,250,229,0.06);
      border: 1px solid rgba(209,250,229,0.1);
      border-radius: 4px;
      padding: 2px 6px;
      white-space: nowrap;
    }

    /* Toggle */
    .dr-toggle {
      position: relative;
      width: 38px;
      height: 22px;
      flex-shrink: 0;
    }
    .dr-toggle input {
      opacity: 0;
      width: 0;
      height: 0;
      position: absolute;
    }
    .dr-toggle-track {
      position: absolute;
      inset: 0;
      background: rgba(209,250,229,0.1);
      border-radius: 99px;
      cursor: pointer;
      transition: background 0.2s;
      border: 1px solid rgba(209,250,229,0.1);
    }
    .dr-toggle input:checked + .dr-toggle-track {
      background: #10b981;
      border-color: #10b981;
    }
    .dr-toggle input:disabled + .dr-toggle-track {
      cursor: not-allowed;
      background: rgba(16,185,129,0.4);
      border-color: transparent;
    }
    .dr-toggle-track::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 16px;
      height: 16px;
      background: #fff;
      border-radius: 50%;
      transition: transform 0.2s cubic-bezier(0.34,1.4,0.64,1);
      box-shadow: 0 1px 4px rgba(0,0,0,0.25);
    }
    .dr-toggle input:checked + .dr-toggle-track::after {
      transform: translateX(16px);
    }

    /* Modal footer */
    .dr-modal-foot {
      padding: 16px 24px 24px;
      display: flex;
      gap: 8px;
      border-top: 1px solid rgba(209,250,229,0.07);
    }
    .dr-modal-foot .dr-btn { flex: 1; padding: 10px 16px; }

    @media (max-width: 500px) {
      #dr-cookie-banner { bottom: 16px; padding: 16px; gap: 12px; }
      .dr-banner-actions { width: 100%; }
      .dr-banner-actions .dr-btn { flex: 1; }
      .dr-modal-card { border-radius: 14px; }
    }
  `;
  document.head.appendChild(style);

  /* ── Banner ──────────────────────────────────────────────────────────── */
  const banner = document.createElement('div');
  banner.id = 'dr-cookie-banner';
  banner.innerHTML = `
    <p><strong>We use cookies.</strong> Some are essential, others help us improve your experience. See our <a href="privacy.html">Privacy Policy</a>.</p>
    <div class="dr-banner-actions">
      <button class="dr-btn dr-btn-reject" id="dr-reject-all">Reject All</button>
      <button class="dr-btn dr-btn-manage" id="dr-manage">Manage Preferences</button>
      <button class="dr-btn dr-btn-accept" id="dr-accept-all">Accept All</button>
    </div>
  `;
  document.body.appendChild(banner);
  requestAnimationFrame(() => setTimeout(() => banner.classList.add('dr-visible'), 120));

  /* ── Modal ───────────────────────────────────────────────────────────── */
  const modal = document.createElement('div');
  modal.id = 'dr-cookie-modal';
  modal.innerHTML = `
    <div class="dr-modal-card">

      <div class="dr-modal-head">
        <h2>Cookie Preferences</h2>
        <button class="dr-modal-close" id="dr-modal-close" aria-label="Close">&#x2715;</button>
      </div>

      <p class="dr-modal-desc">
        Control which cookies you allow. You can update these preferences at any time.
        Necessary cookies keep the site working and cannot be turned off.
      </p>

      <div class="dr-categories">

        <div class="dr-category">
          <div class="dr-category-icon">🔒</div>
          <div class="dr-category-text">
            <h3>Necessary</h3>
            <p>Required for the site to function — login sessions, security, and core features.</p>
          </div>
          <span class="dr-category-badge">Always on</span>
          <label class="dr-toggle">
            <input type="checkbox" checked disabled>
            <span class="dr-toggle-track"></span>
          </label>
        </div>

        <div class="dr-category">
          <div class="dr-category-icon">📊</div>
          <div class="dr-category-text">
            <h3>Analytics</h3>
            <p>Helps us understand how visitors use the site so we can make it better.</p>
          </div>
          <label class="dr-toggle">
            <input type="checkbox" id="dr-toggle-analytics">
            <span class="dr-toggle-track"></span>
          </label>
        </div>

        <div class="dr-category">
          <div class="dr-category-icon">🎯</div>
          <div class="dr-category-text">
            <h3>Marketing</h3>
            <p>Used to show relevant content and measure the effectiveness of campaigns.</p>
          </div>
          <label class="dr-toggle">
            <input type="checkbox" id="dr-toggle-marketing">
            <span class="dr-toggle-track"></span>
          </label>
        </div>

        <div class="dr-category">
          <div class="dr-category-icon">⚙️</div>
          <div class="dr-category-text">
            <h3>Preferences</h3>
            <p>Remembers your settings like language and region across visits.</p>
          </div>
          <label class="dr-toggle">
            <input type="checkbox" id="dr-toggle-preferences">
            <span class="dr-toggle-track"></span>
          </label>
        </div>

      </div>

      <div class="dr-modal-foot">
        <button class="dr-btn dr-btn-reject" id="dr-reject-modal">Reject All</button>
        <button class="dr-btn dr-btn-save" id="dr-save-prefs">Save Preferences</button>
      </div>

    </div>
  `;
  document.body.appendChild(modal);

  /* ── Helpers ─────────────────────────────────────────────────────────── */
  function hideBanner() {
    banner.classList.remove('dr-visible');
    setTimeout(() => banner.remove(), 450);
  }
  function openModal()  { modal.classList.add('dr-visible'); }
  function closeModal() { modal.classList.remove('dr-visible'); }

  function saveConsent(prefs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ts: Date.now(), ...prefs }));
    hideBanner();
    closeModal();
  }

  /* ── Events ──────────────────────────────────────────────────────────── */
  document.getElementById('dr-accept-all').addEventListener('click', () =>
    saveConsent({ necessary: true, analytics: true, marketing: true, preferences: true })
  );
  document.getElementById('dr-reject-all').addEventListener('click', () =>
    saveConsent({ necessary: true, analytics: false, marketing: false, preferences: false })
  );
  document.getElementById('dr-manage').addEventListener('click', openModal);
  document.getElementById('dr-modal-close').addEventListener('click', closeModal);
  document.getElementById('dr-reject-modal').addEventListener('click', () =>
    saveConsent({ necessary: true, analytics: false, marketing: false, preferences: false })
  );
  document.getElementById('dr-save-prefs').addEventListener('click', () =>
    saveConsent({
      necessary:   true,
      analytics:   document.getElementById('dr-toggle-analytics').checked,
      marketing:   document.getElementById('dr-toggle-marketing').checked,
      preferences: document.getElementById('dr-toggle-preferences').checked,
    })
  );
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
})();

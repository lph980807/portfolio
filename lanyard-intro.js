// ── ReflectiveCard intro ──

(function() {
  const overlay = document.getElementById('lanyard-overlay');
  const mainSite = document.getElementById('main-site');
  if (!overlay) return;

  // Create card HTML
  overlay.innerHTML = `
    <div class="target-cursor-wrapper">
      <div class="target-cursor-dot"></div>
      <div class="target-cursor-corner corner-tl"></div>
      <div class="target-cursor-corner corner-tr"></div>
      <div class="target-cursor-corner corner-br"></div>
      <div class="target-cursor-corner corner-bl"></div>
    </div>
    <div class="reflective-card-container cursor-target">
      <svg class="reflective-svg-filters" aria-hidden="true">
        <defs>
          <filter id="metallic-displacement" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="turbulence" baseFrequency="0.025" numOctaves="2" result="noise" />
            <feColorMatrix in="noise" type="luminanceToAlpha" result="noiseAlpha" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="22" xChannelSelector="R" yChannelSelector="G" result="rippled" />
            <feSpecularLighting in="noiseAlpha" surfaceScale="22" specularConstant="1.5" specularExponent="20" lightingColor="#ffffff" result="light">
              <fePointLight x="0" y="0" z="300" />
            </feSpecularLighting>
            <feComposite in="light" in2="rippled" operator="in" result="light-effect" />
            <feBlend in="light-effect" in2="rippled" mode="screen" result="metallic-result" />
          </filter>
        </defs>
      </svg>

      <video id="reflective-webcam" autoplay playsInline muted class="reflective-video-bg"></video>
      <div class="reflective-noise-layer"></div>
      <div class="reflective-sheen-layer"></div>
      <div class="reflective-border-layer"></div>

      <div class="reflective-card-content">
        <div class="ref-card-header">
          <div class="ref-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span>SECURE ACCESS</span>
          </div>
          <svg class="ref-status-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg>
        </div>

        <div class="ref-card-body">
          <div class="ref-avatar-wrap">
            <img class="ref-avatar" src="assets/avatar.jpg" alt="" />
          </div>
          <div class="ref-user-info">
            <h2 class="ref-user-name">李品宏</h2>
            <p class="ref-user-role">STUDENT · SOFTWARE ENGINEER</p>
          </div>
          <p class="ref-click-hint">點我</p>
        </div>

        <div class="ref-card-footer">
          <div class="ref-id-section">
            <span class="ref-id-label">ID NUMBER</span>
            <span class="ref-id-value">LPH-0807</span>
          </div>
          <div class="ref-fingerprint">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M2 12a10 10 0 0 1 18-6"/><path d="M2 16h.01"/><path d="M21.8 16c.2-2 .13-4.36.2-6"/><path d="M9 19.4c.6.54 1.53.6 2.5.6"/></svg>
          </div>
        </div>
      </div>

      <p class="reflective-hint">點擊卡片進入</p>
    </div>
  `;

  const container = overlay.querySelector('.reflective-card-container');

  // Static background (no webcam)
  const video = overlay.querySelector('.reflective-video-bg');
  if (video) video.remove();
  container.style.background = 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)';

  // Init TargetCursor
  const gsap = window.gsap;
  if (gsap) {
    const cursor = overlay.querySelector('.target-cursor-wrapper');
    const dot = overlay.querySelector('.target-cursor-dot');
    const corners = overlay.querySelectorAll('.target-cursor-corner');
    if (cursor && corners.length) {
      overlay.style.cursor = 'none';

      gsap.set(cursor, { xPercent: -50, yPercent: -50, x: window.innerWidth / 2, y: window.innerHeight / 2 });

      const spin = gsap.timeline({ repeat: -1 }).to(cursor, { rotation: '+=360', duration: 2.5, ease: 'none' });

      window.addEventListener('mousemove', (e) => {
        gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1, ease: 'power3.out' });
      });

      window.addEventListener('mousedown', () => gsap.to(dot, { scale: 0.7, duration: 0.2 }));
      window.addEventListener('mouseup', () => gsap.to(dot, { scale: 1, duration: 0.2 }));

      // Hover on card – lock corners to card edges
      const card = overlay.querySelector('.cursor-target');
      let targetCornerPos = null;
      let tickerFn = null;

      if (card) {
        card.addEventListener('mouseenter', () => {
          spin.pause();
          gsap.to(cursor, { rotation: 0, duration: 0.15 });
          gsap.to(corners, { borderColor: '#3B82F6', duration: 0.15 });
          if (dot) gsap.to(dot, { backgroundColor: '#3B82F6', duration: 0.15 });

          const rect = card.getBoundingClientRect();
          const bw = 3, cs = 12;
          targetCornerPos = [
            { x: rect.left - bw, y: rect.top - bw },
            { x: rect.right + bw - cs, y: rect.top - bw },
            { x: rect.right + bw - cs, y: rect.bottom + bw - cs },
            { x: rect.left - bw, y: rect.bottom + bw - cs }
          ];

          // Move corners once to target positions (relative to cursor)
          if (tickerFn) gsap.ticker.remove(tickerFn);
          tickerFn = () => {
            const cx = gsap.getProperty(cursor, 'x');
            const cy = gsap.getProperty(cursor, 'y');
            corners.forEach((c, i) => {
              const tx = targetCornerPos[i].x - cx;
              const ty = targetCornerPos[i].y - cy;
              gsap.to(c, { x: tx, y: ty, duration: 0.15, ease: 'power1.out', overwrite: 'auto' });
            });
          };
          gsap.ticker.add(tickerFn);
        });

        card.addEventListener('mouseleave', () => {
          if (tickerFn) { gsap.ticker.remove(tickerFn); tickerFn = null; }
          targetCornerPos = null;
          corners.forEach(c => gsap.killTweensOf(c, 'x,y'));
          // Reset corners to default positions
          const cs = 12;
          const def = [
            { x: -cs * 1.5, y: -cs * 1.5 },
            { x: cs * 0.5, y: -cs * 1.5 },
            { x: cs * 0.5, y: cs * 0.5 },
            { x: -cs * 1.5, y: cs * 0.5 }
          ];
          corners.forEach((c, i) => {
            gsap.to(c, { x: def[i].x, y: def[i].y, duration: 0.3, ease: 'power3.out' });
          });
          gsap.to(corners, { borderColor: '#fff', duration: 0.15 });
          if (dot) gsap.to(dot, { backgroundColor: '#fff', duration: 0.15 });
          setTimeout(() => { spin.resume(); }, 80);
        });
      }
    }
  }

  // Click to enter → main site
  container.addEventListener('click', (e) => {
    overlay.style.transition = 'opacity 0.4s ease';
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.style.display = 'none';
      if (mainSite) mainSite.style.display = '';
      document.documentElement.style.overflow = '';
      document.querySelectorAll('.reveal').forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('visible');
      });
    }, 400);
  });

  document.documentElement.style.overflow = 'hidden';
})();

(function() {
  const items = [
    { label: 'ABOUT',     target: '#about' },
    { label: 'RECORDS',   target: '#records' },
    { label: 'JOURNEY',   target: '#journey' },
    { label: 'SKILLS',    target: '#skills' },
    { label: 'DIRECTION', target: '#direction' }
  ];

  const nav = document.createElement('nav');
  nav.className = 'line-sidebar';
  nav.setAttribute('aria-label', '章節導覽');

  const itemEls = [];
  items.forEach((item, i) => {
    const btn = document.createElement('button');
    btn.className = 'line-sidebar__item';
    btn.setAttribute('data-index', i);

    const marker = document.createElement('span');
    marker.className = 'marker';
    btn.appendChild(marker);

    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = item.label;
    btn.appendChild(label);

    btn.addEventListener('click', () => {
      const el = document.querySelector(item.target);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });

    nav.appendChild(btn);
    itemEls.push(btn);
  });

  document.body.appendChild(nav);

  // IntersectionObserver – highlight active section
  const sectionIds = items.map(i => i.target);
  const sectionEls = sectionIds.map(id => document.querySelector(id)).filter(Boolean);
  const observerOptions = { threshold: 0.3, rootMargin: '-80px 0px 0px 0px' };

  let currentActive = -1;

  const observer = new IntersectionObserver((entries) => {
    let maxRatio = 0;
    let maxIndex = -1;
    entries.forEach(entry => {
      const idx = sectionIds.indexOf('#' + entry.target.id);
      if (idx !== -1 && entry.isIntersecting && entry.intersectionRatio > maxRatio) {
        maxRatio = entry.intersectionRatio;
        maxIndex = idx;
      }
    });
    if (maxIndex !== -1 && maxIndex !== currentActive) {
      if (currentActive !== -1) itemEls[currentActive].classList.remove('is-active');
      currentActive = maxIndex;
      itemEls[currentActive].classList.add('is-active');
    }
  }, observerOptions);

  sectionEls.forEach(el => observer.observe(el));

  // Pointer proximity effect (from LineSidebar)
  const FALLOFF = {
    linear: p => p,
    smooth: p => p * p * (3 - 2 * p),
    sharp: p => p * p * p
  };

  const proximityRadius = 120;
  const maxShift = 16;
  const falloff = 'smooth';
  const smoothing = 80;

  const targets = new Array(items.length).fill(0);
  const currents = new Array(items.length).fill(0);
  let rafId = null;
  let lastTime = 0;

  function runFrame(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    const tau = Math.max(smoothing, 1) / 1000;
    const k = 1 - Math.exp(-dt / tau);
    let moving = false;

    for (let i = 0; i < itemEls.length; i++) {
      const el = itemEls[i];
      if (!el) continue;
      const target = Math.max(targets[i] || 0, currentActive === i ? 1 : 0);
      const cur = currents[i] || 0;
      const next = cur + (target - cur) * k;
      const settled = Math.abs(target - next) < 0.0015;
      const value = settled ? target : next;
      currents[i] = value;

      const shift = value * maxShift;
      const label = el.querySelector('.label');
      const marker = el.querySelector('.marker');
      if (label) label.style.transform = `translateX(${shift}px)`;
      if (marker) {
        const mw = 20 + value * 12;
        marker.style.width = `${mw}px`;
      }
      if (!settled) moving = true;
    }

    rafId = moving ? requestAnimationFrame(runFrame) : null;
  }

  function startLoop() {
    if (rafId != null) return;
    lastTime = performance.now();
    rafId = requestAnimationFrame(runFrame);
  }

  const ease = FALLOFF[falloff] || FALLOFF.linear;

  nav.addEventListener('pointermove', e => {
    const rect = nav.getBoundingClientRect();
    const pointerY = e.clientY - rect.top;
    for (let i = 0; i < itemEls.length; i++) {
      const el = itemEls[i];
      const center = el.offsetTop + el.offsetHeight / 2;
      const distance = Math.abs(pointerY - center);
      targets[i] = ease(Math.max(0, 1 - distance / proximityRadius));
    }
    startLoop();
  });

  nav.addEventListener('pointerleave', () => {
    for (let i = 0; i < targets.length; i++) targets[i] = 0;
    startLoop();
  });
})();

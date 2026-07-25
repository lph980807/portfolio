(function() {
  const container = document.getElementById('skills-orbit');
  if (!container) return;

  const icons = [
    'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg'
  ];

  const cx = 150, cy = 150;
  const radiusX = 125, radiusY = 50;
  const itemSize = 48;

  // Draw orbit path
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('viewBox', '0 0 300 300');
  svg.style.position = 'absolute';
  svg.style.inset = '0';
  svg.style.pointerEvents = 'none';
  svg.style.zIndex = '0';

  const path = document.createElementNS(svgNS, 'path');
  const d = `M ${cx - radiusX} ${cy} A ${radiusX} ${radiusY} 0 1 0 ${cx + radiusX} ${cy} A ${radiusX} ${radiusY} 0 1 0 ${cx - radiusX} ${cy}`;
  path.setAttribute('d', d);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'rgba(200,215,240,.35)');
  path.setAttribute('stroke-width', '1.2');
  svg.appendChild(path);

  // Dashed tick marks along the orbit
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const x1 = cx + radiusX * Math.cos(a);
    const y1 = cy + radiusY * Math.sin(a);
    const x2 = cx + (radiusX + 8) * Math.cos(a);
    const y2 = cy + (radiusY + 8) * Math.sin(a);
    const tick = document.createElementNS(svgNS, 'line');
    tick.setAttribute('x1', x1);
    tick.setAttribute('y1', y1);
    tick.setAttribute('x2', x2);
    tick.setAttribute('y2', y2);
    tick.setAttribute('stroke', 'rgba(200,215,240,.22)');
    tick.setAttribute('stroke-width', '1');
    svg.appendChild(tick);
  }

  container.appendChild(svg);

  const imgs = [];
  icons.forEach((src, i) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.draggable = false;
    img.style.zIndex = '1';
    container.appendChild(img);
    imgs.push(img);
  });

  let angle = 0;
  let lastTime = performance.now();
  let rafId = null;
  let visible = true;

  new IntersectionObserver(e => { visible = e[0].isIntersecting; }, { threshold: 0 }).observe(container);

  function animate(now) {
    rafId = requestAnimationFrame(animate);
    if (!visible || document.hidden) return;

    const dt = (now - lastTime) / 1000;
    lastTime = now;

    angle += 0.4 * dt; // radians per second
    if (angle > Math.PI * 2) angle -= Math.PI * 2;

    const count = imgs.length;
    imgs.forEach((img, i) => {
      const offset = (i / count) * Math.PI * 2;
      const x = cx + radiusX * Math.cos(angle + offset) - itemSize / 2;
      const y = cy + radiusY * Math.sin(angle + offset) - itemSize / 2;
      img.style.transform = `translate(${x}px, ${y}px)`;
    });
  }

  rafId = requestAnimationFrame(animate);
})();

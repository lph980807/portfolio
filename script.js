const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((item) => observer.observe(item));

const glow = document.querySelector('.cursor-glow');
window.addEventListener('pointermove', (event) => {
  glow.style.left = `${event.clientX}px`;
  glow.style.top = `${event.clientY}px`;
});

const typewriter = document.querySelector('.typewriter[data-type-text]');
if (typewriter) {
  const fullText = typewriter.dataset.typeText || typewriter.textContent.trim();
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    typewriter.textContent = fullText;
  } else {
    const characters = Array.from(fullText);
    let index = 0;
    typewriter.textContent = '';
    typewriter.classList.add('is-typing');

    const typeNext = () => {
      typewriter.textContent += characters[index] || '';
      index += 1;

      if (index >= characters.length) {
        typewriter.classList.remove('is-typing');
        typewriter.classList.add('typing-done');
        return;
      }

      const current = characters[index - 1];
      const delay = '，。,.'.includes(current) ? 150 : 34;
      window.setTimeout(typeNext, delay);
    };

    window.setTimeout(typeNext, 520);
  }
}

// Skill bar animation – runs from 0 to target at a fixed rate per second
(function() {
  const skillsSection = document.getElementById('skills');
  if (!skillsSection) return;

  const ratePerSec = 20; // percentage points per second (80% takes 4s)
  let animated = false;

  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        skillObserver.disconnect();

        const skills = skillsSection.querySelectorAll('.skill');
        const targets = [];
        const meters = [];
        const labels = [];

        skills.forEach(skill => {
          const meterBar = skill.querySelector('.meter i');
          const label = skill.querySelector('.proficiency b');
          if (!meterBar || !label) return;

          // Parse target percentage from inline style, e.g. "width:80%"
          const match = meterBar.getAttribute('style')?.match(/width:\s*([\d.]+)%/);
          const target = match ? parseFloat(match[1]) : 0;

          // Start at 0
          meterBar.style.width = '0%';
          label.textContent = '0%';

          targets.push(target);
          meters.push(meterBar);
          labels.push(label);
        });

        if (targets.length === 0) return;

        const currents = new Array(targets.length).fill(0);
        let lastTime = performance.now();
        let rafId = null;

        function animate(now) {
          const dt = (now - lastTime) / 1000;
          lastTime = now;
          let allDone = true;

          for (let i = 0; i < targets.length; i++) {
            if (currents[i] >= targets[i]) continue;
            allDone = false;
            currents[i] = Math.min(currents[i] + ratePerSec * dt, targets[i]);
            const val = currents[i];
            meters[i].style.width = val + '%';
            labels[i].textContent = Math.round(val) + '%';
          }

          if (allDone) {
            // Snap to exact target values
            for (let i = 0; i < targets.length; i++) {
              meters[i].style.width = targets[i] + '%';
              labels[i].textContent = targets[i] + '%';
            }
            return;
          }

          rafId = requestAnimationFrame(animate);
        }

        rafId = requestAnimationFrame(animate);
      }
    });
  }, { threshold: 0.3 });

  skillObserver.observe(skillsSection);
})();

// Records stagger reveal – row by row: left + right items appear together
(function() {
  const recordsSection = document.getElementById('records');
  if (!recordsSection) return;

  const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      staggerObserver.disconnect();

      const index = recordsSection.querySelector('.section-index.reveal-stagger');
      const categories = recordsSection.querySelectorAll('.records-category.reveal-stagger');
      const eduItems = recordsSection.querySelectorAll('.records-group:first-child .records-item.reveal-stagger');
      const awardItems = recordsSection.querySelectorAll('.records-group:last-child .records-item.reveal-stagger');

      // Build rows: each row's elements appear simultaneously
      const rows = [
        [index, categories[0], categories[1], eduItems[0], awardItems[0]],
      ];
      const maxLen = Math.max(eduItems.length, awardItems.length);
      for (let i = 1; i < maxLen; i++) {
        const row = [];
        if (i < eduItems.length) row.push(eduItems[i]);
        if (i < awardItems.length) row.push(awardItems[i]);
        if (row.length) rows.push(row);
      }

      let delay = 0;
      const gap = 200; // ms between each row
      rows.forEach(row => {
        window.setTimeout(() => {
          row.forEach(el => { if (el) el.classList.add('visible'); });
        }, delay);
        delay += gap;
      });
    });
  }, { threshold: 0.15 });

  staggerObserver.observe(recordsSection);
})();

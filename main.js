/**
 * ZenWinLabs — main.js
 * To add a new app: edit apps.json only. Nothing here changes.
 */

/* ── Scroll Reveal ──────────────────────────────────────── */
function initReveal() {
  const obs = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
    { threshold: 0.06, rootMargin: '0px 0px -44px 0px' }
  );
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

/* ── 3D Card Tilt ───────────────────────────────────────── */
function initTilt(selector, { maxTilt = 9, lift = 6 } = {}) {
  document.querySelectorAll(selector).forEach(card => {
    if (card.dataset.tiltBound) return;
    card.dataset.tiltBound = '1';
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transition = 'transform 0.08s ease, border-color 0.3s, box-shadow 0.4s';
      card.style.transform = `perspective(700px) translateY(-${lift}px) rotateX(${-y * maxTilt}deg) rotateY(${x * maxTilt}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.55s cubic-bezier(0.16,1,0.3,1), border-color 0.3s, box-shadow 0.4s';
      card.style.transform = '';
    });
  });
}

/* ── Magnetic Buttons ───────────────────────────────────── */
function initMagnetic() {
  document.querySelectorAll('.btn:not(.btn-ghost):not(.btn-playstore)').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width  / 2) * 0.28;
      const y = (e.clientY - r.top  - r.height / 2) * 0.28;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

/* ── Testimonial Carousel ───────────────────────────────── */
function initCarousel() {
  const cards = document.querySelectorAll('.testimonial-card');
  if (cards.length < 2) return;
  let idx = 0;
  setInterval(() => {
    cards[idx].classList.remove('active');
    idx = (idx + 1) % cards.length;
    cards[idx].classList.add('active');
  }, 4500);
}

/* ── App Grid Renderer ──────────────────────────────────── */
const COLORS = {
  '#7B6EF6': { bg: 'linear-gradient(140deg,#a78bfa,#6d28d9)', shadow: 'rgba(124,58,237,0.4)',  glow: 'rgba(124,58,237,0.1)'  },
  '#7C6AF7': { bg: 'linear-gradient(140deg,#7c9cff,#4338ca)', shadow: 'rgba(67,56,202,0.4)',   glow: 'rgba(67,56,202,0.08)' },
  '#FF6B6B': { bg: 'linear-gradient(140deg,#c4b5fd,#7c3aed)', shadow: 'rgba(124,58,237,0.35)', glow: 'rgba(124,58,237,0.08)' },
  '#FFB84D': { bg: 'linear-gradient(140deg,#d8b4fe,#9333ea)', shadow: 'rgba(147,51,234,0.35)', glow: 'rgba(147,51,234,0.08)' },
  '#4DACF7': { bg: 'linear-gradient(140deg,#93c5fd,#4338ca)', shadow: 'rgba(67,56,202,0.35)',  glow: 'rgba(67,56,202,0.08)' },
  '#22D3EE': { bg: 'linear-gradient(140deg,#67e8f9,#0e7490)', shadow: 'rgba(14,116,144,0.4)',   glow: 'rgba(14,116,144,0.08)' },
  '#10B981': { bg: 'linear-gradient(140deg,#6ee7b7,#047857)', shadow: 'rgba(4,120,87,0.4)',     glow: 'rgba(4,120,87,0.08)'  },
  '#FBBF24': { bg: 'linear-gradient(140deg,#fde68a,#b45309)', shadow: 'rgba(180,83,9,0.4)',     glow: 'rgba(180,83,9,0.08)'  },
};
const STATUS = {
  live:        { label: 'LIVE',        cls: 'status-live' },
  coming_soon: { label: 'COMING SOON', cls: 'status-soon' },
};

function stars(n) {
  const r = Math.round(n);
  return '★'.repeat(r) + '☆'.repeat(5 - r);
}

async function renderAppGrid() {
  const listEl = document.getElementById('app-list');
  if (!listEl) return;

  let apps;
  try {
    apps = await fetch('apps.json').then(r => r.json());
  } catch {
    listEl.innerHTML = '<p style="color:var(--text-muted);padding:24px 0;">Could not load apps.</p>';
    return;
  }

  listEl.innerHTML = apps.map((app, i) => {
    const c = COLORS[app.accent] || COLORS['#7B6EF6'];
    const s = STATUS[app.status] || { label: app.status.toUpperCase(), cls: '' };
    const hasPage = !!app.url;
    const delay  = (i * 0.08).toFixed(2);
    const badgeLabel = app.status === 'coming_soon' && app.roadmapDate ? app.roadmapDate : s.label;

    const rating = app.rating
      ? `<div class="app-card-rating">
           <span class="stars-sm">${stars(app.rating)}</span>
           <span>${app.rating}</span>
           <span>(${(app.reviews||0).toLocaleString()})</span>
         </div>`
      : '';

    const footer = hasPage
      ? `<span class="app-card-cta">View App
           <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
         </span>`
      : `<span class="app-card-soon">Arriving ${app.roadmapDate || 'soon'}</span>`;

    const inner = `
      <div class="app-card-top" style="--card-glow:${c.glow};">
        <div class="app-card-icon" style="--icon-bg:${c.bg};">${app.icon||app.name[0]}</div>
      </div>
      <div class="app-card-body">
        <div class="app-card-header">
          <h3 class="app-card-name">${app.name}</h3>
          <span class="status ${s.cls}">${badgeLabel}</span>
        </div>
        <p class="app-card-tagline">${app.tagline}</p>
        ${rating}
        ${footer}
      </div>`;

    const attrs = `class="app-card${app.status === 'live' ? '' : ' app-card-disabled'} reveal" style="--delay:${delay}s;"`;
    return hasPage
      ? `<a href="${app.url}" ${attrs}>${inner}</a>`
      : `<div ${attrs}>${inner}</div>`;
  }).join('');

  // Observe the newly injected cards
  const obs = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
    { threshold: 0.06, rootMargin: '0px 0px -56px 0px' }
  );
  listEl.querySelectorAll('.app-card').forEach(el => obs.observe(el));
}

/* ── Typewriter ─────────────────────────────────────────── */
function initTypewriter() {
  const el = document.getElementById('type-word');
  if (!el) return;
  const words = ['smarter.', 'fitter.', 'wiser.', 'sharper.', 'stronger.'];
  let wi = 0, ci = 0, deleting = false;

  function tick() {
    const word = words[wi];
    if (deleting) {
      el.textContent = word.slice(0, --ci);
      if (ci === 0) {
        deleting = false;
        wi = (wi + 1) % words.length;
        setTimeout(tick, 320);
      } else {
        setTimeout(tick, 55);
      }
    } else {
      el.textContent = word.slice(0, ++ci);
      if (ci === word.length) {
        deleting = true;
        setTimeout(tick, 1600);
      } else {
        setTimeout(tick, 95);
      }
    }
  }

  setTimeout(tick, 600);
}

/* ── Crystal Field ───────────────────────────────────────
   Floating violet "crystal" hexes drifting behind the hero,
   with a subtle mouse-parallax across 3 depth layers.
   ──────────────────────────────────────────────────────── */
function hexToRgb(hex) {
  let h = String(hex || '#c4b5fd').replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function initCrystalField() {
  const root = document.querySelector('[data-crystal-field]');
  if (!root) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const count = 250;
  const color = '#c4b5fd';
  const [r, g, b] = hexToRgb(color);
  const [dr, dg, db] = hexToRgb('#6d28d9');
  const depths = [1.6, 3.2, 5.4];
  const anims = ['zw-float-a', 'zw-float-b', 'zw-float-c'];

  const layers = depths.map(d => {
    const l = document.createElement('div');
    l.className = 'crystal-layer';
    l.dataset.depth = d;
    root.appendChild(l);
    return l;
  });

  for (let i = 0; i < count; i++) {
    const layer = layers[i % 3];
    const size = 7 + Math.random() * 17;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const rot = Math.random() * 360;
    const dur = 7 + Math.random() * 10;
    const delay = -Math.random() * 14;
    const s = 0.55 + Math.random() * 0.45;
    const top = `rgba(${r},${g},${b},${(0.7 * s).toFixed(2)})`;
    const right = `rgba(${dr},${dg},${db},${(0.6 * s).toFixed(2)})`;
    const left = `rgba(${Math.round((r + dr) / 2)},${Math.round((g + dg) / 2)},${Math.round((b + db) / 2)},${(0.6 * s).toFixed(2)})`;

    const c = document.createElement('div');
    c.className = 'crystal';
    c.style.cssText =
      `left:${x.toFixed(2)}%; top:${y.toFixed(2)}%; width:${size.toFixed(1)}px; height:${size.toFixed(1)}px;` +
      `background:conic-gradient(from -30deg at 50% 50%, ${top} 0deg 60deg, ${right} 60deg 180deg, ${left} 180deg 300deg, ${top} 300deg 360deg);` +
      `border:0.5px solid rgba(${r},${g},${b},${(0.5 * s).toFixed(2)});` +
      `transform:rotate(${rot.toFixed(0)}deg);` +
      (reducedMotion ? '' : `animation:${anims[i % 3]} ${dur.toFixed(1)}s ease-in-out ${delay.toFixed(1)}s infinite;`);
    layer.appendChild(c);
  }

  if (reducedMotion || window.matchMedia('(pointer: coarse)').matches) return;

  let raf = null;
  window.addEventListener('mousemove', e => {
    const w = window.innerWidth, h = window.innerHeight;
    const mx = (e.clientX - w / 2) / (w / 2);
    const my = (e.clientY - h / 2) / (h / 2);
    if (raf) return;
    raf = requestAnimationFrame(() => {
      layers.forEach(l => {
        const d = parseFloat(l.dataset.depth) || 1;
        l.style.transform = `translate3d(${(-mx * d * 8).toFixed(2)}px, ${(-my * d * 8).toFixed(2)}px, 0)`;
      });
      raf = null;
    });
  });
}

/* ── Count-up Stats ──────────────────────────────────────── */
function initCountUp() {
  const targets = document.querySelectorAll('.about-metric-val, .rating-num');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      obs.unobserve(el);
      const raw = el.textContent.trim();
      const match = raw.match(/^([^\d]*)(\d+(?:\.\d+)?)(.*)$/);
      if (!match) return;
      const [, prefix, numStr, suffix] = match;
      const isFloat = numStr.includes('.');
      const target = parseFloat(numStr);
      const duration = 900;
      const start = performance.now();
      function frame(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = target * eased;
        el.textContent = prefix + (isFloat ? val.toFixed(1) : Math.round(val)) + suffix;
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
  }, { threshold: 0.6 });
  targets.forEach(el => obs.observe(el));
}

/* ── Waitlist Form ──────────────────────────────────────── */
function initWaitlist() {
  const form = document.getElementById('waitlist-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    form.style.display = 'none';
    const note = form.nextElementSibling;
    if (note && note.classList.contains('waitlist-success')) {
      note.style.display = 'block';
    }
  });
}

/* ── Boot ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initCarousel();
  initTypewriter();
  renderAppGrid();
  initMagnetic();
  initWaitlist();
  initCrystalField();
  initCountUp();
  initTilt('a.app-card',    { maxTilt: 7, lift: 5 });
  initTilt('.feature-card', { maxTilt: 6, lift: 4 });
  initTilt('.faq-card',     { maxTilt: 5, lift: 3 });
  initTilt('.mission-card', { maxTilt: 4, lift: 2 });
  initTilt('.review-card',  { maxTilt: 5, lift: 3 });
});

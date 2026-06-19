/**
 * ZenWinLabs — main.js
 * To add a new app: edit apps.json only. Nothing here changes.
 */

/* ── Theme ──────────────────────────────────────────────── */
function initTheme() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('zwl-theme', next);
  });
}

/* ── Scroll Reveal ──────────────────────────────────────── */
function initReveal() {
  const obs = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
    { threshold: 0.06, rootMargin: '0px 0px -44px 0px' }
  );
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

/* ── 3D Card Tilt ───────────────────────────────────────── */
function initCardTilt() {
  document.querySelectorAll('a.app-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transition = 'transform 0.08s ease, border-color 0.3s, box-shadow 0.4s';
      card.style.transform = `perspective(700px) translateY(-6px) rotateX(${-y * 9}deg) rotateY(${x * 9}deg)`;
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
  '#3DDC97': { bg: 'linear-gradient(135deg,#3DDC97,#2aac74)', shadow: 'rgba(61,220,151,0.3)',  glow: 'rgba(61,220,151,0.08)'  },
  '#7B6EF6': { bg: 'linear-gradient(135deg,#7B6EF6,#5a4ece)', shadow: 'rgba(123,110,246,0.3)', glow: 'rgba(123,110,246,0.08)' },
  '#FF6B6B': { bg: 'linear-gradient(135deg,#FF6B6B,#cc4444)', shadow: 'rgba(255,107,107,0.3)', glow: 'rgba(255,107,107,0.08)' },
  '#FFB84D': { bg: 'linear-gradient(135deg,#FFB84D,#cc8a1f)', shadow: 'rgba(255,184,77,0.3)',  glow: 'rgba(255,184,77,0.08)'  },
  '#4DACF7': { bg: 'linear-gradient(135deg,#4DACF7,#2278c4)', shadow: 'rgba(77,172,247,0.3)',  glow: 'rgba(77,172,247,0.08)'  },
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
    const c = COLORS[app.accent] || COLORS['#3DDC97'];
    const s = STATUS[app.status] || { label: app.status.toUpperCase(), cls: '' };
    const isLive = app.status === 'live' && app.url;
    const delay  = (i * 0.08).toFixed(2);

    const rating = app.rating
      ? `<div class="app-card-rating">
           <span class="stars-sm">${stars(app.rating)}</span>
           <span>${app.rating}</span>
           <span>(${(app.reviews||0).toLocaleString()})</span>
         </div>`
      : '';

    const footer = isLive
      ? `<span class="app-card-cta">View App
           <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
         </span>`
      : `<span class="app-card-soon">Coming soon →</span>`;

    const inner = `
      <div class="app-card-header">
        <div class="app-card-icon" style="--icon-bg:${c.bg};--icon-shadow:${c.shadow};">${app.icon||app.name[0]}</div>
        <span class="status ${s.cls}">${s.label}</span>
      </div>
      <div class="app-card-body">
        <span class="app-card-category">${app.category||''}</span>
        <h3 class="app-card-name">${app.name}</h3>
        <p class="app-card-tagline">${app.tagline}</p>
        ${rating}
      </div>
      <div class="app-card-footer">${footer}</div>`;

    const attrs = `class="app-card${isLive ? '' : ' app-card-disabled'} reveal" style="--delay:${delay}s;--card-glow:${c.glow};"`;
    return isLive
      ? `<a href="${app.url}" ${attrs}>${inner}</a>`
      : `<div ${attrs}>${inner}</div>`;
  }).join('');

  // Observe the newly injected cards
  const obs = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
    { threshold: 0.06, rootMargin: '0px 0px -56px 0px' }
  );
  listEl.querySelectorAll('.app-card').forEach(el => obs.observe(el));

  // Wire tilt after cards are in DOM
  initCardTilt();
  initMagnetic();
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

/* ── Boot ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initReveal();
  initCarousel();
  initTypewriter();
  renderAppGrid();   // tilt + magnetic wired inside after render
  // Magnetic on static buttons (hero CTA etc.)
  initMagnetic();
});

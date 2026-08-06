/**
 * ZenWinLabs — blog.js
 * ONE shared script for the whole blog (list + every article), paired with
 * ONE shared stylesheet (/blog.css). Each page only carries its own content;
 * the top bar, footer, theme toggle, list rendering and reading progress all
 * come from here.
 *
 * Each blog page sets config on <body>:
 *   <body data-app="habits" data-app-name="Habits"
 *         data-app-url="https://play.google.com/store/apps/details?id=com.zenwinlabs.habbit">
 *
 * List page needs:  <div id="blog-list" data-posts="posts.json" data-base="/apps/habits/blog/"></div>
 * Article page needs: <div class="reading-progress"></div>
 * No-flash theme: add this in <head> BEFORE the stylesheet:
 *   <script>(function(){try{var t=localStorage.getItem('zw-blog-theme')||
 *     (matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
 *     document.documentElement.setAttribute('data-theme',t);}catch(e){}})();</script>
 */
(function () {
  var THEME_KEY = 'zw-blog-theme';
  var B = document.body;
  var APP      = B.getAttribute('data-app') || 'habits';
  var APP_NAME = B.getAttribute('data-app-name') || 'Habits';
  var APP_URL  = B.getAttribute('data-app-url') || '#';
  var BLOG_HOME = '/apps/' + APP + '/blog/';
  var APP_PAGE  = '/apps/' + APP + '/index.html';

  var SUN = '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';
  var MOON = '<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

  /* ── Shared chrome (top bar + footer), injected once from here ─── */
  function injectChrome() {
    var header = document.createElement('header');
    header.className = 'blog-topbar';
    header.innerHTML =
      '<div class="blog-topbar-inner">' +
        '<a href="' + BLOG_HOME + '" class="blog-brand"><span class="dot"></span>' + APP_NAME + ' Blog</a>' +
        '<nav class="blog-nav">' +
          '<a href="' + APP_PAGE + '">The App</a>' +
          '<a href="' + BLOG_HOME + '">All posts</a>' +
          '<button class="theme-toggle" data-theme-toggle type="button" aria-label="Toggle dark mode">' + SUN + MOON + '</button>' +
        '</nav>' +
      '</div>';
    B.insertBefore(header, B.firstChild);

    var footer = document.createElement('footer');
    footer.className = 'blog-footer';
    footer.innerHTML =
      '<div class="blog-narrow blog-footer-inner">' +
        '<span>© 2026 ZenWinLabs</span>' +
        '<a href="' + APP_URL + '" target="_blank" rel="noopener">Get ' + APP_NAME + ' on Play Store →</a>' +
      '</div>';
    B.appendChild(footer);
  }

  /* ── Theme ───────────────────────────────────────────────── */
  function currentTheme() { return document.documentElement.getAttribute('data-theme') || 'light'; }
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
    var btn = document.querySelector('[data-theme-toggle]');
    if (btn) btn.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }
  function initTheme() {
    if (!document.documentElement.getAttribute('data-theme')) {
      var saved = null; try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
      applyTheme(saved || (window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
    }
    var btn = document.querySelector('[data-theme-toggle]');
    if (btn) btn.addEventListener('click', function () {
      applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
    });
  }

  /* ── List rendering ──────────────────────────────────────── */
  function esc(s) { return String(s == null ? '' : s).replace(/"/g, '&quot;'); }
  function fmtDate(iso) {
    if (!iso) return '';
    try { return new Date(iso + 'T00:00:00').toLocaleDateString('en-US',
      { year: 'numeric', month: 'long', day: 'numeric' }); } catch (e) { return iso; }
  }
  async function renderBlogList() {
    var el = document.getElementById('blog-list');
    if (!el) return;
    var src  = el.getAttribute('data-posts') || 'posts.json';
    var base = el.getAttribute('data-base') || BLOG_HOME;
    var posts;
    try { posts = await fetch(src).then(function (r) { return r.json(); }); }
    catch (e) { el.innerHTML = '<p class="blog-empty">Posts are on the way — check back soon.</p>'; return; }
    if (!Array.isArray(posts) || !posts.length) {
      el.innerHTML = '<p class="blog-empty">Posts are on the way — check back soon.</p>'; return;
    }
    posts.sort(function (a, b) { return String(b.date || '').localeCompare(String(a.date || '')); });
    el.innerHTML = posts.map(function (p) {
      var url = base + p.slug + '/';
      var hasImg = !!p.image;
      var img = hasImg
        ? '<img src="' + esc(p.image) + '" alt="' + esc(p.imageAlt || p.title) +
          '" loading="lazy" onerror="this.closest(\'.blog-card-media\').classList.add(\'img-missing\')">'
        : '';
      var media = '<div class="blog-card-media' + (hasImg ? '' : ' img-missing') +
        '" data-desc="' + esc(p.imageDesc || 'Cover image') + '">' + img + '</div>';
      return '<a class="blog-card" href="' + esc(url) + '">' + media +
        '<div class="blog-card-body">' +
          (p.tag ? '<span class="blog-card-tag">' + esc(p.tag) + '</span>' : '') +
          '<h2 class="blog-card-title">' + esc(p.title) + '</h2>' +
          '<p class="blog-card-excerpt">' + esc(p.excerpt) + '</p>' +
          '<div class="blog-card-meta"><span>' + fmtDate(p.date) + '</span>' +
            (p.readingTime ? '<span class="dot-sep"></span><span>' + esc(p.readingTime) + '</span>' : '') +
          '</div>' +
        '</div></a>';
    }).join('');
  }

  /* ── Reading progress ────────────────────────────────────── */
  function initReadingProgress() {
    var bar = document.querySelector('.reading-progress');
    var article = document.querySelector('.blog-body');
    if (!bar || !article) return;
    function update() {
      var rect = article.getBoundingClientRect();
      var total = article.offsetHeight - window.innerHeight;
      var scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
      bar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  document.addEventListener('DOMContentLoaded', function () {
    injectChrome();
    initTheme();
    renderBlogList();
    initReadingProgress();
  });
})();

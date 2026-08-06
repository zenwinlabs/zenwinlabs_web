/**
 * ZenWinLabs — blog.js
 * Shared blog engine used by every app's /blog/ section.
 *
 * LIST PAGE:   add <div id="blog-list" data-posts="posts.json" data-base=""></div>
 *              and this script renders cards from posts.json (newest first).
 * ARTICLE PAGE: add <div class="reading-progress"></div> for the top scroll bar.
 *
 * To add a post to any app: drop a new folder with index.html (copy the post
 * template) and add one entry to that app's posts.json. The list updates itself.
 */
(function () {
  function esc(s) { return String(s == null ? '' : s).replace(/"/g, '&quot;'); }

  function fmtDate(iso) {
    if (!iso) return '';
    try {
      return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch (e) { return iso; }
  }

  async function renderBlogList() {
    var el = document.getElementById('blog-list');
    if (!el) return;
    var src  = el.getAttribute('data-posts') || 'posts.json';
    var base = el.getAttribute('data-base') || '';
    var posts;
    try {
      posts = await fetch(src).then(function (r) { return r.json(); });
    } catch (e) {
      el.innerHTML = '<p class="blog-empty">Posts are on the way — check back soon.</p>';
      return;
    }
    if (!Array.isArray(posts) || !posts.length) {
      el.innerHTML = '<p class="blog-empty">Posts are on the way — check back soon.</p>';
      return;
    }
    posts.sort(function (a, b) { return String(b.date || '').localeCompare(String(a.date || '')); });

    el.innerHTML = posts.map(function (p, i) {
      var url = base + p.slug + '/';
      var hasImg = !!p.image;
      var img = hasImg
        ? '<img src="' + esc(p.image) + '" alt="' + esc(p.imageAlt || p.title) +
          '" loading="lazy" onerror="this.closest(\'.blog-card-media\').classList.add(\'img-missing\')">'
        : '';
      var media = '<div class="blog-card-media' + (hasImg ? '' : ' img-missing') +
        '" data-desc="' + esc(p.imageDesc || 'Cover image') + '">' + img + '</div>';
      return '<a class="blog-card reveal" style="--delay:' + (i * 0.06).toFixed(2) + 's" href="' + esc(url) + '">' +
        media +
        '<div class="blog-card-body">' +
          (p.tag ? '<span class="blog-card-tag">' + esc(p.tag) + '</span>' : '') +
          '<h2 class="blog-card-title">' + esc(p.title) + '</h2>' +
          '<p class="blog-card-excerpt">' + esc(p.excerpt) + '</p>' +
          '<div class="blog-card-meta"><span>' + fmtDate(p.date) + '</span>' +
            (p.readingTime ? '<span class="dot-sep"></span><span>' + esc(p.readingTime) + '</span>' : '') +
          '</div>' +
        '</div>' +
      '</a>';
    }).join('');

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });
    el.querySelectorAll('.blog-card').forEach(function (c) { obs.observe(c); });
  }

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
    renderBlogList();
    initReadingProgress();
  });
})();

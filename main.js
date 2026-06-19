/* Renders the app list on index.html from apps.json.
   To add a new app: add an entry to apps.json. Nothing here needs to change. */

const STATUS_LABEL = {
  live: 'LIVE',
  building: 'BUILDING',
  planned: 'PLANNED'
};

async function renderAppList() {
  const listEl = document.getElementById('app-list');
  const countEl = document.getElementById('app-count');
  if (!listEl) return;

  let apps = [];
  try {
    const res = await fetch('apps.json');
    apps = await res.json();
  } catch (err) {
    listEl.innerHTML = '<p class="text-muted" style="padding:24px 20px;">Could not load app registry.</p>';
    return;
  }

  if (countEl) {
    countEl.textContent = `${apps.length} ${apps.length === 1 ? 'app' : 'apps'}`;
  }

  listEl.innerHTML = apps.map(app => {
    const statusClass = `status-${app.status}`;
    const statusLabel = STATUS_LABEL[app.status] || app.status.toUpperCase();
    const isLive = app.status === 'live' && app.url;

    const inner = `
      <div class="app-info">
        <h3>${app.name}</h3>
        <p>${app.tagline}</p>
      </div>
      <span class="app-tag">${app.tag || ''}</span>
      <div style="display:flex; align-items:center; gap:14px;">
        <span class="status ${statusClass}">${statusLabel}</span>
        ${isLive ? `<svg class="app-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>` : ''}
      </div>
    `;

    return isLive
      ? `<a class="app-row" href="${app.url}">${inner}</a>`
      : `<div class="app-row is-disabled">${inner}</div>`;
  }).join('');
}

document.addEventListener('DOMContentLoaded', renderAppList);

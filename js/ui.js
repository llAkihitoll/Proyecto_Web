const app = () => document.getElementById('app');

// Helpers 
function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function tagPills(tags = []) {
  return tags.map(t => `<span class="tag" data-tag="${esc(t)}">${esc(t)}</span>`).join('');
}

// Loading states 
export function renderSkeletonGrid(count = 6) {
  const card = `
    <div class="skeleton-card">
      <div class="skeleton sk-badge"></div>
      <div class="skeleton sk-title"></div>
      <div class="skeleton sk-text"></div>
      <div class="skeleton sk-text"></div>
      <div class="skeleton sk-text-s"></div>
      <div class="skeleton sk-footer"></div>
    </div>`;

  app().innerHTML = `
    <div class="page-header">
      <div class="skeleton" style="height:40px;width:280px;margin-bottom:8px;border-radius:8px;"></div>
      <div class="skeleton" style="height:18px;width:200px;border-radius:6px;"></div>
    </div>
    <div class="filters-section" style="pointer-events:none;opacity:.5;">
      <div class="skeleton" style="height:38px;border-radius:8px;"></div>
      <div class="skeleton" style="height:38px;border-radius:8px;"></div>
      <div class="skeleton" style="height:38px;border-radius:8px;"></div>
    </div>
    <div class="posts-grid">${card.repeat(count)}</div>`;
}

export function renderSpinner() {
  app().innerHTML = `<div class="spinner-wrap"><div class="spinner"></div></div>`;
}

export function renderGridSpinner() {
  const grid = document.getElementById('postsGrid');
  if (grid) grid.innerHTML = `<div class="spinner-wrap" style="grid-column:1/-1"><div class="spinner"></div></div>`;
}

// Error / empty 
export function renderErrorPage(msg) {
  app().innerHTML = `
    <div class="error-state">
      <div class="state-icon">⚠️</div>
      <h2 class="error-state__title">Algo salió mal</h2>
      <p class="error-state__msg">${esc(msg)}</p>
      <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;">
        <button class="btn btn--primary" onclick="window.location.reload()">Reintentar</button>
        <a href="#/" class="btn btn--secondary">Volver al inicio</a>
      </div>
    </div>`;
}

export function renderEmptyState(msg = 'No se encontraron resultados.') {
  return `
    <div class="empty-state" style="grid-column:1/-1">
      <div class="state-icon">📭</div>
      <h3 class="empty-state__title">Sin resultados</h3>
      <p class="empty-state__msg">${esc(msg)}</p>
    </div>`;
}

// Toast 
export function showToast(message, type = 'success') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.innerHTML = `
    <span style="flex-shrink:0">${icons[type] ?? 'ℹ️'}</span>
    <span class="toast__body">${esc(message)}</span>
    <button class="toast__close" aria-label="Cerrar">✕</button>`;

  el.querySelector('.toast__close').addEventListener('click', () => dismiss(el));
  container.appendChild(el);
  setTimeout(() => dismiss(el), 4500);
}

function dismiss(el) {
  el.style.animation = 'slideOut 300ms ease forwards';
  setTimeout(() => el.remove(), 310);
}

// Confirm dialog 
export function showConfirmDialog(title, message) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'dialog-overlay';
    overlay.innerHTML = `
      <div class="dialog" role="dialog" aria-modal="true">
        <h3 class="dialog__title">${esc(title)}</h3>
        <p class="dialog__msg">${esc(message)}</p>
        <div class="dialog__actions">
          <button class="btn btn--secondary" id="dlgCancel">Cancelar</button>
          <button class="btn btn--danger"    id="dlgConfirm">Eliminar</button>
        </div>
      </div>`;

    const close = val => { overlay.remove(); resolve(val); };
    overlay.querySelector('#dlgConfirm').addEventListener('click', () => close(true));
    overlay.querySelector('#dlgCancel').addEventListener('click',  () => close(false));
    overlay.addEventListener('click', e => { if (e.target === overlay) close(false); });
    document.body.appendChild(overlay);
    overlay.querySelector('#dlgConfirm').focus();
  });
}

// Post list 
export function renderListPage(posts, total, currentPage, limit, tags) {
  const totalPages = Math.ceil(total / limit);

  app().innerHTML = `
    <div class="page-header">
      <h1 class="page-header__title">BlogVerse</h1>
      <p class="page-header__subtitle">Explora todas las publicaciones</p>
    </div>

    <div class="filters-section" id="filtersSection">
      <div class="filter-group">
        <label class="filter-label" for="searchInput">Buscar</label>
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input type="text" id="searchInput" class="form-input search-input"
            placeholder="Buscar en título o contenido…" autocomplete="off" />
        </div>
      </div>
      <div class="filter-group">
        <label class="filter-label" for="tagFilter">Tag</label>
        <select id="tagFilter" class="form-select">
          <option value="">Todos los tags</option>
          ${tags.map(t => `<option value="${esc(t)}">${esc(t)}</option>`).join('')}
        </select>
      </div>
      <div class="filter-group">
        <label class="filter-label" for="userFilter">Usuario</label>
        <select id="userFilter" class="form-select">
          <option value="">Todos los usuarios</option>
          ${Array.from({ length: 20 }, (_, i) =>
            `<option value="${i + 1}">Usuario ${i + 1}</option>`).join('')}
        </select>
      </div>
    </div>

    <div class="posts-grid" id="postsGrid">
      ${posts.length ? posts.map(renderPostCard).join('') : renderEmptyState()}
    </div>

    ${total > limit ? renderPaginationHTML(currentPage, totalPages, total) : ''}`;
}

export function updateGrid(posts) {
  const grid = document.getElementById('postsGrid');
  if (!grid) return;
  grid.innerHTML = posts.length ? posts.map(renderPostCard).join('') : renderEmptyState();
}

export function restoreFilterValues(search, tag, userId) {
  const si = document.getElementById('searchInput');
  const tf = document.getElementById('tagFilter');
  const uf = document.getElementById('userFilter');
  if (si) si.value = search;
  if (tf) tf.value = tag;
  if (uf) uf.value = userId;
}

// Post card 
export function renderPostCard(post) {
  const summary = post.body?.length > 110
    ? post.body.substring(0, 110) + '…'
    : (post.body ?? '');

  return `
    <article class="post-card">
      <span class="post-card__badge">#${post.id}</span>
      <h2 class="post-card__title">${esc(post.title)}</h2>
      <p class="post-card__body">${esc(summary)}</p>
      <div class="post-card__tags">${tagPills(post.tags)}</div>
      <div class="post-card__author">
        <div class="author-avatar">U${post.userId}</div>
        <span>Usuario ${post.userId}</span>
      </div>
      <div class="post-card__footer">
        <div class="post-card__reactions">
          <span>👍 ${post.reactions?.likes ?? 0}</span>
          <span>👎 ${post.reactions?.dislikes ?? 0}</span>
        </div>
        <a href="#/post/${post.id}" class="btn btn--primary btn--sm">Ver detalle →</a>
      </div>
    </article>`;
}

// Post detail 
export function renderDetailPage(post) {
  app().innerHTML = `
    <div class="post-detail-layout">
      <button class="back-btn" id="backBtn">← Volver al listado</button>

      <div class="post-detail">
        <div class="post-detail__meta">
          <div class="meta-item">
            <span class="meta-item__label">ID</span>
            <span class="meta-item__value">#${post.id}</span>
          </div>
          <div class="meta-item">
            <span class="meta-item__label">Autor (userId)</span>
            <span class="meta-item__value">Usuario ${post.userId}</span>
          </div>
          <div class="meta-item">
            <span class="meta-item__label">Vistas</span>
            <span class="meta-item__value">${post.views ?? '—'}</span>
          </div>
          <div class="meta-item">
            <span class="meta-item__label">Tags</span>
            <span class="meta-item__value">${(post.tags ?? []).join(', ') || '—'}</span>
          </div>
          <div class="meta-item">
            <span class="meta-item__label">Likes</span>
            <span class="meta-item__value">👍 ${post.reactions?.likes ?? 0}</span>
          </div>
          <div class="meta-item">
            <span class="meta-item__label">Dislikes</span>
            <span class="meta-item__value">👎 ${post.reactions?.dislikes ?? 0}</span>
          </div>
        </div>

        <h1 class="post-detail__title">${esc(post.title)}</h1>

        <div class="reactions-row">
          <div class="reaction-item">
            <span class="reaction-item__count">👍 ${post.reactions?.likes ?? 0}</span>
            <span class="reaction-item__label">Me gusta</span>
          </div>
          <div class="reaction-item">
            <span class="reaction-item__count">👎 ${post.reactions?.dislikes ?? 0}</span>
            <span class="reaction-item__label">No me gusta</span>
          </div>
          <div class="reaction-item">
            <span class="reaction-item__count">👁️ ${post.views ?? 0}</span>
            <span class="reaction-item__label">Vistas</span>
          </div>
        </div>

        <p class="post-detail__body">${esc(post.body)}</p>

        <div class="post-detail__tags">${tagPills(post.tags)}</div>

        <div class="post-detail__actions">
          <a href="#/edit/${post.id}" class="btn btn--secondary">✏️ Editar</a>
          <button class="btn btn--danger" id="deleteBtn" data-id="${post.id}">🗑️ Eliminar</button>
        </div>
      </div>
    </div>`;
}

// Create form 
export function renderCreatePage() {
  app().innerHTML = `
    <div class="page-header">
      <h1 class="page-header__title">Nueva publicación</h1>
      <p class="page-header__subtitle">Comparte tus ideas con el mundo</p>
    </div>

    <div class="form-container">
      <form id="postForm" novalidate>
        ${formField('title',  'Título',    'text',     'Escribe un título descriptivo…')}
        ${formField('body',   'Contenido', 'textarea', 'Escribe el contenido…')}
        ${formField('author', 'Autor',     'text',     'Tu nombre…')}

        <div class="form-actions">
          <a href="#/" class="btn btn--secondary">Cancelar</a>
          <button type="submit" class="btn btn--primary" id="submitBtn" data-label="Publicar">
            Publicar
          </button>
        </div>
      </form>
    </div>`;
}

// Edit form 
export function renderEditPage(post) {
  app().innerHTML = `
    <div class="page-header">
      <h1 class="page-header__title">Editar publicación</h1>
      <p class="page-header__subtitle">Post #${post.id}</p>
    </div>

    <div class="form-container">
      <form id="postForm" novalidate data-id="${post.id}">
        ${formField('title',  'Título',           'text',     '', esc(post.title))}
        ${formField('body',   'Contenido',        'textarea', '', esc(post.body))}
        ${formField('author', 'Autor (referencia)', 'text',   '', `Usuario ${post.userId}`)}

        <div class="form-actions">
          <a href="#/post/${post.id}" class="btn btn--secondary">Cancelar</a>
          <button type="submit" class="btn btn--primary" id="submitBtn" data-label="Guardar cambios">
            Guardar cambios
          </button>
        </div>
      </form>
    </div>`;
}

function formField(id, label, type, placeholder = '', value = '') {
  const input = type === 'textarea'
    ? `<textarea id="${id}" class="form-textarea" placeholder="${placeholder}">${value}</textarea>`
    : `<input type="text" id="${id}" class="form-input" placeholder="${placeholder}" value="${value}" />`;

  return `
    <div class="form-group">
      <label class="form-label" for="${id}">${label}</label>
      ${input}
      <span class="form-error" id="${id}Error" aria-live="polite"></span>
    </div>`;
}

// Form helpers
export function displayFieldErrors(errors) {
  for (const [field, msg] of Object.entries(errors)) {
    const input = document.getElementById(field);
    const errEl = document.getElementById(`${field}Error`);
    if (!input || !errEl) continue;
    if (msg) {
      input.classList.add('error');
      errEl.textContent = msg;
    } else {
      input.classList.remove('error');
      errEl.textContent = '';
    }
  }
}

export function clearFieldErrors() {
  ['title', 'body', 'author'].forEach(field => {
    document.getElementById(field)?.classList.remove('error');
    const e = document.getElementById(`${field}Error`);
    if (e) e.textContent = '';
  });
}

export function setSubmitBusy(busy) {
  const btn = document.getElementById('submitBtn');
  if (!btn) return;
  btn.disabled = busy;
  btn.textContent = busy ? 'Guardando…' : (btn.dataset.label ?? 'Guardar');
}

// Pagination
function renderPaginationHTML(current, total, totalPosts) {
  return `
    <div class="pagination" id="pagination">
      <button class="btn btn--secondary" id="prevPage" ${current <= 1 ? 'disabled' : ''}>
        ← Anterior
      </button>
      <span class="pagination__info">Página ${current} de ${total} · ${totalPosts} posts</span>
      <button class="btn btn--secondary" id="nextPage" ${current >= total ? 'disabled' : ''}>
        Siguiente →
      </button>
    </div>`;
}

// Stats page 
export function renderStatsPage(posts) {
  const totalLikes    = posts.reduce((s, p) => s + (p.reactions?.likes    ?? 0), 0);
  const totalDislikes = posts.reduce((s, p) => s + (p.reactions?.dislikes ?? 0), 0);
  const totalViews    = posts.reduce((s, p) => s + (p.views ?? 0), 0);

  const tagMap = {};
  posts.forEach(p => p.tags?.forEach(t => { tagMap[t] = (tagMap[t] ?? 0) + 1; }));
  const topTags = Object.entries(tagMap).sort((a, b) => b[1] - a[1]);

  const userMap = {};
  posts.forEach(p => { userMap[p.userId] = (userMap[p.userId] ?? 0) + 1; });
  const topUsers = Object.entries(userMap).sort((a, b) => b[1] - a[1]).slice(0, 6);

  app().innerHTML = `
    <div class="page-header">
      <h1 class="page-header__title">Estadísticas</h1>
      <p class="page-header__subtitle">Datos del blog en tiempo real</p>
    </div>

    <div class="stats-grid">
      ${statCard(posts.length,              'Total de posts')}
      ${statCard(totalLikes.toLocaleString(),    '👍 Total de likes')}
      ${statCard(totalDislikes.toLocaleString(), '👎 Total de dislikes')}
      ${statCard(totalViews.toLocaleString(),    '👁️ Total de vistas')}
      ${statCard(Object.keys(tagMap).length,  '🏷️ Tags únicos')}
      ${statCard(Object.keys(userMap).length, '👤 Autores únicos')}
    </div>

    <h2 class="section-title">Top autores</h2>
    <div class="stats-grid" style="margin-bottom:var(--sp-xl)">
      ${topUsers.map(([uid, count]) => `
        <div class="stat-card">
          <div style="display:flex;align-items:center;gap:var(--sp-sm);margin-bottom:var(--sp-sm)">
            <div class="author-avatar">U${uid}</div>
            <span style="font-weight:700">Usuario ${uid}</span>
          </div>
          <span class="stat-card__value">${count}</span>
          <span class="stat-card__label">publicaciones</span>
        </div>`).join('')}
    </div>

    <h2 class="section-title">Tags más usados</h2>
    <div class="tags-cloud">
      ${topTags.map(([t, n]) =>
        `<span class="tag" style="font-size:${Math.min(0.75 + n * 0.08, 1.2)}rem">
          ${esc(t)} <strong>(${n})</strong>
        </span>`).join('')}
    </div>`;
}

function statCard(value, label) {
  return `
    <div class="stat-card">
      <span class="stat-card__value">${value}</span>
      <span class="stat-card__label">${label}</span>
    </div>`;
}

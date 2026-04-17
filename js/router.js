const routes = new Map();

export function registerRoute(pattern, handler) {
  routes.set(pattern, handler);
}

export function navigateTo(path) {
  window.location.hash = path;
}

export function initRouter() {
  window.addEventListener('hashchange', dispatch);
  dispatch();
}

function dispatch() {
  const raw  = window.location.hash.slice(1) || '/';
  const path = raw.split('?')[0];

  for (const [pattern, handler] of routes) {
    const params = matchPath(pattern, path);
    if (params !== null) {
      syncNavLinks(path);
      handler(params);
      return;
    }
  }

  renderNotFound();
}

function matchPath(pattern, path) {
  const pp = pattern.split('/');
  const sp = path.split('/');
  if (pp.length !== sp.length) return null;

  const params = {};
  for (let i = 0; i < pp.length; i++) {
    if (pp[i].startsWith(':')) {
      params[pp[i].slice(1)] = decodeURIComponent(sp[i]);
    } else if (pp[i] !== sp[i]) {
      return null;
    }
  }
  return params;
}

function syncNavLinks(path) {
  const base = '/' + path.split('/')[1];
  document.querySelectorAll('.navbar__link').forEach(link => {
    link.classList.toggle('active', link.dataset.route === base);
  });
}

function renderNotFound() {
  document.getElementById('app').innerHTML = `
    <div class="error-state">
      <div class="state-icon">🔍</div>
      <h2 class="error-state__title">Página no encontrada</h2>
      <p class="error-state__msg">La ruta solicitada no existe.</p>
      <a href="#/" class="btn btn--primary">Volver al inicio</a>
    </div>
  `;
}

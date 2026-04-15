import { registerRoute, initRouter, navigateTo } from './router.js';
import {
  fetchPosts, fetchPostById, searchPosts,
  fetchPostsByTag, fetchAllTags,
  createPost, updatePost, deletePost,
} from './api.js';
import {
  renderSkeletonGrid, renderSpinner, renderGridSpinner,
  renderErrorPage, renderEmptyState, showToast, showConfirmDialog,
  renderListPage, updateGrid, restoreFilterValues, renderPostCard,
  renderDetailPage,
  renderCreatePage, renderEditPage,
  displayFieldErrors, clearFieldErrors, setSubmitBusy,
  renderStatsPage,
} from './ui.js';
import { validatePostForm, hasErrors } from './validation.js';

/* App state */
const state = {
  posts:       [],
  total:       0,
  page:        1,
  limit:       10,
  search:      '',
  tag:         '',
  userId:      '',
  cachedTags:  [],
};

/* Post list */
async function handleList() {
  renderSkeletonGrid();

  try {
    const [postsData, tags] = await Promise.allSettled([
      fetchPosts(state.limit, (state.page - 1) * state.limit),
      state.cachedTags.length ? Promise.resolve(state.cachedTags) : fetchAllTags(),
    ]);

    if (postsData.status === 'rejected') throw postsData.reason;

    const { posts, total } = postsData.value;

    if (tags.status === 'fulfilled') {
      state.cachedTags = Array.isArray(tags.value)
        ? tags.value.map(t => (typeof t === 'string' ? t : t.slug ?? t.name ?? t))
        : [];
    }

    state.posts = posts;
    state.total = total;

    renderListPage(posts, total, state.page, state.limit, state.cachedTags);
    restoreFilterValues(state.search, state.tag, state.userId);
    attachListListeners();
  } catch (err) {
    renderErrorPage(err.message);
  }
}

function attachListListeners() {
  /* Search */
  let searchTimer;
  document.getElementById('searchInput')?.addEventListener('input', e => {
    clearTimeout(searchTimer);
    state.search = e.target.value.trim();
    searchTimer = setTimeout(applyFilters, 380);
  });

  /* Tag filter */
  document.getElementById('tagFilter')?.addEventListener('change', e => {
    state.tag = e.target.value;
    applyFilters();
  });

  /* User filter */
  document.getElementById('userFilter')?.addEventListener('change', e => {
    state.userId = e.target.value;
    applyFilters();
  });

  /* Tag pill click inside grid */
  document.getElementById('postsGrid')?.addEventListener('click', e => {
    if (!e.target.classList.contains('tag')) return;
    const tag = e.target.dataset.tag;
    if (!tag) return;
    state.tag = tag;
    const sel = document.getElementById('tagFilter');
    if (sel) sel.value = tag;
    applyFilters();
  });

  /* Pagination */
  document.getElementById('prevPage')?.addEventListener('click', () => {
    if (state.page > 1) { state.page--; handleList(); }
  });

  document.getElementById('nextPage')?.addEventListener('click', () => {
    const pages = Math.ceil(state.total / state.limit);
    if (state.page < pages) { state.page++; handleList(); }
  });
}

async function applyFilters() {
  renderGridSpinner();

  try {
    let posts;

    if (state.search) {
      const d = await searchPosts(state.search);
      posts = d.posts;
    } else if (state.tag) {
      const d = await fetchPostsByTag(state.tag);
      posts = d.posts;
    } else {
      const d = await fetchPosts(state.limit, (state.page - 1) * state.limit);
      posts = d.posts;
      state.total = d.total;
    }

    if (state.userId) {
      posts = posts.filter(p => String(p.userId) === state.userId);
    }

    updateGrid(posts);
  } catch (err) {
    const grid = document.getElementById('postsGrid');
    if (grid) grid.innerHTML = `<p style="color:var(--color-danger);padding:var(--sp-lg)">${err.message}</p>`;
  }
}

/* Detail */
async function handleDetail({ id }) {
  renderSpinner();

  try {
    const post = await fetchPostById(id);
    renderDetailPage(post);

    document.getElementById('backBtn')?.addEventListener('click', () => navigateTo('/'));

    document.getElementById('deleteBtn')?.addEventListener('click', async () => {
      const ok = await showConfirmDialog(
        '¿Eliminar publicación?',
        `¿Seguro que quieres eliminar "${post.title}"? Esta acción no se puede deshacer.`
      );
      if (!ok) return;

      try {
        await deletePost(id);
        showToast('Publicación eliminada exitosamente.', 'success');
        setTimeout(() => navigateTo('/'), 900);
      } catch (err) {
        showToast(`Error al eliminar: ${err.message}`, 'error');
      }
    });
  } catch (err) {
    renderErrorPage(err.message);
  }
}

/* Create form */
function handleCreate() {
  renderCreatePage();
  bindPostForm(async ({ title, body }) => {
    const created = await createPost({ title, body, userId: 1 });
    showToast('¡Publicación creada exitosamente!', 'success');
    setTimeout(() => navigateTo(`/post/${created.id}`), 900);
  });
}

/* Edit form */
async function handleEdit({ id }) {
  renderSpinner();

  try {
    const post = await fetchPostById(id);
    renderEditPage(post);
    bindPostForm(async ({ title, body }) => {
      await updatePost(id, { title, body });
      showToast('¡Publicación actualizada exitosamente!', 'success');
      setTimeout(() => navigateTo(`/post/${id}`), 900);
    });
  } catch (err) {
    renderErrorPage(err.message);
  }
}

/* Shared form logic */
function bindPostForm(onSuccess) {
  const form = document.getElementById('postForm');
  if (!form) return;

  /* Real-time field validation */
  ['title', 'body', 'author'].forEach(field => {
    document.getElementById(field)?.addEventListener('input', () => {
      const val   = document.getElementById(field).value;
      const errEl = document.getElementById(`${field}Error`);
      const input = document.getElementById(field);
      if (!errEl) return;

      let msg = null;
      if (field === 'title'  && val.trim().length > 0 && val.trim().length < 5)
        msg = 'Mínimo 5 caracteres.';
      if (field === 'body'   && val.trim().length > 0 && val.trim().length < 20)
        msg = 'Mínimo 20 caracteres.';

      errEl.textContent = msg ?? '';
      input.classList.toggle('error', Boolean(msg));
    });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const title  = document.getElementById('title')?.value  ?? '';
    const body   = document.getElementById('body')?.value   ?? '';
    const author = document.getElementById('author')?.value ?? '';

    const errors = validatePostForm({ title, body, author });
    if (hasErrors(errors)) { displayFieldErrors(errors); return; }

    clearFieldErrors();
    setSubmitBusy(true);

    try {
      await onSuccess({ title, body, author });
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setSubmitBusy(false);
    }
  });
}

/* Statistics */
async function handleStats() {
  renderSpinner();

  try {
    const { posts } = await fetchPosts(150, 0);
    renderStatsPage(posts);
  } catch (err) {
    renderErrorPage(err.message);
  }
}

/* Mobile nav toggle */
function initNavToggle() {
  const toggle = document.getElementById('navToggle');
  const menu   = document.getElementById('navMenu');

  toggle?.addEventListener('click', () => menu?.classList.toggle('open'));

  menu?.querySelectorAll('.navbar__link').forEach(link =>
    link.addEventListener('click', () => menu.classList.remove('open'))
  );
}

/* Bootstrap */
function init() {
  initNavToggle();

  registerRoute('/',          handleList);
  registerRoute('/post/:id',  handleDetail);
  registerRoute('/create',    handleCreate);
  registerRoute('/edit/:id',  handleEdit);
  registerRoute('/stats',     handleStats);

  initRouter();
}

init();

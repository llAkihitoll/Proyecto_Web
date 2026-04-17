const BASE = 'https://dummyjson.com';

// Función central: hace el fetch y lanza error si la respuesta no es OK
async function request(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

// RF-01: Obtener listado paginado de posts
// GET /posts?limit=10&skip=0
export async function fetchPosts(limit = 10, skip = 0) {
  return request(`${BASE}/posts?limit=${limit}&skip=${skip}`);
}

// RF-02: Obtener un post por su ID
// GET /posts/{id}
export async function fetchPostById(id) {
  return request(`${BASE}/posts/${id}`);
}

// RF-06: Buscar posts por texto (título o cuerpo)
// GET /posts/search?q=texto
export async function searchPosts(query) {
  return request(`${BASE}/posts/search?q=${encodeURIComponent(query)}`);
}

// RF-06: Filtrar posts por tag
// GET /posts/tag/{tag}
export async function fetchPostsByTag(tag) {
  return request(`${BASE}/posts/tag/${encodeURIComponent(tag)}`);
}

// RF-06: Obtener todos los tags disponibles para el filtro
// GET /posts/tags
export async function fetchAllTags() {
  return request(`${BASE}/posts/tags`);
}

// RF-03: Crear un nuevo post
// POST /posts/add
export async function createPost(data) {
  return request(`${BASE}/posts/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

// RF-04: Editar un post existente
// PUT /posts/{id}
export async function updatePost(id, data) {
  return request(`${BASE}/posts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

// RF-05: Eliminar un post
// DELETE /posts/{id}
export async function deletePost(id) {
  return request(`${BASE}/posts/${id}`, {
    method: 'DELETE',
  });
}

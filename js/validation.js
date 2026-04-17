export function validateTitle(value) {
  if (!value || value.trim().length === 0) return 'El título es obligatorio.';
  if (value.trim().length < 5) return 'El título debe tener al menos 5 caracteres.';
  return null;
}

export function validateBody(value) {
  if (!value || value.trim().length === 0) return 'El contenido es obligatorio.';
  if (value.trim().length < 20) return 'El contenido debe tener al menos 20 caracteres.';
  return null;
}

export function validateAuthor(value) {
  if (!value || value.trim().length === 0) return 'El nombre del autor es obligatorio.';
  return null;
}

export function validatePostForm({ title, body, author }) {
  return {
    title:  validateTitle(title),
    body:   validateBody(body),
    author: validateAuthor(author),
  };
}

export function hasErrors(errors) {
  return Object.values(errors).some(Boolean);
}

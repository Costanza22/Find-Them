/**
 * Base URL for API. Empty in production (same origin); set REACT_APP_API_URL in dev if backend runs elsewhere.
 */
const API_BASE = process.env.REACT_APP_API_URL || '';

export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${p}`;
}

export async function apiFetch(path, options = {}) {
  const url = apiUrl(path);
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    let message = `Erro ${res.status}`;
    try {
      const json = JSON.parse(text);
      if (json.error) message = json.error;
    } catch (_) {
      if (text) message = text.slice(0, 200);
    }
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

const MAX_PHOTO_SIZE = 10 * 1024 * 1024; // 10 MB

export function validatePhoto(file, required = true) {
  if (!file && required) return 'Foto é obrigatória.';
  if (!file) return null;
  if (!file.type?.startsWith('image/')) return 'Envie uma imagem (JPG, PNG, etc.).';
  if (file.size > MAX_PHOTO_SIZE) return 'Imagem muito grande. Máximo 10 MB.';
  return null;
}

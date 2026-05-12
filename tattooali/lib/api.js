import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ORIGIN } from './config';

const TOKEN_KEY = '@tattooali:token';

async function parseBody(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

async function toApiError(res) {
  const body = await parseBody(res);
  const err = new Error(body?.message || body?.error || `HTTP ${res.status}`);
  err.status = res.status;
  err.data = body;
  throw err;
}

/**
 * @param {string} path - ex.: "/api/user/login" (mesmo padrão do web Vite)
 * @param {RequestInit & { body?: object }} options
 */
export async function apiFetch(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;

  const headers = new Headers(options.headers || {});
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  // Só adiciona o token do storage se não houver um Authorization já definido manualmente
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!isFormData && options.body != null && typeof options.body === 'object' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const body =
    options.body == null || typeof options.body === 'string' || isFormData
      ? options.body
      : JSON.stringify(options.body);

  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers,
      body: options.method && options.method !== 'GET' && options.method !== 'HEAD' ? body : undefined,
    });
  } catch (e) {
    const msg = String(e?.message || e);
    if (/network request failed|failed to fetch|aborted/i.test(msg)) {
      throw new Error(
        'Não foi possível alcançar o servidor. No celular físico não use localhost: use o mesmo Wi‑Fi do PC, backend rodando (porta 3000) e reinicie o Expo após criar .env com EXPO_PUBLIC_API_URL=http://IP_DO_SEU_PC:3000',
      );
    }
    throw e;
  }

  if (!res.ok) {
    await toApiError(res);
  }

  return parseBody(res);
}

export const api = {
  get: (p, opt) => apiFetch(p, { ...opt, method: 'GET' }),
  post: (p, body, opt) => apiFetch(p, { ...opt, method: 'POST', body }),
  put: (p, body, opt) => apiFetch(p, { ...opt, method: 'PUT', body }),
  del: (p, opt) => apiFetch(p, { ...opt, method: 'DELETE' }),
};

export { TOKEN_KEY };

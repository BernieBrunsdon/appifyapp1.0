import { auth } from '../firebase/config';

const RENDER_API = 'https://appify-ai-server.onrender.com';

/** Never call localhost from app.appifyai.com — many builds accidentally bake REACT_APP_API_URL=http://localhost:3001 */
function apiBase() {
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const local = host === 'localhost' || host === '127.0.0.1';
  const env = (process.env.REACT_APP_API_URL || '').trim();
  if (local) {
    return env || 'http://localhost:3001';
  }
  if (env && !env.includes('localhost') && !env.includes('127.0.0.1')) {
    return env.replace(/\/$/, '');
  }
  return RENDER_API;
}

const BASE = apiBase();

/** forceRefresh: true avoids "Invalid or expired token" after idle tabs (ID tokens expire ~1h). */
export async function getIdToken(forceRefresh = false) {
  const u = auth.currentUser;
  if (!u) return null;
  return u.getIdToken(forceRefresh);
}

export async function api(path, options = {}) {
  let token = await getIdToken(true);
  if (!token) throw new Error('Not signed in');
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!res.ok) throw new Error(data.error || res.statusText || 'API error');
  return data;
}

// ============================================================
// api.js — helper compartido por todas las páginas
// Cambia API_BASE si tu backend corre en otra URL/puerto.
// ============================================================
const API_BASE = '/api';

const Sesion = {
  guardar(token, usuario) {
    localStorage.setItem('cv_token', token);
    localStorage.setItem('cv_usuario', JSON.stringify(usuario));
  },
  token() { return localStorage.getItem('cv_token'); },
  usuario() {
    const raw = localStorage.getItem('cv_usuario');
    return raw ? JSON.parse(raw) : null;
  },
  cerrar() {
    localStorage.removeItem('cv_token');
    localStorage.removeItem('cv_usuario');
    window.location.href = 'login.html';
  },
  estaLogueado() { return !!this.token(); },
  requiereRol(rolesPermitidos) {
    const u = this.usuario();
    if (!u || !rolesPermitidos.includes(u.rol)) {
      window.location.href = 'login.html';
      return null;
    }
    return u;
  },
};

// Escapa caracteres HTML para prevenir XSS al renderizar datos con innerHTML
function esc(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));
}

async function apiFetch(path, { method = 'GET', body = null, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const t = Sesion.token();
    if (t) headers['Authorization'] = `Bearer ${t}`;
  }
  const resp = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try { data = await resp.json(); } catch (e) { /* respuesta vacía */ }

  if (!resp.ok) {
    const msg = (data && data.error) ? data.error : `Error ${resp.status}`;
    throw new Error(msg);
  }
  return data;
}

// Pinta el nav según si hay sesión activa o no (usado en páginas públicas)
function pintarNavPublico() {
  const cont = document.getElementById('nav-actions');
  if (!cont) return;
  const u = Sesion.usuario();
  if (u) {
    const destino = u.rol === 'administrador' ? 'panel-admin.html'
                  : u.rol === 'director_tecnico' ? 'panel-director.html'
                  : 'panel-jugador.html';
    cont.innerHTML = `<a class="btn btn-ghost btn-sm" href="${destino}">Mi panel</a>`;
  } else {
    cont.innerHTML = `<a class="btn btn-primary btn-sm" href="login.html">Iniciar sesión</a>`;
  }
}

document.addEventListener('DOMContentLoaded', pintarNavPublico);

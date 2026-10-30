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

// ============================================================
// Animaciones compartidas
// ============================================================

// Navegación entre pestañas con animación de entrada en cada cambio
function configurarTabs() {
  document.querySelectorAll('.tab-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.tab-link').forEach((l) => l.classList.remove('active'));
      document.querySelectorAll('.tab-view').forEach((v) => {
        v.style.display = 'none';
        v.classList.remove('tab-enter');
      });
      link.classList.add('active');
      const vista = document.getElementById(`tab-${link.dataset.tab}`);
      if (!vista) return;
      vista.style.display = 'block';
      void vista.offsetWidth;
      vista.classList.add('tab-enter');
    });
  });
}

// Onda (ripple) al hacer clic en cualquier botón
document.addEventListener('click', (e) => {
  const boton = e.target.closest('.btn');
  if (!boton || boton.disabled) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const rect = boton.getBoundingClientRect();
  const tamano = Math.max(rect.width, rect.height);
  const onda = document.createElement('span');
  onda.className = 'btn-ripple';
  onda.style.width = `${tamano}px`;
  onda.style.height = `${tamano}px`;
  onda.style.left = `${e.clientX - rect.left - tamano / 2}px`;
  onda.style.top = `${e.clientY - rect.top - tamano / 2}px`;
  boton.appendChild(onda);
  setTimeout(() => onda.remove(), 650);
});

// Aparición suave de secciones y tarjetas al hacer scroll
function prepararReveal() {
  const elementos = document.querySelectorAll('.block > .wrap');

  if (!('IntersectionObserver' in window)) {
    elementos.forEach((el) => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('in-view');
        observer.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  elementos.forEach((el) => {
    if (el.dataset.revealPreparado) return;
    el.dataset.revealPreparado = '1';
    el.classList.add('reveal');
    observer.observe(el);
  });
}

prepararReveal();
window.refrescarAnimaciones = prepararReveal;

function configurarCabecera() {
  if (document.body.classList.contains('panel-page')) return;
  const header = document.querySelector('.site-header');
  if (!header) return;

  const actualizar = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 6);
  };

  actualizar();
  window.addEventListener('scroll', actualizar, { passive: true });
}

function crearBarraProgreso() {
  const barra = document.createElement('div');
  barra.className = 'scroll-progress';
  barra.setAttribute('aria-hidden', 'true');
  document.body.appendChild(barra);

  const actualizar = () => {
    const alto = document.documentElement.scrollHeight - window.innerHeight;
    const avance = alto > 0 ? Math.min(window.scrollY / alto, 1) : 0;
    barra.style.transform = `scaleX(${avance})`;
  };

  actualizar();
  window.addEventListener('scroll', actualizar, { passive: true });
  window.addEventListener('resize', actualizar);
}

function crearBotonSubir() {
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'to-top';
  boton.setAttribute('aria-label', 'Volver arriba');
  boton.title = 'Volver arriba';
  boton.innerHTML = '<span class="ball"></span>';

  boton.addEventListener('click', () => {
    const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reducir ? 'auto' : 'smooth' });
  });

  document.body.appendChild(boton);

  const actualizar = () => {
    boton.classList.toggle('visible', window.scrollY > 420);
  };

  actualizar();
  window.addEventListener('scroll', actualizar, { passive: true });
}

function activarBrilloTarjetas() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.addEventListener('pointermove', (e) => {
    if (!(e.target instanceof Element)) return;
    const tarjeta = e.target.closest('.card, .metrica, .score-row, .gallery-grid .ph, .auth-card');
    if (!tarjeta) return;

    const rect = tarjeta.getBoundingClientRect();
    tarjeta.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    tarjeta.style.setProperty('--my', `${e.clientY - rect.top}px`);

    if (!tarjeta.matches('.card, .metrica, .gallery-grid .ph, .auth-card')) return;
    const rx = ((e.clientY - rect.top) / rect.height - 0.5) * -7;
    const ry = ((e.clientX - rect.left) / rect.width - 0.5) * 9;
    tarjeta.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
    tarjeta.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
  }, { passive: true });

  document.addEventListener('pointerout', (e) => {
    if (!(e.target instanceof Element)) return;
    const tarjeta = e.target.closest('.card, .metrica, .gallery-grid .ph, .auth-card');
    if (!tarjeta) return;
    if (e.relatedTarget instanceof Node && tarjeta.contains(e.relatedTarget)) return;
    tarjeta.style.removeProperty('--rx');
    tarjeta.style.removeProperty('--ry');
  }, { passive: true });
}

function activarParallaxHero() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const hero = document.querySelector('.hero');
  const bola = document.querySelector('.hero-ball');
  if (!hero || !bola) return;

  const actualizar = () => {
    const avance = Math.min(window.scrollY, hero.offsetHeight);
    bola.style.setProperty('--parallax', `${avance * 0.14}px`);
  };

  actualizar();
  window.addEventListener('scroll', actualizar, { passive: true });
}

function iniciarRefinamientoVisual() {
  configurarCabecera();
  crearBarraProgreso();
  crearBotonSubir();
  activarBrilloTarjetas();
  activarParallaxHero();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciarRefinamientoVisual);
} else {
  iniciarRefinamientoVisual();
}

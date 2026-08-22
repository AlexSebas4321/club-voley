document.addEventListener('DOMContentLoaded', async () => {
  const usuario = Sesion.requiereRol(['jugador']);
  if (!usuario) return;
  document.getElementById('quien-soy').textContent = `${usuario.nombre} · Jugador`;

  // --- Navegación entre pestañas ---
  document.querySelectorAll('.tab-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active'));
      document.querySelectorAll('.tab-view').forEach(v => v.style.display = 'none');
      link.classList.add('active');
      document.getElementById(`tab-${link.dataset.tab}`).style.display = 'block';
    });
  });

  // --- Mis horarios ---
  async function cargarHorarios() {
    const cont = document.getElementById('horarios-cont');
    try {
      const data = await apiFetch('/horarios/mi-equipo', { auth: true });
      if (!data.horarios || data.horarios.length === 0) {
        cont.innerHTML = `<div class="empty-state">${esc(data.mensaje || 'No hay horarios cargados para tu equipo todavía.')}</div>`;
        return;
      }
      cont.innerHTML = `<div class="card">` + data.horarios.map(h => `
        <div class="horario-row">
          <div class="dia">${esc(h.dia)}</div>
          <div>${h.hora_inicio.slice(0,5)} a ${h.hora_fin.slice(0,5)} hs</div>
          <div>${esc(h.lugar || '—')}</div>
        </div>`).join('') + `</div>`;
    } catch (e) {
      cont.innerHTML = `<div class="empty-state">Error: ${esc(e.message)}</div>`;
    }
  }

  // --- Resultados (todos, filtrables luego por equipo) ---
  async function cargarResultados() {
    const cont = document.getElementById('resultados-cont');
    try {
      const partidos = await apiFetch('/partidos');
      if (partidos.length === 0) {
        cont.innerHTML = '<div class="empty-state">Todavía no hay resultados cargados.</div>';
        return;
      }
      cont.innerHTML = partidos.map(p => `
        <div class="score-row">
          <div>
            <div class="teams">${esc(p.nombre_equipo)} vs. ${esc(p.rival)}</div>
            <div class="fecha">${new Date(p.fecha).toLocaleDateString('es-AR')}</div>
          </div>
          <div class="score">${esc(p.resultado || '—')}</div>
        </div>`).join('');
    } catch (e) {
      cont.innerHTML = `<div class="empty-state">Error: ${esc(e.message)}</div>`;
    }
  }

  // --- Cuota / pago online (Caso de Uso 2) ---
  async function cargarCuota() {
    const cont = document.getElementById('cuota-cont');
    try {
      let cuotas = await apiFetch('/cuotas/mias', { auth: true });
      if (cuotas.length === 0) {
        await apiFetch('/cuotas/generar', { method: 'POST', auth: true, body: { monto: 15000 } });
        cuotas = await apiFetch('/cuotas/mias', { auth: true });
      }
      cont.innerHTML = cuotas.map(c => `
        <div class="score-row">
          <div>
            <div class="teams">Cuota ${c.mes}/${c.anio}</div>
            <div class="fecha">Monto: $${c.monto}</div>
          </div>
          <div>
            ${c.estado === 'pagada'
              ? '<span class="badge green">Pagada</span>'
              : `<button class="btn btn-primary btn-sm" onclick="pagar(${c.id_cuota})">Pagar ahora</button>`}
          </div>
        </div>`).join('');
    } catch (e) {
      cont.innerHTML = `<div class="empty-state">Error: ${esc(e.message)}</div>`;
    }
  }

  async function pagar(id_cuota) {
    const alertBox = document.getElementById('cuota-alert');
    alertBox.innerHTML = '';
    try {
      await apiFetch(`/cuotas/${id_cuota}/pagar`, {
        method: 'POST', auth: true, body: { metodo_pago: 'Tarjeta de débito' },
      });
      alertBox.innerHTML = '<div class="alert alert-ok">Pago procesado. Te enviamos el comprobante por correo.</div>';
      cargarCuota();
    } catch (e) {
      alertBox.innerHTML = `<div class="alert alert-error">${esc(e.message)}</div>`;
    }
  }

  window.pagar = pagar;

  // --- Noticias ---
  async function cargarNoticias() {
    const cont = document.getElementById('noticias-cont');
    try {
      const noticias = await apiFetch('/noticias');
      if (noticias.length === 0) {
        cont.innerHTML = '<div class="empty-state">Sin noticias por el momento.</div>';
        return;
      }
      cont.innerHTML = noticias.map(n => `
        <div class="card">
          <span class="meta">${new Date(n.fecha_publicacion).toLocaleDateString('es-AR')} · ${esc(n.autor || 'Club')}</span>
          <h3>${esc(n.titulo)}</h3>
          <p>${esc(n.contenido)}</p>
        </div>`).join('');
    } catch (e) {
      cont.innerHTML = `<div class="empty-state">Error: ${esc(e.message)}</div>`;
    }
  }

  cargarHorarios();
  cargarResultados();
  cargarCuota();
  cargarNoticias();
});

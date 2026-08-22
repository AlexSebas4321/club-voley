document.addEventListener('DOMContentLoaded', async () => {
  const usuario = Sesion.requiereRol(['director_tecnico', 'administrador']);
  if (!usuario) return;
  document.getElementById('quien-soy').textContent = `${usuario.nombre} · Director Técnico`;

  document.querySelectorAll('.tab-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active'));
      document.querySelectorAll('.tab-view').forEach(v => v.style.display = 'none');
      link.classList.add('active');
      document.getElementById(`tab-${link.dataset.tab}`).style.display = 'block';
    });
  });

  let EQUIPOS = [];

  async function cargarEquiposEnSelects() {
    EQUIPOS = await apiFetch('/equipos');
    const opciones = EQUIPOS.map(e => `<option value="${e.id_equipo}">${esc(e.nombre_equipo)}</option>`).join('');
    document.getElementById('r-equipo').innerHTML = opciones;
    document.getElementById('h-equipo').innerHTML = opciones;
    document.getElementById('m-equipo').innerHTML = opciones;
  }

  // ---------------- NOTICIAS ----------------
  document.getElementById('form-noticia').addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertBox = document.getElementById('noticia-alert');
    try {
      await apiFetch('/noticias', {
        method: 'POST', auth: true,
        body: {
          titulo: document.getElementById('n-titulo').value,
          contenido: document.getElementById('n-contenido').value,
          estado: document.getElementById('n-estado').value,
        },
      });
      alertBox.innerHTML = '<div class="alert alert-ok">Noticia guardada.</div>';
      e.target.reset();
      cargarMisNoticias();
    } catch (err) {
      alertBox.innerHTML = `<div class="alert alert-error">${esc(err.message)}</div>`;
    }
  });

  async function cargarMisNoticias() {
    const cont = document.getElementById('mis-noticias');
    try {
      const noticias = await apiFetch('/noticias/todas', { auth: true });
      if (noticias.length === 0) { cont.innerHTML = '<div class="empty-state">Todavía no publicaste noticias.</div>'; return; }
      cont.innerHTML = noticias.map(n => `
        <div class="card">
          <span class="badge ${n.estado === 'publicada' ? 'green' : 'gold'}">${esc(n.estado)}</span>
          <h3>${esc(n.titulo)}</h3>
          <p>${esc(n.contenido)}</p>
        </div>`).join('');
    } catch (err) {
      cont.innerHTML = `<div class="empty-state">Error: ${esc(err.message)}</div>`;
    }
  }

  // ---------------- RESULTADOS ----------------
  document.getElementById('form-resultado').addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertBox = document.getElementById('resultado-alert');
    try {
      await apiFetch('/partidos', {
        method: 'POST', auth: true,
        body: {
          id_equipo: document.getElementById('r-equipo').value,
          rival: document.getElementById('r-rival').value,
          fecha: document.getElementById('r-fecha').value,
          resultado: document.getElementById('r-resultado').value,
        },
      });
      alertBox.innerHTML = '<div class="alert alert-ok">Partido guardado.</div>';
      e.target.reset();
      cargarResultados();
    } catch (err) {
      alertBox.innerHTML = `<div class="alert alert-error">${esc(err.message)}</div>`;
    }
  });

  async function cargarResultados() {
    const cont = document.getElementById('lista-resultados');
    try {
      const partidos = await apiFetch('/partidos');
      if (partidos.length === 0) { cont.innerHTML = '<div class="empty-state">Sin partidos cargados.</div>'; return; }
      cont.innerHTML = partidos.map(p => `
        <div class="score-row">
          <div>
            <div class="teams">${esc(p.nombre_equipo)} vs. ${esc(p.rival)}</div>
            <div class="fecha">${new Date(p.fecha).toLocaleDateString('es-AR')}</div>
          </div>
          <div class="score">${esc(p.resultado || '—')}</div>
        </div>`).join('');
    } catch (err) {
      cont.innerHTML = `<div class="empty-state">Error: ${esc(err.message)}</div>`;
    }
  }

  // ---------------- HORARIOS ----------------
  document.getElementById('form-horario').addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertBox = document.getElementById('horario-alert');
    try {
      await apiFetch('/horarios', {
        method: 'POST', auth: true,
        body: {
          id_equipo: document.getElementById('h-equipo').value,
          dia: document.getElementById('h-dia').value,
          hora_inicio: document.getElementById('h-inicio').value,
          hora_fin: document.getElementById('h-fin').value,
          lugar: document.getElementById('h-lugar').value,
        },
      });
      alertBox.innerHTML = '<div class="alert alert-ok">Horario agregado.</div>';
      e.target.reset();
      cargarHorarios();
    } catch (err) {
      alertBox.innerHTML = `<div class="alert alert-error">${esc(err.message)}</div>`;
    }
  });

  async function cargarHorarios() {
    const cont = document.getElementById('lista-horarios');
    try {
      const horarios = await apiFetch('/horarios');
      if (horarios.length === 0) { cont.innerHTML = '<div class="empty-state">Sin horarios cargados.</div>'; return; }
      cont.innerHTML = `<div class="card">` + horarios.map(h => `
        <div class="horario-row">
          <div class="dia">${esc(h.nombre_equipo)}</div>
          <div>${esc(h.dia)} · ${h.hora_inicio.slice(0,5)}-${h.hora_fin.slice(0,5)}</div>
          <div>
            ${esc(h.lugar || '—')}
            <button class="btn btn-danger btn-sm" style="margin-left:8px" onclick="borrarHorario(${h.id_horario})">Eliminar</button>
          </div>
        </div>`).join('') + `</div>`;
    } catch (err) {
      cont.innerHTML = `<div class="empty-state">Error: ${esc(err.message)}</div>`;
    }
  }

  async function borrarHorario(id) {
    try {
      await apiFetch(`/horarios/${id}`, { method: 'DELETE', auth: true });
    } catch (e) { /* ignore */ }
    cargarHorarios();
  }

  window.borrarHorario = borrarHorario;

  // ---------------- MENSAJES (Gmail) ----------------
  document.getElementById('m-destino').addEventListener('change', (e) => {
    document.getElementById('campo-equipo').style.display = e.target.value === 'equipo' ? 'block' : 'none';
    document.getElementById('campo-individual').style.display = e.target.value === 'individual' ? 'block' : 'none';
  });

  async function cargarDestinatarios() {
    try {
      const data = await apiFetch('/mensajes/destinatarios', { auth: true });
      const jugadores = data.usuarios.filter(u => u.rol === 'jugador');
      document.getElementById('m-usuario').innerHTML = jugadores.map(u => `<option value="${u.id_usuario}">${esc(u.nombre)} (${esc(u.email)})</option>`).join('');
    } catch (e) { /* ignore */ }
  }

  document.getElementById('form-mensaje').addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertBox = document.getElementById('msg-alert');
    alertBox.innerHTML = '<div class="alert alert-ok">Enviando…</div>';
    try {
      const destino = document.getElementById('m-destino').value;
      const resultado = await apiFetch('/mensajes/enviar', {
        method: 'POST', auth: true,
        body: {
          destino,
          id_equipo: destino === 'equipo' ? document.getElementById('m-equipo').value : undefined,
          id_usuario: destino === 'individual' ? document.getElementById('m-usuario').value : undefined,
          asunto: document.getElementById('m-asunto').value,
          cuerpo: document.getElementById('m-cuerpo').value,
        },
      });
      alertBox.innerHTML = `<div class="alert alert-ok">${esc(resultado.mensaje)}</div>`;
      e.target.reset();
    } catch (err) {
      alertBox.innerHTML = `<div class="alert alert-error">${esc(err.message)}</div>`;
    }
  });

  await cargarEquiposEnSelects();
  cargarMisNoticias();
  cargarResultados();
  cargarHorarios();
  cargarDestinatarios();
});

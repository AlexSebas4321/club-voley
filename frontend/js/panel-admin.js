document.addEventListener('DOMContentLoaded', async () => {
  const usuario = Sesion.requiereRol(['administrador']);
  if (!usuario) return;
  document.getElementById('quien-soy').innerHTML = `<strong>${esc(usuario.nombre)}</strong>Administrador`;

  document.querySelectorAll('.tab-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active'));
      document.querySelectorAll('.tab-view').forEach(v => v.style.display = 'none');
      link.classList.add('active');
      document.getElementById(`tab-${link.dataset.tab}`).style.display = 'block';
    });
  });

  // ==================== RESUMEN / DASHBOARD ====================
  async function cargarResumen() {
    const cont = document.getElementById('estadisticas');
    try {
      const [usuarios, equipos, noticias, partidos] = await Promise.all([
        apiFetch('/usuarios', { auth: true }),
        apiFetch('/equipos'),
        apiFetch('/noticias'),
        apiFetch('/partidos'),
      ]);
      const jugadores = usuarios.filter(u => u.rol === 'jugador').length;
      const directores = usuarios.filter(u => u.rol === 'director_tecnico').length;
      const admins = usuarios.filter(u => u.rol === 'administrador').length;
      cont.innerHTML = `
        <div class="metrica orange"><div class="num">${usuarios.length}</div><div class="lab">Usuarios</div></div>
        <div class="metrica gold"><div class="num">${jugadores}</div><div class="lab">Jugadores</div></div>
        <div class="metrica blue"><div class="num">${directores}</div><div class="lab">Directores</div></div>
        <div class="metrica teal"><div class="num">${admins}</div><div class="lab">Administradores</div></div>
        <div class="metrica purple"><div class="num">${equipos.length}</div><div class="lab">Equipos</div></div>
        <div class="metrica green"><div class="num">${noticias.length}</div><div class="lab">Noticias</div></div>
        <div class="metrica teal"><div class="num">${partidos.length}</div><div class="lab">Partidos</div></div>
      `;
    } catch (e) {
      cont.innerHTML = `<div class="empty-state">Error: ${esc(e.message)}</div>`;
    }
  }

  async function cargarResumenNoticias() {
    const cont = document.getElementById('res-noticias');
    try {
      const noticias = await apiFetch('/noticias');
      if (noticias.length === 0) { cont.innerHTML = '<div class="empty-state">Sin noticias publicadas.</div>'; return; }
      cont.innerHTML = noticias.slice(0, 4).map(n => `
        <div class="card">
          <span class="meta">${new Date(n.fecha_publicacion).toLocaleDateString('es-AR')} · ${esc(n.autor || 'Club')}</span>
          <h3>${esc(n.titulo)}</h3>
          <p>${esc(n.contenido.length > 120 ? n.contenido.slice(0,120)+'…' : n.contenido)}</p>
        </div>`).join('');
    } catch (e) {
      cont.innerHTML = `<div class="empty-state">Error: ${esc(e.message)}</div>`;
    }
  }

  // ==================== USUARIOS ====================
  document.getElementById('form-usuario').addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertBox = document.getElementById('usr-alert');
    try {
      await apiFetch('/usuarios', {
        method: 'POST', auth: true,
        body: {
          nombre: document.getElementById('u-nombre').value,
          email: document.getElementById('u-email').value,
          contrasena: document.getElementById('u-pass').value,
          rol: document.getElementById('u-rol').value,
        },
      });
      alertBox.innerHTML = '<div class="alert alert-ok">Usuario creado.</div>';
      e.target.reset();
      cargarUsuarios();
    } catch (err) {
      alertBox.innerHTML = `<div class="alert alert-error">${esc(err.message)}</div>`;
    }
  });

  async function cargarUsuarios() {
    const cont = document.getElementById('tabla-usuarios');
    try {
      const usuarios = await apiFetch('/usuarios', { auth: true });
      cont.innerHTML = `
        <table class="tbl">
          <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Alta</th><th></th></tr></thead>
          <tbody>
            ${usuarios.map(u => `
              <tr>
                <td>${esc(u.nombre)}</td>
                <td>${esc(u.email)}</td>
                <td>
                  <select onchange="cambiarRol(${u.id_usuario}, this.value)">
                    <option value="jugador" ${u.rol==='jugador'?'selected':''}>Jugador</option>
                    <option value="director_tecnico" ${u.rol==='director_tecnico'?'selected':''}>Director Técnico</option>
                    <option value="administrador" ${u.rol==='administrador'?'selected':''}>Administrador</option>
                  </select>
                </td>
                <td>${new Date(u.fecha_alta).toLocaleDateString('es-AR')}</td>
                <td><button class="btn btn-danger btn-sm" onclick="borrarUsuario(${u.id_usuario})">Eliminar</button></td>
              </tr>`).join('')}
          </tbody>
        </table>`;
    } catch (err) {
      cont.innerHTML = `<div class="empty-state">Error: ${esc(err.message)}</div>`;
    }
  }

  async function cambiarRol(id, rol) {
    try {
      await apiFetch(`/usuarios/${id}`, { method: 'PUT', auth: true, body: { rol } });
    } catch (e) { /* ignore */ }
    cargarUsuarios();
    cargarSelectsDirectores();
  }

  async function borrarUsuario(id) {
    if (!confirm('¿Eliminar este usuario definitivamente?')) return;
    try {
      await apiFetch(`/usuarios/${id}`, { method: 'DELETE', auth: true });
    } catch (e) { /* ignore */ }
    cargarUsuarios();
  }

  window.cambiarRol = cambiarRol;
  window.borrarUsuario = borrarUsuario;

  // ==================== CATEGORÍAS Y EQUIPOS ====================
  document.getElementById('form-categoria').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/equipos/categorias', {
        method: 'POST', auth: true,
        body: { nombre: document.getElementById('c-nombre').value, descripcion: document.getElementById('c-desc').value },
      });
      e.target.reset();
      cargarCategorias();
    } catch (err) { /* ignore */ }
  });

  async function cargarCategorias() {
    try {
      const categorias = await apiFetch('/equipos/categorias');
      document.getElementById('lista-categorias').innerHTML = `
        <div class="grid grid-3">${categorias.map(c => `
          <div class="card"><span class="badge blue">Categoría</span><h3>${esc(c.nombre)}</h3><p>${esc(c.descripcion || '')}</p></div>`).join('')}</div>`;
      document.getElementById('e-categoria').innerHTML = categorias.map(c => `<option value="${c.id_categoria}">${esc(c.nombre)}</option>`).join('');
    } catch (e) { /* ignore */ }
  }

  document.getElementById('form-equipo').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/equipos', {
        method: 'POST', auth: true,
        body: {
          nombre_equipo: document.getElementById('e-nombre').value,
          id_categoria: document.getElementById('e-categoria').value,
          id_director_tecnico: document.getElementById('e-director').value || null,
          descripcion: document.getElementById('e-desc').value,
        },
      });
      e.target.reset();
      cargarEquipos();
    } catch (err) { /* ignore */ }
  });

  async function cargarSelectsDirectores() {
    try {
      const usuarios = await apiFetch('/usuarios', { auth: true });
      const directores = usuarios.filter(u => u.rol === 'director_tecnico');
      const opciones = '<option value="">Sin asignar</option>' +
        directores.map(d => `<option value="${d.id_usuario}">${esc(d.nombre)}</option>`).join('');
      document.getElementById('e-director').innerHTML = opciones;
      if (document.getElementById('ar-equipo')) prellenarEquipos();
    } catch (e) { /* ignore */ }
  }

  async function cargarEquipos() {
    try {
      const equipos = await apiFetch('/equipos');
      document.getElementById('lista-equipos').innerHTML = `
        <div class="grid grid-3">${equipos.map(e => `
          <div class="card">
            <span class="badge blue">${esc(e.nombre_categoria || 'Sin categoría')}</span>
            <h3>${esc(e.nombre_equipo)}</h3>
            <p>DT: ${esc(e.nombre_director || 'Sin asignar')}</p>
          </div>`).join('')}</div>`;
    } catch (e) { /* ignore */ }
  }

  // ==================== NOTICIAS (admin) ====================
  document.getElementById('form-admin-noticia').addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertBox = document.getElementById('admin-noticia-alert');
    try {
      await apiFetch('/noticias', {
        method: 'POST', auth: true,
        body: {
          titulo: document.getElementById('an-titulo').value,
          contenido: document.getElementById('an-contenido').value,
          estado: document.getElementById('an-estado').value,
        },
      });
      alertBox.innerHTML = '<div class="alert alert-ok">Noticia guardada.</div>';
      e.target.reset();
      cargarTodasNoticias();
    } catch (err) {
      alertBox.innerHTML = `<div class="alert alert-error">${esc(err.message)}</div>`;
    }
  });

  async function cargarTodasNoticias() {
    const cont = document.getElementById('admin-todas-noticias');
    try {
      const noticias = await apiFetch('/noticias/todas', { auth: true });
      if (noticias.length === 0) { cont.innerHTML = '<div class="empty-state">Todavía no hay noticias.</div>'; return; }
      cont.innerHTML = noticias.map(n => `
        <div class="card">
          <span class="badge ${n.estado === 'publicada' ? 'green' : 'gold'}">${esc(n.estado)}</span>
          <span class="meta" style="margin-left:8px">${esc(n.autor || 'Club')}</span>
          <h3>${esc(n.titulo)}</h3>
          <p>${esc(n.contenido)}</p>
          <button class="btn btn-danger btn-sm" onclick="borrarNoticia(${n.id_noticia})">Eliminar</button>
        </div>`).join('');
    } catch (err) {
      cont.innerHTML = `<div class="empty-state">Error: ${esc(err.message)}</div>`;
    }
  }

  async function borrarNoticia(id) {
    if (!confirm('¿Eliminar esta noticia definitivamente?')) return;
    try {
      await apiFetch(`/noticias/${id}`, { method: 'DELETE', auth: true });
    } catch (e) { /* ignore */ }
    cargarTodasNoticias();
    cargarResumenNoticias();
  }
  window.borrarNoticia = borrarNoticia;

  // ==================== RESULTADOS (admin) ====================
  document.getElementById('form-admin-resultado').addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertBox = document.getElementById('admin-resultado-alert');
    try {
      await apiFetch('/partidos', {
        method: 'POST', auth: true,
        body: {
          id_equipo: document.getElementById('ar-equipo').value,
          rival: document.getElementById('ar-rival').value,
          fecha: document.getElementById('ar-fecha').value,
          resultado: document.getElementById('ar-resultado').value,
        },
      });
      alertBox.innerHTML = '<div class="alert alert-ok">Partido guardado.</div>';
      e.target.reset();
      cargarAdminResultados();
    } catch (err) {
      alertBox.innerHTML = `<div class="alert alert-error">${esc(err.message)}</div>`;
    }
  });

  async function cargarAdminResultados() {
    const cont = document.getElementById('admin-lista-resultados');
    try {
      const partidos = await apiFetch('/partidos');
      if (partidos.length === 0) { cont.innerHTML = '<div class="empty-state">Sin partidos cargados.</div>'; return; }
      cont.innerHTML = partidos.map(p => `
        <div class="score-row ${p.resultado ? '' : 'gold'}">
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

  // ==================== HORARIOS (admin) ====================
  document.getElementById('form-admin-horario').addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertBox = document.getElementById('admin-horario-alert');
    try {
      await apiFetch('/horarios', {
        method: 'POST', auth: true,
        body: {
          id_equipo: document.getElementById('ah-equipo').value,
          dia: document.getElementById('ah-dia').value,
          hora_inicio: document.getElementById('ah-inicio').value,
          hora_fin: document.getElementById('ah-fin').value,
          lugar: document.getElementById('ah-lugar').value,
        },
      });
      alertBox.innerHTML = '<div class="alert alert-ok">Horario agregado.</div>';
      e.target.reset();
      cargarAdminHorarios();
    } catch (err) {
      alertBox.innerHTML = `<div class="alert alert-error">${esc(err.message)}</div>`;
    }
  });

  async function cargarAdminHorarios() {
    const cont = document.getElementById('admin-lista-horarios');
    try {
      const horarios = await apiFetch('/horarios');
      if (horarios.length === 0) { cont.innerHTML = '<div class="empty-state">Sin horarios cargados.</div>'; return; }
      cont.innerHTML = `<div class="card">` + horarios.map(h => `
        <div class="horario-row">
          <div class="dia">${esc(h.nombre_equipo)}</div>
          <div>${esc(h.dia)} · ${h.hora_inicio.slice(0,5)}-${h.hora_fin.slice(0,5)}</div>
          <div>
            ${esc(h.lugar || '—')}
            <button class="btn btn-danger btn-sm" style="margin-left:8px" onclick="borrarHorarioAdmin(${h.id_horario})">Eliminar</button>
          </div>
        </div>`).join('') + `</div>`;
    } catch (err) {
      cont.innerHTML = `<div class="empty-state">Error: ${esc(err.message)}</div>`;
    }
  }

  async function borrarHorarioAdmin(id) {
    if (!confirm('¿Eliminar este horario?')) return;
    try {
      await apiFetch(`/horarios/${id}`, { method: 'DELETE', auth: true });
    } catch (e) { /* ignore */ }
    cargarAdminHorarios();
  }
  window.borrarHorarioAdmin = borrarHorarioAdmin;

  // ==================== MENSAJES (Gmail) ====================
  document.getElementById('m-destino').addEventListener('change', (e) => {
    document.getElementById('campo-equipo').style.display = e.target.value === 'equipo' ? 'block' : 'none';
    document.getElementById('campo-individual').style.display = e.target.value === 'individual' ? 'block' : 'none';
  });

  async function cargarDestinatarios() {
    try {
      const data = await apiFetch('/mensajes/destinatarios', { auth: true });
      document.getElementById('m-equipo').innerHTML = data.equipos.map(e => `<option value="${e.id_equipo}">${esc(e.nombre_equipo)}</option>`).join('');
      document.getElementById('m-usuario').innerHTML = data.usuarios.map(u => `<option value="${u.id_usuario}">${esc(u.nombre)} (${esc(u.rol)}) — ${esc(u.email)}</option>`).join('');
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
      cargarHistorial();
    } catch (err) {
      alertBox.innerHTML = `<div class="alert alert-error">${esc(err.message)}</div>`;
    }
  });

  // ==================== HISTORIAL ====================
  async function cargarHistorial() {
    const cont = document.getElementById('tabla-historial');
    try {
      const historial = await apiFetch('/mensajes/historial', { auth: true });
      if (historial.length === 0) { cont.innerHTML = '<div class="empty-state">Todavía no se enviaron mensajes.</div>'; return; }
      cont.innerHTML = `
        <table class="tbl">
          <thead><tr><th>Fecha</th><th>De</th><th>Para</th><th>Asunto</th><th>Estado</th></tr></thead>
          <tbody>
            ${historial.map(m => `
              <tr>
                <td>${new Date(m.fecha_envio).toLocaleString('es-AR')}</td>
                <td>${esc(m.remitente || '—')}</td>
                <td>${esc(m.destinatario_email)}</td>
                <td>${esc(m.asunto)}</td>
                <td><span class="badge ${m.estado_envio === 'enviado' ? 'green' : 'red'}">${esc(m.estado_envio)}</span></td>
              </tr>`).join('')}
          </tbody>
        </table>`;
    } catch (err) {
      cont.innerHTML = `<div class="empty-state">Error: ${esc(err.message)}</div>`;
    }
  }

  // ==================== EQUIPOS aux para selects ====================
  async function prellenarEquipos() {
    try {
      const equipos = await apiFetch('/equipos');
      const opciones = equipos.map(e => `<option value="${e.id_equipo}">${esc(e.nombre_equipo)}</option>`).join('');
      if (document.getElementById('ar-equipo')) document.getElementById('ar-equipo').innerHTML = opciones;
      if (document.getElementById('ah-equipo')) document.getElementById('ah-equipo').innerHTML = opciones;
    } catch (e) { /* ignore */ }
  }

  // ==================== CHAT INTERNO ====================
  let contactoActivo = null;
  let contactos = [];
  let pollTimer = null;

  async function cargarContactos() {
    const cont = document.getElementById('chat-contactos');
    try {
      const data = await apiFetch('/mensajes/chat/contactos', { auth: true });
      contactos = data;
      pintarContactos();
    } catch (e) {
      cont.innerHTML = `<div class="empty-state">Error: ${esc(e.message)}</div>`;
    }
  }

  function etiquetaRol(rol) {
    return rol === 'jugador' ? 'Jugador'
         : rol === 'administrador' ? 'Administrador'
         : 'Director Técnico';
  }

  function pintarContactos(filtro = '') {
    const cont = document.getElementById('chat-contactos');
    const lista = contactos.filter(c => c.nombre.toLowerCase().includes(filtro.toLowerCase()));
    if (lista.length === 0) {
      cont.innerHTML = '<div class="empty-state">No hay contactos disponibles.</div>';
      return;
    }
    cont.innerHTML = lista.map(c => `
      <div class="chat-contacto ${contactoActivo === c.id_usuario ? 'activo' : ''}"
           onclick="abrirChat(${c.id_usuario})">
        <div class="cc-fila">
          <div class="cc-nombre">${esc(c.nombre)}</div>
          ${(c.no_leidos > 0 && contactoActivo !== c.id_usuario)
            ? `<span class="cc-no-leidos">${c.no_leidos}</span>` : ''}
        </div>
        <div class="cc-meta">${esc(etiquetaRol(c.rol))}${c.equipo ? ' · ' + esc(c.equipo) : ''}</div>
      </div>`).join('');
  }

  async function abrirChat(id) {
    contactoActivo = id;
    const persona = contactos.find(c => c.id_usuario === id);
    if (persona) persona.no_leidos = 0;
    document.getElementById('chat-header').textContent = persona
      ? `${persona.nombre} · ${etiquetaRol(persona.rol)}`
      : 'Conversación';
    document.getElementById('chat-form').style.display = 'flex';

    pintarContactos(document.getElementById('chat-buscar').value);
    await cargarMensajes();
    document.getElementById('chat-cuerpo').value = '';
    document.getElementById('chat-cuerpo').focus();
  }

  async function cargarMensajes() {
    if (!contactoActivo) return;
    const cont = document.getElementById('chat-mensajes');
    try {
      const mensajes = await apiFetch(`/mensajes/chat/${contactoActivo}`, { auth: true });
      if (mensajes.length === 0) {
        cont.innerHTML = '<div class="empty-state">Todavía no hay mensajes. Escribí el primero.</div>';
        return;
      }
      const yo = Sesion.usuario().id_usuario;
      cont.innerHTML = mensajes.map(m => `
        <div class="chat-burbuja ${m.id_remitente === yo ? 'mio' : 'otro'}">
          <div class="cb-texto">${esc(m.cuerpo)}</div>
          <div class="cb-hora">${new Date(m.fecha_envio).toLocaleString('es-AR')}</div>
        </div>`).join('');
      cont.scrollTop = cont.scrollHeight;
    } catch (e) {
      cont.innerHTML = `<div class="empty-state">Error: ${esc(e.message)}</div>`;
    }
  }

  document.getElementById('chat-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('chat-cuerpo');
    const texto = input.value.trim();
    if (!texto || !contactoActivo) return;
    try {
      await apiFetch(`/mensajes/chat/${contactoActivo}`, {
        method: 'POST', auth: true, body: { cuerpo: texto },
      });
      input.value = '';
      await cargarMensajes();
    } catch (err) {
      alert(err.message);
    }
  });

  document.getElementById('chat-buscar').addEventListener('input', (e) => {
    pintarContactos(e.target.value);
  });

  window.abrirChat = abrirChat;

  async function refrescarPoll() {
    try {
      const data = await apiFetch('/mensajes/chat/contactos', { auth: true });
      contactos = data;
      pintarContactos(document.getElementById('chat-buscar').value);
    } catch (e) { /* ignore */ }
    if (contactoActivo) await cargarMensajes();
  }
  function iniciarPoll() {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(refrescarPoll, 5000);
  }
  iniciarPoll();

  // ==================== INIT ====================
  cargarResumen();
  cargarResumenNoticias();
  cargarUsuarios();
  await cargarSelectsDirectores();
  await cargarCategorias();
  cargarEquipos();
  cargarDestinatarios();
  cargarHistorial();
  cargarTodasNoticias();
  cargarAdminResultados();
  cargarAdminHorarios();
  await prellenarEquipos();
  cargarContactos();
});

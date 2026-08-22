document.addEventListener('DOMContentLoaded', async () => {
  const usuario = Sesion.requiereRol(['administrador']);
  if (!usuario) return;
  document.getElementById('quien-soy').textContent = `${usuario.nombre} · Administrador`;

  document.querySelectorAll('.tab-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active'));
      document.querySelectorAll('.tab-view').forEach(v => v.style.display = 'none');
      link.classList.add('active');
      document.getElementById(`tab-${link.dataset.tab}`).style.display = 'block';
    });
  });

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
          <div class="card"><h3>${esc(c.nombre)}</h3><p>${esc(c.descripcion || '')}</p></div>`).join('')}</div>`;
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
      document.getElementById('e-director').innerHTML =
        '<option value="">Sin asignar</option>' +
        directores.map(d => `<option value="${d.id_usuario}">${esc(d.nombre)}</option>`).join('');
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

  cargarUsuarios();
  await cargarSelectsDirectores();
  await cargarCategorias();
  cargarEquipos();
  cargarDestinatarios();
  cargarHistorial();
});

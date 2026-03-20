// ── Helpers ──
const $ = id => document.getElementById(id);

function abrirModal(id) {
  const modal = $(id);
  if(modal) modal.classList.add('active');
}

function cerrarModal(id) {
  const modal = $(id);
  if(modal) modal.classList.remove('active');
}

document.addEventListener('DOMContentLoaded', () => {
  // Obtener usuario actual del localStorage
  const usuarioStore = localStorage.getItem('usuarioMathBoost');
  if (!usuarioStore) {
    window.location.href = '/login';
    return;
  }
  
  const usuario = JSON.parse(usuarioStore);
  const maestroId = usuario._id;
  
  // Mostrar nombre del maestro si el elemento existe
  if ($('nombreUsuario')) {
    $('nombreUsuario').textContent = usuario.nombre || 'Maestro';
  }

  // Cargar clases al iniciar
  cargarClases(maestroId);

  // ── Modal Crear Clase ──
  const btnAbrirCrear = $('btnAbrirCrear');
  if (btnAbrirCrear) {
    btnAbrirCrear.addEventListener('click', () => abrirModal('modalCrear'));
  }

  const btnCerrarCrear = $('cerrarCrear');
  if (btnCerrarCrear) btnCerrarCrear.addEventListener('click', () => cerrarModal('modalCrear'));

  const btnCancelarCrear = $('cancelarCrear');
  if (btnCancelarCrear) btnCancelarCrear.addEventListener('click', () => cerrarModal('modalCrear'));

  const btnConfirmarCrear = $('confirmarCrear');
  if (btnConfirmarCrear) {
    btnConfirmarCrear.addEventListener('click', async () => {
      const nombreClase = $('crearNombre').value.trim();
      const grupoClase = $('crearGrupo') ? $('crearGrupo').value.trim() : '';

      if (!nombreClase) {
        alert('Por favor, ingresa el nombre de la clase.');
        return;
      }

      const nombreFinal = grupoClase ? `${nombreClase} - ${grupoClase}` : nombreClase;

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/teacher/classes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            nombre_clase: nombreFinal,
            maestro_id: maestroId
          })
        });

        if (!response.ok) {
          throw new Error('Error al crear la clase');
        }

        const data = await response.json();
        
        cerrarModal('modalCrear');
        $('crearNombre').value = '';
        if ($('crearGrupo')) $('crearGrupo').value = '';

        // Mostrar modal con código generado
        $('codigoGenerado').textContent = data.codigo_acceso;
        abrirModal('modalCodigo');

        // Recargar el grid de clases
        cargarClases(maestroId);

      } catch (error) {
        console.error('Error:', error);
        alert('Hubo un error al crear la clase.');
      }
    });
  }

  // ── Modal Código ──
  const btnCerrarCodigo = $('cerrarCodigo');
  if (btnCerrarCodigo) btnCerrarCodigo.addEventListener('click', () => cerrarModal('modalCodigo'));

  const btnCerrarCodigoBtn = $('cerrarCodigoBtn');
  if (btnCerrarCodigoBtn) btnCerrarCodigoBtn.addEventListener('click', () => cerrarModal('modalCodigo'));

  // ── Cerrar al click fuera ──
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('active');
    });
  });
});

async function cargarClases(maestroId) {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/teacher/classes/${maestroId}`);
    if (!response.ok) throw new Error('Error al cargar las clases');
    
    const clases = await response.json();
    const grid = $('clasesGrid');
    
    // Limpiar grid, dejando el botón de agregar
    grid.innerHTML = `
      <!-- Botón crear clase -->
      <button class="btn-add-class" id="btnAbrirCrear">
        <i class="fas fa-plus"></i> Nueva clase
      </button>
    `;

    // Reasociar el evento al botón que acabamos de recrear
    $('btnAbrirCrear').addEventListener('click', () => abrirModal('modalCrear'));

    // Inyectar las clases en el DOM
    clases.forEach(clase => {
      const numEstudiantes = clase.estudiantes ? clase.estudiantes.length : 0;
      const card = document.createElement('div');
      card.className = 'class-card';
      
      // Basic styling matching typical MathBoost or standard panels
      card.style.background = 'var(--card-bg, rgba(255, 255, 255, 0.05))';
      card.style.border = '1px solid var(--border-color, rgba(255, 255, 255, 0.1))';
      card.style.borderRadius = '15px';
      card.style.padding = '1.5rem';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.gap = '1rem';

      card.innerHTML = `
        <div class="class-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">
          <h3 style="margin: 0; font-size: 1.25rem;">${clase.nombre_clase}</h3>
          <div class="class-actions">
            <button class="btn-icon" title="Editar" style="background:none; border:none; color:#9ca3af; cursor:pointer;"><i class="fas fa-pen"></i></button>
          </div>
        </div>
        <div class="class-body" style="flex-grow: 1;">
          <p style="margin: 0.5rem 0; color: #cbd5e1;">
            <strong>Código:</strong> 
            <span class="badge" style="background: rgba(251,191,36,0.2); color: #fbbf24; padding: 0.2rem 0.6rem; border-radius: 6px; font-family: monospace; font-size: 1.1rem;">${clase.codigo_acceso}</span>
          </p>
          <p style="margin: 0.5rem 0; color: #9ca3af;"><i class="fas fa-users"></i> ${numEstudiantes} estudiantes inscritos</p>
        </div>
        <div class="class-footer" style="margin-top: auto;">
          <button class="btn-secondary btn-sm" style="width: 100%;">Ver alumnos</button>
        </div>
      `;
      grid.insertBefore(card, $('btnAbrirCrear'));
    });

  } catch (error) {
    console.error('Error al cargar las clases:', error);
  }
}

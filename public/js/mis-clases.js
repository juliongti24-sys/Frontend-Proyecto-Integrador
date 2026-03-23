// ── Helpers ──
const $ = id => document.getElementById(id);
const STUDENT_JOIN_ENDPOINT = '/api/v1/students/classes/join';

function abrirModal(id) {
  const modal = $(id);
  if(modal) modal.classList.add('active');
}

function cerrarModal(id) {
  const modal = $(id);
  if(modal) modal.classList.remove('active');
}

// ── Eventos de Modal ──
const btnUnirse = $('btnUnirse');
if(btnUnirse) btnUnirse.addEventListener('click', () => abrirModal('modalUnirse'));

const cerrarUnirse = $('cerrarUnirse');
if(cerrarUnirse) cerrarUnirse.addEventListener('click', () => cerrarModal('modalUnirse'));

const cancelarUnirse = $('cancelarUnirse');
if(cancelarUnirse) cancelarUnirse.addEventListener('click', () => cerrarModal('modalUnirse'));

// ── Lógica Unirse a Clase ──
const confirmarUnirse = $('confirmarUnirse');
if(confirmarUnirse) {
  confirmarUnirse.addEventListener('click', async () => {
    const codigo = $('codigoClase').value.trim();
    if (!codigo) {
      alert('Ingresa un código de clase válido.');
      return;
    }
    
    const usuarioStore = sessionStorage.getItem('usuarioMathBoost');
    if (!usuarioStore) {
      window.location.href = '/login';
      return;
    }
    
    const usuario = JSON.parse(usuarioStore);
    const estudianteId = usuario._id;

    const token = sessionStorage.getItem('tokenMathBoost');

    try {
      const response = await fetch(`${window.API_BASE_URL}${STUDENT_JOIN_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-User-ID': estudianteId,
          'X-User-Role': usuario.rol
        },
        body: JSON.stringify({
          codigo_acceso: codigo
        })
      });

      if (!response.ok) {
        let errorMessage = 'Error al unirse a la clase';
        try {
          const data = await response.json();
          errorMessage = data.detail || errorMessage;
        } catch (_) {}
        alert(errorMessage);
        return;
      }

      alert('¡Te has unido a la clase exitosamente!');
      cerrarModal('modalUnirse');
      $('codigoClase').value = '';
      
      // Recargar las clases del estudiante
      cargarClasesEstudiante(estudianteId);

    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error al intentar unirse a la clase.');
    }
  });
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
    const usuarioStore = sessionStorage.getItem('usuarioMathBoost');
    if (!usuarioStore) return;
    
    const usuario = JSON.parse(usuarioStore);
    if ($('nombreUsuario')) {
      $('nombreUsuario').textContent = usuario.nombre || 'Estudiante';
    }
    
    cargarClasesEstudiante(usuario._id);
});

// ── Cargar clases desde API ──
async function cargarClasesEstudiante(estudianteId) {
    const usuarioStore = sessionStorage.getItem('usuarioMathBoost');
    const usuario = JSON.parse(usuarioStore || '{}');
    const token = sessionStorage.getItem('tokenMathBoost');

    try {
        const response = await fetch(`${window.API_BASE_URL}/api/v1/classes/student/${estudianteId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-User-ID': usuario._id,
                'X-User-Role': usuario.rol
            }
        });
        if (!response.ok) throw new Error('Error al cargar las clases');
        
        const clases = await response.json();
        const grid = $('clasesGrid');
        if (!grid) return;
        
        // Limpiar grid
        grid.innerHTML = '';
        
        if (clases.length === 0) {
            grid.innerHTML = '<p style="color: #9ca3af; grid-column: 1/-1;">Aún no estás inscrito en ninguna clase.</p>';
            return;
        }
        
        clases.forEach(clase => {
            const card = document.createElement('div');
            card.className = 'class-card';
            
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
                </div>
                <div class="class-body" style="flex-grow: 1;">
                <p style="margin: 0.5rem 0; color: #9ca3af;"><i class="fas fa-chalkboard-teacher"></i> Clase activa</p>
                </div>
                <div class="class-footer" style="margin-top: auto;">
                <button class="btn-primary btn-sm" style="width: 100%;" onclick="window.location.href='/estudiante/clase/${clase._id}'">Entrar a clase</button>
                </div>
            `;
            grid.appendChild(card);
        });

    } catch (error) {
        console.error('Error al cargar las clases del estudiante:', error);
    }
}

// ── Cerrar al click fuera ──
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('active');
  });
});

// ── Helpers ──
const $ = id => document.getElementById(id)

function abrirModal(id) {
    const modal = $(id);
    if (modal) modal.classList.add('active');
}

function cerrarModal(id) {
    const modal = $(id);
    if (modal) modal.classList.remove('active');
}

// ── Cerrar al click fuera ──
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) cerrarModal(overlay.id)
    })
})

// ── Cargar Datos ──
document.addEventListener('DOMContentLoaded', () => {
    const usuarioStore = sessionStorage.getItem('usuarioMathBoost');
    if (!usuarioStore) {
        window.location.href = '/login';
        return;
    }
    const usuario = JSON.parse(usuarioStore);
    
    if ($('nombreEstudiante')) $('nombreEstudiante').textContent = usuario.nombre;

    cargarCursos();
});

async function cargarCursos() {
    const grid = $('cursosGrid');
    if (!grid) return;

    try {
        const response = await fetch(`${window.API_BASE_URL}/api/v1/courses/`);
        const cursos = await response.json();

        if (!Array.isArray(cursos)) {
            console.error('Cursos no es un array:', cursos);
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #ef4444;">Formato de datos inválido.</p>';
            return;
        }

        grid.innerHTML = cursos.map(curso => `
            <div class="course-card">
                <div class="course-badge">${curso.nivel || 'Básico'}</div>
                <h3 class="course-title">${curso.titulo}</h3>
                <p class="course-desc">${curso.descripcion ? curso.descripcion.substring(0, 80) : ''}...</p>
                <div class="course-footer">
                    <button class="btn-text" onclick="verDetalles('${curso._id}')">Ver detalles</button>
                    <button class="btn-primary btn-sm" onclick="inscribirmeACurso('${curso._id}')">Inscribirme</button>
                </div>
            </div>
        `).join('');

        if (cursos.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No hay cursos disponibles en este momento.</p>';
        }
    } catch (error) {
        console.error('Error al cargar cursos:', error);
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #ef4444;">Error al cargar el catálogo de cursos.</p>';
    }
}

// Se eliminó cargarClases de aquí para centralizarlo en mis-clases.js

async function verDetalles(cursoId) {
    const usuarioStore = sessionStorage.getItem('usuarioMathBoost');
    const usuario = usuarioStore ? JSON.parse(usuarioStore) : {};

    try {
        const response = await fetch(`${window.API_BASE_URL}/api/v1/courses/${cursoId}`, {
            headers: {
                'X-User-ID': usuario._id || '',
                'X-User-Role': usuario.rol || ''
            }
        });
        const curso = await response.json();

        $('modalDetallesTitulo').textContent = curso.titulo;
        $('modalDetallesCuerpo').innerHTML = `
            <div style="margin-bottom: 1.5rem;">
                <span class="badge" style="background: var(--primary-color); color: white; padding: 0.2rem 0.6rem; border-radius: 4px;">${curso.nivel}</span>
                <p style="margin-top: 1rem; font-size: 1.1rem; line-height: 1.6;">${curso.descripcion}</p>
            </div>
            <div style="background: var(--bg-color); padding: 1rem; border-radius: 8px;">
                <h4 style="margin-top: 0;"><i class="fas fa-list-ol"></i> Contenido del curso:</h4>
                <ul style="padding-left: 1.5rem; margin-bottom: 0;">
                    ${curso.capitulos ? curso.capitulos.map(c => `<li><strong>Semana ${c.semana}:</strong> ${c.titulo}</li>`).join('') : 'Próximamente...'}
                </ul>
            </div>
        `;

        const btnInscribirse = $('btnInscribirse');
        btnInscribirse.onclick = () => inscribirmeACurso(cursoId);
        
        abrirModal('modalDetallesCurso');
    } catch (error) {
        console.error('Error al obtener detalles:', error);
        alert('No se pudieron cargar los detalles del curso.');
    }
}

async function inscribirmeACurso(cursoId) {
    const token = sessionStorage.getItem('tokenMathBoost');
    const usuarioStore = sessionStorage.getItem('usuarioMathBoost');
    const usuario = usuarioStore ? JSON.parse(usuarioStore) : null;
    if (!token) {
        alert('Inicia sesión para inscribirte.');
        return;
    }
    if (!usuario?._id || !usuario?.rol) {
        alert('No se encontró la sesión del usuario.');
        return;
    }

    try {
        const response = await fetch(`${window.API_BASE_URL}/api/v1/courses/${cursoId}/enroll`, {
            method: 'POST',
            headers: {
                'X-User-ID': usuario._id,
                'X-User-Role': usuario.rol,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            alert('¡Inscripción exitosa! Ahora verás el curso en tu lista (funcionalidad de lista en progreso).');
            cerrarModal('modalDetallesCurso');
        } else {
            const err = await response.json();
            alert(`Error: ${err.detail || 'No se pudo inscribir.'}`);
        }
    } catch (error) {
        console.error('Error en inscripción:', error);
        alert('Ocurrió un error al procesar tu inscripción.');
    }
}

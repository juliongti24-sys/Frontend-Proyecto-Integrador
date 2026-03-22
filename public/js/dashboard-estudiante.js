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

// ── Modal Unirse ──
if ($('btnUnirse')) $('btnUnirse').addEventListener('click', () => abrirModal('modalUnirse'));
if ($('cerrarUnirse')) $('cerrarUnirse').addEventListener('click', () => cerrarModal('modalUnirse'));
if ($('cancelarUnirse')) $('cancelarUnirse').addEventListener('click', () => cerrarModal('modalUnirse'));

$('confirmarUnirse').addEventListener('click', async () => {
    const codigo = $('codigoClase').value.trim().toUpperCase()
    if (!codigo) return
    
    try {
        const response = await fetch(`${window.API_BASE_URL}/api/v1/classes/join`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('tokenMathBoost')}`
            },
            body: JSON.stringify({ access_code: codigo })
        });
        
        const data = await response.json();
        if (response.ok) {
            alert('¡Te has unido a la clase exitosamente!');
            cerrarModal('modalUnirse');
            $('codigoClase').value = '';
            cargarClases(); // Recargar la lista de clases
        } else {
            alert(data.detail || 'Error al unirse a la clase');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('No se pudo conectar con el servidor.');
    }
})

// ── Cargar Datos ──
document.addEventListener('DOMContentLoaded', () => {
    cargarCursos();
    cargarClases();
});

async function cargarCursos() {
    const grid = $('cursosGrid');
    if (!grid) return;

    try {
        const response = await fetch(`${window.API_BASE_URL}/api/v1/courses`);
        const cursos = await response.json();

        grid.innerHTML = cursos.map(curso => `
            <div class="course-card" style="background: var(--surface-color); border-radius: 12px; overflow: hidden; border: 1px solid var(--border-color); transition: transform 0.3s ease; cursor: pointer;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
                <div style="height: 120px; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem;">
                    <i class="fas fa-book-bookmark"></i>
                </div>
                <div style="padding: 1.2rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--primary-color); background: rgba(251,191,36,0.1); padding: 0.2rem 0.6rem; border-radius: 20px;">${curso.nivel}</span>
                        <span style="color: var(--text-muted); font-size: 0.8rem;"><i class="fas fa-clock"></i> 4 Semanas</span>
                    </div>
                    <h3 style="font-size: 1.1rem; margin-bottom: 0.8rem; height: 2.8rem; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${curso.titulo}</h3>
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.2rem; height: 3rem; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">${curso.descripcion}</p>
                    <button class="btn-primary" style="width: 100%; font-size: 0.9rem; padding: 0.6rem;">Ver detalles</button>
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

async function cargarClases() {
    const grid = $('clasesGrid');
    if (!grid) return;

    const usuarioStore = sessionStorage.getItem('usuarioMathBoost');
    if (!usuarioStore) return;
    const usuario = JSON.parse(usuarioStore);

    try {
        const response = await fetch(`${window.API_BASE_URL}/api/v1/classes/student/${usuario._id}`);
        const clases = await response.json();

        grid.innerHTML = clases.map(clase => `
            <div class="class-card" onclick="window.location.href='/estudiante/clase?id=${clase._id}'" style="cursor:pointer;">
                <div class="class-header">
                    <div class="class-icon"><i class="fas fa-chalkboard-user"></i></div>
                    <div class="class-status">Activa</div>
                </div>
                <h3 class="class-name">${clase.name}</h3>
                <p class="class-teacher">Prof. ${clase.teacher_name || 'Sin asignar'}</p>
                <div class="class-info">
                    <span><i class="fas fa-users"></i> ${clase.students ? clase.students.length : 0} alumnos</span>
                    <span><i class="fas fa-key"></i> ${clase.access_code}</span>
                </div>
            </div>
        `).join('');

        if (clases.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: var(--surface-color); border-radius: 12px; border: 2px dashed var(--border-color);">
                    <i class="fas fa-folder-open" style="font-size: 3rem; color: var(--border-color); margin-bottom: 1rem;"></i>
                    <p style="color: var(--text-muted); font-size: 1.1rem;">Aún no estás inscrito en ninguna clase.</p>
                    <button class="btn-primary" onclick="abrirModal('modalUnirse')" style="margin-top: 1rem;">
                        <i class="fas fa-plus"></i> Unirse a mi primera clase
                    </button>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error al cargar clases:', error);
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #ef4444;">Error al cargar tus clases.</p>';
    }
}

// ── Cerrar al click fuera ──
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
        if (e.target === overlay) overlay.classList.remove('active')
    })
})

// ── Logout ──
const logoutBtn = document.getElementById('btnCerrarSesion');
if (logoutBtn) {
    logoutBtn.addEventListener('click', e => {
        e.preventDefault()
        sessionStorage.removeItem('usuarioMathBoost');
        window.location.href = '/login'
    })
}
document.addEventListener('DOMContentLoaded', () => {
    // ── Elementos del DOM ──
    const tabMaestros = document.getElementById('tabMaestros');
    const tabAlumnos = document.getElementById('tabAlumnos');
    const subtituloGestion = document.getElementById('subtituloGestion');
    const textoBotonCrear = document.getElementById('textoBotonCrear');
    const colIdentificador = document.getElementById('colIdentificador');
    const tablaUsuarios = document.getElementById('tablaUsuarios');

    // Modales
    const modalCrear = document.getElementById('modalCrear');
    const modalEditar = document.getElementById('modalEditar');
    const modalEliminar = document.getElementById('modalEliminar');
    
    // Títulos y Labels Modales
    const modalCrearTitulo = document.getElementById('modalCrearTitulo');
    const labelIdentificadorCrear = document.getElementById('labelIdentificadorCrear');
    const textoConfirmarCrear = document.getElementById('textoConfirmarCrear');
    const modalEditarTitulo = document.getElementById('modalEditarTitulo');
    const labelIdentificadorEditar = document.getElementById('labelIdentificadorEditar');
    const modalEliminarTitulo = document.getElementById('modalEliminarTitulo');
    const eliminarNombre = document.getElementById('eliminarNombre');

    // Botones Globales
    const btnAbrirCrear = document.getElementById('btnAbrirCrear');
    const btnConfirmarCrear = document.getElementById('confirmarCrear');
    const btnConfirmarEditar = document.getElementById('confirmarEditar');
    const btnConfirmarEliminar = document.getElementById('confirmarEliminar');

    // Variables de Estado
    let activeTab = 'maestros'; // 'maestros' o 'alumnos'
    let editingUserId = null;
    let deletingUserId = null;

    // ════════════════════════════════════════════════════════════════
    //  Lógica de Pestañas
    // ════════════════════════════════════════════════════════════════
    const switchTab = (tab) => {
        activeTab = tab;
        
        // Actualizar UI activa
        if (tab === 'maestros') {
            tabMaestros.classList.add('active');
            tabAlumnos.classList.remove('active');
            subtituloGestion.textContent = "Gestiona los maestros registrados en MathBoost";
            textoBotonCrear.textContent = "Nuevo maestro";
            colIdentificador.textContent = "Expediente";
            // Modales
            modalCrearTitulo.innerHTML = '<i class="fas fa-user-plus"></i> Nuevo maestro';
            labelIdentificadorCrear.textContent = "Expediente";
            textoConfirmarCrear.textContent = "Crear maestro";
            modalEditarTitulo.innerHTML = '<i class="fas fa-pen"></i> Editar maestro';
            labelIdentificadorEditar.textContent = "Expediente";
            modalEliminarTitulo.innerHTML = '<i class="fas fa-trash"></i> Eliminar maestro';
        } else {
            tabAlumnos.classList.add('active');
            tabMaestros.classList.remove('active');
            subtituloGestion.textContent = "Gestiona los alumnos registrados en MathBoost";
            textoBotonCrear.textContent = "Nuevo alumno";
            colIdentificador.textContent = "Matrícula";
            // Modales
            modalCrearTitulo.innerHTML = '<i class="fas fa-user-plus"></i> Nuevo alumno';
            labelIdentificadorCrear.textContent = "Matrícula";
            textoConfirmarCrear.textContent = "Crear alumno";
            modalEditarTitulo.innerHTML = '<i class="fas fa-pen"></i> Editar alumno';
            labelIdentificadorEditar.textContent = "Matrícula";
            modalEliminarTitulo.innerHTML = '<i class="fas fa-trash"></i> Eliminar alumno';
        }

        cargarUsuarios();
    };

    tabMaestros.addEventListener('click', () => switchTab('maestros'));
    tabAlumnos.addEventListener('click', () => switchTab('alumnos'));

    // ════════════════════════════════════════════════════════════════
    //  Cargar Usuarios
    // ════════════════════════════════════════════════════════════════
    const cargarUsuarios = async () => {
        try {
            tablaUsuarios.innerHTML = `<tr><td colspan="7" style="text-align:center;">Cargando ${activeTab}... <i class="fas fa-spinner fa-spin"></i></td></tr>`;

            const endpoint = activeTab === 'maestros' ? '/api/v1/admin/teachers' : '/api/v1/admin/students';
            const response = await fetch(`${window.API_BASE_URL}${endpoint}`);
            const data = await response.json();

            tablaUsuarios.innerHTML = '';

            if (data.length === 0) {
                tablaUsuarios.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#9ca3af;">No hay ${activeTab} registrados aún.</td></tr>`;
                return;
            }

            data.forEach(user => {
                const tr = document.createElement('tr');
                const identificador = activeTab === 'maestros' ? (user.num_empleado || 'N/A') : (user.matricula || 'N/A');
                
                // Avatar logic
                let avatarHtml = '';
                if (user.foto_perfil) {
                    const cleanPath = user.foto_perfil.replace(/^\//, '');
                    avatarHtml = `<img src="${window.API_BASE_URL}/${cleanPath}" class="table-avatar" alt="Avatar">`;
                } else {
                    const inicial = user.nombre ? user.nombre.charAt(0).toUpperCase() : '?';
                    avatarHtml = `<div class="table-avatar-placeholder">${inicial}</div>`;
                }

                tr.innerHTML = `
                    <td class="td-avatar">${avatarHtml}</td>
                    <td>${user.nombre}</td>
                    <td>${user.correo}</td>
                    <td>${identificador}</td>
                    <td>${user.telefono || 'N/A'}</td>
                    <td><span class="badge badge-active">Activo</span></td>
                    <td>
                        <button class="btn-icon edit" data-id="${user._id}" title="Editar"><i class="fas fa-pencil"></i></button>
                        <button class="btn-icon delete" data-id="${user._id}" title="Eliminar"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                tablaUsuarios.appendChild(tr);
            });

        } catch (error) {
            console.error(`Error al cargar ${activeTab}:`, error);
            tablaUsuarios.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#ef4444;">Error al cargar los datos.</td></tr>`;
        }
    };

    // ════════════════════════════════════════════════════════════════
    //  Modales - General
    // ════════════════════════════════════════════════════════════════
    const closeAllModals = () => {
        modalCrear.classList.remove('active');
        modalEditar.classList.remove('active');
        modalEliminar.classList.remove('active');
        editingUserId = null;
        deletingUserId = null;
    };

    document.querySelectorAll('.modal-close, .btn-secondary').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    btnAbrirCrear.addEventListener('click', () => {
        modalCrear.classList.add('active');
        document.getElementById('crearNombre').value = '';
        document.getElementById('crearCorreo').value = '';
        document.getElementById('crearIdentificador').value = '';
        document.getElementById('crearTelefono').value = '';
        document.getElementById('crearPassword').value = '';
    });

    // ════════════════════════════════════════════════════════════════
    //  CREAR
    // ════════════════════════════════════════════════════════════════
    btnConfirmarCrear.addEventListener('click', async () => {
        const payload = {
            nombre: document.getElementById('crearNombre').value.trim(),
            correo: document.getElementById('crearCorreo').value.trim(),
            telefono: document.getElementById('crearTelefono').value.trim(),
            password: document.getElementById('crearPassword').value.trim()
        };

        const identificador = document.getElementById('crearIdentificador').value.trim();
        if (activeTab === 'maestros') {
            payload.num_empleado = identificador;
        } else {
            payload.matricula = identificador;
        }

        if (!payload.nombre || !payload.correo || !identificador || !payload.password) {
            alert("Por favor, completa los campos obligatorios.");
            return;
        }

        try {
            btnConfirmarCrear.disabled = true;
            btnConfirmarCrear.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

            const endpoint = activeTab === 'maestros' ? '/api/v1/admin/register/teacher' : '/api/v1/admin/students';
            const response = await fetch(`${window.API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                alert(`¡${activeTab === 'maestros' ? 'Maestro' : 'Alumno'} registrado exitosamente!`);
                cargarUsuarios();
                closeAllModals();
            } else {
                alert(data.detail || "Error al registrar.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("No se pudo conectar con el servidor.");
        } finally {
            btnConfirmarCrear.disabled = false;
            btnConfirmarCrear.innerHTML = `<i class="fas fa-check"></i> ${activeTab === 'maestros' ? 'Crear maestro' : 'Crear alumno'}`;
        }
    });

    // ════════════════════════════════════════════════════════════════
    //  Delegación de Eventos (Editar/Eliminar)
    // ════════════════════════════════════════════════════════════════
    tablaUsuarios.addEventListener('click', (e) => {
        const btnEdit = e.target.closest('.edit');
        const btnDelete = e.target.closest('.delete');

        if (btnEdit) {
            const userId = btnEdit.getAttribute('data-id');
            const fila = btnEdit.closest('tr');
            const celdas = fila.querySelectorAll('td');

            document.getElementById('editNombre').value = celdas[1].textContent.trim();
            document.getElementById('editCorreo').value = celdas[2].textContent.trim();
            document.getElementById('editIdentificador').value = celdas[3].textContent.trim();
            document.getElementById('editTelefono').value = celdas[4].textContent.trim();

            editingUserId = userId;
            modalEditar.classList.add('active');
        }

        if (btnDelete) {
            const userId = btnDelete.getAttribute('data-id');
            const fila = btnDelete.closest('tr');
            const nombre = fila.querySelectorAll('td')[1].textContent.trim();

            eliminarNombre.textContent = nombre;
            deletingUserId = userId;
            modalEliminar.classList.add('active');
        }
    });

    // ════════════════════════════════════════════════════════════════
    //  EDITAR
    // ════════════════════════════════════════════════════════════════
    btnConfirmarEditar.addEventListener('click', async () => {
        if (!editingUserId) return;

        const payload = {
            nombre: document.getElementById('editNombre').value.trim(),
            correo: document.getElementById('editCorreo').value.trim(),
            telefono: document.getElementById('editTelefono').value.trim()
        };

        const identificador = document.getElementById('editIdentificador').value.trim();
        if (activeTab === 'maestros') {
            payload.num_empleado = identificador;
        } else {
            payload.matricula = identificador;
        }

        try {
            btnConfirmarEditar.disabled = true;
            btnConfirmarEditar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

            const endpoint = activeTab === 'maestros' ? `/api/v1/admin/teachers/${editingUserId}` : `/api/v1/admin/students/${editingUserId}`;
            const response = await fetch(`${window.API_BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert("Actualizado exitosamente.");
                closeAllModals();
                cargarUsuarios();
            } else {
                const data = await response.json();
                alert(data.detail || "Error al actualizar.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("No se pudo conectar con el servidor.");
        } finally {
            btnConfirmarEditar.disabled = false;
            btnConfirmarEditar.innerHTML = '<i class="fas fa-check"></i> Guardar cambios';
        }
    });

    // ════════════════════════════════════════════════════════════════
    //  ELIMINAR
    // ════════════════════════════════════════════════════════════════
    btnConfirmarEliminar.addEventListener('click', async () => {
        if (!deletingUserId) return;

        try {
            btnConfirmarEliminar.disabled = true;
            btnConfirmarEliminar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Eliminando...';

            const endpoint = activeTab === 'maestros' ? `/api/v1/admin/teachers/${deletingUserId}` : `/api/v1/admin/students/${deletingUserId}`;
            const response = await fetch(`${window.API_BASE_URL}${endpoint}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert("Eliminado exitosamente.");
                closeAllModals();
                cargarUsuarios();
            } else {
                const data = await response.json();
                alert(data.detail || "Error al eliminar.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("No se pudo conectar con el servidor.");
        } finally {
            btnConfirmarEliminar.disabled = false;
            btnConfirmarEliminar.innerHTML = '<i class="fas fa-trash"></i> Eliminar';
        }
    });

    // Carga inicial
    cargarUsuarios();
});
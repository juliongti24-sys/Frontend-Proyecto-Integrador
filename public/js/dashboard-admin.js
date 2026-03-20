document.addEventListener('DOMContentLoaded', () => {
    // ── Elementos del DOM ──
    // Modal Crear
    const btnAbrirCrear = document.getElementById('btnAbrirCrear');
    const modalCrear = document.getElementById('modalCrear');
    const btnCerrarCrear = document.getElementById('cerrarCrear');
    const btnCancelarCrear = document.getElementById('cancelarCrear');
    const btnConfirmarCrear = document.getElementById('confirmarCrear');

    // Modal Editar
    const modalEditar = document.getElementById('modalEditar');
    const btnCerrarEditar = document.getElementById('cerrarEditar');
    const btnCancelarEditar = document.getElementById('cancelarEditar');
    const btnConfirmarEditar = document.getElementById('confirmarEditar');

    // Modal Eliminar
    const modalEliminar = document.getElementById('modalEliminar');
    const btnCerrarEliminar = document.getElementById('cerrarEliminar');
    const btnCancelarEliminar = document.getElementById('cancelarEliminar');
    const btnConfirmarEliminar = document.getElementById('confirmarEliminar');

    const tablaMaestros = document.getElementById('tablaMaestros');

    // Variable global para saber a quién estamos editando/eliminando
    let editingTeacherId = null;
    let deletingTeacherId = null;

    // ════════════════════════════════════════════════════════════════
    //  Cargar maestros
    // ════════════════════════════════════════════════════════════════
    const cargarMaestros = async () => {
        try {
            tablaMaestros.innerHTML = '<tr><td colspan="6" style="text-align:center;">Cargando maestros... <i class="fas fa-spinner fa-spin"></i></td></tr>';

            const response = await fetch('http://localhost:8000/api/v1/admin/teachers');
            const maestros = await response.json();

            tablaMaestros.innerHTML = '';

            if (maestros.length === 0) {
                tablaMaestros.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#9ca3af;">No hay maestros registrados aún.</td></tr>';
                return;
            }

            maestros.forEach(maestro => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${maestro.nombre}</td>
                    <td>${maestro.correo}</td>
                    <td>${maestro.num_empleado}</td>
                    <td>${maestro.telefono}</td>
                    <td><span class="status-badge active">Activo</span></td>
                    <td>
                        <button class="btn-icon edit" data-id="${maestro._id}" title="Editar"><i class="fas fa-pencil"></i></button>
                        <button class="btn-icon delete" data-id="${maestro._id}" title="Eliminar"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                tablaMaestros.appendChild(tr);
            });

        } catch (error) {
            console.error("Error al cargar maestros:", error);
            tablaMaestros.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#ef4444;">Error al cargar los datos.</td></tr>';
        }
    };

    cargarMaestros();

    // ════════════════════════════════════════════════════════════════
    //  Modal Crear Maestro
    // ════════════════════════════════════════════════════════════════
    const abrirModal = () => modalCrear.classList.add('active');
    const cerrarModal = () => {
        modalCrear.classList.remove('active');
        document.getElementById('crearNombre').value = '';
        document.getElementById('crearCorreo').value = '';
        document.getElementById('crearExpediente').value = '';
        document.getElementById('crearTelefono').value = '';
        document.getElementById('crearPassword').value = '';
    };

    btnAbrirCrear.addEventListener('click', abrirModal);
    btnCerrarCrear.addEventListener('click', cerrarModal);
    btnCancelarCrear.addEventListener('click', cerrarModal);

    btnConfirmarCrear.addEventListener('click', async () => {
        const nombre = document.getElementById('crearNombre').value.trim();
        const correo = document.getElementById('crearCorreo').value.trim();
        const expediente = document.getElementById('crearExpediente').value.trim();
        const telefono = document.getElementById('crearTelefono').value.trim();
        const password = document.getElementById('crearPassword').value.trim();

        if (!nombre || !correo || !expediente || !telefono || !password) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        try {
            btnConfirmarCrear.disabled = true;
            btnConfirmarCrear.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

            const response = await fetch('http://localhost:8000/api/v1/admin/register/teacher', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: nombre,
                    correo: correo,
                    num_empleado: expediente,
                    telefono: telefono,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert("¡Maestro registrado exitosamente!");
                cargarMaestros();
                cerrarModal();
            } else {
                alert(data.detail || "Error al registrar al maestro.");
            }

        } catch (error) {
            console.error("Error:", error);
            alert("No se pudo conectar con el servidor.");
        } finally {
            btnConfirmarCrear.disabled = false;
            btnConfirmarCrear.innerHTML = '<i class="fas fa-check"></i> Crear maestro';
        }
    });

    // ════════════════════════════════════════════════════════════════
    //  Delegación de eventos – Botones Editar y Eliminar
    // ════════════════════════════════════════════════════════════════
    tablaMaestros.addEventListener('click', (e) => {
        // Determinar qué botón se pulsó (puede ser el <i> interno)
        const btnEdit = e.target.closest('.edit');
        const btnDelete = e.target.closest('.delete');

        if (btnEdit) {
            const teacherId = btnEdit.getAttribute('data-id');
            const fila = btnEdit.closest('tr');
            const celdas = fila.querySelectorAll('td');

            // Pre-llenar los inputs del modal con los datos actuales de la fila
            document.getElementById('editNombre').value = celdas[0].textContent.trim();
            document.getElementById('editCorreo').value = celdas[1].textContent.trim();
            document.getElementById('editExpediente').value = celdas[2].textContent.trim();
            document.getElementById('editTelefono').value = celdas[3].textContent.trim();

            // Guardar el ID del maestro que se está editando
            editingTeacherId = teacherId;

            // Abrir el modal de edición
            modalEditar.classList.add('active');
        }

        if (btnDelete) {
            const teacherId = btnDelete.getAttribute('data-id');
            const fila = btnDelete.closest('tr');
            const nombre = fila.querySelectorAll('td')[0].textContent.trim();

            // Mostrar el nombre en el modal de confirmación
            document.getElementById('eliminarNombre').textContent = nombre;

            // Guardar el ID del maestro que se va a eliminar
            deletingTeacherId = teacherId;

            // Abrir el modal de eliminación
            modalEliminar.classList.add('active');
        }
    });

    // ════════════════════════════════════════════════════════════════
    //  Modal Editar – Confirmar / Cerrar
    // ════════════════════════════════════════════════════════════════
    const cerrarModalEditar = () => {
        modalEditar.classList.remove('active');
        editingTeacherId = null;
        document.getElementById('editNombre').value = '';
        document.getElementById('editCorreo').value = '';
        document.getElementById('editExpediente').value = '';
        document.getElementById('editTelefono').value = '';
    };

    btnCerrarEditar.addEventListener('click', cerrarModalEditar);
    btnCancelarEditar.addEventListener('click', cerrarModalEditar);

    btnConfirmarEditar.addEventListener('click', async () => {
        if (!editingTeacherId) return;

        const nombre = document.getElementById('editNombre').value.trim();
        const correo = document.getElementById('editCorreo').value.trim();
        const num_empleado = document.getElementById('editExpediente').value.trim();
        const telefono = document.getElementById('editTelefono').value.trim();

        if (!nombre || !correo || !num_empleado || !telefono) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        try {
            btnConfirmarEditar.disabled = true;
            btnConfirmarEditar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

            const response = await fetch(`http://localhost:8000/api/v1/admin/teachers/${editingTeacherId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, correo, num_empleado, telefono })
            });

            const data = await response.json();

            if (response.ok) {
                alert("¡Maestro actualizado exitosamente!");
                cerrarModalEditar();
                cargarMaestros();
            } else {
                alert(data.detail || "Error al actualizar el maestro.");
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
    //  Modal Eliminar – Confirmar / Cerrar
    // ════════════════════════════════════════════════════════════════
    const cerrarModalEliminar = () => {
        modalEliminar.classList.remove('active');
        deletingTeacherId = null;
        document.getElementById('eliminarNombre').textContent = '';
    };

    btnCerrarEliminar.addEventListener('click', cerrarModalEliminar);
    btnCancelarEliminar.addEventListener('click', cerrarModalEliminar);

    btnConfirmarEliminar.addEventListener('click', async () => {
        if (!deletingTeacherId) return;

        try {
            btnConfirmarEliminar.disabled = true;
            btnConfirmarEliminar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Eliminando...';

            const response = await fetch(`http://localhost:8000/api/v1/admin/teachers/${deletingTeacherId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                alert("Maestro eliminado exitosamente.");
                cerrarModalEliminar();
                cargarMaestros();
            } else {
                alert(data.detail || "Error al eliminar el maestro.");
            }

        } catch (error) {
            console.error("Error:", error);
            alert("No se pudo conectar con el servidor.");
        } finally {
            btnConfirmarEliminar.disabled = false;
            btnConfirmarEliminar.innerHTML = '<i class="fas fa-trash"></i> Eliminar';
        }
    });
});
const campos = ['perfNombre', 'perfCorreo', 'perfMatricula', 'perfTelefono', 'perfPassword'];
const btnEditar = document.getElementById('btnEditar');
const btnCancelar = document.getElementById('btnCancelar');
const btnGuardar = document.getElementById('btnGuardar');
const btnCambiarFoto = document.getElementById('btnCambiarFoto');
const inputFoto = document.getElementById('inputFoto');
const avatarImage = document.getElementById('avatarImage');
const avatarText = document.getElementById('avatarText');
let currentUserData = null;

document.addEventListener('DOMContentLoaded', async () => {
    const usuarioStore = sessionStorage.getItem('usuarioMathBoost');
    if (!usuarioStore) {
        window.location.href = '/login';
        return;
    }
    const usuario = JSON.parse(usuarioStore);
    
    try {
        const response = await fetch(`${window.API_BASE_URL}/api/v1/users/${usuario._id}`);
        if (response.ok) {
            currentUserData = await response.json();
            fillForm(currentUserData);
        } else {
            console.error('Error fetching user profile');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

function fillForm(data) {
    document.getElementById('perfNombre').value = data.nombre || '';
    document.getElementById('perfCorreo').value = data.correo || '';
    document.getElementById('perfMatricula').value = data.matricula || '';
    document.getElementById('perfTelefono').value = data.telefono || '';
    document.getElementById('displayNombre').textContent = data.nombre || '–';

    // Manejar la foto de perfil
    if (data.foto_perfil) {
        const cleanPath = data.foto_perfil.replace(/^\//, '');
        const fullImageUrl = `${window.API_BASE_URL}/${cleanPath}`;
        avatarImage.src = fullImageUrl;
        avatarImage.style.display = 'block';
        avatarText.style.display = 'none';
        
        // Actualizar avatar sidebar si existe
        const sidebarAvatar = document.querySelector('.sidebar .user-info .user-avatar');
        if (sidebarAvatar) {
            sidebarAvatar.innerHTML = `<img src="${fullImageUrl}" alt="${data.nombre}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
            sidebarAvatar.style.background = 'none';
        }
    } else {
        avatarText.textContent = data.nombre ? data.nombre.charAt(0).toUpperCase() : 'E';
        avatarImage.style.display = 'none';
        avatarText.style.display = 'block';
    }
}

btnEditar.addEventListener('click', () => {
    campos.forEach(id => document.getElementById(id).disabled = false);
    document.getElementById('perfMatricula').disabled = true; // Matricula no se edita generalmente
    btnEditar.style.display = 'none';
    btnCancelar.style.display = 'inline-flex';
    btnGuardar.style.display = 'inline-flex';
    btnCambiarFoto.style.display = 'flex';
});

btnCancelar.addEventListener('click', () => {
    fillForm(currentUserData); // Restaurar valores originales
    campos.forEach(id => document.getElementById(id).disabled = true);
    document.getElementById('perfPassword').value = '';
    inputFoto.value = '';
    btnEditar.style.display = 'inline-flex';
    btnCancelar.style.display = 'none';
    btnGuardar.style.display = 'none';
    btnCambiarFoto.style.display = 'none';
});

btnCambiarFoto.addEventListener('click', () => {
    inputFoto.click();
});

inputFoto.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            avatarImage.src = e.target.result;
            avatarImage.style.display = 'block';
            avatarText.style.display = 'none';
        }
        reader.readAsDataURL(e.target.files[0]);
    }
});

btnGuardar.addEventListener('click', async () => {
    const usuarioStore = sessionStorage.getItem('usuarioMathBoost');
    if (!usuarioStore) return;
    const usuario = JSON.parse(usuarioStore);

    const formData = new FormData();
    formData.append('nombre', document.getElementById('perfNombre').value);
    formData.append('correo', document.getElementById('perfCorreo').value);
    formData.append('telefono', document.getElementById('perfTelefono').value);
    
    const password = document.getElementById('perfPassword').value;
    if (password) {
        formData.append('password', password);
    }
    
    if (inputFoto.files && inputFoto.files[0]) {
        formData.append('foto_perfil', inputFoto.files[0]);
    }

    try {
        const response = await fetch(`${window.API_BASE_URL}/api/v1/users/${usuario._id}`, {
            method: 'PUT',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Error al actualizar el perfil');
        }

        const updatedData = await response.json();
        currentUserData = updatedData;
        fillForm(updatedData);
        
        // Actualizar sessionStorage
        sessionStorage.setItem('usuarioMathBoost', JSON.stringify({
            ...usuario,
            ...updatedData
        }));
        actualizarAvataresEnPantalla(updatedData.foto_perfil, updatedData.nombre);

        // Restaurar estado de botones e inputs
        campos.forEach(id => document.getElementById(id).disabled = true);
        document.getElementById('perfPassword').value = '';
        inputFoto.value = '';
        btnEditar.style.display = 'inline-flex';
        btnCancelar.style.display = 'none';
        btnGuardar.style.display = 'none';
        btnCambiarFoto.style.display = 'none';
        
        alert('Perfil actualizado exitosamente');

    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un error al actualizar el perfil.');
    }
});

// Inicializar escondiendo el boton de foto
btnCambiarFoto.style.display = 'none';

function actualizarAvataresEnPantalla(fotoUrl, nombre) {
    const inicial = nombre ? nombre.charAt(0).toUpperCase() : 'E';
    let fullUrl = null;

    // Construir la URL completa apuntando al backend
    if (fotoUrl) {
        // Asegurarnos de que no haya dobles diagonales
        const cleanPath = fotoUrl.replace(/^\//, ''); 
        fullUrl = fotoUrl.startsWith('http') ? fotoUrl : `${window.API_BASE_URL}/${cleanPath}`;
        console.log("URL de la foto a cargar:", fullUrl); // <-- ESTO NOS AYUDARÁ A DEBUGEAR
    }

    // 1. Actualizar TODAS las bolitas pequeñas (Header y Sidebar)
    const avatares = document.querySelectorAll('.user-avatar');
    avatares.forEach(avatar => {
        if (fullUrl) {
            avatar.innerHTML = `<img src="${fullUrl}" alt="Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
            avatar.style.padding = '0'; 
        } else {
            avatar.innerHTML = inicial;
        }
    });

    // 2. Actualizar el avatar GRANDE central de la vista de perfil
    const imgElement = document.getElementById('avatarImage');
    const txtElement = document.getElementById('avatarText');

    if (imgElement && txtElement) {
        if (fullUrl) {
            imgElement.src = fullUrl;
            imgElement.style.display = 'block'; // Mostrar la etiqueta <img>
            txtElement.style.display = 'none';  // Ocultar el texto "E"
        } else {
            imgElement.style.display = 'none';
            txtElement.style.display = 'block';
            txtElement.textContent = inicial;
        }
    }
}
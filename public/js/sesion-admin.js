document.addEventListener('DOMContentLoaded', () => {
    const usuarioGuardado = sessionStorage.getItem('usuarioMathBoost');
    
    if (!usuarioGuardado) {
        window.location.href = '/login';
        return; 
    }

    const usuario = JSON.parse(usuarioGuardado);

    //  Si no es admin, lo enviamos a la pantalla correspondiente
    if (usuario.rol !== 'admin') {
        alert("Acceso denegado. Área exclusiva de administración.");
        window.location.href = `/${usuario.rol}/dashboard`; 
        return;
    }

    // Personalizar la interfaz 
    const spanNombre = document.getElementById('nombreUsuario');
    const divAvatar = document.querySelector('.user-avatar');

    if (spanNombre && divAvatar) {
        spanNombre.textContent = usuario.nombre;
        
        if (usuario.foto_perfil) {
            const cleanPath = usuario.foto_perfil.replace(/^\//, '');
            divAvatar.innerHTML = `<img src="${window.API_BASE_URL}/${cleanPath}" alt="${usuario.nombre}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
            divAvatar.style.background = 'none';
        } else {
            divAvatar.textContent = usuario.nombre.charAt(0).toUpperCase();
            divAvatar.style.background = '';
        }
    }

    // Lógica para cerrar sesión
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('usuarioMathBoost');
            window.location.href = '/login';
        });
    }
});
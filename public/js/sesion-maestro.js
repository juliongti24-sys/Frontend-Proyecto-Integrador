document.addEventListener('DOMContentLoaded', () => {    
    const usuarioGuardado = localStorage.getItem('usuarioMathBoost');
    
    if (!usuarioGuardado) {
        window.location.href = '/login';
        return; 
    }

    const usuario = JSON.parse(usuarioGuardado);

    // Si no es maestro, lo expulsamos
    if (usuario.rol !== 'maestro') {
        alert("Acceso denegado. No tienes permisos de maestro.");
        // Lo mandamos a su panel correspondiente
        window.location.href = `/${usuario.rol}/dashboard`; 
        return;
    }

    // Personalizar la interfaz 
    const spanNombre = document.getElementById('nombreUsuario');
    const divAvatar = document.querySelector('.user-avatar');

    if (spanNombre && divAvatar) {
        spanNombre.textContent = usuario.nombre;
        
        if (usuario.foto_perfil) {
            divAvatar.innerHTML = `<img src="http://127.0.0.1:8000${usuario.foto_perfil}" alt="${usuario.nombre}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
            divAvatar.style.background = 'none';
        } else {
            divAvatar.textContent = usuario.nombre.charAt(0).toUpperCase();
            divAvatar.style.background = '';
        }
    }

    // Lógica de cerrar sesión
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('usuarioMathBoost');
            window.location.href = '/login';
        });
    }
});
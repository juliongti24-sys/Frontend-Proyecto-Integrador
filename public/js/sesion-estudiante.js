document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Proteger rutas
    const usuarioGuardado = sessionStorage.getItem('usuarioMathBoost');
    
    if (!usuarioGuardado) {
        // Si alguien intenta entrar a la fuerza sin login
        window.location.href = '/login';
        return; 
    }

    // 2. LEER LOS DATOS DEL ESTUDIANTE
    const usuario = JSON.parse(usuarioGuardado);

    // 3. PERSONALIZAR LA INTERFAZ 
    // Buscamos los elementos del header
    const spanNombre = document.getElementById('nombreUsuario');
    const divAvatar = document.querySelector('.user-avatar');

    if (spanNombre && divAvatar) {
        // Ponemos su nombre real (Ej: "Juan Pérez")
        spanNombre.textContent = usuario.nombre;
        
        if (usuario.foto_perfil) {
            divAvatar.innerHTML = `<img src="http://127.0.0.1:8000${usuario.foto_perfil}" alt="${usuario.nombre}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
            divAvatar.style.background = 'none';
        } else {
            // Ponemos la primera letra de su nombre en el circulito del avatar
            divAvatar.textContent = usuario.nombre.charAt(0).toUpperCase();
            divAvatar.style.background = ''; // Restaurar el fondo css por defecto si no hay foto
        }
    }

    // 4. LÓGICA DE CERRAR SESIÓN 
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', (e) => {
            e.preventDefault();
            // Borramos los datos del navegador
            sessionStorage.removeItem('usuarioMathBoost');
            // Lo regresamos al login
            window.location.href = '/login';
        });
    }
});
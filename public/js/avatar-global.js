/**
 * avatar-global.js
 * Inyecta automáticamente el nombre y foto de perfil en los elementos
 * con las clases .user-avatar y .user-name.
 */
document.addEventListener('DOMContentLoaded', () => {
    const usuarioStore = sessionStorage.getItem('usuarioMathBoost');
    if (!usuarioStore) return;

    try {
        const userData = JSON.parse(usuarioStore);
        const backendUrl = (window.API_BASE_URL || '').replace(/\/+$/, '');
        const fotoPerfil = userData.foto_perfil || '';

        const buildPhotoUrl = (path) => {
            if (!path) return '';
            if (/^https?:\/\//i.test(path)) return path;
            const cleanPath = String(path).replace(/^\/+/, '');
            return backendUrl ? `${backendUrl}/${cleanPath}` : `/${cleanPath}`;
        };

        // 1. Actualizar nombres
        const nameElements = document.querySelectorAll('.user-name');
        nameElements.forEach(el => {
            el.textContent = userData.nombre || 'Estudiante';
        });

        // 2. Actualizar avatares
        const avatarContainers = document.querySelectorAll('.user-avatar');
        avatarContainers.forEach(container => {
            if (fotoPerfil) {
                // Si hay foto, inyectar <img>
                const imgUrl = buildPhotoUrl(fotoPerfil);
                
                container.innerHTML = `<img src="${imgUrl}" alt="Avatar" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
            } else {
                // Si no hay foto, poner inicial
                const inicial = (userData.nombre || 'E').charAt(0).toUpperCase();
                container.textContent = inicial;
            }
        });

    } catch (e) {
        console.error("Error al inyectar avatar global:", e);
    }
});

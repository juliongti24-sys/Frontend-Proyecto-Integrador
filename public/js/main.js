// ── Lógica general de MathBoost ──

// Cerrar sesión global
const logoutBtn = document.getElementById('logoutBtn')
if (logoutBtn) {
  logoutBtn.addEventListener('click', e => {
    e.preventDefault()
    // Aquí irá la llamada al API para cerrar sesión
    // Por ejemplo: limpiar token del localStorage
    window.location.href = '/login'
  })
}

// Botón manual de usuario
const btnManual = document.querySelector('.btn-manual')
if (btnManual) {
  btnManual.addEventListener('click', () => {
    // Aquí irá la lógica para abrir el manual
    alert('Manual de usuario próximamente.')
  })
}
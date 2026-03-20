// ── Helpers ──
const $ = id => document.getElementById(id)

function abrirModal(id) {
  $(id).classList.add('active')
}

function cerrarModal(id) {
  $(id).classList.remove('active')
}

// ── Modal Unirse ──
$('btnUnirse').addEventListener('click', () => abrirModal('modalUnirse'))
$('cerrarUnirse').addEventListener('click', () => cerrarModal('modalUnirse'))
$('cancelarUnirse').addEventListener('click', () => cerrarModal('modalUnirse'))

$('confirmarUnirse').addEventListener('click', () => {
  const codigo = $('codigoClase').value.trim()
  if (!codigo) return
  // Aquí irá la llamada al API
  cerrarModal('modalUnirse')
  $('codigoClase').value = ''
})

// ── Cerrar al click fuera ──
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('active')
  })
})

// ── Logout ──
const logoutBtn = $('logoutBtn') || document.getElementById('btnCerrarSesion');
if (logoutBtn) {
  logoutBtn.addEventListener('click', e => {
    e.preventDefault()
    window.location.href = '/login'
  })
}
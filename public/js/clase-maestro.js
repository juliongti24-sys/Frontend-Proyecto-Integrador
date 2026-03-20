// ── Pestañas ──
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'))
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'))
    btn.classList.add('active')
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active')
  })
})

// ── Formulario inline ──
const formInline = document.getElementById('formInline')

document.getElementById('btnAgregarTarea').addEventListener('click', () => {
  document.getElementById('inlineTipo').value = 'tarea'
  formInline.classList.add('open')
})

document.getElementById('btnAgregarAviso').addEventListener('click', () => {
  document.getElementById('inlineTipo').value = 'aviso'
  formInline.classList.add('open')
})

document.getElementById('cancelarInline').addEventListener('click', () => {
  formInline.classList.remove('open')
  limpiarForm()
})

document.getElementById('guardarInline').addEventListener('click', () => {
  const titulo = document.getElementById('inlineTitulo').value.trim()
  if (!titulo) return
  // Aquí irá la llamada al API
  formInline.classList.remove('open')
  limpiarForm()
})

function limpiarForm() {
  document.getElementById('inlineTitulo').value      = ''
  document.getElementById('inlineFecha').value       = ''
  document.getElementById('inlineDescripcion').value = ''
}

// ── Logout ──
document.getElementById('logoutBtn').addEventListener('click', e => {
  e.preventDefault()
  window.location.href = '/login'
})
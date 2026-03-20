// ── Estado ──
let ejercicioActual = 0
let correctas = 0
const totalEjercicios = 10

// ── Elementos ──
const barraProgreso     = document.getElementById('barraProgreso')
const contadorEjercicio = document.getElementById('contadorEjercicio')
const textoPregunta     = document.getElementById('textoPregunta')
const feedbackBox       = document.getElementById('feedbackBox')
const explicacionBox    = document.getElementById('explicacionBox')
const textoExplicacion  = document.getElementById('textoExplicacion')
const btnSiguiente      = document.getElementById('btnSiguiente')
const vistaEjercicios   = document.getElementById('vistaEjercicios')
const vistaResultado    = document.getElementById('vistaResultado')

// ── Actualizar barra de progreso ──
function actualizarProgreso() {
  const pct = (ejercicioActual / totalEjercicios) * 100
  barraProgreso.style.width = pct + '%'
  contadorEjercicio.textContent = `${ejercicioActual + 1} / ${totalEjercicios}`
}

// ── Seleccionar opción ──
document.querySelectorAll('.opcion-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.classList.contains('disabled')) return

    // Deshabilitar todas las opciones
    document.querySelectorAll('.opcion-btn').forEach(b => b.classList.add('disabled'))

    const opcion = btn.dataset.opcion

    // Aquí irá la validación con la API
    // La API devolverá si es correcta o no y la explicación
    feedbackBox.className = 'feedback-box correct'
    feedbackBox.innerHTML = '<i class="fas fa-circle-check"></i> ¡Correcto!'
    btn.classList.add('correct')
    correctas++

    // Mostrar explicación
    explicacionBox.style.display = 'block'
    textoExplicacion.textContent = ' La explicación del ejercicio vendrá de la API.'

    btnSiguiente.style.display = 'inline-flex'
  })
})

// ── Siguiente ejercicio ──
btnSiguiente.addEventListener('click', () => {
  ejercicioActual++

  if (ejercicioActual >= totalEjercicios) {
    mostrarResultado()
    return
  }

  // Limpiar estado
  document.querySelectorAll('.opcion-btn').forEach(b => {
    b.classList.remove('correct', 'wrong', 'disabled')
  })
  feedbackBox.className   = 'feedback-box'
  feedbackBox.innerHTML   = ''
  explicacionBox.style.display = 'none'
  btnSiguiente.style.display   = 'none'

  actualizarProgreso()
  // Aquí irá la carga del siguiente ejercicio desde la API
})

// ── Mostrar resultado final ──
function mostrarResultado() {
  vistaEjercicios.style.display = 'none'
  vistaResultado.style.display  = 'block'

  document.getElementById('resultadoScore').textContent = correctas

  const pct = (correctas / totalEjercicios) * 100
  let mensaje = ''
  if (pct >= 90)      mensaje = '¡Excelente! Dominas este tema.'
  else if (pct >= 70) mensaje = '¡Buen trabajo! Sigue practicando.'
  else if (pct >= 50) mensaje = 'Vas bien, pero puedes mejorar.'
  else                mensaje = 'No te rindas, intenta de nuevo.'

  document.getElementById('resultadoMensaje').textContent = mensaje

  // Aquí irá el guardado del resultado en la API
}

// ── Logout ──
document.getElementById('logoutBtn').addEventListener('click', e => {
  e.preventDefault()
  window.location.href = '/login'
})

// ── Init ──
actualizarProgreso()
// Aquí irá la carga del primer ejercicio desde la API
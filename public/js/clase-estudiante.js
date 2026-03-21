// ── Helpers ──
const $ = id => document.getElementById(id);

document.addEventListener('DOMContentLoaded', async () => {
  // Extraer el ID de la URL (/estudiante/clase/:id)
  const pathname = window.location.pathname;
  const segments = pathname.split('/');
  const classId = segments[segments.length - 1];

  if (!classId || classId === 'clase') {
    // Si no hay ID, regresar
    window.location.href = '/estudiante/clase';
    return;
  }

  try {
    const response = await fetch(`${window.API_BASE_URL}/api/v1/classes/${classId}`);
    
    if (!response.ok) {
      throw new Error('Error al cargar información de la clase.');
    }

    const claseData = await response.json();

    // Actualizar el DOM con la información de la clase
    if ($('claseNombre')) {
      $('claseNombre').textContent = claseData.nombre_clase;
    }
    
    if ($('claseMaestro')) {
      $('claseMaestro').textContent = `Maestro: ${claseData.nombre_maestro}`;
    }
    
    if ($('claseCodigo')) {
      $('claseCodigo').textContent = claseData.codigo_acceso;
    }

    // Por el momento simularemos que no hay actividades
    if ($('listaActividades')) {
      $('listaActividades').innerHTML = `
        <div style="background: rgba(255,255,255,0.05); border: 1px dashed rgba(255,255,255,0.2); padding: 2rem; border-radius: 10px; text-align: center; color: #9ca3af; margin-top: 1.5rem;">
          <i class="fas fa-clipboard-list" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
          <p>Aún no hay actividades o tareas publicadas en esta clase.</p>
        </div>
      `;
    }

  } catch (error) {
    console.error('Error:', error);
    alert('No se pudo cargar la información de la clase.');
    window.location.href = '/estudiante/clase';
  }
});

let correctas = 0
const totalEjercicios = 10

// ── Elementos ──
const barraProgreso    = document.getElementById('barraProgreso')
const contadorEjercicio = document.getElementById('contadorEjercicio')
const textoPregunta    = document.getElementById('textoPregunta')
const listaOpciones    = document.getElementById('listaOpciones')
const feedbackBox      = document.getElementById('feedbackBox')
const btnSiguiente     = document.getElementById('btnSiguiente')
const vistaEjercicios  = document.getElementById('vistaEjercicios')
const vistaResultado   = document.getElementById('vistaResultado')

// ── Actualizar UI ──
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
    // Por ahora simulamos feedback
    feedbackBox.className = 'feedback-box correct'
    feedbackBox.innerHTML = '<i class="fas fa-circle-check"></i> ¡Correcto! Bien hecho.'
    btn.classList.add('correct')
    correctas++

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
  feedbackBox.className = 'feedback-box'
  feedbackBox.innerHTML = ''
  btnSiguiente.style.display = 'none'

  actualizarProgreso()
  // Aquí irá la carga del siguiente ejercicio desde la API
})

// ── Mostrar resultado ──
function mostrarResultado() {
  vistaEjercicios.style.display = 'none'
  vistaResultado.style.display  = 'block'

  document.getElementById('resultadoScore').textContent = correctas

  const pct = (correctas / totalEjercicios) * 100
  let mensaje = ''
  if (pct >= 90)      mensaje = '¡Excelente trabajo! Dominas el tema.'
  else if (pct >= 70) mensaje = '¡Buen trabajo! Sigue practicando.'
  else if (pct >= 50) mensaje = 'Vas bien, pero puedes mejorar.'
  else                mensaje = 'No te rindas, intenta de nuevo.'

  document.getElementById('resultadoMensaje').textContent = mensaje
}

// ── Logout ──
document.getElementById('logoutBtn').addEventListener('click', e => {
  e.preventDefault()
  window.location.href = '/login'
})

// ── Init ──
actualizarProgreso()
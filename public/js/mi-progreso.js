const gridColor = 'rgba(255,255,255,0.05)'
const tickColor = '#9ca3af'
const amarillo  = '#f59e0b'
const amarilloT = 'rgba(245,158,11,0.5)'
const morado    = 'rgba(99,102,241,0.5)'
const moradoB   = '#818cf8'

// ── Calificaciones por parcial ──
new Chart(document.getElementById('chartParciales'), {
  type: 'bar',
  data: {
    labels: ['Parcial 1', 'Parcial 2', 'Parcial 3'],
    datasets: [{
      label: 'Calificación',
      data: [0, 0, 0],
      backgroundColor: amarilloT,
      borderColor: amarillo,
      borderWidth: 1,
      borderRadius: 6
    }]
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { color: tickColor },
        grid: { color: gridColor }
      },
      x: {
        ticks: { color: tickColor },
        grid: { color: gridColor }
      }
    },
    plugins: {
      legend: { labels: { color: tickColor } }
    }
  }
})

// ── Progreso general ──
new Chart(document.getElementById('chartGeneral'), {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Progreso %',
      data: [],
      borderColor: amarillo,
      backgroundColor: 'rgba(245,158,11,0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: amarillo
    }]
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { color: tickColor },
        grid: { color: gridColor }
      },
      x: {
        ticks: { color: tickColor },
        grid: { color: gridColor }
      }
    },
    plugins: {
      legend: { labels: { color: tickColor } }
    }
  }
})

// ── Avance en trayectoria ──
new Chart(document.getElementById('chartTrayectoria'), {
  type: 'doughnut',
  data: {
    labels: ['Completado', 'Pendiente'],
    datasets: [{
      data: [0, 100],
      backgroundColor: [amarillo, 'rgba(255,255,255,0.08)'],
      borderWidth: 0
    }]
  },
  options: {
    cutout: '70%',
    plugins: {
      legend: { labels: { color: tickColor } }
    }
  }
})

// ── Actividades por clase ──
new Chart(document.getElementById('chartActividades'), {
  type: 'bar',
  data: {
    labels: [],
    datasets: [
      {
        label: 'Completadas',
        data: [],
        backgroundColor: amarilloT,
        borderColor: amarillo,
        borderWidth: 1,
        borderRadius: 6
      },
      {
        label: 'Pendientes',
        data: [],
        backgroundColor: morado,
        borderColor: moradoB,
        borderWidth: 1,
        borderRadius: 6
      }
    ]
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: tickColor },
        grid: { color: gridColor }
      },
      x: {
        ticks: { color: tickColor },
        grid: { color: gridColor }
      }
    },
    plugins: {
      legend: { labels: { color: tickColor } }
    }
  }
})

// ── Logout ──
document.getElementById('logoutBtn').addEventListener('click', e => {
  e.preventDefault()
  window.location.href = '/login'
})

// Aquí irá la carga de datos desde la API
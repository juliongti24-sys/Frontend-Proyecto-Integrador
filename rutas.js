// ── Públicas ──
app.get('/', (req, res) => res.render('index'))
app.get('/login', (req, res) => res.render('login'))
app.get('/register', (req, res) => res.render('register'))

// ── Admin ──
app.get('/admin/dashboard', (req, res) => res.render('dashboard-admin', { active: 'inicio' }))
app.get('/admin/perfil', (req, res) => res.render('perfil-admin', { active: 'perfil' }))

// ── Maestro ──
app.get('/maestro/dashboard', (req, res) => res.render('dashboard-maestro', { active: 'inicio' }))
app.get('/maestro/clase', (req, res) => res.render('clase-maestro', { active: 'clases' }))
app.get('/maestro/alumno', (req, res) => res.render('perfil-alumno-maestro', { active: 'clases' }))
app.get('/maestro/progreso', (req, res) => res.render('progreso-alumnos', { active: 'progreso' }))
app.get('/maestro/perfil', (req, res) => res.render('perfil-maestro', { active: 'perfil' }))

// ── Estudiante ──
app.get('/estudiante/dashboard', (req, res) => res.render('estudiante/dashboard-estudiante', { active: 'inicio' }))
app.get('/estudiante/clase', (req, res) => res.render('estudiante/mis-clases', { active: 'clases' }))
app.get('/estudiante/clase/:id', (req, res) => res.render('estudiante/clase-estudiante', { active: 'clases' }))
app.get('/estudiante/resolver', (req, res) => res.render('estudiante/resolver-actividad', { active: 'clases' }))
app.get('/estudiante/trayectoria', (req, res) => res.render('trayectoria', { active: 'trayectoria' }))
app.get('/estudiante/tema', (req, res) => res.render('tema', { active: 'trayectoria' }))
app.get('/estudiante/ejercicios', (req, res) => res.render('ejercicios-practica', { active: 'trayectoria' }))
app.get('/estudiante/progreso', (req, res) => res.render('mi-progreso', { active: 'progreso' }))
app.get('/estudiante/perfil', (req, res) => res.render('perfil-estudiante', { active: 'perfil' }))
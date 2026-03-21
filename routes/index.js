const express = require('express');
const router = express.Router();

// 1. Ruta principal (Landing page o redirección al login)
router.get('/', (req, res) => {
    // Si alguien entra a localhost:3000, lo mandamos directo a iniciar sesión
    res.redirect('/login'); 
});

// 2. Ruta para mostrar el formulario de Registro
router.get('/register', (req, res) => {
    // Esto busca un archivo llamado 'register.ejs' en tu carpeta 'views'
    res.render('register', { titulo: 'Crear cuenta - MathBoost' });
});

// 3. Ruta para mostrar el formulario de Login
router.get('/login', (req, res) => {
    // Renderizar el login y pasarle TODAS las variables juntas
    res.render('login', { 
        titulo: 'Iniciar Sesión - MathBoost',
        backendUrl: process.env.BACKEND_URL || 'http://localhost:8000'
    });
});

// 4. Ruta para el Dashboard / Inicio de la app
router.get('/estudiante/dashboard', (req, res) => {
    // Renderizamos el dashboard del estudiante
    res.render('estudiante/dashboard-estudiante',{ active: 'inicio' });
});

router.get('/estudiante/trayectoria', (req, res) => {
    // Renderizamos el dashboard del estudiante
    res.render('estudiante/trayectoria',{ active: 'inicio' });
});

router.get('/estudiante/progreso', (req, res) => {
    // Renderizamos la vista de progreso (gamificación/racha)
    res.render('estudiante/mi-progreso', { active: 'progreso' });
});

router.get('/estudiante/desafio', (req, res) => {
    // Renderizamos el la sala multijugador
    res.render('estudiante/desafio-estudiante', { active: 'desafio' });
});

router.get('/estudiante/clase', (req, res) => {
    // Renderizamos el grid de clases inscritas
    res.render('estudiante/mis-clases', { active: 'clases' });
});

router.get('/estudiante/perfil', (req, res) => {
    res.render('estudiante/perfil-estudiante', { active: 'perfil' });
});

router.get('/estudiante/clase/:id', (req, res) => {
    // Renderizamos la vista de una clase en particular
    res.render('estudiante/clase-estudiante', { active: 'clases' });
});

//Dashboar del maestro
router.get('/maestro/dashboard', (req, res) => {
    // Renderizamos el dashboard del estudiante
    res.render('maestro/dashboard-maestro',{ active: 'inicio' });
});

router.get('/admin/dashboard', (req, res) => res.render('admin/dashboard-admin', { active: 'inicio' }))
router.get('/admin/perfil', (req, res) => res.render('admin/perfil-admin', { active: 'inicio' }))


// Exportamos el router para poder usarlo en tu archivo principal (app.js o server.js)
module.exports = router;
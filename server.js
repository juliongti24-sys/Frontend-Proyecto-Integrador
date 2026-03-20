const express = require('express')
const app = express()
const path = require('path')

// Configurar EJS como motor de plantillas
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Servir archivos estáticos (CSS, imágenes y JS)
app.use(express.static(path.join(__dirname, 'public')))

// --- RUTAS ---
const indexRoutes = require('./routes/index'); // Importamos el archivo 
app.use('/', indexRoutes); // Le decimos a Express que lo use

// ── 404 ──
app.use((req, res) => res.status(404).render('404'))

app.listen(3000, () => console.log('MathBoost corriendo en http://localhost:3000'))
document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault()

  const correo   = document.getElementById('correo').value.trim()
  const password = document.getElementById('password').value.trim()
  const errorMsg  = document.getElementById('errorMsg')
  const errorText = document.getElementById('errorText')
  const btnSubmit = document.querySelector('.btn-primary'); // Botón de enviar

  if (!correo || !password) {
    errorText.textContent = 'Por favor completa todos los campos.'
    errorMsg.style.display = 'block'
    return
  }

    // Deshabilitar botón mientras carga
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';

  errorMsg.style.display = 'none';

  // Llamada al API (Backend)
  try {
    // 2. Hacer la petición al backend
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ correo, password })
    });

    const data = await response.json();

    // 3. Manejo de la respuesta
    if (response.ok) {
      // Guardamos los datos del usuario
      localStorage.setItem('usuarioMathBoost', JSON.stringify(data.user));

      // --- CONTROL DE ACCESO POR ROLES ---
      const rol = data.user.rol;

      if (rol === 'maestro') {
          window.location.href = '/maestro/dashboard'; 
      } else if (rol === 'admin') {
          window.location.href = '/admin/dashboard';
      } else {
          // Por defecto, asumimos que es estudiante
          window.location.href = '/estudiante/dashboard'; 
      }
    } else {
      // Error (ej. contraseña incorrecta)
      alert(data.detail || 'Ocurrió un error al iniciar sesión.');
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = 'Iniciar sesión';
    }

  } catch (error) {
    console.error("Error de conexión:", error);
    alert('No se pudo conectar con el servidor. Revisa tu conexión.');
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = 'Iniciar sesión';
  }
})
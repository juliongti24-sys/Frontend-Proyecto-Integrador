document.getElementById('registerForm').addEventListener('submit', async e => {
  e.preventDefault();

  // Obtener valores del formulario
  const nombre    = document.getElementById('nombre').value.trim();
  const correo    = document.getElementById('correo').value.trim();
  const matricula = document.getElementById('matricula').value.trim();
  const telefono  = document.getElementById('telefono').value.trim();
  const password  = document.getElementById('password').value.trim();

  // Elementos de la interfaz para mensajes
  const errorMsg   = document.getElementById('errorMsg');
  const errorText  = document.getElementById('errorText');
  const successMsg = document.getElementById('successMsg');
  const btnSubmit  = document.querySelector('.btn-auth');

  // 1. Validación básica en el cliente
  if (!nombre || !correo || !matricula || !telefono || !password) {
    mostrarError('Por favor completa todos los campos.');
    return;
  }

  if (password.length < 6) {
    mostrarError('La contraseña debe tener mínimo 6 caracteres.');
    return;
  }

  // Ocultar errores previos y deshabilitar botón para evitar dobles envíos
  errorMsg.style.display = 'none';
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';

  // 2. Llamada real al backend de FastAPI
  try {
    // Asegúrate de cambiar 'http://localhost:8000' por tu URL de producción cuando subas el proyecto
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/register/student`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      // Convertimos los datos al JSON que espera el modelo de Pydantic
      body: JSON.stringify({ nombre, correo, matricula, telefono, password })
    });

    const data = await response.json();

    // 3. Manejo de la respuesta del servidor
    if (response.ok) {
      // Registro exitoso
      successMsg.style.display = 'block';
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        window.location.href = '/login'; // Ruta de tu EJS para el login
      }, 2000);

    } else {
      // Error desde el backend (ej. Correo ya existe)
      // FastAPI suele mandar los errores en la propiedad 'detail'
      mostrarError(data.detail || 'Ocurrió un error al registrar. Intenta de nuevo.');
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = '<i class="fas fa-user-plus"></i> Crear cuenta';
    }

  } catch (error) {
    console.error("Error de conexión:", error);
    mostrarError('No se pudo conectar con el servidor. Revisa tu conexión.');
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = '<i class="fas fa-user-plus"></i> Crear cuenta';
  }

  // Función de ayuda para mostrar errores
  function mostrarError(mensaje) {
    errorText.textContent = mensaje;
    errorMsg.style.display = 'block';
    successMsg.style.display = 'none';
  }
});
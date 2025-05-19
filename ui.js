// Muestra una pantalla por ID, ocultando las demás
export function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(name).classList.add('active');
}

// Toggle de contraseña visible/invisible
document.querySelectorAll('.toggle-password').forEach(toggle => {
  toggle.addEventListener('click', () => {
    const input = toggle.previousElementSibling;
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    toggle.textContent = isPassword ? '🙈' : '👁️';
  });
});

// Navegación entre pantallas
document.getElementById('go-register')?.addEventListener('click', () => showScreen('register-screen'));
document.getElementById('go-login')?.addEventListener('click', () => showScreen('login-screen'));

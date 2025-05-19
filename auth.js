import { auth, db } from './firebase-config.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc, setDoc, getDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { showScreen } from './ui.js';

// Validación de contraseña segura
const isValidPassword = (pw) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(pw);

// FORMULARIO DE REGISTRO
document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = e.target.email.value;
  const password = e.target.password.value;

  if (!isValidPassword(password)) {
    alert("Contraseña inválida. Usa mínimo una mayúscula, minúscula y un número.");
    return;
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", cred.user.uid), {
      createdAt: serverTimestamp(),
      delayMinutes: 60,
      questions: [],
      reminder: "",
      vaultData: "",
      lastAccess: null
    });
    alert("Cuenta creada. Ahora inicia sesión.");
    showScreen('login-screen');
  } catch (err) {
    alert("Error de registro: " + err.message);
  }
});

// FORMULARIO DE LOGIN
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = e.target.email.value;
  const password = e.target.password.value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    alert("Login fallido: " + err.message);
  }
});

// RECUPERACIÓN DE CONTRASEÑA
document.getElementById('go-reset').addEventListener('click', () => {
  const email = prompt("Ingresa tu correo para recuperar tu contraseña:");
  if (email) {
    sendPasswordResetEmail(auth, email)
      .then(() => alert("Se ha enviado un enlace de recuperación a tu correo."))
      .catch(err => alert("Error al enviar: " + err.message));
  }
});

// DETECCIÓN DE SESIÓN ACTIVA
onAuthStateChanged(auth, async user => {
  if (user) {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (!snap.exists()) return;
    const data = snap.data();
    if (!data.questions || data.questions.length === 0) {
      showScreen('config-screen');
    } else {
      import('./vault.js').then(mod => mod.initVault(data));
    }
  } else {
    showScreen('login-screen');
  }
});

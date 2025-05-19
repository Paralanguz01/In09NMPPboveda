import { auth, db } from './firebase-config.js';
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { showScreen } from './ui.js';

// Inicia el flujo de bóveda según datos de usuario
export async function initVault(userData) {
  const lastAccess = userData.lastAccess?.toDate?.() ?? null;
  const delayMs = (userData.delayMinutes ?? 60) * 60 * 1000;
  const now = new Date();
  const canAccess = !lastAccess || now - lastAccess > delayMs;

  if (canAccess) {
    showScreen('questions-screen');
    loadQuestions(userData);
  } else {
    startCountdownScreen(now - lastAccess, delayMs);
  }
}

// Cargar preguntas en pantalla
function loadQuestions(userData) {
  const container = document.getElementById('questions-form');
  container.innerHTML = '';
  document.getElementById('reminder-msg').textContent = userData.reminder;

  userData.questions.forEach((item, i) => {
    const input = document.createElement('input');
    input.placeholder = item.q;
    input.dataset.answer = item.a.toLowerCase().trim();
    container.appendChild(input);
  });
}

// Verificación de respuestas
document.getElementById('submit-answers').addEventListener('click', async () => {
  const inputs = document.querySelectorAll('#questions-form input');
  const allCorrect = [...inputs].every(i => {
    const userAnswer = i.value.toLowerCase().trim();
    return userAnswer === i.dataset.answer;
  });

  if (!allCorrect) {
    alert("Alguna respuesta es incorrecta.");
    return;
  }

  const uid = auth.currentUser.uid;
  await updateDoc(doc(db, "users", uid), {
    lastAccess: serverTimestamp()
  });

  loadVault();
});

// Mostrar pantalla de bóveda
async function loadVault() {
  const uid = auth.currentUser.uid;
  const snap = await getDoc(doc(db, "users", uid));
  const data = snap.data();

  document.getElementById('vault-data').value = data.vaultData || "";
  showScreen('vault-screen');
}

// Guardar contenido de la bóveda
document.getElementById('save-vault').addEventListener('click', async () => {
  const data = document.getElementById('vault-data').value;
  const uid = auth.currentUser.uid;
  await updateDoc(doc(db, "users", uid), {
    vaultData: data
  });
  alert("Contenido guardado.");
});

// Cerrar sesión desde bóveda
document.getElementById('close-vault').addEventListener('click', async () => {
  await auth.signOut();
  showScreen('login-screen');
});

// Pantalla de cuenta regresiva
function startCountdownScreen(timePassed, delayMs) {
  showScreen('countdown-screen');
  const el = document.getElementById('countdown');
  let msLeft = delayMs - timePassed;

  const interval = setInterval(() => {
    if (msLeft <= 0) {
      clearInterval(interval);
      location.reload();
      return;
    }
    const h = Math.floor(msLeft / 3600000);
    const m = Math.floor((msLeft % 3600000) / 60000);
    const s = Math.floor((msLeft % 60000) / 1000);
    el.textContent = `${h}h ${m}m ${s}s`;
    msLeft -= 1000;
  }, 1000);
}

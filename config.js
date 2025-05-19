import { auth, db } from './firebase-config.js';
import {
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { showScreen } from './ui.js';

// CONFIGURACIÓN DE LA CAJA FUERTE
document.getElementById('config-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const reminder = e.target.reminder.value.trim();
  const q1 = e.target.q1.value.trim();
  const a1 = e.target.a1.value.trim();
  const q2 = e.target.q2.value.trim();
  const a2 = e.target.a2.value.trim();
  const delay = parseInt(e.target.delay.value);
  const unit = e.target.unit.value;

  if (!reminder || !q1 || !a1 || !q2 || !a2 || isNaN(delay)) {
    alert("Por favor, completa todos los campos.");
    return;
  }

  const delayMinutes = convertToMinutes(delay, unit);
  const questions = [
    { q: q1, a: a1.toLowerCase().trim() },
    { q: q2, a: a2.toLowerCase().trim() }
  ];

  const uid = auth.currentUser.uid;
  await updateDoc(doc(db, "users", uid), {
    reminder,
    questions,
    delayMinutes
  });

  alert("Configuración guardada.");
  location.reload();
});

function convertToMinutes(value, unit) {
  switch (unit) {
    case 'hours': return value * 60;
    case 'days': return value * 1440;
    default: return value;
  }
}

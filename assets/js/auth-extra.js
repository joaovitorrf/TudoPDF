import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  deleteUser,
  reauthenticateWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAjp2CToaMXrQ4AdkniCcoVJUcLeeOBZoc",
  authDomain: "tudo-pdf.firebaseapp.com",
  projectId: "tudo-pdf",
  storageBucket: "tudo-pdf.firebasestorage.app",
  messagingSenderId: "357331585036",
  appId: "1:357331585036:web:00db33990df7e84e3fc629",
  measurementId: "G-QZ9XKJVZQK"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

function tuAuthErrorMessage(err) {
  const code = err && err.code ? err.code : '';
  const map = {
    'auth/email-already-in-use': 'Esse e-mail já tem uma conta. Tente entrar em vez de criar uma nova.',
    'auth/invalid-email': 'Esse e-mail não parece válido.',
    'auth/weak-password': 'Sua senha precisa ter pelo menos 6 caracteres.',
    'auth/user-not-found': 'Não encontramos uma conta com esse e-mail.',
    'auth/wrong-password': 'Senha incorreta. Tente novamente.',
    'auth/invalid-credential': 'E-mail ou senha incorretos.',
    'auth/too-many-requests': 'Muitas tentativas. Espere um pouco e tente de novo.',
    'auth/popup-closed-by-user': 'Login cancelado.',
    'auth/requires-recent-login': 'Por segurança, entre novamente antes de continuar.',
  };
  return map[code] || 'Algo deu errado. Tente novamente em instantes.';
}

window.tuRegisterEmail = async function (name, email, password) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (name) await updateProfile(cred.user, { displayName: name });
    if (window.showToast) showToast('Conta criada! Bem-vindo ao TudoUtil.');
    return { ok: true, user: cred.user };
  } catch (e) {
    const msg = tuAuthErrorMessage(e);
    if (window.showToast) showToast(msg);
    return { ok: false, error: msg };
  }
};

window.tuLoginEmail = async function (email, password) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    if (window.showToast) showToast('Login realizado com sucesso.');
    return { ok: true, user: cred.user };
  } catch (e) {
    const msg = tuAuthErrorMessage(e);
    if (window.showToast) showToast(msg);
    return { ok: false, error: msg };
  }
};

window.tuResetPassword = async function (email) {
  try {
    await sendPasswordResetEmail(auth, email);
    if (window.showToast) showToast('Link de redefinição enviado para o seu e-mail.');
    return { ok: true };
  } catch (e) {
    const msg = tuAuthErrorMessage(e);
    if (window.showToast) showToast(msg);
    return { ok: false, error: msg };
  }
};

window.tuUpdateDisplayName = async function (name) {
  if (!auth.currentUser) return { ok: false };
  try {
    await updateProfile(auth.currentUser, { displayName: name });
    if (window.showToast) showToast('Nome atualizado.');
    return { ok: true };
  } catch (e) {
    if (window.showToast) showToast(tuAuthErrorMessage(e));
    return { ok: false };
  }
};

window.tuDeleteAccount = async function () {
  if (!auth.currentUser) return { ok: false };
  try {
    await deleteUser(auth.currentUser);
    if (window.showToast) showToast('Conta excluída. Sentiremos sua falta.');
    return { ok: true };
  } catch (e) {
    if (e && e.code === 'auth/requires-recent-login') {
      try {
        const isGoogle = auth.currentUser.providerData.some((p) => p.providerId === 'google.com');
        if (isGoogle) {
          await reauthenticateWithPopup(auth.currentUser, new GoogleAuthProvider());
          await deleteUser(auth.currentUser);
          if (window.showToast) showToast('Conta excluída. Sentiremos sua falta.');
          return { ok: true };
        }
      } catch (e2) {
        if (window.showToast) showToast(tuAuthErrorMessage(e2));
        return { ok: false, error: tuAuthErrorMessage(e2) };
      }
    }
    const msg = tuAuthErrorMessage(e);
    if (window.showToast) showToast(msg);
    return { ok: false, error: msg };
  }
};

window.tuOnAuthReady = function (callback) {
  onAuthStateChanged(auth, callback);
};

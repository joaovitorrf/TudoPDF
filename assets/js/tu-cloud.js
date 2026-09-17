/* ==========================================================================
   TUDOUTIL — tu-cloud.js  (módulo ES)
   --------------------------------------------------------------------------
   Camada Firebase que pluga POR CIMA do tu-core.js.
   Se este arquivo falhar, o site continua 100% funcional em modo local.

   Responsabilidades:
     · Uma única inicialização do Firebase (antes havia duas, conflitando)
     · Login: Google, e-mail/senha, recuperação de senha
     · Sincronização de favoritos, histórico e arquivos recentes (TTL 24h)
     · Perfil, preferências, plano (free/vip)
     · Exclusão de conta e exportação de dados (LGPD)

   IMPORTANTE SOBRE PRIVACIDADE:
   Nunca enviamos o CONTEÚDO dos arquivos. Só metadados (nome, tamanho,
   ferramenta usada). O processamento é e continua sendo no navegador.
   ========================================================================== */

import { initializeApp, getApps, getApp }
  from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js';
import {
  getAuth, setPersistence, browserLocalPersistence,
  GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  sendPasswordResetEmail, sendEmailVerification,
  updateProfile, deleteUser, signOut,
  reauthenticateWithPopup, onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js';
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, addDoc, getDocs, query, orderBy, limit, where,
  writeBatch, serverTimestamp, enableIndexedDbPersistence
} from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js';

/* ------------------------------------------------------------------
   Config.
   A apiKey do Firebase Web NÃO é segredo — ela identifica o projeto.
   A proteção de verdade vem das Regras do Firestore (firestore.rules)
   e da lista de domínios autorizados no console do Firebase.
   Confira o checklist em SEGURANCA.md.
------------------------------------------------------------------- */
const firebaseConfig = {
  apiKey: 'AIzaSyAjp2CToaMXrQ4AdkniCcoVJUcLeeOBZoc',
  authDomain: 'tudo-pdf.firebaseapp.com',
  projectId: 'tudo-pdf',
  storageBucket: 'tudo-pdf.firebasestorage.app',
  messagingSenderId: '357331585036',
  appId: '1:357331585036:web:00db33990df7e84e3fc629',
  measurementId: 'G-QZ9XKJVZQK'
};

const app  = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

setPersistence(auth, browserLocalPersistence).catch(() => {});
enableIndexedDbPersistence(db).catch(() => { /* várias abas abertas: tudo bem */ });

const RECENT_TTL = 24 * 60 * 60 * 1000;
const HISTORY_LIMIT = 60;

let CURRENT = null;
let syncing = false;

/* ===================== MENSAGENS DE ERRO HUMANAS ======================== */

const AUTH_MSG = {
  'auth/email-already-in-use':  'Esse e-mail já tem conta aqui. Tente entrar em vez de criar.',
  'auth/invalid-email':         'Esse e-mail não parece válido. Confere se não faltou alguma letra?',
  'auth/weak-password':         'A senha precisa de pelo menos 6 caracteres.',
  'auth/user-not-found':        'Não achamos nenhuma conta com esse e-mail.',
  'auth/wrong-password':        'Senha incorreta. Tente de novo ou use "esqueci minha senha".',
  'auth/invalid-credential':    'E-mail ou senha incorretos.',
  'auth/too-many-requests':     'Muitas tentativas seguidas. Espere alguns minutos e tente de novo.',
  'auth/popup-closed-by-user':  'A janela de login foi fechada antes de terminar.',
  'auth/popup-blocked':         'Seu navegador bloqueou a janela. Vamos tentar de outro jeito...',
  'auth/cancelled-popup-request':'Login cancelado.',
  'auth/network-request-failed':'Sem conexão. Verifique sua internet e tente de novo.',
  'auth/requires-recent-login': 'Por segurança, entre de novo antes de continuar.',
  'auth/unauthorized-domain':   'Este domínio ainda não foi liberado no Firebase. Avise o suporte.',
  'permission-denied':          'Você não tem permissão para isso.',
  'unavailable':                'A nuvem está fora do ar no momento. Seus dados seguem salvos neste aparelho.'
};

function authMsg(err) {
  const code = (err && (err.code || err.message)) || '';
  for (const key in AUTH_MSG) if (String(code).indexOf(key) !== -1) return AUTH_MSG[key];
  return 'Algo deu errado. Tente novamente em instantes.';
}

function notify(msg, type, title) {
  if (window.TU && window.TU.toast) window.TU.toast(msg, { type: type || 'info', title: title });
}

/* ========================= DOCUMENTOS ================================== */

const userRef    = (uid) => doc(db, 'users', uid);
const historyCol = (uid) => collection(db, 'users', uid, 'history');
const recentCol  = (uid) => collection(db, 'users', uid, 'recent');

/* Cria/atualiza o documento do usuário no primeiro login */
async function ensureUserDoc(user) {
  const ref = userRef(user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      name: user.displayName || '',
      email: user.email || '',
      photo: user.photoURL || '',
      plan: 'free',
      vipUntil: null,
      favorites: window.TU ? window.TU.getFavorites() : [],
      prefs: window.TU ? window.TU.getPrefs() : {},
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { plan: 'free', favorites: [], prefs: {} };
  }
  await updateDoc(ref, {
    name: user.displayName || snap.data().name || '',
    photo: user.photoURL || snap.data().photo || '',
    updatedAt: serverTimestamp()
  }).catch(() => {});
  return snap.data();
}

/* ================== SINCRONIZAÇÃO (nuvem ⇄ local) ====================== */

/* Estratégia de merge:
   · Favoritos: união dos dois lados (nunca perde favorito).
   · Histórico: mistura por id, ordena por data, corta em 60.
   · Recentes:  descarta tudo com mais de 24h dos dois lados. */
async function pullAndMerge(uid, cloudData) {
  syncing = true;
  try {
    /* --- Favoritos --- */
    const localFavs = window.TU.getFavorites();
    const cloudFavs = Array.isArray(cloudData.favorites) ? cloudData.favorites : [];
    const mergedFavs = Array.from(new Set([...cloudFavs, ...localFavs]));
    window.TU.setFavorites(mergedFavs);
    if (mergedFavs.length !== cloudFavs.length) {
      await updateDoc(userRef(uid), { favorites: mergedFavs, updatedAt: serverTimestamp() }).catch(() => {});
    }

    /* --- Preferências --- */
    if (cloudData.prefs && Object.keys(cloudData.prefs).length) {
      window.TU.setPrefs(cloudData.prefs);
    }

    /* --- Histórico --- */
    const hSnap = await getDocs(query(historyCol(uid), orderBy('at', 'desc'), limit(HISTORY_LIMIT)));
    const cloudHistory = hSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const localHistory = window.TU.getHistory();

    const byId = new Map();
    cloudHistory.forEach(h => byId.set(h.id, h));
    const toUpload = [];
    localHistory.forEach(h => {
      if (!byId.has(h.id)) { byId.set(h.id, h); toUpload.push(h); }
    });
    const merged = Array.from(byId.values())
      .sort((a, b) => (b.at || 0) - (a.at || 0))
      .slice(0, HISTORY_LIMIT);
    window.TU.setHistory(merged);

    // Sobe o que só existia neste aparelho
    if (toUpload.length) {
      const batch = writeBatch(db);
      toUpload.slice(0, 30).forEach(h => {
        batch.set(doc(db, 'users', uid, 'history', h.id), sanitizeHistory(h));
      });
      await batch.commit().catch(() => {});
    }

    /* --- Recentes (24h) --- */
    const cutoff = Date.now() - RECENT_TTL;
    const rSnap = await getDocs(query(recentCol(uid), where('at', '>', cutoff), orderBy('at', 'desc'), limit(20)));
    const cloudRecent = rSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const localRecent = window.TU.getRecentFiles();
    const rMap = new Map();
    [...cloudRecent, ...localRecent].forEach(r => {
      const key = r.name + '|' + r.url;
      if (!rMap.has(key) || rMap.get(key).at < r.at) rMap.set(key, r);
    });
    const mergedRecent = Array.from(rMap.values())
      .filter(r => (Date.now() - r.at) < RECENT_TTL)
      .sort((a, b) => b.at - a.at)
      .slice(0, 20);
    window.TU.setRecentFiles(mergedRecent);

    // Faxina: apaga da nuvem o que já passou das 24h
    purgeExpiredRecent(uid);

  } catch (e) {
    console.warn('[TudoUtil] sync', e);
    notify('Não deu para sincronizar agora. Seus dados continuam salvos neste aparelho.', 'warn');
  } finally {
    syncing = false;
  }
}

function sanitizeHistory(h) {
  return {
    tool: String(h.tool || '').slice(0, 80),
    url: String(h.url || '').slice(0, 200),
    file: String(h.file || '').slice(0, 180),
    size: Number(h.size || 0),
    count: Number(h.count || 1),
    at: Number(h.at || Date.now()),
    status: String(h.status || 'ok').slice(0, 16)
  };
}

/* Remove da nuvem os recentes vencidos. Roda no login e a cada 30 min. */
async function purgeExpiredRecent(uid) {
  try {
    const cutoff = Date.now() - RECENT_TTL;
    const snap = await getDocs(query(recentCol(uid), where('at', '<=', cutoff), limit(50)));
    if (snap.empty) return;
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
  } catch (e) { /* silencioso */ }
}

/* ================== FUNÇÕES CHAMADAS PELO tu-core ====================== */

window.tuCloudSaveFavorites = async function (favs) {
  if (!CURRENT || syncing) return;
  try {
    await updateDoc(userRef(CURRENT.uid), { favorites: favs, updatedAt: serverTimestamp() });
  } catch (e) { /* offline: o Firestore reenvia sozinho */ }
};

window.tuCloudSavePrefs = async function (prefs) {
  if (!CURRENT || syncing) return;
  try {
    await updateDoc(userRef(CURRENT.uid), { prefs: prefs, updatedAt: serverTimestamp() });
  } catch (e) {}
};

window.tuCloudPushHistory = async function (entry) {
  if (!CURRENT || syncing) return;
  try {
    await setDoc(doc(db, 'users', CURRENT.uid, 'history', entry.id), sanitizeHistory(entry));
  } catch (e) {}
};

window.tuCloudClearHistory = async function () {
  if (!CURRENT) return;
  try {
    const snap = await getDocs(query(historyCol(CURRENT.uid), limit(200)));
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
  } catch (e) {}
};

window.tuCloudPushRecent = async function (item) {
  if (!CURRENT || syncing) return;
  try {
    await setDoc(doc(db, 'users', CURRENT.uid, 'recent', item.id), {
      name: String(item.name || '').slice(0, 180),
      size: Number(item.size || 0),
      tool: String(item.tool || '').slice(0, 80),
      url: String(item.url || '').slice(0, 200),
      at: Number(item.at || Date.now()),
      expiresAt: Number(item.expiresAt || (Date.now() + RECENT_TTL))
    });
  } catch (e) {}
};

window.tuCloudClearRecent = async function () {
  if (!CURRENT) return;
  try {
    const snap = await getDocs(query(recentCol(CURRENT.uid), limit(100)));
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
  } catch (e) {}
};

/* ========================== AUTENTICAÇÃO =============================== */

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

window.tuLoginGoogle = async function (nextPath) {
  try {
    await signInWithPopup(auth, provider);
    afterLogin(nextPath);
    return { ok: true };
  } catch (e) {
    // Popup bloqueado (comum em navegador de celular) → redirect
    if (e && (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment')) {
      try {
        if (nextPath) sessionStorage.setItem('tu:next', nextPath);
        await signInWithRedirect(auth, provider);
        return { ok: true, redirect: true };
      } catch (e2) {
        notify(authMsg(e2), 'err', 'Não deu para entrar');
        return { ok: false, error: authMsg(e2) };
      }
    }
    if (e && e.code === 'auth/popup-closed-by-user') return { ok: false, cancelled: true };
    notify(authMsg(e), 'err', 'Não deu para entrar');
    return { ok: false, error: authMsg(e) };
  }
};

window.tuRegisterEmail = async function (name, email, password, nextPath) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (name) await updateProfile(cred.user, { displayName: name });
    sendEmailVerification(cred.user).catch(() => {});
    notify('Conta criada. Bem-vindo ao TudoUtil!', 'ok', 'Tudo certo');
    afterLogin(nextPath);
    return { ok: true, user: cred.user };
  } catch (e) {
    notify(authMsg(e), 'err', 'Não deu para criar a conta');
    return { ok: false, error: authMsg(e) };
  }
};

window.tuLoginEmail = async function (email, password, nextPath) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    afterLogin(nextPath);
    return { ok: true, user: cred.user };
  } catch (e) {
    notify(authMsg(e), 'err', 'Não deu para entrar');
    return { ok: false, error: authMsg(e) };
  }
};

window.tuResetPassword = async function (email) {
  try {
    await sendPasswordResetEmail(auth, email);
    notify('Enviamos um link de redefinição para ' + email + '. Olhe também no spam.', 'ok', 'E-mail enviado');
    return { ok: true };
  } catch (e) {
    notify(authMsg(e), 'err', 'Não deu para enviar');
    return { ok: false, error: authMsg(e) };
  }
};

window.tuUpdateDisplayName = async function (name) {
  if (!auth.currentUser) return { ok: false };
  const clean = String(name || '').replace(/[<>]/g, '').trim().slice(0, 60);
  if (!clean) return { ok: false, error: 'Nome vazio' };
  try {
    await updateProfile(auth.currentUser, { displayName: clean });
    await updateDoc(userRef(auth.currentUser.uid), { name: clean, updatedAt: serverTimestamp() });
    notify('Nome atualizado.', 'ok');
    return { ok: true, name: clean };
  } catch (e) {
    notify(authMsg(e), 'err');
    return { ok: false };
  }
};

window.tuLogout = async function () {
  try {
    await signOut(auth);
    notify('Você saiu da conta. Seus dados na nuvem continuam salvos.', 'info', 'Até logo');
    return { ok: true };
  } catch (e) { return { ok: false }; }
};

/* LGPD — exportar tudo que temos sobre o usuário */
window.tuExportData = async function () {
  if (!CURRENT) return null;
  try {
    const uSnap = await getDoc(userRef(CURRENT.uid));
    const hSnap = await getDocs(query(historyCol(CURRENT.uid), orderBy('at', 'desc'), limit(200)));
    const rSnap = await getDocs(query(recentCol(CURRENT.uid), limit(50)));
    const data = {
      exportadoEm: new Date().toISOString(),
      conta: uSnap.exists() ? uSnap.data() : null,
      historico: hSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      arquivosRecentes: rSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      observacao: 'O TudoUtil nunca armazena o conteúdo dos seus arquivos — apenas estes metadados.'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'tudoutil-meus-dados.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    notify('Baixamos um JSON com tudo que guardamos sobre você.', 'ok', 'Exportação pronta');
    return data;
  } catch (e) {
    notify(authMsg(e), 'err');
    return null;
  }
};

/* LGPD — apagar conta e TODOS os dados */
window.tuDeleteAccount = async function () {
  const user = auth.currentUser;
  if (!user) return { ok: false };

  async function wipeFirestore(uid) {
    try {
      const hSnap = await getDocs(query(historyCol(uid), limit(200)));
      const rSnap = await getDocs(query(recentCol(uid), limit(100)));
      const batch = writeBatch(db);
      hSnap.docs.forEach(d => batch.delete(d.ref));
      rSnap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
      await deleteDoc(userRef(uid));
    } catch (e) { /* as regras cuidam do resto */ }
  }

  try {
    await wipeFirestore(user.uid);
    await deleteUser(user);
    if (window.TU) window.TU.wipeLocal();
    notify('Sua conta e seus dados foram apagados. Sentiremos sua falta.', 'ok', 'Conta excluída');
    return { ok: true };
  } catch (e) {
    if (e && e.code === 'auth/requires-recent-login') {
      try {
        const isGoogle = user.providerData.some(p => p.providerId === 'google.com');
        if (isGoogle) {
          await reauthenticateWithPopup(user, new GoogleAuthProvider());
          await wipeFirestore(user.uid);
          await deleteUser(user);
          if (window.TU) window.TU.wipeLocal();
          notify('Sua conta e seus dados foram apagados.', 'ok', 'Conta excluída');
          return { ok: true };
        }
        notify('Saia e entre de novo para confirmar a exclusão. É uma proteção contra exclusão acidental.', 'warn', 'Confirme sua identidade');
        return { ok: false, needsReauth: true };
      } catch (e2) {
        notify(authMsg(e2), 'err');
        return { ok: false, error: authMsg(e2) };
      }
    }
    notify(authMsg(e), 'err');
    return { ok: false, error: authMsg(e) };
  }
};

/* ======================= PLANO / VIP ==================================
   ATENÇÃO: ler o plano do Firestore no cliente é suficiente para a UI,
   mas NÃO é seguro sozinho. Quem quiser burlar consegue. A liberação de
   verdade tem que vir do webhook do gateway escrevendo 'plan' via
   Cloud Function com Admin SDK — e as regras do Firestore proíbem o
   cliente de escrever nesse campo. Ver PENDENCIAS.txt item 3.
======================================================================== */

window.tuGetPlan = async function () {
  if (!CURRENT) return 'anon';
  try {
    const snap = await getDoc(userRef(CURRENT.uid));
    if (!snap.exists()) return 'free';
    const d = snap.data();
    if (d.plan === 'vip') {
      const until = d.vipUntil && d.vipUntil.toMillis ? d.vipUntil.toMillis() : d.vipUntil;
      if (!until || until > Date.now()) return 'vip';
      return 'free'; // assinatura vencida
    }
    return 'free';
  } catch (e) { return 'free'; }
};

/* Chamado pela página /vip/ depois que o gateway confirmar o pagamento.
   Hoje só registra a intenção; a ativação real virá do webhook. */
window.tuClaimVip = async function (checkoutRef) {
  if (!CURRENT) return { ok: false, error: 'precisa estar logado' };
  try {
    await setDoc(doc(db, 'users', CURRENT.uid, 'billing', 'claim'), {
      checkoutRef: String(checkoutRef || '').slice(0, 120),
      claimedAt: serverTimestamp(),
      status: 'pending_webhook'
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: authMsg(e) };
  }
};

/* ==================== ESTADO DE AUTENTICAÇÃO ========================== */

function afterLogin(nextPath) {
  const target = nextPath || sessionStorage.getItem('tu:next');
  if (target && window.TU) {
    sessionStorage.removeItem('tu:next');
    const safe = window.TU.safeInternalPath(target, '/conta/');
    setTimeout(() => { window.location.href = safe; }, 420);
  }
}

/* Atualiza o cabeçalho em todas as páginas (o site tem 2 layouts diferentes) */
function paintHeader(user) {
  const set = (id, fn) => { const el = document.getElementById(id); if (el) fn(el); };

  if (user) {
    set('btn-login-header', el => { el.style.display = 'none'; });
    set('user-menu',   el => { el.style.display = 'flex'; });
    set('user-avatar', el => { if (user.photoURL) el.src = user.photoURL; });
    set('user-name',   el => { el.textContent = user.displayName || 'Minha conta'; });
    set('user-email',  el => { el.textContent = user.email || ''; });
    document.querySelectorAll('[data-auth="out"]').forEach(el => { el.hidden = true; });
    document.querySelectorAll('[data-auth="in"]').forEach(el => { el.hidden = false; });
    document.querySelectorAll('[data-user-name]').forEach(el => {
      el.textContent = user.displayName || (user.email || '').split('@')[0] || 'você';
    });
    document.querySelectorAll('[data-user-email]').forEach(el => { el.textContent = user.email || ''; });
    document.querySelectorAll('[data-user-photo]').forEach(el => {
      if (user.photoURL) { el.src = user.photoURL; el.hidden = false; }
    });
  } else {
    set('btn-login-header', el => { el.style.display = ''; });
    set('user-menu', el => { el.style.display = 'none'; });
    document.querySelectorAll('[data-auth="out"]').forEach(el => { el.hidden = false; });
    document.querySelectorAll('[data-auth="in"]').forEach(el => { el.hidden = true; });
  }
}

onAuthStateChanged(auth, async (user) => {
  CURRENT = user;

  if (!user) {
    if (window.TU) window.TU.setUser(null);
    paintHeader(null);
    if (typeof window._onAuthChange === 'function') window._onAuthChange(null);
    document.dispatchEvent(new CustomEvent('tu:auth', { detail: { user: null } }));
    // Páginas protegidas mandam para o login
    if (document.body.hasAttribute('data-require-auth')) {
      const next = encodeURIComponent(location.pathname);
      if (!location.pathname.startsWith('/login')) location.href = '/login/?next=' + next;
    }
    return;
  }

  paintHeader(user);

  let cloudData = {};
  try { cloudData = await ensureUserDoc(user); } catch (e) { /* offline */ }

  const plan = (cloudData && cloudData.plan === 'vip') ? 'vip' : 'free';

  if (window.TU) {
    window.TU.setUser({
      uid: user.uid,
      name: user.displayName || '',
      email: user.email || '',
      photo: user.photoURL || '',
      emailVerified: user.emailVerified,
      plan: plan
    });
  }

  await pullAndMerge(user.uid, cloudData || {});

  if (typeof window._onAuthChange === 'function') window._onAuthChange(user);
  document.dispatchEvent(new CustomEvent('tu:auth', { detail: { user: user, plan: plan } }));

  // Faxina periódica dos recentes vencidos
  setInterval(() => purgeExpiredRecent(user.uid), 30 * 60 * 1000);
});

/* Retorno do login por redirect (celular) */
getRedirectResult(auth).then(res => {
  if (res && res.user) afterLogin(sessionStorage.getItem('tu:next'));
}).catch(() => {});

/* ==========================================================================
   LISTA DE ESPERA (ferramentas de imagem)
   Grava só e-mail + data. As regras do Firestore permitem create e proíbem
   leitura: ninguém, nem logado, consegue baixar a lista.
   ========================================================================== */
window.tuJoinWaitlist = async function (email, meta) {
  const clean = String(email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean)) throw new Error('email-invalido');
  const id = clean.replace(/[^a-z0-9]/g, '_').slice(0, 120);
  try {
    await setDoc(doc(db, 'waitlist', id), {
      email: clean,
      source: (meta && meta.source) ? String(meta.source).slice(0, 40) : 'site',
      wants: (meta && Array.isArray(meta.wants)) ? meta.wants.slice(0, 20).map(String) : [],
      at: serverTimestamp()
    });
  } catch (err) {
    // As regras só permitem create. Se já existe, a segunda tentativa vira
    // update e é negada — pro usuário isso é "já está na lista", não erro.
    if (err && (err.code === 'permission-denied' || err.code === 'already-exists')) return true;
    throw err;
  }
  return true;
};

/* ---- Compatibilidade com o código antigo das ferramentas ---- */
window.loginWithGoogle = function () { return window.tuLoginGoogle(); };
window.logoutGoogle    = function () { return window.tuLogout(); };
window.tuOnAuthReady   = function (cb) { return onAuthStateChanged(auth, cb); };

export { auth, db, app };

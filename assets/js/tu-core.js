/* ==========================================================================
   TUDOUTIL — tu-core.js  (núcleo do site, script clássico, sem dependências)
   --------------------------------------------------------------------------
   Roda em TODAS as páginas. Nunca depende do Firebase para funcionar:
   se a nuvem cair, tudo continua operando em modo local.
   O módulo tu-cloud.js pluga o Firebase POR CIMA deste arquivo.

   Contém:
     1. Utilitários seguros (storage, sanitização, formatação)
     2. Sistema de toast com mensagens humanas
     3. Tema claro/escuro
     4. Motor de planos e limites (Visitante / Grátis / VIP)
     5. Histórico, favoritos e arquivos recentes (TTL 24h)
     6. Instalação do app (PWA no celular / programa no PC)
     7. Consentimento LGPD + Google Consent Mode v2 + AdSense
     8. Atalhos de teclado
     9. Tradutor de erro técnico → linguagem humana
    10. Instrumentação automática das ferramentas
   ========================================================================== */
(function () {
  'use strict';

  /* ===================== 1. CONSTANTES E CONFIG ========================== */

  var K = {
    theme:    'tu:theme',
    favs:     'tu:favorites',
    history:  'tu:history',
    recent:   'tu:recent',
    prefs:    'tu:prefs',
    usage:    'tu:usage',
    plan:     'tu:plan',
    consent:  'tu:consent',
    install:  'tu:install-dismissed',
    seenTips: 'tu:seen-tips'
  };

  // Chaves da versão antiga — migradas automaticamente uma única vez.
  var LEGACY = {
    theme: 'tudoutil-theme',
    favs: 'tudopdf-favorites',
    history: 'tudopdf-history'
  };

  var ADSENSE_CLIENT = 'ca-pub-9029786875800750';

  var MB = 1024 * 1024;

  /* Planos.
     Como o processamento é no navegador do usuário, nosso custo marginal é
     quase zero. Por isso o plano grátis é DE PROPÓSITO mais generoso que o
     dos concorrentes — o limite existe para gerar conversão, não para cobrir
     custo de servidor. */
  var PLANS = {
    anon: {
      id: 'anon',
      label: 'Visitante',
      opsPerDay: 5,
      maxFileMB: 25,
      maxBatch: 5,
      ads: true,
      cloudSync: false,
      batchQueue: false
    },
    free: {
      id: 'free',
      label: 'Grátis',
      opsPerDay: 20,
      maxFileMB: 100,
      maxBatch: 20,
      ads: true,
      cloudSync: true,
      batchQueue: false
    },
    vip: {
      id: 'vip',
      label: 'VIP',
      opsPerDay: Infinity,
      maxFileMB: 500,
      maxBatch: Infinity,
      ads: false,
      cloudSync: true,
      batchQueue: true
    }
  };

  var HISTORY_MAX = 60;
  var RECENT_TTL = 24 * 60 * 60 * 1000; // 24 horas, conforme especificado

  /* ===================== 2. UTILITÁRIOS SEGUROS ========================== */

  /* localStorage nunca deve derrubar a página (modo privado do Safari,
     cota estourada, cookies bloqueados...). */
  var store = {
    get: function (key, fallback) {
      try {
        var raw = localStorage.getItem(key);
        if (raw === null || raw === undefined) return fallback;
        return JSON.parse(raw);
      } catch (e) { return fallback; }
    },
    set: function (key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); return true; }
      catch (e) { return false; }
    },
    del: function (key) {
      try { localStorage.removeItem(key); return true; } catch (e) { return false; }
    },
    bytes: function () {
      var total = 0;
      try {
        for (var i = 0; i < localStorage.length; i++) {
          var k = localStorage.key(i);
          if (k && k.indexOf('tu:') === 0) total += (localStorage.getItem(k) || '').length + k.length;
        }
      } catch (e) {}
      return total;
    }
  };

  /* Sanitização: TUDO que vem do usuário e vira HTML passa por aqui.
     Regra do projeto: nunca concatenar input em innerHTML sem escapar. */
  function esc(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* Nome de arquivo seguro: remove path traversal e caracteres de controle. */
  function safeFileName(name) {
    return String(name || 'arquivo')
      .replace(/[\\/]/g, '_')
      .replace(/\.{2,}/g, '.')
      // eslint-disable-next-line no-control-regex
      .replace(/[\x00-\x1f\x7f]/g, '')
      .slice(0, 180)
      .trim() || 'arquivo';
  }

  /* Só aceita URL interna — barra open-redirect em ?next= */
  function safeInternalPath(path, fallback) {
    fallback = fallback || '/';
    if (!path || typeof path !== 'string') return fallback;
    if (path.charAt(0) !== '/' || path.charAt(1) === '/') return fallback;
    if (/[\x00-\x1f]/.test(path)) return fallback;
    return path;
  }

  function fmtSize(bytes) {
    if (!bytes && bytes !== 0) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < MB) return (bytes / 1024).toFixed(0) + ' KB';
    if (bytes < 1024 * MB) return (bytes / MB).toFixed(1) + ' MB';
    return (bytes / 1024 / MB).toFixed(2) + ' GB';
  }

  function fmtDate(ts) {
    try {
      var d = new Date(ts), now = new Date();
      var diff = now - d;
      if (diff < 60000) return 'agora mesmo';
      if (diff < 3600000) return 'há ' + Math.floor(diff / 60000) + ' min';
      if (diff < 86400000) return 'há ' + Math.floor(diff / 3600000) + ' h';
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) +
             ' · ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch (e) { return ''; }
  }

  function todayKey() {
    var d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function isMobile() {
    return window.matchMedia('(max-width: 860px)').matches ||
           /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  }

  function isIOS() { return /iPhone|iPad|iPod/i.test(navigator.userAgent); }

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  }

  function debounce(fn, ms) {
    var t;
    return function () {
      var args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, ms || 200);
    };
  }

  /* ========================= 3. TOASTS =================================== */

  var ICONS = {
    ok:   '<path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>',
    err:  '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.2v.1" stroke-linecap="round"/>',
    warn: '<path d="M12 3.5l9.5 16.5H2.5z" stroke-linejoin="round"/><path d="M12 10v4M12 17.2v.1" stroke-linecap="round"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.8v.1" stroke-linecap="round"/>'
  };

  function toast(message, opts) {
    opts = opts || {};
    var type = opts.type || 'info';
    var stack = document.querySelector('.tu-toasts');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'tu-toasts';
      stack.setAttribute('role', 'status');
      stack.setAttribute('aria-live', 'polite');
      document.body.appendChild(stack);
    }
    var el = document.createElement('div');
    el.className = 'tu-toast is-' + type;
    el.innerHTML =
      '<svg class="tu-toast-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
        (ICONS[type] || ICONS.info) +
      '</svg>' +
      '<div class="tu-toast-body">' +
        (opts.title ? '<div class="tu-toast-title">' + esc(opts.title) + '</div>' : '') +
        '<div class="tu-toast-text">' + esc(message) + '</div>' +
        (opts.actionLabel && opts.actionHref
          ? '<a class="tu-btn tu-btn-sm tu-btn-hot" style="margin-top:9px" href="' + esc(safeInternalPath(opts.actionHref)) + '">' + esc(opts.actionLabel) + '</a>'
          : '') +
      '</div>' +
      '<button class="tu-toast-x" aria-label="Fechar aviso" type="button">' +
        '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/></svg>' +
      '</button>';

    function remove() {
      el.classList.add('is-leaving');
      setTimeout(function () { if (el.parentNode) el.remove(); }, 220);
    }
    el.querySelector('.tu-toast-x').addEventListener('click', remove);
    stack.appendChild(el);

    // Erros ficam mais tempo na tela — o usuário precisa ler.
    var life = opts.duration || (type === 'err' ? 7000 : 4200);
    if (life !== Infinity) setTimeout(remove, life);
    return { close: remove };
  }

  /* ============ 4. ERROS HUMANOS (nunca mostrar stack trace) ============= */

  var ERROR_MAP = [
    { test: /password|encrypted|pdf.*protect/i,
      title: 'Esse PDF está protegido por senha',
      msg: 'Use a ferramenta "Desbloquear PDF" primeiro e depois volte aqui.' },
    { test: /invalid pdf|not a pdf|pdf header|corrupt|damaged/i,
      title: 'Não conseguimos abrir esse arquivo',
      msg: 'Ele pode estar corrompido ou não ser um PDF de verdade. Tente a ferramenta "Reparar PDF".' },
    { test: /quota|storage full|exceeded/i,
      title: 'Sem espaço no navegador',
      msg: 'Feche outras abas pesadas ou limpe os dados locais em Minha conta e tente de novo.' },
    { test: /out of memory|allocation|maximum call stack/i,
      title: 'Esse arquivo é grande demais para o navegador',
      msg: 'Tente dividir em partes menores ou abrir no computador, que tem mais memória.' },
    { test: /network|failed to fetch|offline|net::/i,
      title: 'Sem conexão no momento',
      msg: 'Verifique sua internet. A boa notícia: o processamento é no seu aparelho, então é só reconectar e tentar de novo.' },
    { test: /permission|denied|notallowed/i,
      title: 'Precisamos de permissão',
      msg: 'Autorize o acesso solicitado pelo navegador para continuar.' },
    { test: /abort|cancel/i,
      title: 'Operação cancelada',
      msg: 'Nada foi alterado no seu arquivo.' }
  ];

  function humanError(err, contextMsg) {
    var raw = '';
    try { raw = (err && (err.message || err.code || err.name)) || String(err || ''); } catch (e) {}
    for (var i = 0; i < ERROR_MAP.length; i++) {
      if (ERROR_MAP[i].test.test(raw)) {
        return { title: ERROR_MAP[i].title, msg: ERROR_MAP[i].msg };
      }
    }
    return {
      title: 'Algo não saiu como esperado',
      msg: contextMsg || 'Tente novamente. Se continuar, troque o arquivo ou fale com a gente pelo suporte.'
    };
  }

  function reportError(err, contextMsg) {
    var h = humanError(err, contextMsg);
    toast(h.msg, { type: 'err', title: h.title });
    // Detalhe técnico só no console — nunca na tela do usuário.
    if (window.console && console.warn) console.warn('[TudoUtil]', err);
    // Gancho de monitoramento (Sentry/GA) — ver PENDENCIAS.txt
    if (typeof window.tuOnError === 'function') {
      try { window.tuOnError(err, contextMsg); } catch (e) {}
    }
    return h;
  }

  /* ========================== 5. TEMA ==================================== */

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    store.set(K.theme, theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#FBFAF7' : '#07080F');
    document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(theme === 'light'));
    });
    document.dispatchEvent(new CustomEvent('tu:theme', { detail: { theme: theme } }));
  }

  function initTheme() {
    var saved = store.get(K.theme, null);
    if (saved === null) {
      var legacy = null;
      try { legacy = localStorage.getItem(LEGACY.theme); } catch (e) {}
      if (legacy === 'light' || legacy === 'dark') saved = legacy;
    }
    if (saved !== 'light' && saved !== 'dark') {
      saved = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    applyTheme(saved);

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-theme-toggle], #theme-btn, #theme-btn-mobile, .theme-toggle');
      if (!btn) return;
      e.preventDefault();
      applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  /* ================= 6. PLANO, LIMITES E QUOTA =========================== */

  var _user = null;          // preenchido por tu-cloud.js
  var _planId = 'anon';

  function currentPlan() { return PLANS[_planId] || PLANS.anon; }

  function setPlan(planId) {
    _planId = PLANS[planId] ? planId : 'anon';
    store.set(K.plan, _planId);
    document.body.setAttribute('data-plan', _planId);
    document.querySelectorAll('[data-plan-label]').forEach(function (el) {
      el.textContent = currentPlan().label;
    });
    // Elementos que só aparecem para VIP / só para não-VIP
    document.querySelectorAll('[data-vip-only]').forEach(function (el) {
      el.hidden = _planId !== 'vip';
    });
    document.querySelectorAll('[data-nonvip-only]').forEach(function (el) {
      el.hidden = _planId === 'vip';
    });
    renderQuotaWidgets();
    document.dispatchEvent(new CustomEvent('tu:plan', { detail: { plan: _planId } }));
  }

  function getUsage() {
    var u = store.get(K.usage, null);
    if (!u || u.day !== todayKey()) { u = { day: todayKey(), ops: 0 }; store.set(K.usage, u); }
    return u;
  }

  function opsLeft() {
    var plan = currentPlan();
    if (plan.opsPerDay === Infinity) return Infinity;
    return Math.max(0, plan.opsPerDay - getUsage().ops);
  }

  function countOperation(n) {
    var u = getUsage();
    u.ops += (n || 1);
    store.set(K.usage, u);
    renderQuotaWidgets();
    return u.ops;
  }

  /* Checagem ANTES de processar. Retorna {ok:true} ou {ok:false, reason, ...} */
  function checkLimits(opts) {
    opts = opts || {};
    var plan = currentPlan();
    var files = opts.files || [];

    if (opsLeft() <= 0) {
      return { ok: false, reason: 'ops', plan: plan };
    }
    if (files.length && plan.maxBatch !== Infinity && files.length > plan.maxBatch) {
      return { ok: false, reason: 'batch', plan: plan, limit: plan.maxBatch, got: files.length };
    }
    for (var i = 0; i < files.length; i++) {
      var f = files[i];
      var size = f && (f.size || 0);
      if (plan.maxFileMB !== Infinity && size > plan.maxFileMB * MB) {
        return { ok: false, reason: 'size', plan: plan, limit: plan.maxFileMB, file: f };
      }
    }
    return { ok: true, plan: plan };
  }

  /* Fluxo completo: checa e, se estourou, abre o convite certo.
     Visitante → convidamos a criar conta (grátis).
     Grátis    → convidamos o VIP. */
  function guard(opts) {
    var res = checkLimits(opts);
    if (res.ok) return true;
    openUpgrade(res);
    return false;
  }

  function limitCopy(res) {
    var isAnon = _planId === 'anon';
    var p = res.plan;
    if (res.reason === 'ops') {
      return {
        title: isAnon ? 'Você usou suas ' + p.opsPerDay + ' operações de hoje' : 'Limite diário do plano Grátis atingido',
        body: isAnon
          ? 'Crie sua conta grátis em 10 segundos e suba para ' + PLANS.free.opsPerDay + ' operações por dia, com histórico e favoritos salvos na nuvem.'
          : 'No VIP as operações são ilimitadas, sem anúncio e com arquivos de até ' + PLANS.vip.maxFileMB + ' MB.'
      };
    }
    if (res.reason === 'size') {
      return {
        title: 'Esse arquivo passa de ' + p.maxFileMB + ' MB',
        body: isAnon
          ? 'Com a conta grátis você processa arquivos de até ' + PLANS.free.maxFileMB + ' MB. No VIP, até ' + PLANS.vip.maxFileMB + ' MB.'
          : 'O VIP aceita arquivos de até ' + PLANS.vip.maxFileMB + ' MB, o suficiente para digitalizações longas e contratos completos.'
      };
    }
    if (res.reason === 'batch') {
      return {
        title: 'São ' + res.got + ' arquivos e o limite aqui é ' + res.limit,
        body: isAnon
          ? 'Faça login e o limite sobe para ' + PLANS.free.maxBatch + ' arquivos por vez.'
          : 'O VIP processa lotes sem limite de quantidade, em fila, sem travar o navegador.'
      };
    }
    return { title: 'Limite atingido', body: 'Dê uma olhada nos planos para continuar.' };
  }

  function openUpgrade(res) {
    var copy = limitCopy(res);
    var isAnon = _planId === 'anon';
    var next = encodeURIComponent(location.pathname);

    var html =
      '<div class="tu-modal-bg" data-close></div>' +
      '<div class="tu-modal" role="dialog" aria-modal="true" aria-labelledby="tu-up-title">' +
        '<button class="tu-modal-x" data-close aria-label="Fechar">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/></svg>' +
        '</button>' +
        '<div class="tu-paywall" style="border:none;background:none;padding:0;text-align:left">' +
          '<span class="tu-badge ' + (isAnon ? 'tu-badge-hot' : 'tu-badge-vip') + '" style="margin-bottom:12px">' +
            (isAnon ? 'Conta grátis' : 'TudoUtil VIP') + '</span>' +
          '<h3 id="tu-up-title" style="font-size:1.25rem">' + esc(copy.title) + '</h3>' +
          '<p style="margin-bottom:18px">' + esc(copy.body) + '</p>' +
          (isAnon
            ? '<ul style="list-style:none;display:grid;gap:9px;margin:0 0 20px;padding:0;font-size:.9rem">' +
                liCheck(PLANS.free.opsPerDay + ' operações por dia') +
                liCheck('Arquivos de até ' + PLANS.free.maxFileMB + ' MB') +
                liCheck('Histórico e favoritos em todos os aparelhos') +
                liCheck('Sempre grátis, sem cartão') +
              '</ul>'
            : '<ul style="list-style:none;display:grid;gap:9px;margin:0 0 20px;padding:0;font-size:.9rem">' +
                liCheck('Operações ilimitadas') +
                liCheck('Arquivos de até ' + PLANS.vip.maxFileMB + ' MB') +
                liCheck('Zero anúncios') +
                liCheck('Lote em fila + fluxos salvos') +
              '</ul>' +
              '<div class="tu-paywall-price" style="margin-bottom:16px">R$ 10<span style="font-size:.8rem;color:var(--tu-fg-2);font-weight:400">/mês · cancela quando quiser</span></div>') +
          '<div class="tu-paywall-actions" style="justify-content:flex-start">' +
            (isAnon
              ? '<a class="tu-btn tu-btn-hot" href="/login/?next=' + next + '">Criar conta grátis</a>' +
                '<a class="tu-btn tu-btn-quiet" href="/vip/">Ver o VIP</a>'
              : '<a class="tu-btn tu-btn-vip" href="/vip/?from=limite">Assinar o VIP</a>' +
                '<button class="tu-btn tu-btn-quiet" data-close type="button">Agora não</button>') +
          '</div>' +
          '<p style="font-size:.76rem;color:var(--tu-fg-3);margin-top:16px;margin-bottom:0">Seus arquivos continuam sendo processados no seu aparelho. O limite é da nossa política de uso, não do seu arquivo.</p>' +
        '</div>' +
      '</div>';

    var layer = document.getElementById('tu-upgrade-modal');
    if (!layer) {
      layer = document.createElement('div');
      layer.id = 'tu-upgrade-modal';
      layer.className = 'tu-modal-layer';
      document.body.appendChild(layer);
    }
    layer.innerHTML = html;
    layer.classList.add('is-open');
    document.body.classList.add('tu-no-scroll');
    layer.querySelectorAll('[data-close]').forEach(function (b) {
      b.addEventListener('click', closeUpgrade);
    });
    document.addEventListener('keydown', escCloseUpgrade);
    var focusable = layer.querySelector('a, button');
    if (focusable) focusable.focus();
    track('paywall_view', { reason: res.reason, plan: _planId });
  }

  function liCheck(text) {
    return '<li style="display:flex;gap:9px;align-items:flex-start">' +
      '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="var(--citrine-400)" stroke-width="2.5" style="flex-shrink:0;margin-top:2px"><path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '<span>' + esc(text) + '</span></li>';
  }

  function escCloseUpgrade(e) { if (e.key === 'Escape') closeUpgrade(); }

  function closeUpgrade() {
    var layer = document.getElementById('tu-upgrade-modal');
    if (layer) layer.classList.remove('is-open');
    document.body.classList.remove('tu-no-scroll');
    document.removeEventListener('keydown', escCloseUpgrade);
  }

  /* Widget "X de Y operações hoje" — some para VIP */
  function renderQuotaWidgets() {
    var plan = currentPlan();
    document.querySelectorAll('[data-quota-widget]').forEach(function (el) {
      if (plan.opsPerDay === Infinity) {
        el.innerHTML = '<span class="tu-badge tu-badge-vip">VIP</span>' +
          '<span class="tu-quota-txt">Operações ilimitadas</span>';
        el.className = 'tu-quota';
        return;
      }
      var used = getUsage().ops;
      var total = plan.opsPerDay;
      var left = Math.max(0, total - used);
      var pct = Math.min(100, (used / total) * 100);
      el.className = 'tu-quota' + (left === 0 ? ' is-out' : (left <= Math.ceil(total * 0.25) ? ' is-low' : ''));
      el.innerHTML =
        '<span class="tu-quota-txt">' + left + '/' + total + ' hoje</span>' +
        '<span class="tu-quota-bar"><i style="width:' + pct + '%"></i></span>' +
        (left === 0
          ? '<a class="tu-btn tu-btn-sm tu-btn-hot" href="' + (_planId === 'anon' ? '/login/' : '/vip/') + '">' +
            (_planId === 'anon' ? 'Liberar grátis' : 'Liberar') + '</a>'
          : '<a class="tu-btn tu-btn-sm tu-btn-quiet" href="/vip/">Ilimitado</a>');
    });
  }

  /* ============ 7. FAVORITOS / HISTÓRICO / RECENTES ====================== */

  function getFavorites() {
    var f = store.get(K.favs, null);
    if (f === null) { // migração da versão antiga
      try {
        var old = JSON.parse(localStorage.getItem(LEGACY.favs) || '[]');
        if (Array.isArray(old) && old.length) { store.set(K.favs, old); return old; }
      } catch (e) {}
      return [];
    }
    return Array.isArray(f) ? f : [];
  }

  function isFavorite(url) { return getFavorites().indexOf(url) !== -1; }

  function toggleFavorite(url) {
    if (!url || url === '#') return false;
    var favs = getFavorites();
    var i = favs.indexOf(url);
    var added;
    if (i === -1) { favs.push(url); added = true; }
    else { favs.splice(i, 1); added = false; }
    store.set(K.favs, favs);
    syncFavButtons();
    document.dispatchEvent(new CustomEvent('tu:favorites', { detail: { favorites: favs } }));
    if (_user && typeof window.tuCloudSaveFavorites === 'function') {
      window.tuCloudSaveFavorites(favs);
    }
    toast(
      added ? 'Ferramenta salva nos favoritos.' : 'Ferramenta removida dos favoritos.',
      added
        ? { type: 'ok', title: 'Favoritado',
            actionLabel: _user ? null : null }
        : { type: 'info' }
    );
    if (added && !_user) {
      // Momento perfeito para explicar o valor do login — sem popup agressivo.
      var seen = store.get(K.seenTips, {});
      if (!seen.favCloud) {
        seen.favCloud = true; store.set(K.seenTips, seen);
        setTimeout(function () {
          toast('Crie uma conta grátis e seus favoritos vão junto para o celular.', {
            type: 'info', title: 'Dica', actionLabel: 'Criar conta', actionHref: '/login/'
          });
        }, 900);
      }
    }
    track('favorite_toggle', { url: url, added: added });
    return added;
  }

  function syncFavButtons() {
    var favs = getFavorites();
    document.querySelectorAll('[data-fav-url]').forEach(function (btn) {
      var on = favs.indexOf(btn.getAttribute('data-fav-url')) !== -1;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-pressed', String(on));
      btn.setAttribute('title', on ? 'Remover dos favoritos' : 'Salvar nos favoritos');
    });
  }

  function setFavorites(list) {
    if (!Array.isArray(list)) return;
    store.set(K.favs, list);
    syncFavButtons();
    document.dispatchEvent(new CustomEvent('tu:favorites', { detail: { favorites: list } }));
  }

  /* ---- Histórico ---- */

  function getHistory() {
    var h = store.get(K.history, null);
    if (h === null) {
      try {
        var old = JSON.parse(localStorage.getItem(LEGACY.history) || '[]');
        if (Array.isArray(old) && old.length) {
          var migrated = old.map(function (o) {
            return { id: uid(), tool: o.tool || 'Ferramenta', url: o.url || '#',
                     file: o.file || '', size: 0, at: Date.now(), status: 'ok' };
          });
          store.set(K.history, migrated);
          return migrated;
        }
      } catch (e) {}
      return [];
    }
    return Array.isArray(h) ? h : [];
  }

  function getPrefs() {
    return store.get(K.prefs, { keepHistory: true, autoDownload: false, emailOptIn: false, reduceMotion: false });
  }
  function setPrefs(patch) {
    var p = Object.assign(getPrefs(), patch || {});
    store.set(K.prefs, p);
    document.dispatchEvent(new CustomEvent('tu:prefs', { detail: p }));
    if (_user && typeof window.tuCloudSavePrefs === 'function') window.tuCloudSavePrefs(p);
    return p;
  }

  /* ESTA é a função que faltava no projeto: nada gravava histórico.
     Agora toda ferramenta registra o que fez. */
  function trackOperation(data) {
    data = data || {};
    if (!getPrefs().keepHistory) return null;

    var entry = {
      id: uid(),
      tool: String(data.tool || document.title.split('—')[0] || 'Ferramenta').trim().slice(0, 80),
      url: safeInternalPath(data.url || location.pathname),
      file: safeFileName(data.file || ''),
      size: Number(data.size || 0),
      count: Number(data.count || 1),
      at: Date.now(),
      status: data.status || 'ok'
    };

    var h = getHistory();
    h.unshift(entry);
    if (h.length > HISTORY_MAX) h = h.slice(0, HISTORY_MAX);
    store.set(K.history, h);

    addRecentFile({ name: entry.file, size: entry.size, tool: entry.tool, url: entry.url });
    countOperation(1);

    document.dispatchEvent(new CustomEvent('tu:history', { detail: { entry: entry, history: h } }));
    if (_user && typeof window.tuCloudPushHistory === 'function') {
      window.tuCloudPushHistory(entry);
    }
    track('tool_complete', { tool: entry.tool, size: entry.size });
    return entry;
  }

  function clearHistory() {
    store.set(K.history, []);
    document.dispatchEvent(new CustomEvent('tu:history', { detail: { history: [] } }));
    if (_user && typeof window.tuCloudClearHistory === 'function') window.tuCloudClearHistory();
  }

  function setHistory(list) {
    if (!Array.isArray(list)) return;
    store.set(K.history, list.slice(0, HISTORY_MAX));
    document.dispatchEvent(new CustomEvent('tu:history', { detail: { history: list } }));
  }

  /* ---- Arquivos recentes (TTL 24h, só METADADOS) ----
     Importante: nunca guardamos o conteúdo do arquivo, nem local nem na
     nuvem. Guardamos nome, tamanho e qual ferramenta foi usada, para o
     botão "repetir operação". O arquivo em si nunca sai do aparelho. */
  function getRecentFiles() {
    var list = store.get(K.recent, []);
    if (!Array.isArray(list)) return [];
    var now = Date.now();
    var alive = list.filter(function (r) { return (now - r.at) < RECENT_TTL; });
    if (alive.length !== list.length) store.set(K.recent, alive);
    return alive;
  }

  function addRecentFile(f) {
    if (!f || !f.name) return;
    var list = getRecentFiles().filter(function (r) { return !(r.name === f.name && r.url === f.url); });
    list.unshift({
      id: uid(),
      name: safeFileName(f.name),
      size: Number(f.size || 0),
      tool: String(f.tool || '').slice(0, 80),
      url: safeInternalPath(f.url || location.pathname),
      at: Date.now(),
      expiresAt: Date.now() + RECENT_TTL
    });
    store.set(K.recent, list.slice(0, 20));
    document.dispatchEvent(new CustomEvent('tu:recent', { detail: { recent: list } }));
    if (_user && typeof window.tuCloudPushRecent === 'function') window.tuCloudPushRecent(list[0]);
  }

  function clearRecentFiles() {
    store.set(K.recent, []);
    document.dispatchEvent(new CustomEvent('tu:recent', { detail: { recent: [] } }));
    if (_user && typeof window.tuCloudClearRecent === 'function') window.tuCloudClearRecent();
  }

  function setRecentFiles(list) {
    if (!Array.isArray(list)) return;
    var now = Date.now();
    store.set(K.recent, list.filter(function (r) { return (now - r.at) < RECENT_TTL; }));
    document.dispatchEvent(new CustomEvent('tu:recent', { detail: { recent: list } }));
  }

  /* Quanto tempo falta até um recente sumir — usado na UI de confiança */
  function ttlLabel(item) {
    var left = RECENT_TTL - (Date.now() - item.at);
    if (left <= 0) return 'expirado';
    var h = Math.floor(left / 3600000);
    if (h >= 1) return 'some em ' + h + 'h';
    return 'some em ' + Math.max(1, Math.floor(left / 60000)) + ' min';
  }

  /* =================== 8. INSTALAÇÃO (PWA / DESKTOP) ===================== */

  var deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    document.querySelectorAll('[data-pwa-install]').forEach(function (el) { el.hidden = false; });
    document.dispatchEvent(new CustomEvent('tu:installable'));
    maybeShowInstallBar();
  });

  window.addEventListener('appinstalled', function () {
    deferredPrompt = null;
    store.set(K.install, { done: true, at: Date.now() });
    hideInstallBar();
    toast('Pronto! O TudoUtil já está na sua tela inicial.', { type: 'ok', title: 'App instalado' });
    track('pwa_installed', {});
  });

  function canInstall() { return !!deferredPrompt; }

  /* Dispara o prompt nativo se existir. NUNCA redireciona.
     Quem chama decide o que fazer quando volta false (ex.: a /baixar/
     mostra o passo a passo manual em vez de recarregar a si mesma). */
  async function promptInstall() {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    var choice = await deferredPrompt.userChoice;
    deferredPrompt = null;
    track('pwa_prompt', { outcome: choice.outcome });
    return choice.outcome === 'accepted';
  }

  async function installApp() {
    if (!deferredPrompt) {
      // iOS e navegadores sem prompt nativo: manda para o passo a passo,
      // a não ser que já estejamos nele.
      if (location.pathname.indexOf('/baixar') !== 0) window.location.href = '/baixar/';
      return false;
    }
    deferredPrompt.prompt();
    var choice = await deferredPrompt.userChoice;
    deferredPrompt = null;
    track('pwa_prompt', { outcome: choice.outcome });
    return choice.outcome === 'accepted';
  }

  /* Faixa de instalação — aparece UMA vez, depois da 2ª operação,
     nunca em cima do conteúdo, e some por 30 dias se o usuário fechar.
     (Regra do projeto: "nada de 15 pop-ups".) */
  function maybeShowInstallBar() {
    if (isStandalone()) return;
    var d = store.get(K.install, null);
    if (d && d.done) return;
    if (d && d.at && (Date.now() - d.at) < 30 * 86400000) return;
    if (getUsage().ops < 1 && !document.body.hasAttribute('data-install-eager')) return;

    var bar = document.getElementById('tu-install-bar');
    if (bar) { bar.classList.add('is-show'); return; }

    var mobile = isMobile();
    bar = document.createElement('div');
    bar.id = 'tu-install-bar';
    bar.className = 'tu-install is-show';
    bar.innerHTML =
      '<span class="tu-install-ico">' +
        '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" stroke-width="2">' +
        (mobile
          ? '<rect x="6" y="2.5" width="12" height="19" rx="2.6"/><path d="M11 18.6h2" stroke-linecap="round"/>'
          : '<rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M8 21h8M12 17v4" stroke-linecap="round"/>') +
        '</svg>' +
      '</span>' +
      '<span class="tu-install-body">' +
        '<strong>' + (mobile ? 'Instale o app do TudoUtil' : 'Instale o TudoUtil no Windows') + '</strong>' +
        '<span>' + (mobile ? 'Abre direto da tela inicial e funciona offline.' : 'Vira um programa com ícone, sem abrir o navegador.') + '</span>' +
      '</span>' +
      '<button class="tu-btn tu-btn-sm tu-btn-hot" data-install-go type="button">' + (mobile ? 'Instalar' : 'Baixar') + '</button>' +
      '<button class="tu-install-x" data-install-no aria-label="Agora não" type="button">' +
        '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/></svg>' +
      '</button>';
    document.body.appendChild(bar);

    bar.querySelector('[data-install-go]').addEventListener('click', function () {
      if (canInstall()) installApp(); else window.location.href = '/baixar/';
    });
    bar.querySelector('[data-install-no]').addEventListener('click', function () {
      store.set(K.install, { done: false, at: Date.now() });
      hideInstallBar();
    });
  }

  function hideInstallBar() {
    var bar = document.getElementById('tu-install-bar');
    if (bar) bar.classList.remove('is-show');
  }

  /* Botões espalhados pelo site que levam para a instalação */
  function wireInstallButtons() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-install-app]');
      if (!btn) return;
      e.preventDefault();
      if (canInstall()) installApp();
      else window.location.href = '/baixar/';
    });
    // Texto adaptativo: "Baixar o app" no celular, "Baixar para Windows" no PC
    document.querySelectorAll('[data-install-label]').forEach(function (el) {
      el.textContent = isMobile() ? 'Baixar o app' : 'Baixar para Windows';
    });
  }

  /* ========== 9. CONSENTIMENTO (LGPD) + CONSENT MODE v2 + ADSENSE ========
     O AdSense exige consentimento prévio no Brasil/UE. Nada de anúncio ou
     analytics antes do usuário decidir. */

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  function defaultConsent() {
    gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
      functionality_storage: 'granted',
      security_storage: 'granted',
      wait_for_update: 500
    });
  }

  function updateConsent(granted) {
    gtag('consent', 'update', {
      ad_storage: granted ? 'granted' : 'denied',
      ad_user_data: granted ? 'granted' : 'denied',
      ad_personalization: granted ? 'granted' : 'denied',
      analytics_storage: granted ? 'granted' : 'denied'
    });
  }

  function loadAdSense() {
    if (document.getElementById('tu-adsense')) return;
    if (currentPlan().ads === false) return; // VIP não carrega nem o script
    var s = document.createElement('script');
    s.id = 'tu-adsense';
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + ADSENSE_CLIENT;
    document.head.appendChild(s);
    s.addEventListener('load', function () {
      document.querySelectorAll('.tu-ad ins.adsbygoogle').forEach(function () {
        try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
      });
    });
  }

  function saveConsent(granted) {
    store.set(K.consent, { granted: !!granted, at: Date.now(), v: 2 });
    updateConsent(granted);
    if (granted) loadAdSense();
    var el = document.getElementById('tu-consent');
    if (el) el.classList.remove('is-show');
    track('consent', { granted: !!granted });
  }

  function initConsent() {
    defaultConsent();
    var c = store.get(K.consent, null);

    if (c && typeof c.granted === 'boolean') {
      updateConsent(c.granted);
      if (c.granted) loadAdSense();
      return;
    }

    // Banner — aceitar e recusar com o MESMO peso visual (exigência do Google)
    var el = document.createElement('div');
    el.id = 'tu-consent';
    el.className = 'tu-consent';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Preferências de privacidade');
    el.innerHTML =
      '<h4>Um recado rápido sobre cookies</h4>' +
      '<p>Seus arquivos são processados no seu próprio aparelho e <strong>nunca</strong> são enviados para nós. ' +
      'Usamos cookies só para medir audiência e exibir anúncios que mantêm o site gratuito. ' +
      'Você escolhe. <a href="/privacidade/">Política de privacidade</a>.</p>' +
      '<div class="tu-consent-actions">' +
        '<button class="tu-btn tu-btn-hot" data-consent="1" type="button">Aceitar</button>' +
        '<button class="tu-btn tu-btn-ghost" data-consent="0" type="button">Recusar</button>' +
        '<a class="tu-btn tu-btn-quiet tu-btn-sm" href="/cookies/">Saber mais</a>' +
      '</div>';
    document.body.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('is-show'); });
    el.querySelectorAll('[data-consent]').forEach(function (b) {
      b.addEventListener('click', function () { saveConsent(b.getAttribute('data-consent') === '1'); });
    });
  }

  /* Evento de analytics — respeita consentimento automaticamente */
  function track(name, params) {
    try {
      if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
    } catch (e) {}
  }

  /* ===================== 10. ATALHOS DE TECLADO ========================== */

  var SHORTCUTS = [
    { keys: 'Ctrl/⌘ + K', what: 'Buscar ferramenta' },
    { keys: 'Ctrl/⌘ + U', what: 'Enviar arquivo' },
    { keys: 'Ctrl/⌘ + Enter', what: 'Executar a ferramenta' },
    { keys: 'Ctrl/⌘ + D', what: 'Favoritar esta ferramenta' },
    { keys: 'Shift + D', what: 'Alternar tema claro/escuro' },
    { keys: '?', what: 'Ver todos os atalhos' },
    { keys: 'Esc', what: 'Fechar / cancelar' }
  ];

  function initShortcuts() {
    document.addEventListener('keydown', function (e) {
      var tag = (e.target.tagName || '').toLowerCase();
      var typing = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;
      var mod = e.metaKey || e.ctrlKey;

      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (typeof window.tuOpenSearch === 'function') window.tuOpenSearch();
        else if (window.TU && TU.openSearch) TU.openSearch();
        return;
      }
      if (mod && e.key.toLowerCase() === 'u') {
        var input = document.querySelector('input[type="file"]:not([disabled])');
        if (input) { e.preventDefault(); input.click(); }
        return;
      }
      if (mod && e.key === 'Enter') {
        var cta = document.querySelector('[data-tool-run]:not([disabled]), .compress-btn:not([disabled]), .merge-btn:not([disabled]), .convert-btn:not([disabled]), .process-btn:not([disabled])');
        if (cta) { e.preventDefault(); cta.click(); }
        return;
      }
      if (mod && e.key.toLowerCase() === 'd') {
        var favBtn = document.querySelector('[data-fav-url="' + location.pathname + '"]');
        if (favBtn || document.body.hasAttribute('data-tool-url')) {
          e.preventDefault();
          toggleFavorite(document.body.getAttribute('data-tool-url') || location.pathname);
        }
        return;
      }
      if (!typing && e.shiftKey && e.key.toLowerCase() === 'd') {
        applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
        return;
      }
      if (!typing && e.key === '?') { e.preventDefault(); openShortcuts(); return; }
      if (e.key === 'Escape') {
        closeUpgrade();
        var sc = document.getElementById('tu-shortcuts');
        if (sc) sc.classList.remove('is-open');
        document.body.classList.remove('tu-no-scroll');
      }
    });
  }

  function openShortcuts() {
    var layer = document.getElementById('tu-shortcuts');
    if (!layer) {
      layer = document.createElement('div');
      layer.id = 'tu-shortcuts';
      layer.className = 'tu-modal-layer';
      layer.innerHTML =
        '<div class="tu-modal-bg" data-close></div>' +
        '<div class="tu-modal" role="dialog" aria-modal="true" aria-label="Atalhos de teclado">' +
          '<button class="tu-modal-x" data-close aria-label="Fechar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/></svg></button>' +
          '<h3 style="margin-bottom:16px">Atalhos de teclado</h3>' +
          '<div style="display:grid;gap:10px">' +
            SHORTCUTS.map(function (s) {
              return '<div class="tu-row-between" style="font-size:.9rem">' +
                '<span class="tu-muted">' + esc(s.what) + '</span>' +
                '<kbd class="tu-badge tu-mono">' + esc(s.keys) + '</kbd></div>';
            }).join('') +
          '</div>' +
        '</div>';
      document.body.appendChild(layer);
      layer.querySelectorAll('[data-close]').forEach(function (b) {
        b.addEventListener('click', function () {
          layer.classList.remove('is-open');
          document.body.classList.remove('tu-no-scroll');
        });
      });
    }
    layer.classList.add('is-open');
    document.body.classList.add('tu-no-scroll');
  }

  /* =========== 11. INSTRUMENTAÇÃO AUTOMÁTICA DAS FERRAMENTAS ============
     As 41 ferramentas existentes não chamam trackOperation(). Em vez de
     editar 41 arquivos, observamos o DOM: quando um link de download for
     ativado, registramos a operação. Ferramentas novas podem chamar
     TU.trackOperation() direto, que é mais preciso. */

  function initAutoTracking() {
    var toolUrl = location.pathname;
    if (toolUrl.indexOf('/tools/') !== 0) return;

    var toolName = (document.querySelector('h1') && document.querySelector('h1').textContent || document.title)
      .replace(/—.*$/, '').replace(/\s+/g, ' ').trim().slice(0, 80);
    document.body.setAttribute('data-tool-url', toolUrl);

    var lastFile = '';
    var lastSize = 0;

    // Guarda o nome do arquivo que o usuário escolheu
    document.addEventListener('change', function (e) {
      var inp = e.target;
      if (inp && inp.type === 'file' && inp.files && inp.files.length) {
        lastFile = inp.files[0].name;
        lastSize = inp.files[0].size;
        addRecentFile({ name: lastFile, size: lastSize, tool: toolName, url: toolUrl });
      }
    }, true);

    document.addEventListener('drop', function (e) {
      try {
        var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) { lastFile = f.name; lastSize = f.size; }
      } catch (err) {}
    }, true);

    // Download concluído = operação concluída
    var recorded = false;
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[download], .download-btn, #download-btn, [data-download]');
      if (!a || recorded) return;
      recorded = true;
      setTimeout(function () { recorded = false; }, 1500);
      trackOperation({
        tool: toolName,
        url: toolUrl,
        file: a.getAttribute('download') || lastFile || 'resultado.pdf',
        size: lastSize
      });
    }, true);
  }

  /* Mostra o widget de quota nas ferramentas, sem precisar editar o HTML */
  function injectQuotaWidget() {
    if (location.pathname.indexOf('/tools/') !== 0) return;
    if (document.querySelector('[data-quota-widget]')) return;
    var anchor = document.querySelector('.drop-zone, .tu-drop, .tool-ui-wrap, main');
    if (!anchor) return;
    var w = document.createElement('div');
    w.className = 'tu-quota';
    w.setAttribute('data-quota-widget', '');
    w.style.margin = '0 auto 16px';
    w.style.maxWidth = '620px';
    anchor.parentNode.insertBefore(w, anchor);
    renderQuotaWidgets();
  }

  /* ======= 12. FAIXA DE TRANSPARÊNCIA (confiança + diferencial) ========= */

  function injectTrustStrip() {
    if (location.pathname.indexOf('/tools/') !== 0) return;
    if (document.querySelector('.tu-trust-strip')) return;
    var anchor = document.querySelector('.drop-zone, .tu-drop');
    if (!anchor) return;
    var s = document.createElement('div');
    s.className = 'tu-trust-strip tu-row';
    s.style.cssText = 'gap:8px;flex-wrap:wrap;justify-content:center;margin:14px auto 0;max-width:640px;font-size:.78rem;color:var(--tu-fg-3)';
    s.innerHTML =
      '<span class="tu-badge tu-badge-ok">100% no seu aparelho</span>' +
      '<span class="tu-badge">Nada é enviado para servidor</span>' +
      '<span class="tu-badge">Sem marca d\'água</span>' +
      '<span class="tu-badge">Sem cadastro para começar</span>';
    anchor.parentNode.insertBefore(s, anchor.nextSibling);
  }

  /* ================== 13. REVEAL / MICROINTERAÇÕES ====================== */

  function initReveal() {
    var items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); obs.unobserve(en.target); }
      });
    }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { obs.observe(el); });
  }

  /* Delegação global dos botões de favorito (funciona em conteúdo dinâmico) */
  function initFavDelegation() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-fav-url]');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      toggleFavorite(btn.getAttribute('data-fav-url'));
    });
    syncFavButtons();
  }

  /* ================== 14. SERVICE WORKER ================================ */

  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () {});
    });
  }

  /* ================== 15. API PÚBLICA =================================== */

  window.TU = Object.assign(window.TU || {}, {
    // dados
    PLANS: PLANS,
    plan: currentPlan,
    planId: function () { return _planId; },
    setPlan: setPlan,
    user: function () { return _user; },
    setUser: function (u) {
      _user = u;
      setPlan(u ? (u.plan === 'vip' ? 'vip' : 'free') : 'anon');
      document.dispatchEvent(new CustomEvent('tu:user', { detail: { user: u } }));
    },

    // limites
    checkLimits: checkLimits,
    guard: guard,
    opsLeft: opsLeft,
    getUsage: getUsage,
    countOperation: countOperation,
    openUpgrade: openUpgrade,
    renderQuota: renderQuotaWidgets,

    // favoritos
    getFavorites: getFavorites,
    setFavorites: setFavorites,
    isFavorite: isFavorite,
    toggleFavorite: toggleFavorite,
    syncFavButtons: syncFavButtons,

    // histórico e recentes
    trackOperation: trackOperation,
    getHistory: getHistory,
    setHistory: setHistory,
    clearHistory: clearHistory,
    getRecentFiles: getRecentFiles,
    addRecentFile: addRecentFile,
    setRecentFiles: setRecentFiles,
    clearRecentFiles: clearRecentFiles,
    ttlLabel: ttlLabel,

    // preferências
    getPrefs: getPrefs,
    setPrefs: setPrefs,

    // UI
    toast: toast,
    reportError: reportError,
    humanError: humanError,
    applyTheme: applyTheme,
    openShortcuts: openShortcuts,

    // instalação
    canInstall: canInstall,
    installApp: installApp,
    promptInstall: promptInstall,
    isStandalone: isStandalone,
    isMobile: isMobile,
    isIOS: isIOS,

    // privacidade
    consent: function () { return store.get(K.consent, null); },
    saveConsent: saveConsent,
    reopenConsent: function () {
      store.del(K.consent);
      initConsent();
    },

    // utilidades
    esc: esc,
    safeFileName: safeFileName,
    safeInternalPath: safeInternalPath,
    fmtSize: fmtSize,
    fmtDate: fmtDate,
    debounce: debounce,
    track: track,
    storageBytes: store.bytes,
    keys: K,

    // limpeza total (LGPD: direito de apagar)
    wipeLocal: function () {
      Object.keys(K).forEach(function (k) { store.del(K[k]); });
      [LEGACY.favs, LEGACY.history, LEGACY.theme].forEach(function (k) { store.del(k); });
      document.dispatchEvent(new CustomEvent('tu:wiped'));
    }
  });

  // Compatibilidade com o código antigo espalhado pelas ferramentas
  window.showToast = function (msg) {
    var clean = String(msg || '').replace(/^[^\w\dÀ-ú]+\s*/, ''); // tira emoji do começo
    toast(clean);
  };
  window.trackRecentFile = function (tool, file) { trackOperation({ tool: tool, file: file }); };

  /* ======================= 16. BOOT ===================================== */

  function boot() {
    document.body.setAttribute('data-plan', store.get(K.plan, 'anon'));
    _planId = store.get(K.plan, 'anon');

    initTheme();
    initConsent();
    initFavDelegation();
    initShortcuts();
    initReveal();
    wireInstallButtons();
    initAutoTracking();
    injectQuotaWidget();
    injectTrustStrip();
    registerSW();
    renderQuotaWidgets();

    // A barra de instalação só entra depois que o usuário já teve valor.
    setTimeout(maybeShowInstallBar, 2500);

    // Marca o body quando existe tabbar no mobile (evita conteúdo cortado)
    if (document.querySelector('.tu-tabbar')) document.body.classList.add('has-tabbar');

    document.dispatchEvent(new CustomEvent('tu:ready'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

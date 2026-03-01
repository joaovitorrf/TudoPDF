/* ============================================================
   TUDOPDF — main.js
   Scripts globais: tema, header, mobile nav, toast, back-to-top
   + ferramentas de busca e filtro (apenas na home)
============================================================ */

/* ── DADOS DAS FERRAMENTAS (usados na busca global) ── */
const TOOLS = [
  // Organizar
  { name: 'Organizar PDF',       icon: '📂', cat: 'organizar', url: '/tools/organizar-pdf/',       desc: 'Reordene páginas facilmente',      live: false },
  { name: 'Juntar PDF',          icon: '🔗', cat: 'organizar', url: '/tools/juntar-pdf/',          desc: 'Una vários arquivos em um',        live: false },
  { name: 'Dividir PDF',         icon: '✂️',  cat: 'organizar', url: '/tools/dividir-pdf/',         desc: 'Separe páginas com precisão',     live: false },
  { name: 'Remover Páginas',     icon: '🗑️',  cat: 'organizar', url: '/tools/remover-paginas/',     desc: 'Delete páginas indesejadas',      live: false },
  { name: 'Extrair Páginas',     icon: '📤', cat: 'organizar', url: '/tools/extrair-paginas/',     desc: 'Salve páginas específicas',       live: false },
  { name: 'Digitalizar PDF',     icon: '📷', cat: 'organizar', url: '/tools/digitalizar-pdf/',     desc: 'Transforme fotos em PDF',         live: false },
  { name: 'Otimizar PDF',        icon: '⚡', cat: 'organizar', url: '/tools/otimizar-pdf/',        desc: 'Melhore a qualidade',             live: false },
  { name: 'Comprimir PDF',       icon: '🗜️',  cat: 'organizar', url: '/tools/comprimir-pdf/',       desc: 'Reduza até 80% do tamanho',       live: true  },
  { name: 'Reparar PDF',         icon: '🔧', cat: 'organizar', url: '/tools/reparar-pdf/',         desc: 'Recupere arquivos corrompidos',   live: false },
  { name: 'OCR PDF',             icon: '🔍', cat: 'organizar', url: '/tools/ocr-pdf/',             desc: 'Reconheça texto em imagens',      live: false },
  // Converter → PDF
  { name: 'JPG para PDF',        icon: '🖼️',  cat: 'converter', url: '/tools/jpg-para-pdf/',        desc: 'Imagens viram PDF instantâneo',   live: false },
  { name: 'WORD para PDF',       icon: '📝', cat: 'converter', url: '/tools/word-para-pdf/',       desc: 'Converta .docx com perfeição',    live: false },
  { name: 'POWERPOINT para PDF', icon: '📊', cat: 'converter', url: '/tools/powerpoint-para-pdf/', desc: 'Apresentações em PDF',            live: false },
  { name: 'EXCEL para PDF',      icon: '📈', cat: 'converter', url: '/tools/excel-para-pdf/',      desc: 'Planilhas preservadas',           live: false },
  { name: 'HTML para PDF',       icon: '🌐', cat: 'converter', url: '/tools/html-para-pdf/',       desc: 'Páginas web em documento',        live: false },
  // Converter → de PDF
  { name: 'PDF para JPG',        icon: '🖼️',  cat: 'converter', url: '/tools/pdf-para-jpg/',        desc: 'Exporte páginas como imagem',     live: false },
  { name: 'PDF para WORD',       icon: '📝', cat: 'converter', url: '/tools/pdf-para-word/',       desc: 'Edite seu PDF no Word',           live: false },
  { name: 'PDF para POWERPOINT', icon: '📊', cat: 'converter', url: '/tools/pdf-para-powerpoint/', desc: 'Transforme em slides',            live: false },
  { name: 'PDF para EXCEL',      icon: '📈', cat: 'converter', url: '/tools/pdf-para-excel/',      desc: 'Tabelas em planilha editável',    live: false },
  { name: 'PDF para PDF/A',      icon: '📁', cat: 'converter', url: '/tools/pdf-para-pdfa/',       desc: 'Formato de arquivo padrão',       live: false },
  // Editar
  { name: 'Rodar PDF',           icon: '🔄', cat: 'editar',    url: '/tools/rodar-pdf/',           desc: 'Corrija a orientação das páginas', live: false },
  { name: 'Inserir Nº de Página',icon: '🔢', cat: 'editar',    url: '/tools/numeros-pagina/',      desc: 'Paginação automática',            live: false },
  { name: 'Marca d\'água',       icon: '💧', cat: 'editar',    url: '/tools/marca-dagua/',         desc: 'Proteja seus documentos',         live: false },
  { name: 'Recortar PDF',        icon: '✂️',  cat: 'editar',    url: '/tools/recortar-pdf/',        desc: 'Ajuste as margens',               live: false },
  { name: 'Comparar PDF',        icon: '⚖️',  cat: 'editar',    url: '/tools/comparar-pdf/',        desc: 'Encontre diferenças entre arquivos', live: false },
  // Segurança
  { name: 'Desbloquear PDF',     icon: '🔓', cat: 'seguranca', url: '/tools/desbloquear-pdf/',     desc: 'Remova senhas do PDF',            live: false },
  { name: 'Proteger PDF',        icon: '🔒', cat: 'seguranca', url: '/tools/proteger-pdf/',        desc: 'Adicione senha de segurança',     live: false },
  { name: 'Assinar PDF',         icon: '✍️',  cat: 'seguranca', url: '/tools/assinar-pdf/',         desc: 'Assinatura digital válida',       live: false },
  { name: 'Ocultar Conteúdo',    icon: '🙈', cat: 'seguranca', url: '/tools/ocultar-pdf/',         desc: 'Esconda informações sensíveis',   live: false },
];

/* ── TEMA ── */
const THEME_KEY = 'tudopdf-theme';

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'light';
  applyTheme(saved);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.body.setAttribute('data-theme', theme);
  const btn = document.getElementById('theme-btn');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  localStorage.setItem(THEME_KEY, theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

/* ── HEADER SCROLL ── */
function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
    const bt = document.getElementById('back-top');
    if (bt) bt.classList.toggle('visible', window.scrollY > 400);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ── MOBILE NAV ── */
function openMobileNav() {
  const nav = document.getElementById('mobile-nav');
  const ham = document.querySelector('.hamburger');
  if (nav) nav.classList.add('open');
  if (ham) ham.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeMobileNav() {
  const nav = document.getElementById('mobile-nav');
  const ham = document.querySelector('.hamburger');
  if (nav) nav.classList.remove('open');
  if (ham) ham.classList.remove('open');
  document.body.style.overflow = '';
}

/* ── TOAST ── */
let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ── BACK TO TOP ── */
function backToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── PARTICLES (hero) ── */
function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const icons = ['📄', '📝', '📋', '📁', '🔒', '📊', '📈', '🖨️'];
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = icons[Math.floor(Math.random() * icons.length)];
    p.style.cssText = `
      left: ${Math.random() * 100}vw;
      font-size: ${0.8 + Math.random() * 1.4}rem;
      animation-duration: ${12 + Math.random() * 20}s;
      animation-delay: ${Math.random() * 20}s;
    `;
    container.appendChild(p);
  }
}

/* ── ANIMATED COUNTERS ── */
function formatNum(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B+';
  if (n >= 1e6) return (n / 1e6).toFixed(0) + 'M+';
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K+';
  return n.toString();
}

function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  if (isNaN(target)) return;
  const duration = 2000;
  const startTime = performance.now();
  const tick = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = formatNum(Math.floor(target * ease));
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function initCounters() {
  const statsEl = document.getElementById('stats');
  if (!statsEl) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        statsEl.querySelectorAll('[data-target]').forEach(animateCounter);
        observer.disconnect();
      }
    });
  }, { threshold: 0.4 });
  observer.observe(statsEl);
}

/* ── HERO SEARCH (autocomplete) ── */
function initHeroSearch() {
  const input = document.getElementById('hero-search-input');
  const resultsBox = document.getElementById('hero-search-results');
  if (!input || !resultsBox) return;

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    resultsBox.innerHTML = '';
    if (!q) { resultsBox.classList.remove('show'); return; }

    const matches = TOOLS.filter(t =>
      t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q)
    ).slice(0, 6);

    if (matches.length === 0) {
      resultsBox.innerHTML = '<div class="search-no-result">Nenhuma ferramenta encontrada 🔍</div>';
    } else {
      matches.forEach(t => {
        const a = document.createElement('a');
        a.className = 'search-result-item';
        a.href = t.live ? t.url : '#';
        a.innerHTML = `<span class="sri">${t.icon}</span><span>${t.name}</span><span style="font-size:0.75rem;color:var(--text-muted);margin-left:auto">${t.desc}</span>`;
        if (!t.live) {
          a.addEventListener('click', e => {
            e.preventDefault();
            resultsBox.classList.remove('show');
            showToast(`🚧 "${t.name}" — Em breve!`);
          });
        }
        resultsBox.appendChild(a);
      });
    }
    resultsBox.classList.add('show');
  });

  // Scroll para tools ao pressionar Enter
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const q = input.value.trim().toLowerCase();
      resultsBox.classList.remove('show');
      filterToolsGrid(q);
      document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  // Fecha ao clicar fora
  document.addEventListener('click', e => {
    if (!input.closest('.hero-search').contains(e.target)) {
      resultsBox.classList.remove('show');
    }
  });
}

/* ── TOOLS GRID FILTER ── */
let currentCat = 'all';
let currentQuery = '';

function filterToolsGrid(query) {
  currentQuery = query.toLowerCase();
  const cards = document.querySelectorAll('#tools-grid .tool-card');
  let visible = 0;
  cards.forEach(card => {
    const nameMatch = card.dataset.name?.toLowerCase().includes(currentQuery);
    const catMatch  = currentCat === 'all' || card.dataset.cat === currentCat;
    const show = nameMatch && catMatch;
    card.classList.toggle('hidden', !show);
    if (show) visible++;
  });
  // No result
  let noResult = document.getElementById('tools-no-result');
  if (visible === 0) {
    if (!noResult) {
      noResult = document.createElement('div');
      noResult.id = 'tools-no-result';
      noResult.className = 'tools-no-result';
      noResult.innerHTML = `<div class="icon">🔍</div><p>Nenhuma ferramenta encontrada para "<strong>${query}</strong>"</p>`;
      document.getElementById('tools-grid')?.appendChild(noResult);
    }
  } else {
    noResult?.remove();
  }
}

function filterCat(cat, btn) {
  currentCat = cat;
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  // Reset text filter
  const toolSearch = document.getElementById('tools-search');
  if (toolSearch) toolSearch.value = '';
  currentQuery = '';
  filterToolsGrid('');
}

function filterFromHero(val) {
  const toolsSection = document.getElementById('tools');
  if (!toolsSection) return;
  toolsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(() => {
    const toolSearch = document.getElementById('tools-search');
    if (toolSearch) toolSearch.value = val;
    filterToolsGrid(val);
  }, 700);
}

function initToolsFilter() {
  const input = document.getElementById('tools-search');
  if (!input) return;
  input.addEventListener('input', () => filterToolsGrid(input.value));
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initHeader();
  initCounters();
  createParticles();
  initHeroSearch();
  initToolsFilter();

  // Theme btn
  document.getElementById('theme-btn')?.addEventListener('click', toggleTheme);
});

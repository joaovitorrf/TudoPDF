const TU_TOOLS = [
  { name: 'Organizar PDF', desc: 'Reordene páginas facilmente', cat: 'pdf', tag: 'pdf', mono: 'PDF', url: '/tools/organizar-pdf/', live: true },
  { name: 'Juntar PDF', desc: 'Una vários arquivos em um só', cat: 'pdf', tag: 'pdf', mono: 'PDF', url: '/tools/juntar-pdf/', live: true },
  { name: 'Dividir PDF', desc: 'Separe páginas com precisão', cat: 'pdf', tag: 'pdf', mono: 'PDF', url: '/tools/dividir-pdf/', live: true },
  { name: 'Remover páginas', desc: 'Delete páginas indesejadas', cat: 'pdf', tag: 'pdf', mono: 'PDF', url: '/tools/remover-paginas/', live: true },
  { name: 'Extrair páginas', desc: 'Salve páginas específicas', cat: 'pdf', tag: 'pdf', mono: 'PDF', url: '/tools/extrair-paginas/', live: true },
  { name: 'Digitalizar PDF', desc: 'Transforme fotos em PDF', cat: 'pdf', tag: 'pdf', mono: 'PDF', url: '/tools/digitalizar-pdf/', live: true },
  { name: 'Comprimir PDF', desc: 'Reduza até 80% do tamanho', cat: 'pdf', tag: 'pdf', mono: 'PDF', url: '/tools/comprimir-pdf/', live: true },
  { name: 'Reparar PDF', desc: 'Recupere arquivos corrompidos', cat: 'pdf', tag: 'pdf', mono: 'PDF', url: '/tools/reparar-pdf/', live: true },
  { name: 'OCR em PDF', desc: 'Reconheça texto em imagens', cat: 'pdf', tag: 'pdf', mono: 'PDF', url: '/tools/ocr-pdf/', live: true },
  { name: 'JPG para PDF', desc: 'Imagens viram PDF na hora', cat: 'pdf', tag: 'img', mono: 'IMG', url: '/tools/jpg-para-pdf/', live: true },
  { name: 'Word para PDF', desc: 'Converta .docx com perfeição', cat: 'pdf', tag: 'doc', mono: 'DOC', url: '/tools/word-para-pdf/', live: true },
  { name: 'PowerPoint para PDF', desc: 'Apresentações viram PDF', cat: 'pdf', tag: 'ppt', mono: 'PPT', url: '/tools/powerpoint-para-pdf/', live: true },
  { name: 'Excel para PDF', desc: 'Planilhas com layout preservado', cat: 'pdf', tag: 'xls', mono: 'XLS', url: '/tools/excel-para-pdf/', live: true },
  { name: 'HTML para PDF', desc: 'Páginas web viram documento', cat: 'pdf', tag: 'web', mono: 'WEB', url: '/tools/html-para-pdf/', live: true },
  { name: 'PDF para JPG', desc: 'Exporte páginas como imagem', cat: 'pdf', tag: 'img', mono: 'IMG', url: '/tools/pdf-para-jpg/', live: true },
  { name: 'PDF para Word', desc: 'Edite seu PDF no Word', cat: 'pdf', tag: 'doc', mono: 'DOC', url: '/tools/pdf-para-word/', live: true },
  { name: 'PDF para PowerPoint', desc: 'Transforme conteúdo em slides', cat: 'pdf', tag: 'ppt', mono: 'PPT', url: '/tools/pdf-para-powerpoint/', live: true },
  { name: 'PDF para Excel', desc: 'Tabelas viram planilha editável', cat: 'pdf', tag: 'xls', mono: 'XLS', url: '/tools/pdf-para-excel/', live: true },
  { name: 'PDF para PDF/A', desc: 'Formato de arquivamento padrão', cat: 'pdf', tag: 'pdf', mono: 'PDF', url: '/tools/pdf-para-pdfa/', live: true },
  { name: 'Rodar PDF', desc: 'Corrija a orientação das páginas', cat: 'pdf', tag: 'pdf', mono: 'PDF', url: '/tools/rodar-pdf/', live: true },
  { name: 'Números de página', desc: 'Paginação automática', cat: 'pdf', tag: 'pdf', mono: 'PDF', url: '/tools/numeros-pagina/', live: true },
  { name: 'Marca d\u2019água', desc: 'Proteja e identifique documentos', cat: 'pdf', tag: 'pdf', mono: 'PDF', url: '/tools/marca-dagua/', live: true },
  { name: 'Recortar PDF', desc: 'Ajuste as margens da página', cat: 'pdf', tag: 'pdf', mono: 'PDF', url: '/tools/recortar-pdf/', live: true },
  { name: 'Comparar PDF', desc: 'Encontre diferenças entre versões', cat: 'pdf', tag: 'pdf', mono: 'PDF', url: '/tools/comparar-pdf/', live: true },
  { name: 'Desbloquear PDF', desc: 'Remova senhas de abertura', cat: 'pdf', tag: 'sec', mono: 'SEG', url: '/tools/desbloquear-pdf/', live: true },
  { name: 'Proteger PDF', desc: 'Adicione senha de segurança', cat: 'pdf', tag: 'sec', mono: 'SEG', url: '/tools/proteger-pdf/', live: true },
  { name: 'Assinar PDF', desc: 'Assinatura digital válida', cat: 'pdf', tag: 'sec', mono: 'SEG', url: '/tools/assinar-pdf/', live: true },
  { name: 'Ocultar conteúdo', desc: 'Esconda informações sensíveis', cat: 'pdf', tag: 'sec', mono: 'SEG', url: '/tools/ocultar-pdf/', live: true },

  { name: 'Comprimir JPG', desc: 'Reduza o peso sem perder qualidade', cat: 'imagem', tag: 'img', mono: 'JPG', url: '#', live: false },
  { name: 'Comprimir PNG', desc: 'Otimize imagens com transparência', cat: 'imagem', tag: 'img', mono: 'PNG', url: '#', live: false },
  { name: 'Converter para WebP', desc: 'Imagens mais leves para a web', cat: 'imagem', tag: 'img', mono: 'WEBP', url: '#', live: false },
  { name: 'JPG para PNG', desc: 'Converta entre formatos de imagem', cat: 'imagem', tag: 'img', mono: 'IMG', url: '#', live: false },
  { name: 'Redimensionar imagem', desc: 'Ajuste largura e altura em segundos', cat: 'imagem', tag: 'img', mono: 'IMG', url: '#', live: false },
  { name: 'Cortar imagem', desc: 'Recorte no tamanho que precisar', cat: 'imagem', tag: 'img', mono: 'IMG', url: '#', live: false },
  { name: 'Girar imagem', desc: 'Corrija a orientação da foto', cat: 'imagem', tag: 'img', mono: 'IMG', url: '#', live: false },
  { name: 'Remover metadados da imagem', desc: 'Apague dados EXIF e localização', cat: 'imagem', tag: 'sec', mono: 'SEG', url: '#', live: false },
  { name: 'Redimensionar para Instagram', desc: 'Tamanho certo pra cada formato', cat: 'imagem', tag: 'img', mono: 'IG', url: '#', live: false },
  { name: 'Redimensionar para YouTube', desc: 'Thumbnails no tamanho ideal', cat: 'imagem', tag: 'img', mono: 'YT', url: '#', live: false },
  { name: 'Conversão de imagens em lote', desc: 'Várias imagens de uma vez', cat: 'imagem', tag: 'img', mono: 'IMG', url: '#', live: false },

  { name: 'Gerador de currículo', desc: 'Modelos prontos, exporte em PDF', cat: 'doc', tag: 'doc', mono: 'DOC', url: '#', live: false },
  { name: 'Gerador de recibo', desc: 'Recibo profissional em minutos', cat: 'doc', tag: 'doc', mono: 'DOC', url: '#', live: false },
  { name: 'Gerador de orçamento', desc: 'Proposta comercial pronta pra enviar', cat: 'doc', tag: 'doc', mono: 'DOC', url: '#', live: false },
  { name: 'Gerador de procuração simples', desc: 'Documento pronto, só preencher', cat: 'doc', tag: 'doc', mono: 'DOC', url: '#', live: false },
  { name: 'Gerador de declaração', desc: 'Residência, matrícula e mais', cat: 'doc', tag: 'doc', mono: 'DOC', url: '#', live: false },
  { name: 'Gerador de contrato simples', desc: 'Modelos claros e editáveis', cat: 'doc', tag: 'doc', mono: 'DOC', url: '#', live: false },
  { name: 'Criador de documentos', desc: 'Editor simples direto no navegador', cat: 'doc', tag: 'doc', mono: 'DOC', url: '#', live: false },
  { name: 'Markdown para PDF', desc: 'Do texto simples ao documento final', cat: 'doc', tag: 'doc', mono: 'MD', url: '#', live: false },

  { name: 'Contador de palavras', desc: 'Palavras, caracteres e linhas', cat: 'texto', tag: 'txt', mono: 'TXT', url: '#', live: false },
  { name: 'Remover linhas duplicadas', desc: 'Limpe listas em segundos', cat: 'texto', tag: 'txt', mono: 'TXT', url: '#', live: false },
  { name: 'Remover espaços duplicados', desc: 'Texto limpo e organizado', cat: 'texto', tag: 'txt', mono: 'TXT', url: '#', live: false },
  { name: 'Maiúsculas e minúsculas', desc: 'Converta a caixa do texto', cat: 'texto', tag: 'txt', mono: 'TXT', url: '#', live: false },
  { name: 'Remover acentos', desc: 'Texto sem acentuação', cat: 'texto', tag: 'txt', mono: 'TXT', url: '#', live: false },
  { name: 'Gerar slug', desc: 'URLs amigáveis a partir de um título', cat: 'texto', tag: 'txt', mono: 'TXT', url: '#', live: false },
  { name: 'Gerar Lorem Ipsum', desc: 'Texto de preenchimento sob medida', cat: 'texto', tag: 'txt', mono: 'TXT', url: '#', live: false },
  { name: 'Extrair e-mails e URLs', desc: 'Encontre contatos dentro de um texto', cat: 'texto', tag: 'txt', mono: 'TXT', url: '#', live: false },
  { name: 'Comparar dois textos', desc: 'Veja as diferenças lado a lado', cat: 'texto', tag: 'txt', mono: 'TXT', url: '#', live: false },
  { name: 'Encontrar e substituir', desc: 'Edição em lote de um texto grande', cat: 'texto', tag: 'txt', mono: 'TXT', url: '#', live: false },

  { name: 'Calculadora científica', desc: 'Funções avançadas na palma da mão', cat: 'calc', tag: 'calc', mono: '123', url: '#', live: false },
  { name: 'Porcentagem', desc: 'Aumentos, descontos e proporções', cat: 'calc', tag: 'calc', mono: '%', url: '#', live: false },
  { name: 'Regra de três', desc: 'Simples e composta', cat: 'calc', tag: 'calc', mono: '123', url: '#', live: false },
  { name: 'Juros compostos', desc: 'Simule o crescimento do seu dinheiro', cat: 'calc', tag: 'calc', mono: 'R$', url: '#', live: false },
  { name: 'Calculadora de IMC', desc: 'Índice de massa corporal', cat: 'calc', tag: 'calc', mono: 'IMC', url: '#', live: false },
  { name: 'Idade exata', desc: 'A partir da data de nascimento', cat: 'calc', tag: 'calc', mono: '123', url: '#', live: false },
  { name: 'Dias entre datas', desc: 'Diferença exata entre duas datas', cat: 'calc', tag: 'calc', mono: '31', url: '#', live: false },
  { name: 'Conversor de moedas', desc: 'Câmbio atualizado entre moedas', cat: 'calc', tag: 'calc', mono: 'R$', url: '#', live: false },
  { name: 'Conversor de unidades', desc: 'Peso, comprimento e temperatura', cat: 'calc', tag: 'calc', mono: 'KG', url: '#', live: false },
  { name: 'Horário mundial', desc: 'Compare fusos horários', cat: 'calc', tag: 'calc', mono: '24h', url: '#', live: false },
  { name: 'Contagem regressiva', desc: 'Para datas e eventos importantes', cat: 'calc', tag: 'calc', mono: '24h', url: '#', live: false },

  { name: 'Gerador de QR Code', desc: 'Wi-Fi, contato, URL ou texto', cat: 'web', tag: 'web', mono: 'QR', url: '#', live: false },
  { name: 'Link direto para WhatsApp', desc: 'Sem precisar salvar o contato', cat: 'web', tag: 'web', mono: 'WPP', url: '#', live: false },
  { name: 'Encurtador de URL', desc: 'Links curtos e fáceis de compartilhar', cat: 'web', tag: 'web', mono: 'URL', url: '#', live: false },
  { name: 'Gerador de UTM', desc: 'Rastreie campanhas com precisão', cat: 'web', tag: 'web', mono: 'UTM', url: '#', live: false },
  { name: 'Redimensionador para redes sociais', desc: 'Instagram, TikTok e YouTube', cat: 'web', tag: 'web', mono: 'IMG', url: '#', live: false },
  { name: 'Extrator de domínio', desc: 'Isole o domínio de qualquer link', cat: 'web', tag: 'web', mono: 'URL', url: '#', live: false },

  { name: 'JSON formatter', desc: 'Formate, valide e minifique', cat: 'dev', tag: 'dev', mono: '{ }', url: '#', live: false },
  { name: 'CSV para JSON', desc: 'E o caminho inverso também', cat: 'dev', tag: 'dev', mono: '{ }', url: '#', live: false },
  { name: 'Regex tester', desc: 'Teste expressões regulares ao vivo', cat: 'dev', tag: 'dev', mono: '.*', url: '#', live: false },
  { name: 'JWT decoder', desc: 'Inspecione tokens sem sair do ar', cat: 'dev', tag: 'dev', mono: 'JWT', url: '#', live: false },
  { name: 'Unix timestamp', desc: 'Converta nos dois sentidos', cat: 'dev', tag: 'dev', mono: '123', url: '#', live: false },
  { name: 'HEX para RGB', desc: 'E também RGB, HSL e mais', cat: 'dev', tag: 'dev', mono: '#FF', url: '#', live: false },
  { name: 'Gerador de senha forte', desc: 'Senhas realmente seguras', cat: 'dev', tag: 'sec', mono: 'SEG', url: '#', live: false },
  { name: 'Gerador de UUID', desc: 'Identificadores únicos na hora', cat: 'dev', tag: 'dev', mono: 'ID', url: '#', live: false },
  { name: 'Base64 encoder / decoder', desc: 'Nos dois sentidos, sem instalar nada', cat: 'dev', tag: 'dev', mono: 'B64', url: '#', live: false },
  { name: 'Gerador de hash', desc: 'MD5, SHA-1 e SHA-256', cat: 'dev', tag: 'dev', mono: '#', url: '#', live: false },
];

const TU_CATEGORIES = [
  { id: 'pdf', name: 'PDF', desc: 'Comprimir, juntar, converter e assinar', tag: 'pdf', mono: 'PDF' },
  { id: 'imagem', name: 'Imagens', desc: 'Editar, comprimir e converter', tag: 'img', mono: 'IMG' },
  { id: 'doc', name: 'Documentos', desc: 'Gerar, preencher e transformar', tag: 'doc', mono: 'DOC' },
  { id: 'texto', name: 'Texto', desc: 'Limpar, contar e comparar', tag: 'txt', mono: 'TXT' },
  { id: 'calc', name: 'Cálculos', desc: 'Calculadoras, datas e conversões', tag: 'calc', mono: '123' },
  { id: 'web', name: 'Web', desc: 'QR Code, links e redes sociais', tag: 'web', mono: 'WEB' },
  { id: 'dev', name: 'Dev', desc: 'JSON, regex, hash e tokens', tag: 'dev', mono: '{ }' },
];

const TU_THEME_KEY = 'tudoutil-theme';
const TU_FAVS_KEY = 'tudopdf-favorites';
const TU_HISTORY_KEY = 'tudopdf-history';

function tuApplyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(TU_THEME_KEY, theme);
  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    btn.setAttribute('aria-pressed', theme === 'light');
  });
}

function tuInitTheme() {
  let saved = null;
  try { saved = localStorage.getItem(TU_THEME_KEY); } catch (e) {}
  tuApplyTheme(saved === 'light' ? 'light' : 'dark');
  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      tuApplyTheme(current === 'dark' ? 'light' : 'dark');
    });
  });
}

function tuInitHeader() {
  const header = document.querySelector('.tu-header');
  const backTop = document.querySelector('.tu-back-top');
  const onScroll = () => {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 12);
    if (backTop) backTop.classList.toggle('visible', window.scrollY > 480);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (backTop) backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function tuInitDrawer() {
  const drawer = document.querySelector('.tu-drawer');
  const openBtns = document.querySelectorAll('[data-drawer-open]');
  const closeBtns = document.querySelectorAll('[data-drawer-close]');
  if (!drawer) return;
  const open = () => { drawer.classList.add('is-open'); document.body.classList.add('no-scroll'); };
  const close = () => { drawer.classList.remove('is-open'); document.body.classList.remove('no-scroll'); };
  openBtns.forEach(b => b.addEventListener('click', open));
  closeBtns.forEach(b => b.addEventListener('click', close));
  drawer.querySelector('.tu-drawer-backdrop')?.addEventListener('click', close);
}

let tuToastTimer = null;
function tuToast(message, type) {
  let stack = document.querySelector('.tu-toast-stack');
  if (!stack) {
    stack = document.createElement('div');
    stack.className = 'tu-toast-stack';
    document.body.appendChild(stack);
  }
  const el = document.createElement('div');
  el.className = 'tu-toast' + (type ? ' ' + type : '');
  el.textContent = message;
  stack.appendChild(el);
  setTimeout(() => {
    el.classList.add('leaving');
    setTimeout(() => el.remove(), 200);
  }, 3400);
}
window.showToast = function (msg) { tuToast(msg); };

function tuInitReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;
  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('is-visible'));
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
  items.forEach(el => obs.observe(el));
}

function tuFormatCount(n) {
  if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'mil+';
  return String(n);
}

function tuInitCounters() {
  const nodes = document.querySelectorAll('[data-count-to]');
  if (!nodes.length) return;
  const animate = (el) => {
    const target = parseFloat(el.dataset.countTo);
    if (isNaN(target)) return;
    const suffix = el.dataset.countSuffix || '';
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = tuFormatCount(Math.floor(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = tuFormatCount(target) + suffix;
    };
    requestAnimationFrame(tick);
  };
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { animate(e.target); obs.unobserve(e.target); } });
  }, { threshold: 0.5 });
  nodes.forEach(n => obs.observe(n));
}

function tuInitFaq() {
  document.querySelectorAll('.tu-faq-item').forEach(item => {
    const q = item.querySelector('.tu-faq-q');
    const a = item.querySelector('.tu-faq-a');
    if (!q || !a) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      item.closest('.tu-faq-list')?.querySelectorAll('.tu-faq-item').forEach(other => {
        other.classList.remove('is-open');
        other.querySelector('.tu-faq-a').style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('is-open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });
}

function tuGetFavorites() {
  try { return JSON.parse(localStorage.getItem(TU_FAVS_KEY) || '[]'); } catch (e) { return []; }
}
function tuToggleFavorite(url) {
  const favs = tuGetFavorites();
  const idx = favs.indexOf(url);
  if (idx === -1) { favs.push(url); tuToast('Adicionado aos favoritos'); }
  else { favs.splice(idx, 1); tuToast('Removido dos favoritos'); }
  localStorage.setItem(TU_FAVS_KEY, JSON.stringify(favs));
  document.dispatchEvent(new CustomEvent('tu:favorites-changed'));
  document.querySelectorAll('[data-fav-url="' + CSS.escape(url) + '"]').forEach(btn => {
    btn.classList.toggle('active', favs.includes(url));
  });
  return favs.includes(url);
}
function tuGetHistory() {
  try { return JSON.parse(localStorage.getItem(TU_HISTORY_KEY) || '[]'); } catch (e) { return []; }
}
function tuClearHistory() {
  localStorage.removeItem(TU_HISTORY_KEY);
  document.dispatchEvent(new CustomEvent('tu:history-changed'));
}

function tuToolTileHtml(tool) {
  const fav = tuGetFavorites().includes(tool.url);
  const soon = !tool.live ? '<span class="badge badge-muted" style="position:absolute;top:16px;right:16px">Em breve</span>' : '';
  return '' +
    '<div class="tool-tile' + (!tool.live ? ' is-soon' : '') + '" data-tool-url="' + tool.url + '">' +
      '<div class="tool-tile-top">' +
        '<div class="tool-tile-icon tag-' + tool.tag + '">' + tool.mono + '</div>' +
        (tool.live ? '<button class="tool-tile-fav' + (fav ? ' active' : '') + '" data-fav-url="' + tool.url + '" aria-label="Favoritar" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 17.3l-5.6 3.3 1.5-6.3-4.9-4.2 6.4-.5L12 3.5l2.6 5.9 6.4.5-4.9 4.2 1.5 6.3z" stroke-linejoin="round"/></svg></button>' : '') +
      '</div>' +
      '<div>' +
        '<div class="tool-tile-name">' + tool.name + '</div>' +
        '<div class="tool-tile-desc">' + tool.desc + '</div>' +
      '</div>' +
      soon +
    '</div>';
}

function tuInitToolGrids() {
  document.querySelectorAll('[data-tool-grid]').forEach(grid => {
    const filter = grid.dataset.toolGrid;
    const limit = parseInt(grid.dataset.toolLimit || '0');
    let list = filter === 'all' ? TU_TOOLS : TU_TOOLS.filter(t => t.cat === filter);
    if (filter === 'popular') list = TU_TOOLS.filter(t => t.live).slice(0, limit || 12);
    else if (limit) list = list.slice(0, limit);
    grid.innerHTML = list.map(tuToolTileHtml).join('');
  });
  wireToolTiles();
}

function wireToolTiles() {
  document.querySelectorAll('.tool-tile[data-tool-url]').forEach(tile => {
    const url = tile.dataset.toolUrl;
    if (url === '#') {
      tile.style.cursor = 'default';
      tile.addEventListener('click', (e) => {
        if (e.target.closest('.tool-tile-fav')) return;
        tuToast('Essa ferramenta ainda está a caminho');
      });
    } else {
      tile.style.cursor = 'pointer';
      tile.addEventListener('click', (e) => {
        if (e.target.closest('.tool-tile-fav')) return;
        window.location.href = url;
      });
    }
  });
  document.querySelectorAll('.tool-tile-fav[data-fav-url]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      tuToggleFavorite(btn.dataset.favUrl);
    });
  });
}

function tuNormalize(s) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function tuBuildSearchOverlay() {
  if (document.querySelector('.tu-search-overlay')) return;
  const el = document.createElement('div');
  el.className = 'tu-modal-layer tu-search-overlay';
  el.innerHTML =
    '<div class="tu-modal-backdrop" data-search-close></div>' +
    '<div class="tu-modal tu-search-modal">' +
      '<div class="input-wrap">' +
        '<svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3" stroke-linecap="round"/></svg>' +
        '<input class="input" id="tu-search-input" type="text" placeholder="Buscar entre mais de 80 ferramentas..." autocomplete="off"/>' +
      '</div>' +
      '<div class="tu-search-results" id="tu-search-results"></div>' +
    '</div>';
  document.body.appendChild(el);
  el.querySelectorAll('[data-search-close]').forEach(b => b.addEventListener('click', tuCloseSearch));
  const input = el.querySelector('#tu-search-input');
  input.addEventListener('input', () => tuRunSearch(input.value));
}

function tuRunSearch(query) {
  const box = document.getElementById('tu-search-results');
  if (!box) return;
  const q = tuNormalize(query.trim());
  if (!q) { box.innerHTML = '<div class="tu-search-hint">Digite o nome de uma ferramenta, formato de arquivo ou categoria.</div>'; return; }
  const matches = TU_TOOLS.filter(t => tuNormalize(t.name).includes(q) || tuNormalize(t.desc).includes(q) || tuNormalize(t.cat).includes(q)).slice(0, 8);
  if (!matches.length) { box.innerHTML = '<div class="tu-search-hint">Nada encontrado para \u201c' + query + '\u201d ainda.</div>'; return; }
  box.innerHTML = matches.map(t =>
    '<a class="tu-search-result" href="' + (t.live ? t.url : '#') + '" data-live="' + t.live + '">' +
      '<span class="tool-tile-icon tag-' + t.tag + '" style="width:36px;height:36px;font-size:0.58rem;border-radius:10px">' + t.mono + '</span>' +
      '<span class="tu-search-result-text"><strong>' + t.name + '</strong><small>' + t.desc + '</small></span>' +
      (t.live ? '' : '<span class="badge badge-muted">Em breve</span>') +
    '</a>'
  ).join('');
  box.querySelectorAll('a[data-live="false"]').forEach(a => a.addEventListener('click', (e) => { e.preventDefault(); tuToast('Essa ferramenta ainda está a caminho'); }));
}

function tuOpenSearch() {
  tuBuildSearchOverlay();
  const overlay = document.querySelector('.tu-search-overlay');
  overlay.classList.add('is-open');
  document.body.classList.add('no-scroll');
  tuRunSearch('');
  setTimeout(() => document.getElementById('tu-search-input')?.focus(), 60);
}
function tuCloseSearch() {
  const overlay = document.querySelector('.tu-search-overlay');
  if (!overlay) return;
  overlay.classList.remove('is-open');
  document.body.classList.remove('no-scroll');
}

function tuInitSearch() {
  document.querySelectorAll('[data-search-open]').forEach(b => b.addEventListener('click', tuOpenSearch));
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); tuOpenSearch(); }
    if (e.key === 'Escape') tuCloseSearch();
  });
}

const TU_FILE_ROUTES = {
  pdf: ['juntar-pdf', 'comprimir-pdf', 'dividir-pdf', 'pdf-para-word', 'proteger-pdf', 'assinar-pdf'],
  doc: ['word-para-pdf'], docx: ['word-para-pdf'],
  xls: ['excel-para-pdf'], xlsx: ['excel-para-pdf'],
  ppt: ['powerpoint-para-pdf'], pptx: ['powerpoint-para-pdf'],
  jpg: ['jpg-para-pdf'], jpeg: ['jpg-para-pdf'], png: ['jpg-para-pdf'],
  html: ['html-para-pdf'], htm: ['html-para-pdf'],
};

function tuToolsByUrlSlugs(slugs) {
  return slugs.map(slug => TU_TOOLS.find(t => t.url === '/tools/' + slug + '/')).filter(Boolean);
}

function tuHandleHeroFile(file) {
  const panel = document.getElementById('hero-file-result');
  if (!panel || !file) return;
  const ext = file.name.split('.').pop().toLowerCase();
  const matchSlugs = TU_FILE_ROUTES[ext];
  const sizeKb = file.size / 1024;
  const sizeLabel = sizeKb > 1024 ? (sizeKb / 1024).toFixed(1) + ' MB' : Math.round(sizeKb) + ' KB';
  let bodyHtml;
  if (matchSlugs) {
    const tools = tuToolsByUrlSlugs(matchSlugs);
    bodyHtml = tools.map(t =>
      '<a class="hero-file-suggestion" href="' + t.url + '">' +
        '<span class="tool-tile-icon tag-' + t.tag + '" style="width:38px;height:38px;font-size:0.6rem;border-radius:10px">' + t.mono + '</span>' +
        '<span>' + t.name + '</span>' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;margin-left:auto;opacity:.5"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</a>'
    ).join('');
  } else {
    bodyHtml = '<p class="tu-search-hint" style="padding:14px 4px">Ainda estamos construindo ferramentas para .' + ext + '. Dá uma olhada no catálogo completo enquanto isso.</p>' +
      '<a href="#categorias" class="btn btn-secondary btn-sm">Ver categorias</a>';
  }
  panel.innerHTML =
    '<div class="hero-file-head">' +
      '<div><strong>' + file.name + '</strong><span>' + sizeLabel + '</span></div>' +
      '<button type="button" id="hero-file-clear" class="btn-icon sm" aria-label="Remover arquivo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/></svg></button>' +
    '</div>' +
    '<div class="hero-file-suggestions">' + bodyHtml + '</div>';
  panel.hidden = false;
  document.getElementById('hero-dropzone')?.classList.add('has-file');
  document.getElementById('hero-file-clear')?.addEventListener('click', () => {
    panel.hidden = true;
    panel.innerHTML = '';
    document.getElementById('hero-dropzone')?.classList.remove('has-file');
    const input = document.getElementById('hero-file-input');
    if (input) input.value = '';
  });
}

function tuInitHeroDropzone() {
  const zone = document.getElementById('hero-dropzone');
  const input = document.getElementById('hero-file-input');
  if (!zone || !input) return;
  zone.addEventListener('click', () => input.click());
  input.addEventListener('change', () => { if (input.files[0]) tuHandleHeroFile(input.files[0]); });
  ['dragenter', 'dragover'].forEach(evt => zone.addEventListener(evt, (e) => { e.preventDefault(); zone.classList.add('is-dragover'); }));
  ['dragleave', 'drop'].forEach(evt => zone.addEventListener(evt, (e) => { e.preventDefault(); zone.classList.remove('is-dragover'); }));
  zone.addEventListener('drop', (e) => { const f = e.dataTransfer.files[0]; if (f) tuHandleHeroFile(f); });
}

let tuDeferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  tuDeferredInstallPrompt = e;
  document.querySelectorAll('[data-pwa-install]').forEach(el => el.removeAttribute('hidden'));
  document.dispatchEvent(new CustomEvent('tu:pwa-installable'));
});
window.addEventListener('appinstalled', () => {
  tuDeferredInstallPrompt = null;
  tuToast('TudoUtil instalado com sucesso');
  document.dispatchEvent(new CustomEvent('tu:pwa-installed'));
});
window.tuInstallPWA = async function () {
  if (!tuDeferredInstallPrompt) return false;
  tuDeferredInstallPrompt.prompt();
  const choice = await tuDeferredInstallPrompt.userChoice;
  tuDeferredInstallPrompt = null;
  return choice.outcome === 'accepted';
};
window.tuCanInstallPWA = function () { return !!tuDeferredInstallPrompt; };

function tuRegisterServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

window.TU = {
  tools: TU_TOOLS,
  categories: TU_CATEGORIES,
  toast: tuToast,
  getFavorites: tuGetFavorites,
  toggleFavorite: tuToggleFavorite,
  getHistory: tuGetHistory,
  clearHistory: tuClearHistory,
  toolTileHtml: tuToolTileHtml,
  wireToolTiles: wireToolTiles,
  openSearch: tuOpenSearch,
};

document.addEventListener('DOMContentLoaded', () => {
  tuInitTheme();
  tuInitHeader();
  tuInitDrawer();
  tuInitReveal();
  tuInitCounters();
  tuInitFaq();
  tuInitToolGrids();
  tuInitSearch();
  tuInitHeroDropzone();
  tuRegisterServiceWorker();
});

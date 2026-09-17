/* ==========================================================================
   TUDOUTIL — tu-catalog.js
   Catálogo único de ferramentas. Fonte de verdade para busca, favoritos,
   histórico, sitemap e páginas de categoria.
   Ao criar uma ferramenta nova, adicione UMA linha aqui.
   ========================================================================== */
(function () {
  'use strict';

  var T = function (name, desc, url, tag, mono, live) {
    return { name: name, desc: desc, url: url, tag: tag, mono: mono, live: live !== false };
  };

  var PDF = [
    T('Juntar PDF', 'Una vários arquivos em um só', '/tools/juntar-pdf/', 'pdf', 'PDF'),
    T('Dividir PDF', 'Separe páginas com precisão', '/tools/dividir-pdf/', 'pdf', 'PDF'),
    T('Comprimir PDF', 'Reduza até 80% do tamanho', '/tools/comprimir-pdf/', 'pdf', 'PDF'),
    T('Organizar PDF', 'Reordene páginas arrastando', '/tools/organizar-pdf/', 'pdf', 'PDF'),
    T('Remover páginas', 'Delete páginas indesejadas', '/tools/remover-paginas/', 'pdf', 'PDF'),
    T('Extrair páginas', 'Salve páginas específicas', '/tools/extrair-paginas/', 'pdf', 'PDF'),
    T('Rodar PDF', 'Corrija a orientação das páginas', '/tools/rodar-pdf/', 'pdf', 'PDF'),
    T('Recortar PDF', 'Ajuste as margens da página', '/tools/recortar-pdf/', 'pdf', 'PDF'),
    T('Números de página', 'Paginação automática', '/tools/numeros-pagina/', 'pdf', 'PDF'),
    T('Marca d\u2019água', 'Proteja e identifique documentos', '/tools/marca-dagua/', 'pdf', 'PDF'),
    T('Comparar PDF', 'Encontre diferenças entre versões', '/tools/comparar-pdf/', 'pdf', 'PDF'),
    T('Reparar PDF', 'Recupere arquivos corrompidos', '/tools/reparar-pdf/', 'pdf', 'PDF'),
    T('OCR em PDF', 'Reconheça texto em imagens', '/tools/ocr-pdf/', 'pdf', 'PDF'),
    T('Digitalizar PDF', 'Transforme fotos em documento', '/tools/digitalizar-pdf/', 'pdf', 'PDF'),
    T('PDF para PDF/A', 'Formato de arquivamento padrão', '/tools/pdf-para-pdfa/', 'pdf', 'PDF')
  ];

  var CONV = [
    T('JPG para PDF', 'Imagens viram PDF na hora', '/tools/jpg-para-pdf/', 'img', 'IMG'),
    T('PDF para JPG', 'Exporte páginas como imagem', '/tools/pdf-para-jpg/', 'img', 'IMG'),
    T('Word para PDF', 'Converta .docx com fidelidade', '/tools/word-para-pdf/', 'doc', 'DOC'),
    T('PDF para Word', 'Edite seu PDF no Word', '/tools/pdf-para-word/', 'doc', 'DOC'),
    T('Excel para PDF', 'Planilhas com layout preservado', '/tools/excel-para-pdf/', 'xls', 'XLS'),
    T('PDF para Excel', 'Tabelas viram planilha editável', '/tools/pdf-para-excel/', 'xls', 'XLS'),
    T('PowerPoint para PDF', 'Apresentações viram PDF', '/tools/powerpoint-para-pdf/', 'ppt', 'PPT'),
    T('PDF para PowerPoint', 'Transforme conteúdo em slides', '/tools/pdf-para-powerpoint/', 'ppt', 'PPT'),
    T('HTML para PDF', 'Páginas web viram documento', '/tools/html-para-pdf/', 'web', 'WEB')
  ];

  var SEC = [
    T('Proteger PDF', 'Adicione senha de segurança', '/tools/proteger-pdf/', 'sec', 'SEG'),
    T('Desbloquear PDF', 'Remova senhas de abertura', '/tools/desbloquear-pdf/', 'sec', 'SEG'),
    T('Assinar PDF', 'Assinatura digital no documento', '/tools/assinar-pdf/', 'sec', 'SEG'),
    T('Ocultar conteúdo', 'Esconda informações sensíveis', '/tools/ocultar-pdf/', 'sec', 'SEG')
  ];

  var DOCS = [
    T('Gerador de currículo', 'Modelos prontos, exporte em PDF', '/tools/gerador-de-curriculo/', 'doc', 'DOC'),
    T('Gerador de recibo', 'Recibo profissional em minutos', '/tools/gerador-de-recibo/', 'doc', 'DOC'),
    T('Gerador de orçamento', 'Proposta comercial pronta', '/tools/gerador-de-orcamento/', 'doc', 'DOC'),
    T('Gerador de contrato', 'Modelos claros e editáveis', '/tools/gerador-de-contrato/', 'doc', 'DOC'),
    T('Gerador de procuração', 'Documento pronto, só preencher', '/tools/gerador-de-procuracao/', 'doc', 'DOC'),
    T('Gerador de declaração', 'Declaração simples e válida', '/tools/gerador-de-declaracao/', 'doc', 'DOC'),
    T('Declaração de residência', 'Comprovante em um minuto', '/tools/gerador-de-declaracao-residencia/', 'doc', 'DOC'),
    T('Gerador de autorização', 'Autorização de viagem e mais', '/tools/gerador-de-autorizacao/', 'doc', 'DOC'),
    T('Gerador de requerimento', 'Requerimento formal pronto', '/tools/gerador-de-requerimento/', 'doc', 'DOC'),
    T('Carta de apresentação', 'Destaque-se na vaga', '/tools/gerador-de-carta-apresentacao/', 'doc', 'DOC'),
    T('Ficha cadastral', 'Cadastro de clientes pronto', '/tools/gerador-de-ficha-cadastral/', 'doc', 'DOC'),
    T('Documento personalizado', 'Monte do zero e exporte', '/tools/gerador-de-documento-personalizado/', 'doc', 'DOC')
  ];

  /* Ferramentas de imagem: em produção. Ficam visíveis no site para
     capturar busca e lista de espera. */
  var IMG = [
    T('Comprimir JPG', 'Reduza o peso sem perder qualidade', '/imagens/', 'img', 'JPG', false),
    T('Comprimir PNG', 'Otimize imagens com transparência', '/imagens/', 'img', 'PNG', false),
    T('Converter para WebP', 'Imagens mais leves para a web', '/imagens/', 'img', 'WEBP', false),
    T('JPG para PNG', 'Converta entre formatos', '/imagens/', 'img', 'PNG', false),
    T('PNG para JPG', 'Reduza o peso com fundo branco', '/imagens/', 'img', 'JPG', false),
    T('Redimensionar imagem', 'Ajuste largura e altura', '/imagens/', 'img', 'IMG', false),
    T('Cortar imagem', 'Recorte no tamanho que precisar', '/imagens/', 'img', 'IMG', false),
    T('Girar imagem', 'Corrija a orientação da foto', '/imagens/', 'img', 'IMG', false),
    T('Remover metadados', 'Apague EXIF e localização', '/imagens/', 'sec', 'SEG', false),
    T('Converter em lote', 'Várias imagens de uma vez', '/imagens/', 'img', 'IMG', false)
  ];

  var ALL = PDF.concat(CONV, SEC, DOCS, IMG);

  var CATS = [
    { id: 'pdf',  name: 'Editar PDF',   desc: 'Juntar, dividir, comprimir e organizar', tools: PDF,  mono: 'PDF' },
    { id: 'conv', name: 'Converter',    desc: 'Word, Excel, PowerPoint, JPG e HTML',   tools: CONV, mono: 'CNV' },
    { id: 'sec',  name: 'Segurança',    desc: 'Senha, assinatura e tarja preta',        tools: SEC,  mono: 'SEG' },
    { id: 'doc',  name: 'Documentos',   desc: 'Currículo, recibo, contrato e mais',     tools: DOCS, mono: 'DOC' },
    { id: 'img',  name: 'Imagens',      desc: 'Comprimir, converter e redimensionar',   tools: IMG,  mono: 'IMG' }
  ];

  function byUrl(url) {
    for (var i = 0; i < ALL.length; i++) if (ALL[i].url === url) return ALL[i];
    return null;
  }

  function norm(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  /* Busca tolerante: acha "juntar pdf" digitando "unir", "merge", "mesclar" */
  var ALIASES = {
    'juntar': ['unir', 'mesclar', 'merge', 'combinar', 'somar'],
    'dividir': ['separar', 'split', 'quebrar', 'partir'],
    'comprimir': ['reduzir', 'diminuir', 'compactar', 'leve', 'tamanho'],
    'proteger': ['senha', 'password', 'bloquear', 'criptografar'],
    'desbloquear': ['remover senha', 'tirar senha', 'unlock'],
    'assinar': ['assinatura', 'firma', 'sign'],
    'ocr': ['texto', 'reconhecer', 'escanear texto', 'digitalizado'],
    'jpg': ['jpeg', 'foto', 'imagem'],
    'word': ['docx', 'doc', 'texto'],
    'excel': ['xlsx', 'planilha', 'tabela'],
    'powerpoint': ['pptx', 'slide', 'apresentacao'],
    'curriculo': ['cv', 'resume'],
    'marca-dagua': ['watermark', 'marca d agua', 'carimbo']
  };

  function search(q, max) {
    var nq = norm(q).trim();
    if (!nq) return [];
    var terms = nq.split(/\s+/);
    var scored = [];
    ALL.forEach(function (t) {
      var hay = norm(t.name + ' ' + t.desc + ' ' + t.url);
      var extra = '';
      for (var k in ALIASES) if (t.url.indexOf(k) !== -1 || norm(t.name).indexOf(k) !== -1) extra += ' ' + norm(ALIASES[k].join(' '));
      hay += extra;
      var score = 0;
      terms.forEach(function (term) {
        if (norm(t.name).indexOf(term) === 0) score += 12;
        else if (norm(t.name).indexOf(term) !== -1) score += 8;
        else if (hay.indexOf(term) !== -1) score += 3;
      });
      if (score > 0) { if (t.live) score += 2; scored.push({ t: t, s: score }); }
    });
    return scored.sort(function (a, b) { return b.s - a.s; })
                 .slice(0, max || 8)
                 .map(function (x) { return x.t; });
  }

  window.TU_CATALOG = {
    all: ALL, pdf: PDF, convert: CONV, security: SEC, docs: DOCS, images: IMG,
    categories: CATS, byUrl: byUrl, search: search, norm: norm,
    liveCount: ALL.filter(function (t) { return t.live; }).length
  };

  // Compatibilidade com o código antigo
  window.TU_TOOLS = ALL.map(function (t) {
    return { name: t.name, desc: t.desc, url: t.url, tag: t.tag, mono: t.mono, live: t.live, cat: t.tag };
  });
})();

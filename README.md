# TudoPDF 🗜️

Plataforma de ferramentas PDF online — gratuita, rápida e segura.

## 📁 Estrutura do Projeto

```
tudopdf/
├── index.html              ← Página inicial (home)
├── vercel.json             ← Config do Vercel (URLs limpas, cache, headers)
├── assets/
│   ├── css/
│   │   └── style.css       ← CSS global (header, footer, home, tool page layout)
│   └── js/
│       └── main.js         ← JS global (tema, busca, filtros, animações)
└── tools/
    ├── _template/
    │   └── index.html      ← TEMPLATE BASE — copie este para criar novas ferramentas
    ├── comprimir-pdf/
    │   └── index.html      ← ✅ Ferramenta funcional (exemplo)
    └── [nova-ferramenta]/
        └── index.html      ← Suas próximas ferramentas ficam aqui
```

---

## 🚀 Como adicionar uma nova ferramenta

### Passo 1 — Criar a pasta
```bash
mkdir tools/nome-da-ferramenta
```

### Passo 2 — Copiar o template
```bash
cp tools/_template/index.html tools/nome-da-ferramenta/index.html
```

### Passo 3 — Editar o template
Abra `tools/nome-da-ferramenta/index.html` e procure pelos comentários `🔧 EDITE`:

- **Título e meta description** (linha ~6)
- **Canonical URL** (linha ~9) → ex: `https://tudopdf.com.br/tools/nome-da-ferramenta/`
- **Breadcrumb** → substitua `NOME DA FERRAMENTA`
- **Conteúdo da ferramenta** → cole seu HTML/JS dentro da `div.tool-ui-wrap`

### Passo 4 — Registrar no index.html
Localize o `#tools-grid` no `index.html` e adicione o card:

```html
<a class="tool-card" data-cat="CATEGORIA" data-name="palavras de busca" href="/tools/nome-da-ferramenta/">
  <div class="tool-icon">EMOJI</div>
  <div class="tool-name">Nome da Ferramenta</div>
  <div class="tool-desc">Descrição curta</div>
  <!-- Remova o soon-badge quando a ferramenta estiver pronta -->
  <span class="soon-badge">Em breve</span>
</a>
```

**Categorias disponíveis:** `organizar` | `converter` | `editar` | `seguranca`

### Passo 5 — Registrar no main.js (para busca)
No array `TOOLS` em `assets/js/main.js`, adicione:

```js
{ name: 'Nome da Ferramenta', icon: 'EMOJI', cat: 'CATEGORIA', url: '/tools/nome-da-ferramenta/', desc: 'Descrição', live: true },
```

Mude `live: false` para `live: true` quando a ferramenta estiver funcional.

### Passo 6 — Deploy
```bash
git add .
git commit -m "feat: add nome-da-ferramenta"
git push
```
O Vercel faz deploy automático! ✅

---

## 🎨 Estilos da ferramenta

Cada ferramenta pode ter seus próprios estilos no `<style>` do próprio arquivo.
Isso **não conflita** com o CSS global do site.

```html
<style>
  /* Seus estilos ficam aqui — isolados */
  .minha-ferramenta { ... }
</style>
```

Você pode usar as variáveis CSS do site (`var(--blue)`, `var(--card-bg)`, etc.)
para manter a identidade visual.

---

## 🌐 Deploy no Vercel

1. Suba o projeto no GitHub
2. Acesse [vercel.com](https://vercel.com) → **New Project**
3. Importe o repositório
4. **Framework Preset:** `Other` (sem framework)
5. **Root Directory:** `/` (raiz)
6. Clique em **Deploy** ✅

As URLs limpas já estão configuradas no `vercel.json`:
- `/tools/comprimir-pdf` → `/tools/comprimir-pdf/index.html`

---

## 📝 Variáveis CSS disponíveis

| Variável | Uso |
|----------|-----|
| `--blue` | Cor principal (#007BFF) |
| `--blue-dark` | Hover do azul (#0056b3) |
| `--blue-light` | Background azul claro (#e8f2ff) |
| `--text` | Texto principal |
| `--text-muted` | Texto secundário |
| `--card-bg` | Fundo dos cards |
| `--gray-1` | Fundo de página |
| `--gray-2` | Bordas |
| `--radius` | Border radius padrão (16px) |
| `--shadow-sm/md/lg` | Sombras |
| `--transition` | Transição padrão |

---

## 📋 Ferramentas planejadas

| Ferramenta | Status |
|------------|--------|
| Comprimir PDF | ✅ Online |
| Juntar PDF | 🔜 Em breve |
| Dividir PDF | 🔜 Em breve |
| WORD para PDF | 🔜 Em breve |
| ... | ... |

---

Feito com ❤️ para o TudoPDF

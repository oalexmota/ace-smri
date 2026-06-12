/* =====================================================
   ACE — Auth helper  (js/auth.js)
   Inclua em todas as páginas protegidas:
   <script src="/js/auth.js"></script>
   Depois chame: const user = await ACE_AUTH.check();
===================================================== */

/* Mapa de páginas rastreáveis */
const ACE_PAGE_MAP = {
  '/gerar-prisma':          { label: 'Gerar Prisma',          ico: '🪪' },
  '/lista-prismas':         { label: 'Lista de Prismas',       ico: '📋' },
  '/gerar-mesa':            { label: 'Gerar Mesa',             ico: '🪑' },
  '/gerar-comboio':         { label: 'Gerar Comboio',          ico: '🚌' },
  '/contribuintes-ramais':  { label: 'Colaboradores / Ramais', ico: '📞' },
  '/links-uteis':           { label: 'Links Úteis',            ico: '🔗' },
  '/assinatura':            { label: 'Gerar Assinatura',       ico: '✍️' },
};

const ACE_AUTH = {

  get token() { return localStorage.getItem("ace_token"); },
  get user()  { try { return JSON.parse(localStorage.getItem("ace_user")); } catch(e){ return null; } },

  /* Cabeçalhos padrão para fetch autenticado */
  headers(extra = {}) {
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.token}`,
      ...extra
    };
  },

  /* Verifica sessão com o servidor e retorna o usuário.
     Se inválido, redireciona para /login. */
  async check() {
    if (!this.token) { this._redirect(); return null; }
    try {
      const r = await fetch("/api/auth/me", {
        headers: { "Authorization": `Bearer ${this.token}` }
      });
      const j = await r.json();
      if (!j.sucesso) { this._redirect(); return null; }
      localStorage.setItem("ace_user", JSON.stringify(j.user));
      return j.user;
    } catch(e) {
      this._redirect();
      return null;
    }
  },

  /* Logout — invalida token no servidor */
  async logout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Authorization": `Bearer ${this.token}` }
      });
    } catch(e) { /* silencioso */ }
    this._redirect();
  },

  _redirect() {
    localStorage.removeItem("ace_token");
    localStorage.removeItem("ace_user");
    window.location.href = "/login";
  },

  /* Helpers de permissão */
  canEditColaboradores() { const u = this.user; return u && (u.role === "rh" || u.role === "ti"); },
  canEditSharedLinks()   { const u = this.user; return u && u.role === "ti"; },
  isTi()                 { const u = this.user; return u && u.role === "ti"; },
  isRh()                 { const u = this.user; return u && u.role === "rh"; },

  /* Registra clique na página atual (fire-and-forget) */
  trackClick(page) {
    if (!page || !this.token) return;
    fetch("/api/analytics/click", {
      method:  "POST",
      headers: this.headers(),
      body:    JSON.stringify({ page })
    }).catch(() => {});
  },

  /* ────────────────────────────────────────────────
     renderNavbar(pageTitle)
     Injeta a navbar fixa no topo do body.
     Deve ser chamado após ACE_AUTH.check() retornar.
  ──────────────────────────────────────────────── */
  renderNavbar(pageTitle) {
    const u = this.user;
    if (!u) return;

    const firstName  = u.nome.split(" ")[0];
    const roleLabel  = u.role === "ti" ? "TI" : u.role === "rh" ? "RH" : "Usuário";
    const roleBadge  = u.role !== "user" ? ` · ${roleLabel}` : "";

    const isHome = window.location.pathname === '/' || window.location.pathname === '/index.html';

    const nav = document.createElement("nav");
    nav.className = "ace-navbar";
    nav.id = "aceNavbar";
    nav.innerHTML = `
      <a href="/" class="ace-nav-brand">
        <img src="/img/logo-prefeitura.png" class="ace-nav-logo" alt="ACE"
             onerror="this.style.display='none'">
        <span>ACE</span>
      </a>
      <div class="ace-nav-divider"></div>
      <span class="ace-nav-page">${pageTitle || ''}</span>
      <div class="ace-nav-user" id="aceNavUserMenu">
        <button class="ace-nav-user-btn" id="aceNavUserBtn" type="button">
          👤 ${firstName}${roleBadge}
          <span class="ace-nav-caret" id="aceNavCaret">▾</span>
        </button>
        <div class="ace-nav-dropdown" id="aceNavDropdown">
          <div class="ace-nav-dd-info">
            <div class="ace-nav-dd-name">${u.nome}</div>
            <div class="ace-nav-dd-role">${roleLabel} — ${u.username}</div>
          </div>
          <button class="ace-nav-dd-btn" onclick="ACE_AUTH.logout()">
            🚪 Sair
          </button>
        </div>
      </div>`;

    document.body.insertBefore(nav, document.body.firstChild);

    /* Botão "Início" alinhado à direita do cabeçalho da página */
    if (!isHome) {
      const firstContainer = document.querySelector('body > div');
      if (firstContainer) {
        // Procura o primeiro div.mb-4 filho direto (bloco de título de cada página)
        const titleDiv = Array.from(firstContainer.children)
          .find(el => el.classList.contains('mb-4'));
        if (titleDiv) {
          titleDiv.style.display = 'flex';
          titleDiv.style.justifyContent = 'space-between';
          titleDiv.style.alignItems = 'center';
          // Envolve o conteúdo existente (h1 + p) num div interno
          const inner = document.createElement('div');
          while (titleDiv.firstChild) inner.appendChild(titleDiv.firstChild);
          titleDiv.appendChild(inner);
          // Botão à direita
          const btnDiv = document.createElement('div');
          btnDiv.style.flexShrink = '0';
          btnDiv.innerHTML = `<a href="/" class="ace-btn-voltar">Voltar</a>`;
          titleDiv.appendChild(btnDiv);
        }
      }
    }

    /* Toggle dropdown */
    const btn      = document.getElementById("aceNavUserBtn");
    const dropdown = document.getElementById("aceNavDropdown");
    const caret    = document.getElementById("aceNavCaret");

    btn.addEventListener("click", e => {
      e.stopPropagation();
      const open = dropdown.classList.toggle("open");
      caret.classList.toggle("open", open);
    });

    document.addEventListener("click", () => {
      dropdown.classList.remove("open");
      caret.classList.remove("open");
    });

    /* Rastreia clique da página atual automaticamente */
    const path = window.location.pathname;
    if (ACE_PAGE_MAP[path]) {
      this.trackClick(path);
    }
  },

  /* Legado: mantido para compatibilidade, agora chama renderNavbar */
  renderHeader(pageTitle) {
    this.renderNavbar(pageTitle || document.title || '');
  }
};

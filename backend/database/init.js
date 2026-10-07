const db = require("./db");

/* =====================================================
   SEED DATA — COLABORADORES
===================================================== */
const SEED_COLABORADORES = [
  {nome:"Alexander Cavalcanti Mota",ramal:"8527",cargo:"Estagiário - T.I",niver:"19/nov",email:"alexmota"}
];

/* =====================================================
   SEED DATA — LINKS COMPARTILHADOS
===================================================== */
const SEED_LINKS = [
  {name:"SEI — Sistema Eletrônico de Informações",url:"https://sei.prefeitura.sp.gov.br",descricao:"Gestão de documentos e processos eletrônicos",cat:"Sistemas",ico:"📄"},
  {name:"SIGPEC",url:"https://sigpec.prefeitura.sp.gov.br",descricao:"Sistema de Gestão de Pessoas e Competências",cat:"Sistemas",ico:"👥"},
  {name:"E-mail Corporativo (Outlook)",url:"https://outlook.cloud.microsoft/mail/inbox",descricao:"Outlook — prefeitura.sp.gov.br",cat:"Sistemas",ico:"📧"},
  {name:"Pacote Office 365",url:"https://m365.cloud.microsoft/apps",descricao:"Word, Excel, PowerPoint e demais apps",cat:"Sistemas",ico:"💼"},
  {name:"Impressora Colorida",url:"https://10.13.56.52/",descricao:"Acesso ao painel da impressora colorida",cat:"Impressoras",ico:"🖨️"},
  {name:"Impressora Mono",url:"https://10.13.56.50/",descricao:"Acesso ao painel da impressora mono",cat:"Impressoras",ico:"🖨️"},
  {name:"Impressora Mono — Adm",url:"https://10.13.56.16/",descricao:"Acesso ao painel da impressora mono (adm)",cat:"Impressoras",ico:"🖨️"},
  {name:"Prefeitura SP — SMRI",url:"https://prefeitura.sp.gov.br/relacoes_internacionais",descricao:"Página oficial da SMRI",cat:"Portais",ico:"🌐"},
  {name:"Instagram @spinternacional",url:"https://www.instagram.com/spinternacional",descricao:"Perfil oficial da SMRI no Instagram",cat:"Portais",ico:"📸"},
  {name:"Diário Oficial",url:"https://diariooficial.prefeitura.sp.gov.br",descricao:"Publicações oficiais do município",cat:"Portais",ico:"📰"},
  {name:"Portal da Transparência",url:"https://transparencia.prefeitura.sp.gov.br",descricao:"Dados abertos e transparência pública",cat:"Portais",ico:"🔍"},{name:"Pimaco — Etiquetas",url:"https://www.pimaco.com.br/",descricao:"Modelos de etiquetas para impressão",cat:"Materiais",ico:"🏷️"}
];

/* =====================================================
   SEED DATA — USUÁRIOS
   role: 'ti' | 'rh' | 'user'
===================================================== */
const SEED_USUARIOS = [
{username: "t123456", nome: "Perfil Teste", role: "user", genero: "M" }
];

/* =====================================================
   TABLE CREATION & MIGRATION
===================================================== */
db.serialize(() => {

  // ── Prismas ──────────────────────────────────────
  db.run(`CREATE TABLE IF NOT EXISTS prismas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT, cargo TEXT, empresa TEXT,
    tipo_prisma TEXT NOT NULL, imagem TEXT,
    escala_nome INTEGER DEFAULT 0, escala_cargo INTEGER DEFAULT 0, escala_empresa INTEGER DEFAULT 0,
    criado_em TEXT
  )`);
  const alteracoes = [
    `ALTER TABLE prismas ADD COLUMN escala_nome INTEGER DEFAULT 0`,
    `ALTER TABLE prismas ADD COLUMN escala_cargo INTEGER DEFAULT 0`,
    `ALTER TABLE prismas ADD COLUMN escala_empresa INTEGER DEFAULT 0`,
    `ALTER TABLE prismas ADD COLUMN criado_em TEXT`,
    `ALTER TABLE prismas ADD COLUMN nome_arquivo TEXT DEFAULT ''`
  ];
  alteracoes.forEach(sql => {
    db.run(sql, err => {
      if (err && !err.message.includes("duplicate column name"))
        console.error("Migração prismas:", err.message);
    });
  });
  console.log("Tabela prismas verificada.");

  // ── Usuários ─────────────────────────────────────
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    nome     TEXT NOT NULL,
    role     TEXT NOT NULL DEFAULT 'user',
    genero   TEXT NOT NULL DEFAULT 'M'
  )`, err => {
    if (err) { console.error("Erro usuarios:", err.message); return; }
    // Migração: adiciona coluna genero se ainda não existir, depois popula
    db.run(`ALTER TABLE usuarios ADD COLUMN genero TEXT NOT NULL DEFAULT 'M'`, alterErr => {
      if (alterErr && !alterErr.message.includes("duplicate column name")) {
        console.error("Migração genero:", alterErr.message);
      }
      // Só consulta/insere APÓS a coluna estar garantida
      db.get("SELECT COUNT(*) AS cnt FROM usuarios", (err2, row) => {
        if (err2 || row.cnt > 0) {
          // Atualiza genero para todos os usuários existentes com os valores corretos
          const stmtUp = db.prepare("UPDATE usuarios SET genero=? WHERE username=?");
          SEED_USUARIOS.forEach(u => stmtUp.run(u.genero, u.username));
          stmtUp.finalize(() => console.log("Genero dos usuários atualizado."));
          return;
        }
        // Primeira vez: insere todos com genero
        const stmt = db.prepare("INSERT INTO usuarios (username, nome, role, genero) VALUES (?,?,?,?)");
        SEED_USUARIOS.forEach(u => stmt.run(u.username, u.nome, u.role, u.genero));
        stmt.finalize(() => console.log(`Usuários: ${SEED_USUARIOS.length} registros semeados.`));
      });
    });
  });

  // ── Sessões ───────────────────────────────────────
  db.run(`CREATE TABLE IF NOT EXISTS sessoes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL,
    token      TEXT NOT NULL UNIQUE,
    expires_em TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
  )`, err => {
    if (err) console.error("Erro sessoes:", err.message);
    else console.log("Tabela sessoes verificada.");
  });

  // ── Colaboradores ─────────────────────────────────
  db.run(`CREATE TABLE IF NOT EXISTS colaboradores (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    nome  TEXT NOT NULL DEFAULT '',
    ramal TEXT DEFAULT '',
    cargo TEXT DEFAULT '',
    niver TEXT DEFAULT '',
    email TEXT DEFAULT ''
  )`, err => {
    if (err) { console.error("Erro colaboradores:", err.message); return; }
    db.get("SELECT COUNT(*) AS cnt FROM colaboradores", (err2, row) => {
      if (err2 || row.cnt > 0) return;
      const stmt = db.prepare("INSERT INTO colaboradores (nome,ramal,cargo,niver,email) VALUES (?,?,?,?,?)");
      SEED_COLABORADORES.forEach(c => stmt.run(c.nome,c.ramal||'',c.cargo||'',c.niver||'',c.email||''));
      stmt.finalize(() => console.log(`Colaboradores: ${SEED_COLABORADORES.length} registros semeados.`));
    });
  });

  // ── Links compartilhados ──────────────────────────
  db.run(`CREATE TABLE IF NOT EXISTS links (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT NOT NULL DEFAULT '',
    url       TEXT NOT NULL DEFAULT '',
    descricao TEXT DEFAULT '',
    cat       TEXT DEFAULT 'Outros',
    ico       TEXT DEFAULT '🔗'
  )`, err => {
    if (err) { console.error("Erro links:", err.message); return; }
    db.get("SELECT COUNT(*) AS cnt FROM links", (err2, row) => {
      if (err2 || row.cnt > 0) return;
      const stmt = db.prepare("INSERT INTO links (name,url,descricao,cat,ico) VALUES (?,?,?,?,?)");
      SEED_LINKS.forEach(l => stmt.run(l.name,l.url,l.descricao||'',l.cat||'Outros',l.ico||'🔗'));
      stmt.finalize(() => console.log(`Links: ${SEED_LINKS.length} registros semeados.`));
    });
  });

  // ── Links pessoais ────────────────────────────────
  db.run(`CREATE TABLE IF NOT EXISTS links_pessoais (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id   INTEGER NOT NULL,
    name      TEXT NOT NULL DEFAULT '',
    url       TEXT NOT NULL DEFAULT '',
    descricao TEXT DEFAULT '',
    cat       TEXT DEFAULT 'Meus Links',
    ico       TEXT DEFAULT '🔗',
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
  )`, err => {
    if (err) console.error("Erro links_pessoais:", err.message);
    else console.log("Tabela links_pessoais verificada.");
  });

  // ── Cliques de página (analytics) ────────────────
  db.run(`CREATE TABLE IF NOT EXISTS page_clicks (
    user_id INTEGER NOT NULL,
    page    TEXT    NOT NULL,
    count   INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (user_id, page),
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
  )`, err => {
    if (err) console.error("Erro page_clicks:", err.message);
    else console.log("Tabela page_clicks verificada.");
  });

});

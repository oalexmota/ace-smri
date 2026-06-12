const db = require("./db");

/* =====================================================
   SEED DATA — COLABORADORES
===================================================== */
const SEED_COLABORADORES = [
  {nome:"Airton Estevens Soares Filho",ramal:"8418",cargo:"Assessor de Relações Institucionais",niver:"12/jun",email:"airtonesf"},
  {nome:"Alexander Cavalcanti Mota",ramal:"8527",cargo:"Estagiário - T.I",niver:"19/nov",email:"alexmota"},
  {nome:"Alice Mendonça Ikeda",ramal:"8544",cargo:"Cerimonial",niver:"20/ago",email:"alice.ikeda"},
  {nome:"André Drumond Ortega Filho",ramal:"8551",cargo:"Coord. de Coop. para Desenvol. Sustentável",niver:"19/mai",email:"andreortega"},
  {nome:"Angela Maria Moreira",ramal:"8511",cargo:"Cerimonial",niver:"01/jul",email:"ammoreira"},
  {nome:"Angela Vidal Gandra da S. Martins",ramal:"8531",cargo:"Secretária de Relações Internacionais",niver:"09/fev",email:"angelag"},
  {nome:"Bernardo Augusto Santos de Faria",ramal:"8526",cargo:"CAIM - Coord. Assuntos Inter Multilaterais e Redes Cidades",niver:"07/jan",email:"baugusto"},
  {nome:"Bernardo Barreto",ramal:"8225",cargo:"Assessor de Relações Institucionais",niver:"06/fev",email:"bernardoarreto"},
  {nome:"Brenda Rodrigues de Carvalho",ramal:"",cargo:"CAIB - Coord. Assuntos Internacionais Bilaterais",niver:"",email:""},
  {nome:"Camila Gomes de Assis",ramal:"8549",cargo:"Coordenadora Geral",niver:"21/fev",email:"cgassis"},
  {nome:"Camila Regina Costa de Carvalho",ramal:"8529",cargo:"Coordenadora de CPAF",niver:"20/out",email:"camilac"},
  {nome:"Claudia Bernardo Moreira",ramal:"8562",cargo:"CPAF - Afastamentos",niver:"08/jul",email:"cbmoreira"},
  {nome:"Claudia C. Miciano de Oliveira",ramal:"9327",cargo:"RH - Divisão de Gestão de Pessoas",niver:"28/dez",email:"cmiciano"},
  {nome:"Emerson Mota Santana",ramal:"9414",cargo:"Assessoria do Gabinete",niver:"21/mar",email:"emsantana"},
  {nome:"Felipe Dalberto Dutra da Silva",ramal:"8678",cargo:"CPAF - Coordenadoria de Planejamento",niver:"08/mar",email:"fdalberto"},
  {nome:"Fernando de Oliveira Leme",ramal:"8127",cargo:"Relações Institucionais",niver:"04/abr",email:"fernandoleme"},
  {nome:"Fernando Ferreira dos Santos",ramal:"8679",cargo:"Chefe de Gabinete",niver:"27/mai",email:"ferferreira"},
  {nome:"Francielly Regina Rosa Filgueira",ramal:"8422",cargo:"Assessoria de Comunicação",niver:"10/nov",email:"frrosa"},
  {nome:"Giovana Bueno Macedo",ramal:"8292",cargo:"Assessoria Jurídica",niver:"10/abr",email:"gbmacedo"},
  {nome:"Giovanna Maroun D'Angelo Saab",ramal:"8182",cargo:"Assessoria de Comunicação",niver:"29/mai",email:"giovannasaab"},
  {nome:"Gustavo Henrique Pina de Azevedo",ramal:"8530",cargo:"CPAF - Coordenadoria de Planejamento",niver:"07/dez",email:"gustavopina"},
  {nome:"Gustavo Plaster Seripieri",ramal:"8524",cargo:"CAIB - Coord. Assuntos Internacionais Bilaterais",niver:"12/abr",email:"gplaster"},
  {nome:"João Lucas Melonio",ramal:"8650",cargo:"CAIM - Coord. Assuntos Inter Multilaterais e Redes Cidades",niver:"03/jan",email:"joaomelonio"},
  {nome:"Laura Lotito",ramal:"8429",cargo:"Estagiária - Assessoria de Comunicação",niver:"09/dez",email:"lauralotito"},
  {nome:"Leon Rogerio G. de Carvalho",ramal:"9455",cargo:"Procurador",niver:"25/out",email:"leoncarvalho"},
  {nome:"Lucas Roberto Paredes dos Santos",ramal:"8523",cargo:"Coord. de Coop. para Desenvol. Sustentável",niver:"",email:"lrpsantos"},
  {nome:"Luis Fernando Bevilacqua",ramal:"8532",cargo:"CAIM - Coord. Assuntos Inter Multilaterais e Redes Cidades",niver:"02/set",email:"lfbevilaqcua"},
  {nome:"Luisa Santos Gois",ramal:"8517",cargo:"CAIM - Coord. Assuntos Inter Multilaterais e Redes Cidades",niver:"09/dez",email:"luisagois"},
  {nome:"Luiza de Carvalho B. Debrassi",ramal:"8520",cargo:"Coord. de Coop. para Desenvol. Sustentável",niver:"18/abr",email:"luizadebrassi"},
  {nome:"Marcella de Negreiros Almeida",ramal:"9131",cargo:"Assessoria Jurídica",niver:"08/jun",email:"mnalmeida"},
  {nome:"Maria Antonia Segalla",ramal:"8550",cargo:"Estagiária - CAIM - Coord. Assuntos Inter Multilaterais e Redes Cidades",niver:"18/abr",email:"mariaacs"},
  {nome:"Maria Eduarda Furtado",ramal:"8536",cargo:"Estagiário - CAIB",niver:"14/jul",email:"mariaeduarda"},
  {nome:"Matheus de Sousa Moura",ramal:"8587",cargo:"Recursos Humanos",niver:"30/ago",email:"matheussm"},
  {nome:"Miguel de Oliveira",ramal:"",cargo:"Estagiário - Cerimonial",niver:"01/jan",email:"migueloas"},
  {nome:"Milla Hosken Granado Brandão",ramal:"8554",cargo:"CAIB - Coord. Assuntos Internacionais Bilaterais",niver:"21/mar",email:"millabrandao"},
  {nome:"Patricia dos Santos Sueza",ramal:"8654",cargo:"Chefe de Assessoria de Comunicação",niver:"09/dez",email:"patriciasueza"},
  {nome:"Patrick Sugahara do Nascimento",ramal:"8566",cargo:"Coord. de Coop. para Desenvol. Sustentável",niver:"04/jul",email:"patrickssn"},
  {nome:"Paula Pereira Garcia",ramal:"8648",cargo:"CAIB - Coord. Assuntos Internacionais Bilaterais",niver:"03/ago",email:"paulagarcia"},
  {nome:"Pedro Henrique Rocha",ramal:"8527",cargo:"Assessor de T.I",niver:"23/mai",email:"phrocha"},
  {nome:"Rafaela Esteves",ramal:"",cargo:"Estagiária de Relações Institucionais",niver:"26/out",email:""},
  {nome:"Raphael Gonçalves de França",ramal:"8196",cargo:"CAIB - Coord. Assuntos Internacionais Bilaterais",niver:"14/fev",email:"raphaelfranca"},
  {nome:"Regiane Balthazar",ramal:"9137",cargo:"Secretária do Gabinete",niver:"17/jul",email:"rbalthazar"},
  {nome:"Rosana Beni",ramal:"9413",cargo:"Assessoria de Eventos",niver:"30/ago",email:"rosanabeni"},
  {nome:"Stella Bonifacio da Silva Azeredo",ramal:"8542",cargo:"Coordenadora de Assuntos Internacionais Bilateriais",niver:"30/mar",email:"stellabsa"},
  {nome:"Tayna de Paula Corrêa",ramal:"8521",cargo:"Estagiária - Assessoria de Comunicação",niver:"03/jun",email:"taynacorrea"},
  {nome:"Thomas Maggiorini",ramal:"",cargo:"Estagiário - Coord. de Coop. para Desenvol. Sustentável",niver:"15/jun",email:""},
  {nome:"Valdineia Oliveira Pereira",ramal:"8576",cargo:"Diretora da Divisão de Orçamentos e Finanças - DOF",niver:"08/nov",email:"vpereira"},
  {nome:"Vera Raquel A. Salvador",ramal:"8518",cargo:"CPAF - Coordenadoria de Planejamento",niver:"23/jun",email:"veraraquel"},
  {nome:"Vitor Maciel",ramal:"8652",cargo:"Residente",niver:"31/mar",email:"vitormaciel"},
  {nome:"Vitória Volpato",ramal:"9565",cargo:"CAIM - Coordenadora Multilaterais",niver:"24/mai",email:"vitoriavolpato"},
  {nome:"Wolney Edson Novaes Santos",ramal:"",cargo:"Assessor Gabinete",niver:"25/dez",email:"wolneyedson"}
];

/* =====================================================
   SEED DATA — LINKS COMPARTILHADOS
===================================================== */
const SEED_LINKS = [
  {name:"SEI — Sistema Eletrônico de Informações",url:"https://sei.prefeitura.sp.gov.br",descricao:"Gestão de documentos e processos eletrônicos",cat:"Sistemas",ico:"📄"},
  {name:"SIGPEC",url:"https://sigpec.prefeitura.sp.gov.br",descricao:"Sistema de Gestão de Pessoas e Competências",cat:"Sistemas",ico:"👥"},
  {name:"E-mail Corporativo (Outlook)",url:"https://outlook.cloud.microsoft/mail/inbox",descricao:"Outlook — prefeitura.sp.gov.br",cat:"Sistemas",ico:"📧"},
  {name:"Pacote Office 365",url:"https://m365.cloud.microsoft/apps",descricao:"Word, Excel, PowerPoint e demais apps",cat:"Sistemas",ico:"💼"},
  {name:"ServiceDesk — TI",url:"https://servicedesk.prefeitura.sp.gov.br",descricao:"Abertura de chamados de TI",cat:"Sistemas",ico:"🖥️"},
  {name:"Impressora Colorida",url:"https://10.13.56.52/",descricao:"Acesso ao painel da impressora colorida",cat:"Impressoras",ico:"🖨️"},
  {name:"Impressora Mono",url:"https://10.13.56.50/",descricao:"Acesso ao painel da impressora mono",cat:"Impressoras",ico:"🖨️"},
  {name:"Impressora Mono — Adm",url:"https://10.13.56.16/",descricao:"Acesso ao painel da impressora mono (adm)",cat:"Impressoras",ico:"🖨️"},
  {name:"Prefeitura SP — SMRI",url:"https://prefeitura.sp.gov.br/relacoes_internacionais",descricao:"Página oficial da SMRI",cat:"Portais",ico:"🌐"},
  {name:"Instagram @spinternacional",url:"https://www.instagram.com/spinternacional",descricao:"Perfil oficial da SMRI no Instagram",cat:"Portais",ico:"📸"},
  {name:"Diário Oficial",url:"https://diariooficial.prefeitura.sp.gov.br",descricao:"Publicações oficiais do município",cat:"Portais",ico:"📰"},
  {name:"Portal da Transparência",url:"https://transparencia.prefeitura.sp.gov.br",descricao:"Dados abertos e transparência pública",cat:"Portais",ico:"🔍"},
  {name:"Reserva de Sala",url:"http://sg1724.app.prodam/intranet/CalendarioMensal",descricao:"Agendamento de salas de reunião",cat:"Internos",ico:"📅"},
  {name:"OneDrive Compartilhado",url:"https://cloudprodamazhotmail-my.sharepoint.com/:f:/r/personal/phrocha_prefeitura_sp_gov_br/Documents/SMRI%20_Compartilhada",descricao:"Pasta compartilhada da SMRI",cat:"Internos",ico:"☁️"},
  {name:"Pimaco — Etiquetas",url:"https://www.pimaco.com.br/",descricao:"Modelos de etiquetas para impressão",cat:"Materiais",ico:"🏷️"}
];

/* =====================================================
   SEED DATA — USUÁRIOS
   role: 'ti' | 'rh' | 'user'
===================================================== */
const SEED_USUARIOS = [
  {username:"x555349",nome:"Airton Estevens Soares Filho",role:"user",genero:"M"},
  {username:"x576581",nome:"Alexander Cavalcanti Mota",role:"ti",genero:"M"},
  {username:"x690005",nome:"Alice Mendonça Ikeda",role:"user",genero:"F"},
  {username:"d938682",nome:"André Drumond Ortega Filho",role:"user",genero:"M"},
  {username:"d711836",nome:"Angela Maria Moreira",role:"user",genero:"F"},
  {username:"d947102",nome:"Angela Vidal Gandra da Silva Martins",role:"user",genero:"F"},
  {username:"d919909",nome:"Bernardo Augusto Santos de Faria",role:"user",genero:"M"},
  {username:"d931455",nome:"Bernardo Barreto",role:"user",genero:"M"},
  {username:"d858658",nome:"Camila Gomes de Assis",role:"user",genero:"F"},
  {username:"d947424",nome:"Camila Regina Costa de Carvalho",role:"user",genero:"F"},
  {username:"d743404",nome:"Claudia Bernardo Moreira",role:"user",genero:"F"},
  {username:"d838623",nome:"Claudia Cristina Miciano de Oliveira",role:"rh",genero:"F"},
  {username:"d707445",nome:"Emerson Mota Santana",role:"user",genero:"M"},
  {username:"d888222",nome:"Felipe Dalberto Dutra da Silva",role:"user",genero:"M"},
  {username:"d851677",nome:"Fernando de Oliveira Leme",role:"user",genero:"M"},
  {username:"d807319",nome:"Fernando Ferreira dos Santos",role:"user",genero:"M"},
  {username:"d912239",nome:"Francielly Regina Rosa Filgueira",role:"user",genero:"F"},
  {username:"d878492",nome:"Giovana Bueno Macedo",role:"user",genero:"F"},
  {username:"d887252",nome:"Giovanna Maroun D'Angelo Saab",role:"user",genero:"F"},
  {username:"d928060",nome:"Gustavo Henrique Pina de Azevedo",role:"user",genero:"M"},
  {username:"d895950",nome:"Gustavo Plaster Seripieri",role:"user",genero:"M"},
  {username:"d921479",nome:"João Lucas Melonio",role:"user",genero:"M"},
  {username:"x539354",nome:"Laura Rocha Lotito",role:"user",genero:"F"},
  {username:"d748098",nome:"Leon Rogerio Goncalves de Carvalho",role:"user",genero:"M"},
  {username:"d887241",nome:"Lucas Roberto Paredes dos Santos",role:"user",genero:"M"},
  {username:"d921227",nome:"Luisa Santos Gois",role:"user",genero:"F"},
  {username:"d953651",nome:"Luiz Fernando Bevilacqua",role:"user",genero:"M"},
  {username:"d889496",nome:"Luiza de Carvalho Bustamante Debrassi",role:"user",genero:"F"},
  {username:"d930846",nome:"Marcella de Negreiros Almeida",role:"user",genero:"F"},
  {username:"x541239",nome:"Maria Antonia Cury Segalla",role:"ti",genero:"F"},
  {username:"x636520",nome:"Maria Eduarda Furtado da Rocha Magno Filgueira",role:"user",genero:"F"},
  {username:"d886280",nome:"Matheus de Sousa Moura",role:"rh",genero:"M"},
  {username:"x005247",nome:"Miguel de Oliveira Alves da Silva",role:"user",genero:"M"},
  {username:"d955838",nome:"Milla Hosken Granado Brandao",role:"user",genero:"F"},
  {username:"d919276",nome:"Patricia dos Santos Sueza",role:"user",genero:"F"},
  {username:"d953479",nome:"Patrick Sadao Sugahara do Nascimento",role:"user",genero:"M"},
  {username:"d955909",nome:"Paula Pereira Garcia",role:"user",genero:"F"},
  {username:"d838016",nome:"Pedro Henrique Rocha",role:"ti",genero:"M"},
  {username:"d953701",nome:"Raphael Gonçalves de França",role:"user",genero:"M"},
  {username:"d880396",nome:"Regiane Balthazar",role:"rh",genero:"F"},
  {username:"d851828",nome:"Rosana Elisabete Beni Parlatore",role:"user",genero:"F"},
  {username:"d911870",nome:"Stella Bonifacio da Silva Azeredo",role:"user",genero:"F"},
  {username:"x538646",nome:"Tayna de Paula Corrêa",role:"user",genero:"F"},
  {username:"x629845",nome:"Thomas Silva Maggiorini",role:"user",genero:"M"},
  {username:"d770402",nome:"Valdineia Oliveira Pereira",role:"user",genero:"F"},
  {username:"d928068",nome:"Vera Raquel Aburesi Salvadori",role:"user",genero:"F"},
  {username:"d942809",nome:"Vitor Cristian Maciel Gomes",role:"user",genero:"M"},
  {username:"d947419",nome:"Vitória Volpato",role:"user",genero:"F"},
  {username:"d944461",nome:"Wolney Edson Novaes Santos",role:"user",genero:"M"},
  {username:"x503225",nome:"Brenda Rodrigues de Carvalho",role:"user",genero:"F"},
  {username:"x579342",nome:"Rafaela Esteves Federighi",role:"user",genero:"F"}
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

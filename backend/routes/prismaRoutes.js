const express = require("express");
const router = express.Router();

const db = require("../database/db");
const { montarLayoutFolhas } = require("../services/prismaService");

router.post("/gerar-layout", (req, res) => {
  try {
    const { tipoPrisma, prismas } = req.body;
    if (!Array.isArray(prismas) || prismas.length === 0)
      return res.status(400).json({ sucesso: false, mensagem: "É necessário enviar uma lista de prismas." });
    if (!tipoPrisma)
      return res.status(400).json({ sucesso: false, mensagem: "É necessário informar o tipo do prisma." });
    const layout = montarLayoutFolhas(prismas, tipoPrisma);
    return res.status(200).json({ sucesso: true, mensagem: "Layout gerado com sucesso.", dados: layout });
  } catch (erro) {
    return res.status(400).json({ sucesso: false, mensagem: erro.message });
  }
});

router.post("/salvar", (req, res) => {
  const { nome, cargo, empresa, tipoPrisma, imagem,
          escalaNome = 0, escalaCargo = 0, escalaEmpresa = 0,
          nomeArquivo, _nomeArquivo } = req.body;
  if (!tipoPrisma)
    return res.status(400).json({ sucesso: false, mensagem: "O tipo do prisma é obrigatório." });

  const nomeArq = nomeArquivo || _nomeArquivo || '';

  const agora = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const criadoEmLocal = `${agora.getFullYear()}-${pad(agora.getMonth()+1)}-${pad(agora.getDate())} ${pad(agora.getHours())}:${pad(agora.getMinutes())}:${pad(agora.getSeconds())}`;

  const sql = `INSERT INTO prismas (nome, cargo, empresa, tipo_prisma, imagem, escala_nome, escala_cargo, escala_empresa, criado_em, nome_arquivo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.run(sql, [nome||"", cargo||"", empresa||"", tipoPrisma, imagem||null, Number(escalaNome)||0, Number(escalaCargo)||0, Number(escalaEmpresa)||0, criadoEmLocal, nomeArq], function(erro) {
    if (erro) return res.status(500).json({ sucesso: false, mensagem: "Erro ao salvar prisma no banco.", erro: erro.message });
    return res.status(201).json({ sucesso: true, mensagem: "Prisma salvo com sucesso.", id: this.lastID });
  });
});

router.get("/", (req, res) => {
  const sql = `SELECT id, nome, cargo, empresa, tipo_prisma AS tipoPrisma, imagem, escala_nome AS escalaNome, escala_cargo AS escalaCargo, escala_empresa AS escalaEmpresa, criado_em AS criadoEm, nome_arquivo AS nomeArquivo FROM prismas ORDER BY id DESC`;
  db.all(sql, [], (erro, rows) => {
    if (erro) return res.status(500).json({ sucesso: false, mensagem: "Erro ao listar prismas.", erro: erro.message });
    return res.status(200).json({ sucesso: true, dados: rows });
  });
});

router.get("/buscar", (req, res) => {
  const { texto = "", tipoPrisma = "", data = "", dataAte = "" } = req.query;
  let sql = `SELECT id, nome, cargo, empresa, tipo_prisma AS tipoPrisma, imagem, escala_nome AS escalaNome, escala_cargo AS escalaCargo, escala_empresa AS escalaEmpresa, criado_em AS criadoEm, nome_arquivo AS nomeArquivo FROM prismas WHERE 1=1`;
  const parametros = [];

  if (texto.trim()) {
    sql += ` AND (nome LIKE ? OR cargo LIKE ? OR empresa LIKE ?)`;
    const t = `%${texto.trim()}%`;
    parametros.push(t, t, t);
  }
  if (tipoPrisma.trim()) { sql += ` AND tipo_prisma = ?`; parametros.push(tipoPrisma.trim()); }

  if (data.trim() && dataAte.trim()) {
    // Período completo: De → Até
    sql += ` AND date(criado_em) >= ? AND date(criado_em) <= ?`;
    parametros.push(data.trim(), dataAte.trim());
  } else if (data.trim()) {
    // Somente "De": dia exato
    sql += ` AND date(criado_em) = ?`;
    parametros.push(data.trim());
  } else if (dataAte.trim()) {
    // Somente "Até": tudo até essa data
    sql += ` AND date(criado_em) <= ?`;
    parametros.push(dataAte.trim());
  }

  sql += ` ORDER BY id DESC`;

  db.all(sql, parametros, (erro, rows) => {
    if (erro) return res.status(500).json({ sucesso: false, mensagem: "Erro ao buscar prismas.", erro: erro.message });
    return res.status(200).json({ sucesso: true, dados: rows });
  });
});

/* ÚNICO handler PUT — salva texto, escalas e imagem */
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { nome, cargo, empresa, escalaNome, escalaCargo, escalaEmpresa, imagem } = req.body;

  // Inclui imagem na atualização somente quando enviada no payload
  const atualizaImagem = imagem !== undefined;
  const sql = `UPDATE prismas SET
    nome=?, cargo=?, empresa=?,
    escala_nome=COALESCE(?,escala_nome),
    escala_cargo=COALESCE(?,escala_cargo),
    escala_empresa=COALESCE(?,escala_empresa)
    ${atualizaImagem ? ', imagem=?' : ''}
    WHERE id=?`;

  const params = [
    nome||"", cargo||"", empresa||"",
    escalaNome  !== undefined ? Number(escalaNome)  : null,
    escalaCargo !== undefined ? Number(escalaCargo) : null,
    escalaEmpresa !== undefined ? Number(escalaEmpresa) : null,
  ];
  if (atualizaImagem) params.push(imagem || null);
  params.push(id);

  db.run(sql, params, function(erro) {
    if (erro) return res.status(500).json({ sucesso: false, mensagem: "Erro ao atualizar prisma.", erro: erro.message });
    if (this.changes === 0) return res.status(404).json({ sucesso: false, mensagem: "Prisma não encontrado." });
    return res.status(200).json({ sucesso: true, mensagem: "Prisma atualizado com sucesso." });
  });
});

router.delete("/:id", (req, res) => {
  db.run(`DELETE FROM prismas WHERE id=?`, [req.params.id], function(erro) {
    if (erro) return res.status(500).json({ sucesso: false, mensagem: "Erro ao remover prisma.", erro: erro.message });
    if (this.changes === 0) return res.status(404).json({ sucesso: false, mensagem: "Prisma não encontrado." });
    return res.status(200).json({ sucesso: true, mensagem: "Prisma removido com sucesso." });
  });
});

module.exports = router;

const express = require("express");
const router  = express.Router();
const db      = require("../database/db");
const { requireAuth, requireRole } = require("../middleware/auth");

/* Todas as rotas exigem autenticação */
router.use(requireAuth);

/* ══════════════════════════════════════════════════
   LINKS COMPARTILHADOS  (tabela `links`)
   Leitura: qualquer usuário | Escrita: apenas TI
══════════════════════════════════════════════════ */

router.get("/compartilhados", (req, res) => {
  db.all(
    "SELECT id,name,url,descricao,cat,ico FROM links ORDER BY cat COLLATE NOCASE, name COLLATE NOCASE",
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ sucesso: false, mensagem: err.message });
      res.json({ sucesso: true, dados: rows });
    }
  );
});

router.post("/compartilhados", requireRole("ti"), (req, res) => {
  const { name, url, descricao = "", cat = "Outros", ico = "🔗" } = req.body;
  if (!name?.trim()) return res.status(400).json({ sucesso: false, mensagem: "Nome é obrigatório." });
  if (!url?.trim())  return res.status(400).json({ sucesso: false, mensagem: "URL é obrigatória." });
  db.run(
    "INSERT INTO links (name,url,descricao,cat,ico) VALUES (?,?,?,?,?)",
    [name.trim(), url.trim(), descricao.trim(), cat.trim()||"Outros", ico.trim()||"🔗"],
    function(err) {
      if (err) return res.status(500).json({ sucesso: false, mensagem: err.message });
      db.get("SELECT id,name,url,descricao,cat,ico FROM links WHERE id=?", [this.lastID], (e, row) => {
        if (e) return res.status(500).json({ sucesso: false, mensagem: e.message });
        res.status(201).json({ sucesso: true, dados: row });
      });
    }
  );
});

router.put("/compartilhados/:id", requireRole("ti"), (req, res) => {
  const { name, url, descricao = "", cat = "Outros", ico = "🔗" } = req.body;
  if (!name?.trim()) return res.status(400).json({ sucesso: false, mensagem: "Nome é obrigatório." });
  if (!url?.trim())  return res.status(400).json({ sucesso: false, mensagem: "URL é obrigatória." });
  db.run(
    "UPDATE links SET name=?,url=?,descricao=?,cat=?,ico=? WHERE id=?",
    [name.trim(), url.trim(), descricao.trim(), cat.trim()||"Outros", ico.trim()||"🔗", req.params.id],
    function(err) {
      if (err) return res.status(500).json({ sucesso: false, mensagem: err.message });
      if (this.changes === 0) return res.status(404).json({ sucesso: false, mensagem: "Link não encontrado." });
      res.json({ sucesso: true, mensagem: "Atualizado." });
    }
  );
});

router.delete("/compartilhados/:id", requireRole("ti"), (req, res) => {
  db.run("DELETE FROM links WHERE id=?", [req.params.id], function(err) {
    if (err) return res.status(500).json({ sucesso: false, mensagem: err.message });
    if (this.changes === 0) return res.status(404).json({ sucesso: false, mensagem: "Link não encontrado." });
    res.json({ sucesso: true, mensagem: "Removido." });
  });
});

/* ══════════════════════════════════════════════════
   LINKS PESSOAIS  (tabela `links_pessoais`)
   Apenas o próprio usuário vê e gerencia os seus
══════════════════════════════════════════════════ */

router.get("/pessoais", (req, res) => {
  db.all(
    "SELECT id,name,url,descricao,cat,ico FROM links_pessoais WHERE user_id=? ORDER BY cat COLLATE NOCASE, name COLLATE NOCASE",
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ sucesso: false, mensagem: err.message });
      res.json({ sucesso: true, dados: rows });
    }
  );
});

router.post("/pessoais", (req, res) => {
  const { name, url, descricao = "", cat = "Meus Links", ico = "🔗" } = req.body;
  if (!name?.trim()) return res.status(400).json({ sucesso: false, mensagem: "Nome é obrigatório." });
  if (!url?.trim())  return res.status(400).json({ sucesso: false, mensagem: "URL é obrigatória." });
  db.run(
    "INSERT INTO links_pessoais (user_id,name,url,descricao,cat,ico) VALUES (?,?,?,?,?,?)",
    [req.user.id, name.trim(), url.trim(), descricao.trim(), cat.trim()||"Meus Links", ico.trim()||"🔗"],
    function(err) {
      if (err) return res.status(500).json({ sucesso: false, mensagem: err.message });
      db.get("SELECT id,name,url,descricao,cat,ico FROM links_pessoais WHERE id=?", [this.lastID], (e, row) => {
        if (e) return res.status(500).json({ sucesso: false, mensagem: e.message });
        res.status(201).json({ sucesso: true, dados: row });
      });
    }
  );
});

router.put("/pessoais/:id", (req, res) => {
  const { name, url, descricao = "", cat = "Meus Links", ico = "🔗" } = req.body;
  if (!name?.trim()) return res.status(400).json({ sucesso: false, mensagem: "Nome é obrigatório." });
  if (!url?.trim())  return res.status(400).json({ sucesso: false, mensagem: "URL é obrigatória." });
  db.run(
    "UPDATE links_pessoais SET name=?,url=?,descricao=?,cat=?,ico=? WHERE id=? AND user_id=?",
    [name.trim(), url.trim(), descricao.trim(), cat.trim()||"Meus Links", ico.trim()||"🔗", req.params.id, req.user.id],
    function(err) {
      if (err) return res.status(500).json({ sucesso: false, mensagem: err.message });
      if (this.changes === 0) return res.status(404).json({ sucesso: false, mensagem: "Link não encontrado." });
      res.json({ sucesso: true, mensagem: "Atualizado." });
    }
  );
});

router.delete("/pessoais/:id", (req, res) => {
  db.run("DELETE FROM links_pessoais WHERE id=? AND user_id=?", [req.params.id, req.user.id], function(err) {
    if (err) return res.status(500).json({ sucesso: false, mensagem: err.message });
    if (this.changes === 0) return res.status(404).json({ sucesso: false, mensagem: "Link não encontrado." });
    res.json({ sucesso: true, mensagem: "Removido." });
  });
});

module.exports = router;

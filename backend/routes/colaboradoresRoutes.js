const express = require("express");
const router  = express.Router();
const db      = require("../database/db");
const { requireAuth, requireRole } = require("../middleware/auth");

/* Todas as rotas exigem autenticação */
router.use(requireAuth);

/* GET /api/colaboradores — qualquer usuário logado pode ver */
router.get("/", (req, res) => {
  db.all(
    "SELECT id, nome, ramal, cargo, niver, email FROM colaboradores ORDER BY nome COLLATE NOCASE ASC",
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ sucesso: false, mensagem: err.message });
      return res.json({ sucesso: true, dados: rows });
    }
  );
});

/* POST /api/colaboradores — apenas RH e TI */
router.post("/", requireRole("rh", "ti"), (req, res) => {
  const { nome, ramal = "", cargo = "", niver = "", email = "" } = req.body;
  if (!nome || !nome.trim())
    return res.status(400).json({ sucesso: false, mensagem: "Nome é obrigatório." });

  db.run(
    "INSERT INTO colaboradores (nome,ramal,cargo,niver,email) VALUES (?,?,?,?,?)",
    [nome.trim(), ramal.trim(), cargo.trim(), niver.trim(), email.trim()],
    function(err) {
      if (err) return res.status(500).json({ sucesso: false, mensagem: err.message });
      db.get("SELECT id,nome,ramal,cargo,niver,email FROM colaboradores WHERE id=?", [this.lastID], (err2, row) => {
        if (err2) return res.status(500).json({ sucesso: false, mensagem: err2.message });
        return res.status(201).json({ sucesso: true, dados: row });
      });
    }
  );
});

/* PUT /api/colaboradores/:id — apenas RH e TI */
router.put("/:id", requireRole("rh", "ti"), (req, res) => {
  const { nome, ramal = "", cargo = "", niver = "", email = "" } = req.body;
  if (!nome || !nome.trim())
    return res.status(400).json({ sucesso: false, mensagem: "Nome é obrigatório." });

  db.run(
    "UPDATE colaboradores SET nome=?,ramal=?,cargo=?,niver=?,email=? WHERE id=?",
    [nome.trim(), ramal.trim(), cargo.trim(), niver.trim(), email.trim(), req.params.id],
    function(err) {
      if (err) return res.status(500).json({ sucesso: false, mensagem: err.message });
      if (this.changes === 0) return res.status(404).json({ sucesso: false, mensagem: "Colaborador não encontrado." });
      return res.json({ sucesso: true, mensagem: "Atualizado com sucesso." });
    }
  );
});

/* DELETE /api/colaboradores/:id — apenas RH e TI */
router.delete("/:id", requireRole("rh", "ti"), (req, res) => {
  db.run("DELETE FROM colaboradores WHERE id=?", [req.params.id], function(err) {
    if (err) return res.status(500).json({ sucesso: false, mensagem: err.message });
    if (this.changes === 0) return res.status(404).json({ sucesso: false, mensagem: "Colaborador não encontrado." });
    return res.json({ sucesso: true, mensagem: "Removido com sucesso." });
  });
});

module.exports = router;

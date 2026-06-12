const express     = require("express");
const router      = express.Router();
const db          = require("../database/db");
const { requireAuth } = require("../middleware/auth");

router.use(requireAuth);

/* POST /api/analytics/click
   body: { page: "/gerar-prisma" }
   Incrementa o contador de cliques da página para o usuário atual.
*/
router.post("/click", (req, res) => {
  const page = (req.body.page || "").trim();
  if (!page) return res.status(400).json({ sucesso: false, mensagem: "page é obrigatório." });

  db.run(
    `INSERT INTO page_clicks (user_id, page, count) VALUES (?,?,1)
     ON CONFLICT(user_id, page) DO UPDATE SET count = count + 1`,
    [req.user.id, page],
    err => {
      if (err) return res.status(500).json({ sucesso: false, mensagem: err.message });
      res.json({ sucesso: true });
    }
  );
});

/* GET /api/analytics/top?limit=3
   Retorna as páginas mais acessadas pelo usuário atual.
*/
router.get("/top", (req, res) => {
  const limit = Math.max(1, Math.min(10, parseInt(req.query.limit) || 3));
  db.all(
    `SELECT page, count FROM page_clicks WHERE user_id = ? ORDER BY count DESC LIMIT ?`,
    [req.user.id, limit],
    (err, rows) => {
      if (err) return res.status(500).json({ sucesso: false, mensagem: err.message });
      res.json({ sucesso: true, pages: rows || [] });
    }
  );
});

module.exports = router;

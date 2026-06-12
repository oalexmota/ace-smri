const express = require("express");
const router  = express.Router();
const crypto  = require("crypto");
const db      = require("../database/db");
const { requireAuth } = require("../middleware/auth");

const SESSION_HOURS = 10; // token válido por 10 h (um dia de trabalho)

function newExpiry() {
  const d = new Date();
  d.setHours(d.getHours() + SESSION_HOURS);
  return d.toISOString();
}

/* GET /api/auth/config  —  informa ao frontend se senha é obrigatória */
router.get("/config", (_req, res) => {
  res.json({ requiresPassword: !!process.env.APP_SECRET });
});

/* POST /api/auth/login
   body: { username, senha? }
   Autentica pelo username. Se APP_SECRET estiver definido, exige senha igual.
   Retorna token + dados do usuário.
*/
router.post("/login", (req, res) => {
  const username = (req.body.username || "").trim().toLowerCase();
  if (!username)
    return res.status(400).json({ sucesso: false, mensagem: "Informe o usuário." });

  if (process.env.APP_SECRET) {
    const senha = (req.body.senha || "").trim();
    if (senha !== process.env.APP_SECRET)
      return res.status(401).json({ sucesso: false, mensagem: "Senha incorreta." });
  }

  db.get("SELECT id, username, nome, role, genero FROM usuarios WHERE LOWER(username) = ?", [username], (err, user) => {
    if (err)   return res.status(500).json({ sucesso: false, mensagem: err.message });
    if (!user) return res.status(401).json({ sucesso: false, mensagem: "Usuário não encontrado. Verifique o código e tente novamente." });

    // Limpa sessões expiradas do usuário
    const now = new Date().toISOString();
    db.run("DELETE FROM sessoes WHERE user_id = ? AND expires_em <= ?", [user.id, now]);

    // Gera novo token
    const token   = crypto.randomBytes(32).toString("hex");
    const expires = newExpiry();

    db.run("INSERT INTO sessoes (user_id, token, expires_em) VALUES (?,?,?)", [user.id, token, expires], function(err2) {
      if (err2) return res.status(500).json({ sucesso: false, mensagem: err2.message });
      return res.json({
        sucesso: true,
        token,
        user: { id: user.id, username: user.username, nome: user.nome, role: user.role, genero: user.genero || 'M' }
      });
    });
  });
});

/* POST /api/auth/logout  —  invalida o token atual */
router.post("/logout", requireAuth, (req, res) => {
  const token = (req.headers.authorization || "").slice(7).trim();
  db.run("DELETE FROM sessoes WHERE token = ?", [token], () => {
    res.json({ sucesso: true });
  });
});

/* GET /api/auth/me  —  retorna o usuário da sessão atual */
router.get("/me", requireAuth, (req, res) => {
  res.json({ sucesso: true, user: req.user });
});

module.exports = router;

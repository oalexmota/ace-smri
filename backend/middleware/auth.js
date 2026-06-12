const db = require("../database/db");

/* ──────────────────────────────────────────────────
   requireAuth  —  verifica token Bearer na request
   Popula req.user = { id, username, nome, role }
────────────────────────────────────────────────── */
function requireAuth(req, res, next) {
  const auth  = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : null;

  if (!token)
    return res.status(401).json({ sucesso: false, mensagem: "Não autenticado." });

  const now = new Date().toISOString();
  db.get(
    `SELECT s.user_id AS id, u.username, u.nome, u.role, u.genero
     FROM   sessoes s
     JOIN   usuarios u ON s.user_id = u.id
     WHERE  s.token = ? AND s.expires_em > ?`,
    [token, now],
    (err, row) => {
      if (err || !row)
        return res.status(401).json({ sucesso: false, mensagem: "Sessão inválida ou expirada. Faça login novamente." });
      req.user = row;
      next();
    }
  );
}

/* ──────────────────────────────────────────────────
   requireRole(...roles)  —  exige cargo específico
   Deve vir depois de requireAuth
────────────────────────────────────────────────── */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role))
      return res.status(403).json({ sucesso: false, mensagem: "Sem permissão para esta operação." });
    next();
  };
}

module.exports = { requireAuth, requireRole };

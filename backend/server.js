// Importa o framework Express.
const express = require("express");

// Importa o CORS.
const cors = require("cors");

// Importa o módulo path do Node.js.
const path = require("path");

require("./database/init");

// Importa o arquivo onde ficarão as rotas do menu.
const menuRoutes = require("./routes/menuRoutes");

// Importa as rotas dos prismas
const prismaRoutes = require("./routes/prismaRoutes");

// Importa as rotas de autenticação
const authRoutes = require("./routes/authRoutes");

// Importa as rotas dos colaboradores
const colaboradoresRoutes = require("./routes/colaboradoresRoutes");

// Importa as rotas dos links
const linksRoutes = require("./routes/linksRoutes");

// Importa as rotas de analytics (page clicks)
const analyticsRoutes = require("./routes/analyticsRoutes");

// Cria a aplicação Express.
// A variável "app" representa o nosso servidor.
const app = express();

// Define a porta em que o servidor vai rodar.
// Use a variável de ambiente PORT para produção: PORT=8080 node server.js
const PORT = process.env.PORT || 3000;

/*
|--------------------------------------------------------------------------
| MIDDLEWARES
|--------------------------------------------------------------------------
| Middlewares são funções executadas antes das rotas.
| Eles ajudam o servidor a tratar dados, liberar acessos, etc.
|--------------------------------------------------------------------------
*/

// Habilita o CORS no servidor.
// Em produção, defina CORS_ORIGIN com a URL do servidor (ex: http://192.168.1.10:3000)
app.use(cors({ origin: process.env.CORS_ORIGIN || true }));

// Permite que o servidor entenda dados enviados em formato JSON.
// Limite de 50 MB para suportar imagens em base64 (prismas).
app.use(express.json({ limit: "50mb" }));

// Permite que o servidor leia dados enviados por formulários.
app.use(express.urlencoded({ limit: "50mb", extended: true }));

/*
|--------------------------------------------------------------------------
| ARQUIVOS ESTÁTICOS
|--------------------------------------------------------------------------
| Aqui estamos dizendo ao Express para servir os arquivos do frontend.
| Isso inclui HTML, CSS, JS, imagens, etc.
|--------------------------------------------------------------------------
*/

// Define a pasta "frontend" como pública.
// Assim, o navegador consegue acessar os arquivos que estão lá.
app.use(express.static(path.join(__dirname, "../frontend")));

/*
|--------------------------------------------------------------------------
| ROTAS DA API
|--------------------------------------------------------------------------
| Essas rotas devolvem dados, normalmente em JSON.
|--------------------------------------------------------------------------
*/

// Tudo que começar com /api/menu será tratado pelo arquivo menuRoutes.
app.use("/api/menu", menuRoutes);

// Rotas de autenticação (login, logout, me)
app.use("/api/auth", authRoutes);

// Rotas dos prismas
app.use("/api/prismas", prismaRoutes);

// Rotas dos colaboradores
app.use("/api/colaboradores", colaboradoresRoutes);

// Rotas dos links (compartilhados e pessoais)
app.use("/api/links", linksRoutes);

// Rotas de analytics (rastreamento de cliques)
app.use("/api/analytics", analyticsRoutes);

/*
|--------------------------------------------------------------------------
| ROTAS DAS PÁGINAS
|--------------------------------------------------------------------------
| Essas rotas devolvem arquivos HTML.
|--------------------------------------------------------------------------
*/

// Página de login
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/login.html"));
});

// Quando o usuário acessar a raiz do site "/", o servidor envia o index.html.
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Quando o usuário acessar "/gerar-prisma", o servidor envia essa página.
app.get("/gerar-prisma", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/gerar-prisma.html"));
});

// Quando o usuário acessar "/lista-prismas", o servidor envia essa página.
app.get("/lista-prismas", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/lista-prismas.html"));
});

app.get("/sobre-sistema", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/sobre-sistema.html"));
});

app.get("/gerar-mesa", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/gerar-mesa.html"));
});

app.get("/gerar-comboio", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/gerar-comboio.html"));
});

app.get("/contribuintes-ramais", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/contribuintes-ramais.html"));
});

app.get("/links-uteis", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/links-uteis.html"));
});

app.get("/assinatura", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/assinatura.html"));
});

/*
|--------------------------------------------------------------------------
| INICIALIZAÇÃO DO SERVIDOR
|--------------------------------------------------------------------------
| Aqui o servidor começa a "escutar" a porta definida.
|--------------------------------------------------------------------------
*/

// Faz o servidor iniciar na porta 3000.
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
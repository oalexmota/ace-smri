// Importa o Express.
const express = require("express");

// Cria um objeto de rotas.
// Em vez de colocar tudo no server.js, organizamos em arquivos separados.
const router = express.Router();

/*
|--------------------------------------------------------------------------
| ROTA GET DO MENU
|--------------------------------------------------------------------------
| Essa rota será acessada quando alguém entrar em /api/menu
| O método GET é usado para buscar informações.
|--------------------------------------------------------------------------
*/

router.get("/", (req, res) => {
  // Cria um array com os itens do menu.
  // Cada objeto representa uma opção.
  const menu = [
    {
      id: 1, // Identificador único do item
      nome: "Início", // Texto que aparecerá no menu
      rota: "/", // Link para onde o item vai levar
      icone: "house" // Nome simbólico do ícone (ainda não estamos usando visualmente)
    },
    {
      id: 2,
      nome: "Gerar Prisma",
      rota: "/gerar-prisma",
      icone: "card-heading"
    },
    {
      id: 3,
      nome: "Lista de Prismas",
      rota: "/lista-prismas",
      icone: "list-ul"
    }
  ];

  // Retorna a resposta em JSON.
  // status(200) significa que deu certo.
  res.status(200).json({
    sucesso: true,
    mensagem: "Menu carregado com sucesso.",
    dados: menu
  });
});

// Exporta essa rota para que ela possa ser usada no server.js.
module.exports = router;
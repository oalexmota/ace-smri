// Importa o pacote sqlite3
const sqlite3 = require("sqlite3").verbose();

// Importa o módulo path para montar caminhos corretamente
const path = require("path");

// Define o caminho do arquivo do banco de dados
const caminhoBanco = path.join(__dirname, "prismas.db");

// Cria a conexão com o banco
const db = new sqlite3.Database(caminhoBanco, (erro) => {
  if (erro) {
    console.error("Erro ao conectar ao banco de dados:", erro.message);
  } else {
    console.log("Banco de dados SQLite conectado com sucesso.");
  }
});

// Exporta a conexão para uso em outros arquivos
module.exports = db;
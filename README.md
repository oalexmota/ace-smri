# A.C.E. — Aplicação de Controle Exclusivo

Sistema web desenvolvido para apoiar, centralizar e modernizar processos administrativos da Secretaria Municipal de Relações Internacionais da Prefeitura de São Paulo.
https://ace-smri.com.br/login
O projeto surgiu inicialmente como uma solução para automatizar a criação e o gerenciamento de prismas institucionais, substituindo um processo anteriormente realizado manualmente no Microsoft PowerPoint. Com a evolução da iniciativa e a participação dos usuários, novas funcionalidades foram incorporadas, transformando o sistema em uma plataforma administrativa integrada.

---

## 📌 Sobre o projeto

O A.C.E. foi desenvolvido durante o período de estágio com o objetivo de aplicar conhecimentos de tecnologia da informação na resolução de necessidades reais encontradas no ambiente de trabalho.

A primeira necessidade identificada estava relacionada à criação de prismas utilizados em reuniões, eventos e atividades institucionais. O processo anterior dependia de edição manual no PowerPoint, o que tornava a atividade demorada, pouco padronizada e mais difícil para usuários com menor familiaridade com ferramentas de edição.

A partir dessa necessidade, foi desenvolvido um sistema web capaz de automatizar o processo e armazenar os dados em um banco de dados.

Com o uso da plataforma, novas necessidades foram identificadas e o projeto passou a incorporar outras ferramentas administrativas.

Atualmente, o A.C.E. conta com diversas funcionalidades e continua em desenvolvimento.

---

## 🎯 Objetivos

### Objetivo geral

Desenvolver uma plataforma web capaz de simplificar, centralizar e modernizar processos administrativos, proporcionando maior organização, agilidade e autonomia aos usuários.

### Objetivos específicos

- Automatizar a criação de prismas institucionais;
- Centralizar informações em banco de dados;
- Reduzir atividades manuais e repetitivas;
- Facilitar a consulta e reutilização de informações;
- Padronizar materiais institucionais;
- Criar ferramentas administrativas em um único ambiente;
- Desenvolver uma interface simples e intuitiva;
- Ampliar gradualmente os recursos de acessibilidade;
- Permitir evolução contínua conforme as necessidades dos usuários.

---

## 🚀 Funcionalidades

Atualmente, o sistema possui funcionalidades voltadas para diferentes necessidades administrativas.

### 🪪 Gerador de Prismas

Permite criar, editar, armazenar, pesquisar, excluir e imprimir prismas institucionais.

Principais recursos:

- Prisma pequeno e grande;
- Inclusão de imagem;
- Personalização do tamanho das fontes;
- Contador de tamanho da fonte;
- Pré-visualização;
- Edição dos dados;
- Remoção de registros;
- Impressão;
- Seleção de múltiplos registros;
- Exclusão em massa;
- Impressão de múltiplos prismas;
- Filtro por data;
- Pesquisa por informações cadastradas.

---

### 👥 Colaboradores e Ramais

Permite centralizar informações de colaboradores e ramais utilizados na Secretaria.

Possibilita facilitar a consulta de informações internas sem depender de arquivos ou listas distribuídas.

---

### 🔗 Links Úteis

Centraliza links utilizados frequentemente pelos servidores durante suas atividades.

A funcionalidade permite organizar os acessos em um único ambiente, facilitando a localização de recursos importantes.

---

### ✉️ Assinatura de E-mail

Ferramenta para geração e padronização de assinaturas institucionais de e-mail.

---

### 🪑 Gerador de Mesa

Permite criar identificações para mesas utilizadas em reuniões, eventos e atividades institucionais.

---

### 🚂 Gerador de Comboio

Funcionalidade destinada à criação e organização de informações relacionadas aos comboios utilizados em atividades institucionais.

---

### ℹ️ Sobre o Sistema

Página destinada à apresentação do A.C.E., contendo informações sobre o projeto, autoria, versão e evolução do sistema.

---

## 🏗️ Arquitetura

O projeto utiliza uma arquitetura separando frontend e backend.

```text
A.C.E.
│
├── Frontend
│   ├── HTML
│   ├── CSS
│   └── JavaScript
│
├── Backend
│   ├── Node.js
│   └── Express
│
└── Banco de Dados
    └── SQLite

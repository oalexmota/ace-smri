/* ── Toast ── */
function showToast(msg, tipo) {
  let t = document.getElementById('aceToastLp');
  if (!t) {
    t = document.createElement('div');
    t.id = 'aceToastLp';
    t.style.cssText = 'position:fixed;bottom:20px;right:20px;padding:9px 18px;border-radius:10px;font-size:.83rem;font-weight:500;z-index:9999;opacity:0;transform:translateY(7px);transition:all .22s;pointer-events:none;color:#fff;max-width:320px';
    document.body.appendChild(t);
  }
  t.style.background = tipo === 'erro' ? '#ef4444' : tipo === 'aviso' ? '#f59e0b' : '#1f2937';
  t.textContent = msg;
  t.style.opacity = '1'; t.style.transform = 'translateY(0)';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(7px)'; }, 3500);
}

const buscaTexto = document.getElementById("buscaTexto");
const filtroTipoPrisma = document.getElementById("filtroTipoPrisma");
const filtroData = document.getElementById("filtroData");
const filtroDataAte = document.getElementById("filtroDataAte");
const btnBuscarPrismas = document.getElementById("btnBuscarPrismas");
const btnLimparBusca = document.getElementById("btnLimparBusca");
const listaPrismasBanco = document.getElementById("listaPrismasBanco");
const contadorPrismasBanco = document.getElementById("contadorPrismasBanco");

const contadorSelecionados = document.getElementById("contadorSelecionados");
const btnLimparSelecao = document.getElementById("btnLimparSelecao");
const btnExcluirSelecionados = document.getElementById("btnExcluirSelecionados");
const btnImprimirSelecionados = document.getElementById("btnImprimirSelecionados");

let prismasCarregados = [];
let prismaEmEdicaoId = null;
let idsSelecionados = [];
let tipoSelecionadoLote = null;

/* ==========================================================================
   UTILITÁRIOS
   ========================================================================== */

function formatarDataBanco(dataTexto) {
  if (!dataTexto) return "-";

  const partes = dataTexto.split(" ");
  if (partes.length !== 2) return dataTexto;

  const [dataParte, horaParte] = partes;
  const [ano, mes, dia] = dataParte.split("-");
  const [hora, minuto] = horaParte.split(":");

  if (!ano || !mes || !dia) return dataTexto;

  return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
}

function escapeHtml(texto) {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeHtmlParaAtributo(texto) {
  return escapeHtml(texto);
}

function calcularTamanhoCm(base, escala) {
  const fator = 1.25; // ajuste fino (pode usar 1.2 ~ 1.35)
  return ((base + (escala * 0.08)) * fator).toFixed(2);
}

function atualizarContadorSelecionados() {
  contadorSelecionados.textContent = `${idsSelecionados.length} selecionado(s)`;
}

function limparSelecao() {
  idsSelecionados = [];
  tipoSelecionadoLote = null;
  atualizarContadorSelecionados();
  renderizarPrismasBanco(prismasCarregados);
}

function obterPrismaPorId(id) {
  return prismasCarregados.find((p) => p.id === id);
}

/* ==========================================================================
   CARREGAR PRISMAS
   ========================================================================== */

async function carregarPrismas() {
  try {
    const texto = buscaTexto.value.trim();
    const tipoPrisma = filtroTipoPrisma.value;
    const data    = filtroData    ? filtroData.value    : "";
    const dataAte = filtroDataAte ? filtroDataAte.value : "";

    const params = new URLSearchParams();

    if (texto) params.append("texto", texto);
    if (tipoPrisma) params.append("tipoPrisma", tipoPrisma);
    if (data)    params.append("data",    data);
    if (dataAte) params.append("dataAte", dataAte);

    const url = params.toString()
      ? `/api/prismas/buscar?${params.toString()}`
      : "/api/prismas";

    const resposta = await fetch(url);
    const dados = await resposta.json();

    if (!dados.sucesso) {
      listaPrismasBanco.innerHTML = `<p class="text-danger mb-0">Erro ao carregar prismas.</p>`;
      return;
    }

    prismasCarregados = dados.dados || [];

    // Se algum selecionado foi removido do banco, limpa da seleção
    idsSelecionados = idsSelecionados.filter(id =>
      prismasCarregados.some(prisma => prisma.id === id)
    );

    if (idsSelecionados.length === 0) {
      tipoSelecionadoLote = null;
    }

    atualizarContadorSelecionados();
    renderizarPrismasBanco(prismasCarregados);
  } catch (erro) {
    console.error("Erro ao carregar prismas:", erro);
    listaPrismasBanco.innerHTML = `<p class="text-danger mb-0">Erro ao carregar prismas.</p>`;
  }
}

/* ==========================================================================
   RENDERIZAR LISTA
   ========================================================================== */

function renderizarPrismasBanco(prismas) {
  contadorPrismasBanco.textContent = prismas.length;

  if (!prismas.length) {
    listaPrismasBanco.innerHTML = `<p class="text-muted mb-0">Nenhum prisma encontrado.</p>`;
    return;
  }

  listaPrismasBanco.innerHTML = "";

  prismas.forEach((prisma) => {
    const card = document.createElement("div");
    card.className = "item-prisma-lista mb-3";

    const estaSelecionado = idsSelecionados.includes(prisma.id);
    const estaEditando = prismaEmEdicaoId === prisma.id;

    if (estaSelecionado) {
      card.classList.add("selecionado");
    }

    // Se existe tipo selecionado, esconde os de tipo diferente
    if (tipoSelecionadoLote && prisma.tipoPrisma !== tipoSelecionadoLote) {
      card.classList.add("oculto-por-tipo");
    }

    if (estaEditando) {
      card.innerHTML = `
        <input
          type="checkbox"
          class="form-check-input checkbox-selecao-prisma"
          ${estaSelecionado ? "checked" : ""}
          onchange="alternarSelecaoPrisma(${prisma.id})"
        />

        <h3 class="mb-3">Editar Prisma</h3>

        <div class="mb-2">
          <div class="d-flex align-items-center gap-2 mb-1 flex-wrap">
            <label class="form-label mb-0"><strong>Nome</strong></label>
            <div class="d-flex align-items-center gap-1">
              <button type="button" class="btn btn-sm btn-outline-secondary py-0 px-1" style="font-size:.72rem" onclick="alterarEscalaBanco(${prisma.id},'escalaNome',-1)">A−</button>
              <span class="badge bg-secondary" style="min-width:32px;font-size:.72rem">${_escalaLabel(prisma.escalaNome)}</span>
              <button type="button" class="btn btn-sm btn-outline-secondary py-0 px-1" style="font-size:.72rem" onclick="alterarEscalaBanco(${prisma.id},'escalaNome',1)">A+</button>
            </div>
          </div>
          <input
            type="text"
            class="form-control"
            id="editNome_${prisma.id}"
            value="${escapeHtmlParaAtributo(prisma.nome || "")}"
            placeholder="Digite o nome"
          />
        </div>

        <div class="mb-2">
          <div class="d-flex align-items-center gap-2 mb-1 flex-wrap">
            <label class="form-label mb-0"><strong>Cargo</strong></label>
            <div class="d-flex align-items-center gap-1">
              <button type="button" class="btn btn-sm btn-outline-secondary py-0 px-1" style="font-size:.72rem" onclick="alterarEscalaBanco(${prisma.id},'escalaCargo',-1)">A−</button>
              <span class="badge bg-secondary" style="min-width:32px;font-size:.72rem">${_escalaLabel(prisma.escalaCargo)}</span>
              <button type="button" class="btn btn-sm btn-outline-secondary py-0 px-1" style="font-size:.72rem" onclick="alterarEscalaBanco(${prisma.id},'escalaCargo',1)">A+</button>
            </div>
          </div>
          <input
            type="text"
            class="form-control"
            id="editCargo_${prisma.id}"
            value="${escapeHtmlParaAtributo(prisma.cargo || "")}"
            placeholder="Digite o cargo"
          />
        </div>

        <div class="mb-3">
          <div class="d-flex align-items-center gap-2 mb-1 flex-wrap">
            <label class="form-label mb-0"><strong>Empresa</strong></label>
            <div class="d-flex align-items-center gap-1">
              <button type="button" class="btn btn-sm btn-outline-secondary py-0 px-1" style="font-size:.72rem" onclick="alterarEscalaBanco(${prisma.id},'escalaEmpresa',-1)">A−</button>
              <span class="badge bg-secondary" style="min-width:32px;font-size:.72rem">${_escalaLabel(prisma.escalaEmpresa)}</span>
              <button type="button" class="btn btn-sm btn-outline-secondary py-0 px-1" style="font-size:.72rem" onclick="alterarEscalaBanco(${prisma.id},'escalaEmpresa',1)">A+</button>
            </div>
          </div>
          <input
            type="text"
            class="form-control"
            id="editEmpresa_${prisma.id}"
            value="${escapeHtmlParaAtributo(prisma.empresa || "")}"
            placeholder="Digite a empresa"
          />
        </div>

        <p><strong>Tipo:</strong> ${prisma.tipoPrisma || "-"}</p>
        <p><strong>Imagem:</strong> ${prisma.imagem ? "Sim" : "Não"}</p>
        <p><strong>Criado em:</strong> ${formatarDataBanco(prisma.criadoEm)}</p>

        <div class="acoes-item d-flex gap-2 flex-wrap">
          <button
            type="button"
            class="btn btn-sm btn-success"
            onclick="salvarEdicaoPrismaBanco(${prisma.id})"
          >
            Salvar
          </button>

          <button
            type="button"
            class="btn btn-sm btn-outline-secondary"
            onclick="cancelarEdicaoPrismaBanco()"
          >
            Cancelar
          </button>
        </div>
      `;
    } else {
      card.innerHTML = `
        <input
          type="checkbox"
          class="form-check-input checkbox-selecao-prisma"
          ${estaSelecionado ? "checked" : ""}
          onchange="alternarSelecaoPrisma(${prisma.id})"
        />

        <h3>${
          prisma.nome
            ? escapeHtml(prisma.nome)
            : prisma.nomeArquivo
              ? escapeHtml(prisma.nomeArquivo)
              : prisma.imagem
                ? '📷 (Imagem)'
                : '(Sem nome)'
        }</h3>
        <p><strong>Cargo:</strong> ${escapeHtml(prisma.cargo || "-")}</p>
        <p><strong>Empresa:</strong> ${escapeHtml(prisma.empresa || "-")}</p>
        <p><strong>Tipo:</strong> ${escapeHtml(prisma.tipoPrisma || "-")}</p>
        <p><strong>Imagem:</strong> ${prisma.imagem ? "Sim" : "Não"}</p>
        <p><strong>Criado em:</strong> ${formatarDataBanco(prisma.criadoEm)}</p>

        <div class="acoes-item d-flex gap-2 flex-wrap">
          <button
            type="button"
            class="btn btn-sm btn-outline-primary"
            onclick="editarPrismaBanco(${prisma.id})"
          >
            Editar
          </button>

          <button
            type="button"
            class="btn btn-sm btn-outline-danger"
            onclick="removerPrismaBanco(${prisma.id})"
          >
            Remover
          </button>

          <button
            type="button"
            class="btn btn-sm btn-outline-success"
            onclick="imprimirPrismaBanco(${prisma.id})"
          >
            Imprimir
          </button>
        </div>
      `;
    }

    listaPrismasBanco.appendChild(card);
  });
}

/* ==========================================================================
   SELEÇÃO
   ========================================================================== */

function alternarSelecaoPrisma(id) {
  const prisma = obterPrismaPorId(id);
  if (!prisma) return;

  const jaSelecionado = idsSelecionados.includes(id);

  if (jaSelecionado) {
    idsSelecionados = idsSelecionados.filter(itemId => itemId !== id);

    if (idsSelecionados.length === 0) {
      tipoSelecionadoLote = null;
    }
  } else {
    if (!tipoSelecionadoLote) {
      tipoSelecionadoLote = prisma.tipoPrisma;
    }

    if (prisma.tipoPrisma !== tipoSelecionadoLote) {
      alert(`Você só pode selecionar prismas do tipo "${tipoSelecionadoLote}" por vez.`);
      renderizarPrismasBanco(prismasCarregados);
      return;
    }

    idsSelecionados.push(id);
  }

  atualizarContadorSelecionados();
  renderizarPrismasBanco(prismasCarregados);
}

/* ==========================================================================
   EDIÇÃO
   ========================================================================== */

function editarPrismaBanco(id) {
  prismaEmEdicaoId = id;
  renderizarPrismasBanco(prismasCarregados);
}

function cancelarEdicaoPrismaBanco() {
  prismaEmEdicaoId = null;
  renderizarPrismasBanco(prismasCarregados);
}

async function salvarEdicaoPrismaBanco(id) {
  const inputNome = document.getElementById(`editNome_${id}`);
  const inputCargo = document.getElementById(`editCargo_${id}`);
  const inputEmpresa = document.getElementById(`editEmpresa_${id}`);

  if (!inputNome || !inputCargo || !inputEmpresa) {
    alert("Campos de edição não encontrados.");
    return;
  }

  const payload = {
    nome: inputNome.value.trim(),
    cargo: inputCargo.value.trim(),
    empresa: inputEmpresa.value.trim()
  };

  try {
    const resposta = await fetch(`/api/prismas/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const dados = await resposta.json();

    if (!dados.sucesso) {
      alert(dados.mensagem || "Erro ao editar prisma.");
      return;
    }

    prismaEmEdicaoId = null;
    await carregarPrismas();
  } catch (erro) {
    console.error("Erro ao editar prisma:", erro);
    alert("Não foi possível editar o prisma.");
  }
}

/* ==========================================================================
   ESCALA DE FONTE
   ========================================================================== */

async function alterarEscalaBanco(id, campo, delta) {
  const prisma = obterPrismaPorId(id);
  if (!prisma) return;

  const atual = Number(prisma[campo]) || 0;
  const novo  = Math.max(-3, Math.min(6, atual + delta));
  if (novo === atual) return;

  try {
    const resposta = await fetch(`/api/prismas/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [campo]: novo })
    });

    const dados = await resposta.json();
    if (!dados.sucesso) { alert(dados.mensagem || "Erro ao atualizar escala."); return; }

    prisma[campo] = novo;
    renderizarPrismasBanco(prismasCarregados);
  } catch (erro) {
    console.error("Erro ao atualizar escala:", erro);
    alert("Não foi possível atualizar a escala.");
  }
}

function _escalaLabel(val) {
  const n = Number(val) || 0;
  return (n > 0 ? "+" : "") + n;
}

/* ==========================================================================
   REMOVER
   ========================================================================== */

/* ── Confirm Modal ── */
let _confirmCb = null;
function _aceConfirm(titulo, texto, cb) {
  _confirmCb = cb;
  document.getElementById('aceConfirmTitulo').textContent = titulo;
  document.getElementById('aceConfirmTexto').innerHTML = texto;
  document.getElementById('aceConfirmBd').classList.add('open');
}
function _aceConfirmClose() {
  document.getElementById('aceConfirmBd').classList.remove('open');
  _confirmCb = null;
}
function _aceConfirmOk() {
  document.getElementById('aceConfirmBd').classList.remove('open');
  const cb = _confirmCb; _confirmCb = null;
  if (cb) cb();
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') _aceConfirmClose();
});

async function removerPrismaBanco(id) {
  _aceConfirm('Remover prisma', 'Deseja remover este prisma?', async () => {
    try {
      const resposta = await fetch(`/api/prismas/${id}`, { method: "DELETE" });
      const dados = await resposta.json();
      if (!dados.sucesso) { alert(dados.mensagem || "Erro ao remover prisma."); return; }
      idsSelecionados = idsSelecionados.filter(itemId => itemId !== id);
      if (idsSelecionados.length === 0) tipoSelecionadoLote = null;
      if (prismaEmEdicaoId === id) prismaEmEdicaoId = null;
      await carregarPrismas();
    } catch (erro) {
      console.error("Erro ao remover prisma:", erro);
      alert("Não foi possível remover o prisma.");
    }
  });
}

async function excluirSelecionados() {
  if (idsSelecionados.length === 0) {
    showToast("Selecione pelo menos um prisma.", 'aviso');
    return;
  }
  const n = idsSelecionados.length;
  _aceConfirm(
    'Remover selecionados',
    `Deseja remover <strong>${n}</strong> prisma${n > 1 ? 's' : ''} selecionado${n > 1 ? 's' : ''}?`,
    async () => {
      try {
        for (const id of idsSelecionados) {
          await fetch(`/api/prismas/${id}`, { method: "DELETE" });
        }
        limparSelecao();
        await carregarPrismas();
      } catch (erro) {
        console.error("Erro ao excluir selecionados:", erro);
        alert("Não foi possível excluir os prismas selecionados.");
      }
    }
  );
}

function abrirJanelaImpressaoPrismas(prismas) {
  if (!prismas || !prismas.length) {
    showToast("Nenhum prisma para imprimir.", 'aviso');
    return;
  }

  const tipo = prismas[0].tipoPrisma;

  if (prismas.some((p) => p.tipoPrisma !== tipo)) {
    showToast("Só é permitido imprimir prismas do mesmo tipo por vez.", 'aviso');
    return;
  }

  function escapeHtml(texto) {
    return String(texto || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function calcularTamanhoCm(base, escala) {
    const fator = 1.25;
    return ((base + (escala * 0.08)) * fator).toFixed(2);
  }

  function agrupar(array, tamanho) {
    const grupos = [];
    for (let i = 0; i < array.length; i += tamanho) {
      grupos.push(array.slice(i, i + tamanho));
    }
    return grupos;
  }

  const prismasPorFolha = tipo === "pequeno" ? 3 : 1;
  const grupos = agrupar(prismas, prismasPorFolha);

  const folhasHtml = grupos.map((grupo) => {
    const prismasHtml = grupo.map((prisma) => {
      const escalaNome = Number(prisma.escalaNome) || 0;
      const escalaCargo = Number(prisma.escalaCargo) || 0;
      const escalaEmpresa = Number(prisma.escalaEmpresa) || 0;

      const nomeFormatado = (prisma.nome || "").toUpperCase();
      const cargoFormatado = prisma.cargo || "";
      const empresaFormatada = (prisma.empresa || "").toUpperCase();
      const temImagem = !!prisma.imagem;
      const temTexto  = !!(prisma.nome || prisma.cargo || prisma.empresa);

      /* Mesmo modo do preview */
      const modo = temImagem && !temTexto ? "imagem"
                 : temImagem &&  temTexto ? "misto"
                 : "texto";

      const nomeGrande = calcularTamanhoCm(1.1, escalaNome);
      const cargoGrande = calcularTamanhoCm(0.6, escalaCargo);
      const empresaGrande = calcularTamanhoCm(0.8, escalaEmpresa);

      const nomePequeno = calcularTamanhoCm(0.65, escalaNome);
      const cargoPequeno = calcularTamanhoCm(0.4, escalaCargo);
      const empresaPequeno = calcularTamanhoCm(0.55, escalaEmpresa);

      /* Layout unificado: imagem atrás (z-index:1), texto na frente (z-index:2) */
      const pOffX  = (Number(prisma.imgOffsetX) || 0).toFixed(2);
      const pOffY  = (Number(prisma.imgOffsetY) || 0).toFixed(2);
      const pScale = ((Number(prisma.imgZoom) || 100) / 100).toFixed(3);
      const pImgSt = `position:absolute;left:calc(50% + ${pOffX}%);top:calc(50% + ${pOffY}%);transform:translate(-50%,-50%) scale(${pScale});transform-origin:center;max-width:95%;max-height:95%;z-index:1;`;
      const pTxtSt = `position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:2;padding:0.2cm;text-align:center;overflow:hidden;`;

      function buildFace(nomeSize, cargoSize, empresaSize) {
        const imgHtml = temImagem ? `<img src="${prisma.imagem}" style="${pImgSt}" alt="">` : '';
        const txtHtml = temTexto  ? `<div style="${pTxtSt}">
          ${nomeFormatado    ? `<div class="nome"    style="font-size:${nomeSize}cm;">${escapeHtml(nomeFormatado)}</div>`    : ""}
          ${cargoFormatado   ? `<div class="cargo"   style="font-size:${cargoSize}cm;">${escapeHtml(cargoFormatado)}</div>`   : ""}
          ${empresaFormatada ? `<div class="empresa" style="font-size:${empresaSize}cm;">${escapeHtml(empresaFormatada)}</div>` : ""}
        </div>` : '';
        return `<div class="conteudo" style="position:relative;overflow:hidden;">${imgHtml}${txtHtml}</div>`;
      }

      if (tipo === "pequeno") {
        const face = buildFace(nomePequeno, cargoPequeno, empresaPequeno);
        return `
          <div class="prisma prisma-pequeno">
            <div class="metade metade-superior-pequeno">${face}</div>
            <div class="metade metade-inferior-pequeno">${face}</div>
          </div>`;
      }

      const face = buildFace(nomeGrande, cargoGrande, empresaGrande);
      return `
        <div class="prisma prisma-grande">
          <div class="metade metade-superior-grande">${face}</div>
          <div class="metade metade-inferior-grande">${face}</div>
        </div>`;
    }).join("");

    return `<div class="folha folha-${tipo}">${prismasHtml}</div>`;
  }).join("");

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <title>Impressão de Prismas</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 8mm;
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 0;
          background: #fff;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        }

        .folha {
          width: 100%;
          min-height: 26cm;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.25cm;
          page-break-after: always;
          gap: 0.15cm;
        }

        .folha:last-child {
          page-break-after: auto;
        }

        .prisma {
          border: 1px solid #000;
          background: #ececec;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .prisma-pequeno {
          width: 15cm;
          height: 9cm;
        }

        .prisma-grande {
          width: 19.5cm;
          height: 18.6cm;
        }

        .metade {
          flex: 1;
          display: flex;
          align-items: stretch;
          justify-content: center;
          overflow: hidden;
        }

        .metade-superior-pequeno,
        .metade-superior-grande {
          border-top: 1px solid #000;
        }

        .metade-superior-pequeno {
          transform: rotate(180deg);
          transform-origin: center;
        }

        .metade-inferior-pequeno {
          transform: rotate(0deg);
        }

        .metade-superior-grande {
          transform: rotate(180deg);
          transform-origin: center;
        }

        .metade-inferior-grande {
          transform: rotate(0deg);
        }

        .conteudo {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.25cm;
          padding: 0.22cm;
          text-align: center;
        }

        .prisma-grande .conteudo {
          gap: 0.35cm;
          padding: 0.45cm;
        }

        .imagem-box {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .imagem {
          object-fit: contain;
          display: block;
        }

        .imagem-pequena {
          max-width: 1.9cm;
          max-height: 1.9cm;
        }

        .imagem-grande {
          max-width: 4.2cm;
          max-height: 4.2cm;
        }

        .conteudo.modo-imagem { padding: 0; }
        .imagem-cheia { width: 100%; height: 100%; object-fit: cover; display: block; }

        .texto {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .nome {
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          font-weight: 700;
          line-height: 1.05;
          margin-bottom: 0.08cm;
        }

        .cargo {
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 0.06cm;
        }

        .empresa {
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; 
          font-weight: 700;
          line-height: 1.05;
        }
      </style>
    </head>
    <body onload="window.print(); window.close();">
      ${folhasHtml}
    </body>
    </html>
  `;

  _overlayImpressao(html);
}

function _overlayImpressao(htmlContent) {
  const old = document.getElementById('_prntOverlay');
  if (old) old.remove();
  const htmlSemAutoprint = htmlContent.replace(/\s*onload="[^"]*"/, '');
  const ov = document.createElement('div');
  ov.id = '_prntOverlay';
  ov.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#fff;display:flex;flex-direction:column';
  ov.innerHTML = `
    <style>@media(max-width:480px){._acePs{display:none}}</style>
    <div style="padding:10px 14px;background:#fff;border-bottom:1px solid #e5e7eb;display:flex;gap:8px;align-items:center;flex-shrink:0;flex-wrap:wrap">
      <button id="_prntBtn"
        style="background:#10b981;color:#fff;border:none;border-radius:8px;padding:8px 18px;font-weight:700;font-size:.88rem;cursor:pointer;transition:background .12s"
        onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">
        🖨️ Imprimir
      </button>
      <button onclick="document.getElementById('_prntOverlay').remove()"
        style="background:#f3f4f6;color:#374151;border:1.5px solid #e5e7eb;border-radius:8px;padding:8px 14px;font-weight:700;font-size:.88rem;cursor:pointer;transition:all .12s"
        onmouseover="this.style.background='#e5e7eb'" onmouseout="this.style.background='#f3f4f6'">
        ✕ Fechar
      </button>
      <span class="_acePs" style="color:#9ca3af;font-size:.75rem;margin-left:6px">Prévia de impressão</span>
    </div>
    <iframe id="_prntFrame" style="flex:1;border:none;width:100%"></iframe>`;
  document.body.appendChild(ov);
  const f = document.getElementById('_prntFrame');
  f.contentDocument.open();
  f.contentDocument.write(htmlSemAutoprint);
  f.contentDocument.close();
  document.getElementById('_prntBtn').onclick = () => f.contentWindow.print();
}

function imprimirSelecionados() {
  if (idsSelecionados.length === 0) {
    showToast("Selecione pelo menos um prisma.", 'aviso');
    return;
  }

  const prismasSelecionados = prismasCarregados.filter((p) =>
    idsSelecionados.includes(p.id)
  );

  if (!prismasSelecionados.length) {
    alert("Nenhum prisma válido selecionado.");
    return;
  }

  abrirJanelaImpressaoPrismas(prismasSelecionados);
}

async function imprimirPrismaBanco(id) {
  const prisma = obterPrismaPorId(id);

  if (!prisma) {
    alert("Prisma não encontrado.");
    return;
  }

  abrirJanelaImpressaoPrismas([prisma]);
}
/* ==========================================================================
   EVENTOS
   ========================================================================== */

btnBuscarPrismas.addEventListener("click", carregarPrismas);

btnLimparBusca.addEventListener("click", () => {
  buscaTexto.value = "";
  filtroTipoPrisma.value = "";
  if (filtroData)    filtroData.value = "";
  if (filtroDataAte) filtroDataAte.value = "";
  prismaEmEdicaoId = null;
  limparSelecao();
  carregarPrismas();
});

btnLimparSelecao.addEventListener("click", limparSelecao);
btnExcluirSelecionados.addEventListener("click", excluirSelecionados);
btnImprimirSelecionados.addEventListener("click", imprimirSelecionados);

document.addEventListener("DOMContentLoaded", () => {
  atualizarContadorSelecionados();
  carregarPrismas();
});

window.editarPrismaBanco = editarPrismaBanco;
window.cancelarEdicaoPrismaBanco = cancelarEdicaoPrismaBanco;
window.salvarEdicaoPrismaBanco = salvarEdicaoPrismaBanco;
window.removerPrismaBanco = removerPrismaBanco;
window.imprimirPrismaBanco = imprimirPrismaBanco;
window.alternarSelecaoPrisma = alternarSelecaoPrisma;
window.alterarEscalaBanco = alterarEscalaBanco;
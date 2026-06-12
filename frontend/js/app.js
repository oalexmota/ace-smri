/*
|--------------------------------------------------------------------------
| PARTE 1 - MENU
|--------------------------------------------------------------------------
| Essa parte serve para a página inicial, onde existe um elemento com id="menu".
|--------------------------------------------------------------------------
*/

// Função assíncrona para buscar os dados do menu no backend.
async function carregarMenu() {
  try {
    // Procura o elemento do menu na página.
    const menu = document.getElementById("menu");

    // Se a página não tiver menu, não faz nada.
    if (!menu) return;

    // Faz uma requisição para a rota /api/menu
    const resposta = await fetch("/api/menu");

    // Converte a resposta para JSON
    const dados = await resposta.json();

    // Limpa qualquer conteúdo anterior
    menu.innerHTML = "";

    // Verifica se o backend retornou sucesso
    if (dados.sucesso) {
      // Percorre cada item do menu
      dados.dados.forEach(item => {
        // Cria um elemento <li>
        const li = document.createElement("li");

        // Adiciona classe do Bootstrap
        li.className = "list-group-item";

        // Insere um link dentro do <li>
        li.innerHTML = `
          <a href="${item.rota}" class="text-decoration-none">
            ${item.nome}
          </a>
        `;

        // Adiciona o <li> dentro da UL
        menu.appendChild(li);
      });
    }
  } catch (erro) {
    console.error("Erro ao carregar menu:", erro);
  }
}

/*
|--------------------------------------------------------------------------
| PARTE 2 - GERADOR DE PRISMAS
|--------------------------------------------------------------------------
| Essa parte só funciona se os elementos da tela de prisma existirem.
|--------------------------------------------------------------------------
*/

// Array que guarda os prismas digitados
let prismasCadastrados = [];

// tipo de prisma por lote
let tipoPrismaLote = null;

let indiceEmEdicao = null;

// Rascunho: estado atual do formulário para live-preview
let rascunhoPrisma = { nome:'', cargo:'', empresa:'', imagem:null, imgOffsetX:0, imgOffsetY:0, imgZoom:100 };
let _previewTimer  = null;

// Variáveis globais dos elementos da tela.
// Elas podem existir ou não, dependendo da página.
const formPrisma = document.getElementById("formPrisma");
const inputNome = document.getElementById("nome");
const inputCargo = document.getElementById("cargo");
const inputEmpresa = document.getElementById("empresa");
const inputImagemPrisma = document.getElementById("imagemPrisma");
const containerImagem = document.getElementById("containerImagem");
const radioTipoPrisma = document.querySelectorAll('input[name="tipoPrisma"]');
const radioUsarImagem = document.querySelectorAll('input[name="usarImagem"]');
const listaPrismas = document.getElementById("listaPrismas");
const contadorPrismas = document.getElementById("contadorPrismas");
const btnLimparTudo = document.getElementById("btnLimparTudo");
const previewFolhas = document.getElementById("previewFolhas");

/*
|--------------------------------------------------------------------------
| FUNÇÃO AUXILIAR
|--------------------------------------------------------------------------
*/
function obterTamanhosAtuaisPrisma(prisma) {
  const tipo = prisma.tipoPrisma || "pequeno";

  const baseNome = tipo === "grande" ? 42 : 26;
  const baseCargo = tipo === "grande" ? 24 : 18;
  const baseEmpresa = tipo === "grande" ? 30 : 22;

  return {
    nome: calcularTamanhoFonte(baseNome, prisma.escalaNome || 0),
    cargo: calcularTamanhoFonte(baseCargo, prisma.escalaCargo || 0),
    empresa: calcularTamanhoFonte(baseEmpresa, prisma.escalaEmpresa || 0)
  };
}


async function alterarEscalaTexto(indice, campo, delta) {
  const prisma = prismasCadastrados[indice];
  if (!prisma) return;

  prisma[campo] = limitarEscala((prisma[campo] || 0) + delta);

  const atualizado = await atualizarPrismaNoBanco(prisma);
  if (!atualizado) {
    showToast("Não foi possível salvar a alteração de formatação no banco.", 'erro');
    return;
  }

  renderizarListaPrismas();
  await atualizarPreview();
}

function obterTipoPrismaSelecionado() {
  const selecionado = document.querySelector('input[name="tipoPrisma"]:checked');
  return selecionado ? selecionado.value : "grande";
}

function usarImagemSelecionado() {
  const selecionado = document.querySelector('input[name="usarImagem"]:checked');
  return selecionado ? selecionado.value === "sim" : false;
}

function limparTexto(texto) {
  return texto.trim();
}

function lerImagemComoBase64(arquivo) {
  return new Promise((resolve, reject) => {
    if (!arquivo) {
      resolve(null);
      return;
    }

    const reader = new FileReader();

    reader.onload = function () {
      resolve(reader.result);
    };

    reader.onerror = function () {
      reject(new Error("Erro ao ler a imagem."));
    };

    reader.readAsDataURL(arquivo);
  });
}

function atualizarVisibilidadeImagem() {
  if (!containerImagem) return;

  if (usarImagemSelecionado()) {
    containerImagem.classList.remove("d-none");
  } else {
    containerImagem.classList.add("d-none");

    if (inputImagemPrisma) {
      inputImagemPrisma.value = "";
    }
  }
}

function bloquearTipoPrisma(tipoSelecionado) {
  const radioPequeno = document.getElementById("tipoPequeno");
  const radioGrande = document.getElementById("tipoGrande");

  if (!radioPequeno || !radioGrande) return;

  tipoPrismaLote = tipoSelecionado;

  if (tipoSelecionado === "pequeno") {
    radioPequeno.checked = true;
    radioPequeno.disabled = false;
    radioGrande.checked = false;
    radioGrande.disabled = true;
  } else if (tipoSelecionado === "grande") {
    radioGrande.checked = true;
    radioGrande.disabled = false;
    radioPequeno.checked = false;
    radioPequeno.disabled = true;
  }
}

function liberarTipoPrisma() {
  const radioPequeno = document.getElementById("tipoPequeno");
  const radioGrande = document.getElementById("tipoGrande");

  if (!radioPequeno || !radioGrande) return;

  tipoPrismaLote = null;
  radioPequeno.disabled = false;
  radioGrande.disabled = false;
}

/* ── Layout local (sem chamada ao servidor) ── */
function gerarLayoutLocal(tipoPrisma, prismas) {
  const prismasPorFolha = tipoPrisma === "pequeno" ? 3 : 1;
  const folhas = [];
  for (let i = 0; i < prismas.length; i += prismasPorFolha) {
    const grupo = prismas.slice(i, i + prismasPorFolha);
    folhas.push({
      numeroFolha: Math.floor(i / prismasPorFolha) + 1,
      quantidadeNaFolha: grupo.length,
      prismas: grupo
    });
  }
  return { folhas, configuracao: { tipoPrisma, prismasPorFolha } };
}

function temConteudoRascunho() {
  return !!(rascunhoPrisma.nome || rascunhoPrisma.cargo || rascunhoPrisma.empresa || rascunhoPrisma.imagem);
}

function atualizarPreviewComRascunho() {
  if (!previewFolhas) return;
  const tipoPrisma = tipoPrismaLote || obterTipoPrismaSelecionado();

  // Marca o prisma em edição como interativo
  const lista = prismasCadastrados.map((p, i) => ({
    ...p,
    _isEditing: (indiceEmEdicao === i)
  }));
  if (temConteudoRascunho()) {
    lista.push({ ...rascunhoPrisma, tipoPrisma, _isDraft: true });
  }

  if (!lista.length) {
    previewFolhas.innerHTML = `
      <div class="estado-vazio-preview">
        Preencha os campos ao lado para ver a pré-visualização em tempo real.
      </div>`;
    return;
  }

  const layout = gerarLayoutLocal(tipoPrisma, lista);
  renderizarPreviewFolhas(layout);
  hookPreviewImages();
  // Zoom via scroll na imagem
  _hookScrollZoom();
}

let _scrollZoomHooked = false;
function _hookScrollZoom() {
  if (_scrollZoomHooked || !previewFolhas) return;
  _scrollZoomHooked = true;
  previewFolhas.addEventListener('wheel', (e) => {
    const img = e.target.closest('[data-img-key]');
    if (!img) return;
    e.preventDefault();
    const imgKey = img.dataset.imgKey;
    const target = _imgGetTarget(imgKey);
    if (!target) return;
    const delta = e.deltaY > 0 ? -5 : 5; // scroll cima = zoom in
    target.imgZoom = Math.max(20, Math.min(500, (target.imgZoom || 100) + delta));
    _imgApplyTransform(target, imgKey);
    if (imgKey === 'draft') {
      const sl = document.getElementById('imgZoomSlider');
      const vl = document.getElementById('imgZoomVal');
      if (sl) sl.value = target.imgZoom;
      if (vl) vl.textContent = Math.round(target.imgZoom);
    } else if (imgKey === 'edit' && indiceEmEdicao !== null) {
      // Sincroniza o slider do formulário de edição
      const sl = document.getElementById(`editZoomSlider_${indiceEmEdicao}`);
      const lb = document.getElementById(`editZoomLbl_${indiceEmEdicao}`);
      if (sl) sl.value = target.imgZoom;
      if (lb) lb.textContent = Math.round(target.imgZoom);
    }
  }, { passive: false });
}

function atualizarPreviewDebounced() {
  clearTimeout(_previewTimer);
  _previewTimer = setTimeout(atualizarPreviewComRascunho, 180);
}

async function atualizarPreview() {
  atualizarPreviewComRascunho();
}

function limitarEscala(valor) {
  return Math.max(-3, Math.min(6, valor));
}

function _clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }

/* ── Drag de imagem no preview (rascunho) ── */
let _imgDrag = null;

function hookPreviewImages() {
  if (!previewFolhas) return;
  previewFolhas.querySelectorAll('[data-img-key]').forEach(img => {
    img.addEventListener('mousedown',  _imgMouseDown);
    img.addEventListener('touchstart', _imgTouchStart, { passive: false });
  });
}

/* Aplica posição+zoom nos imgs interativos sem re-renderizar */
function _imgApplyTransform(target, imgKey) {
  const offX = (target.imgOffsetX || 0).toFixed(2);
  const offY = (target.imgOffsetY || 0).toFixed(2);
  const sc   = ((target.imgZoom || 100) / 100).toFixed(3);
  previewFolhas && previewFolhas.querySelectorAll(`[data-img-key="${imgKey}"]`).forEach(img => {
    img.style.left      = `calc(50% + ${offX}%)`;
    img.style.top       = `calc(50% + ${offY}%)`;
    img.style.transform = `translate(-50%,-50%) scale(${sc})`;
  });
}

function _imgGetTarget(imgKey) {
  if (imgKey === 'draft') return rascunhoPrisma;
  if (imgKey === 'edit' && indiceEmEdicao !== null) return prismasCadastrados[indiceEmEdicao];
  return null;
}

const SNAP_THRESH = 3; // % — limiar para snap ao centro

function _imgMouseDown(e) {
  if (e.button !== 0) return;
  e.preventDefault();
  const img    = e.currentTarget;
  const imgKey = img.dataset.imgKey;
  const target = _imgGetTarget(imgKey);
  if (!target) return;

  // Usa a .p-face como referência (imagem agora é filha direta da face)
  const face = img.closest('.p-face') || img.parentElement;
  _imgDrag = {
    img, target, imgKey,
    rect:      face.getBoundingClientRect(),
    startX:    e.clientX,
    startY:    e.clientY,
    startOffX: target.imgOffsetX || 0,
    startOffY: target.imgOffsetY || 0,
  };
  img.style.cursor = 'grabbing';
  window.addEventListener('mousemove', _imgMouseMove);
  window.addEventListener('mouseup',   _imgMouseUp);
}

function _imgMouseMove(e) {
  if (!_imgDrag) return;
  const { rect, startX, startY, startOffX, startOffY, target, imgKey } = _imgDrag;
  const dx = (e.clientX - startX) / rect.width  * 100;
  const dy = (e.clientY - startY) / rect.height * 100;

  const rawX = startOffX + dx;
  const rawY = startOffY + dy;
  const snapX = Math.abs(rawX) < SNAP_THRESH;
  const snapY = Math.abs(rawY) < SNAP_THRESH;
  target.imgOffsetX = snapX ? 0 : rawX;
  target.imgOffsetY = snapY ? 0 : rawY;

  // Mostra/oculta linhas guia de snap
  previewFolhas && previewFolhas.querySelectorAll(`.ace-guide-h[data-guide-key="${imgKey}"]`)
    .forEach(g => { g.style.display = snapY ? 'block' : 'none'; });
  previewFolhas && previewFolhas.querySelectorAll(`.ace-guide-v[data-guide-key="${imgKey}"]`)
    .forEach(g => { g.style.display = snapX ? 'block' : 'none'; });

  _imgApplyTransform(target, imgKey);
}

function _imgMouseUp() {
  if (!_imgDrag) return;
  _imgDrag.img.style.cursor = 'grab';
  const { imgKey } = _imgDrag;
  _imgDrag = null;
  window.removeEventListener('mousemove', _imgMouseMove);
  window.removeEventListener('mouseup',   _imgMouseUp);
  // Oculta todas as linhas guia
  previewFolhas && previewFolhas.querySelectorAll(`[data-guide-key="${imgKey}"]`)
    .forEach(g => { g.style.display = 'none'; });
  atualizarPreviewComRascunho();
  hookPreviewImages();
}

function _imgTouchStart(e) {
  if (e.touches.length !== 1) return;
  e.preventDefault();
  const t = e.touches[0];
  _imgMouseDown({ button:0, clientX:t.clientX, clientY:t.clientY,
                  currentTarget:e.currentTarget, preventDefault:()=>{} });
  window.removeEventListener('mousemove', _imgMouseMove);
  window.removeEventListener('mouseup',   _imgMouseUp);
  window.addEventListener('touchmove', _imgTouchMove, { passive:false });
  window.addEventListener('touchend',  _imgTouchEnd);
}

function _imgTouchMove(e) {
  if (e.touches.length !== 1) return;
  e.preventDefault();
  _imgMouseMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
}

function _imgTouchEnd() {
  _imgMouseUp();
  window.removeEventListener('touchmove', _imgTouchMove);
  window.removeEventListener('touchend',  _imgTouchEnd);
}

function calcularTamanhoFonte(base, escala) {
  return base + (escala * 2);
}

function obterEstilosTextoPrisma(prisma) {
  const tipo = prisma.tipoPrisma || "pequeno";

  let baseNome = tipo === "grande" ? 42 : 26;
  let baseCargo = tipo === "grande" ? 24 : 18;
  let baseEmpresa = tipo === "grande" ? 30 : 22;

  return {
    nome: calcularTamanhoFonte(baseNome, prisma.escalaNome || 0),
    cargo: calcularTamanhoFonte(baseCargo, prisma.escalaCargo || 0),
    empresa: calcularTamanhoFonte(baseEmpresa, prisma.escalaEmpresa || 0)
  };
}

/*
|--------------------------------------------------------------------------
| FUNÇÃO: renderizarListaPrismas
|--------------------------------------------------------------------------
*/
function renderizarListaPrismas() {
  if (!listaPrismas || !contadorPrismas) return;

  contadorPrismas.textContent = prismasCadastrados.length;

  if (prismasCadastrados.length === 0) {
    listaPrismas.innerHTML = `<p class="text-muted mb-0">Nenhum prisma adicionado ainda.</p>`;
    return;
  }

  listaPrismas.innerHTML = "";

  prismasCadastrados.forEach((prisma, indice) => {
    const div = document.createElement("div");
    div.className = "item-prisma-lista";

    const estaEditando = indiceEmEdicao === indice;
    const tamanhos = obterTamanhosAtuaisPrisma(prisma);
    const tituloCard = prisma.nome || prisma._nomeArquivo || "(Sem nome)";

    if (estaEditando) {
      div.innerHTML = `
        <h3>${indice + 1}. Editando prisma</h3>

        <div class="mb-2">
          <label class="form-label mb-1"><strong>Nome</strong></label>
          <input type="text" class="form-control form-control-sm" id="editNome_${indice}" value="${prisma.nome || ""}">
        </div>

        <div class="mb-2">
          <label class="form-label mb-1"><strong>Cargo</strong></label>
          <input type="text" class="form-control form-control-sm" id="editCargo_${indice}" value="${prisma.cargo || ""}">
        </div>

        <div class="mb-2">
          <label class="form-label mb-1"><strong>Empresa</strong></label>
          <input type="text" class="form-control form-control-sm" id="editEmpresa_${indice}" value="${prisma.empresa || ""}">
        </div>

        <div class="mb-2">
          <label class="form-label mb-1"><strong>Imagem</strong></label>
          ${prisma.imagem
            ? `<div class="mb-1"><img src="${prisma.imagem}" style="max-width:56px;max-height:56px;object-fit:contain;border:1px solid #dee2e6;border-radius:4px;" alt=""></div>`
            : `<p class="text-muted mb-1" style="font-size:.8rem">Nenhuma imagem</p>`}
          <input type="file" class="form-control form-control-sm" id="editImagem_${indice}" accept="image/*">
          <small class="text-muted">Deixe vazio para manter a imagem atual.</small>
        </div>

        ${prisma.imagem ? `
        <div class="mb-3">
          <label class="form-label mb-1">
            <strong>Zoom:</strong>
            <span id="editZoomLbl_${indice}">${Math.round(prisma.imgZoom || 100)}</span>%
          </label>
          <input type="range" class="form-range" id="editZoomSlider_${indice}"
            min="20" max="300" value="${Math.round(prisma.imgZoom || 100)}"
            oninput="ajustarZoomEdicao(${indice}, this.value)">
          <div class="d-flex gap-2 mt-1">
            <button type="button" class="btn btn-sm btn-outline-primary"
              onclick="resetarPosicaoEdicao(${indice})">Centralizar</button>
          </div>
        </div>` : ''}


        <div class="acoes-item d-flex gap-2 flex-wrap">
          <button
            type="button"
            class="btn btn-sm btn-success"
            onclick="salvarEdicaoPrisma(${indice})"
          >
            Salvar
          </button>

          <button
            type="button"
            class="btn btn-sm btn-outline-secondary"
            onclick="cancelarEdicaoPrisma()"
          >
            Cancelar
          </button>
        </div>
      `;
    } else {
      div.innerHTML = `
        <h3>${indice + 1}. ${tituloCard}</h3>

              <div class="mb-2">
          <p class="mb-1"><strong>Nome:</strong> ${
            prisma.nome
              ? prisma.nome
              : prisma._nomeArquivo
                ? `<span class="text-muted fst-italic">${prisma._nomeArquivo}</span>`
                : '-'
          }</p>
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="alterarEscalaTexto(${indice}, 'escalaNome', -1)">A-</button>
            <span class="badge bg-light text-dark border"> ${tamanhos.nome}px </span>
            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="alterarEscalaTexto(${indice}, 'escalaNome', 1)">A+</button>
          </div>
        </div>

        <div class="mb-2">
          <p class="mb-1"><strong>Cargo:</strong> ${prisma.cargo || "-"}</p>
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="alterarEscalaTexto(${indice}, 'escalaCargo', -1)">A-</button>
            <span class="badge bg-light text-dark border"> ${tamanhos.cargo}px </span>
            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="alterarEscalaTexto(${indice}, 'escalaCargo', 1)">A+</button>
          </div>
        </div>

        <div class="mb-2">
          <p class="mb-1"><strong>Empresa:</strong> ${prisma.empresa || "-"}</p>
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="alterarEscalaTexto(${indice}, 'escalaEmpresa', -1)">A-</button>
            <span class="badge bg-light text-dark border"> ${tamanhos.empresa}px </span>
            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="alterarEscalaTexto(${indice}, 'escalaEmpresa', 1)">A+</button>
          </div>
        </div>
        <p><strong>Tipo:</strong> ${prisma.tipoPrisma || "-"}</p>
        <p><strong>Imagem:</strong> ${prisma.imagem ? "Sim" : "Não"}</p>

        <div class="acoes-item d-flex gap-2 flex-wrap">
          <button
            type="button"
            class="btn btn-sm btn-outline-primary"
            onclick="editarPrisma(${indice})"
          >
            Editar
          </button>

          <button
            type="button"
            class="btn btn-sm btn-outline-danger"
            onclick="removerPrisma(${indice})"
          >
            Remover
          </button>
        </div>
      `;
    }

    listaPrismas.appendChild(div);
  });
}

/*
Função editar prismas
*/
function editarPrisma(indice) {
  indiceEmEdicao = indice;
  renderizarListaPrismas();
  // Atualiza preview para marcar a imagem do prisma como interativa (drag/zoom)
  atualizarPreviewComRascunho();
  hookPreviewImages();
}

function cancelarEdicaoPrisma() {
  indiceEmEdicao = null;
  renderizarListaPrismas();
  atualizarPreviewComRascunho();
}

async function salvarEdicaoPrisma(indice) {
  const inputNomeEl    = document.getElementById(`editNome_${indice}`);
  const inputCargoEl   = document.getElementById(`editCargo_${indice}`);
  const inputEmpresaEl = document.getElementById(`editEmpresa_${indice}`);
  const inputImagemEl  = document.getElementById(`editImagem_${indice}`);

  if (!inputNomeEl || !inputCargoEl || !inputEmpresaEl) return;

  prismasCadastrados[indice].nome    = inputNomeEl.value.trim();
  prismasCadastrados[indice].cargo   = inputCargoEl.value.trim();
  prismasCadastrados[indice].empresa = inputEmpresaEl.value.trim();

  // Carrega nova imagem se selecionada
  if (inputImagemEl && inputImagemEl.files[0]) {
    try {
      prismasCadastrados[indice].imagem = await lerImagemComoBase64(inputImagemEl.files[0]);
      prismasCadastrados[indice]._imagemAlterada = true;
    } catch (e) {
      showToast("Não foi possível carregar a imagem.", 'erro');
      return;
    }
  }

  const atualizado = await atualizarPrismaNoBanco(prismasCadastrados[indice]);
  if (!atualizado) {
    showToast("Não foi possível atualizar o prisma no banco.", 'erro');
    return;
  }

  delete prismasCadastrados[indice]._imagemAlterada;
  indiceEmEdicao = null;
  renderizarListaPrismas();
  await atualizarPreview();
}

async function salvarPrismaNoBanco(prisma) {
  try {
    const resposta = await fetch("/api/prismas/salvar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(prisma)
    });

    const dados = await resposta.json();

    if (!dados.sucesso) {
      console.error("Erro ao salvar no banco:", dados.mensagem);
      return null;
    }

    return dados.id;
  } catch (erro) {
    console.error("Erro ao salvar prisma no banco:", erro);
    return null;
  }
}

async function atualizarPrismaNoBanco(prisma) {
  if (!prisma.id) return true;

  const payload = {
    nome:         prisma.nome,
    cargo:        prisma.cargo,
    empresa:      prisma.empresa,
    escalaNome:   prisma.escalaNome,
    escalaCargo:  prisma.escalaCargo,
    escalaEmpresa: prisma.escalaEmpresa,
  };
  // Envia imagem apenas quando foi explicitamente alterada na edição
  if (prisma._imagemAlterada) {
    payload.imagem = prisma.imagem || null;
  }

  try {
    const resposta = await fetch(`/api/prismas/${prisma.id}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload)
    });

    const dados = await resposta.json();
    return !!dados.sucesso;
  } catch (erro) {
    console.error("Erro ao atualizar prisma no banco:", erro);
    return false;
  }
}
/*
|--------------------------------------------------------------------------
| FUNÇÃO: removerPrisma
|--------------------------------------------------------------------------
*/

async function removerPrismaDoBanco(id) {
  if (!id) return true;

  try {
    const resposta = await fetch(`/api/prismas/${id}`, {
      method: "DELETE"
    });

    const dados = await resposta.json();
    return !!dados.sucesso;
  } catch (erro) {
    console.error("Erro ao remover prisma do banco:", erro);
    return false;
  }
}

async function removerPrisma(indice) {
  const prisma = prismasCadastrados[indice];

  if (prisma && prisma.id) {
    const removidoBanco = await removerPrismaDoBanco(prisma.id);
    if (!removidoBanco) {
      showToast("Não foi possível remover o prisma do banco.", 'erro');
      return;
    }
  }

  prismasCadastrados.splice(indice, 1);

  if (indiceEmEdicao === indice) {
    indiceEmEdicao = null;
  } else if (indiceEmEdicao !== null && indiceEmEdicao > indice) {
    indiceEmEdicao--;
  }

  if (prismasCadastrados.length === 0) {
    tipoPrismaLote = null;
    liberarTipoPrisma();
  }

  renderizarListaPrismas();
  await atualizarPreview();
}

/*
|--------------------------------------------------------------------------
| FUNÇÃO: limparFormulario
|--------------------------------------------------------------------------
*/
function limparFormulario() {
  if (!inputNome || !inputCargo || !inputEmpresa) return;

  inputNome.value = "";
  inputCargo.value = "";
  inputEmpresa.value = "";

  const radioImagemNao = document.getElementById("usarImagemNao");

  if (radioImagemNao) radioImagemNao.checked = true;

  if (inputImagemPrisma) {
    inputImagemPrisma.value = "";
  }

  atualizarVisibilidadeImagem();
  inputNome.focus();
}
/*
|--------------------------------------------------------------------------
| FUNÇÃO: criarConteudoPrisma
|--------------------------------------------------------------------------
*/
function criarConteudoPrisma(prisma) {
  const temImagem = !!(prisma.imagem && prisma.imagem.trim() !== "");
  const temTexto  = !!(prisma.nome || prisma.cargo || prisma.empresa);

  const tamanhos = obterEstilosTextoPrisma(prisma);
  const nome    = (prisma.nome    || "").toUpperCase();
  const cargo   =  prisma.cargo   || "";
  const empresa = (prisma.empresa || "").toUpperCase();

  // Interatividade de drag
  const isDraft    = !!prisma._isDraft;
  const isEditing  = !!prisma._isEditing;
  const interactive = isDraft || isEditing;
  const imgKey      = isDraft ? 'draft' : (isEditing ? 'edit' : null);

  // Posição da imagem: left/top = 50% + offset% do container
  const offX  = (prisma.imgOffsetX !== undefined ? prisma.imgOffsetX : 0).toFixed(2);
  const offY  = (prisma.imgOffsetY !== undefined ? prisma.imgOffsetY : 0).toFixed(2);
  const iZoom = (prisma.imgZoom    !== undefined ? prisma.imgZoom    : 100);
  const imgSt = [
    `position:absolute`,
    `left:calc(50% + ${offX}%)`,
    `top:calc(50% + ${offY}%)`,
    `transform:translate(-50%,-50%) scale(${(iZoom/100).toFixed(3)})`,
    `transform-origin:center`,
    `max-width:95%`,
    `max-height:95%`,
    `z-index:1`,
    interactive ? 'cursor:grab' : '',
  ].filter(Boolean).join(';') + ';';
  const keyAttr  = interactive ? `data-img-key="${imgKey}"` : '';

  // Linhas guia de snap (visíveis só durante drag)
  const guias = interactive ? `
    <div class="ace-guide-h" data-guide-key="${imgKey}"
      style="display:none;position:absolute;left:0;right:0;top:50%;height:1px;background:#e00;z-index:10;pointer-events:none;"></div>
    <div class="ace-guide-v" data-guide-key="${imgKey}"
      style="display:none;position:absolute;top:0;bottom:0;left:50%;width:1px;background:#e00;z-index:10;pointer-events:none;"></div>
  ` : '';

  // Imagem: layer atrás do texto (z-index:1)
  const imgLayer = temImagem
    ? `${guias}<img src="${prisma.imagem}" alt="" style="${imgSt}" ${keyAttr}>`
    : '';

  // Texto: layer na frente, sempre centralizado (z-index:2)
  const textLayer = temTexto ? `
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:2;pointer-events:none;padding:8px;overflow:hidden;text-align:center;">
      ${nome    ? `<div class="p-nome"    style="font-size:${tamanhos.nome}px">${nome}</div>`    : ""}
      ${cargo   ? `<div class="p-cargo"   style="font-size:${tamanhos.cargo}px">${cargo}</div>`  : ""}
      ${empresa ? `<div class="p-empresa" style="font-size:${tamanhos.empresa}px">${empresa}</div>` : ""}
    </div>` : '';

  const face = `<div class="p-face">${imgLayer}${textLayer}</div>`;

  if (prisma.tipoPrisma === "pequeno") {
    return `
      <div class="metade-prisma-pequeno metade-prisma-pequeno-superior">${face}</div>
      <div class="metade-prisma-pequeno metade-prisma-pequeno-inferior">${face}</div>
    `;
  }
  return `
    <div class="metade-prisma metade-prisma-superior">${face}</div>
    <div class="metade-prisma metade-prisma-inferior">${face}</div>
  `;
}

/*
|--------------------------------------------------------------------------
| FUNÇÃO: renderizarPreviewFolhas
|--------------------------------------------------------------------------
*/
function renderizarPreviewFolhas(layout) {
  if (!previewFolhas) return;

  previewFolhas.innerHTML = "";

  layout.folhas.forEach(folha => {
    const divFolha = document.createElement("div");
    divFolha.className = `folha tipo-${layout.configuracao.tipoPrisma} quantidade-${layout.configuracao.prismasPorFolha}`;

    const tituloFolha = document.createElement("div");
    tituloFolha.className = "folha-titulo";
    tituloFolha.textContent = `Folha ${folha.numeroFolha} • ${folha.quantidadeNaFolha} prisma(s)`;

    const areaPrismas = document.createElement("div");
    areaPrismas.className = "area-prismas-folha";

    folha.prismas.forEach(prisma => {
      const divPrisma = document.createElement("div");
      divPrisma.className = "prisma" + (prisma._isDraft ? " rascunho" : "");
      divPrisma.innerHTML = criarConteudoPrisma(prisma);

      areaPrismas.appendChild(divPrisma);
    });

    divFolha.appendChild(tituloFolha);
    divFolha.appendChild(areaPrismas);

    previewFolhas.appendChild(divFolha);
  });
}

/*
|--------------------------------------------------------------------------
| INICIALIZAÇÃO DA TELA DE PRISMAS
|--------------------------------------------------------------------------
| Só adiciona eventos se a página realmente tiver o formulário.
|--------------------------------------------------------------------------
*/
function inicializarTelaPrismas() {
  // Se não existir formulário, significa que não estamos na página de prismas
  if (!formPrisma) return;

  renderizarListaPrismas();

  atualizarVisibilidadeImagem();

  /* ── Live preview: atualiza rascunho a cada keystroke ── */
  function syncRascunhoTexto() {
    rascunhoPrisma.nome    = inputNome    ? inputNome.value    : '';
    rascunhoPrisma.cargo   = inputCargo   ? inputCargo.value   : '';
    rascunhoPrisma.empresa = inputEmpresa ? inputEmpresa.value : '';
  }

  [inputNome, inputCargo, inputEmpresa].forEach(inp => {
    if (inp) inp.addEventListener('input', () => { syncRascunhoTexto(); atualizarPreviewDebounced(); });
  });

  // Zoom slider
  const imgZoomWrap   = document.getElementById('imgZoomWrap');
  const imgZoomSlider = document.getElementById('imgZoomSlider');
  const imgZoomVal    = document.getElementById('imgZoomVal');

  if (imgZoomSlider) {
    imgZoomSlider.addEventListener('input', () => {
      const zoom = parseInt(imgZoomSlider.value, 10);
      if (imgZoomVal) imgZoomVal.textContent = zoom;
      rascunhoPrisma.imgZoom = zoom;
      _imgApplyTransform(rascunhoPrisma, 'draft');
    });
  }

  // Botão Centralizar (rascunho)
  const btnCentralizarRascunho = document.getElementById('btnCentralizarRascunho');
  if (btnCentralizarRascunho) {
    btnCentralizarRascunho.addEventListener('click', () => {
      rascunhoPrisma.imgOffsetX = 0;
      rascunhoPrisma.imgOffsetY = 0;
      rascunhoPrisma.imgZoom    = 100;
      if (imgZoomSlider) imgZoomSlider.value = 100;
      if (imgZoomVal)    imgZoomVal.textContent = '100';
      _imgApplyTransform(rascunhoPrisma, 'draft');
    });
  }

  // Seleção de imagem → carrega base64, preenche nome e mostra controles
  if (inputImagemPrisma) {
    inputImagemPrisma.addEventListener('change', async () => {
      if (inputImagemPrisma.files[0]) {
        const file = inputImagemPrisma.files[0];
        rascunhoPrisma.imagem   = await lerImagemComoBase64(file);
        rascunhoPrisma.imgOffsetX = 0;
        rascunhoPrisma.imgOffsetY = 0;
        rascunhoPrisma.imgZoom  = 100;
        if (imgZoomSlider) imgZoomSlider.value = 100;
        if (imgZoomVal)    imgZoomVal.textContent = '100';
        if (imgZoomWrap)   imgZoomWrap.classList.remove('d-none');

        // Salva o nome do arquivo (sem extensão) apenas como label do card —
        // NÃO preenche o campo "Nome" para não aparecer texto no prisma
        rascunhoPrisma._nomeArquivo = file.name.replace(/\.[^/.]+$/, '');
      } else {
        rascunhoPrisma.imagem = null;
        if (imgZoomWrap) imgZoomWrap.classList.add('d-none');
      }
      atualizarPreviewComRascunho();
      hookPreviewImages();
    });
  }

  radioUsarImagem.forEach(radio => {
    radio.addEventListener("change", () => {
      atualizarVisibilidadeImagem();
      if (!usarImagemSelecionado()) {
        rascunhoPrisma.imagem = null;
        const imgZoomWrap = document.getElementById('imgZoomWrap');
        if (imgZoomWrap) imgZoomWrap.classList.add('d-none');
        atualizarPreviewDebounced();
      }
    });
  });

  // Mudança de tipo → re-renderiza rascunho
  radioTipoPrisma.forEach(r => r.addEventListener('change', atualizarPreviewDebounced));

  /* ── Submit: salvar prisma ── */
  formPrisma.addEventListener("submit", async function (event) {
    event.preventDefault();

    const nome     = limparTexto(inputNome.value);
    const cargo    = limparTexto(inputCargo.value);
    const empresa  = limparTexto(inputEmpresa.value);
    const tipoPrisma = tipoPrismaLote || obterTipoPrismaSelecionado();
    const desejaImagem = usarImagemSelecionado();

    // Usa a imagem já carregada no rascunho (evita re-leitura)
    const imagemBase64 = desejaImagem ? rascunhoPrisma.imagem : null;

    if (!nome && !cargo && !empresa && !imagemBase64) {
      showToast("Preencha pelo menos um campo ou selecione uma imagem.", 'aviso');
      return;
    }

    const novoPrisma = {
      nome, cargo, empresa,
      imagem: imagemBase64,
      tipoPrisma,
      escalaNome: 0, escalaCargo: 0, escalaEmpresa: 0,
      imgOffsetX:    rascunhoPrisma.imgOffsetX    || 0,
      imgOffsetY:    rascunhoPrisma.imgOffsetY    || 0,
      imgZoom:       rascunhoPrisma.imgZoom       || 100,
      _nomeArquivo:  rascunhoPrisma._nomeArquivo  || '',
    };

    const idBanco = await salvarPrismaNoBanco(novoPrisma);
    if (idBanco) novoPrisma.id = idBanco;

    prismasCadastrados.push(novoPrisma);
    if (!tipoPrismaLote) bloquearTipoPrisma(tipoPrisma);

    // Limpa rascunho
    rascunhoPrisma = { nome:'', cargo:'', empresa:'', imagem:null, imgOffsetX:0, imgOffsetY:0, imgZoom:100 };
    const _izw = document.getElementById('imgZoomWrap');
    if (_izw) _izw.classList.add('d-none');
    const _izs = document.getElementById('imgZoomSlider');
    if (_izs) _izs.value = 100;
    const _izv = document.getElementById('imgZoomVal');
    if (_izv) _izv.textContent = '100';

    renderizarListaPrismas();
    atualizarPreviewComRascunho();
    limparFormulario();
  });
}

/* ── Toast ── */
function showToast(msg, tipo) {
  let t = document.getElementById('aceToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'aceToast';
    t.style.cssText = 'position:fixed;bottom:20px;right:20px;padding:9px 18px;border-radius:10px;font-size:.83rem;font-weight:500;z-index:9999;opacity:0;transform:translateY(7px);transition:all .22s;pointer-events:none;color:#fff;max-width:320px';
    document.body.appendChild(t);
  }
  t.style.background = tipo === 'erro' ? '#ef4444' : tipo === 'aviso' ? '#f59e0b' : '#1f2937';
  t.textContent = msg;
  t.style.opacity = '1';
  t.style.transform = 'translateY(0)';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(7px)'; }, 3500);
}

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
document.addEventListener('keydown', e => { if (e.key === 'Escape') _aceConfirmClose(); });

// Evento de limpar tudo
if (btnLimparTudo) {
  btnLimparTudo.addEventListener("click", function () {
    _aceConfirm('Limpar tudo', 'Deseja limpar todos os prismas e a pré-visualização?', () => {
      prismasCadastrados = [];
      tipoPrismaLote = null;
      indiceEmEdicao = null;
      rascunhoPrisma = { nome:'', cargo:'', empresa:'', imagem:null, imgOffsetX:0, imgOffsetY:0, imgZoom:100 };
      liberarTipoPrisma();
      renderizarListaPrismas();
      limparFormulario();

      if (previewFolhas) {
        previewFolhas.innerHTML = `
            <div class="estado-vazio-preview">
              Preencha os campos ao lado para ver a pré-visualização em tempo real.
            </div>
          `;
      }
      const _izw2 = document.getElementById('imgZoomWrap');
      if (_izw2) _izw2.classList.add('d-none');
    });
  });
}

/*
|--------------------------------------------------------------------------
| INICIALIZAÇÃO GERAL
|--------------------------------------------------------------------------
*/
document.addEventListener("DOMContentLoaded", function () {
  carregarMenu();
  inicializarTelaPrismas();
});

/*
|--------------------------------------------------------------------------
| IMPRESSÃO — janela isolada (mesma abordagem da lista de prismas)
|--------------------------------------------------------------------------
*/
function calcularTamanhoCmLocal(base, escala) {
  const fator = 1.25;
  return ((base + (escala * 0.08)) * fator).toFixed(2);
}

function agruparEmFolhas(array, tamanho) {
  const grupos = [];
  for (let i = 0; i < array.length; i += tamanho) {
    grupos.push(array.slice(i, i + tamanho));
  }
  return grupos;
}

function abrirJanelaImpressao(prismas) {
  if (!prismas || !prismas.length) {
    showToast("Nenhum prisma para imprimir.", 'aviso');
    return;
  }

  const tipo = prismas[0].tipoPrisma;

  function esc(t) {
    return String(t || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  const prismasPorFolha = tipo === "pequeno" ? 3 : 1;
  const grupos = agruparEmFolhas(prismas, prismasPorFolha);

  const folhasHtml = grupos.map((grupo) => {
    const prismasHtml = grupo.map((prisma) => {
      const eNome    = Number(prisma.escalaNome)    || 0;
      const eCargo   = Number(prisma.escalaCargo)   || 0;
      const eEmpresa = Number(prisma.escalaEmpresa) || 0;

      const nomeText    = esc((prisma.nome    || "").toUpperCase());
      const cargoText   = esc(prisma.cargo   || "");
      const empresaText = esc((prisma.empresa || "").toUpperCase());
      const temImagem   = !!prisma.imagem;
      const temTexto    = !!(prisma.nome || prisma.cargo || prisma.empresa);

      /* Mesmo modo do preview: imagem / misto / texto */
      const modo = temImagem && !temTexto ? "imagem"
                 : temImagem &&  temTexto ? "misto"
                 : "texto";

      /* Calcular tamanhos de fonte em cm respeitando escalas */
      const nomeGrande    = calcularTamanhoCmLocal(1.1,  eNome);
      const cargoGrande   = calcularTamanhoCmLocal(0.6,  eCargo);
      const empresaGrande = calcularTamanhoCmLocal(0.8,  eEmpresa);
      const nomePequeno    = calcularTamanhoCmLocal(0.65, eNome);
      const cargoPequeno   = calcularTamanhoCmLocal(0.40, eCargo);
      const empresaPequeno = calcularTamanhoCmLocal(0.55, eEmpresa);

      const nomeSize    = tipo === "pequeno" ? nomePequeno    : nomeGrande;
      const cargoSize   = tipo === "pequeno" ? cargoPequeno   : cargoGrande;
      const empresaSize = tipo === "pequeno" ? empresaPequeno : empresaGrande;

      /* Layout unificado: imagem atrás (z-index:1), texto na frente (z-index:2) */
      const pOffX  = (Number(prisma.imgOffsetX) || 0).toFixed(2);
      const pOffY  = (Number(prisma.imgOffsetY) || 0).toFixed(2);
      const pScale = ((Number(prisma.imgZoom)   || 100) / 100).toFixed(3);
      const pImgSt = `position:absolute;left:calc(50% + ${pOffX}%);top:calc(50% + ${pOffY}%);transform:translate(-50%,-50%) scale(${pScale});transform-origin:center;max-width:95%;max-height:95%;z-index:1;`;
      const pTxtSt = `position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:2;padding:0.3cm;text-align:center;overflow:hidden;`;

      const imgHtmlP = temImagem ? `<img src="${prisma.imagem}" style="${pImgSt}" alt="">` : '';
      const txtHtmlP = temTexto  ? `<div style="${pTxtSt}">
        ${nomeText    ? `<div class="nome"    style="font-size:${nomeSize}cm">${nomeText}</div>`    : ""}
        ${cargoText   ? `<div class="cargo"   style="font-size:${cargoSize}cm">${cargoText}</div>`   : ""}
        ${empresaText ? `<div class="empresa" style="font-size:${empresaSize}cm">${empresaText}</div>` : ""}
      </div>` : '';

      let face;
      face = `<div class="conteudo" style="position:relative;overflow:hidden;">${imgHtmlP}${txtHtmlP}</div>`;

      const classPrisma = tipo === "pequeno" ? "prisma-pequeno" : "prisma-grande";
      const classSup    = tipo === "pequeno" ? "metade-superior-pequeno" : "metade-superior-grande";
      const classInf    = tipo === "pequeno" ? "metade-inferior-pequeno" : "metade-inferior-grande";

      return `
        <div class="prisma ${classPrisma}">
          <div class="metade ${classSup}">${face}</div>
          <div class="metade ${classInf}">${face}</div>
        </div>`;
    }).join("");

    return `<div class="folha folha-${tipo}">${prismasHtml}</div>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Impressão de Prismas</title>
  <style>
    @page { size: A4 portrait; margin: 8mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #fff; font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; }

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
    .folha:last-child { page-break-after: auto; }

    .prisma {
      border: 1px solid #000;
      background: #ececec;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .prisma-pequeno { width: 15cm;   height: 9cm;    }
    .prisma-grande  { width: 19.5cm; height: 18.6cm; }

    .metade {
      flex: 1;
      display: flex;
      align-items: stretch;
      justify-content: center;
      overflow: hidden;
    }

    .metade-superior-pequeno,
    .metade-superior-grande {
      transform: rotate(180deg);
      transform-origin: center;
      border-top: 1px solid #000;
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
    .prisma-grande .conteudo { gap: 0.35cm; padding: 0.45cm; }

    .imagem-box { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .imagem { object-fit: contain; display: block; }
    .imagem-pequena { max-width: 1.9cm; max-height: 1.9cm; }
    .imagem-grande  { max-width: 4.2cm; max-height: 4.2cm; }
    .conteudo.modo-imagem { padding: 0; }
    .imagem-cheia { width: 100%; height: 100%; object-fit: cover; display: block; }

    .texto {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      min-width: 0;
      overflow: hidden;
    }

    .nome, .cargo, .empresa {
      font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
      font-weight: 700;
      line-height: 1.1;
      white-space: normal;
      word-break: break-word;
      overflow-wrap: break-word;
      width: 100%;
      text-align: center;
    }
    .nome    { margin-bottom: 0.08cm; }
    .cargo   { margin-bottom: 0.06cm; }
  </style>
</head>
<body onload="window.print(); window.close();">
  ${folhasHtml}
</body>
</html>`;

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

function imprimirPrismasGerados() {
  if (!prismasCadastrados.length) {
    showToast("Nenhum prisma adicionado para imprimir.", 'aviso');
    return;
  }
  abrirJanelaImpressao(prismasCadastrados);
}

/*
|--------------------------------------------------------------------------
| FUNÇÃO GLOBAL
|--------------------------------------------------------------------------
*/
/* Zoom do prisma em edição — chamado pelo slider inline do formulário */
function ajustarZoomEdicao(indice, valor) {
  const prisma = prismasCadastrados[indice];
  if (!prisma) return;
  prisma.imgZoom = parseInt(valor, 10);
  _imgApplyTransform(prisma, 'edit');
  const lbl = document.getElementById(`editZoomLbl_${indice}`);
  if (lbl) lbl.textContent = Math.round(prisma.imgZoom);
}

/* Centraliza imagem e reset de zoom */
function resetarPosicaoEdicao(indice) {
  const prisma = prismasCadastrados[indice];
  if (!prisma) return;
  prisma.imgOffsetX = 0;
  prisma.imgOffsetY = 0;
  prisma.imgZoom    = 100;
  _imgApplyTransform(prisma, 'edit');
  const sl = document.getElementById(`editZoomSlider_${indice}`);
  const lb = document.getElementById(`editZoomLbl_${indice}`);
  if (sl) sl.value = 100;
  if (lb) lb.textContent = '100';
}

window.removerPrisma = removerPrisma;
window.editarPrisma = editarPrisma;
window.cancelarEdicaoPrisma = cancelarEdicaoPrisma;
window.salvarEdicaoPrisma = salvarEdicaoPrisma;
window.alterarEscalaTexto = alterarEscalaTexto;
window.imprimirPrismasGerados = imprimirPrismasGerados;
window.ajustarZoomEdicao = ajustarZoomEdicao;
window.resetarPosicaoEdicao = resetarPosicaoEdicao;
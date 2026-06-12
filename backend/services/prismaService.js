const TIPOS_PRISMA = {
  grande: {
    nome: "grande",
    larguraCm: 9.73,
    alturaCm: 19.6,
    prismasPorFolha: 1
  },
  pequeno: {
    nome: "pequeno",
    larguraCm: 7.5,
    alturaCm: 10.5,
    prismasPorFolha: 3
  }
};

function paraMaiusculo(texto) {
  if (!texto) return "";
  return texto.toUpperCase().trim();
}

function validarTipoPrisma(tipoPrisma) {
  return ["grande", "pequeno"].includes(tipoPrisma);
}

function agruparPrismasEmFolhas(prismas, prismasPorFolha, tipoPrisma, configTipo) {
  const folhas = [];
  let folhaAtual = [];

  prismas.forEach((prisma, indice) => {
    const prismaFormatado = {
      id: prisma.id || indice + 1,
      nome: prisma.nome ? prisma.nome.trim() : "",
      cargo: prisma.cargo ? prisma.cargo.trim() : "",
      empresa: prisma.empresa ? prisma.empresa.trim() : "",
      tipoPrisma: tipoPrisma,
      larguraCm: configTipo.larguraCm,
      alturaCm: configTipo.alturaCm,
      imagem: prisma.imagem ? prisma.imagem : null,
      posicaoNaFolha: folhaAtual.length + 1,
      escalaNome: Number(prisma.escalaNome) || 0,
      escalaCargo: Number(prisma.escalaCargo) || 0,
      escalaEmpresa: Number(prisma.escalaEmpresa) || 0
    };

    folhaAtual.push(prismaFormatado);

    if (folhaAtual.length === prismasPorFolha) {
      folhas.push(folhaAtual);
      folhaAtual = [];
    }
  });

  if (folhaAtual.length > 0) {
    folhas.push(folhaAtual);
  }

  return folhas;
}

function montarLayoutFolhas(prismas, tipoPrisma) {
  if (!validarTipoPrisma(tipoPrisma)) {
    throw new Error("O tipo de prisma deve ser 'grande' ou 'pequeno'.");
  }

  const configTipo = TIPOS_PRISMA[tipoPrisma];
  const prismasPorFolha = configTipo.prismasPorFolha;

  const folhasAgrupadas = agruparPrismasEmFolhas(
    prismas,
    prismasPorFolha,
    tipoPrisma,
    configTipo
  );

  const folhas = folhasAgrupadas.map((grupo, indice) => {
    return {
      numeroFolha: indice + 1,
      quantidadeNaFolha: grupo.length,
      layout: `PRISMA_${tipoPrisma.toUpperCase()}`,
      prismas: grupo
    };
  });

  return {
    configuracao: {
      tipoPrisma: tipoPrisma,
      larguraCm: configTipo.larguraCm,
      alturaCm: configTipo.alturaCm,
      prismasPorFolha: prismasPorFolha
    },
    totalPrismas: prismas.length,
    totalFolhas: folhas.length,
    folhas: folhas
  };
}

module.exports = {
  montarLayoutFolhas
};
export const DEFAULT_ROLES_CONFIG = {
  rolesEnabled: {
    lupo: true,
    villico: true,
    guardia: true,
    veggente: true,
    massone: false,
    matto: false,
    giustiziere: false,
    boia: false,
    medium: true,
    lupomannaro: false,
    indemoniato: true,
    insinuo: false,
    barabba: false,
    angelo: false,
    genio: false,
    parassita: false,
    muccamannara: false,
    illusionista: false,
    misspurple: false,
    bugiardo: false,
    simbionte: false,
    mutaforma: false,
    ammaestratore: false,
    lupoCiccione: false,
    lupoCieco: false
  },
  defaultCounts: {
    10: {
      veggente: 1,
      medium: 1,
      guardia: 1,
      lupo: 2,
      indemoniato: 1,
      villico: 4
    }
  } as Record<number, Record<string, number>>,
  defaultPlayerCount: 10
};

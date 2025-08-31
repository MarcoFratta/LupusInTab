import { describe, it, expect, vi } from 'vitest';
import {
  createEmptyState,
  initSetupPlayers,
  initDefaultRolesCounts,
  normalizeRoleCounts,
  resizePlayers,
  updateRoleCount,
  getMaxCountForRole,
  beginReveal,
  beginNight,
  recordNightResult,
  resolveNight,
  continueToDay,
  initializePlayerRoleState,
  computeWinner,
} from '../core/engine';
import { NightPhaseManager } from '../core/managers/NightPhaseManager';
import { NightPhaseManager } from '../core/managers/NightPhaseManager';
import { useWinConditions } from '../utils/winConditions';
import { ROLES } from '../roles/index';

const ROLE_LIST = [
  { id: 'lupo', name: 'Lupo', team: 'lupi', visibleAsTeam: 'lupi', phaseOrder: 1 },
  { id: 'guardia', name: 'Guardia', team: 'villaggio', visibleAsTeam: 'villaggio', phaseOrder: 3 },
  { id: 'veggente', name: 'Veggente', team: 'villaggio', visibleAsTeam: 'villaggio', phaseOrder: 3 },
  { id: 'villico', name: 'Villico', team: 'villaggio', visibleAsTeam: 'villaggio', phaseOrder: 99 },
] as const;

const TEST_ROLES = {
  lupo: {
    id: 'lupo', name: 'Lupo', team: 'lupi', phaseOrder: 1,
    getPromptComponent: () => async () => ({}),
    resolve: (state: any, action: any) => {
      if (action.data?.targetId) {
        const id = action.data.targetId as number;
        const pk = state.night.context.pendingKills as Record<number, Array<{ role: string }>>;
        if (!pk[id]) pk[id] = [];
        pk[id].push({ role: 'lupo' });
      }
    }
  },
  guardia: {
    id: 'guardia', name: 'Guardia', team: 'villaggio', phaseOrder: 3,
    getPromptComponent: () => async () => ({}),
    resolve: (state: any, action: any) => {
      if (action.data?.targetId) {
        const id = action.data.targetId as number;
        if (!Array.isArray(state.night.context.saves)) {
          state.night.context.saves = [];
        }
        state.night.context.saves.push({
          targetId: id,
          fromRoles: ['lupo'],
          byRole: 'guardia'
        });
      }
    }
  },
  veggente: {
    id: 'veggente', name: 'Veggente', team: 'villaggio', phaseOrder: 3,
    getPromptComponent: () => async () => ({}),
    resolve: () => {}
  },
  villico: {
    id: 'villico', name: 'Villico', team: 'villaggio', phaseOrder: 99,
    actsAtNight: false,
    getPromptComponent: () => async () => ({}),
    resolve: () => {}
  }
} as any;

function fakeShuffle<T>(arr: T[]): T[] { return arr.slice(); }

describe('engine setup', () => {
  it('creates empty state with defaults', () => {
    const s = createEmptyState();
    expect(s.phase).toBe('setup');
    expect(s.setup.numPlayers).toBe(10);
    expect(s.setup.numPlayers).toBe(10);
    expect(s.settings.skipFirstNightActions).toBe(true);
  });

  it('initializes players and role counts', () => {
    const s = createEmptyState();
    initSetupPlayers(s);
    expect(s.setup.players.length).toBe(10);
    expect(s.setup.players.length).toBe(10);
    initDefaultRolesCounts(s);
    normalizeRoleCounts(s);
    expect(Object.values(s.setup.rolesCounts).reduce((a, b) => a + (b || 0), 0)).toBe(s.setup.numPlayers);
  });

  it('resizes players and adjusts villici', () => {
    const s = createEmptyState();
    initSetupPlayers(s);
    resizePlayers(s, 8);
    
    expect(s.setup.numPlayers).toBe(8);
    expect(s.setup.players.length).toBe(8);
    expect(s.setup.rolesCounts.villico).toBeGreaterThanOrEqual(0);
  });

  it('enforces max counts per role', () => {
    const s = createEmptyState();
    initSetupPlayers(s);
    initDefaultRolesCounts(s);
    normalizeRoleCounts(s);
    expect(getMaxCountForRole(s, 'lupo')).toBeGreaterThan(0);
  });
});

describe('engine flow', () => {
  it('assigns roles on reveal', () => {
    const s = createEmptyState();
    initSetupPlayers(s);
            s.setup.rolesCounts = { lupo: 2, guardia: 1, veggente: 1, villico: 4, medium: 1, indemoniato: 1 } as any;
    beginReveal(s as any, ROLE_LIST as any, fakeShuffle);
    expect(s.players.length).toBe(10);
    expect(s.players.length).toBe(10);
    expect(s.phase).toBe('revealRoles');
  });

  it('builds night turns grouped and ordered', () => {
    const s = createEmptyState();
    initSetupPlayers(s);
            s.setup.rolesCounts = { lupo: 2, guardia: 1, veggente: 0, villico: 3 } as any;
    beginReveal(s as any, ROLE_LIST as any, fakeShuffle);
    beginNight(s as any, ROLES);
    
    // With the new dynamic approach, turns are computed on-demand
    const firstTurn = NightPhaseManager.getCurrentTurn(s);
    expect(firstTurn).toBeDefined();
    expect(firstTurn.roleId).toBe('lupo');
  });

  it('skip-first-night produces empty summary', () => {
    const s = createEmptyState();
    initSetupPlayers(s);
    s.setup.rolesCounts = { lupo: 1, guardia: 1, veggente: 0, villico: 4 } as any;
    beginReveal(s as any, ROLE_LIST as any, fakeShuffle);
    beginNight(s as any, ROLES);
    while (s.night.currentIndex < s.night.turns.length - 1) {
      recordNightResult(s as any, {});
    }
    recordNightResult(s as any, {});
    resolveNight(s as any, ROLES);
    expect(s.night.summary).toBeTruthy();
    expect(s.night.summary?.died.length).toBe(0);
  });

  it('resolve applies kills except saved', () => {
    const s = createEmptyState();
    s.settings.skipFirstNightActions = false;
    initSetupPlayers(s);
    s.setup.rolesCounts = { lupo: 1, guardia: 1, veggente: 0, villico: 4 } as any;
    beginReveal(s as any, ROLE_LIST as any, fakeShuffle);
    beginNight(s as any, ROLES);
    const victim = s.players.find(p => p.roleId === 'villico')!;
    
    // Lupos target victim
    recordNightResult(s as any, { targetId: victim.id });
    // Guardia saves victim
    recordNightResult(s as any, { targetId: victim.id });
    
    resolveNight(s as any, ROLES);
    expect(victim.alive).toBe(true);
  });

  it('continueToDay increments correctly', () => {
    const s = createEmptyState();
    s.phase = 'resolve';
    continueToDay(s, ROLES);
    expect(['day', 'end'].includes(s.phase)).toBe(true);
  });

  it('should only call restore functions for roles that acted during the night', () => {
    const s = createEmptyState();
    s.phase = 'resolve';
    
    // Add players so the game doesn't end immediately
    s.players = [
      { id: 1, name: 'Lupo Player', roleId: 'lupo', alive: true, roleState: {} },
      { id: 2, name: 'Guardia Player', roleId: 'guardia', alive: true, roleState: {} }
    ] as any;
    
    const mockRoles = {
      lupo: {
        id: 'lupo',
        name: 'Lupo',
        team: 'lupi',
        score: 5,
        phaseOrder: 1,
        resolve: () => {},
        restoreFunction: vi.fn()
      },
      guardia: {
        id: 'guardia',
        name: 'Guardia',
        team: 'villaggio',
        score: 5,
        phaseOrder: 2,
        resolve: () => {},
        restoreFunction: vi.fn()
      },
      illusionista: {
        id: 'illusionista',
        name: 'Illusionista',
        team: 'lupi',
        score: 5,
        phaseOrder: 3,
        resolve: () => {},
        restoreFunction: vi.fn()
      },
      veggente: {
        id: 'veggente',
        name: 'Veggente',
        team: 'villaggio',
        score: 5,
        phaseOrder: 4,
        resolve: () => {},
        restoreFunction: vi.fn()
      }
    };
    
    s.night = {
      turns: [
        { kind: 'group', roleId: 'lupo', playerIds: [1] },
        { kind: 'group', roleId: 'guardia', playerIds: [2] }
      ],
      currentIndex: 0,
      context: {
        pendingKills: {},
        savesBy: [],
        checks: [],
        calledRoles: ['lupo', 'guardia'],
        passiveEffectRoles: []
      },
      summary: null
    };
    
    continueToDay(s, mockRoles);
    
    expect(mockRoles.lupo.restoreFunction).toHaveBeenCalled();
    expect(mockRoles.guardia.restoreFunction).toHaveBeenCalled();
    expect(mockRoles.illusionista.restoreFunction).not.toHaveBeenCalled();
    expect(mockRoles.veggente.restoreFunction).not.toHaveBeenCalled();
    
    const lupoCallIndex = mockRoles.lupo.restoreFunction.mock.invocationCallOrder[0];
    const guardiaCallIndex = mockRoles.guardia.restoreFunction.mock.invocationCallOrder[0];
    expect(guardiaCallIndex).toBeLessThan(lupoCallIndex);
  });
});

describe('new roles logic', () => {
  it('Justicer kill cannot be saved', async () => {
    const s = createEmptyState();
    s.settings.skipFirstNightActions = false;
    s.players = [
      { id: 1, name: 'J', roleId: 'giustiziere', alive: true, roleState: {} },
      { id: 2, name: 'V', roleId: 'villico', alive: true, roleState: {} },
      { id: 3, name: 'D', roleId: 'guardia', alive: true, roleState: {} },
    ] as any;
    
    // Initialize role states properly
    for (const player of s.players) {
      const roleDef = ROLES[player.roleId];
      if (roleDef) {
        initializePlayerRoleState(player, roleDef);
      }
    }
    
    beginNight(s as any, TEST_ROLES);
    
    // Initialize night context properly
    if (!s.night.context.pendingKills) {
      s.night.context.pendingKills = {};
    }
    
    // Force turns to Giustiziere then Guardia
    s.night.turns = [ { kind:'group', roleId:'giustiziere', playerIds:[1] }, { kind:'group', roleId:'guardia', playerIds:[3] } ] as any;
    
    // Giustiziere kills player 2
    recordNightResult(s as any, { targetId: 2 });
    // Guardia tries to save player 2
    recordNightResult(s as any, { targetId: 2 });
    
    resolveNight(s as any, TEST_ROLES);
    const victim = s.players.find(p => p.id === 2)!;
    expect(victim.alive).toBe(false); // not saved
  });

  it('Matto wins immediately on lynch', async () => {
    const s = createEmptyState();
    s.players = [
      { id: 1, name: 'C', roleId: 'matto', alive: true, roleState: { realTeam: 'matti' } },
      { id: 2, name: 'V', roleId: 'villico', alive: true, roleState: { realTeam: 'villaggio' } },
    ] as any;
    s.roleMeta = {
      matto: { id:'matto', name:'Matto', team:'matti', phaseOrder:97 } as any,
      villico: { id:'villico', name:'Villico', team:'villaggio', phaseOrder:99 } as any,
    } as any;
    // lynch player 1
    const { lynchPlayer } = await import('../core/engine');
    lynchPlayer(s as any, 1);
    expect(s.winner).toBe('matti');
    expect(s.phase).toBe('end');
  });

  it('Lupomannaro blocks village win when no lupi but lupomannaro alive (more than 2 players) via checkWinConstraint', async () => {
    const s = createEmptyState();
    s.players = [
      { id: 1, name: 'Dog', roleId: 'lupomannaro', alive: true },
      { id: 2, name: 'V1', roleId: 'villico', alive: true },
      { id: 3, name: 'V2', roleId: 'villico', alive: true },
    ] as any;
    s.roleMeta = {
      lupomannaro: { id:'lupomannaro', name:'Lupomannaro', team:'mannari', phaseOrder:2, countAs:'lupi' } as any,
      villico: { id:'villico', name:'Villico', team:'villaggio', phaseOrder:99 } as any,
    } as any;
    const { villageWin } = useWinConditions();
    const winner = (await import('../core/engine')).evaluateWinner(s as any, {
      villico: { id:'villico', name:'Villico', team:'villaggio', phaseOrder:99, actsAtNight:false, getPromptComponent: () => async () => ({}), resolve: () => {}, checkWin: villageWin },
      lupomannaro: { id:'lupomannaro', name:'Lupomannaro', team:'mannari', phaseOrder:2, actsAtNight:false, getPromptComponent: () => async () => ({}), resolve: () => {}, checkWinConstraint: (st:any) => st.players.some((p:any)=>p.alive && p.roleId==='lupomannaro') && st.players.filter((p:any)=>p.alive).length>2 },
    } as any);
    // With 3+ players alive and Lupomannaro alive, village should NOT win due to constraint
    expect(winner).toBe(null);
  });

  it('Lupomannaro blocks lupi parity win while alive via checkWinConstraint', async () => {
    const s = createEmptyState();
    s.players = [
      { id: 1, name: 'Dog', roleId: 'lupomannaro', alive: true },
      { id: 2, name: 'W', roleId: 'lupo', alive: true },
      { id: 3, name: 'V', roleId: 'villico', alive: true },
    ] as any;
    s.roleMeta = {
      lupomannaro: { id:'lupomannaro', name:'Lupomannaro', team:'mannari', phaseOrder:2, countAs:'lupi' } as any,
      lupo: { id:'lupo', name:'Lupo', team:'lupi', phaseOrder:1 } as any,
      villico: { id:'villico', name:'Villico', team:'villaggio', phaseOrder:99 } as any,
    } as any;
    const { wolvesWin } = useWinConditions();
    const winner = (await import('../core/engine')).evaluateWinner(s as any, {
      lupo: { id:'lupo', name:'Lupo', team:'lupi', phaseOrder:1, getPromptComponent: () => async () => ({}), resolve: () => {}, checkWin: wolvesWin },
      villico: { id:'villico', name:'Villico', team:'villaggio', phaseOrder:99, actsAtNight:false, getPromptComponent: () => async () => ({}), resolve: () => {} },
      lupomannaro: { id:'lupomannaro', name:'Lupomannaro', team:'mannari', phaseOrder:2, actsAtNight:false, getPromptComponent: () => async () => ({}), resolve: () => {}, checkWinConstraint: (st:any) => st.players.some((p:any)=>p.alive && p.roleId==='lupomannaro') && st.players.filter((p:any)=>p.alive).length>2 },
    } as any);
    expect(winner).toBe(null);
  });

  it('Indemoniato is seen as lupo but does not count for lupi parity', async () => {
    const s = createEmptyState();
    s.players = [
      { id: 1, name: 'W', roleId: 'lupo', alive: true },
      { id: 2, name: 'D', roleId: 'indemoniato', alive: true },
      { id: 3, name: 'V', roleId: 'villico', alive: true },
      { id: 4, name: 'V2', roleId: 'villico', alive: true },
    ] as any;
    s.roleMeta = {
      lupo: { id:'lupo', name:'Lupo', team:'lupi', visibleAsTeam:'lupi', phaseOrder:1 } as any,
      indemoniato: { id:'indemoniato', name:'Indemoniato', team:'lupi', visibleAsTeam:'lupi', countAs:'villaggio', phaseOrder:98 } as any,
      villico: { id:'villico', name:'Villico', team:'villaggio', phaseOrder:99 } as any,
    } as any;
    const { wolvesWin } = useWinConditions();
    const winner = (await import('../core/engine')).evaluateWinner(s as any, {
      lupo: { id:'lupo', name:'Lupo', team:'lupi', phaseOrder:1, resolve: () => {}, checkWin: wolvesWin },
      indemoniato: { id:'indemoniato', name:'Indemoniato', team:'lupi', visibleAsTeam:'lupi', countAs:'villaggio', phaseOrder:98, actsAtNight:false, resolve: () => {} },
      villico: { id:'villico', name:'Villico', team:'villaggio', phaseOrder:99, actsAtNight:false, resolve: () => {} },
    } as any);
    // wolvesAlive = 1, nonWolvesAlive = 3 -> wolves not in parity, winner null
    expect(winner).toBe(null);
  });

  it('Lupomannaro should win when down to 2 players (lupomannaro + 1 other)', async () => {
    const s = createEmptyState();
    s.players = [
      { id: 1, name: 'Dog', roleId: 'lupomannaro', alive: true },
      { id: 2, name: 'V', roleId: 'villico', alive: true },
    ] as any;
    s.roleMeta = {
      lupomannaro: { id:'lupomannaro', name:'LupoMannaro', team:'mannari', phaseOrder:2, countAs:'lupi' } as any,
      villico: { id:'villico', name:'Villico', team:'villaggio', phaseOrder:99 } as any,
    } as any;
    const { villageWin } = useWinConditions();
    const winner = (await import('../core/engine')).evaluateWinner(s as any, {
      villico: { id:'villico', name:'Villico', team:'villaggio', phaseOrder:99, actsAtNight:false, getPromptComponent: () => async () => ({}), resolve: () => {}, checkWin: villageWin },
      lupomannaro: { id:'lupomannaro', name:'LupoMannaro', team:'mannari', phaseOrder:2, actsAtNight:true, getPromptComponent: () => async () => ({}), resolve: () => {}, checkWin: (st:any) => {
        const alive = st.players.filter((p:any) => p.alive);
        const anyLupomannaroAlive = alive.some((p:any) => p.roleId === 'lupomannaro');
        return anyLupomannaroAlive && alive.length === 2;
      } },
    } as any);
    // Lupomannaro should win with 2 players alive (lupomannaro + villico)
    expect(winner).toEqual(['mannari']);
    expect(winner).toEqual(['mannari']);
  });

  it('BUG REPRODUCTION: Lupomannaro prevents any team from winning when alive with 3+ players', async () => {
    const s = createEmptyState();
    s.players = [
      { id: 1, name: 'Dog', roleId: 'lupomannaro', alive: true },
      { id: 2, name: 'V1', roleId: 'villico', alive: true },
      { id: 3, name: 'V2', roleId: 'villico', alive: true },
    ] as any;
    s.roleMeta = {
      lupomannaro: { id:'lupomannaro', name:'LupoMannaro', team:'mannari', phaseOrder:2, countAs:'lupi' } as any,
      villico: { id:'villico', name:'Villico', team:'villaggio', phaseOrder:99 } as any,
    } as any;
    const { villageWin } = useWinConditions();
    const winner = (await import('../core/engine')).evaluateWinner(s as any, {
      villico: { id:'villico', name:'Villico', team:'villaggio', phaseOrder:99, actsAtNight:false, getPromptComponent: () => async () => ({}), resolve: () => {}, checkWin: villageWin },
      lupomannaro: { id:'lupomannaro', name:'LupoMannaro', team:'mannari', phaseOrder:2, actsAtNight:false, getPromptComponent: () => async () => ({}), resolve: () => {}, checkWinConstraint: (st:any) => st.players.some((p:any)=>p.alive && p.roleId==='lupomannaro') && st.players.filter((p:any)=>p.alive).length>2 },
    } as any);
    // With 3+ players alive and Lupomannaro alive, village should NOT win due to constraint
    expect(winner).toBe(null);
  });

  it('REFACTORED: Parassita can win while blocking other teams via checkWinConstraint', async () => {
    const s = createEmptyState();
    s.players = [
      { id: 1, name: 'P', roleId: 'parassita', alive: true },
      { id: 2, name: 'V1', roleId: 'villico', alive: true },
      { id: 3, name: 'V2', roleId: 'villico', alive: true },
    ] as any;
    s.custom = {
      parassita: { infetti: [2, 3] } // Both villico are infected
    };
    s.roleMeta = {
      parassita: { id:'parassita', name:'Parassita', team:'parassita', phaseOrder:1 } as any,
      villico: { id:'villico', name:'Villico', team:'villaggio', phaseOrder:99 } as any,
    } as any;
    
    const { villageWin } = useWinConditions();
    const winner = (await import('../core/engine')).evaluateWinner(s as any, {
      parassita: { 
        id:'parassita', 
        name:'Parassita', 
        team:'parassita', 
        phaseOrder:1, 
        actsAtNight:false, 
        getPromptComponent: () => async () => ({}), 
        resolve: () => {}, 
        checkWin: (st:any) => {
          // Parassita wins if all other players are infected
          const alivePlayers = st.players.filter((p:any) => p.alive);
          const parassitaPlayer = alivePlayers.find((p:any) => p.roleId === 'parassita');
          if (!parassitaPlayer) return false;
          
          const otherAlivePlayers = alivePlayers.filter((p:any) => p.id !== parassitaPlayer.id);
          if (otherAlivePlayers.length === 0) return false;
          
          const infetti = st.custom?.parassita?.infetti || [];
          return otherAlivePlayers.every((p:any) => infetti.includes(p.id));
        },
        checkWinConstraint: (st:any) => {
          // Parassita blocks village from winning when alive
          const parassitaAlive = st.players.some((p:any) => p.roleId === 'parassita' && p.alive);
          if (!parassitaAlive) return false;
          
          // Check if village would win
          const alivePlayers = st.players.filter((p:any) => p.alive);
          const lupiAlive = alivePlayers.filter((p:any) => {
            const roleDef = st.roleMeta?.[p.roleId];
            return roleDef && (roleDef.team === 'lupi' || roleDef.countAs === 'lupi');
          }).length;
          
          const lupomannaroAliveForWin = alivePlayers.filter((p:any) => {
            const roleDef = st.roleMeta?.[p.roleId];
            return roleDef && roleDef.team === 'mannari' && roleDef.countAs === 'lupi';
          }).length;
          
          return lupiAlive === 0 && lupomannaroAliveForWin === 0;
        }
      },
      villico: { 
        id:'villico', 
        name:'Villico', 
        team:'villaggio', 
        phaseOrder:99, 
        actsAtNight:false, 
        getPromptComponent: () => async () => ({}), 
        resolve: () => {}, 
        checkWin: villageWin 
      },
    } as any);
    
    // Parassita should win (all other players infected) and block village from winning
    expect(winner).toEqual(['parassita']);
  });

  it('REFACTORED: Only one team can win at a time - prioritizes first winning team', async () => {
    const s = createEmptyState();
    s.players = [
      { id: 1, name: 'P', roleId: 'parassita', alive: true },
      { id: 2, name: 'V', roleId: 'villico', alive: true },
    ] as any;
    s.custom = {
      parassita: { infetti: [2] } // Villico is infected
    };
    s.roleMeta = {
      parassita: { id:'parassita', name:'Parassita', team:'parassita', phaseOrder:1 } as any,
      villico: { id:'villico', name:'Villico', team:'villaggio', phaseOrder:99 } as any,
    } as any;
    
    const { villageWin } = useWinConditions();
    const winner = (await import('../core/engine')).evaluateWinner(s as any, {
      parassita: { 
        id:'parassita', 
        name:'Parassita', 
        team:'parassita', 
        phaseOrder:1, 
        actsAtNight:false, 
        getPromptComponent: () => async () => ({}), 
        resolve: () => {}, 
        checkWin: (st:any) => {
          // Parassita wins if all other players are infected
          const alivePlayers = st.players.filter((p:any) => p.alive);
          const parassitaPlayer = alivePlayers.find((p:any) => p.roleId === 'parassita');
          if (!parassitaPlayer) return false;
          
          const otherAlivePlayers = alivePlayers.filter((p:any) => p.id !== parassitaPlayer.id);
          if (otherAlivePlayers.length === 0) return false;
          
          const infetti = st.custom?.parassita?.infetti || [];
          return otherAlivePlayers.every((p:any) => infetti.includes(p.id));
        }
      },
      villico: { 
        id:'villico', 
        name:'Villico', 
        team:'villaggio', 
        phaseOrder:99, 
        actsAtNight:false, 
        getPromptComponent: () => async () => ({}), 
        resolve: () => {}, 
        checkWin: villageWin 
      },
    } as any);
    
    // Both teams could win, but only one should win (parassita wins first)
    expect(winner).toEqual(['parassita']);
    expect(winner && winner.length).toBe(1); // Ensure only one team wins
  });

  it('REFACTORED: Mannari roles block other teams from winning when alive', async () => {
    const s = createEmptyState();
    s.players = [
      { id: 1, name: 'LM', roleId: 'lupomannaro', alive: true },
      { id: 2, name: 'MM', roleId: 'muccamannara', alive: true },
      { id: 3, name: 'V', roleId: 'villico', alive: true },
    ] as any;
    s.roleMeta = {
      lupomannaro: { id:'lupomannaro', name:'Lupomannaro', team:'mannari', phaseOrder:1, countAs:'lupi' } as any,
      muccamannara: { id:'muccamannara', name:'MuccaMannara', team:'mannari', phaseOrder:2, countAs:'lupi' } as any,
      villico: { id:'villico', name:'Villico', team:'villaggio', phaseOrder:99 } as any,
    } as any;
    
    const { villageWin, wolvesWin } = useWinConditions();
    const winner = (await import('../core/engine')).evaluateWinner(s as any, {
      lupomannaro: { 
        id:'lupomannaro', 
        name:'Lupomannaro', 
        team:'mannari', 
        phaseOrder:1, 
        actsAtNight:false, 
        getPromptComponent: () => async () => ({}), 
        resolve: () => {}, 
        checkWin: (st:any) => {
          // Mannari win when their count >= other players count
          const mannariAlive = st.players.filter((p:any) => p.alive && (p.roleId === 'lupomannaro' || p.roleId === 'muccamannara')).length;
          const nonMannariAlive = st.players.filter((p:any) => p.alive && p.roleId !== 'lupomannaro' && p.roleId !== 'muccamannara').length;
          return mannariAlive >= nonMannariAlive;
        },
        checkWinConstraint: (st:any) => {
          // Import the common function
          const { mannariBlocksOtherWins } = require('../../utils/winConditions');
          return mannariBlocksOtherWins(st);
        }
      },
      muccamannara: { 
        id:'muccamannara', 
        name:'MuccaMannara', 
        team:'mannari', 
        phaseOrder:2, 
        actsAtNight:false, 
        getPromptComponent: () => async () => ({}), 
        resolve: () => {}, 
        checkWin: (st:any) => {
          // Mannari win when their count >= other players count
          const mannariAlive = st.players.filter((p:any) => p.alive && (p.roleId === 'lupomannaro' || p.roleId === 'muccamannara')).length;
          const nonMannariAlive = st.players.filter((p:any) => p.alive && p.roleId !== 'lupomannaro' && p.roleId !== 'muccamannara').length;
          return mannariAlive >= nonMannariAlive;
        },
        checkWinConstraint: (st:any) => {
          // Import the common function
          const { mannariBlocksOtherWins } = require('../../utils/winConditions');
          return mannariBlocksOtherWins(st);
        }
      },
      villico: { 
        id:'villico', 
        name:'Villico', 
        team:'villaggio', 
        phaseOrder:99, 
        actsAtNight:false, 
        getPromptComponent: () => async () => ({}), 
        resolve: () => {}, 
        checkWin: villageWin 
      },
    } as any);
    
    // With both lupomannaro and muccamannara alive, they should block other teams from winning
    // But they can still win themselves (mannari count = 2, non-mannari count = 1)
    expect(winner).toEqual(['mannari']);
  });

  it('REFACTORED: Mannari constraint blocks village from winning when any mannari is alive', async () => {
    const s = createEmptyState();
    s.players = [
      { id: 1, name: 'LM', roleId: 'lupomannaro', alive: true },
      { id: 2, name: 'V1', roleId: 'villico', alive: true },
      { id: 3, name: 'V2', roleId: 'villico', alive: true },
    ] as any;
    s.roleMeta = {
      lupomannaro: { id:'lupomannaro', name:'Lupomannaro', team:'mannari', phaseOrder:1, countAs:'lupi' } as any,
      villico: { id:'villico', name:'Villico', team:'villaggio', phaseOrder:99 } as any,
    } as any;
    
    const { villageWin } = useWinConditions();
    const winner = (await import('../core/engine')).evaluateWinner(s as any, {
      lupomannaro: { 
        id:'lupomannaro', 
        name:'Lupomannaro', 
        team:'mannari', 
        phaseOrder:1, 
        actsAtNight:false, 
        getPromptComponent: () => async () => ({}), 
        resolve: () => {}, 
        checkWin: (st:any) => {
          // Mannari win when their count >= other players count
          const mannariAlive = st.players.filter((p:any) => p.alive && (p.roleId === 'lupomannaro' || p.roleId === 'muccamannara')).length;
          const nonMannariAlive = st.players.filter((p:any) => p.alive && p.roleId !== 'lupomannaro' && p.roleId !== 'muccamannara').length;
          return mannariAlive >= nonMannariAlive;
        },
        checkWinConstraint: (st:any) => {
          // Import the common function
          const { mannariBlocksOtherWins } = require('../../utils/winConditions');
          return mannariBlocksOtherWins(st);
        }
      },
      villico: { 
        id:'villico', 
        name:'Villico', 
        team:'villaggio', 
        phaseOrder:99, 
        actsAtNight:false, 
        getPromptComponent: () => async () => ({}), 
        resolve: () => {}, 
        checkWin: villageWin 
      },
    } as any);
    
    // With lupomannaro alive, village should NOT win due to constraint
    // But lupomannaro can still win (mannari count = 1, non-mannari count = 2, so no win)
    expect(winner).toBe(null);
  });

  it('BUG REPRODUCTION: Lupomannaro prevents village from winning even when all real wolves are dead', async () => {
    const s = createEmptyState();
    s.players = [
      { id: 1, name: 'Dog', roleId: 'lupomannaro', alive: true },
      { id: 2, name: 'V1', roleId: 'villico', alive: true },
      { id: 3, name: 'V2', roleId: 'villico', alive: true },
      { id: 4, name: 'V3', roleId: 'villico', alive: true },
      { id: 5, name: 'W', roleId: 'lupo', alive: false }, // DEAD LUPO
    ] as any;
    s.roleMeta = {
      lupomannaro: { id:'lupomannaro', name:'LupoMannaro', team:'mannari', phaseOrder:2, countAs:'lupi' } as any,
      villico: { id:'villico', name:'Villico', team:'villaggio', phaseOrder:99 } as any,
      lupo: { id:'lupo', name:'Lupo', team:'lupi', phaseOrder:1 } as any,
    } as any;
    const { villageWin, wolvesWin } = useWinConditions();
    
    // In this scenario: all real lupi are dead, but lupomannaro is alive
    // - But currently villageWin returns false because lupomannaro countsAsLupoForWin=true
    // - This creates a deadlock where no one can win
    
    expect(villageWin(s as any)).toBe(false);
  });

  it('should end game with tie when all players die', () => {
    const s = createEmptyState();
    s.players = [
      { id: 1, name: 'W', roleId: 'lupo', alive: true, roleState: {} },
      { id: 2, name: 'V', roleId: 'villico', alive: true, roleState: {} },
    ] as any;
    
    // Initialize role states
    for (const player of s.players) {
      const roleDef = ROLES[player.roleId];
      if (roleDef) {
        initializePlayerRoleState(player, roleDef);
      }
    }
    
    // Kill all players
    s.players[0].alive = false;
    s.players[1].alive = false;
    
    // Check winner
    const winner = computeWinner(s);
    expect(winner).toBe('tie');
  });
});

describe('NightPhaseManager Set handling', () => {
  it('should handle corrupted calledRoles and convert back to array', () => {
    const state = createEmptyState();
    
    // Set up players with roles
    state.players = [
      { id: 1, name: 'Player 1', roleId: 'lupo', alive: true, roleState: {} as any },
      { id: 2, name: 'Player 2', roleId: 'guardia', alive: true, roleState: {} as any },
      { id: 3, name: 'Player 3', roleId: 'veggente', alive: true, roleState: {} as any },
    ];
    
    // Initialize role states
    for (const player of state.players) {
      const roleDef = TEST_ROLES[player.roleId as keyof typeof TEST_ROLES];
      if (roleDef) {
        initializePlayerRoleState(player, roleDef);
      }
    }
    
    // Start night phase
    beginNight(state, TEST_ROLES);
    
    // Verify calledRoles is initially an array
    expect(Array.isArray(state.night.context.calledRoles)).toBe(true);
    
    // Corrupt the calledRoles by converting to Set (simulating the reverse issue)
    (state.night.context.calledRoles as any) = new Set(state.night.context.calledRoles);
    
    // Verify it's now a Set
    expect(state.night.context.calledRoles instanceof Set).toBe(true);
    
    // Call getCurrentTurn which should fix the corrupted array
    const turn = NightPhaseManager.getCurrentTurn(state);
    
    // Verify calledRoles is back to being an array
    expect(Array.isArray(state.night.context.calledRoles)).toBe(true);
    
    // Verify we can still get a valid turn
    expect(turn).toBeDefined();
    expect(turn.roleId).toBe('lupo'); // First role in phase order
  });
});



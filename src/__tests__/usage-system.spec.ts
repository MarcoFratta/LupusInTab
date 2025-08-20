import { describe, it, expect, beforeEach } from 'vitest';
import { canPlayerActAtNight, hasPlayerExceededUsageLimit } from '../utils/roleUtils';
import { beginReveal } from '../core/engine';
import { ROLES } from '../roles';

describe('Usage System', () => {
  let player: any;
  let gameState: any;
  
  beforeEach(() => {
    player = {
      id: 1,
      name: 'Test Player',
      roleId: 'testrole',
      alive: true,
      roleState: {
        visibleAsTeam: 'villaggio',
        actsAtNight: 'alive',
        realTeam: 'villaggio',
        countAs: 'villaggio',
        phaseOrder: 'any',
        usage: 'unlimited',
        effectType: 'optional',
        numberOfUsage: 3,
        startNight: 1,
        canTargetDead: false,
        affectedRoles: [],

        knownTo: [],
        revealPartnersRoleIds: [],
        revealAlliesWithinRole: false,
        revealToAllies: 'team',
        revealToPartners: 'role'
      }
    };
    
    gameState = {
      nightNumber: 1,
      usedPowers: {}
    };
  });

  it('should block player from using role before startNight', () => {
    player.roleState.startNight = 2;
    gameState.nightNumber = 1;
    
    const canAct = canPlayerActAtNight(player, gameState);
    expect(canAct).toBe(false);
  });

  it('should allow player to use role after startNight', () => {
    player.roleState.startNight = 2;
    gameState.nightNumber = 2;
    
    const canAct = canPlayerActAtNight(player, gameState);
    expect(canAct).toBe(true);
  });

  it('should detect when usage limit is exceeded', () => {
    player.roleState.numberOfUsage = 2;
    gameState.usedPowers.testrole = [1, 1]; // Player used role twice
    
    const hasExceeded = hasPlayerExceededUsageLimit(player, gameState);
    expect(hasExceeded).toBe(true);
  });

  it('should allow usage when under limit', () => {
    player.roleState.numberOfUsage = 3;
    gameState.usedPowers.testrole = [1]; // Player used role once
    
    const hasExceeded = hasPlayerExceededUsageLimit(player, gameState);
    expect(hasExceeded).toBe(false);
  });

  it('should handle unlimited usage correctly', () => {
    player.roleState.numberOfUsage = 'unlimited';
    gameState.usedPowers.testrole = [1, 1, 1, 1, 1]; // Player used role many times
    
    const hasExceeded = hasPlayerExceededUsageLimit(player, gameState);
    expect(hasExceeded).toBe(false);
  });

  it('should handle undefined usage as unlimited', () => {
    player.roleState.numberOfUsage = undefined;
    gameState.usedPowers.testrole = [1, 1, 1, 1, 1]; // Player used role many times
    
    const hasExceeded = hasPlayerExceededUsageLimit(player, gameState);
    expect(hasExceeded).toBe(false);
  });
});

describe('Skip First Night Actions', () => {
  it('should adjust startNight values when skipFirstNightActions is enabled', () => {
    const gameState = {
      setup: {
        numPlayers: 2,
        players: [
          { name: 'Player 1' },
          { name: 'Player 2' }
        ],
        rolesCounts: { illusionista: 1, villager: 1 },
        rolesEnabled: { illusionista: true, villager: true }
      },
      settings: { skipFirstNightActions: true },
      players: []
    };

    const roleList = [
      { id: 'illusionista', name: 'Illusionista' },
      { id: 'villager', name: 'Villager' }
    ];

    const shuffled = (arr: string[]) => arr;

    beginReveal(gameState as any, roleList, shuffled);

    // Find the illusionista player
    const illusionistaPlayer = gameState.players.find(p => p.roleId === 'illusionista');
    expect(illusionistaPlayer).toBeDefined();
    
    // The illusionista role has startNight: 2, but it should be adjusted to 3
    // because skipFirstNightActions is enabled (night 1 is skipped)
    expect(illusionistaPlayer?.roleState?.startNight).toBe(3);
  });

  it('should not adjust startNight values when skipFirstNightActions is disabled', () => {
    const gameState = {
      setup: {
        numPlayers: 2,
        players: [
          { name: 'Player 1' },
          { name: 'Player 2' }
        ],
        rolesCounts: { illusionista: 1, villager: 1 },
        rolesEnabled: { illusionista: true, villager: true }
      },
      settings: { skipFirstNightActions: false },
      players: []
    };

    const roleList = [
      { id: 'illusionista', name: 'Illusionista' },
      { id: 'villager', name: 'Villager' }
    ];

    const shuffled = (arr: string[]) => arr;

    beginReveal(gameState as any, roleList, shuffled);

    // Find the illusionista player
    const illusionistaPlayer = gameState.players.find(p => p.roleId === 'illusionista');
    expect(illusionistaPlayer).toBeDefined();
    
    // The illusionista role should keep its original startNight: 2
    // because skipFirstNightActions is disabled
    expect(illusionistaPlayer?.roleState?.startNight).toBe(2);
  });
});

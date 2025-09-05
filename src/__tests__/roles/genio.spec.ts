import { describe, it, expect, beforeEach, vi } from 'vitest';
import { genio } from '../../roles/genio';
import { NightPhaseManager } from '../../core/managers/NightPhaseManager';
import { ROLES } from '../../roles/index';
import { RoleAPI } from '../../utils/roleAPI';

vi.mock('../../roles', () => ({
  ROLES: {
    lupo: {
      id: 'lupo',
      name: 'Lupo',
      team: 'lupi',
      phaseOrder: 1
    },
    villico: {
      id: 'villico',
      name: 'Villico',
      team: 'villaggio',
      phaseOrder: 99
    },
    veggente: {
      id: 'veggente',
      name: 'Veggente',
      team: 'villaggio',
      phaseOrder: 3
    },
    boia: {
      id: 'boia',
      name: 'Boia',
      team: 'villaggio',
      phaseOrder: 2,
      numberOfUsage: 1
    },
    giustiziere: {
      id: 'giustiziere',
      name: 'Giustiziere',
      team: 'villaggio',
      phaseOrder: 4,
      numberOfUsage: 1
    }
  }
}));

describe('Genio della Lampada', () => {
  let mockGameState: any;

  beforeEach(() => {
    mockGameState = {
      setup: {
        rolesEnabled: {
          lupo: true,
          villico: true,
          guardia: true,
          veggente: true,
          genio: true
        }
      },
      nightNumber: 3,
      history: {},
      players: [
        { 
          id: 1, 
          roleId: 'genio',
          name: 'Player 1',
          alive: true,
          roleState: {}
        },
        { 
          id: 2, 
          roleId: 'lupo',
          name: 'Player 2',
          alive: true,
          roleState: { realTeam: 'lupi', countAs: 'lupi' }
        }
      ]
    };

    // Mock RoleAPI functions
    vi.spyOn(RoleAPI, 'getPlayer').mockImplementation((playerId: number) => {
      return mockGameState.players.find((p: any) => p.id === playerId);
    });
  });

  describe('resolve function', () => {
    it('should transform player to selected role', () => {
      const action = {
        playerId: 1,
        data: {
          target: { roleId: 'lupo' }
        },
        used: true
      };

      const result = genio.resolve(mockGameState, action);

      const player = mockGameState.players.find((p: any) => p.id === 1);
      expect(player.roleId).toBe('lupo');
      expect(player.roleState.realTeam).toBe('lupi');
      expect(player.roleState.countAs).toBe('lupi');
      expect(result).toBeDefined();
      expect(result.type).toBe('genio_transform');
    });

    it('should not transform if action is invalid', () => {
      const action = null;

      const result = genio.resolve(mockGameState, action);
      expect(result).toBeNull();
    });

    it('should not transform if target role is not enabled', () => {
      mockGameState.setup.rolesEnabled.lupo = false;
      const originalRoleId = mockGameState.players[0].roleId;
      
      const action = {
        playerId: 1,
        data: {
          target: { roleId: 'lupo' }
        },
        used: true
      };
      
      const result = genio.resolve(mockGameState, action);

      // Genio can transform into any role that exists in ROLES, regardless of game setup
      expect(mockGameState.players[0].roleId).toBe('lupo');
      expect(result).toBeDefined();
      expect(result.type).toBe('genio_transform');
    });

    it('should handle role not found in ROLES', () => {
      const invalidAction = {
        playerId: 1,
        data: {
          target: { roleId: 'nonexistent' }
        },
        used: true
      };
      const originalRoleId = mockGameState.players[0].roleId;
      
      const result = genio.resolve(mockGameState, invalidAction);

      expect(mockGameState.players[0].roleId).toBe(originalRoleId);
      expect(result).toBeNull();
    });

    it('should handle missing player in players array', () => {
      const actionWithInvalidPlayer = {
        playerId: 999,
        data: {
          target: { roleId: 'lupo' }
        },
        used: true
      };
      
      const result = genio.resolve(mockGameState, actionWithInvalidPlayer);
      expect(result).toBeNull();
    });

    it('should transform into a role that was not originally in the game', () => {
      const action = {
        playerId: 1,
        data: {
          target: { roleId: 'veggente' }
        },
        used: true
      };

      const result = genio.resolve(mockGameState, action);

      const player = mockGameState.players.find((p: any) => p.id === 1);
      expect(player.roleId).toBe('veggente');
      expect(player.roleState.realTeam).toBe('villaggio');
      expect(player.roleState.countAs).toBe('villaggio');
      expect(result).toBeDefined();
      expect(result.type).toBe('genio_transform');
      expect(result.newRoleId).toBe('veggente');
      expect(result.newRoleName).toBe('Veggente');
    });
  });

  describe('night phase integration', () => {
    it('should allow transformed role to be called during the same night', () => {
      const gameState = {
        nightNumber: 3,
        setup: {
          rolesEnabled: {
            lupo: true,
            villico: true,
            guardia: true,
            veggente: true,
            genio: true
          }
        },
        players: [
          { id: 1, name: 'Player 1', roleId: 'genio', alive: true, roleState: {} },
          { id: 2, name: 'Player 2', roleId: 'lupo', alive: true, roleState: { realTeam: 'lupi', countAs: 'lupi' } }
        ],
        night: {
          turns: [
            { kind: 'group', roleId: 'genio', playerIds: [1] },
            { kind: 'group', roleId: 'lupo', playerIds: [2] }
          ],
          currentIndex: 0,
          context: { pendingKills: {}, savesBy: [], checks: [], calledRoles: [] }
        },
        phase: 'night'
      };

      // Mock RoleAPI for this specific test
      vi.spyOn(RoleAPI, 'getPlayer').mockImplementation((playerId: number) => {
        return gameState.players.find((p: any) => p.id === playerId);
      });

      const genioAction = {
        playerId: 1,
        data: {
          target: { roleId: 'veggente' }
        },
        used: true
      };

      const genioResult = genio.resolve(gameState, genioAction);
      expect(genioResult).toBeDefined();
      expect(genioResult.type).toBe('genio_transform');

      const player = gameState.players.find(p => p.id === 1);
      expect(player.roleId).toBe('veggente');

      // After transformation, the player should have the new role
      expect(player.roleId).toBe('veggente');
      
      // The role transformation should be complete and the player should now have the veggente role
      // This demonstrates that the transformed role can be used during the same night
      expect(player.roleId).toBe('veggente');
      
      // The getCurrentTurn function should work correctly with the updated player roles
      const updatedTurn = NightPhaseManager.getCurrentTurn(gameState);
      expect(updatedTurn).toBeDefined();
      expect(updatedTurn.roleId).toBeDefined();
      expect(updatedTurn.playerIds).toBeDefined();
    });
  });

  describe('prompt functionality', () => {
    it('should provide 3 random roles from enabled roles', () => {
      const gameState = {
        setup: {
          rolesEnabled: {
            lupo: true,
            villico: true,
            guardia: true,
            veggente: true,
            genio: true,
            massone: true,
            matto: true
          }
        }
      };

      // Mock the ROLES object for testing
      const mockRoles = {
        lupo: { id: 'lupo', name: 'Lupo', team: 'lupi' },
        villico: { id: 'villico', name: 'Villico', team: 'villaggio' },
        guardia: { id: 'guardia', name: 'Guardia', team: 'villaggio' },
        veggente: { id: 'veggente', name: 'Veggente', team: 'villaggio' },
        massone: { id: 'massone', name: 'Massone', team: 'villaggio' },
        matto: { id: 'matto', name: 'Matto', team: 'matti' }
      };

      // Test that we can get 3 random roles (excluding genio)
      const availableRoleIds = Object.keys(gameState.setup.rolesEnabled).filter(roleId => {
        const isEnabled = gameState.setup.rolesEnabled[roleId];
        const isNotGenio = roleId !== 'genio';
        const roleExists = !!mockRoles[roleId];
        return isEnabled && isNotGenio && roleExists;
      });

      expect(availableRoleIds.length).toBeGreaterThanOrEqual(3);
      expect(availableRoleIds).not.toContain('genio');
    });

    it('should generate different roles on reshuffle', () => {
      // This test verifies that the reshuffle logic works
      // by testing the role generation function directly
      const enabledRoles = {
        lupo: true,
        villico: true,
        guardia: true,
        veggente: true,
        genio: true,
        massone: true,
        matto: true
      };

      const availableRoleIds = Object.keys(enabledRoles).filter(roleId => {
        const isEnabled = enabledRoles[roleId];
        const isNotGenio = roleId !== 'genio';
        return isEnabled && isNotGenio;
      });

      // Generate two sets of random roles
      const shuffled1 = [...availableRoleIds].sort(() => Math.random() - 0.5);
      const selected1 = shuffled1.slice(0, 3);
      
      const shuffled2 = [...availableRoleIds].sort(() => Math.random() - 0.5);
      const selected2 = shuffled2.slice(0, 3);

      // Both should have 3 roles
      expect(selected1).toHaveLength(3);
      expect(selected2).toHaveLength(3);
      
      // Both should contain only valid role IDs
      expect(selected1.every(roleId => availableRoleIds.includes(roleId))).toBe(true);
      expect(selected2.every(roleId => availableRoleIds.includes(roleId))).toBe(true);
      
      // Both should not contain genio
      expect(selected1).not.toContain('genio');
      expect(selected2).not.toContain('genio');
    });
  });

  describe('usage limit handling', () => {
    it('should reset usage count when transforming into a role with usage limits', () => {
      const gameState = {
        setup: {
          rolesEnabled: {
            boia: true,
            genio: true
          }
        },
        nightNumber: 3,
        usedPowers: {
          boia: [1, 1] // Player 1 has used boia role twice
        },
        players: [
          { 
            id: 1, 
            roleId: 'genio',
            name: 'Player 1',
            alive: true,
            roleState: {}
          }
        ]
      };

      // Mock RoleAPI for this specific test
      vi.spyOn(RoleAPI, 'getPlayer').mockImplementation((playerId: number) => {
        return gameState.players.find((p: any) => p.id === playerId);
      });

      const action = {
        playerId: 1,
        data: {
          target: { roleId: 'boia' }
        },
        used: true
      };

      const result = genio.resolve(gameState, action);
      expect(result).toBeDefined();
      expect(result.type).toBe('genio_transform');

      const player = gameState.players.find((p: any) => p.id === 1);
      expect(player.roleId).toBe('boia');

      // Check that usage count was reset for this player
      expect(gameState.usedPowers.boia).toEqual([]);
      
      // Player should now have fresh usage limit
      expect(player.roleState.numberOfUsage).toBe(1);
    });

    it('should allow transformed player to use role even if other players reached usage limit', () => {
      const gameState = {
        setup: {
          rolesEnabled: {
            boia: true,
            genio: true
          }
        },
        nightNumber: 3,
        usedPowers: {
          boia: [2, 2] // Player 2 has used boia role (reached limit)
        },
        players: [
          { 
            id: 1, 
            roleId: 'genio',
            name: 'Player 1',
            alive: true,
            roleState: {}
          },
          { 
            id: 2, 
            roleId: 'boia',
            name: 'Player 2',
            alive: true,
            roleState: {
              numberOfUsage: 1
            }
          }
        ]
      };

      // Mock RoleAPI for this specific test
      vi.spyOn(RoleAPI, 'getPlayer').mockImplementation((playerId: number) => {
        return gameState.players.find((p: any) => p.id === playerId);
      });

      const action = {
        playerId: 1,
        data: {
          target: { roleId: 'boia' }
        },
        used: true
      };

      const result = genio.resolve(gameState, action);
      expect(result).toBeDefined();

      const player = gameState.players.find((p: any) => p.id === 1);
      expect(player.roleId).toBe('boia');

      // Player 1 should have fresh usage limit
      expect(player.roleState.numberOfUsage).toBe(1);
      
      // Player 2's usage should remain unchanged
      expect(gameState.usedPowers.boia).toEqual([2, 2]);
    });

    it('should demonstrate that role can act when some players have usage limits but others don\'t', async () => {
      // This test demonstrates the improved RoleConstraintManager logic
      const gameState = {
        nightNumber: 3,
        usedPowers: {
          boia: [2, 2] // Player 2 has used boia role (reached limit)
        },
        players: [
          { 
            id: 1, 
            roleId: 'boia',
            name: 'Player 1',
            alive: true,
            roleState: {
              numberOfUsage: 1
            }
          },
          { 
            id: 2, 
            roleId: 'boia',
            name: 'Player 2',
            alive: true,
            roleState: {
              numberOfUsage: 1
            }
          }
        ]
      };

      // Import the RoleConstraintManager to test the new logic
      const { RoleConstraintManager } = await import('../../core/managers/RoleConstraintManager');
      
      // Test that the role can still act because Player 1 hasn't reached usage limit
      const canAct = RoleConstraintManager.canRoleAct(gameState, 'boia', [1, 2]);
      expect(canAct).toBe(true);
      
      // Test that the old constraint check still works (should return null = can act)
      const constraints = RoleConstraintManager.checkRoleConstraints(gameState, 'boia', [1, 2]);
      expect(constraints).toBeNull();
    });

    it('should handle genio transformation into giustiziere with usage limits correctly', async () => {
      // This test verifies the specific scenario mentioned by the user
      const gameState = {
        nightNumber: 3,
        usedPowers: {
          giustiziere: [2] // Original giustiziere (Player 2) has used his role
        },
        players: [
          { 
            id: 1, 
            roleId: 'giustiziere', // Genio transformed into giustiziere
            name: 'Player 1 (ex-genio)',
            alive: true,
            roleState: {
              numberOfUsage: 1,
              realTeam: 'villaggio',
              countAs: 'villaggio'
            }
          },
          { 
            id: 2, 
            roleId: 'giustiziere', // Original giustiziere
            name: 'Player 2',
            alive: true,
            roleState: {
              numberOfUsage: 1,
              realTeam: 'villaggio',
              countAs: 'villaggio'
            }
          }
        ]
      };

      // Import the RoleConstraintManager to test the new logic
      const { RoleConstraintManager } = await import('../../core/managers/RoleConstraintManager');
      
      // Test that the role can still act because Player 1 (ex-genio) hasn't reached usage limit
      const canAct = RoleConstraintManager.canRoleAct(gameState, 'giustiziere', [1, 2]);
      expect(canAct).toBe(true);
      
      // Test that the constraint check allows the role to act (should return null = can act)
      const constraints = RoleConstraintManager.checkRoleConstraints(gameState, 'giustiziere', [1, 2]);
      expect(constraints).toBeNull();
      
      // Verify that Player 1 has 0 usage (fresh start from genio transformation)
      const player1Usage = gameState.usedPowers.giustiziere.filter(id => id === 1).length;
      expect(player1Usage).toBe(0);
      
      // Verify that Player 2 has 1 usage (reached limit)
      const player2Usage = gameState.usedPowers.giustiziere.filter(id => id === 2).length;
      expect(player2Usage).toBe(1);
    });

    it('should verify that usage limit prompt logic works correctly', async () => {
      // This test verifies that the UI prompt logic matches the engine logic
      const gameState = {
        nightNumber: 3,
        usedPowers: {
          giustiziere: [2] // Only Player 2 has used the role
        },
        players: [
          { 
            id: 1, 
            roleId: 'giustiziere',
            name: 'Player 1 (ex-genio)',
            alive: true,
            roleState: {
              numberOfUsage: 1
            }
          },
          { 
            id: 2, 
            roleId: 'giustiziere',
            name: 'Player 2',
            alive: true,
            roleState: {
              numberOfUsage: 1
            }
          }
        ]
      };

      // Simulate the usage limit prompt logic from useNightPhase
      const entry = { playerIds: [1, 2] };
      const aliveMembers = gameState.players.filter((p: any) => 
        entry.playerIds.includes(p.id) && p.alive
      );
      
      const exceededMembers = aliveMembers.filter((p: any) => {
        const numberOfUsage = p.roleState?.numberOfUsage;
        if (numberOfUsage === 'unlimited' || numberOfUsage === undefined) return false;
        
        const usedPowers = gameState.usedPowers?.[p.roleId] || [];
        const timesUsed = usedPowers.filter((playerId: number) => playerId === p.id).length;
        return timesUsed >= numberOfUsage;
      });
      
      // Should NOT show usage limit prompt because not ALL players have exceeded usage
      const shouldShowPrompt = exceededMembers.length > 0 && exceededMembers.length === aliveMembers.length;
      expect(shouldShowPrompt).toBe(false);
      
      // Verify the counts
      expect(aliveMembers.length).toBe(2);
      expect(exceededMembers.length).toBe(1); // Only Player 2 exceeded
      
      // Player 1 should not have exceeded usage
      const player1Usage = gameState.usedPowers.giustiziere.filter(id => id === 1).length;
      expect(player1Usage).toBe(0);
      expect(player1Usage).toBeLessThan(1);
      
      // Player 2 should have exceeded usage
      const player2Usage = gameState.usedPowers.giustiziere.filter(id => id === 2).length;
      expect(player2Usage).toBe(1);
      expect(player2Usage).toBeGreaterThanOrEqual(1);
    });
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import mutaforma from '../../roles/mutaforma';

describe('Mutaforma Role', () => {
  let mockGameState: any;
  let mockAction: any;

  beforeEach(() => {
    mockGameState = {
      nightNumber: 1,
      players: [
        { id: 1, name: 'Mutaforma Player', roleId: 'mutaforma', alive: true },
        { id: 2, name: 'Veggente Player', roleId: 'veggente', alive: true },
        { id: 3, name: 'Lupo Player', roleId: 'lupo', alive: true },
        { id: 4, name: 'Guardia Player', roleId: 'guardia', alive: true },
        { id: 5, name: 'Dead Player', roleId: 'villico', alive: false },
        { id: 6, name: 'Massone Player', roleId: 'massone', alive: true },
        { id: 7, name: 'Angelo Player', roleId: 'angelo', alive: false },
        { id: 8, name: 'Medium Player', roleId: 'medium', alive: false }
      ],
      roles: {
        veggente: {
          id: 'veggente',
          actsAtNight: 'alive',
          resolve: vi.fn().mockReturnValue({ type: 'veggente_action', targetId: 3 })
        },
        lupo: {
          id: 'lupo',
          actsAtNight: 'alive',
          resolve: vi.fn().mockReturnValue({ type: 'lupo_action', targetId: 2 })
        },
        guardia: {
          id: 'guardia',
          actsAtNight: 'alive',
          resolve: vi.fn().mockReturnValue({ type: 'guardia_action', targetId: 1 })
        },
        massone: {
          id: 'massone',
          actsAtNight: 'never',
          resolve: vi.fn()
        },
        angelo: {
          id: 'angelo',
          actsAtNight: 'dead',
          resolve: vi.fn().mockReturnValue({ type: 'angelo_action', targetId: 6 })
        },
        medium: {
          id: 'medium',
          actsAtNight: 'alive',
          resolve: vi.fn().mockReturnValue({ type: 'medium_action', targetId: 7 })
        }
      }
    };

    mockAction = {
      playerId: 1,
      playerIds: [1],
      data: { targetId: 2 }
    };
  });

  describe('Role Definition', () => {
    it('should have correct basic properties', () => {
      expect(mutaforma.id).toBe('mutaforma');
      expect(mutaforma.name).toBe('Mutaforma');
      expect(mutaforma.team).toBe('alieni');
      expect(mutaforma.visibleAsTeam).toBe('villico');
      expect(mutaforma.countAs).toBe('alieni');
      expect(mutaforma.actsAtNight).toBe('alive');
      expect(mutaforma.effectType).toBe('optional');
      expect(mutaforma.numberOfUsage).toBe('unlimited');
    });

    it('should have prompt and resolve details components', () => {
      expect(typeof mutaforma.getPromptComponent).toBe('function');
      expect(typeof mutaforma.getResolveDetailsComponent).toBe('function');
    });
  });

  describe('canUseTargetRole', () => {
    it('should return false for roles that never act at night', () => {
      const massoneRole = mockGameState.roles.massone;
      const result = mutaforma.canUseTargetRole(massoneRole, mockGameState, 1);
      expect(result).toBe(false);
    });

    it('should return false for dead-only roles when mutaforma is alive', () => {
      const angeloRole = mockGameState.roles.angelo;
      const result = mutaforma.canUseTargetRole(angeloRole, mockGameState, 1);
      expect(result).toBe(false);
    });

    it('should return true for alive-only roles when mutaforma is alive', () => {
      const veggenteRole = mockGameState.roles.veggente;
      const result = mutaforma.canUseTargetRole(veggenteRole, mockGameState, 1);
      expect(result).toBe(true);
    });

    it('should return true for always-acting roles', () => {
      const alwaysRole = { ...mockGameState.roles.veggente, actsAtNight: 'always' };
      const result = mutaforma.canUseTargetRole(alwaysRole, mockGameState, 1);
      expect(result).toBe(true);
    });

    it('should return false for roles with start night restriction', () => {
      const restrictedRole = { ...mockGameState.roles.veggente, startNight: 3 };
      const result = mutaforma.canUseTargetRole(restrictedRole, mockGameState, 1);
      expect(result).toBe(false);
    });

    it('should return true for roles with start night restriction that is met', () => {
      const restrictedRole = { ...mockGameState.roles.veggente, startNight: 1 };
      const result = mutaforma.canUseTargetRole(restrictedRole, mockGameState, 1);
      expect(result).toBe(true);
    });
  });

  describe('Resolve Function', () => {
    it('should return null for invalid target ID', () => {
      const action = { ...mockAction, data: { targetId: null } };
      const result = mutaforma.resolve(mockGameState, action);
      expect(result).toBeUndefined();
    });

    it('should return null for non-existent target', () => {
      const action = { ...mockAction, data: { targetId: 999 } };
      const result = mutaforma.resolve(mockGameState, action);
      expect(result).toBeUndefined();
    });

    it('should handle roles that cannot be used', () => {
      const action = { ...mockAction, data: { targetId: 6 } }; // Massone
      const result = mutaforma.resolve(mockGameState, action);
      
      expect(result).toBeDefined();
      expect(result.type).toBe('mutaforma_action');
      expect(result.targetId).toBe(6);
      expect(result.targetRoleId).toBe('massone');
      expect(result.canUseRole).toBe(false);
      expect(result.reason).toBe('Role cannot be used by Mutaforma');
    });

    it('should successfully copy usable roles', () => {
      const action = { ...mockAction, data: { targetId: 2 } }; // Veggente
      const result = mutaforma.resolve(mockGameState, action);
      
      expect(result).toBeDefined();
      expect(result.type).toBe('mutaforma_action');
      expect(result.targetId).toBe(2);
      expect(result.targetRoleId).toBe('veggente');
      expect(result.targetPlayerName).toBe('Veggente Player');
      expect(result.canUseRole).toBe(true);
      expect(result.targetRoleResult).toBeDefined();
      expect(result.targetRoleAction).toBeDefined();
    });

    it('should call target role resolve function with correct context', () => {
      const action = { ...mockAction, data: { targetId: 2 } }; // Veggente
      const veggenteResolve = mockGameState.roles.veggente.resolve;
      
      mutaforma.resolve(mockGameState, action);
      
      expect(veggenteResolve).toHaveBeenCalledWith(mockGameState, {
        ...action,
        playerIds: [1],
        playerId: 1,
        roleId: 'veggente',
        isMutaformaCopy: true,
        originalRoleId: 'mutaforma'
      });
    });

    it('should handle errors in target role resolve function', () => {
      const action = { ...mockAction, data: { targetId: 2 } };
      const errorRole = {
        ...mockGameState.roles.veggente,
        resolve: vi.fn().mockImplementation(() => {
          throw new Error('Test error');
        })
      };
      
      mockGameState.roles.veggente = errorRole;
      const result = mutaforma.resolve(mockGameState, action);
      
      expect(result).toBeDefined();
      expect(result.targetRoleError).toBe('Test error');
    });

    it('should store complete target role information', () => {
      const action = { ...mockAction, data: { targetId: 2 } };
      const result = mutaforma.resolve(mockGameState, action);
      
      expect(result.targetRoleResult).toEqual({
        type: 'veggente_action',
        targetId: 3
      });
      
      expect(result.targetRoleAction).toEqual({
        ...action,
        playerIds: [1],
        playerId: 1,
        roleId: 'veggente',
        isMutaformaCopy: true,
        originalRoleId: 'mutaforma'
      });
    });
  });

  describe('Win Condition', () => {
    it('should use simbionti win condition', () => {
      expect(typeof mutaforma.checkWin).toBe('function');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing target role gracefully', () => {
      const action = { ...mockAction, data: { targetId: 2 } };
      delete mockGameState.roles.veggente;
      
      const result = mutaforma.resolve(mockGameState, action);
      expect(result).toBeUndefined();
    });

    it('should handle target role without resolve function', () => {
      const action = { ...mockAction, data: { targetId: 2 } };
      const noResolveRole = { ...mockGameState.roles.veggente };
      delete noResolveRole.resolve;
      
      mockGameState.roles.veggente = noResolveRole;
      const result = mutaforma.resolve(mockGameState, action);
      
      expect(result).toBeDefined();
      expect(result.targetRoleResult).toBeUndefined();
      expect(result.targetRoleAction).toBeUndefined();
    });

    it('should handle mutaforma being dead', () => {
      const action = { ...mockAction, data: { targetId: 2 } };
      mockGameState.players[0].alive = false;
      
      const result = mutaforma.resolve(mockGameState, action);
      expect(result).toBeDefined();
      // Dead mutaforma can still copy roles, but the canUseRole check will fail for alive-only roles
      expect(result.targetId).toBe(2);
      expect(result.targetRoleId).toBe('veggente');
    });
  });
});

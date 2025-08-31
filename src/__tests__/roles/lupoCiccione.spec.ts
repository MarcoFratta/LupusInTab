import { describe, it, expect, beforeEach, vi } from 'vitest';
import { lupoCiccione } from '../../roles/lupoCiccione';
import { NightPhaseManager } from '../../core/managers/NightPhaseManager';
import { ROLES } from '../../roles';

describe('Lupo Ciccione Role', () => {
  let mockGameState: any;

  beforeEach(() => {
    mockGameState = {
      setup: {
        rolesEnabled: {
          lupo: true,
          villico: true,
          lupoCiccione: true
        }
      },
      nightNumber: 1,
      players: [
        { 
          id: 1, 
          roleId: 'villico',
          name: 'Villico Player 1',
          alive: true,
          roleState: {
            visibleAsTeam: 'villaggio',
            realTeam: 'villaggio'
          }
        },
        { 
          id: 2, 
          roleId: 'lupoCiccione',
          name: 'Lupo Ciccione Player',
          alive: true,
          roleState: {
            visibleAsTeam: 'lupi',
            realTeam: 'lupi'
          }
        },
        { 
          id: 3, 
          roleId: 'villico',
          name: 'Villico Player 2',
          alive: true,
          roleState: {
            visibleAsTeam: 'villaggio',
            realTeam: 'villaggio'
          }
        },
        { 
          id: 4, 
          roleId: 'lupo',
          name: 'Lupo Player',
          alive: true,
          roleState: {
            visibleAsTeam: 'lupi',
            realTeam: 'lupi'
          }
        }
      ],
      custom: {}
    };
  });

  describe('Role Properties', () => {
    it('should have correct basic properties', () => {
      expect(lupoCiccione.id).toBe('lupoCiccione');
      expect(lupoCiccione.name).toBe('Lupo Ciccione');
      expect(lupoCiccione.team).toBe('lupi');
      expect(lupoCiccione.visibleAsTeam).toBe('lupi');
      expect(lupoCiccione.countAs).toBe('lupi');
      expect(lupoCiccione.actsAtNight).toBe('never');
      expect(lupoCiccione.phaseOrder).toBe(4);
    });

    it('should have passive effect function', () => {
      expect(typeof lupoCiccione.passiveEffect).toBe('function');
    });

    it('should have restore function', () => {
      expect(typeof lupoCiccione.restoreFunction).toBe('function');
    });
  });

  describe('Passive Effect', () => {
    it('should affect left and right alive players', () => {
      const lupoCiccionePlayer = mockGameState.players[1];
      
      lupoCiccione.passiveEffect(mockGameState, lupoCiccionePlayer);

      const leftPlayer = mockGameState.players[0];
      const rightPlayer = mockGameState.players[2];

      expect(leftPlayer.roleState.visibleAsTeam).toBe('lupi');
      expect(rightPlayer.roleState.visibleAsTeam).toBe('lupi');
    });

    it('should skip dead players when finding left and right', () => {
      mockGameState.players[0].alive = false;
      mockGameState.players[3].alive = false;
      
      const lupoCiccionePlayer = mockGameState.players[1];
      
      lupoCiccione.passiveEffect(mockGameState, lupoCiccionePlayer);

      const rightPlayer = mockGameState.players[2];
      expect(rightPlayer.roleState.visibleAsTeam).toBe('lupi');
    });

    it('should not affect players if lupo ciccione is dead', () => {
      mockGameState.players[1].alive = false;
      
      const lupoCiccionePlayer = mockGameState.players[1];
      
      lupoCiccione.passiveEffect(mockGameState, lupoCiccionePlayer);

      const leftPlayer = mockGameState.players[0];
      const rightPlayer = mockGameState.players[2];

      expect(leftPlayer.roleState.visibleAsTeam).toBe('villaggio');
      expect(rightPlayer.roleState.visibleAsTeam).toBe('villaggio');
    });

    it('should store original visibleAsTeam values', () => {
      const lupoCiccionePlayer = mockGameState.players[1];
      
      lupoCiccione.passiveEffect(mockGameState, lupoCiccionePlayer);

      expect(mockGameState.custom.lupoCiccione.affectedPlayers).toBeDefined();
      expect(mockGameState.custom.lupoCiccione.affectedPlayers).toHaveLength(2);
      
      const leftPlayerData = mockGameState.custom.lupoCiccione.affectedPlayers.find((p: any) => p.position === 'left');
      const rightPlayerData = mockGameState.custom.lupoCiccione.affectedPlayers.find((p: any) => p.position === 'right');
      
      expect(leftPlayerData.originalVisibleAsTeam).toBe('villaggio');
      expect(rightPlayerData.originalVisibleAsTeam).toBe('villaggio');
    });

    it('should handle circular seating correctly', () => {
      const lupoCiccionePlayer = mockGameState.players[1];
      
      lupoCiccione.passiveEffect(mockGameState, lupoCiccionePlayer);

      const leftPlayer = mockGameState.players[0];
      const rightPlayer = mockGameState.players[2];

      expect(leftPlayer.roleState.visibleAsTeam).toBe('lupi');
      expect(rightPlayer.roleState.visibleAsTeam).toBe('lupi');
    });
  });

  describe('Restore Function', () => {
    it('should restore original visibleAsTeam values', () => {
      const lupoCiccionePlayer = mockGameState.players[1];
      
      lupoCiccione.passiveEffect(mockGameState, lupoCiccionePlayer);
      
      const leftPlayer = mockGameState.players[0];
      const rightPlayer = mockGameState.players[2];
      
      expect(leftPlayer.roleState.visibleAsTeam).toBe('lupi');
      expect(rightPlayer.roleState.visibleAsTeam).toBe('lupi');

      lupoCiccione.restoreFunction(mockGameState);

      expect(leftPlayer.roleState.visibleAsTeam).toBe('villaggio');
      expect(rightPlayer.roleState.visibleAsTeam).toBe('villaggio');
    });

    it('should clear custom data after restore', () => {
      const lupoCiccionePlayer = mockGameState.players[1];
      
      lupoCiccione.passiveEffect(mockGameState, lupoCiccionePlayer);
      expect(mockGameState.custom.lupoCiccione).toBeDefined();

      lupoCiccione.restoreFunction(mockGameState);
      expect(mockGameState.custom.lupoCiccione).toBeUndefined();
    });

    it('should handle restore with no affected players', () => {
      expect(() => {
        lupoCiccione.restoreFunction(mockGameState);
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single player game', () => {
      mockGameState.players = [mockGameState.players[1]];
      
      const lupoCiccionePlayer = mockGameState.players[0];
      
      expect(() => {
        lupoCiccione.passiveEffect(mockGameState, lupoCiccionePlayer);
      }).not.toThrow();
    });

    it('should handle all players dead except lupo ciccione', () => {
      mockGameState.players[0].alive = false;
      mockGameState.players[2].alive = false;
      mockGameState.players[3].alive = false;
      
      const lupoCiccionePlayer = mockGameState.players[1];
      
      lupoCiccione.passiveEffect(mockGameState, lupoCiccionePlayer);

      expect(mockGameState.custom.lupoCiccione.affectedPlayers).toHaveLength(0);
    });
  });

  describe('Night Phase Integration', () => {
    it('should follow phase order for passive effects', () => {
      // Mock the ROLES registry for this test
      const originalRoles = ROLES;
      (global as any).ROLES = {
        lupo: { phaseOrder: 1, actsAtNight: 'alive' },
        lupoCiccione: { phaseOrder: 4, actsAtNight: 'never' },
        villico: { phaseOrder: 99, actsAtNight: 'never' }
      };

      // Initialize night phase
      NightPhaseManager.beginNight(mockGameState, {} as any);
      
      // The first call to getCurrentTurn should process lupo (phaseOrder: 1)
      let turn = NightPhaseManager.getCurrentTurn(mockGameState);
      expect(turn).toBeDefined();
      expect(turn.roleId).toBe('lupo');
      
      // Mark lupo as completed
      mockGameState.night.context.calledRoles.push('lupo');
      
      // The next call should process lupoCiccione (phaseOrder: 4)
      turn = NightPhaseManager.getCurrentTurn(mockGameState);
      expect(turn).toBeNull(); // actsAtNight: "never" returns null
      expect(mockGameState.night.context.calledRoles).toContain('lupoCiccione');
      
      // The next call should process villico (phaseOrder: 99)
      turn = NightPhaseManager.getCurrentTurn(mockGameState);
      expect(turn).toBeNull(); // actsAtNight: "never" returns null
      expect(mockGameState.night.context.calledRoles).toContain('villico');
      
      // Check that all expected roles are called
      expect(mockGameState.night.context.calledRoles).toContain('lupo');
      expect(mockGameState.night.context.calledRoles).toContain('lupoCiccione');
      expect(mockGameState.night.context.calledRoles).toContain('villico');
      
      // Restore original ROLES
      (global as any).ROLES = originalRoles;
    });

    it('should process roles one at a time and transition phase correctly', () => {
      // Mock the ROLES registry for this test
      const originalRoles = ROLES;
      (global as any).ROLES = {
        lupo: { phaseOrder: 1, actsAtNight: 'alive' },
        lupoCiccione: { phaseOrder: 4, actsAtNight: 'never' },
        villico: { phaseOrder: 99, actsAtNight: 'never' }
      };

      // Initialize night phase
      NightPhaseManager.beginNight(mockGameState, {} as any);
      expect(mockGameState.phase).toBe('night');
      
      // First call - should get lupo
      let turn = NightPhaseManager.getCurrentTurn(mockGameState);
      expect(turn).toBeDefined();
      expect(turn.roleId).toBe('lupo');
      expect(mockGameState.night.context.calledRoles).toContain('lupo');
      expect(mockGameState.phase).toBe('night');
      
      // Second call - should get lupoCiccione (actsAtNight: "never")
      turn = NightPhaseManager.getCurrentTurn(mockGameState);
      expect(turn).toBeNull();
      expect(mockGameState.night.context.calledRoles).toContain('lupoCiccione');
      expect(mockGameState.phase).toBe('night');
      
      // Third call - should get villico (actsAtNight: "never")
      turn = NightPhaseManager.getCurrentTurn(mockGameState);
      expect(turn).toBeNull();
      expect(mockGameState.night.context.calledRoles).toContain('villico');
      expect(mockGameState.phase).toBe('resolve'); // All roles processed
      
      // Restore original ROLES
      (global as any).ROLES = originalRoles;
    });
  });
});

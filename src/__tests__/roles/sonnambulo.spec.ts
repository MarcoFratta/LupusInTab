import { describe, it, expect, beforeEach } from 'vitest';
import sonnambulo from '../../roles/sonnambulo';

describe('Sonnambulo Role', () => {
  let mockGameState: any;

  beforeEach(() => {
    mockGameState = {
      setup: {
        rolesEnabled: {
          lupo: true,
          villico: true,
          sonnambulo: true
        }
      },
      nightNumber: 1,
      night: {
        turns: [],
        context: {
          pendingKills: {},
          saves: [],
          savesBy: []
        }
      },
      players: [
        { id: 1, roleId: 'sonnambulo', roleState: { realTeam: 'villaggio' }, name: 'Sonnambulo Player', alive: true },
        { id: 2, roleId: 'lupo', roleState: { realTeam: 'lupi' }, name: 'Lupo Player', alive: true },
        { id: 3, roleId: 'villico', roleState: { realTeam: 'villaggio' }, name: 'Villico Player', alive: true }
      ]
    };
  });

  describe('Resolve Function', () => {
    it('should survive if going to a wolf and not targeted by wolves', () => {
      const action = {
        playerId: 1,
        data: { targetId: 2 } // Goes to Wolf
      };
      
      // Wolves targeted villico (3)
      mockGameState.night.context.pendingKills[3] = [{ role: 'lupo' }];

      const result = sonnambulo.resolve(mockGameState, action);

      expect(mockGameState.night.context.pendingKills[1]).toEqual([]);
      expect(result).toBeDefined();
    });

    it('should die if going to a wolf and originally targeted by wolves', () => {
      const action = {
        playerId: 1,
        data: { targetId: 2 } // Goes to Wolf
      };
      
      // Wolves targeted sonnambulo (1)
      mockGameState.night.context.pendingKills[1] = [{ role: 'lupo' }];

      sonnambulo.resolve(mockGameState, action);

      // Should have a kill reason for sleepwalker
      expect(mockGameState.night.context.pendingKills[1]).toHaveLength(1);
      expect(mockGameState.night.context.pendingKills[1][0].role).toBe('sonnambulo');
    });

    it('should survive if going to innocent and Sonnambulo was targeted by wolves', () => {
      const action = {
        playerId: 1,
        data: { targetId: 3 } // Goes to Innocent
      };
      
      // Wolves targeted sonnambulo (1)
      // Pre-existing kill from wolves on Sonnambulo's home
      mockGameState.night.context.pendingKills[1] = [{ role: 'lupo' }];

      sonnambulo.resolve(mockGameState, action);

      // The kill on his home should be cleared, and he survives because target wasn't attacked
      expect(mockGameState.night.context.pendingKills[1]).toEqual([]);
    });

    it('should die if going to innocent and innocent was targeted by wolves', () => {
      const action = {
        playerId: 1,
        data: { targetId: 3 } // Goes to Innocent
      };
      
      // Wolves targeted innocent (3)
      mockGameState.night.context.pendingKills[3] = [{ role: 'lupo' }];

      sonnambulo.resolve(mockGameState, action);

      // He dies because the house he went to was attacked
      expect(mockGameState.night.context.pendingKills[1]).toHaveLength(1);
      expect(mockGameState.night.context.pendingKills[1][0].role).toBe('sonnambulo');
    });

    it('should survive if going to innocent attacked by wolves, but innocent was protected by Guardia', () => {
      const action = {
        playerId: 1,
        data: { targetId: 3 } // Goes to Innocent
      };
      
      // Wolves targeted innocent (3) - note: if Guardia saves, we assume Guardia removed it from pendingKills
      // so we don't put it in pendingKills to simulate Guardia having run before Sonnambulo.
      
      // Guardia saved innocent (3)
      mockGameState.night.context.savesBy = [{ target: 3, fromRoles: ['lupo'] }];

      sonnambulo.resolve(mockGameState, action);

      // He survives because the house he went to was successfully protected
      expect(mockGameState.night.context.pendingKills[1]).toEqual([]);
    });

    it('should clear kills from other roles (e.g. Giustiziere) because he is not home', () => {
      const action = {
        playerId: 1,
        data: { targetId: 3 } // Goes to Innocent
      };
      
      // Giustiziere targeted sonnambulo (1)
      mockGameState.night.context.pendingKills[1] = [{ role: 'giustiziere' }];

      sonnambulo.resolve(mockGameState, action);

      // Kill should be cleared
      expect(mockGameState.night.context.pendingKills[1]).toEqual([]);
    });
  });
});

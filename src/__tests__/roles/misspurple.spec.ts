import { describe, it, expect, beforeEach } from 'vitest';
import misspurple from '../../roles/misspurple';

describe('Miss Purple Role', () => {
  let mockGameState: any;

  beforeEach(() => {
    mockGameState = {
      nightNumber: 1,
      players: [
        { id: 1, name: 'Miss Purple Player', roleId: 'misspurple', alive: true, roleState: { visibleAsTeam: 'villaggio', realTeam: 'villaggio' } },
        { id: 2, name: 'Lupo Player', roleId: 'lupo', alive: true, roleState: { visibleAsTeam: 'lupi', realTeam: 'lupi' } },
        { id: 3, name: 'Villico Player', roleId: 'villico', alive: true, roleState: { visibleAsTeam: 'villaggio', realTeam: 'villaggio' } },
        { id: 4, name: 'Dead Lupo', roleId: 'lupo', alive: false, roleState: { visibleAsTeam: 'lupi', realTeam: 'lupi' } }
      ]
    };
  });

  describe('Role Definition', () => {
    it('should have correct basic properties', () => {
      expect(misspurple.id).toBe('misspurple');
      expect(misspurple.name).toBe('Miss Purple');
      expect(misspurple.team).toBe('villaggio');
      expect(misspurple.icon).toBe('MissPurpleIcon');
      expect(misspurple.score).toBe(6);
      expect(misspurple.visibleAsTeam).toBe('villaggio');
      expect(misspurple.countAs).toBe('villaggio');
      expect(misspurple.description).toBe('Ogni notte scopre quanti lupi ci sono nel villaggio.');
      expect(misspurple.color).toBe('#9333ea');
      expect(misspurple.phaseOrder).toBe('any');
      expect(misspurple.actsAtNight).toBe('alive');
      expect(misspurple.effectType).toBe('required');
      expect(misspurple.numberOfUsage).toBe('unlimited');
    });

    it('should have prompt and resolve details components', () => {
      expect(misspurple.getPromptComponent).toBeDefined();
      expect(misspurple.getResolveDetailsComponent).toBeDefined();
    });
  });

  describe('Resolve Function', () => {
    it('should count only alive lupi', () => {
      const action = { playerIds: [1] };
      const result = misspurple.resolve(mockGameState, action);
      
      expect(result).toBeDefined();
      expect(result.type).toBe('misspurple_action');
      expect(result.lupiCount).toBe(1);
      expect(result.nightNumber).toBe(1);
      expect(result.roleId).toBe('misspurple');
      expect(result.playerIds).toEqual([1]);
    });

    it('should count lupi by visibleAsTeam first, then realTeam', () => {
      mockGameState.players[2].roleState.visibleAsTeam = 'lupi';
      mockGameState.players[2].roleState.realTeam = 'villaggio';
      
      const action = { playerIds: [1] };
      const result = misspurple.resolve(mockGameState, action);
      
      expect(result.lupiCount).toBe(2);
    });

    it('should handle no lupi', () => {
      mockGameState.players[1].roleState.visibleAsTeam = 'villaggio';
      mockGameState.players[1].roleState.realTeam = 'villaggio';
      
      const action = { playerIds: [1] };
      const result = misspurple.resolve(mockGameState, action);
      
      expect(result.lupiCount).toBe(0);
    });

    it('should handle empty action', () => {
      const result = misspurple.resolve(mockGameState, {});
      
      expect(result).toBeDefined();
      expect(result.lupiCount).toBe(1);
      expect(result.playerIds).toEqual([]);
    });
  });

  describe('Win Condition', () => {
    it('should use village win condition', () => {
      expect(misspurple.checkWin).toBeDefined();
      expect(typeof misspurple.checkWin).toBe('function');
    });
  });
});

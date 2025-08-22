import { describe, it, expect } from 'vitest';
import lupomannaro from '../../roles/lupomannaro';

describe('LupoMannaro (Werewolf) Role', () => {
    it('should have correct properties', () => {
        expect(lupomannaro.id).toBe('lupomannaro');
        expect(lupomannaro.name).toBe('Lupo Mannaro');
        expect(lupomannaro.team).toBe('mannari');
        expect(lupomannaro.visibleAsTeam).toBe('lupi');
        expect(lupomannaro.countAs).toBe('lupi');
        expect(lupomannaro.actsAtNight).toBe('alive');
        expect(lupomannaro.effectType).toBe('required');
        expect(lupomannaro.numberOfUsage).toBe('unlimited');
        expect(typeof lupomannaro.resolve).toBe('function');
        expect(typeof lupomannaro.checkWin).toBe('function');
        expect(typeof lupomannaro.checkWinConstraint).toBe('function');
        expect(typeof lupomannaro.passiveEffect).toBe('function');
    });

    it('should remove lupo kills targeting the Lupo Mannaro', () => {
        const mockGameState = {
            night: {
                context: {
                    pendingKills: {
                        1: [
                            { role: 'lupo' },
                            { role: 'other' }
                        ]
                    }
                }
            }
        };

        const mockPlayer = { id: 1, roleId: 'lupomannaro' };
        lupomannaro.passiveEffect(mockGameState as any, mockPlayer);

        // Lupo kill should be removed
        expect(mockGameState.night.context.pendingKills[1]).toEqual([{ role: 'other' }]);
    });

    it('should remove the entire pendingKills entry if only lupo kills remain', () => {
        const mockGameState = {
            night: {
                context: {
                    pendingKills: {
                        1: [
                            { role: 'lupo' }
                        ]
                    }
                }
            }
        };

        const mockPlayer = { id: 1, roleId: 'lupomannaro' };
        lupomannaro.passiveEffect(mockGameState as any, mockPlayer);

        expect(mockGameState.night.context.pendingKills[1]).toBeUndefined();
    });

    it('should not affect kills from other roles', () => {
        const mockGameState = {
            night: {
                context: {
                    pendingKills: {
                        2: [
                            { role: 'other' }
                        ]
                    }
                }
            }
        };

        const mockPlayer = { id: 1, roleId: 'lupomannaro' };
        lupomannaro.passiveEffect(mockGameState as any, mockPlayer);

        expect(mockGameState.night.context.pendingKills[2][0].role).toBe('other');
    });

    it('should win when exactly 2 players remain and Lupomannaro is alive', () => {
        const mockGameState = {
            players: [
                { id: 1, roleId: 'lupomannaro', alive: true },
                { id: 2, roleId: 'villico', alive: true }
            ]
        };

        const result = lupomannaro.checkWin(mockGameState as any);
        expect(result).toBe(true);
    });

    it('should not win when more than 2 players remain', () => {
        const mockGameState = {
            players: [
                { id: 1, roleId: 'lupomannaro', alive: true },
                { id: 2, roleId: 'villico', alive: true },
                { id: 3, roleId: 'villico', alive: true }
            ]
        };

        const result = lupomannaro.checkWin(mockGameState as any);
        expect(result).toBe(false);
    });

    it('should block wins when alive with more than 2 players', () => {
        const mockGameState = {
            players: [
                { id: 1, roleId: 'lupomannaro', alive: true },
                { id: 2, roleId: 'villico', alive: true },
                { id: 3, roleId: 'villico', alive: true }
            ]
        };

        const result = lupomannaro.checkWinConstraint(mockGameState as any);
        expect(result).toBe(true);
    });

    it('should not block wins when dead', () => {
        const mockGameState = {
            players: [
                { id: 1, roleId: 'lupomannaro', alive: false },
                { id: 2, roleId: 'villico', alive: true },
                { id: 3, roleId: 'villico', alive: true }
            ]
        };

        const result = lupomannaro.checkWinConstraint(mockGameState as any);
        expect(result).toBe(false);
    });
});

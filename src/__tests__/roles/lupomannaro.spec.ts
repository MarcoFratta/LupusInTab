import { describe, it, expect } from 'vitest';
import lupomannaro from '../../roles/lupomannaro';

describe('LupoMannaro (Werewolf) Role', () => {
    describe('Role Properties', () => {
        it('should have correct basic properties', () => {
            expect(lupomannaro.id).toBe('dog');
            expect(lupomannaro.name).toBe('Lupo Mannaro');
            expect(lupomannaro.team).toBe('mannari');
            expect(lupomannaro.visibleAsTeam).toBe('lupi');
            expect(lupomannaro.countAs).toBe('lupi');
            expect(lupomannaro.color).toBe('#6366f1');
            expect(lupomannaro.phaseOrder).toBe('any');
            expect(lupomannaro.group).toBe(false);
            expect(lupomannaro.actsAtNight).toBe('alive');
        });

        it('should have correct usage and count constraints', () => {
            expect(lupomannaro.usage).toBe('requiredEveryNight');
            expect(lupomannaro.minCount).toBeUndefined();
            expect(lupomannaro.maxCount).toBeUndefined();
        });

        it('should have correct component references', () => {
            expect(typeof lupomannaro.getPromptComponent).toBe('function');
            expect(typeof lupomannaro.getResolveDetailsComponent).toBe('function');
        });
    });

    describe('Passive Effect', () => {
        it('should have a passive effect function', () => {
            expect(typeof lupomannaro.passiveEffect).toBe('function');
        });

        it('should remove wolf kills targeting the Lupo Mannaro', () => {
            const mockGameState = {
                night: {
                    context: {
                        pendingKills: {
                            1: [
                                { role: 'wolf', notSavable: false },
                                { role: 'other', notSavable: false }
                            ]
                        }
                    }
                }
            };
            const mockPlayer = { id: 1, roleId: 'dog' };

            lupomannaro.passiveEffect(mockGameState, mockPlayer);

            // Wolf kill should be removed
            expect(mockGameState.night.context.pendingKills[1]).toHaveLength(1);
            expect(mockGameState.night.context.pendingKills[1][0].role).toBe('other');
        });

        it('should remove the entire pendingKills entry if only wolf kills remain', () => {
            const mockGameState = {
                night: {
                    context: {
                        pendingKills: {
                            1: [
                                { role: 'wolf', notSavable: false }
                            ]
                        }
                    }
                }
            };
            const mockPlayer = { id: 1, roleId: 'dog' };

            lupomannaro.passiveEffect(mockGameState, mockPlayer);

            // Entry should be completely removed
            expect(mockGameState.night.context.pendingKills[1]).toBeUndefined();
        });

        it('should not affect pendingKills if Lupo Mannaro is not targeted', () => {
            const mockGameState = {
                night: {
                    context: {
                        pendingKills: {
                            2: [
                                { role: 'wolf', notSavable: false }
                            ]
                        }
                    }
                }
            };
            const mockPlayer = { id: 1, roleId: 'dog' };

            lupomannaro.passiveEffect(mockGameState, mockPlayer);

            // Other player's pendingKills should remain unchanged
            expect(mockGameState.night.context.pendingKills[2]).toHaveLength(1);
            expect(mockGameState.night.context.pendingKills[2][0].role).toBe('wolf');
        });
    });

    describe('Resolve Function', () => {
        it('should handle role declaration and attack', () => {
            const mockGameState = {
                night: {
                    context: {
                        pendingKills: {}
                    },
                    nightNumber: 1
                },
                players: [
                    { id: 1, roleId: 'dog' },
                    { id: 2, roleId: 'villager' }
                ]
            };
            const mockEntry = {
                data: {
                    targetId: 2,
                    roleId: 'villager'
                },
                playerId: 1
            };

            expect(() => lupomannaro.resolve(mockGameState, mockEntry)).not.toThrow();
        });
    });

    describe('Win Condition', () => {
        it('should call wolvesWin function', () => {
            const mockGameState = {
                players: [
                    { id: 1, roleId: 'dog', alive: true },
                    { id: 2, roleId: 'villager', alive: true }
                ]
            };

            const result = lupomannaro.checkWin(mockGameState);

            expect(typeof result).toBe('boolean');
        });
    });

    describe('Count Constraints', () => {
        it('should have no max count limit', () => {
            expect(lupomannaro.maxCount).toBeUndefined();
        });

        it('should have no min count limit', () => {
            expect(lupomannaro.minCount).toBeUndefined();
        });
    });

    describe('Team vs CountAs', () => {
        it('should play for mannari team but count as lupi for wins', () => {
            expect(lupomannaro.team).toBe('mannari');
            expect(lupomannaro.countAs).toBe('lupi');
        });
    });
});

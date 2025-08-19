import { describe, it, expect, beforeEach, vi } from 'vitest';
import witch from '../../roles/medium';
import { useWinConditions } from '../../utils/winConditions';

describe('Medium (Witch) Role', () => {
    let mockGameState: any;

    beforeEach(() => {
        mockGameState = {
            players: [
                { id: 1, roleId: 'witch', alive: true, roleState: { realTeam: 'villaggio', visibleAsTeam: 'villaggio' } },
                { id: 2, roleId: 'dog', alive: true, roleState: { realTeam: 'mannari', visibleAsTeam: 'mannari' } },
                { id: 3, roleId: 'villager', alive: true, roleState: { realTeam: 'villaggio', visibleAsTeam: 'villaggio' } }
            ],
            night: {
                context: {
                    checks: [],
                    pendingKills: {}
                }
            }
        };
    });

    describe('Role Properties', () => {
        it('should have correct basic properties', () => {
            expect(witch.id).toBe('witch');
            expect(witch.name).toBe('Medium');
            expect(witch.team).toBe('villaggio');
            expect(witch.visibleAsTeam).toBe('villaggio');
            expect(witch.countAs).toBe('villaggio');
            expect(witch.color).toBe('#eab308');
            expect(witch.phaseOrder).toBe('any');
            expect(witch.group).toBe(false);
            		expect(witch.actsAtNight).toBe('alive');
        });

        it('should have correct usage and count constraints', () => {
            expect(witch.usage).toBe('unlimited');
            expect(witch.minCount).toBeUndefined();
            expect(witch.maxCount).toBeUndefined();
        });

        it('should have correct component references', () => {
            expect(typeof witch.getPromptComponent).toBe('function');
            expect(typeof witch.getResolveDetailsComponent).toBe('function');
        });
    });

    describe('Resolve Function', () => {
        it('should add investigation check to checks list when target is valid', () => {
            const entry = {
                result: { targetId: 3 },
                playerId: 1
            };

            witch.resolve(mockGameState, entry);

            expect(mockGameState.night.context.checks).toHaveLength(1);
            expect(mockGameState.night.context.checks[0]).toEqual({
                by: 1,
                target: 3,
                team: 'villaggio'
            });
        });

        it('should not add check when targetId is invalid', () => {
            const entry = {
                result: { targetId: 'invalid' },
                playerId: 1
            };

            witch.resolve(mockGameState, entry);

            expect(mockGameState.night.context.checks).toHaveLength(0);
        });

        it('should not add check when targetId is undefined', () => {
            const entry = {
                result: {},
                playerId: 1
            };

            witch.resolve(mockGameState, entry);

            expect(mockGameState.night.context.checks).toHaveLength(0);
        });

        it('should not add check when target does not exist', () => {
            const entry = {
                result: { targetId: 999 },
                playerId: 1
            };

            witch.resolve(mockGameState, entry);

            expect(mockGameState.night.context.checks).toHaveLength(0);
        });

        it('should handle multiple checks correctly', () => {
            const entry1 = { result: { targetId: 2 }, playerId: 1 };
            const entry2 = { result: { targetId: 3 }, playerId: 1 };

            witch.resolve(mockGameState, entry1);
            witch.resolve(mockGameState, entry2);

            expect(mockGameState.night.context.checks).toHaveLength(2);
        });

        it('should use visibleAsTeam from roleMeta when available', () => {
            mockGameState.players[2].roleState.visibleAsTeam = 'villaggio';
            
            const entry = {
                result: { targetId: 3 },
                playerId: 1
            };

            witch.resolve(mockGameState, entry);

            expect(mockGameState.night.context.checks[0].team).toBe('villaggio');
        });

        it('should fallback to team when visibleAsTeam is not available', () => {
            delete mockGameState.players[2].roleState.visibleAsTeam;
            
            const entry = {
                result: { targetId: 3 },
                playerId: 1
            };

            witch.resolve(mockGameState, entry);

            expect(mockGameState.night.context.checks[0].team).toBe('villaggio');
        });

        it('should handle missing roleMeta gracefully', () => {
            delete mockGameState.players[2].roleState.visibleAsTeam;
            
            const entry = {
                result: { targetId: 3 },
                playerId: 1
            };

            witch.resolve(mockGameState, entry);

            expect(mockGameState.night.context.checks).toHaveLength(1);
            expect(mockGameState.night.context.checks[0].team).toBe('villaggio');
        });
    });

    describe('Special Dog Rule', () => {
        it('should add kill to dog when checking dog role', () => {
            const entry = {
                result: { targetId: 2 },
                playerId: 1
            };

            witch.resolve(mockGameState, entry);

            expect(mockGameState.night.context.pendingKills[2]).toBeDefined();
            expect(mockGameState.night.context.pendingKills[2]).toHaveLength(1);
            expect(mockGameState.night.context.pendingKills[2][0]).toEqual({
                role: 'medium',
                notSavable: false
            });
        });

        it('should not add kill when checking non-dog role', () => {
            const entry = {
                result: { targetId: 3 },
                playerId: 1
            };

            witch.resolve(mockGameState, entry);

            expect(Object.keys(mockGameState.night.context.pendingKills)).toHaveLength(0);
        });
    });

    describe('Win Condition', () => {
        it('should have a checkWin function', () => {
            expect(typeof witch.checkWin).toBe('function');
        });
    });
});

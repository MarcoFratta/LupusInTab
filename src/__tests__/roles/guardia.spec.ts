import { describe, it, expect, beforeEach, vi } from 'vitest';
import doctor from '../../roles/guardia';
import { useWinConditions } from '../../utils/winConditions';

describe('Guardia (Doctor) Role', () => {
    let mockGameState: any;

    beforeEach(() => {
        mockGameState = {
            players: [
                { id: 1, roleId: 'doctor', alive: true },
                { id: 2, roleId: 'lupo', alive: true },
                { id: 3, roleId: 'villico', alive: true }
            ],
            night: {
                context: {
                    saves: [],
                    savesBy: []
                }
            }
        };
    });

    describe('Role Properties', () => {
        it('should have correct basic properties', () => {
            expect(doctor.id).toBe('guardia');
            expect(doctor.name).toBe('Guardia');
            expect(doctor.team).toBe('villaggio');
            expect(doctor.visibleAsTeam).toBe('villaggio');
            expect(doctor.countAs).toBe('villaggio');
            expect(doctor.color).toBe('#3b82f6');
            expect(doctor.phaseOrder).toBe('any');
            
            		expect(doctor.actsAtNight).toBe('alive');
        });

        it('should have correct usage and count constraints', () => {
            expect(doctor.effectType).toBe('optional');
            expect(doctor.numberOfUsage).toBe('unlimited');
            expect(doctor.minCount).toBeUndefined();
            expect(doctor.maxCount).toBeUndefined();
        });

        it('should have correct affected roles', () => {
            expect(doctor.affectedRoles).toEqual(['lupo']);
        });
    });

    describe('Resolve Function', () => {
        it('should add save to saves list when target is valid', () => {
            const entry = {
                result: { targetId: 3 },
                playerId: 1
            };

            doctor.resolve(mockGameState, entry);

            expect(mockGameState.night.context.saves).toHaveLength(1);
            expect(mockGameState.night.context.saves[0]).toEqual({
                targetId: 3,
                fromRoles: ['lupo'],
                byRole: 'guardia'
            });
        });

        it('should add save to savesBy list for tracking', () => {
            const entry = {
                result: { targetId: 3 },
                playerId: 1
            };

            doctor.resolve(mockGameState, entry);

            expect(mockGameState.night.context.savesBy).toHaveLength(1);
            expect(mockGameState.night.context.savesBy[0]).toEqual({
                by: 1,
                target: 3,
                fromRoles: ['lupo']
            });
        });

        it('should not add save when targetId is invalid', () => {
            const entry = {
                result: { targetId: 'invalid' },
                playerId: 1
            };

            doctor.resolve(mockGameState, entry);

            expect(mockGameState.night.context.saves).toHaveLength(0);
            expect(mockGameState.night.context.savesBy).toHaveLength(0);
        });

        it('should initialize saves array if it does not exist', () => {
            delete mockGameState.night.context.saves;
            delete mockGameState.night.context.savesBy;

            const entry = {
                result: { targetId: 3 },
                playerId: 1
            };

            doctor.resolve(mockGameState, entry);

            expect(Array.isArray(mockGameState.night.context.saves)).toBe(true);
            expect(Array.isArray(mockGameState.night.context.savesBy)).toBe(true);
        });

        it('should handle multiple saves correctly', () => {
            const entry1 = { result: { targetId: 2 }, playerId: 1 };
            const entry2 = { result: { targetId: 3 }, playerId: 1 };

            doctor.resolve(mockGameState, entry1);
            doctor.resolve(mockGameState, entry2);

            expect(mockGameState.night.context.saves).toHaveLength(2);
            expect(mockGameState.night.context.savesBy).toHaveLength(2);
        });

        it('should use correct fromRoles based on affectedRoles', () => {
            const entry = {
                result: { targetId: 3 },
                playerId: 1
            };

            doctor.resolve(mockGameState, entry);

            expect(mockGameState.night.context.saves[0].fromRoles).toEqual(['lupo']);
        });
    });

    describe('Win Condition', () => {
        it('should use village win condition', () => {
            expect(typeof doctor.checkWin).toBe('function');
        });
    });
});

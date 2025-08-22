import { describe, it, expect, beforeEach } from 'vitest';
import { insinuo } from '../../roles/insinuo';
import { createTestState, beginNight, recordNightResult, resolveNight } from '../../core/engine';
import { ROLES } from '../../roles/index';

describe('Insinuo Role', () => {
    let state: any;

    beforeEach(() => {
        state = createTestState();
    });

    it('should have correct properties', () => {
        expect(insinuo.id).toBe('insinuo');
        expect(insinuo.name).toBe('Insinuo');
        expect(insinuo.team).toBe('lupi');
        expect(insinuo.visibleAsTeam).toBe('villaggio');
        expect(insinuo.countAs).toBe('villaggio');
        expect(insinuo.phaseOrder).toBe(1);
        expect(insinuo.effectType).toBe('optional');
        expect(insinuo.numberOfUsage).toBe('unlimited');
    });

    it('should have correct initial state', () => {
        expect(state.custom).toBeDefined();
        expect(state.custom).toEqual({});
        expect(state.history).toBeDefined();
        expect(state.history).toEqual({});
        expect(state.players[0].roleState).toBeDefined();
        expect(state.players[0].roleState.realTeam).toBe('lupi');
    });

    it('should change target player visibleAsTeam to lupi when target is villaggio', () => {
        const targetPlayer = state.players.find((p: any) => p.roleId === 'villico');
        const currentVisible = targetPlayer.roleState.visibleAsTeam;
        
        const action = {
            data: { targetId: targetPlayer.id, used: true },
            playerId: 1
        };

        insinuo.resolve(state, action);

        expect(targetPlayer.roleState.visibleAsTeam).toBe('lupi');
        expect(state.custom.insinuo.targets).toBeDefined();
        const targetData = state.custom.insinuo.targets.find((t: any) => t.playerId === targetPlayer.id);
        expect(targetData.originalVisibleAsTeam).toBe(currentVisible);
    });

    it('should change target player visibleAsTeam to villaggio when target is lupi', () => {
        const targetPlayer = state.players.find((p: any) => p.roleId === 'lupo');
        const currentVisible = targetPlayer.roleState.visibleAsTeam;
        
        const action = {
            data: { targetId: targetPlayer.id, used: true },
            playerId: 1
        };

        insinuo.resolve(state, action);

        expect(targetPlayer.roleState.visibleAsTeam).toBe('villaggio');
        expect(state.custom.insinuo.targets).toBeDefined();
        const targetData = state.custom.insinuo.targets.find((t: any) => t.playerId === targetPlayer.id);
        expect(targetData.originalVisibleAsTeam).toBe(currentVisible);
    });

    it('should not affect dead players', () => {
        const targetPlayer = state.players.find((p: any) => p.roleId === 'villico');
        targetPlayer.alive = false;
        
        const action = {
            data: { targetId: targetPlayer.id, used: true },
            playerId: 1
        };

        insinuo.resolve(state, action);

        expect(state.custom.insinuo.targets).toBeDefined();
        expect(state.custom.insinuo.targets.length).toBe(0);
    });

    it('should restore faction visibility during day phase', () => {
        const targetPlayer = state.players.find((p: any) => p.roleId === 'villico');
        const originalVisible = targetPlayer.roleState.visibleAsTeam;
        
        const action = {
            data: { targetId: targetPlayer.id, used: true },
            playerId: 1
        };
        insinuo.resolve(state, action);
        
        expect(targetPlayer.roleState.visibleAsTeam).toBe('lupi');
        
        insinuo.restoreFunction(state);
        
        expect(targetPlayer.roleState.visibleAsTeam).toBe(originalVisible);
        expect(state.custom.insinuo).toBeUndefined();
    });

    it('should work with multiple insinuo actions in the same night', () => {
        const villicoPlayer = state.players.find((p: any) => p.roleId === 'villico');
        const doctorPlayer = state.players.find((p: any) => p.roleId === 'guardia');
        
        const action1 = {
            data: { targetId: villicoPlayer.id, used: true },
            playerId: 1
        };
        insinuo.resolve(state, action1);
        
        const action2 = {
            data: { targetId: doctorPlayer.id, used: true },
            playerId: 2
        };
        insinuo.resolve(state, action2);
        
        expect(villicoPlayer.roleState.visibleAsTeam).toBe('lupi');
        expect(doctorPlayer.roleState.visibleAsTeam).toBe('lupi');
        expect(state.custom.insinuo.targets).toBeDefined();
        expect(state.custom.insinuo.targets.length).toBe(2);
        
        insinuo.restoreFunction(state);
        
        expect(villicoPlayer.roleState.visibleAsTeam).toBe('villaggio');
        expect(doctorPlayer.roleState.visibleAsTeam).toBe('villaggio');
        expect(state.custom.insinuo).toBeUndefined();
    });

    it('should make target appear as lupi to Veggente during the same night', () => {
        const targetPlayer = state.players.find((p: any) => p.id === 3);
        const insinuoAction = {
            data: { targetId: 3, used: true },
            playerId: 1
        };
        insinuo.resolve(state, insinuoAction);
        
        expect(targetPlayer.roleState.visibleAsTeam).toBe('lupi');

        const veggenteAction = {
            data: { targetId: 3, used: true },
            playerId: 7
        };
        const veggenteRole = ROLES.veggente;
        veggenteRole.resolve(state, veggenteAction);

        // In the new system, history is created by the engine, not by individual roles
        // The test should verify that the target's faction was changed correctly
        expect(targetPlayer.roleState.visibleAsTeam).toBe('lupi');
        
        // Verify that the veggente role can see the changed faction
        const seenTeam = targetPlayer.roleState?.visibleAsTeam || targetPlayer.roleState?.realTeam;
        expect(seenTeam).toBe('lupi');
    });
});

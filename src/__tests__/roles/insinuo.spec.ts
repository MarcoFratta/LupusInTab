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
        const targetPlayer = state.players.find((p: any) => p.roleId === 'villager');
        const currentVisible = targetPlayer.roleState.visibleAsTeam;
        
        const action = {
            data: { targetId: targetPlayer.id, used: true },
            playerId: 1
        };

        insinuo.resolve(state, action);

        expect(targetPlayer.roleState.visibleAsTeam).toBe('lupi');
        expect(state.custom[targetPlayer.id].insinuo.originalVisibleAsTeam).toBe(currentVisible);
    });

    it('should change target player visibleAsTeam to villaggio when target is lupi', () => {
        const targetPlayer = state.players.find((p: any) => p.roleId === 'wolf');
        const currentVisible = targetPlayer.roleState.visibleAsTeam;
        
        const action = {
            data: { targetId: targetPlayer.id, used: true },
            playerId: 1
        };

        insinuo.resolve(state, action);

        expect(targetPlayer.roleState.visibleAsTeam).toBe('villaggio');
        expect(state.custom[targetPlayer.id].insinuo.originalVisibleAsTeam).toBe(currentVisible);
    });

    it('should not affect dead players', () => {
        const targetPlayer = state.players.find((p: any) => p.roleId === 'villager');
        targetPlayer.alive = false;
        
        const action = {
            data: { targetId: targetPlayer.id, used: true },
            playerId: 1
        };

        insinuo.resolve(state, action);

        expect(state.custom).toEqual({});
    });

    it('should restore faction visibility during day phase', () => {
        const targetPlayer = state.players.find((p: any) => p.roleId === 'villager');
        const originalVisible = targetPlayer.roleState.visibleAsTeam;
        
        // Apply Insinuo effect
        const action = {
            data: { targetId: targetPlayer.id, used: true },
            playerId: 1
        };
        insinuo.resolve(state, action);
        
        expect(targetPlayer.roleState.visibleAsTeam).toBe('lupi');
        
        // Restore
        insinuo.restoreFunction(state);
        
        expect(targetPlayer.roleState.visibleAsTeam).toBe(originalVisible);
        expect(state.custom).toEqual({});
    });

    it('should work with multiple insinuo actions in the same night', () => {
        const villagerPlayer = state.players.find((p: any) => p.roleId === 'villager');
        const doctorPlayer = state.players.find((p: any) => p.roleId === 'guardia');
        
        // First Insinuo targets villager
        const action1 = {
            data: { targetId: villagerPlayer.id, used: true },
            playerId: 1
        };
        insinuo.resolve(state, action1);
        
        // Second Insinuo targets doctor
        const action2 = {
            data: { targetId: doctorPlayer.id, used: true },
            playerId: 2
        };
        insinuo.resolve(state, action2);
        
        expect(villagerPlayer.roleState.visibleAsTeam).toBe('lupi');
        expect(doctorPlayer.roleState.visibleAsTeam).toBe('lupi');
        expect(state.custom[villagerPlayer.id].insinuo).toBeDefined();
        expect(state.custom[doctorPlayer.id].insinuo).toBeDefined();
        
        // Restore both
        insinuo.restoreFunction(state);
        
        expect(villagerPlayer.roleState.visibleAsTeam).toBe('villaggio');
        expect(doctorPlayer.roleState.visibleAsTeam).toBe('villaggio');
        expect(state.custom).toEqual({});
    });

    it('should make target appear as lupi to Veggente during the same night', () => {
        beginNight(state, ROLES);

        // First, Insinuo targets a villager
        const insinuoTurnIndex = state.night.turns.findIndex((t: any) => t.roleId === 'insinuo');
        state.night.currentIndex = insinuoTurnIndex;
        
        // The engine should have the correct playerId from the turn
        const insinuoTurn = state.night.turns[insinuoTurnIndex];
        recordNightResult(state, { targetId: 3, used: true });

        // Then, Veggente investigates the same target
        const veggenteTurnIndex = state.night.turns.findIndex((t: any) => t.roleId === 'medium');
        state.night.currentIndex = veggenteTurnIndex;
        recordNightResult(state, { targetId: 3, used: true });

        // Resolve the night
        resolveNight(state, ROLES);

        // Check that Insinuo effect was applied
        const targetPlayer = state.players.find((p: any) => p.id === 3);
        expect(targetPlayer.roleState.visibleAsTeam).toBe('lupi');

        // Check that the history was created
        expect(state.history).toBeDefined();

        // Check that both events are recorded
        const allEvents = [];
        if (state.history && state.history[state.nightNumber]) {
            allEvents.push(...Object.values(state.history[state.nightNumber]));
        }

        expect(allEvents.length).toBeGreaterThanOrEqual(2);

        // Check that Insinuo recorded the effect
        const insinuoEvent = allEvents.find((e: any) => e.type === 'insinuo_effect');
        expect(insinuoEvent).toBeDefined();
        expect(insinuoEvent.data.newFaction).toBe('lupi');

        // Check that Veggente saw the modified faction
        const veggenteEvent = allEvents.find((e: any) => e.type === 'veggente_investigation');
        expect(veggenteEvent).toBeDefined();
        expect(veggenteEvent.data.discoveredFaction).toBe('lupi');
    });
});

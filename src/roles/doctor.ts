import type { RoleDef } from '../types';
import { useWinConditions } from '../utils/winConditions';

const doctor: RoleDef = {
	id: 'doctor',
    name: 'Guardia',
	team: 'village',
    visibleAsTeam: 'village',
    description: 'Ogni notte scegli un giocatore da proteggere dai killer designati (es. lupi).',
    color: '#3b82f6',
	phaseOrder: 3,
	group: false,
	actsAtNight: true,
    usage: 'unlimited',
    affectsKillers: ['wolf'],
	getPromptComponent() {
		return () => import('../components/roles/Doctor/DoctorPrompt.vue');
	},
	getResolveDetailsComponent() {
		return () => import('../components/roles/Doctor/DoctorResolveDetails.vue');
	},
	resolve(gameState: any, entry: any) {
		const id = Number(entry?.result?.targetId);
        if (!Number.isFinite(id)) return;
        const affectedBy: string[] = (doctor.affectsKillers || []).slice();
        const pk: Record<number, string[]> = gameState.night.context.pendingKills || {};
        const killers: string[] = pk[id] || [];
        // Apply save only if at least one pending killer is affected by this doctor
        if (killers.some((k: string) => affectedBy.includes(k))) {
            gameState.night.context.saves.push(id);
            if (!Array.isArray(gameState.night.context.savesBy)) gameState.night.context.savesBy = [];
            gameState.night.context.savesBy.push({ by: entry.playerId ?? 0, target: id });
        }
	},
    checkWin(gameState: any) {
        const { villageWin } = useWinConditions();
        return villageWin(gameState);
    },
};

export default doctor;



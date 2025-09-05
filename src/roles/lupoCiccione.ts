import type { RoleDef } from '../types';
import { componentFactory } from '../utils/roleUtils';
import { RoleAPI } from '../utils/roleAPI';

export const lupoCiccione: RoleDef = {
	id: 'lupoCiccione',
	name: 'Lupo Ciccione',
	team: 'lupi',
	visibleAsTeam: 'lupi',
	score: 15,
	countAs: 'lupi',
	color: '#dc2626',
	description: 'È un lupo che confonde le investigazioni',
    longDescription: `Il Lupo Ciccione è un lupo che disturba le investigazioni.

COME FUNZIONA:
• È un lupo a tutti gli effetti
• I primi giocatori vivi alla sua destra e sinistra appaiono come lupi alle investigazioni
• Non può agire di notte (agisce con gli altri lupi)
• L'effetto è passivo e permanente`,
	phaseOrder: 4,
	actsAtNight: "never",
	effectType: 'optional',
	numberOfUsage: 'unlimited',
    resolve() {},
    
	groups: (gameState: any) => {
		return [{ fromRole: 'lupo', toRole: 'lupoCiccione' }];
	},
	
	passiveEffect: (gameState: any, player: any) => {
		if (!player.alive) return;

		const allPlayers = gameState.players.filter((p: any) => p.alive).sort((a: any, b: any) => a.id - b.id);
		const playerIndex = allPlayers.findIndex((p: any) => p.id === player.id);
		if (playerIndex === -1) return;

		const numPlayers = allPlayers.length;
		let leftPlayer = null;
		let rightPlayer = null;

		// Find the first alive player to the left (circular)
		let leftIndex = (playerIndex - 1 + numPlayers) % numPlayers;
		while (leftIndex !== playerIndex) {
			if (allPlayers[leftIndex].alive) {
				leftPlayer = allPlayers[leftIndex];
				break;
			}
			leftIndex = (leftIndex - 1 + numPlayers) % numPlayers;
		}

		// Find the first alive player to the right (circular)
		let rightIndex = (playerIndex + 1) % numPlayers;
		while (rightIndex !== playerIndex) {
			if (allPlayers[rightIndex].alive) {
				rightPlayer = allPlayers[rightIndex];
				break;
			}
			rightIndex = (rightIndex + 1) % numPlayers;
		}

		const affectedPlayers = [];

		if (leftPlayer) {
			affectedPlayers.push({
				playerId: leftPlayer.id,
				originalVisibleAsTeam: leftPlayer.roleState.visibleAsTeam,
				position: 'left'
			});
			RoleAPI.setPlayerVisibleTeam(leftPlayer.id, 'lupi');
		}

		if (rightPlayer) {
			affectedPlayers.push({
				playerId: rightPlayer.id,
				originalVisibleAsTeam: rightPlayer.roleState.visibleAsTeam,
				position: 'right'
			});
			RoleAPI.setPlayerVisibleTeam(rightPlayer.id, 'lupi');
		}

		const customData = RoleAPI.getCustomData('lupoCiccione');
		customData.affectedPlayers = affectedPlayers;
		RoleAPI.setCustomData('lupoCiccione', customData);
	},
	
	restoreFunction: (gameState: any) => {
		const customData = RoleAPI.getCustomData('lupoCiccione');
		if (!customData.affectedPlayers) return;

		const affectedPlayers = customData.affectedPlayers;

		for (const affectedPlayer of affectedPlayers) {
			const player = RoleAPI.getPlayer(affectedPlayer.playerId);
			if (player && affectedPlayer.originalVisibleAsTeam !== undefined) {
				RoleAPI.setPlayerVisibleTeam(affectedPlayer.playerId, affectedPlayer.originalVisibleAsTeam);
			}
		}

		RoleAPI.clearCustomData('lupoCiccione');
	}
};

import type { RoleDef } from '../types';
import { getRoleCustomData, setRoleCustomData, clearRoleCustomData } from '../utils/roleUtils';

export const lupoCiccione: RoleDef = {
	id: 'lupoCiccione',
	name: 'Lupo Ciccione',
	team: 'lupi',
	visibleAsTeam: 'lupi',
	score: 3,
	countAs: 'lupi',
	color: '#dc2626',
	description: "É un lupo a tutti gli effetti, ma sua mole disturba la vista del veggente o ruoli simili. " +
        "I primi giocatori alla sua destra e alla sua sinistra verranno visti come lupi agli occhi del veggente o ruoli simili." +
        " Fate attenzione ad assegnare correttamente i nomi rispetto all'ordine di gioco.",
	phaseOrder: 0,
	actsAtNight: "never",
	effectType: 'optional',
	numberOfUsage: 'unlimited',
    resolve() {},
	groups: (gameState: any) => {
		return [{ fromRole: 'lupo', toRole: 'lupoCiccione' }];
	},
	passiveEffect: (gameState: any, player: any) => {
		if (!player.alive) return;

		const players = gameState.players;
		const playerIndex = players.findIndex((p: any) => p.id === player.id);
		if (playerIndex === -1) return;

		const numPlayers = players.length;
		let leftPlayer = null;
		let rightPlayer = null;

		let leftIndex = (playerIndex - 1 + numPlayers) % numPlayers;
		while (leftIndex !== playerIndex) {
			if (players[leftIndex].alive) {
				leftPlayer = players[leftIndex];
				break;
			}
			leftIndex = (leftIndex - 1 + numPlayers) % numPlayers;
		}

		let rightIndex = (playerIndex + 1) % numPlayers;
		while (rightIndex !== playerIndex) {
			if (players[rightIndex].alive) {
				rightPlayer = players[rightIndex];
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
			leftPlayer.roleState.visibleAsTeam = 'lupi';
		}

		if (rightPlayer) {
			affectedPlayers.push({
				playerId: rightPlayer.id,
				originalVisibleAsTeam: rightPlayer.roleState.visibleAsTeam,
				position: 'right'
			});
			rightPlayer.roleState.visibleAsTeam = 'lupi';
		}

		if (!gameState.custom) gameState.custom = {};
		if (!gameState.custom.lupoCiccione) gameState.custom.lupoCiccione = {};
		gameState.custom.lupoCiccione.affectedPlayers = affectedPlayers;
	},
	restoreFunction: (gameState: any) => {
		if (!gameState.custom?.lupoCiccione?.affectedPlayers) return;

		const affectedPlayers = gameState.custom.lupoCiccione.affectedPlayers;

		for (const affectedPlayer of affectedPlayers) {
			const player = gameState.players.find((p: any) => p.id === affectedPlayer.playerId);
			if (player && affectedPlayer.originalVisibleAsTeam !== undefined) {
				player.roleState.visibleAsTeam = affectedPlayer.originalVisibleAsTeam;
			}
		}

		delete gameState.custom.lupoCiccione;
	}
};

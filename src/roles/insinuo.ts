import { getPlayerCustomDataIfAlive, cleanupPlayerCustomData, addToHistory } from '../utils/roleUtils';

export const insinuo = {
	id: 'insinuo',
	name: 'Insinuo',
	team: 'lupi',
	visibleAsTeam: 'villaggio',
	countAs: 'villaggio',
	color: '#a855f7',
	description: 'Durante la notte, può cambiare temporaneamente la fazione visibile di un giocatore.',
	phaseOrder: 1,
	actsAtNight: "alive",
	effectType: 'optional',
	numberOfUsage: 'unlimited',
	getPromptComponent: (gameState: any, player: any) => () => import('../components/roles/Insinuo/InsinuoPrompt.vue'),
	getResolveDetailsComponent: (gameState: any, entry: any) => () => import('../components/resolve-details/InsinuoResolveDetails.vue'),
	resolve: (gameState: any, action: any) => {
		const targetId = action.data?.targetId;
		if (!targetId) return;

		const target = gameState.players.find((p: any) => p.id === targetId);
		if (!target || !target.alive) return;

		const insinuoData = getPlayerCustomDataIfAlive(gameState, targetId, 'insinuo');
		if (!insinuoData) return; // Player is dead, don't proceed

		// Store the original visible team
		insinuoData.originalVisibleAsTeam = target.roleState.visibleAsTeam;
		insinuoData.originalTeam = target.roleState.realTeam;

		// Determine what the target should appear as
		const currentVisible = target.roleState.visibleAsTeam || target.roleState.realTeam;
		let nextVisible: string;

		if (currentVisible === 'lupi') {
			nextVisible = 'villaggio';
		} else {
			nextVisible = 'lupi';
		}

		// Apply the change to the target player's role state
		target.roleState.visibleAsTeam = nextVisible;

		// Store in history for the acting player
		addToHistory(gameState, action.playerId || 0, gameState.nightNumber, 'insinuo_effect', {
			target: targetId,
			previousFaction: currentVisible,
			newFaction: nextVisible
		});
	},
	restoreFunction: (gameState: any) => {
		// Restore all affected players' visibleAsTeam to their original values
		if (!gameState.custom) return;

		for (const playerId in gameState.custom) {
			const playerCustom = gameState.custom[playerId];
			if (playerCustom.insinuo) {
				const player = gameState.players.find((p: any) => p.id === Number(playerId));
				if (player && playerCustom.insinuo.originalVisibleAsTeam !== undefined) {
					player.roleState.visibleAsTeam = playerCustom.insinuo.originalVisibleAsTeam;
				}
				// Clean up the custom data
				cleanupPlayerCustomData(gameState, Number(playerId), 'insinuo');
			}
		}
	}
};

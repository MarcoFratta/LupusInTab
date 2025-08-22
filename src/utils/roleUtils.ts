import { GameState } from '../types';

export function getRoleById(roleId: string, roles: any[]): any {
    return roles.find(role => role.id === roleId);
}

export function getRoleByName(roleName: string, roles: any[]): any {
    return roles.find(role => role.name === roleName);
}

export function getRolesByTeam(team: string, roles: any[]): any[] {
    return roles.filter(role => role.team === team);
}

export function getRolesByActAtNight(actsAtNight: string, roles: any[]): any[] {
    return roles.filter(role => role.actsAtNight === actsAtNight);
}

export function getRolesByCountAs(countAs: string, roles: any[]): any[] {
    return roles.filter(role => role.countAs === countAs);
}

export function getRolesByWinCondition(winCondition: string, roles: any[]): any[] {
    return roles.filter(role => role.winCondition === winCondition);
}

export function getRolesByCustomData(gameState: any, roleId: string): any[] {
    if (!gameState.custom || !gameState.custom[roleId]) return [];
    return Object.keys(gameState.custom[roleId]).map(key => ({
        key,
        value: gameState.custom[roleId][key]
    }));
}

export function canPlayerActAtNight(player: any, gameState?: any): boolean {
    const actsAtNight = player.roleState?.actsAtNight;
    
    if (actsAtNight === "never") return false;
    if (actsAtNight === "blocked") return false;
    if (actsAtNight === "alive" && !player.alive) return false;
    if (actsAtNight === "dead" && player.alive) return false;
    
    if (gameState && player.roleState?.startNight) {
        if (gameState.nightNumber < player.roleState.startNight) return false;
    }
    
    if (actsAtNight === "always") return true;
    if (actsAtNight === "alive" && player.alive) return true;
    if (actsAtNight === "dead" && !player.alive) return true;
    
    return false;
}

export function hasPlayerExceededUsageLimit(player: any, gameState: any): boolean {
    const numberOfUsage = player.roleState?.numberOfUsage;
    
    if (numberOfUsage === 'unlimited') return false;
    if (numberOfUsage === undefined) return false;
    
    const usedPowers = gameState.usedPowers?.[player.roleId] || [];
    const timesUsed = usedPowers.filter((playerId: number) => playerId === player.id).length;
    
    return timesUsed >= numberOfUsage;
}

export function getPlayerVisibleTeam(gameState: any, playerId: number): string | undefined {
    const player = gameState.players.find((p: any) => p.id === playerId);
    if (player && player.roleState) {
        return player.roleState.visibleAsTeam || player.roleState.realTeam;
    }
    return undefined;
}

export function getPlayerRealTimeVisibleTeam(gameState: any, playerId: number): string | undefined {
    const player = gameState.players.find((p: any) => p.id === playerId);
    if (!player || !player.roleState) return undefined;
    
    return player.roleState.visibleAsTeam || player.roleState.realTeam;
}

export function getPlayerCustomData(gameState: any, playerId: number, roleId: string): any {
    if (!gameState.custom) gameState.custom = {};
    if (!gameState.custom[playerId]) gameState.custom[playerId] = {};
    if (!gameState.custom[playerId][roleId]) gameState.custom[playerId][roleId] = {};
    return gameState.custom[playerId][roleId];
}

export function getPlayerCustomDataIfAlive(gameState: any, playerId: number, roleId: string): any | null {
    const player = gameState.players.find((p: any) => p.id === playerId);
    if (!player || !player.alive) return null;
    
    if (!gameState.custom) gameState.custom = {};
    if (!gameState.custom[playerId]) gameState.custom[playerId] = {};
    if (!gameState.custom[playerId][roleId]) gameState.custom[playerId][roleId] = {};
    return gameState.custom[playerId][roleId];
}

export function cleanupPlayerCustomData(gameState: any, playerId: number, roleId: string): void {
    if (gameState.custom?.[playerId]?.[roleId]) {
        delete gameState.custom[playerId][roleId];
        if (Object.keys(gameState.custom[playerId]).length === 0) {
            delete gameState.custom[playerId];
        }
        if (Object.keys(gameState.custom).length === 0) {
            gameState.custom = {};
        }
    }
}

export function addToHistory(gameState: any, playerId: number, nightNumber: number, eventType: string, eventData: any): void {
    if (!gameState.history) gameState.history = {};
    if (!gameState.history[nightNumber]) gameState.history[nightNumber] = {};
    
    gameState.history[nightNumber][playerId] = {
        type: eventType,
        nightNumber,
        playerId,
        data: eventData
    };
}

export function addGroupHistory(gameState: any, roleId: string, nightNumber: number, eventType: string, eventData: any): void {
    if (!gameState.history) gameState.history = {};
    if (!gameState.history[nightNumber]) gameState.history[nightNumber] = {};
    
    const rolePlayers = gameState.players.filter(p => p.roleId === roleId);
    
    for (const player of rolePlayers) {
        gameState.history[nightNumber][player.id] = {
            type: eventType,
            nightNumber,
            playerId: player.id,
            roleId: roleId,
            data: eventData,
            groupAction: true,
            playerIds: rolePlayers.map(p => p.id)
        };
    }
}

export function getPlayerNightEvents(gameState: any, playerId: number, nightNumber: number): any[] {
    if (!gameState.history || !gameState.history[nightNumber]) return [];
    const playerAction = gameState.history[nightNumber][playerId];
    return playerAction ? [playerAction] : [];
}

export function getNightEvents(gameState: any, nightNumber: number): any[] {
    if (!gameState.history || !gameState.history[nightNumber]) return [];
    return Object.values(gameState.history[nightNumber]);
}

export function getNightPlayerActions(gameState: any, nightNumber: number): Record<number, any> {
    return gameState.history?.[nightNumber] || {};
}

export function getRoleCustomData(gameState: any, roleId: string): any {
    if (!gameState.custom) gameState.custom = {};
    if (!gameState.custom[roleId]) gameState.custom[roleId] = {};
    return gameState.custom[roleId];
}

export function setRoleCustomData(gameState: any, roleId: string, key: string, value: any): void {
    if (!gameState.custom) gameState.custom = {};
    if (!gameState.custom[roleId]) gameState.custom[roleId] = {};
    gameState.custom[roleId][key] = value;
}

export function clearRoleCustomData(gameState: any, roleId: string, key?: string): void {
    if (!gameState.custom || !gameState.custom[roleId]) return;
    
    if (key) {
        delete gameState.custom[roleId][key];
        if (Object.keys(gameState.custom[roleId]).length === 0) {
            delete gameState.custom[roleId];
        }
    } else {
        delete gameState.custom[roleId];
    }
}
function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
export function componentFactory(name: string, type: "prompt" | "details"): () => Promise<any> {
    const componentMap: Record<string, Record<string, () => Promise<any>>> = {
        'Angelo': {
            prompt: () => import('../components/roles/Angelo/AngeloPrompt.vue'),
            details: () => import('../components/roles/Angelo/AngeloResolveDetails.vue')
        },
        'Barabba': {
            prompt: () => import('../components/roles/Barabba/BarabbaPrompt.vue'),
            details: () => import('../components/roles/Barabba/BarabbaResolveDetails.vue')
        },
        'Boia': {
            prompt: () => import('../components/roles/Boia/BoiaPrompt.vue'),
            details: () => import('../components/roles/Boia/BoiaResolveDetails.vue')
        },
        'Genio': {
            prompt: () => import('../components/roles/Genio/GenioPrompt.vue'),
            details: () => import('../components/roles/Genio/GenioResolveDetails.vue')
        },
        'Giustiziere': {
            prompt: () => import('../components/roles/Giustiziere/GiustizierePrompt.vue'),
            details: () => import('../components/roles/Giustiziere/GiustiziereResolveDetails.vue')
        },
        'Guardia': {
            prompt: () => import('../components/roles/Guardia/GuardiaPrompt.vue'),
            details: () => import('../components/roles/Guardia/GuardiaResolveDetails.vue')
        },
        'Illusionista': {
            prompt: () => import('../components/roles/Illusionista/IllusionistaPrompt.vue'),
            details: () => import('../components/roles/Illusionista/IllusionistaResolveDetails.vue')
        },
        'Indemoniato': {
            prompt: () => import('../components/roles/Indemoniato/IndemoniatoPrompt.vue'),
            details: () => import('../components/roles/Indemoniato/IndemoniatoResolveDetails.vue')
        },
        'Insinuo': {
            prompt: () => import('../components/roles/Insinuo/InsinuoPrompt.vue'),
            details: () => import('../components/roles/Insinuo/InsinuoResolveDetails.vue')
        },
        'Lupo': {
            prompt: () => import('../components/roles/Lupo/LupoPrompt.vue'),
            details: () => import('../components/roles/Lupo/LupoResolveDetails.vue')
        },
        'Lupomannaro': {
            prompt: () => import('../components/roles/Lupomannaro/LupomannaroPrompt.vue'),
            details: () => import('../components/roles/Lupomannaro/LupomannaroResolveDetails.vue')
        },
        'Massone': {
            prompt: () => import('../components/roles/Massone/MassonePrompt.vue'),
            details: () => import('../components/roles/Massone/MassoneResolveDetails.vue')
        },
        'Matto': {
            prompt: () => import('../components/roles/Matto/MattoPrompt.vue'),
            details: () => import('../components/roles/Matto/MattoResolveDetails.vue')
        },
        'Strega': {
            prompt: () => import('../components/roles/Strega/StregaPrompt.vue'),
            details: () => import('../components/roles/Strega/StregaResolveDetails.vue')
        },
        'Veggente': {
            prompt: () => import('../components/roles/Veggente/VeggentePrompt.vue'),
            details: () => import('../components/roles/Veggente/VeggenteResolveDetails.vue')
        },
        'Villico': {
            prompt: () => import('../components/roles/Villico/VillicoPrompt.vue'),
            details: () => import('../components/roles/Villico/VillicoResolveDetails.vue')
        }
    };
    
    const roleComponents = componentMap[name];
    if (!roleComponents) {
        console.error(`No components found for role: ${name}`);
        return () => Promise.resolve(null);
    }
    
    const component = roleComponents[type];
    if (!component) {
        console.error(`No ${type} component found for role: ${name}`);
        return () => Promise.resolve(null);
    }
    
    return component;
}

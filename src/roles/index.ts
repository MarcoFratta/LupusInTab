import type { RoleDef } from '../types';
import wolf from './lupo';
import villager from './villico';
import lover from './massone';
import medium from './veggente';
import justicer from './giustiziere';
import barabba from './barabba';
import angelo from './angelo';
import crazyman from './matto';
import guardia from './guardia';
import hangman from './boia';
import witch from './medium';
import dog from './lupomannaro';
import demoniac from './indemoniato';
import { insinuo } from './insinuo';
import illusionista from './illusionista';

const rolesArray: RoleDef[] = [
	wolf,
	villager,
	lover,
	medium,
	justicer,
	barabba,
	angelo,
	crazyman,
	guardia,
	hangman,
	witch,
	dog,
	demoniac,
	insinuo as any,
	illusionista,
];

export const ROLES: Record<string, RoleDef> = rolesArray.reduce((acc, role) => {
	if (role && role.id) acc[role.id] = role;
	return acc;
}, {} as Record<string, RoleDef>);

export const ROLE_LIST = Object.values(ROLES);



import type { RoleDef } from '../types';
import lupo from './lupo';
import villico from './villico';
import massone from './massone';
import veggente from './veggente';
import giustiziere from './giustiziere';
import barabba from './barabba';
import angelo from './angelo';
import matto from './matto';
import guardia from './guardia';
import boia from './boia';
import medium from './medium';
import lupomannaro from './lupomannaro';
import muccamannara from './muccamannara';
import indemoniato from './indemoniato';
import { insinuo } from './insinuo';
import illusionista from './illusionista';
import { genio } from './genio';
import { parassita } from './parassita';
import { simbionte } from './simbionte';
import mutaforma from './mutaforma';
import misspurple from './misspurple';
import bugiardo from './bugiardo';
import ammaestratore from './ammaestratore';

const rolesArray: RoleDef[] = [
	lupo,
	villico,
	massone,
	veggente,
	giustiziere,
	barabba,
	angelo,
	matto,
	guardia,
	boia,
	medium,
	lupomannaro,
	muccamannara,
	indemoniato,
	insinuo as any,
	illusionista,
	genio,
	parassita,
	simbionte,
	mutaforma,
	misspurple,
	bugiardo,
	ammaestratore,
];

export const ROLES: Record<string, RoleDef> = rolesArray.reduce((acc, role) => {
	if (role && role.id) acc[role.id] = role;
	return acc;
}, {} as Record<string, RoleDef>);

export const ROLE_LIST = Object.values(ROLES);



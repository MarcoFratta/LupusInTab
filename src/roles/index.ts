import type { RoleDef } from '../types';
import wolf from './lupo';
import doctor from './guardia';
import medium from './veggente';
import villager from './villico';
import lover from './massone';
import crazyman from './matto';
import justicer from './giustiziere';
import hangman from './boia';
import witch from './strega';
import dog from './lupomannaro';
import demoniac from './indemoniato';

export const ROLES: Record<string, RoleDef> = {
	wolf,
	doctor,
	medium,
	villager,
    lover,
    crazyman,
    justicer,
    hangman,
    witch,
    dog,
    demoniac,
};

export const ROLE_LIST: RoleDef[] = [wolf, hangman, dog, justicer, doctor, witch, medium, demoniac, villager, lover, crazyman];



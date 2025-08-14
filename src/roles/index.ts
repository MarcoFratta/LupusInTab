import type { RoleDef } from '../types';
import wolf from './wolf';
import doctor from './doctor';
import medium from './medium';
import villager from './villager';
import lover from './lover';
import crazyman from './crazyman';
import justicer from './justicer';
import hangman from './hangman';
import witch from './witch';
import dog from './dog';
import demoniac from './demoniac';

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



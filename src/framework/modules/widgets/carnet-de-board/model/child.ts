import type { ICarnetDeBord } from './carnet-de-bord';

export type CarnetDeBordChild = Pick<ICarnetDeBord, 'address' | 'id' | 'idPronote'>;

export const hasPronoteData = <T extends CarnetDeBordChild>(child?: T): child is T => !!(child?.idPronote && child.address);

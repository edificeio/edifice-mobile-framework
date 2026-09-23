import type { ICarnetDeBord } from './carnet-de-bord';

export type CarnetDeBordChild = Pick<ICarnetDeBord, 'address' | 'id' | 'idPronote'>;

export const getChildId = (child: Pick<CarnetDeBordChild, 'id' | 'idPronote'>) => child.idPronote ?? child.id;

export const findChild = <T extends Pick<CarnetDeBordChild, 'id' | 'idPronote'>>(children: T[], id?: string) =>
  children.find(child => getChildId(child) === id);

export const hasPronoteData = <T extends CarnetDeBordChild>(child?: T): child is T => !!(child?.idPronote && child.address);

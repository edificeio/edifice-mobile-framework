/**
 * What tells one child from another, and whether Pronote has anything to show for them. The home
 * widget and the full screen both ask these questions, so they are answered once here.
 */
import type { ICarnetDeBord } from '~/framework/modules/widgets/carnet-de-board/model/carnet-de-bord';

export type CarnetDeBordChild = Pick<ICarnetDeBord, 'address' | 'id' | 'idPronote'>;

/**
 * The backend answers one entry per child and per structure, so a child with two Pronote accounts
 * appears twice. Their Pronote identifier is what tells them apart.
 */
export const getChildId = (child: Pick<CarnetDeBordChild, 'id' | 'idPronote'>) => child.idPronote ?? child.id;

export const findChild = <T extends Pick<CarnetDeBordChild, 'id' | 'idPronote'>>(children: T[], id?: string) =>
  children.find(child => getChildId(child) === id);

/**
 * A child of the account Pronote knows nothing about keeps its own fields only. structureId is left
 * out on purpose: it merely names the structure, and the API does not always send it.
 */
export const hasPronoteData = <T extends CarnetDeBordChild>(child?: T): child is T => !!(child?.idPronote && child.address);

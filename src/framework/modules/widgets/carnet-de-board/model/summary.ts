/**
 * What the home widget shows for each of its four blocks.
 *
 * The full carnet de bord screen shows the next item to come, or the latest past one. The widget
 * follows the 2026 rules instead: a thirty day window on what already happened, and only what is
 * still ahead for the homework.
 */
import moment from 'moment';

import {
  ICarnetDeBord,
  ICarnetDeBordCahierDeTextesTravailAFaire,
  ICarnetDeBordCompetencesDomaine,
  ICarnetDeBordCompetencesEvaluation,
  ICarnetDeBordCompetencesItem,
  ICarnetDeBordReleveDeNotesDevoir,
  ICarnetDeBordVieScolaireAbsence,
  ICarnetDeBordVieScolaireRetard,
} from '~/framework/modules/widgets/carnet-de-board/model/carnet-de-bord';

export const SUMMARY_WINDOW_DAYS = 30;

export type CarnetDeBordUnjustified = ICarnetDeBordVieScolaireAbsence | ICarnetDeBordVieScolaireRetard;
export type CarnetDeBordSkill = ICarnetDeBordCompetencesEvaluation | ICarnetDeBordCompetencesItem | ICarnetDeBordCompetencesDomaine;

const isWithinWindow = (date?: moment.Moment) => !!date?.isAfter(moment().subtract(SUMMARY_WINDOW_DAYS, 'days'));

const byMostRecent = <T>(items: T[], getDate: (item: T) => moment.Moment | undefined) =>
  items
    .filter(item => isWithinWindow(getDate(item)))
    .sort((a, b) => getDate(b)!.diff(getDate(a)!))
    .at(0);

export const getUnjustifiedDate = (item: CarnetDeBordUnjustified) => (item.type === 'Absence' ? item.DateDebut : item.Date);

export function getUnjustifiedLatenessSummary(data?: ICarnetDeBord) {
  const events = (data?.PageVieScolaire?.VieScolairePast ?? []).filter(
    (event): event is CarnetDeBordUnjustified => (event.type === 'Absence' || event.type === 'Retard') && !event.Justifie,
  );
  return byMostRecent(events, getUnjustifiedDate);
}

export function getNoteSummary(data?: ICarnetDeBord) {
  return byMostRecent<ICarnetDeBordReleveDeNotesDevoir>(data?.PageReleveDeNotes?.DevoirsPast ?? [], devoir => devoir.Date);
}

export function getHomeworkSummary(data?: ICarnetDeBord) {
  return (data?.PageCahierDeTextes?.TravailAFaireFuture ?? [])
    .filter((taf): taf is ICarnetDeBordCahierDeTextesTravailAFaire & { PourLe: moment.Moment } => !!taf.PourLe)
    .sort((a, b) => a.PourLe.diff(b.PourLe))
    .at(0);
}

export function getSkillSummary(data?: ICarnetDeBord) {
  return byMostRecent<CarnetDeBordSkill>(data?.PageCompetences?.CompetencesPast ?? [], skill => skill.Date);
}

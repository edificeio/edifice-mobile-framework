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
} from './carnet-de-bord';

export const SUMMARY_WINDOW_DAYS = 30;

export type CarnetDeBordUnjustified = ICarnetDeBordVieScolaireAbsence | ICarnetDeBordVieScolaireRetard;
export type CarnetDeBordSkill = ICarnetDeBordCompetencesEvaluation | ICarnetDeBordCompetencesItem | ICarnetDeBordCompetencesDomaine;

const isWithinWindow = (date?: moment.Moment) => !!date?.isAfter(moment().subtract(SUMMARY_WINDOW_DAYS, 'days'));

const getMostRecent = <T>(items: T[], getDate: (item: T) => moment.Moment | undefined) =>
  items.reduce<T | undefined>((kept, item) => {
    const date = getDate(item);
    if (!isWithinWindow(date)) return kept;
    const keptDate = kept && getDate(kept);
    return !keptDate || date!.isAfter(keptDate) ? item : kept;
  }, undefined);

export const getUnjustifiedDate = (item: CarnetDeBordUnjustified) => (item.type === 'Absence' ? item.DateDebut : item.Date);

export function getLatestUnjustified(data?: ICarnetDeBord) {
  const events = (data?.PageVieScolaire?.VieScolairePast ?? []).filter(
    (event): event is CarnetDeBordUnjustified => (event.type === 'Absence' || event.type === 'Retard') && !event.Justifie,
  );
  return getMostRecent(events, getUnjustifiedDate);
}

export function getLatestNote(data?: ICarnetDeBord) {
  return getMostRecent<ICarnetDeBordReleveDeNotesDevoir>(data?.PageReleveDeNotes?.DevoirsPast ?? [], devoir => devoir.Date);
}

type CarnetDeBordHomeworkDue = ICarnetDeBordCahierDeTextesTravailAFaire & { PourLe: moment.Moment };

const hasDueDate = (taf: ICarnetDeBordCahierDeTextesTravailAFaire): taf is CarnetDeBordHomeworkDue => !!taf.PourLe;

export function getSoonestHomework(data?: ICarnetDeBord) {
  return (data?.PageCahierDeTextes?.TravailAFaireFuture ?? []).reduce<CarnetDeBordHomeworkDue | undefined>(
    (kept, taf) => (hasDueDate(taf) && (!kept || taf.PourLe.isBefore(kept.PourLe)) ? taf : kept),
    undefined,
  );
}

export function getLatestSkill(data?: ICarnetDeBord) {
  return getMostRecent<CarnetDeBordSkill>(data?.PageCompetences?.CompetencesPast ?? [], skill => skill.Date);
}

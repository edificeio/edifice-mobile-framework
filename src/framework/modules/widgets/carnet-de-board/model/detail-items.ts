import { I18n } from '~/app/i18n';
import { displayDate } from '~/framework/util/date';
import { splitWords } from '~/framework/util/string';

import {
  CarnetDeBordSection,
  formatCarnetDeBordCompetencesValue,
  formatCarnetDeBordReleveDeNotesDevoirNoteBareme,
  formatCarnetDeBordVieScolaireType,
  formatVieScolaireDate,
  ICarnetDeBord,
  ICarnetDeBordVieScolaire,
  noInfo,
} from './carnet-de-bord';

export interface CarnetDeBordDetailItem {
  date?: string;
  description?: string;
  label?: string;
  title?: string;
  value?: string;
}

const getVieScolaireDescription = (event: ICarnetDeBordVieScolaire) => {
  if (event.type === 'Absence' || event.type === 'Retard') return event.Motif || noInfo();
  if (event.type === 'Punition' || event.type === 'Sanction') return event.Nature || noInfo();
  if (event.type === 'Observation') return event.Observation || noInfo();
  return noInfo();
};

const DETAIL_ITEMS: Record<CarnetDeBordSection, (data: ICarnetDeBord) => CarnetDeBordDetailItem[]> = {
  [CarnetDeBordSection.CAHIER_DE_TEXTES]: data =>
    [...(data.PageCahierDeTextes?.TravailAFairePast ?? []), ...(data.PageCahierDeTextes?.TravailAFaireFuture ?? [])].map(taf => ({
      date: I18n.get('pronote-cahierdetextes-pourdate', { date: taf.PourLe ? displayDate(taf.PourLe) : noInfo() }),
      description: taf.Descriptif || `<p>${noInfo()}</p>`,
      label: taf.Matiere || noInfo(),
    })),

  [CarnetDeBordSection.COMPETENCES]: data =>
    [...(data.PageCompetences?.CompetencesPast ?? []), ...(data.PageCompetences?.CompetencesFuture ?? [])].map(item => ({
      date: item.Date ? displayDate(item.Date) : noInfo(),
      label: item.Matiere || noInfo(),
      value: item.NiveauDAcquisition?.Genre
        ? splitWords(formatCarnetDeBordCompetencesValue(item.NiveauDAcquisition.Genre), 2)
        : noInfo(),
    })),

  [CarnetDeBordSection.NOTES]: data =>
    [...(data.PageReleveDeNotes?.DevoirsPast ?? []), ...(data.PageReleveDeNotes?.DevoirsFuture ?? [])].map(item => ({
      date: item.Date ? displayDate(item.Date) : noInfo(),
      label: item.Matiere || noInfo(),
      value: formatCarnetDeBordReleveDeNotesDevoirNoteBareme(item.Note, item.Bareme),
    })),

  [CarnetDeBordSection.VIE_SCOLAIRE]: data =>
    [...(data.PageVieScolaire?.VieScolairePast ?? []), ...(data.PageVieScolaire?.VieScolaireFuture ?? [])].map(item => ({
      date: formatVieScolaireDate(item),
      description: getVieScolaireDescription(item),
      label: formatCarnetDeBordVieScolaireType(item.type),
    })),
};

export const getDetailItems = (section: CarnetDeBordSection, data: ICarnetDeBord) => DETAIL_ITEMS[section](data);

const PRONOTE_PAGE: Record<CarnetDeBordSection, keyof NonNullable<ICarnetDeBord['PagePronote']>> = {
  [CarnetDeBordSection.CAHIER_DE_TEXTES]: 'Travail à faire à la maison',
  [CarnetDeBordSection.COMPETENCES]: 'Évaluations par compétence',
  [CarnetDeBordSection.NOTES]: 'Mon relevé de notes',
  [CarnetDeBordSection.VIE_SCOLAIRE]: 'Récapitulatif des évènements de la vie scolaire',
};

export const getPronotePageId = (section: CarnetDeBordSection, data: ICarnetDeBord) => data.PagePronote?.[PRONOTE_PAGE[section]];

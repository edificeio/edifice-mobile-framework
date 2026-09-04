import { I18n } from '~/app/i18n';
import { displayDate } from '~/framework/util/date';

import {
  CarnetDeBordSection,
  formatCarnetDeBordCompetencesValue,
  formatCarnetDeBordReleveDeNotesDevoirNoteBareme,
  formatCarnetDeBordVieScolaireType,
  getSummaryItem,
  ICarnetDeBord,
  ICarnetDeBordVieScolaire,
} from './carnet-de-bord';

export interface CarnetDeBordScreenSectionLabels {
  textLabel: string;
  valueLabel: string;
}

export interface CarnetDeBordScreenSection {
  emptyText: string;
  getLabels: (data: ICarnetDeBord) => CarnetDeBordScreenSectionLabels | undefined;
  section: CarnetDeBordSection;
  title: string;
}

const noInfo = () => I18n.get('pronote-noinfo');

const formatVieScolaireDate = (event: ICarnetDeBordVieScolaire) => {
  if (event.type === 'Absence') {
    const { DateDebut: start, DateFin: end } = event;
    if (!start || !end) return noInfo();
    if (!start.isSame(end, 'day'))
      return I18n.get('pronote-viescolaire-datefromto', {
        end: displayDate(end, 'short'),
        start: displayDate(start, 'short'),
      });
    if (start.isSame(end, 'minute')) return displayDate(start, 'short');
    return (
      displayDate(start, 'short') +
      I18n.get('common-space') +
      I18n.get('pronote-viescolaire-datefromto', { end: end.format('LT'), start: start.format('LT') })
    );
  }

  if (!event.Date) return noInfo();
  if (event.type === 'Retard' || event.type === 'PassageInfirmerie')
    return displayDate(event.Date, 'short') + I18n.get('common-space') + event.Date.format('LT');
  return displayDate(event.Date, 'short');
};

export const SCREEN_SECTIONS: CarnetDeBordScreenSection[] = [
  {
    emptyText: 'pronote-cahierdetextes-empty',
    getLabels: data => {
      const taf = getSummaryItem(data.PageCahierDeTextes?.TravailAFairePast, data.PageCahierDeTextes?.TravailAFaireFuture);
      if (!taf) return undefined;

      return {
        textLabel: taf.Matiere ?? noInfo(),
        valueLabel: taf.PourLe
          ? I18n.get('pronote-cahierdetextes-pourdate', { date: displayDate(taf.PourLe, 'short') }).toLowerCase()
          : noInfo(),
      };
    },
    section: CarnetDeBordSection.CAHIER_DE_TEXTES,
    title: 'pronote-cahierdetextes-title',
  },
  {
    emptyText: 'pronote-transcript-empty',
    getLabels: data => {
      const note = getSummaryItem(data.PageReleveDeNotes?.DevoirsPast, data.PageReleveDeNotes?.DevoirsFuture);
      if (!note) return undefined;

      return {
        textLabel: note.Matiere || noInfo(),
        valueLabel: note.Note ? formatCarnetDeBordReleveDeNotesDevoirNoteBareme(note.Note, note.Bareme) : noInfo(),
      };
    },
    section: CarnetDeBordSection.NOTES,
    title: 'pronote-transcript-title',
  },
  {
    emptyText: 'pronote-skills-empty',
    getLabels: data => {
      const skill = getSummaryItem(data.PageCompetences?.CompetencesPast, data.PageCompetences?.CompetencesFuture);
      if (!skill) return undefined;

      return {
        textLabel: skill.Matiere || noInfo(),
        valueLabel: formatCarnetDeBordCompetencesValue(skill.NiveauDAcquisition?.Genre),
      };
    },
    section: CarnetDeBordSection.COMPETENCES,
    title: 'pronote-skills-title',
  },
  {
    emptyText: 'pronote-viescolaire-empty',
    getLabels: data => {
      const event = getSummaryItem(data.PageVieScolaire?.VieScolairePast, data.PageVieScolaire?.VieScolaireFuture);
      if (!event) return undefined;

      return { textLabel: formatCarnetDeBordVieScolaireType(event.type), valueLabel: formatVieScolaireDate(event) };
    },
    section: CarnetDeBordSection.VIE_SCOLAIRE,
    title: 'pronote-viescolaire-title',
  },
];

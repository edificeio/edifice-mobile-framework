import { I18n } from '~/app/i18n';
import { displayDate } from '~/framework/util/date';

import {
  CarnetDeBordSection,
  formatCarnetDeBordCompetencesValue,
  formatCarnetDeBordReleveDeNotesDevoirNoteBareme,
  formatCarnetDeBordVieScolaireType,
  formatVieScolaireDate,
  getSummaryItem,
  ICarnetDeBord,
  noInfo,
} from './carnet-de-bord';
import { SECTION_TITLE } from './sections';

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
    title: SECTION_TITLE[CarnetDeBordSection.CAHIER_DE_TEXTES],
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
    title: SECTION_TITLE[CarnetDeBordSection.NOTES],
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
    title: SECTION_TITLE[CarnetDeBordSection.COMPETENCES],
  },
  {
    emptyText: 'pronote-viescolaire-empty',
    getLabels: data => {
      const event = getSummaryItem(data.PageVieScolaire?.VieScolairePast, data.PageVieScolaire?.VieScolaireFuture);
      if (!event) return undefined;

      return { textLabel: formatCarnetDeBordVieScolaireType(event.type), valueLabel: formatVieScolaireDate(event, 'short') };
    },
    section: CarnetDeBordSection.VIE_SCOLAIRE,
    title: SECTION_TITLE[CarnetDeBordSection.VIE_SCOLAIRE],
  },
];

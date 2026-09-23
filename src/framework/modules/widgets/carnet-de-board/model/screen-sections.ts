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
import { SECTION_TITLE_I18N } from './sections';

export interface CarnetDeBordScreenSectionLabels {
  textLabel: string;
  valueLabel: string;
}

export interface CarnetDeBordScreenSection {
  emptyTextI18n: string;
  getLabels: (data: ICarnetDeBord) => CarnetDeBordScreenSectionLabels | undefined;
  section: CarnetDeBordSection;
  titleI18n: string;
}

export const SCREEN_SECTIONS: CarnetDeBordScreenSection[] = [
  {
    emptyTextI18n: 'pronote-cahierdetextes-empty',
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
    titleI18n: SECTION_TITLE_I18N[CarnetDeBordSection.CAHIER_DE_TEXTES],
  },
  {
    emptyTextI18n: 'pronote-transcript-empty',
    getLabels: data => {
      const note = getSummaryItem(data.PageReleveDeNotes?.DevoirsPast, data.PageReleveDeNotes?.DevoirsFuture);
      if (!note) return undefined;

      return {
        textLabel: note.Matiere || noInfo(),
        valueLabel: note.Note ? formatCarnetDeBordReleveDeNotesDevoirNoteBareme(note.Note, note.Bareme) : noInfo(),
      };
    },
    section: CarnetDeBordSection.NOTES,
    titleI18n: SECTION_TITLE_I18N[CarnetDeBordSection.NOTES],
  },
  {
    emptyTextI18n: 'pronote-skills-empty',
    getLabels: data => {
      const skill = getSummaryItem(data.PageCompetences?.CompetencesPast, data.PageCompetences?.CompetencesFuture);
      if (!skill) return undefined;

      return {
        textLabel: skill.Matiere || noInfo(),
        valueLabel: formatCarnetDeBordCompetencesValue(skill.NiveauDAcquisition?.Genre),
      };
    },
    section: CarnetDeBordSection.COMPETENCES,
    titleI18n: SECTION_TITLE_I18N[CarnetDeBordSection.COMPETENCES],
  },
  {
    emptyTextI18n: 'pronote-viescolaire-empty',
    getLabels: data => {
      const event = getSummaryItem(data.PageVieScolaire?.VieScolairePast, data.PageVieScolaire?.VieScolaireFuture);
      if (!event) return undefined;

      return { textLabel: formatCarnetDeBordVieScolaireType(event.type), valueLabel: formatVieScolaireDate(event, 'short') };
    },
    section: CarnetDeBordSection.VIE_SCOLAIRE,
    titleI18n: SECTION_TITLE_I18N[CarnetDeBordSection.VIE_SCOLAIRE],
  },
];

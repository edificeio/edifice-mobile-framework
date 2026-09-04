import { I18n } from '~/app/i18n';
import type { SvgIconName } from '~/framework/components/picture';
import {
  CarnetDeBordSection,
  type CarnetDeBordSectionColors,
  formatCarnetDeBordReleveDeNotesDevoirNoteBareme,
  getHomeworkSummary,
  getNoteSummary,
  getSkillSummary,
  getUnjustifiedDate,
  getUnjustifiedLatenessSummary,
  ICarnetDeBord,
  SECTION_STYLE,
} from '~/framework/modules/widgets/carnet-de-board/model';

const noInfo = () => I18n.get('pronote-noinfo');

export interface CarnetDeBordWidgetSection {
  colors: CarnetDeBordSectionColors;
  emptyText: string;
  // the one line the block shows, or nothing when the child has no such event.
  getValue: (data?: ICarnetDeBord) => string | undefined;
  icon: SvgIconName;
  section: CarnetDeBordSection;
  title: string;
}

export const WIDGET_SECTIONS: CarnetDeBordWidgetSection[] = [
  {
    colors: SECTION_STYLE[CarnetDeBordSection.CAHIER_DE_TEXTES].colors,
    emptyText: 'pronote-cahierdetextes-empty',
    getValue: data => {
      const taf = getHomeworkSummary(data);

      return taf
        ? I18n.get('pronote-widget-homework-value', { date: taf.PourLe.format('L'), subject: taf.Matiere || noInfo() })
        : undefined;
    },
    icon: SECTION_STYLE[CarnetDeBordSection.CAHIER_DE_TEXTES].icon,
    section: CarnetDeBordSection.CAHIER_DE_TEXTES,
    title: 'pronote-cahierdetextes-title',
  },
  {
    colors: SECTION_STYLE[CarnetDeBordSection.NOTES].colors,
    emptyText: 'pronote-transcript-empty',
    getValue: data => {
      const devoir = getNoteSummary(data);

      return devoir
        ? I18n.get('pronote-widget-note-value', {
            date: devoir.Date!.format('L'),
            note: formatCarnetDeBordReleveDeNotesDevoirNoteBareme(devoir.Note, devoir.Bareme),
            subject: devoir.Matiere || noInfo(),
          })
        : undefined;
    },
    icon: SECTION_STYLE[CarnetDeBordSection.NOTES].icon,
    section: CarnetDeBordSection.NOTES,
    title: 'pronote-transcript-title',
  },

  {
    colors: SECTION_STYLE[CarnetDeBordSection.COMPETENCES].colors,
    emptyText: 'pronote-skills-empty',
    getValue: data => {
      const competence = getSkillSummary(data);

      return competence
        ? I18n.get('pronote-widget-skill-value', {
            date: competence.Date!.format('L'),
            skill: competence.Competence || competence.Intitule || competence.type,
            subject: competence.Matiere || noInfo(),
          })
        : undefined;
    },
    icon: SECTION_STYLE[CarnetDeBordSection.COMPETENCES].icon,
    section: CarnetDeBordSection.COMPETENCES,
    title: 'pronote-widget-skills-title',
  },
  {
    colors: SECTION_STYLE[CarnetDeBordSection.VIE_SCOLAIRE].colors,
    emptyText: 'pronote-widget-lateness-empty',
    getValue: data => {
      const event = getUnjustifiedLatenessSummary(data);
      const date = event && getUnjustifiedDate(event);

      return date ? I18n.get('pronote-widget-lateness-value', { date: date.format('L'), time: date.format('LT') }) : undefined;
    },
    icon: SECTION_STYLE[CarnetDeBordSection.VIE_SCOLAIRE].icon,
    section: CarnetDeBordSection.VIE_SCOLAIRE,
    title: 'pronote-widget-lateness-title',
  },
];

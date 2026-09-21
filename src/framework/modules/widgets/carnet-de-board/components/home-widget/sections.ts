import { I18n } from '~/app/i18n';
import type { SvgIconName } from '~/framework/components/picture';
import {
  CarnetDeBordSection,
  type CarnetDeBordSectionColors,
  formatCarnetDeBordReleveDeNotesDevoirNoteBareme,
  getLatestNote,
  getLatestSkill,
  getLatestUnjustified,
  getSoonestHomework,
  getUnjustifiedDate,
  ICarnetDeBord,
  noInfo,
  SECTION_STYLE,
} from '~/framework/modules/widgets/carnet-de-board/model';

export interface CarnetDeBordWidgetSection {
  colors: CarnetDeBordSectionColors;
  emptyTextI18n: string;
  // the one line the block shows, or nothing when the child has no such event.
  getValue: (data?: ICarnetDeBord) => string | undefined;
  icon: SvgIconName;
  section: CarnetDeBordSection;
  titleI18n: string;
}

export const WIDGET_SECTIONS: CarnetDeBordWidgetSection[] = [
  {
    colors: SECTION_STYLE[CarnetDeBordSection.CAHIER_DE_TEXTES].colors,
    emptyTextI18n: 'pronote-cahierdetextes-empty',
    getValue: data => {
      const taf = getSoonestHomework(data);

      return taf
        ? I18n.get('pronote-widget-homework-value', { date: taf.PourLe.format('L'), subject: taf.Matiere || noInfo() })
        : undefined;
    },
    icon: SECTION_STYLE[CarnetDeBordSection.CAHIER_DE_TEXTES].icon,
    section: CarnetDeBordSection.CAHIER_DE_TEXTES,
    titleI18n: 'pronote-cahierdetextes-title',
  },
  {
    colors: SECTION_STYLE[CarnetDeBordSection.NOTES].colors,
    emptyTextI18n: 'pronote-transcript-empty',
    getValue: data => {
      const devoir = getLatestNote(data);

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
    titleI18n: 'pronote-transcript-title',
  },

  {
    colors: SECTION_STYLE[CarnetDeBordSection.COMPETENCES].colors,
    emptyTextI18n: 'pronote-skills-empty',
    getValue: data => {
      const competence = getLatestSkill(data);

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
    titleI18n: 'pronote-widget-skills-title',
  },
  {
    colors: SECTION_STYLE[CarnetDeBordSection.VIE_SCOLAIRE].colors,
    emptyTextI18n: 'pronote-widget-lateness-empty',
    getValue: data => {
      const event = getLatestUnjustified(data);
      const date = event && getUnjustifiedDate(event);

      return date ? I18n.get('pronote-widget-lateness-value', { date: date.format('L'), time: date.format('LT') }) : undefined;
    },
    icon: SECTION_STYLE[CarnetDeBordSection.VIE_SCOLAIRE].icon,
    section: CarnetDeBordSection.VIE_SCOLAIRE,
    titleI18n: 'pronote-widget-lateness-title',
  },
];

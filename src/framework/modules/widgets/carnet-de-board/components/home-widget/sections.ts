import { I18n } from '~/app/i18n';
import type { SvgIconName } from '~/framework/components/picture';
import { BLOCK_COLORS } from '~/framework/modules/widgets/carnet-de-board/components/home-widget/constants';
import type { CarnetDeBordSectionColors } from '~/framework/modules/widgets/carnet-de-board/components/home-widget/types';
import {
  CarnetDeBordSection,
  formatCarnetDeBordReleveDeNotesDevoirNoteBareme,
  ICarnetDeBord,
} from '~/framework/modules/widgets/carnet-de-board/model/carnet-de-bord';
import {
  getHomeworkSummary,
  getNoteSummary,
  getSkillSummary,
  getUnjustifiedDate,
  getUnjustifiedLatenessSummary,
} from '~/framework/modules/widgets/carnet-de-board/model/summary';

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
    colors: BLOCK_COLORS.homework,
    emptyText: 'pronote-cahierdetextes-empty',
    getValue: data => {
      const taf = getHomeworkSummary(data);

      return taf
        ? I18n.get('pronote-widget-homework-value', { date: taf.PourLe.format('L'), subject: taf.Matiere || noInfo() })
        : undefined;
    },
    icon: 'diary-outline',
    section: CarnetDeBordSection.CAHIER_DE_TEXTES,
    title: 'pronote-cahierdetextes-title',
  },
  {
    colors: BLOCK_COLORS.note,
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
    icon: 'ui-notes',
    section: CarnetDeBordSection.NOTES,
    title: 'pronote-transcript-title',
  },

  {
    colors: BLOCK_COLORS.skill,
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
    icon: 'ui-teacher',
    section: CarnetDeBordSection.COMPETENCES,
    title: 'pronote-widget-skills-title',
  },
  {
    colors: BLOCK_COLORS.lateness,
    emptyText: 'pronote-widget-lateness-empty',
    getValue: data => {
      const event = getUnjustifiedLatenessSummary(data);
      const date = event && getUnjustifiedDate(event);

      return date ? I18n.get('pronote-widget-lateness-value', { date: date.format('L'), time: date.format('LT') }) : undefined;
    },
    icon: 'ui-clock-alert',
    section: CarnetDeBordSection.VIE_SCOLAIRE,
    title: 'pronote-widget-lateness-title',
  },
];

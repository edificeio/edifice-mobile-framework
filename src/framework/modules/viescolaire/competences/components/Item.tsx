import I18n from 'i18n-js';
import * as React from 'react';
import { FlatList, FlexAlignType, StyleSheet, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { BodyBoldText, HeadingSText, SmallBoldText, SmallText } from '~/framework/components/text';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';
import { ICompetence, IDevoir, IDomaine, ILevel, ISubject } from '~/framework/modules/viescolaire/competences/model';
import { LeftColoredItem } from '~/framework/modules/viescolaire/dashboard/components/Item';
import { ButtonsOkOnly } from '~/ui/ButtonsOkCancel';
import { ModalBox, ModalContent, ModalContentBlock } from '~/ui/Modal';

const styles = StyleSheet.create({
  competenceRoundContainer: {
    width: '25%',
    justifyContent: 'center',
  },
  competenceRoundContainerWidthQuarter: {
    width: '25%',
  },
  competenceRoundContainerWidthAuto: {
    width: 'auto',
  },
  competenceRound: {
    borderRadius: 45,
    minWidth: 60,
    minHeight: 60,
    backgroundColor: theme.palette.grey.white,
    justifyContent: 'center',
  },
  competenceRoundText: {
    textAlign: 'center',
  },
  competenceRoundModalStyle: {
    width: '100%',
  },
  competenceRoundModalContentStyle: {
    marginLeft: -UI_SIZES.spacing.medium,
    marginRight: UI_SIZES.spacing.medium,
  },
  competenceRoundModalText: {
    width: '85%',
  },
  round: {
    marginLeft: UI_SIZES.spacing.tiny,
    height: 25,
    width: 25,
    borderRadius: UI_SIZES.spacing.medium,
  },
  modalBlock: {
    width: '92%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: UI_SIZES.spacing.minor,
    padding: UI_SIZES.spacing.minor,
  },
  shadow: {
    shadowColor: theme.ui.shadowColor,
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },
  denseDevoirListContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  denseDevoirListMatiereContainer: {
    flexDirection: 'row',
    width: '75%',
    padding: UI_SIZES.spacing.minor,
    justifyContent: 'space-between',
  },
  denseDevoirListMatiereText: {
    maxWidth: '65%',
    paddingRight: UI_SIZES.spacing.minor,
  },
  denseDevoirListNoteText: {
    flexGrow: 1,
    textAlign: 'right',
    alignSelf: 'center',
  },
  denseDevoirListDiviseurText: {
    paddingTop: UI_SIZES.spacing.minor,
  },
});

const getColorfromCompetence = (evaluation: number, levels: ILevel[]) => {
  const cycleLevels = levels.filter(obj => {
    return obj.cycle === 'Cycle 3';
  });
  if (evaluation >= 0 && evaluation < cycleLevels.length) {
    const color = cycleLevels[evaluation].couleur;
    return color ? color : cycleLevels[evaluation].default;
  }
  return theme.palette.grey.cloudy;
};

const getCompetenceName = (competence: ICompetence, domaines: IDomaine[]): string => {
  for (const domaine of domaines) {
    let comp = domaine.competences?.find(c => c.id === competence.id);
    if (comp) return comp.name;
    for (const d of domaine.domaines) {
      comp = d.competences?.find(c => c.id === competence.id);
      if (comp) return comp.name;
    }
  }
  return '';
};

const CompetenceRoundModal = (competence: ICompetence, domaines: IDomaine[], levels: ILevel[]) => (
  <ModalContentBlock style={styles.modalBlock}>
    <SmallText style={styles.competenceRoundModalText}>{getCompetenceName(competence, domaines)}</SmallText>
    <View style={[styles.round, { backgroundColor: getColorfromCompetence(competence.evaluation, levels) }]} />
  </ModalContentBlock>
);

export const CompetenceRound = ({
  competences,
  stateFullRound,
  size,
  domaines,
  levels,
}: {
  competences: ICompetence[];
  stateFullRound: FlexAlignType;
  size: number;
  domaines: IDomaine[];
  levels: ILevel[];
}) => {
  const [isVisible, toggleVisible] = React.useState(false);
  return (
    <View
      style={[
        styles.competenceRoundContainer,
        stateFullRound === 'flex-end' ? styles.competenceRoundContainerWidthAuto : styles.competenceRoundContainerWidthQuarter,
        { alignItems: stateFullRound },
      ]}>
      {competences.length > 0 && (
        <TouchableOpacity
          style={[styles.competenceRound, styles.shadow, { minHeight: size, minWidth: size }]}
          onPress={() => toggleVisible(!isVisible)}>
          <HeadingSText style={styles.competenceRoundText}>C</HeadingSText>
        </TouchableOpacity>
      )}

      {isVisible && (
        <ModalBox isVisible={isVisible}>
          <ModalContent>
            <FlatList
              style={styles.competenceRoundModalStyle}
              contentContainerStyle={styles.competenceRoundModalContentStyle}
              showsVerticalScrollIndicator={false}
              data={competences}
              renderItem={({ item, index }) => CompetenceRoundModal(item, domaines, levels)}
            />
            <ModalContentBlock>
              <ButtonsOkOnly onValid={() => toggleVisible(false)} title={I18n.t('viesco-close').toUpperCase()} />
            </ModalContentBlock>
          </ModalContent>
        </ModalBox>
      )}
    </View>
  );
};

export const DashboardAssessmentCard = ({
  devoir,
  competences,
  domaines,
  levels,
  subject,
}: {
  devoir: IDevoir;
  competences: ICompetence[];
  domaines: IDomaine[];
  levels: ILevel[];
  subject?: ISubject;
}) => (
  <LeftColoredItem shadow color={viescoTheme.palette.competences} style={styles.denseDevoirListContainer}>
    <View style={styles.denseDevoirListMatiereContainer}>
      <SmallBoldText style={styles.denseDevoirListMatiereText} numberOfLines={1}>
        {subject?.name}
      </SmallBoldText>
      <SmallText>{devoir.date.format('L')}</SmallText>
    </View>
    {devoir.competencesCount ? (
      <CompetenceRound competences={competences} domaines={domaines} levels={levels} size={35} stateFullRound="flex-end" />
    ) : null}
    {isNaN(Number(devoir.note)) ? (
      <BodyBoldText style={styles.denseDevoirListNoteText}>{devoir.note}</BodyBoldText>
    ) : (
      <>
        <BodyBoldText style={styles.denseDevoirListNoteText}>{devoir.note.replace(/\./g, ',')}</BodyBoldText>
        <SmallText style={styles.denseDevoirListDiviseurText}>/{devoir.diviseur}</SmallText>
      </>
    )}
  </LeftColoredItem>
);

import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { BodyBoldText, HeadingSText, SmallBoldText, SmallText } from '~/framework/components/text';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';
import { ICompetence, IDevoir, IDomaine, ILevel, ISubject } from '~/framework/modules/viescolaire/competences/model';
import { LeftColoredItem } from '~/framework/modules/viescolaire/dashboard/components/Item';
import { ArticleContainer } from '~/ui/ContainerContent';

const styles = StyleSheet.create({
  competenceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  competenceNameText: {
    width: '85%',
  },
  competenceRound: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    backgroundColor: theme.palette.grey.white,
    borderRadius: 25,
  },
  levelColorContainer: {
    marginLeft: UI_SIZES.spacing.tiny,
    height: 25,
    width: 25,
    borderRadius: UI_SIZES.spacing.medium,
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

const getLevelColor = (evaluation: number, levels: ILevel[]) => {
  const cycleLevels = levels.filter(level => level.cycle === 'Cycle 3');

  if (evaluation >= 0 && evaluation < cycleLevels.length) {
    return cycleLevels[evaluation].couleur ?? cycleLevels[evaluation].default;
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

export const CompetenceRound = ({ onPress }: { onPress: () => void }) => {
  /*const renderItem = ({ item }: { item: ICompetence }) => {
    return (
      <ArticleContainer style={styles.competenceContainer}>
        <SmallText style={styles.competenceNameText}>{getCompetenceName(item, domaines)}</SmallText>
        <View style={[styles.levelColorContainer, { backgroundColor: getLevelColor(item.evaluation, levels) }]} />
      </ArticleContainer>
    );
  };*/

  return (
    <TouchableOpacity onPress={onPress} style={[styles.competenceRound, styles.shadow]}>
      <HeadingSText>C</HeadingSText>
    </TouchableOpacity>
  );
};

export const DashboardAssessmentCard = ({ devoir, levels, subject }: { devoir: IDevoir; levels: ILevel[]; subject?: ISubject }) => (
  <LeftColoredItem shadow color={viescoTheme.palette.competences} style={styles.denseDevoirListContainer}>
    <View style={styles.denseDevoirListMatiereContainer}>
      <SmallBoldText style={styles.denseDevoirListMatiereText} numberOfLines={1}>
        {subject?.name}
      </SmallBoldText>
      <SmallText>{devoir.date.format('L')}</SmallText>
    </View>
    {devoir.competencesCount ? <CompetenceRound levels={levels} /> : null}
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

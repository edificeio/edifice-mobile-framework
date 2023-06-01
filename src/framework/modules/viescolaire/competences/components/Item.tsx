import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { BodyBoldText, HeadingSText, SmallBoldText, SmallText } from '~/framework/components/text';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';
import { IDevoir, ISubject } from '~/framework/modules/viescolaire/competences/model';
import { LeftColoredItem } from '~/framework/modules/viescolaire/dashboard/components/Item';

const styles = StyleSheet.create({
  competenceRound: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    backgroundColor: theme.palette.grey.white,
    borderRadius: 25,
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
    alignItems: 'center',
  },
  denseDevoirListMatiereContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '70%',
    padding: UI_SIZES.spacing.minor,
  },
  denseDevoirListMatiereText: {
    maxWidth: '65%',
    paddingRight: UI_SIZES.spacing.minor,
  },
  denseDevoirListNoteText: {
    flexGrow: 1,
    textAlign: 'right',
  },
});

export const CompetenceRound = ({ onPress }: { onPress: () => void }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.competenceRound}>
      <HeadingSText>C</HeadingSText>
    </TouchableOpacity>
  );
};

export const DashboardAssessmentCard = ({
  devoir,
  subject,
  openAssessment,
}: {
  devoir: IDevoir;
  subject?: ISubject;
  openAssessment: () => void;
}) => (
  <LeftColoredItem shadow color={viescoTheme.palette.competences} style={styles.denseDevoirListContainer}>
    <View style={styles.denseDevoirListMatiereContainer}>
      <SmallBoldText style={styles.denseDevoirListMatiereText} numberOfLines={1}>
        {subject?.name}
      </SmallBoldText>
      <SmallText>{devoir.date.format('L')}</SmallText>
    </View>
    {devoir.competencesCount ? <CompetenceRound onPress={openAssessment} /> : null}
    {isNaN(Number(devoir.note)) ? (
      <BodyBoldText style={styles.denseDevoirListNoteText}>{devoir.note}</BodyBoldText>
    ) : (
      <>
        <BodyBoldText style={styles.denseDevoirListNoteText}>{devoir.note.replace(/\./g, ',')}</BodyBoldText>
        <SmallText>/{devoir.diviseur}</SmallText>
      </>
    )}
  </LeftColoredItem>
);

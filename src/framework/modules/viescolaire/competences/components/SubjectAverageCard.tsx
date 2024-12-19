import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { HeadingSText, SmallActionText, SmallBoldText, SmallText } from '~/framework/components/text';
import { IAverage, IDevoir } from '~/framework/modules/viescolaire/competences/model';
import { LeftColoredItem } from '~/framework/modules/viescolaire/dashboard/components/Item';

const styles = StyleSheet.create({
  averageText: {
    color: theme.palette.primary.regular,
  },
  devoirContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  devoirNameText: {
    flexShrink: 1,
  },
  subjectInformationContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: UI_SIZES.spacing.minor,
  },
});

interface ISubjectAverageCardProps {
  average: IAverage;
  devoirs: IDevoir[];
}

export class SubjectAverageCard extends React.PureComponent<ISubjectAverageCardProps> {
  public render() {
    const { average, devoirs } = this.props;

    return (
      <LeftColoredItem shadow color={theme.palette.complementary.blue.regular}>
        <View style={styles.subjectInformationContainer}>
          <View>
            <SmallBoldText numberOfLines={1}>{average.subject}</SmallBoldText>
            <SmallText numberOfLines={1}>{average.teacher}</SmallText>
          </View>
          <HeadingSText style={styles.averageText}>{average.average}</HeadingSText>
        </View>
        {devoirs.map(devoir => (
          <View style={styles.devoirContainer} key={devoir.id}>
            <SmallText numberOfLines={1} style={styles.devoirNameText}>
              {devoir.name}
            </SmallText>
            <SmallActionText>{devoir.note ? `${devoir.note}/${devoir.diviseur}` : devoir.libelle}</SmallActionText>
          </View>
        ))}
      </LeftColoredItem>
    );
  }
}

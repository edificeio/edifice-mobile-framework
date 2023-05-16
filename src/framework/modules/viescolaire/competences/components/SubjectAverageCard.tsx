import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { HeadingSText, SmallActionText, SmallBoldText, SmallText } from '~/framework/components/text';
import { IDevoir } from '~/framework/modules/viescolaire/competences/model';
import { LeftColoredItem } from '~/framework/modules/viescolaire/dashboard/components/Item';
import { ArticleContainer } from '~/ui/ContainerContent';

const styles = StyleSheet.create({
  averageText: {
    color: theme.palette.primary.regular,
  },
  devoirContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  devoirNameText: {
    flexShrink: 1,
  },
  subjectInformationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: UI_SIZES.spacing.minor,
  },
});

interface ISubjectAverageCardProps {
  devoirs: IDevoir[];
  name: string;
}

export class SubjectAverageCard extends React.PureComponent<ISubjectAverageCardProps> {
  public render() {
    const { devoirs, name } = this.props;
    const sum = devoirs.map(d => Number(d.note)).reduce((prev, next) => prev + next);
    const weight = devoirs.map(d => Number(d.coefficient)).reduce((prev, next) => prev + next);
    const average = sum / weight;

    return (
      <ArticleContainer>
        <LeftColoredItem shadow color={theme.palette.complementary.blue.regular}>
          <View style={styles.subjectInformationContainer}>
            <View>
              <SmallBoldText numberOfLines={1}>{name}</SmallBoldText>
              <SmallText numberOfLines={1}>{devoirs[0].teacher}</SmallText>
            </View>
            <HeadingSText style={styles.averageText}>{Number(average.toFixed(1))}</HeadingSText>
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
      </ArticleContainer>
    );
  }
}

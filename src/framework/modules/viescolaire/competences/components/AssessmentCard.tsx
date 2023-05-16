import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { CardWithoutPadding } from '~/framework/components/card/base';
import { UI_SIZES } from '~/framework/components/constants';
import { HeadingSText, NestedText, SmallBoldText, SmallInverseText, SmallText } from '~/framework/components/text';
import { IDevoir, ISubject } from '~/framework/modules/viescolaire/competences/model';
import { ArticleContainer } from '~/ui/ContainerContent';

import { CompetenceRound } from './Item';

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gradeText: {
    textAlign: 'center',
    marginBottom: UI_SIZES.spacing.minor,
    color: theme.ui.text.inverse,
  },
  leftContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '70%',
    padding: UI_SIZES.spacing.small,
  },
  rightContainer: {
    justifyContent: 'center',
    width: '30%',
    padding: UI_SIZES.spacing.small,
    borderRadius: UI_SIZES.radius.card,
  },
});

interface IAssessmentCardProps {
  assessment: IDevoir;
  subject?: ISubject;
  showAverageColor?: boolean;
  onPress: () => void;
}

export class AssessmentCard extends React.PureComponent<IAssessmentCardProps> {
  getScoreColor = (score: number, averageScore: number, maximum: number) => {
    if (score === maximum || score > averageScore) {
      return theme.palette.complementary.green.regular;
    } else if (score === averageScore) {
      return theme.palette.complementary.orange.regular;
    }
    return theme.palette.complementary.red.regular;
  };

  public render() {
    const { assessment, subject, showAverageColor } = this.props;
    const color = showAverageColor
      ? this.getScoreColor(
          parseFloat(assessment.note.replace(/\./g, ',').replace(',', '.')),
          parseFloat(assessment.moyenne.replace(/\./g, ',').replace(',', '.')),
          assessment.diviseur,
        )
      : theme.palette.complementary.blue.regular;
    const dividerStr = ` / ${assessment.diviseur}`;
    const coefStr = `coeff : ${assessment.coefficient}`;
    const averageStr = `moy : ${assessment.moyenne}`;

    return (
      <ArticleContainer>
        <CardWithoutPadding style={styles.cardContainer}>
          <View style={styles.leftContainer}>
            <View>
              <SmallBoldText numberOfLines={1}>{subject?.name}</SmallBoldText>
              <SmallText numberOfLines={1}>{assessment.teacher}</SmallText>
              <SmallText numberOfLines={1}>{assessment.name}</SmallText>
              <SmallText>{assessment.date.format('L')}</SmallText>
            </View>
            {assessment.competencesCount ? <CompetenceRound onPress={this.props.onPress} /> : null}
          </View>
          <View style={[styles.rightContainer, { backgroundColor: color }]}>
            {isNaN(Number(assessment.note)) ? (
              <HeadingSText style={styles.gradeText}>{assessment.note}</HeadingSText>
            ) : (
              <SmallText style={styles.gradeText}>
                <HeadingSText style={styles.gradeText}>{+parseFloat(Number(assessment.note).toFixed(2))}</HeadingSText>
                <NestedText>{dividerStr}</NestedText>
              </SmallText>
            )}
            {assessment.coefficient ? <SmallInverseText>{coefStr}</SmallInverseText> : null}
            {assessment.moyenne ? <SmallInverseText>{averageStr}</SmallInverseText> : null}
          </View>
        </CardWithoutPadding>
      </ArticleContainer>
    );
  }
}

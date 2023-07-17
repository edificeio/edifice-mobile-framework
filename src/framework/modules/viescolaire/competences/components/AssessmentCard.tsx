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
    flexGrow: 1,
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
  hasCompetences: boolean;
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
    const { assessment, hasCompetences, subject, showAverageColor } = this.props;
    const isAssessmentGraded = 'note' in assessment;
    const color =
      showAverageColor && isAssessmentGraded
        ? this.getScoreColor(
            parseFloat(assessment.note.replace(/\./g, ',').replace(',', '.')),
            parseFloat(assessment.moyenne.replace(/\./g, ',').replace(',', '.')),
            assessment.diviseur,
          )
        : theme.palette.complementary.blue.regular;

    return (
      <ArticleContainer>
        <CardWithoutPadding style={styles.cardContainer}>
          <View style={[styles.leftContainer, !isAssessmentGraded && { marginRight: UI_SIZES.spacing.medium }]}>
            <View>
              <SmallBoldText numberOfLines={1}>{subject?.name}</SmallBoldText>
              {assessment.teacher ? <SmallText numberOfLines={1}>{assessment.teacher}</SmallText> : null}
              <SmallText numberOfLines={1}>{assessment.name}</SmallText>
              <SmallText>{assessment.date.format('L')}</SmallText>
            </View>
            {hasCompetences ? <CompetenceRound onPress={this.props.onPress} /> : null}
          </View>
          {isAssessmentGraded ? (
            <View style={[styles.rightContainer, { backgroundColor: color }]}>
              {isNaN(Number(assessment.note)) ? (
                <HeadingSText style={styles.gradeText}>{assessment.note}</HeadingSText>
              ) : (
                <SmallText style={styles.gradeText}>
                  <HeadingSText style={styles.gradeText}>{+parseFloat(Number(assessment.note).toFixed(2))}</HeadingSText>
                  <NestedText>{` / ${assessment.diviseur}`}</NestedText>
                </SmallText>
              )}
              {assessment.coefficient ? <SmallInverseText>{`coeff : ${assessment.coefficient}`}</SmallInverseText> : null}
              {assessment.moyenne ? <SmallInverseText>{`moy : ${assessment.moyenne}`}</SmallInverseText> : null}
            </View>
          ) : null}
        </CardWithoutPadding>
      </ArticleContainer>
    );
  }
}

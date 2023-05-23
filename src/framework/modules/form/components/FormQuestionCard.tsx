import React from 'react';
import { StyleSheet, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { Card } from '~/framework/components/card/base';
import { UI_SIZES } from '~/framework/components/constants';
import { BodyBoldText, NestedBoldText } from '~/framework/components/text';
import { ButtonTextIcon } from '~/ui/ButtonTextIcon';
import { ArticleContainer } from '~/ui/ContainerContent';

const styles = StyleSheet.create({
  mandatoryText: {
    color: theme.palette.complementary.red.regular,
  },
  lowerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: UI_SIZES.spacing.small,
  },
  childrenContainer: {
    flexGrow: 100,
  },
  actionContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
});

interface IFormQuestionCardProps {
  title: string;
  children?: React.ReactNode;
  isMandatory?: boolean;
  onClearAnswer?: () => void;
  onEditQuestion?: () => void;
}

export class FormQuestionCard extends React.PureComponent<IFormQuestionCardProps> {
  public render() {
    const { title, children, isMandatory, onClearAnswer, onEditQuestion } = this.props;
    const mandatoryText = ' *';
    return (
      <ArticleContainer>
        <Card>
          <BodyBoldText>
            {title}
            {isMandatory ? <NestedBoldText style={styles.mandatoryText}>{mandatoryText}</NestedBoldText> : null}
          </BodyBoldText>
          <View style={styles.lowerContainer}>
            <View style={styles.childrenContainer}>{children}</View>
            {onClearAnswer ? (
              <View style={styles.actionContainer}>
                <ButtonTextIcon title={I18n.get('form.clearAnswer')} onPress={() => onClearAnswer()} />
              </View>
            ) : null}
            {onEditQuestion ? (
              <View style={styles.actionContainer}>
                <ButtonTextIcon title={I18n.get('common.modify')} onPress={() => onEditQuestion()} />
              </View>
            ) : null}
          </View>
        </Card>
      </ArticleContainer>
    );
  }
}

import I18n from 'i18n-js';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { Card } from '~/framework/components/card';
import { UI_SIZES, UI_STYLES } from '~/framework/components/constants';
import { BodyBoldText, NestedBoldText } from '~/framework/components/text';
import { ButtonTextIcon } from '~/ui/ButtonTextIcon';
import { ArticleContainer } from '~/ui/ContainerContent';

const styles = StyleSheet.create({
  mandatoryText: {
    color: theme.palette.complementary.red.regular,
  },
  childrenContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: UI_SIZES.spacing.small,
  },
});

interface IFormQuestionCardProps {
  title: string;
  children?: React.ReactNode;
  isMandatory?: boolean;
  onEditQuestion?: () => void;
}

export class FormQuestionCard extends React.PureComponent<IFormQuestionCardProps> {
  public render() {
    const { title, children, isMandatory, onEditQuestion } = this.props;
    const mandatoryText = ' *';
    return (
      <ArticleContainer>
        <Card>
          <BodyBoldText>
            {title}
            {isMandatory ? <NestedBoldText style={styles.mandatoryText}>{mandatoryText}</NestedBoldText> : null}
          </BodyBoldText>
          <View style={styles.childrenContainer}>
            <View style={UI_STYLES.flex1}>{children}</View>
            {onEditQuestion ? <ButtonTextIcon title={I18n.t('common.modify')} onPress={() => onEditQuestion()} /> : null}
          </View>
        </Card>
      </ArticleContainer>
    );
  }
}

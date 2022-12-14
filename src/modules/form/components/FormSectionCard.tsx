import React from 'react';
import { StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { CardWithoutPadding } from '~/framework/components/card';
import { UI_SIZES } from '~/framework/components/constants';
import { BodyBoldText } from '~/framework/components/text';
import { ArticleContainer } from '~/ui/ContainerContent';
import { HtmlContentView } from '~/ui/HtmlContentView';

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.palette.primary.dark,
  },
  titleContainer: {
    alignItems: 'center',
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  titleText: {
    color: theme.ui.text.inverse,
  },
  descriptionContainer: {
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.small,
    backgroundColor: theme.ui.background.card,
    borderBottomLeftRadius: UI_SIZES.radius.card,
    borderBottomRightRadius: UI_SIZES.radius.card,
  },
});

interface IFormSectionCardProps {
  title: string;
  description?: string;
}

export class FormSectionCard extends React.PureComponent<IFormSectionCardProps> {
  public render() {
    const { title, description } = this.props;
    return (
      <ArticleContainer>
        <CardWithoutPadding style={styles.container}>
          <View style={styles.titleContainer}>
            <BodyBoldText style={styles.titleText}>{title}</BodyBoldText>
          </View>
          {description ? <HtmlContentView html={description} style={styles.descriptionContainer} /> : null}
        </CardWithoutPadding>
      </ArticleContainer>
    );
  }
}

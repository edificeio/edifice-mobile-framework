import React from 'react';
import { StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { CardWithoutPadding } from '~/framework/components/card/base';
import { UI_SIZES } from '~/framework/components/constants';
import { BodyBoldText } from '~/framework/components/text';
import HtmlContentView from '~/ui/HtmlContentView';

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.palette.primary.dark,
  },
  descriptionContainer: {
    backgroundColor: theme.ui.background.card,
    borderBottomLeftRadius: UI_SIZES.radius.card,
    borderBottomRightRadius: UI_SIZES.radius.card,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.small,
  },
  titleContainer: {
    alignItems: 'center',
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  titleText: {
    color: theme.ui.text.inverse,
  },
});

interface IFormSectionCardProps {
  title: string;
  description?: string;
}

export class FormSectionCard extends React.PureComponent<IFormSectionCardProps> {
  public render() {
    const { description, title } = this.props;
    return (
      <CardWithoutPadding style={styles.container}>
        <View style={styles.titleContainer}>
          <BodyBoldText style={styles.titleText}>{title}</BodyBoldText>
        </View>
        {description ? <HtmlContentView html={description} style={styles.descriptionContainer} /> : null}
      </CardWithoutPadding>
    );
  }
}

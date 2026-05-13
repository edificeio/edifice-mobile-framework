import React from 'react';
import { StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { BodyBoldText } from '~/framework/components/text';
import HtmlContentView from '~/ui/HtmlContentView';

const styles = StyleSheet.create({
  childrenContainer: {
    padding: UI_SIZES.spacing.minor,
    rowGap: UI_SIZES.spacing.minor,
  },
  containerBorder: {
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.card,
    borderWidth: UI_SIZES.border.thin,
  },
  descriptionContainer: {
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.small,
  },
  titleContainer: {
    alignItems: 'center',
    backgroundColor: theme.palette.primary.dark,
    borderTopLeftRadius: UI_SIZES.radius.card,
    borderTopRightRadius: UI_SIZES.radius.card,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  titleContainerFullRadius: {
    borderRadius: UI_SIZES.radius.card,
  },
  titleText: {
    color: theme.ui.text.inverse,
  },
});

interface IFormSectionCardProps {
  title: string;
  description?: string;
}

export class FormSectionCard extends React.PureComponent<React.PropsWithChildren<IFormSectionCardProps>> {
  public render() {
    const { children, description, title } = this.props;
    const hasContent = !!children || description;

    return (
      <View style={hasContent && styles.containerBorder}>
        <View style={[styles.titleContainer, !hasContent && styles.titleContainerFullRadius]}>
          <BodyBoldText style={styles.titleText}>{title}</BodyBoldText>
        </View>
        {description ? <HtmlContentView html={description} style={styles.descriptionContainer} /> : null}
        {children ? <View style={styles.childrenContainer}>{children}</View> : null}
      </View>
    );
  }
}

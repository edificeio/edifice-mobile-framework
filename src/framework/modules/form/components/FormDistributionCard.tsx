import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { ContentCardHeader, TouchableResourceCard } from '~/framework/components/card';
import { UI_SIZES } from '~/framework/components/constants';
import { SmallBoldText, SmallItalicText, SmallText } from '~/framework/components/text';
import { DistributionStatus } from '~/framework/modules/form/model';
import { IFormDistributions } from '~/framework/modules/form/screens/distribution-list/types';
import { ArticleContainer } from '~/ui/ContainerContent';

import { FormPicture } from './FormPicture';

const styles = StyleSheet.create({
  statusText: {
    alignSelf: 'flex-end',
    marginTop: -UI_SIZES.spacing.medium,
  },
});

interface IFormDistributionCardProps {
  formDistributions: IFormDistributions;
  onOpen: (item: IFormDistributions) => void;
}

export class FormDistributionCard extends React.PureComponent<IFormDistributionCardProps> {
  onPress = () => {
    const { formDistributions, onOpen } = this.props;
    onOpen(formDistributions);
  };

  renderStatusText = () => {
    const { formDistributions } = this.props;

    if (formDistributions.multiple) {
      const count = formDistributions.distributions.filter(
        distribution => distribution.status === DistributionStatus.FINISHED,
      ).length;
      const color = count ? theme.palette.status.success.regular : theme.palette.status.failure.regular;
      return (
        <SmallBoldText numberOfLines={1} style={[styles.statusText, { color }]}>
          {I18n.get('form-distributionlistscreen-formcard-answercount', { count })}
        </SmallBoldText>
      );
    }
    const { status, dateResponse } = formDistributions.distributions[0];
    const color = status === DistributionStatus.TO_DO ? theme.palette.status.failure.regular : theme.palette.status.success.regular;
    return (
      <SmallBoldText numberOfLines={1} style={[styles.statusText, { color }]}>
        {I18n.get(
          status === DistributionStatus.TO_DO
            ? 'form-distributionlistscreen-formcard-awaitingresponse'
            : 'form-distributionlistscreen-formcard-answerdate',
          {
            date: dateResponse?.format('DD/MM/YYYY, HH:mm'),
          },
        )}
      </SmallBoldText>
    );
  };

  public render() {
    const { formDistributions } = this.props;
    const { ownerName, picture, title } = formDistributions;
    const { dateSending } = formDistributions.distributions[0];
    return (
      <ArticleContainer>
        <TouchableResourceCard
          title={title}
          header={
            <ContentCardHeader
              icon={<FormPicture pictureUri={picture} />}
              text={
                <View>
                  <SmallText>{ownerName}</SmallText>
                  <SmallItalicText style={{ color: theme.ui.text.light }}>
                    {I18n.get('form-distributionlistscreen-formcard-sendingdate', {
                      date: dateSending?.format('DD/MM/YYYY, HH:mm'),
                    })}
                  </SmallItalicText>
                </View>
              }
            />
          }
          onPress={this.onPress}>
          {this.renderStatusText()}
        </TouchableResourceCard>
      </ArticleContainer>
    );
  }
}

import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { Moment } from 'moment';
import { Trans } from 'react-i18next';

import { I18n } from '~/app/i18n';
import { UI_SIZES } from '~/framework/components/constants';
import { BodyBoldText, BodyText, NestedBoldText } from '~/framework/components/text';
import { IGdprDelegate } from '~/framework/modules/form/model';

const styles = StyleSheet.create({
  bulletMargin: {
    marginLeft: UI_SIZES.spacing.small,
  },
  container: {
    rowGap: UI_SIZES.spacing.small,
  },
  listContentContainer: {
    rowGap: UI_SIZES.spacing.minor,
  },
});

interface GdprTextProps {
  date: Moment;
  delegates: IGdprDelegate[];
  goal: string;
}

export const GdprText = ({ date, delegates, goal }: GdprTextProps) => {
  const renderDelegate = ({ item }: { item: IGdprDelegate }) => {
    return (
      <View>
        <BodyText>
          <NestedBoldText>{'• ' + I18n.get('form-distribution-gdprtext-delegateentity', { entity: item.entity })}</NestedBoldText>
          {` (${item.mail})`}
        </BodyText>
        <BodyText style={styles.bulletMargin}>{item.address}</BodyText>
        <BodyText style={styles.bulletMargin}>{`${item.zipcode} ${item.city}`}</BodyText>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <BodyBoldText>{I18n.get('form-distribution-gdprtext-heading')}</BodyBoldText>
      <BodyText>
        <Trans
          i18nKey="form-distribution-gdprtext-description"
          values={{ date: date.format('L'), goal }}
          components={{ b: <NestedBoldText /> }}
        />
      </BodyText>
      <FlatList
        data={delegates}
        renderItem={renderDelegate}
        keyExtractor={i => i.id.toString()}
        contentContainerStyle={styles.listContentContainer}
      />
    </View>
  );
};

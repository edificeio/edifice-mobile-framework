import React from 'react';
import { StyleSheet, View } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';
import { FlashMessage } from '~/framework/modules/home/components/flash-message/card';
import { FlashMessagePlaceholder } from '~/framework/modules/home/components/flash-message/placeholder';

import { FlashMessageListProps } from './types';

export const FlashMessageList = React.memo(({ flashMessages, loading, onDismiss }: FlashMessageListProps) => {
  if (loading) return <FlashMessagePlaceholder />;
  if (!flashMessages.length) return null;

  return (
    <View style={styles.list}>
      {flashMessages.map(flashMessage => (
        <FlashMessage key={flashMessage.id} flashMessage={flashMessage} onDismiss={onDismiss} />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  list: {
    gap: UI_SIZES.spacing.small,
  },
});

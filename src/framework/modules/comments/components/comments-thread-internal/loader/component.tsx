import * as React from 'react';
import { View } from 'react-native';

import { Fade, Placeholder, PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import threadStyles from '~/framework/modules/comments/components/comments-thread-internal/styles.ts';

import styles, { LOADER_FORM_AVATAR_SIZE, LOADER_ITEM_AVATAR_SIZE } from './styles';

const AUTHOR_WIDTH = 60;
const ITEM_STYLE = [threadStyles.itemCommon, threadStyles.itemComment];
const ACTION_SHORT_STYLE = [styles.loaderItemAction, styles.loaderItemActionShort];
const ACTION_LONG_STYLE = [styles.loaderItemAction, styles.loaderItemActionLong];

export const CommentsThreadItemLoader = () => (
  <Placeholder Animation={Fade}>
    <View style={ITEM_STYLE}>
      <PlaceholderMedia isRound size={LOADER_ITEM_AVATAR_SIZE} />
      <View style={threadStyles.itemCommentContentWrapper}>
        <PlaceholderLine noMargin style={styles.loaderItemAuthor} width={AUTHOR_WIDTH} />
        <PlaceholderMedia style={styles.loaderItemContent} />
        <View style={styles.loaderItemActions}>
          <PlaceholderMedia style={ACTION_SHORT_STYLE} />
          <PlaceholderMedia style={ACTION_LONG_STYLE} />
        </View>
      </View>
    </View>
  </Placeholder>
);

/** `hasSendButton` mirrors the non-rich form layout. */
export const CommentsThreadAddFormLoaderContent = ({ hasSendButton = false }: { hasSendButton?: boolean }) => (
  <Placeholder Animation={Fade}>
    <View style={styles.loaderFormRow}>
      <PlaceholderMedia isRound size={LOADER_FORM_AVATAR_SIZE} />
      <PlaceholderMedia style={styles.loaderFormInput} />
      {hasSendButton && <PlaceholderMedia isRound size={LOADER_FORM_AVATAR_SIZE} />}
    </View>
  </Placeholder>
);

export const CommentsThreadAddFormLoader = ({ hasSendButton }: { hasSendButton?: boolean }) => (
  <View style={threadStyles.stickyCommentWrapper}>
    <CommentsThreadAddFormLoaderContent hasSendButton={hasSendButton} />
  </View>
);

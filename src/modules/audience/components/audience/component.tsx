import React from 'react';

import { useNavigation } from '~/app/navigation-new';
import { deleteReaction, postReaction, updateReaction } from '~/modules/audience/actions';
import { AudienceBar } from '~/modules/audience/components/audience-bar';
import { AudienceReactButton } from '~/modules/audience/components/audience-react-button';
import type { AudiencePoint, AudienceRect, AudienceResourceReactions } from '~/modules/audience/model';
import { usePlatformReactionTypes, useReactionPickerGestureStore } from '~/modules/audience/store';

import type { AudienceProps } from './types';

// The gesture goes to the reaction picker (`audience/react`) through the store: see `useReactionPickerGestureStore`.
const onGestureMove = (point: AudiencePoint) => useReactionPickerGestureStore.getState().move(point);
const onGestureRelease = () => useReactionPickerGestureStore.getState().release();

type Reactions = { total: number; types: string[]; userReaction: string | null };

const toReactions = (reactions: AudienceResourceReactions | undefined): Reactions => ({
  total: reactions?.totalReactionsCounter ?? 0,
  types: reactions?.reactionTypes ?? [],
  userReaction: reactions?.userReaction ?? null,
});

/**
 * The audience of a resource, for the modules that show it: its counters and the react button (`AudienceBar`).
 * Reacts to the resource, and opens the reactions, the views and the reaction picker (modals of `audience`).
 */
const Audience = ({
  containerStyle,
  infosReactions,
  isManager,
  nbComments,
  nbViews,
  preview,
  referer,
  session,
  showComments,
}: Readonly<AudienceProps>) => {
  const navigation = useNavigation();
  const validReactionTypes = usePlatformReactionTypes(session.platform.name);
  const [reactions, setReactions] = React.useState<Reactions>({ total: 0, types: [], userReaction: null });

  React.useEffect(() => {
    setReactions({
      total: infosReactions?.total ?? 0,
      types: infosReactions?.types ?? [],
      userReaction: infosReactions?.userReaction ?? null,
    });
  }, [infosReactions]);

  // Each action reloads the reactions to the resource. A failure is only logged, the bar stays as it was.
  const react = React.useCallback(async (action: () => Promise<AudienceResourceReactions | undefined>, name: string) => {
    try {
      setReactions(toReactions(await action()));
    } catch (e) {
      console.error(`[Audience] ${name} error :`, e);
    }
  }, []);

  const onDeleteReaction = React.useCallback(() => react(() => deleteReaction(referer), 'deleteReaction'), [react, referer]);
  const onPostReaction = React.useCallback(
    (reaction: string) => react(() => postReaction(referer, reaction), 'postReaction'),
    [react, referer],
  );
  const onUpdateReaction = React.useCallback(
    (reaction: string) => react(() => updateReaction(referer, reaction), 'updateReaction'),
    [react, referer],
  );

  const onPickReaction = React.useCallback(
    (anchor: AudienceRect) => {
      useReactionPickerGestureStore.getState().reset();
      return navigation.navigateAsync('audience/react', { anchor, reactionTypes: validReactionTypes ?? [] });
    },
    [navigation, validReactionTypes],
  );

  const onPressReactions = React.useCallback(() => navigation.navigate('audience/reactions', { referer }), [navigation, referer]);
  const onPressViews = React.useCallback(() => navigation.navigate('audience/views', { referer }), [navigation, referer]);

  return (
    <AudienceBar
      containerStyle={containerStyle}
      isManager={isManager}
      nbComments={nbComments}
      nbViews={nbViews}
      onPressReactions={onPressReactions}
      onPressViews={onPressViews}
      preview={preview}
      reactionTypes={reactions.types}
      showComments={showComments}
      totalReactions={reactions.total}
      userReaction={reactions.userReaction}
      validReactionTypes={validReactionTypes}>
      <AudienceReactButton
        onDeleteReaction={onDeleteReaction}
        onGestureMove={onGestureMove}
        onGestureRelease={onGestureRelease}
        onPickReaction={onPickReaction}
        onPostReaction={onPostReaction}
        onUpdateReaction={onUpdateReaction}
        userReaction={reactions.userReaction}
      />
    </AudienceBar>
  );
};

export default Audience;

import * as React from 'react';
import { Pressable, View } from 'react-native';

import FeedbackMenuButton from './button';
import styles from './styles';

import { I18n } from '~/app/i18n';
import IconButton from '~/framework/components/buttons/icon';
import SecondaryButton from '~/framework/components/buttons/secondary';
import { UI_SIZES } from '~/framework/components/constants';
import { SmallText } from '~/framework/components/text';
import { openUrl } from '~/framework/util/linking';

export type FeedbackMenuProps = {
  description: string;
  link: string;
};

const FeedbackMenu: React.FunctionComponent<FeedbackMenuProps> = ({ description, link }) => {
  const [isOpen, setOpen] = React.useState(false);

  const openMenu = () => setOpen(true);

  const closeMenu = () => setOpen(false);

  const openForm = () => openUrl(link);

  if (!link) return null;

  return isOpen ? (
    <>
      <Pressable style={styles.backdropContainer} onPress={closeMenu} />
      <View style={styles.mainContainer}>
        <FeedbackMenuButton isDisabled style={styles.buttonContainer} />
        <IconButton icon="ui-close" size={24} action={closeMenu} style={styles.closeButtonContainer} />
        <SmallText numberOfLines={4} style={{ marginBottom: UI_SIZES.spacing.medium, textAlign: 'center' }}>
          {description}
        </SmallText>
        <SecondaryButton text={I18n.get('homeworkassistance-home-feedbackmenu-action')} action={openForm} />
      </View>
    </>
  ) : (
    <FeedbackMenuButton action={openMenu} style={styles.floatingButtonContainer} />
  );
};

export default FeedbackMenu;

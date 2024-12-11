import * as React from 'react';
import { Pressable, View } from 'react-native';

import { I18n } from '~/app/i18n';
import IconButton from '~/framework/components/buttons/icon';
import SecondaryButton from '~/framework/components/buttons/secondary';
import { UI_SIZES } from '~/framework/components/constants';
import { SmallText } from '~/framework/components/text';
import { openUrl } from '~/framework/util/linking';

import FeedbackMenuButton from './button';
import styles from './styles';

export type FeedbackMenuProps = {
  formUrl: string;
};

const FeedbackMenu: React.FunctionComponent<FeedbackMenuProps> = ({ formUrl }) => {
  const [isOpen, setOpen] = React.useState(false);

  const openMenu = () => setOpen(true);

  const closeMenu = () => setOpen(false);

  const openForm = () => openUrl(formUrl);

  return isOpen ? (
    <>
      <Pressable style={styles.backdropContainer} onPress={closeMenu} />
      <View style={styles.mainContainer}>
        <FeedbackMenuButton isDisabled style={styles.buttonContainer} />
        <IconButton icon="ui-close" size={24} action={closeMenu} style={styles.closeButtonContainer} />
        <SmallText style={{ textAlign: 'center', marginBottom: UI_SIZES.spacing.medium }}>
          {I18n.get('homeworkassistance-home-feedbackmenu-content')}
        </SmallText>
        <SecondaryButton text={I18n.get('homeworkassistance-home-feedbackmenu-action')} action={openForm} />
      </View>
    </>
  ) : (
    <FeedbackMenuButton action={openMenu} style={styles.floatingButtonContainer} />
  );
};

export default FeedbackMenu;

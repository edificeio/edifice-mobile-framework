import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import styles from './styles';
import { IUserCardProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import TertiaryButton from '~/framework/components/buttons/tertiary';
import { cameraActionFm, galleryActionFm } from '~/framework/components/menus/actions';
import { MenuPickerActionFmProps } from '~/framework/components/menus/actions/types';
import BottomMenu from '~/framework/components/menus/bottom';
import { HeadingXSText, SmallBoldText } from '~/framework/components/text';
import { i18nAccountTypes } from '~/framework/components/text/account-type';
import moduleConfig from '~/framework/modules/user/module-config';
import { LocalFile } from '~/framework/util/fileHandler/models';
import Avatar, { Size } from '~/ui/avatars/Avatar';
import { IconButton } from '~/ui/IconButton';
import { Loading } from '~/ui/Loading';

export const UserCard = ({
  canEdit = false,
  displayName,
  hasAvatar,
  id,
  onChangeAvatar,
  onDeleteAvatar,
  onPressInlineButton,
  type,
  updatingAvatar,
}: IUserCardProps) => {
  const fns = [cameraActionFm, galleryActionFm];

  const renderActions = (avatar: boolean, changeAvatar?: (image: LocalFile) => void, deleteAvatar?: () => void) => {
    const attachOpts: MenuPickerActionFmProps = {
      callback: (file: LocalFile | LocalFile[]) => (updatingAvatar ? undefined : changeAvatar?.(file[0])),
      configOverride: {
        camera: { useFrontCamera: true },
      },
    };

    return (
      <View style={styles.buttonsActionAvatar}>
        {avatar ? (
          <>
            <BottomMenu
              title={I18n.get('user-usercard-bottommenu-changeavatar')}
              actions={fns.map(fn => fn(moduleConfig.name, 'avatar', attachOpts))}>
              <IconButton disabled={updatingAvatar} iconName="pencil" iconColor={theme.ui.text.inverse} iconSize={15} />
            </BottomMenu>
            <TouchableOpacity
              disallowInterruption
              onPress={() => (updatingAvatar ? null : deleteAvatar?.())}
              activeOpacity={updatingAvatar ? 1 : 0}>
              <IconButton disabled={updatingAvatar} iconName="trash" iconColor={theme.ui.text.inverse} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.viewNoAvatar} />
            <BottomMenu
              title={I18n.get('user-usercard-bottommenu-changeavatar')}
              actions={fns.map(fn => fn(moduleConfig.name, 'avatar', attachOpts))}>
              <IconButton disabled={updatingAvatar} iconName="camera-on" iconColor={theme.ui.text.inverse} iconSize={15} />
            </BottomMenu>
          </>
        )}
      </View>
    );
  };

  return (
    <View style={styles.main}>
      <View style={[styles.boxAvatar, { ...(canEdit ? styles.boxAvatarEdit : {}) }]}>
        <Avatar sourceOrId={id} size={Size.xxl} id="" />
        {canEdit ? renderActions(hasAvatar, onChangeAvatar, onDeleteAvatar) : null}
        {updatingAvatar ? <Loading customColor={theme.palette.grey.white} customStyle={styles.loaderAvatar} /> : null}
      </View>
      <View style={styles.boxTexts}>
        <HeadingXSText style={styles.name}>{displayName}</HeadingXSText>
        <SmallBoldText style={{ color: theme.color.profileTypes[type] }}>{I18n.get(i18nAccountTypes[type])}</SmallBoldText>
        {!canEdit ? (
          <TertiaryButton
            style={styles.sendMessage}
            iconLeft="ui-mail"
            text={I18n.get('user-profile-sendMessage')}
            action={onPressInlineButton}
          />
        ) : null}
      </View>
    </View>
  );
};

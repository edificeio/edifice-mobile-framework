import I18n from 'i18n-js';
import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { cameraAction, galleryAction } from '~/framework/components/menus/actions';
import BottomMenu from '~/framework/components/menus/bottom';
import { BodyBoldText, SmallText } from '~/framework/components/text';
import { IconButton } from '~/ui/IconButton';
import { Loading } from '~/ui/Loading';
import { Avatar, Size } from '~/ui/avatars/Avatar';

import styles from './styles';
import { IUserCardProps } from './types';

export const UserCard = ({
  id,
  displayName,
  type,
  canEdit = false,
  hasAvatar,
  updatingAvatar,
  onChangeAvatar,
  onDeleteAvatar,
}: IUserCardProps) => {
  const renderUserType = (userType: 'Student' | 'Relative' | 'Teacher' | 'Personnel' | 'Guest') => (
    <View style={styles.textType}>
      <View style={styles.roundColorType} key={userType} />
      <SmallText style={{ color: theme.ui.text.light }}>{I18n.t(`profileTypes.${userType}`)}</SmallText>
    </View>
  );

  const renderActions = (avatar: boolean, changeAvatar: (image) => void, deleteAvatar: () => void) => (
    <View style={styles.buttonsActionAvatar}>
      {avatar ? (
        <>
          <BottomMenu
            title={I18n.t('bottom-menu-change-avatar')}
            actions={[
              cameraAction({
                callback: image => (updatingAvatar ? undefined : changeAvatar(image)),
                useFrontCamera: true,
              }),
              galleryAction({ callback: image => (updatingAvatar ? undefined : changeAvatar(image)) }),
            ]}>
            <IconButton disabled={updatingAvatar} iconName="pencil" iconColor={theme.ui.text.inverse} iconSize={15} />
          </BottomMenu>
          <TouchableOpacity
            disallowInterruption
            onPress={() => (updatingAvatar ? null : deleteAvatar())}
            activeOpacity={updatingAvatar ? 1 : 0}>
            <IconButton disabled={updatingAvatar} iconName="trash" iconColor={theme.ui.text.inverse} />
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={styles.viewNoAvatar} />
          <BottomMenu
            title={I18n.t('bottom-menu-change-avatar')}
            actions={[
              cameraAction({
                callback: image => (updatingAvatar ? undefined : changeAvatar(image)),
                useFrontCamera: true,
              }),
              galleryAction({ callback: image => (updatingAvatar ? undefined : changeAvatar(image)) }),
            ]}>
            <IconButton disabled={updatingAvatar} iconName="camera-on" iconColor={theme.ui.text.inverse} iconSize={15} />
          </BottomMenu>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.main}>
      <View style={styles.boxAvatar}>
        <Avatar sourceOrId={id} size={Size.verylarge} id="" />
        {canEdit ? renderActions(hasAvatar, onChangeAvatar, onDeleteAvatar) : null}
        {updatingAvatar ? <Loading customColor={theme.palette.grey.white} customStyle={styles.loaderAvatar} /> : null}
      </View>
      <View style={styles.boxTexts}>
        <BodyBoldText>{displayName}</BodyBoldText>
        {Array.isArray(type) ? type.map(item => renderUserType(item)) : renderUserType(type)}
      </View>
    </View>
  );
};

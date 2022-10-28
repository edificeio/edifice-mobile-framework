import I18n from 'i18n-js';
import * as React from 'react';
import { View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/picture/Icon';
import { BodyBoldText, SmallText } from '~/framework/components/text';
import { ImagePicked, ImagePicker } from '~/infra/imagePicker';
import { IconButton } from '~/ui/IconButton';
import { Loading } from '~/ui/Loading';
import { Avatar, Size } from '~/ui/avatars/Avatar';

export interface IUserCardProps {
  touchable?: boolean;
  id: string;
  displayName: string;
  type: ('Student' | 'Relative' | 'Teacher' | 'Personnel' | 'Guest')[] | 'Student' | 'Relative' | 'Teacher' | 'Personnel' | 'Guest';
  canEdit: boolean;
  hasAvatar: boolean;
  updatingAvatar: boolean;
  onChangeAvatar?: (image: ImagePicked) => void;
  onDeleteAvatar?: () => void;
  onPress?: () => void;
}

export const UserCard = ({
  touchable = false,
  id,
  displayName,
  type,
  canEdit = false,
  hasAvatar,
  updatingAvatar,
  onChangeAvatar,
  onDeleteAvatar,
  onPress = () => {},
}: IUserCardProps) => {
  const WrapperComponent = touchable ? TouchableOpacity : View;

  const renderUserType = (type: 'Student' | 'Relative' | 'Teacher' | 'Personnel' | 'Guest') => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
      }}>
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          marginRight: UI_SIZES.spacing.tiny,
          backgroundColor: theme.color.profileTypes[type] || theme.palette.grey.fog,
        }}
        key={type}
      />
      <SmallText style={{ color: theme.ui.text.light }}>{I18n.t(`profileTypes.${type}`)}</SmallText>
    </View>
  );

  const renderActions = (hasAvatar: boolean, onChangeAvatar: (image: ImagePicked) => void, onDeleteAvatar) => (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        left: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
      }}>
      {hasAvatar ? (
        <ImagePicker
          callback={image => (updatingAvatar ? null : onChangeAvatar(image))}
          activeOpacity={updatingAvatar ? 1 : 0}
          cameraOptions={{ cameraType: 'front' }}>
          <IconButton disabled={updatingAvatar} iconName="pencil" iconColor={theme.ui.text.inverse} iconSize={15} />
        </ImagePicker>
      ) : (
        <View style={{ height: 30, width: 30 }} />
      )}
      {hasAvatar ? (
        <TouchableOpacity
          disallowInterruption
          onPress={() => (updatingAvatar ? null : onDeleteAvatar())}
          activeOpacity={updatingAvatar ? 1 : 0}>
          <IconButton disabled={updatingAvatar} iconName="trash" iconColor={theme.ui.text.inverse} />
        </TouchableOpacity>
      ) : (
        <ImagePicker
          callback={image => (updatingAvatar ? null : onChangeAvatar(image))}
          activeOpacity={updatingAvatar ? 1 : 0}
          cameraOptions={{ cameraType: 'front' }}>
          <IconButton disabled={updatingAvatar} iconName="camera-on" iconColor={theme.ui.text.inverse} iconSize={15} />
        </ImagePicker>
      )}
    </View>
  );

  return (
    <WrapperComponent
      style={{
        alignItems: 'center',
        backgroundColor: theme.ui.background.card,
        flex: 0,
        flexDirection: 'row',
        flexGrow: 0,
        justifyContent: 'flex-start',
        padding: UI_SIZES.spacing.medium,
        width: '100%',
        borderBottomWidth: 1,
        borderColor: theme.palette.grey.cloudy,
      }}
      onPress={onPress}>
      <View style={{ padding: UI_SIZES.spacing.small, alignItems: 'center', justifyContent: 'center' }}>
        <Avatar sourceOrId={id} size={Size.verylarge} />
        {canEdit ? renderActions(hasAvatar, onChangeAvatar, onDeleteAvatar) : null}
        {updatingAvatar ? (
          <Loading
            customColor={theme.palette.grey.white}
            customStyle={{ position: 'absolute', paddingTop: UI_SIZES.spacing.minor, paddingLeft: UI_SIZES.spacing.tiny }}
          />
        ) : null}
      </View>
      <View
        style={{
          flexGrow: 0,
          flexShrink: 1,
          marginRight: 'auto',
          paddingLeft: UI_SIZES.spacing.medium,
        }}>
        <BodyBoldText>{displayName}</BodyBoldText>
        {Array.isArray(type) ? type.map(item => renderUserType(item)) : renderUserType(type)}
      </View>
      {touchable ? <Icon name="arrow_down" color={theme.ui.text.light} style={{ transform: [{ rotate: '270deg' }] }} /> : undefined}
    </WrapperComponent>
  );
};

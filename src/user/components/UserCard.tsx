import I18n from 'i18n-js';
import * as React from 'react';
import { View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/picture/Icon';
import { Text, TextBold, TextColorStyle, TextSizeStyle } from '~/framework/components/text';
import { ImagePicked, ImagePicker } from '~/infra/imagePicker';
import { CommonStyles } from '~/styles/common/styles';
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
          backgroundColor: CommonStyles.profileTypes[type] || CommonStyles.lightGrey,
        }}
        key={type}
      />
      <Text style={{ ...TextColorStyle.Light, ...TextSizeStyle.Small }}>{I18n.t(`profileTypes.${type}`)}</Text>
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
          <IconButton disabled={updatingAvatar} iconName="pencil" iconColor={CommonStyles.white} iconSize={15} />
        </ImagePicker>
      ) : (
        <View style={{ height: 30, width: 30 }} />
      )}
      {hasAvatar ? (
        <TouchableOpacity
          disallowInterruption
          onPress={() => (updatingAvatar ? null : onDeleteAvatar())}
          activeOpacity={updatingAvatar ? 1 : 0}>
          <IconButton disabled={updatingAvatar} iconName="trash" iconColor={CommonStyles.white} />
        </TouchableOpacity>
      ) : (
        <ImagePicker
          callback={image => (updatingAvatar ? null : onChangeAvatar(image))}
          activeOpacity={updatingAvatar ? 1 : 0}
          cameraOptions={{ cameraType: 'front' }}>
          <IconButton disabled={updatingAvatar} iconName="camera-on" iconColor={CommonStyles.white} iconSize={15} />
        </ImagePicker>
      )}
    </View>
  );

  return (
    <WrapperComponent
      style={{
        alignItems: 'center',
        backgroundColor: 'white',
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
            customColor="white"
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
        <TextBold>{displayName}</TextBold>
        {Array.isArray(type) ? type.map(item => renderUserType(item)) : renderUserType(type)}
      </View>
      {touchable ? (
        <Icon name="arrow_down" color={theme.legacy.neutral.regular} style={{ transform: [{ rotate: '270deg' }] }} />
      ) : undefined}
    </WrapperComponent>
  );
};

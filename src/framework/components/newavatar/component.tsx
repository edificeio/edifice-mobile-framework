import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { connect } from 'react-redux';

import { UI_SIZES } from '../constants';
import styles, { NewAvatarSizes } from './styles';
import { AvatarSize, NewAvatarProps } from './types';

import { getSession } from '~/framework/modules/auth/reducer';
import { FastImage } from '~/framework/util/media';

const NewAvatar = (props: NewAvatarProps) => {
  const noAvatarImage = require('ASSETS/images/no-avatar.png');
  const size = props.size ? NewAvatarSizes[props.size] : NewAvatarSizes[AvatarSize.md];
  const sizeContainer = React.useMemo(() => (props.border ? size + UI_SIZES.border.small * 2 : size), [props.border, size]);

  const renderSource = React.useMemo(() => {
    if (props.source) return props.source;
    if (props.userId && props.session) {
      return {
        uri: `${props.session.platform.url}/userbook/avatar/${props.userId}?thumbnail=150x150`,
      };
    }
    return noAvatarImage;
  }, [props.source, props.userId, props.session, noAvatarImage]);

  const sizeStyles: any = {
    aspectRatio: 1,
    borderRadius: size / 2,
    width: size,
  };

  const sizeBorderStyles: any = React.useMemo(
    () => ({
      borderRadius: sizeContainer / 2,
      width: sizeContainer,
    }),
    [sizeContainer],
  );

  const sizeContainerStyles: any = React.useMemo(
    () => ({
      height: sizeContainer,
      width: sizeContainer,
    }),
    [sizeContainer],
  );

  const renderBorder = React.useCallback(() => {
    if (!props.border) return null;
    return <View style={[styles.border, sizeBorderStyles]} />;
  }, [props.border, sizeBorderStyles]);

  const Component = props.onPress ? TouchableOpacity : View;

  return (
    <Component onPress={props.onPress} style={[styles.container, sizeContainerStyles]}>
      {renderBorder()}
      <FastImage style={[styles.pic, sizeStyles]} source={renderSource} />
    </Component>
  );
};

const mapStateToProps = () => ({
  session: getSession(),
});

export default connect(mapStateToProps)(NewAvatar);

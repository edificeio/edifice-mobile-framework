import * as React from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';
import { getSession } from '~/framework/modules/auth/reducer';
import { FastImage } from '~/framework/util/media';
import { NewAvatarSizes } from './styles';
import { AvatarSize, NewAvatarProps } from './types';

const NewAvatar = (props: NewAvatarProps) => {
  const noAvatarImage = require('ASSETS/images/no-avatar.png');
  const size = props.size ? NewAvatarSizes[props.size] : NewAvatarSizes[AvatarSize.md];

  const renderSource = React.useMemo(() => {
    if (props.source) return props.source;
    if (props.userId && props.session) {
      return {
        uri: `${props.session.platform.url}/userbook/avatar/${props.userId}?thumbnail=150x150`,
      };
    }
    return noAvatarImage;
  }, [props.source, props.userId, props.session]);

  const sizeStyles: any = {
    width: size,
    aspectRatio: 1,
    borderRadius: size / 2,
  };

  return (
    <View>
      <FastImage style={sizeStyles} source={renderSource} />
    </View>
  );
};

const mapStateToProps = () => ({
  session: getSession(),
});

export default connect(mapStateToProps)(NewAvatar);

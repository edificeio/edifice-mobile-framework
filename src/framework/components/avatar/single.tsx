import * as React from 'react';
import { Image, ImageProps, StyleSheet, View } from 'react-native';

import {
  CommonSingleAvatarProps,
  SingleAvatarOnlySpecificProps,
  SingleAvatarProps,
  SingleAvatarUnknownSpecificProps,
  SingleDefaultAvatarProps,
  SingleGroupAvatarProps,
  SingleSourceAvatarProps,
  SingleSourceAvatarSpecificProps,
  SingleSvgAvatarProps,
  SingleUserAvatarSpecificProps,
} from './types';

import theme from '~/app/theme';
import styles, { AvatarSizes } from '~/framework/components/avatar/styles';
import { UI_SIZES } from '~/framework/components/constants';
import { AuthActiveAccount, AuthSavedAccount } from '~/framework/modules/auth/model';
import appConf, { Platform } from '~/framework/util/appConf';
import { urlSigner } from '~/infra/oauth';

const useAvatarStyle = (props: Pick<SingleAvatarProps, 'size' | 'style'>) => {
  return React.useMemo(
    () => [
      props.style,
      {
        backgroundColor: theme.ui.background.card,
        borderColor: theme.palette.grey.white,
        borderRadius: AvatarSizes[props.size] / 2 + UI_SIZES.border.small * 2,
        borderWidth: UI_SIZES.border.small,
        height: AvatarSizes[props.size] + UI_SIZES.border.small * 2,
        margin: -UI_SIZES.border.small,
        overflow: 'hidden' as const,
        width: AvatarSizes[props.size] + UI_SIZES.border.small * 2,
      },
    ],
    [props.size, props.style],
  );
};

const fallbackSource: ImageProps['source'] = require('ASSETS/images/no-avatar.png');

export const buildRelativeUserAvatarUrl = (id: string) => `/userbook/avatar/${id}?thumbnail=100x100`;
export const buildAbsoluteUserAvatarUrl = (id: string) => urlSigner.getAbsoluteUrl(buildRelativeUserAvatarUrl(id));
export const buildAbsoluteUserAvatarUrlWithPlatform = (id: string, platform?: Platform) =>
  platform ? urlSigner.getAbsoluteUrl(buildRelativeUserAvatarUrl(id), platform) : undefined;
export const buildAvatarSourceForAccount = (account: AuthSavedAccount | AuthActiveAccount) => {
  const uri = buildAbsoluteUserAvatarUrlWithPlatform(account.user.id, appConf.getExpandedPlatform(account.platform));
  return uri
    ? {
        uri,
      }
    : undefined;
};

const isUserAvatar = (props: SingleAvatarOnlySpecificProps): props is SingleUserAvatarSpecificProps =>
  (props as Partial<SingleUserAvatarSpecificProps>).userId !== undefined;
const isSourceAvatar = (props: SingleAvatarOnlySpecificProps): props is SingleSourceAvatarSpecificProps =>
  (props as Partial<SingleSourceAvatarSpecificProps>).source !== undefined;
// const isSvgAvatar = (props: SingleAvatarOnlySpecificProps): props is SingleSvgAvatarSpecificProps =>
//   (props as Partial<SingleSvgAvatarSpecificProps>).svg !== undefined;
// const isGroupAvatar = (props: SingleAvatarOnlySpecificProps): props is SingleGroupAvatarSpecificProps =>
//   (props as Partial<SingleGroupAvatarSpecificProps>).group === true;

const commonSourceAttributes: ImageProps['source'] = {};

const getAvatarImage = (props: SingleAvatarOnlySpecificProps, error: boolean): ImageProps['source'] => {
  if (error) return fallbackSource;
  try {
    if (isUserAvatar(props)) {
      return { uri: buildAbsoluteUserAvatarUrl(props.userId), ...commonSourceAttributes };
    } else if (isSourceAvatar(props)) {
      const { source } = props;
      if (typeof source === 'number') {
        return source;
      } else {
        return { headers: source.headers, uri: source.uri, ...commonSourceAttributes };
      }
    } else {
      return fallbackSource;
    }
  } catch {
    return fallbackSource;
  }
};

const useAvatarImage = <SpecificProps extends SingleAvatarOnlySpecificProps>(
  props: SpecificProps,
  error: boolean,
): ImageProps['source'] =>
  React.useMemo(
    () => getAvatarImage(props, error),
    // Here we memo on only specific props that can issue to image changes, without rebuild the object.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      // eslint-disable-next-line react-hooks/exhaustive-deps
      (props as SingleAvatarUnknownSpecificProps).group,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      (props as SingleAvatarUnknownSpecificProps).source,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      (props as SingleAvatarUnknownSpecificProps).svg,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      (props as SingleAvatarUnknownSpecificProps).userId,
      error,
    ],
  );

const removeAvatarSpecificProps = (props: SingleAvatarProps): CommonSingleAvatarProps => {
  const { group, id, source, svg, ...commonProps } = props as SingleAvatarProps &
    SingleSourceAvatarProps &
    SingleSvgAvatarProps &
    SingleDefaultAvatarProps &
    SingleGroupAvatarProps;
  return commonProps;
};

export function SingleAvatar(props: SingleAvatarProps) {
  const { overlay, size, style, ...otherProps } = removeAvatarSpecificProps(props);

  const [error, setError] = React.useState(false);
  const onError = React.useCallback(() => {
    setError(true);
  }, []);

  const computedStyle = useAvatarStyle({ size, style });
  const imageSource = useAvatarImage(props as SingleAvatarOnlySpecificProps, error);
  return overlay ? (
    <View style={computedStyle}>
      <Image style={StyleSheet.absoluteFill} source={imageSource} onError={onError} {...otherProps} />
      <View style={styles.overlay}>{overlay}</View>
    </View>
  ) : (
    <Image style={computedStyle} source={imageSource} onError={onError} {...otherProps} />
  );
}

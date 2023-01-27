import * as React from 'react';
import { View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { NamedSVG } from '~/framework/components/picture';
import { SmallText } from '~/framework/components/text';

import style from './style';
import { AlertCardProps } from './type';

const defaultIconNames: { [type in AlertCardProps['type']]: string } = {
  info: 'ui-infoCircle',
  success: 'ui-infoCircle',
  warning: 'ui-infoCircle',
  failure: 'ui-infoCircle',
};

export default function AlertCard(props: AlertCardProps) {
  const externalViewStyle = React.useMemo(
    () => ({ ...style.externalView, borderLeftColor: theme.palette.status[props.type].regular, ...props.style }),
    [props.type, props.style],
  );

  const internalViewStyle = React.useMemo(
    () => ({ ...style.internalView, borderColor: theme.palette.status[props.type].pale }),
    [props.type],
  );

  const icon = React.useMemo(
    () =>
      props.icon === false ? null : props.icon === true || props.icon === undefined ? (
        <NamedSVG
          name={defaultIconNames[props.type]}
          fill={theme.palette.status[props.type].regular}
          width={UI_SIZES.elements.icon}
          height={UI_SIZES.elements.icon}
          style={style.iconView}
        />
      ) : (
        <View style={style.iconView}>{props.icon}</View>
      ),
    [props.type, props.icon],
  );

  const content = React.useMemo(
    () =>
      props.text ? (
        <SmallText style={style.contentView}>{props.text}</SmallText>
      ) : (
        <View style={style.contentView}>{props.children}</View>
      ),
    [props.children, props.text],
  );

  return (
    // Must use 2 <View> in order to cancel borderWidth + borderRadius natural smooth transition
    <View style={externalViewStyle}>
      <View style={internalViewStyle}>
        {icon}
        {content}
      </View>
    </View>
  );
}

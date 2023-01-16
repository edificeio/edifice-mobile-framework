import styled from '@emotion/native';
import I18n from 'i18n-js';
import * as React from 'react';
import * as ReactIs from 'react-is';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/picture/Icon';
import { SmallText } from '~/framework/components/text';
import TouchableOpacity from '~/ui/CustomTouchableOpacity';

import styles from './styles';

export const ContainerView = styled.View({
  alignItems: 'center',
  flexDirection: 'row',
  backgroundColor: theme.ui.background.card,
  borderBottomWidth: 1,
  borderColor: theme.palette.grey.cloudy,
  height: 46,
  justifyContent: 'flex-start',
  paddingHorizontal: UI_SIZES.spacing.medium,
});

export const ContainerTextInput = styled.TextInput({
  alignItems: 'center',
  flexDirection: 'row',
  backgroundColor: theme.ui.background.card,
  borderBottomWidth: 1,
  borderColor: theme.palette.grey.cloudy,
  height: 46,
  justifyContent: 'flex-start',
  padding: UI_SIZES.spacing.medium,
});

export const ButtonLine = ({
  onPress,
  title,
  first = false,
  last = false,
  alone = false,
}: {
  onPress: () => any;
  title: string;
  first?: boolean;
  last?: boolean;
  alone?: boolean;
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, first ? styles.containerFirst : last ? styles.containerLast : alone ? styles.containerAlone : null]}
      onPress={() => onPress()}>
      <SmallText style={styles.buttonLine_text}>{I18n.t(title)}</SmallText>
      <Icon name="arrow_down" color={theme.palette.primary.regular} style={styles.buttonLine_icon} />
    </TouchableOpacity>
  );
};

export const ButtonLineGroup = ({
  children,
  allowFirst = true,
  allowLast = true,
  allowAlone = true,
}: React.PropsWithChildren & { allowFirst?: boolean; allowLast?: boolean; allowAlone?: boolean }) => {
  const childrenAsArray = React.Children.toArray(children); // We use `childrenAsArray` instead of `count` to ignore empty/null/undefined nodes.
  const mapFunction = (node: Parameters<Parameters<typeof childrenAsArray.map>[0]>[0], index: number) => {
    if (ReactIs.isFragment(node)) {
      return (
        <ButtonLineGroup
          allowFirst={index === 0}
          allowLast={index === childrenAsArray.length - 1}
          allowAlone={childrenAsArray.length === 1}>
          {/* must cast this as ReactElement becasue ReactFragment type doesn't allow props (even though props does exist)*/}
          {(node as React.ReactElement).props.children}
        </ButtonLineGroup>
      );
    } else if (ReactIs.isElement(node)) {
      return (
        <ButtonLine
          {...((node as React.ReactElement).props ?? {})}
          first={allowFirst && (childrenAsArray.length > 1 || !allowAlone) && index === 0}
          last={allowLast && (childrenAsArray.length > 1 || !allowAlone) && index === childrenAsArray.length - 1}
          alone={allowAlone && childrenAsArray.length === 1}
        />
      );
    } else return node;
  };
  return <>{childrenAsArray.map(mapFunction)}</>;
};

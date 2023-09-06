import styled from '@emotion/native';
import * as React from 'react';
import * as ReactIs from 'react-is';
import { ActivityIndicator, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import styles from '~/framework/components/buttons/line/styles';
import { UI_SIZES } from '~/framework/components/constants';
import { NamedSVG } from '~/framework/components/picture';
import { SmallText } from '~/framework/components/text';
import TouchableOpacity from '~/ui/CustomTouchableOpacity';

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

export const LineButton = ({
  onPress,
  title,
  first = false,
  last = false,
  alone = false,
  disabled = false,
  loading = false,
}: {
  onPress: () => any;
  title: string;
  first?: boolean;
  last?: boolean;
  alone?: boolean;
  disabled?: boolean;
  loading?: boolean;
}) => {
  return (
    <TouchableOpacity onPress={() => onPress()} disabled={loading || disabled}>
      <View
        style={[
          styles.container,
          first ? styles.containerFirst : last ? styles.containerLast : alone ? styles.containerAlone : null,
        ]}>
        <SmallText style={styles.lineButtonText} numberOfLines={1}>
          {I18n.get(title)}
        </SmallText>
        {loading ? (
          <ActivityIndicator color={theme.palette.primary.regular} size={UI_SIZES.dimensions.width.mediumPlus} />
        ) : (
          <NamedSVG
            name="ui-rafterRight"
            width={UI_SIZES.dimensions.width.mediumPlus}
            height={UI_SIZES.dimensions.width.mediumPlus}
            fill={theme.palette.primary.regular}
          />
        )}
      </View>
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
        <LineButton
          {...((node as React.ReactElement).props ?? {})}
          first={allowFirst && (childrenAsArray.length > 1 || !allowAlone) && index === 0}
          last={allowLast && (childrenAsArray.length > 1 || !allowAlone) && index === childrenAsArray.length - 1}
          alone={allowAlone && childrenAsArray.length === 1}
          key={(node as React.ReactElement).key}
        />
      );
    } else return node;
  };
  return <>{childrenAsArray.map(mapFunction)}</>;
};

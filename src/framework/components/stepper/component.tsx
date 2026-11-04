import * as React from 'react';
import { ColorValue, View } from 'react-native';

import { FlashList, FlashListProps } from '@shopify/flash-list';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg, SvgIconName } from '~/framework/components/picture';
import { BodyBoldText } from '~/framework/components/text';

import styles from './styles';

export interface StepperSection<ItemT> {
  key: string;
  title: string;
  color: ColorValue;
  icon?: SvgIconName;
  data: readonly ItemT[];
}

export interface StepperRenderItemInfo<ItemT> {
  item: ItemT;
  index: number;
  section: StepperSection<ItemT>;
}

type StepperRow<ItemT> =
  | { type: 'header'; section: StepperSection<ItemT> }
  | { type: 'item'; item: ItemT; index: number; isLast: boolean; section: StepperSection<ItemT> };

export type StepperProps<ItemT> = Omit<
  FlashListProps<StepperRow<ItemT>>,
  'data' | 'getItemType' | 'keyExtractor' | 'renderItem'
> & {
  sections: readonly StepperSection<ItemT>[];
  renderItem: (info: StepperRenderItemInfo<ItemT>) => React.ReactElement | null;
  keyExtractor?: (item: ItemT, index: number) => string;
};

function StepHeader<ItemT>({ section }: Readonly<{ section: StepperSection<ItemT> }>) {
  return (
    <View style={styles.row}>
      <View style={styles.track}>
        <View style={[styles.iconContainer, { backgroundColor: section.color }]}>
          {section.icon ? (
            <Svg
              name={section.icon}
              fill={theme.palette.grey.darkness}
              width={UI_SIZES.elements.icon.xsmall}
              height={UI_SIZES.elements.icon.xsmall}
            />
          ) : null}
        </View>
        <View style={[styles.stepLine, { backgroundColor: section.color }]} />
      </View>
      <View style={[styles.header, section.data.length ? null : styles.stepEnd]}>
        <BodyBoldText style={styles.title}>{section.title}</BodyBoldText>
      </View>
    </View>
  );
}

function StepItem({ children, color, isLast }: Readonly<React.PropsWithChildren<{ color: ColorValue; isLast: boolean }>>) {
  return (
    <View style={styles.row}>
      <View style={styles.track}>
        <View style={[styles.stepLine, { backgroundColor: color }]} />
      </View>
      <View style={[styles.item, isLast ? styles.stepEnd : null]}>{children}</View>
    </View>
  );
}

const getRowType = <ItemT,>(row: StepperRow<ItemT>) => row.type;

export function Stepper<ItemT>({ keyExtractor, renderItem, sections, ...listProps }: Readonly<StepperProps<ItemT>>) {
  const rows = React.useMemo(
    () =>
      sections.flatMap<StepperRow<ItemT>>(section => [
        { section, type: 'header' },
        ...section.data.map((item, index) => ({
          index,
          isLast: index === section.data.length - 1,
          item,
          section,
          type: 'item' as const,
        })),
      ]),
    [sections],
  );

  const rowKeyExtractor = React.useCallback(
    (row: StepperRow<ItemT>) => {
      if (row.type === 'header') return row.section.key;
      const itemKey = keyExtractor ? keyExtractor(row.item, row.index) : row.index;
      return `${row.section.key}-${itemKey}`;
    },
    [keyExtractor],
  );

  const renderRow = React.useCallback(
    ({ item: row }: { item: StepperRow<ItemT> }) =>
      row.type === 'header' ? (
        <StepHeader section={row.section} />
      ) : (
        <StepItem color={row.section.color} isLast={row.isLast}>
          {renderItem({ index: row.index, item: row.item, section: row.section })}
        </StepItem>
      ),
    [renderItem],
  );

  return <FlashList {...listProps} data={rows} getItemType={getRowType} keyExtractor={rowKeyExtractor} renderItem={renderRow} />;
}

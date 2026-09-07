import * as React from 'react';
import { View } from 'react-native';

import { CaptionBoldText, SmallBoldText, SmallText } from '~/framework/components/text';
import { extractTextFromHtml } from '~/framework/util/htmlParser/content';

import styles from './styles';
import { CarnetDeBordDetailListProps, CarnetDeBordDetailRowProps } from './types';

function Row({ item, separated }: Readonly<CarnetDeBordDetailRowProps>) {
  return (
    <View style={[styles.row, separated && styles.rowSeparated]}>
      <View style={styles.rowText}>
        {item.title ? <SmallBoldText numberOfLines={1}>{item.title}</SmallBoldText> : null}
        {item.date ? (
          <CaptionBoldText style={styles.date} numberOfLines={1}>
            {item.date}
          </CaptionBoldText>
        ) : null}
        {item.label ? <SmallBoldText numberOfLines={1}>{item.label}</SmallBoldText> : null}
        {item.description ? <SmallText numberOfLines={1}>{extractTextFromHtml(item.description)}</SmallText> : null}
      </View>
      {item.value ? (
        <SmallText numberOfLines={2} style={styles.rowValue}>
          {item.value}
        </SmallText>
      ) : null}
    </View>
  );
}

export function CarnetDeBordDetailList({ items, style }: Readonly<CarnetDeBordDetailListProps>) {
  return (
    <View style={[styles.list, style]}>
      {items.map((item, index) => (
        <Row key={item?.date} item={item} separated={index + 1 < items.length} />
      ))}
    </View>
  );
}

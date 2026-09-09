import * as React from 'react';
import { View } from 'react-native';

import Separator from '~/framework/components/separator';
import { CaptionBoldText, SmallBoldText, SmallText } from '~/framework/components/text';
import { extractTextFromHtml } from '~/framework/util/htmlParser/content';

import styles from './styles';
import { CarnetDeBordDetailListProps, CarnetDeBordDetailRowProps } from './types';

function Row({ item }: Readonly<CarnetDeBordDetailRowProps>) {
  return (
    <View style={styles.row}>
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
        <React.Fragment key={item?.date}>
          {index > 0 ? <Separator /> : null}
          <Row item={item} />
        </React.Fragment>
      ))}
    </View>
  );
}

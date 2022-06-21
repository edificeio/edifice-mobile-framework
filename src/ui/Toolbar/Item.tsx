import I18n from 'i18n-js';
import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { FakeHeader_Row, HeaderTitle } from '~/framework/components/header';
import { Icon } from '~/framework/components/picture/Icon';
import { DEVICE_WIDTH, layoutSize } from '~/styles/common/layoutSize';
import { CommonStyles } from '~/styles/common/styles';
import { EVENT_TYPE } from '~/types';

const styles = StyleSheet.create({
  headerTitleStyle: {
    color: theme.ui.text.inverse,
    fontFamily: CommonStyles.primaryFontFamily,
    fontSize: layoutSize.LAYOUT_15,
    fontWeight: '400',
    textAlign: 'center',
  },
  nbSelected: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: layoutSize.LAYOUT_42,
  },
  nbSelectedText: {
    color: theme.ui.text.inverse,
    fontSize: layoutSize.LAYOUT_16,
    fontWeight: 'bold',
  },
  separator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
    flexShrink: 1,
  },
  textWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    width: DEVICE_WIDTH() - layoutSize.LAYOUT_140,
  },
  touchPanel: {
    justifyContent: 'center',
    alignItems: 'center',
    width: layoutSize.LAYOUT_58,
  },
});

const Item = ({ onEvent, item, navigation, selected, readonly }: any) => {
  const { writeAccess, icon, id, options = {} } = item;
  let disable = (options.monoselection && selected && selected.length !== 1) || (readonly && writeAccess);
  const isFolder = (selected && selected.filter(item => item.isFolder)) || [];

  disable = disable || (isFolder.length && options.onlyFiles);

  if (id === 'nbSelected') {
    return (
      <FakeHeader_Row>
        <HeaderTitle>{selected.length}</HeaderTitle>
      </FakeHeader_Row>
    );
  }

  if (id === 'title') {
    return (
      <FakeHeader_Row>
        <HeaderTitle>{navigation.getParam('title') || I18n.t('workspace')}</HeaderTitle>
      </FakeHeader_Row>
    );
  }

  if (id === 'separator') {
    return <View style={styles.separator} />;
  }

  if (id === 'empty') {
    return <View style={styles.touchPanel} />;
  }

  return (
    <TouchableOpacity
      style={styles.touchPanel}
      onPress={() => (disable ? null : onEvent && onEvent({ type: EVENT_TYPE.MENU_SELECT, id: item.id, item }))}>
      <Icon color={disable ? '#77777750' : theme.ui.text.inverse} size={layoutSize.LAYOUT_24} name={icon} />
    </TouchableOpacity>
  );
};

export default Item;

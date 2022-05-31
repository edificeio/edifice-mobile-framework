import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { FlatList, TouchableOpacity, TouchableWithoutFeedback } from 'react-native-gesture-handler';

import { UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/picture/Icon';
import { Text } from '~/framework/components/text';
import { CommonStyles } from '~/styles/common/styles';

const styles = StyleSheet.create({
  overlayActions: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: UI_SIZES.screen.topInset,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
  modal: {
    width: '100%',
    height: '100%',
  },
  actions: {
    backgroundColor: '#ffffff',
    position: 'absolute',
    right: 0,
    top: 60,
    zIndex: 10,
    borderRadius: 4,
  },
  buttonContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  icon: {
    marginRight: 10,
  },
  separator: {
    borderBottomColor: CommonStyles.borderColorVeryLighter,
    borderBottomWidth: 1,
    width: '100%',
  },
});

type MailContentMenuProps = {
  data: {
    text: string;
    icon: string;
    onPress: () => any;
  }[];
  onClickOutside: () => any;
  show: boolean;
  newMailStyle?;
};

export default class MailContentMenu extends React.PureComponent<MailContentMenuProps> {
  public render() {
    const { onClickOutside, show, data, newMailStyle } = this.props;
    if (!show) return <></>;
    return (
      <View style={[styles.overlayActions, newMailStyle]}>
        <View style={styles.shadow}>
          <TouchableWithoutFeedback style={styles.modal} onPress={onClickOutside}>
            <FlatList
              style={[styles.actions, newMailStyle]}
              data={data}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={item.onPress}>
                  <View style={styles.buttonContentContainer}>
                    <Icon name={item.icon} size={22} style={styles.icon} />
                    <Text>{item.text}</Text>
                  </View>
                </TouchableOpacity>
              )}
              refreshing={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </TouchableWithoutFeedback>
        </View>
      </View>
    );
  }
}

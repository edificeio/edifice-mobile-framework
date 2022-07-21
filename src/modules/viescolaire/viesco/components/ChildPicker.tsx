import I18n from 'i18n-js';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { IChild, IChildArray } from '~/modules/viescolaire/viesco/state/children';
import Dropdown from '~/ui/Dropdown';

const styles = StyleSheet.create({
  shadow: {
    elevation: 20,
    shadowColor: theme.ui.shadowColor,
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },
  container: {
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
    backgroundColor: theme.palette.grey.white,
    zIndex: 100,
  },
  innerContainer: {
    paddingTop: UI_SIZES.spacing.small,
    paddingBottom: UI_SIZES.spacing.medium,
    paddingHorizontal: UI_SIZES.spacing.small,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});

export interface ChildPickerProps {
  selectedChildId: string;
  childrenArray: IChildArray;
  selectChild: (t: string) => void;
}

export default class ChildPicker extends React.PureComponent<ChildPickerProps> {
  public render() {
    const { selectedChildId, childrenArray, selectChild, children } = this.props;

    const dropdown = (
      <Dropdown
        data={childrenArray}
        value={selectedChildId}
        onSelect={(child: string) => {
          if (child !== selectedChildId) {
            selectChild(child);
          }
        }}
        title={I18n.t('viesco-pickChild')}
        keyExtractor={item => item.id}
        renderItem={(item: IChild) => item.lastName + ' ' + item.firstName}
      />
    );

    const wrappedChildren = React.Children.map([dropdown, ...React.Children.toArray(children)], child =>
      React.cloneElement(child as React.ReactElement<any>, { style: [child.props.style, { margin: UI_SIZES.spacing.tiny }] }),
    );

    return (
      <View style={[styles.container, styles.shadow]}>
        <View style={styles.innerContainer}>{wrappedChildren}</View>
      </View>
    );
  }
}

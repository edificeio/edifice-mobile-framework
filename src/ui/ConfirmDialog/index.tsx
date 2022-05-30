import I18n from 'i18n-js';
import * as React from 'react';
import { FlatList, View } from 'react-native';

import DialogButtonCancel from './buttonCancel';
import DialogButtonOk from './buttonOk';
import DialogContainer from './container';
import DialogInput from './input';
import DialogSelect from './select';
import DialogTitle from './title';

import { layoutSize } from '~/styles/common/layoutSize';
import { ITreeItem } from '~/workspace/actions/helpers/formatListFolders';
import { Item } from '~/workspace/components';
import { IFile, IItem } from '~/workspace/types/states/items';

type IProps = {
  filterId: string;
  folders: ITreeItem[];
  input: any;
  okLabel: string;
  onCancel: Function;
  onValid: Function;
  parentId: string;
  selectDestination: boolean;
  selected: IFile[];
  title: string;
  visible: boolean;
};

export { DialogButtonOk, DialogButtonCancel, DialogContainer, DialogInput, DialogSelect, DialogTitle };

export type IState = {
  disabled: boolean;
  value: {
    prefix: string;
    suffix: string;
  };
  valueSelect: string;
};

export class ConfirmDialog extends React.Component<IProps, IState> {
  state = {
    disabled: !this.props.input && this.props.selectDestination,
    value: this.getInitialValue(),
    valueSelect: this.props.filterId === 'owner' ? this.props.parentId : 'owner',
  };

  onValid() {
    this.props.onValid({ value: this.getFinalValue() });
  }

  getInitialValue() {
    const { input, selected } = this.props;

    const value = selected.length ? selected[0][input] || '' : '';
    const index = value.lastIndexOf('.');
    const suffix = index > 0 ? value.substring(index) : '';
    const prefix = index > 0 ? value.substring(0, index) : value;

    return {
      prefix,
      suffix,
    };
  }

  getFinalValue() {
    const { input, selectDestination } = this.props;
    const { value, valueSelect } = this.state;
    const { prefix, suffix } = value;

    if (input) return `${prefix}${suffix}`;
    else if (selectDestination) return valueSelect;
  }

  fill() {
    const { folders, input, parentId, selectDestination, selected, title } = this.props;
    const { prefix } = this.state.value;

    if (input) {
      return (
        <>
          <DialogTitle>{title}</DialogTitle>
          <DialogInput
            value={prefix}
            onChangeText={(value: string) =>
              this.setState({
                value: {
                  prefix: value,
                  suffix: this.state.value.suffix,
                },
                disabled: value.length === 0,
              })
            }
          />
        </>
      );
    } else if (selectDestination) {
      if (this.state.disabled !== false && title === I18n.t('copy-documents')) {
        this.setState({ disabled: false });
      }
      return (
        <View>
          <DialogTitle>{title}</DialogTitle>
          <DialogSelect
            data={folders}
            defaultSelectedId={[parentId]}
            excludeData={selected}
            onPress={(id, isParentOfSelection) =>
              this.setState({
                valueSelect: id && id.length ? id : 'owner',
                disabled: title !== I18n.t('copy-documents') ? isParentOfSelection : false,
              })
            }
          />
        </View>
      );
    } else {
      return (
        <>
          <DialogTitle>{title}</DialogTitle>
          {selected && (
            <View
              style={{
                maxHeight: layoutSize.LAYOUT_450,
                height: layoutSize.LAYOUT_80 * selected.length,
                marginTop: layoutSize.LAYOUT_10,
                marginLeft: layoutSize.LAYOUT_16,
                marginBottom: layoutSize.LAYOUT_10,
                position: 'relative',
                display: 'flex',
                flex: 0,
              }}>
              <FlatList
                data={selected}
                keyExtractor={(item: IItem) => item.id}
                renderItem={({ item }) => <Item item={item} simple onEvent={f => f} />}
              />
            </View>
          )}
        </>
      );
    }
  }

  render() {
    const { okLabel } = this.props;
    const { disabled } = this.state;

    return (
      <View>
        <DialogContainer visible>
          {this.fill()}
          <DialogButtonCancel onPress={this.props.onCancel.bind(this)} />
          <DialogButtonOk disabled={disabled} label={okLabel ? okLabel : 'Valider'} onPress={this.onValid.bind(this)} />
        </DialogContainer>
      </View>
    );
  }
}

import React from 'react';
import { StyleSheet, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import ModalBox, { ModalBoxHandle } from '~/framework/components/ModalBox';
import { ActionButton } from '~/framework/components/buttons/action';
import { UI_SIZES } from '~/framework/components/constants';
import { BodyText, NestedText, SmallText } from '~/framework/components/text';
import { DistributionStatus } from '~/framework/modules/form/model';

const styles = StyleSheet.create({
  topMargin: {
    marginTop: UI_SIZES.spacing.small,
  },
  dropdown: {
    marginTop: UI_SIZES.spacing.small,
    borderColor: theme.palette.primary.regular,
    borderWidth: 1,
  },
  dropdownContainer: {
    marginTop: UI_SIZES.spacing.small,
    borderColor: theme.palette.primary.regular,
    borderWidth: 1,
    maxHeight: 120,
  },
  dropdownText: {
    color: theme.ui.text.regular,
  },
});

interface IFormSubmissionModalProps {
  editable: boolean;
  loading: boolean;
  status: DistributionStatus;
  structures: { label: string; value: string }[];
  onSubmit: (structure: string) => void;
}

const FormSubmissionModal = React.forwardRef<ModalBoxHandle, IFormSubmissionModalProps>((props, ref) => {
  const [isDropdownOpen, setDropdownOpen] = React.useState(false);
  const [structureId, setStructureId] = React.useState(props.structures[0].value);

  return (
    <ModalBox
      ref={ref}
      content={
        <View>
          <BodyText>{I18n.get('form-distributionscreen-submissionmodal-title')}</BodyText>
          <SmallText style={styles.topMargin}>
            {I18n.get('form-distributionscreen-submissionmodal-uppertext')}
            {props.structures.length > 1 ? (
              <NestedText> {I18n.get('form-distributionscreen-submissionmodal-selectstructure')}</NestedText>
            ) : null}
          </SmallText>
          {props.structures.length > 1 ? (
            <DropDownPicker
              open={isDropdownOpen}
              value={structureId}
              items={props.structures}
              setOpen={setDropdownOpen}
              setValue={setStructureId}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              textStyle={styles.dropdownText}
            />
          ) : null}
          <View style={{ zIndex: -1 }}>
            <SmallText style={styles.topMargin}>
              {I18n.get(
                props.status === DistributionStatus.ON_CHANGE
                  ? 'form-distributionscreen-submissionmodal-lowertext-replace'
                  : props.editable
                  ? 'form-distributionscreen-submissionmodal-lowertext-editable'
                  : 'form-distributionscreen-submissionmodal-lowertext-default',
              )}
            </SmallText>
            <ActionButton
              text={I18n.get('form-distributionscreen-submissionmodal-action')}
              action={() => props.onSubmit(structureId)}
              loading={props.loading}
              style={styles.topMargin}
            />
          </View>
        </View>
      }
    />
  );
});

export default FormSubmissionModal;

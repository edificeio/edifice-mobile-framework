import I18n from 'i18n-js';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

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
  status: DistributionStatus;
  structures: { label: string; value: string }[];
  onSubmit: (structure: string) => void;
}

const FormSubmissionModal = React.forwardRef<ModalBoxHandle, IFormSubmissionModalProps>((props, ref) => {
  const [isDropdownOpened, setDropdownOpened] = React.useState(false);
  const [structureId, setStructureId] = React.useState(props.structures[0].value);

  return (
    <ModalBox
      ref={ref}
      content={
        <View>
          <BodyText>{I18n.t('form.formDistributionScreen.submissionModal.title')}</BodyText>
          <SmallText style={styles.topMargin}>
            {I18n.t('form.formDistributionScreen.submissionModal.upperText')}
            {props.structures.length > 1 ? (
              <NestedText> {I18n.t('form.formDistributionScreen.submissionModal.selectStructure')}</NestedText>
            ) : null}
          </SmallText>
          {props.structures.length > 1 ? (
            <DropDownPicker
              open={isDropdownOpened}
              value={structureId}
              items={props.structures}
              setOpen={setDropdownOpened}
              setValue={setStructureId}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              textStyle={styles.dropdownText}
            />
          ) : null}
          <SmallText style={styles.topMargin}>
            {I18n.t(
              props.status === DistributionStatus.ON_CHANGE
                ? 'form.formDistributionScreen.submissionModal.lowerText.replace'
                : props.editable
                ? 'form.formDistributionScreen.submissionModal.lowerText.editable'
                : 'form.formDistributionScreen.submissionModal.lowerText.default',
            )}
          </SmallText>
          <ActionButton text={I18n.t('common.confirm')} action={() => props.onSubmit(structureId)} style={styles.topMargin} />
        </View>
      }
    />
  );
});

export default FormSubmissionModal;
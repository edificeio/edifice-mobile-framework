import I18n from 'i18n-js';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

import theme from '~/app/theme';
import { ActionButton } from '~/framework/components/ActionButton';
import ModalBox from '~/framework/components/ModalBox';
import { UI_SIZES } from '~/framework/components/constants';
import { BodyText, NestedText, SmallText } from '~/framework/components/text';
import { DistributionStatus } from '~/modules/form/reducer';

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
  modalBoxRef: any;
  status: DistributionStatus;
  structures: { label: string; value: string }[];
  onSubmit: (structure: string) => void;
}

export const FormSubmissionModal = ({ editable, modalBoxRef, status, structures, onSubmit }: IFormSubmissionModalProps) => {
  const [isDropdownOpened, setDropdownOpened] = React.useState(false);
  const [structureId, setStructureId] = React.useState(structures[0].value);

  return (
    <ModalBox
      ref={modalBoxRef}
      content={
        <View>
          <BodyText>{I18n.t('form.formDistributionScreen.submissionModal.title')}</BodyText>
          <SmallText style={styles.topMargin}>
            {I18n.t('form.formDistributionScreen.submissionModal.upperText')}
            {structures.length > 1 ? (
              <NestedText> {I18n.t('form.formDistributionScreen.submissionModal.selectStructure')}</NestedText>
            ) : null}
          </SmallText>
          {structures.length > 1 ? (
            <DropDownPicker
              open={isDropdownOpened}
              value={structureId}
              items={structures}
              setOpen={setDropdownOpened}
              setValue={setStructureId}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              textStyle={styles.dropdownText}
            />
          ) : null}
          <SmallText style={styles.topMargin}>
            {I18n.t(
              status === DistributionStatus.ON_CHANGE
                ? 'form.formDistributionScreen.submissionModal.lowerText.replace'
                : editable
                ? 'form.formDistributionScreen.submissionModal.lowerText.editable'
                : 'form.formDistributionScreen.submissionModal.lowerText.default',
            )}
          </SmallText>
          <ActionButton text={I18n.t('common.confirm')} action={() => onSubmit(structureId)} style={styles.topMargin} />
        </View>
      }
    />
  );
};

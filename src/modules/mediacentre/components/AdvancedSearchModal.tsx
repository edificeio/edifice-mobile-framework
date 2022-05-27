import I18n from 'i18n-js';
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import theme from '~/app/theme';
import { Icon } from '~/framework/components/picture/Icon';
import { Source } from '~/modules/mediacentre/utils/Resource';
import { ButtonGroup } from '~/ui/ButtonGroup';
import { DialogButtonCancel, DialogButtonOk } from '~/ui/ConfirmDialog';
import { Text, TextBold } from '~/ui/Typography';
import { Checkbox } from '~/ui/forms/Checkbox';

const styles = StyleSheet.create({
  criteriaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  criteriaText: {
    fontSize: 14,
  },
  criteriaInput: {
    width: '75%',
    height: 45,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderRadius: 5,
    borderColor: theme.color.secondary.regular,
  },
  sourceCheckBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  sourceImage: {
    width: 30,
    height: 30,
    marginRight: 5,
  },
  safeAreaContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    height: 50,
    backgroundColor: theme.color.secondary.regular,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 18,
    color: 'white',
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  sourcesContainer: {
    marginBottom: 5,
  },
  sourcesContentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  dialogButtonsContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
  },
  searchButton: {
    backgroundColor: theme.color.secondary.regular,
  },
});

export enum Operand {
  OR = 0,
  AND = 1,
}

export interface Field {
  name: string;
  operand: Operand;
  value: string;
}

export interface Sources {
  GAR: boolean;
  Moodle: boolean;
  PMB: boolean;
  Signets: boolean;
}

const defaultFields: Field[] = [
  { name: 'title', value: '', operand: Operand.OR },
  { name: 'authors', value: '', operand: Operand.OR },
  { name: 'editors', value: '', operand: Operand.OR },
  { name: 'disciplines', value: '', operand: Operand.OR },
  { name: 'levels', value: '', operand: Operand.OR },
];

const defaultSources = {
  GAR: false,
  Moodle: false,
  PMB: false,
  Signets: false,
};

type CriteriaInputProps = {
  field: Field;

  onChange: (field: Field) => void;
};

type SourceCheckboxProps = {
  checked: boolean;
  iconName?: string;
  source?: ImageSourcePropType;

  onChange: (value: boolean) => void;
};

type AdvancedSearchModalProps = {
  availableSources: string[];
  isVisible: boolean;

  closeModal: () => void;
  onSearch: (fields: Field[], sources: Sources) => void;
};

const CriteriaInput: React.FunctionComponent<CriteriaInputProps> = (props: CriteriaInputProps) => {
  const buttons = [I18n.t('mediacentre.advancedSearch.or'), I18n.t('mediacentre.advancedSearch.and')];
  const onChangeOperand = (value: number) => {
    props.field.operand = value;
    props.onChange(props.field);
  };
  const onChangeText = (text: string) => {
    props.field.value = text;
    props.onChange(props.field);
  };
  return (
    <View>
      {props.field.name !== 'title' ? (
        <ButtonGroup buttons={buttons} selectedButton={props.field.operand} onPress={onChangeOperand} />
      ) : null}
      <View style={styles.criteriaContainer}>
        <Text style={styles.criteriaText}>{I18n.t(`mediacentre.advancedSearch.${props.field.name}`)}</Text>
        <TextInput
          defaultValue={props.field.value}
          placeholder={I18n.t(`mediacentre.advancedSearch.search-${props.field.name}`)}
          clearButtonMode="always"
          maxLength={30}
          onChangeText={onChangeText}
          style={styles.criteriaInput}
        />
      </View>
    </View>
  );
};

const SourceCheckbox: React.FunctionComponent<SourceCheckboxProps> = (props: SourceCheckboxProps) => {
  const onCheck = () => {
    props.onChange(true);
  };
  const onUncheck = () => {
    props.onChange(false);
  };
  return (
    <View style={styles.sourceCheckBoxContainer}>
      {props.source ? (
        <Image source={props.source} style={styles.sourceImage} />
      ) : (
        props.iconName && <Icon name={props.iconName} size={30} />
      )}
      <Checkbox checked={props.checked} onCheck={onCheck} onUncheck={onUncheck} />
    </View>
  );
};

export const AdvancedSearchModal: React.FunctionComponent<AdvancedSearchModalProps> = forwardRef(
  (props: AdvancedSearchModalProps, ref) => {
    const [fields, setFields] = useState<Field[]>(defaultFields);
    const [sources, setSources] = useState<Sources>(defaultSources);
    const areFieldsEmpty = !fields.some(field => field.value !== '');
    const updateField = (index: number, field: Field) => {
      const newFields = [...fields];
      newFields[index] = field;
      setFields(newFields);
    };
    const onSearch = () => {
      props.onSearch(fields, sources);
    };
    const resetSources = () => {
      setSources({
        GAR: props.availableSources.includes(Source.GAR),
        Moodle: props.availableSources.includes(Source.Moodle),
        PMB: props.availableSources.includes(Source.PMB),
        Signets: props.availableSources.includes(Source.Signet),
      });
    };
    const resetParams = () => {
      for (const field of fields) {
        field.value = '';
        field.operand = Operand.OR;
      }
      setFields(fields);
      resetSources();
    };

    useEffect(() => {
      resetSources();
    }, [props.availableSources]);
    useImperativeHandle(ref, () => ({ resetParams }));

    return (
      <Modal visible={props.isVisible} animationType="slide" presentationStyle="formSheet" onRequestClose={props.closeModal}>
        <KeyboardAvoidingView
          enabled={Platform.OS === 'ios'}
          behavior="padding"
          keyboardVerticalOffset={60}
          style={styles.safeAreaContainer}>
          <View style={styles.headerContainer}>
            <TextBold style={styles.headerTitle}>{I18n.t('mediacentre.advanced-search')}</TextBold>
            <TouchableOpacity onPress={props.closeModal}>
              <Icon name="close" color="white" size={24} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
            {fields.map((field, index) => (
              <CriteriaInput field={field} onChange={newField => updateField(index, newField)} key={index} />
            ))}
            <View style={styles.sourcesContainer}>
              <Text style={styles.criteriaText}>{I18n.t('mediacentre.advancedSearch.sources')}</Text>
              <View style={styles.sourcesContentContainer}>
                {props.availableSources.includes(Source.GAR) ? (
                  <SourceCheckbox
                    source={require('ASSETS/images/logo-gar.png')}
                    checked={sources.GAR}
                    onChange={value => setSources({ ...sources, GAR: value })}
                  />
                ) : null}
                {props.availableSources.includes(Source.Moodle) ? (
                  <SourceCheckbox
                    source={require('ASSETS/images/logo-moodle.png')}
                    checked={sources.Moodle}
                    onChange={value => setSources({ ...sources, Moodle: value })}
                  />
                ) : null}
                {props.availableSources.includes(Source.PMB) ? (
                  <SourceCheckbox
                    source={require('ASSETS/images/logo-pmb.png')}
                    checked={sources.PMB}
                    onChange={value => setSources({ ...sources, PMB: value })}
                  />
                ) : null}
                {props.availableSources.includes(Source.Signet) ? (
                  <SourceCheckbox
                    iconName="bookmark_outline"
                    checked={sources.Signets}
                    onChange={value => setSources({ ...sources, Signets: value })}
                  />
                ) : null}
              </View>
            </View>
            <View style={styles.dialogButtonsContainer}>
              <DialogButtonCancel onPress={props.closeModal} />
              <DialogButtonOk
                onPress={onSearch}
                disabled={areFieldsEmpty}
                label={I18n.t('common.search')}
                style={styles.searchButton}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    );
  },
);

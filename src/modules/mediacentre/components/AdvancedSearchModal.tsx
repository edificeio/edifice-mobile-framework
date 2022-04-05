import I18n from 'i18n-js';
import React, { useState, useEffect } from 'react';
import { Modal, View, Image, StyleSheet, ImageSourcePropType } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

import { CommonStyles } from '~/styles/common/styles';
import { DialogButtonCancel, DialogButtonOk } from '~/ui/ConfirmDialog';
import { Icon } from '~/ui';
import { ButtonGroup } from '~/ui/ButtonGroup';
import { Checkbox } from '~/ui/forms/Checkbox';
import { ModalContentBlock } from '~/ui/Modal';
import { Text, TextBold } from '~/ui/Typography';

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    height: 50,
    backgroundColor: '#F53B56',
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
    marginVertical: 20,
    justifyContent: 'space-between',
  },
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 2,
    borderRadius: 5,
    borderColor: CommonStyles.actionColor,
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
});

export enum Operand {
  OR = 0,
  AND = 1,
}

export interface Field {
  name: string;
  value: string;
  operand: Operand;
}

export interface AdvancedSearchParams {
  title: Field;
  authors: Field;
  editors: Field;
  disciplines: Field;
  levels: Field;
  sources: {
    GAR: boolean;
    Moodle: boolean;
    Signets: boolean;
  };
}

export const defaultParams: AdvancedSearchParams = {
  title: { name: 'title', value: '', operand: Operand.OR },
  authors: { name: 'authors', value: '', operand: Operand.OR },
  editors: { name: 'editors', value: '', operand: Operand.OR },
  disciplines: { name: 'disciplines', value: '', operand: Operand.OR },
  levels: { name: 'levels', value: '', operand: Operand.OR },
  sources: {
    GAR: true,
    Moodle: true,
    Signets: true
  }
}

type CriteriaInputProps = {
  defaultValue: string;
  name: string;
  placeholder: string;

  onChangeText: (text: string) => void;
};

type SourceCheckboxProps = {
  checked: boolean;
  source?: ImageSourcePropType;
  iconName?: string;

  onCheck: () => void;
  onUncheck: () => void
};

type AdvancedSearchModalProps = {
  isVisible: boolean;

  closeModal: () => void;
  onSearch: (params: AdvancedSearchParams) => void;
};

const CriteriaInput: React.FunctionComponent<CriteriaInputProps> = (props: CriteriaInputProps) => (
  <View style={styles.criteriaContainer}>
    <Text style={styles.criteriaText}>{props.name}</Text>
    <TextInput defaultValue={props.defaultValue} placeholder={props.placeholder} onChangeText={props.onChangeText} style={styles.criteriaInput}/>
  </View>
);

const SourceCheckbox: React.FunctionComponent<SourceCheckboxProps> = (props: SourceCheckboxProps) => (
  <View style={styles.sourceCheckBoxContainer}>
    {props.source ? <Image source={props.source} style={styles.sourceImage} />
    : <Icon name={props.iconName} size={30} />}
    <Checkbox checked={props.checked} onCheck={props.onCheck} onUncheck={props.onUncheck} />
  </View>
);

export const AdvancedSearchModal: React.FunctionComponent<AdvancedSearchModalProps> = (props: AdvancedSearchModalProps) => {
  const [params, setParams] = useState<AdvancedSearchParams>(defaultParams);
  const buttons = [I18n.t('mediacentre.advancedSearch.or'), I18n.t('mediacentre.advancedSearch.and')];

  return (
    <View style={{ backgroundColor: "#FFF", flex: 0 }}>
      <Modal visible={props.isVisible}>
        <View style={styles.headerContainer}>
          <TextBold style={styles.headerTitle}>{I18n.t('mediacentre.advanced-search')}</TextBold>
          <Icon name='close' color='white' size={24} onPress={props.closeModal}/>
        </View>
        <ModalContentBlock style={styles.contentContainer}>
          <CriteriaInput name={I18n.t('mediacentre.advancedSearch.title')} defaultValue={params.title.value} placeholder={I18n.t('mediacentre.advancedSearch.search-title')} onChangeText={(text) => setParams({ ...params, title: { ...params.title, value: text }})} />
          <ButtonGroup buttons={buttons} selectedButton={params.authors.operand} color={CommonStyles.actionColor} onPress={(index) => setParams({ ...params, authors: { ...params.authors, operand: index }})} />
          <CriteriaInput name={I18n.t('mediacentre.advancedSearch.author')} defaultValue={params.authors.value} placeholder={I18n.t('mediacentre.advancedSearch.search-author')} onChangeText={(text) => setParams({ ...params, authors: { ...params.authors, value: text }})} />
          <ButtonGroup buttons={buttons} selectedButton={params.editors.operand} color={CommonStyles.actionColor} onPress={(index) => setParams({ ...params, editors: { ...params.editors, operand: index }})} />
          <CriteriaInput name={I18n.t('mediacentre.advancedSearch.publisher')} defaultValue={params.editors.value} placeholder={I18n.t('mediacentre.advancedSearch.search-publisher')} onChangeText={(text) => setParams({ ...params, editors: { ...params.editors, value: text }})} />
          <ButtonGroup buttons={buttons} selectedButton={params.disciplines.operand} color={CommonStyles.actionColor} onPress={(index) => setParams({ ...params, disciplines: { ...params.disciplines, operand: index }})} />
          <CriteriaInput name={I18n.t('mediacentre.advancedSearch.subject')} defaultValue={params.disciplines.value} placeholder={I18n.t('mediacentre.advancedSearch.search-subject')} onChangeText={(text) => setParams({ ...params, disciplines: { ...params.disciplines, value: text }})} />
          <ButtonGroup buttons={buttons} selectedButton={params.levels.operand} color={CommonStyles.actionColor} onPress={(index) => setParams({ ...params, levels: { ...params.levels, operand: index }})} />
          <CriteriaInput name={I18n.t('mediacentre.advancedSearch.level')} defaultValue={params.levels.value} placeholder={I18n.t('mediacentre.advancedSearch.search-level')} onChangeText={(text) => setParams({ ...params, levels: { ...params.levels, value: text }})} />
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.criteriaText}>{I18n.t('mediacentre.advancedSearch.sources')}</Text>
            <SourceCheckbox source={require('ASSETS/images/logo-gar.png')} checked={params.sources.GAR} onCheck={() => setParams({ ...params, sources: { ...params.sources, GAR: true }})} onUncheck={() => setParams({ ...params, sources: { ...params.sources, GAR: false }})} />
            <SourceCheckbox source={require('ASSETS/images/logo-moodle.png')} checked={params.sources.Moodle} onCheck={() => setParams({ ...params, sources: { ...params.sources, Moodle: true }})} onUncheck={() => setParams({ ...params, sources: { ...params.sources, Moodle: false }})} />
            <SourceCheckbox iconName='bookmark_outline' checked={params.sources.Signets} onCheck={() => setParams({ ...params, sources: { ...params.sources, Signets: true }})} onUncheck={() => setParams({ ...params, sources: { ...params.sources, Signets: false }})} />
          </View>
          <View style={{ flexDirection: 'row', alignSelf: 'flex-end' }}>
            <DialogButtonCancel
              onPress={() => props.closeModal()}
            />
            <DialogButtonOk
              style={{ backgroundColor: '#F53B56' }}
              label={I18n.t('common.search')}
              onPress={() => props.onSearch(params)}
            />
          </View>
        </ModalContentBlock>
      </Modal>
    </View>
  );
}

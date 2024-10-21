import * as React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { I18n } from '~/app/i18n';
import { UI_SIZES } from '~/framework/components/constants';
import ModalBox, { ModalBoxHandle } from '~/framework/components/ModalBox';
import { BodyText, SmallText } from '~/framework/components/text';
import { ILevel } from '~/framework/modules/viescolaire/competences/model';

const styles = StyleSheet.create({
  levelColorContainer: {
    borderRadius: UI_SIZES.spacing.medium,
    height: 25,
    marginRight: UI_SIZES.spacing.small,
    width: 25,
  },
  levelContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: UI_SIZES.spacing.minor,
  },
});

interface ILevelLegendModalProps {
  levels: ILevel[];
}

const LevelLegendModal = React.forwardRef<ModalBoxHandle, ILevelLegendModalProps>((props, ref) => {
  return (
    <ModalBox
      ref={ref}
      content={
        <FlatList
          data={props.levels.slice().sort((a, b) => b.order - a.order)}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.levelContainer}>
              <View style={[styles.levelColorContainer, { backgroundColor: item.color }]} />
              <SmallText>{item.label}</SmallText>
            </View>
          )}
          ListHeaderComponent={<BodyText>{I18n.get('competences-assessment-levellegendmodal-title')}</BodyText>}
          scrollEnabled={false}
        />
      }
    />
  );
});

export default LevelLegendModal;

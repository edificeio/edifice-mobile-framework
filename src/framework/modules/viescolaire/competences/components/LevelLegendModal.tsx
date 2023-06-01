import * as React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import ModalBox, { ModalBoxHandle } from '~/framework/components/ModalBox';
import { UI_SIZES } from '~/framework/components/constants';
import { BodyText, SmallText } from '~/framework/components/text';
import { ILevel } from '~/framework/modules/viescolaire/competences/model';

const styles = StyleSheet.create({
  levelColorContainer: {
    height: 25,
    width: 25,
    marginRight: UI_SIZES.spacing.small,
    borderRadius: UI_SIZES.spacing.medium,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
          data={props.levels.slice().sort((a, b) => b.ordre - a.ordre)}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.levelContainer}>
              <View style={[styles.levelColorContainer, { backgroundColor: item.couleur }]} />
              <SmallText>{item.libelle}</SmallText>
            </View>
          )}
          ListHeaderComponent={<BodyText>{I18n.t('competences-levellegendmodal-title')}</BodyText>}
          scrollEnabled={false}
        />
      }
    />
  );
});

export default LevelLegendModal;

import I18n from 'i18n-js';
import moment from 'moment';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { Icon } from '~/framework/components/picture/Icon';
import { Small, SmallBold, TextSizeStyle } from '~/framework/components/text';
import { IMemento, IRelativesInfos } from '~/modules/viescolaire/viesco/state/memento';

const styles = StyleSheet.create({
  studentInfos: {
    padding: 10, // MO-142 use UI_SIZES.spacing here
    paddingBottom: 20, // MO-142 use UI_SIZES.spacing here
  },
  studentName: {
    ...TextSizeStyle.Medium,
    marginBottom: 10, // MO-142 use UI_SIZES.spacing here
  },
  studentGroups: {
    marginTop: -5, // MO-142 use UI_SIZES.spacing here
    marginBottom: 5, // MO-142 use UI_SIZES.spacing here
  },
  infoLine: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: 10, // MO-142 use UI_SIZES.spacing here
  },
  iconDisplay: {
    marginRight: 10, // MO-142 use UI_SIZES.spacing here
    marginTop: -3, // MO-142 use UI_SIZES.spacing here
  },
  relativesInfos: {
    flex: 1,
    borderStyle: 'solid',
    padding: 10, // MO-142 use UI_SIZES.spacing here
  },
  relativesTitleText: {
    marginBottom: 10, // MO-142 use UI_SIZES.spacing here
  },
  relativesContainer: {
    marginBottom: 20, // MO-142 use UI_SIZES.spacing here
  },
  relativesIdentity: {
    marginBottom: 5, // MO-142 use UI_SIZES.spacing here
  },
  shadow: {
    backgroundColor: theme.palette.grey.white,
    elevation: 4,
    shadowColor: theme.ui.shadowColor,
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },
});

export const RelativesInfos = (props: { relatives: IRelativesInfos[] }) => {
  return (
    <View style={[styles.relativesInfos, styles.shadow]}>
      <Small style={styles.relativesTitleText}>{I18n.t('viesco-memento-relatives')}</Small>

      {props.relatives &&
        props.relatives.map(relative => {
          return (
            <View style={styles.relativesContainer}>
              {relative.name ? (
                <SmallBold style={styles.relativesIdentity}>{relative.title + ' ' + relative.name}</SmallBold>
              ) : null}

              <View style={styles.infoLine}>
                <Icon style={styles.iconDisplay} size={20} name="email" />
                {relative.name && relative.email !== '' ? <Small>{relative.email}</Small> : <Small>-</Small>}
              </View>

              <View style={styles.infoLine}>
                <Icon style={styles.iconDisplay} size={20} name="cellphone" />
                {relative.mobile && relative.mobile !== '' ? <Small>{relative.mobile}</Small> : <Small>-</Small>}
              </View>

              <View style={styles.infoLine}>
                <Icon style={styles.iconDisplay} size={20} name="phone" />
                {relative.phone && relative.phone !== '' ? <Small>{relative.phone}</Small> : <Small>-</Small>}
              </View>

              <View style={styles.infoLine}>
                <Icon style={styles.iconDisplay} size={20} name="home" />
                {relative.address && relative.address !== '' ? <Small>{relative.address}</Small> : <Small>-</Small>}
              </View>
            </View>
          );
        })}
    </View>
  );
};

export const StudentInfos = (props: { memento: IMemento }) => {
  return (
    <View style={styles.studentInfos}>
      {props.memento.name ? <SmallBold style={styles.studentName}>{props.memento.name}</SmallBold> : null}

      <View style={styles.infoLine}>
        <Icon style={styles.iconDisplay} size={20} name="cake-variant" />
        {props.memento.birth_date ? (
          <Small>
            {I18n.t('viesco-memento-born-date')} {moment(props.memento.birth_date).format('L')}
          </Small>
        ) : (
          <Small>-</Small>
        )}
      </View>

      <View style={styles.infoLine}>
        <Icon style={styles.iconDisplay} size={20} name="school" />
        {props.memento.classes ? (
          props.memento.classes.length > 0 && <Small>{props.memento.classes.join(', ')}</Small>
        ) : (
          <Small>-</Small>
        )}
      </View>
      {props.memento.groups.length > 0 && <Small style={styles.studentGroups}>{props.memento.groups.join(', ')}</Small>}

      <View style={styles.infoLine}>
        <Icon style={styles.iconDisplay} size={20} name="silverware" />
        {props.memento.accommodation ? <Small>{props.memento.accommodation.toLocaleLowerCase()}</Small> : <Small>-</Small>}
      </View>
    </View>
  );
};

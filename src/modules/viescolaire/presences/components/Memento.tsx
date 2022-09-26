import I18n from 'i18n-js';
import moment from 'moment';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/picture/Icon';
import { BodyBoldText, SmallBoldText, SmallText } from '~/framework/components/text';
import { IMemento, IRelativesInfos } from '~/modules/viescolaire/presences/state/memento';

const styles = StyleSheet.create({
  studentInfos: {
    padding: UI_SIZES.spacing.small,
    paddingBottom: UI_SIZES.spacing.medium,
  },
  studentName: {
    marginBottom: UI_SIZES.spacing.small,
  },
  studentGroups: {
    marginTop: -UI_SIZES.spacing.tiny,
    marginBottom: UI_SIZES.spacing.tiny,
  },
  infoLine: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: UI_SIZES.spacing.small,
  },
  iconDisplay: {
    marginRight: UI_SIZES.spacing.small,
    marginTop: -UI_SIZES.spacing.tiny,
  },
  relativesInfos: {
    flex: 1,
    borderStyle: 'solid',
    padding: UI_SIZES.spacing.small,
  },
  relativesTitleText: {
    marginBottom: UI_SIZES.spacing.small,
  },
  relativesContainer: {
    marginBottom: UI_SIZES.spacing.big,
  },
  relativesIdentity: {
    marginBottom: UI_SIZES.spacing.tiny,
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
      <SmallText style={styles.relativesTitleText}>{I18n.t('viesco-memento-relatives')}</SmallText>

      {props.relatives &&
        props.relatives.map(relative => {
          return (
            <View style={styles.relativesContainer}>
              {relative.name ? (
                <SmallBoldText style={styles.relativesIdentity}>
                  {relative.title ? relative.title + ' ' + relative.name : relative.name}
                </SmallBoldText>
              ) : null}

              <View style={styles.infoLine}>
                <Icon style={styles.iconDisplay} size={20} name="email" />
                {relative.email && relative.email !== '' ? <SmallText>{relative.email}</SmallText> : <SmallText>-</SmallText>}
              </View>

              <View style={styles.infoLine}>
                <Icon style={styles.iconDisplay} size={20} name="cellphone" />
                {relative.mobile && relative.mobile !== '' ? <SmallText>{relative.mobile}</SmallText> : <SmallText>-</SmallText>}
              </View>

              <View style={styles.infoLine}>
                <Icon style={styles.iconDisplay} size={20} name="phone" />
                {relative.phone && relative.phone !== '' ? <SmallText>{relative.phone}</SmallText> : <SmallText>-</SmallText>}
              </View>

              <View style={styles.infoLine}>
                <Icon style={styles.iconDisplay} size={20} name="home" />
                {relative.address && relative.address !== '' ? <SmallText>{relative.address}</SmallText> : <SmallText>-</SmallText>}
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
      {props.memento.name ? <BodyBoldText style={styles.studentName}>{props.memento.name}</BodyBoldText> : null}

      <View style={styles.infoLine}>
        <Icon style={styles.iconDisplay} size={20} name="cake-variant" />
        {props.memento.birth_date ? (
          <SmallText>
            {I18n.t('viesco-memento-born-date')} {moment(props.memento.birth_date).format('L')}
          </SmallText>
        ) : (
          <SmallText>-</SmallText>
        )}
      </View>

      <View style={styles.infoLine}>
        <Icon style={styles.iconDisplay} size={20} name="school" />
        {props.memento.classes && props.memento.classes.length > 0 ? (
          <SmallText>{props.memento.classes.join(', ')}</SmallText>
        ) : (
          <SmallText>-</SmallText>
        )}
      </View>
      {props.memento.groups.length > 0 && <SmallText style={styles.studentGroups}>{props.memento.groups.join(', ')}</SmallText>}

      <View style={styles.infoLine}>
        <Icon style={styles.iconDisplay} size={20} name="silverware" />
        {props.memento.accommodation ? (
          <SmallText>{props.memento.accommodation.toLocaleLowerCase()}</SmallText>
        ) : (
          <SmallText>-</SmallText>
        )}
      </View>
    </View>
  );
};

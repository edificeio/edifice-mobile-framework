import I18n from 'i18n-js';
import moment from 'moment';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { Icon } from '~/framework/components/picture/Icon';
import { Text, TextBold, TextSizeStyle } from '~/framework/components/text';
import { IMemento, IRelativesInfos } from '~/modules/viescolaire/viesco/state/memento';
import { CommonStyles } from '~/styles/common/styles';

const styles = StyleSheet.create({
  studentInfos: {
    padding: 10,
    paddingBottom: 20,
  },
  studentName: {
    ...TextSizeStyle.SlightBig,
    marginBottom: 10,
  },
  studentGroups: {
    marginTop: -5,
    marginBottom: 5,
  },
  infoLine: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  iconDisplay: {
    marginRight: 10,
    marginTop: -3,
  },
  relativesInfos: {
    flex: 1,
    borderStyle: 'solid',
    padding: 10,
  },
  relativesTitleText: {
    marginBottom: 10,
  },
  relativesContainer: {
    marginBottom: 20,
  },
  relativesIdentity: {
    marginBottom: 5,
  },
  shadow: {
    backgroundColor: theme.palette.grey.white,
    elevation: 4,
    shadowColor: CommonStyles.shadowColor,
    shadowOffset: CommonStyles.shadowOffset,
    shadowOpacity: CommonStyles.shadowOpacity,
    shadowRadius: CommonStyles.shadowRadius,
  },
});

export const RelativesInfos = (props: { relatives: IRelativesInfos[] }) => {
  return (
    <View style={[styles.relativesInfos, styles.shadow]}>
      <Text style={styles.relativesTitleText}>{I18n.t('viesco-memento-relatives')}</Text>

      {props.relatives &&
        props.relatives.map(relative => {
          return (
            <View style={styles.relativesContainer}>
              {relative.name ? <TextBold style={styles.relativesIdentity}>{relative.title + ' ' + relative.name}</TextBold> : null}

              <View style={styles.infoLine}>
                <Icon style={styles.iconDisplay} size={20} name="email" />
                {relative.name && relative.email !== '' ? <Text>{relative.email}</Text> : <Text>-</Text>}
              </View>

              <View style={styles.infoLine}>
                <Icon style={styles.iconDisplay} size={20} name="cellphone" />
                {relative.mobile && relative.mobile !== '' ? <Text>{relative.mobile}</Text> : <Text>-</Text>}
              </View>

              <View style={styles.infoLine}>
                <Icon style={styles.iconDisplay} size={20} name="phone" />
                {relative.phone && relative.phone !== '' ? <Text>{relative.phone}</Text> : <Text>-</Text>}
              </View>

              <View style={styles.infoLine}>
                <Icon style={styles.iconDisplay} size={20} name="home" />
                {relative.address && relative.address !== '' ? <Text>{relative.address}</Text> : <Text>-</Text>}
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
      {props.memento.name ? <TextBold style={styles.studentName}>{props.memento.name}</TextBold> : null}

      <View style={styles.infoLine}>
        <Icon style={styles.iconDisplay} size={20} name="cake-variant" />
        {props.memento.birth_date ? (
          <Text>
            {I18n.t('viesco-memento-born-date')} {moment(props.memento.birth_date).format('L')}
          </Text>
        ) : (
          <Text>-</Text>
        )}
      </View>

      <View style={styles.infoLine}>
        <Icon style={styles.iconDisplay} size={20} name="school" />
        {props.memento.classes ? (
          props.memento.classes.length > 0 && <Text>{props.memento.classes.join(', ')}</Text>
        ) : (
          <Text>-</Text>
        )}
      </View>
      {props.memento.groups.length > 0 && <Text style={styles.studentGroups}>{props.memento.groups.join(', ')}</Text>}

      <View style={styles.infoLine}>
        <Icon style={styles.iconDisplay} size={20} name="silverware" />
        {props.memento.accommodation ? <Text>{props.memento.accommodation.toLocaleLowerCase()}</Text> : <Text>-</Text>}
      </View>
    </View>
  );
};

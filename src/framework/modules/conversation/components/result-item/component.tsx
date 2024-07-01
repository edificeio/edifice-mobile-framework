import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES, getScaleWidth } from '~/framework/components/constants';
import { NamedSVG } from '~/framework/components/picture';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import { AccountType } from '~/framework/modules/auth/model';
import { accountTypeColors } from '~/framework/util/accountTypes';
import { isEmpty } from '~/framework/util/object';
import { SingleAvatar } from '~/ui/avatars/SingleAvatar';

import styles from './styles';
import { ConversationResultItemProps } from './types';

export const avatarSize = getScaleWidth(32);

const ConversationResultItem = (props: ConversationResultItemProps) => {
  const { id, displayName, profile, type, classrooms, relatives, children, functions, nbUsers, disciplines } = props.item;

  console.log(props.item);

  const renderAvatar = () => {
    if (type === 'User') return <SingleAvatar size={avatarSize} status={undefined} userId={id} />;
    return (
      <View style={[styles.avatarView, type === 'ShareBookmark' ? styles.avatarViewBookmark : {}]}>
        <NamedSVG
          name={type === 'ShareBookmark' ? 'ui-bookmark' : 'ui-users'}
          height={UI_SIZES.elements.icon.xsmall}
          width={UI_SIZES.elements.icon.xsmall}
          fill={theme.palette.grey.black}
        />
      </View>
    );
  };

  const renderClassrooms = () => {
    if (isEmpty(classrooms)) return '';
    return (
      <SmallText style={styles.black}>
        {classrooms!.length > 1
          ? `${classrooms![0].name} + ${classrooms!.length - 1} ${I18n.get(classrooms!.length > 2 ? 'user-profile-classes' : 'user-profile-class')}`
          : classrooms![0].name}
      </SmallText>
    );
  };

  const renderSubtitle = () => {
    if (nbUsers)
      return (
        <SmallText style={styles.graphite}>
          {nbUsers} {I18n.get(`conversation-newmail-communicationmembre${nbUsers > 1 ? 's' : ''}`)}
        </SmallText>
      );
    if (props.item.profile === AccountType.Teacher && (!isEmpty(classrooms) || !isEmpty(disciplines)))
      return (
        <SmallText numberOfLines={1} style={styles.graphite}>
          {renderClassrooms()}
          {!isEmpty(disciplines)
            ? `${!isEmpty(classrooms) ? ' - ' : ''}${disciplines!.map(discipline => discipline.name).join(', ')}`
            : ''}
        </SmallText>
      );
    if (profile === AccountType.Student && (!isEmpty(classrooms) || !isEmpty(relatives)))
      return (
        <SmallText numberOfLines={1} style={styles.graphite}>
          {renderClassrooms()}
          {!isEmpty(relatives)
            ? ` - ${I18n.get('conversation-newmail-communicationrelatives')} ${relatives!.map(relative => relative.displayName).join(', ')}`
            : ''}
        </SmallText>
      );
    if (profile === AccountType.Relative && !isEmpty(children))
      return (
        <SmallText numberOfLines={1} style={styles.graphite}>
          {I18n.get('conversation-newmail-communicationchildren')} {children!.map(child => child.displayName).join(', ')}
        </SmallText>
      );
    if (!isEmpty(functions))
      return (
        <SmallText numberOfLines={1} style={styles.graphite}>
          {functions!.join(',')}
        </SmallText>
      );
  };

  return (
    <TouchableOpacity style={styles.container} onPress={props.onPress}>
      {renderAvatar()}
      <View>
        <SmallBoldText numberOfLines={1} ellipsizeMode="tail">
          {displayName}
          {type === 'User' ? (
            <>
              {' - '}
              <SmallBoldText style={{ color: accountTypeColors[profile] }}>
                {I18n.get(`user-profiletypes-${profile.toLowerCase()}`)}
              </SmallBoldText>
            </>
          ) : null}
        </SmallBoldText>
        {renderSubtitle()}
      </View>
    </TouchableOpacity>
  );
};

export default ConversationResultItem;

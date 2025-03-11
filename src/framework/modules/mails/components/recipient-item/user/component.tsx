import React from 'react';
import { View } from 'react-native';

import styles from './styles';

import { I18n } from '~/app/i18n';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import { AccountType } from '~/framework/modules/auth/model';
import MailsRecipientAvatar from '~/framework/modules/mails/components/avatar-recipient';
import { MailsRecipientContainer, MailsRecipientContainerProps } from '~/framework/modules/mails/components/recipient-item';
import { MailsRecipientInfo, MailsVisible } from '~/framework/modules/mails/model';
import { accountTypeInfos } from '~/framework/util/accountType';
import { isEmpty } from '~/framework/util/object';

// const renderClassrooms = classrooms => {
//   if (isEmpty(classrooms)) return '';
//   return (
//     <SmallText numberOfLines={1} ellipsizeMode="tail" style={styles.black}>
//       {classrooms!.length > 1
//         ? `${classrooms![0].name} + ${classrooms!.length - 1} ${I18n.get(classrooms!.length > 2 ? 'user-profile-classes' : 'user-profile-class')}`
//         : classrooms![0].name}
//     </SmallText>
//   );
// };

const renderRelatives = relatives => {
  if (isEmpty(relatives)) return '';
  return (
    <SmallText numberOfLines={1} ellipsizeMode="tail" style={styles.graphite}>
      {I18n.get('conversation-newmail-communicationrelatives')} {relatives!.map(relative => relative.displayName).join(', ')}
    </SmallText>
  );
};

const renderChildren = children => {
  if (isEmpty(children)) return '';
  return (
    <SmallText numberOfLines={1} ellipsizeMode="tail" style={styles.graphite}>
      {I18n.get('conversation-newmail-communicationchildren')} {children!.map(child => child.displayName).join(', ')}
    </SmallText>
  );
};

// const renderDisciplines = disciplines => {
//   if (isEmpty(disciplines)) return '';
//   return (
//     <SmallText numberOfLines={1} ellipsizeMode="tail" style={styles.graphite}>
//       {disciplines!.map(discipline => discipline.name).join(', ')}
//     </SmallText>
//   );
// };

// const renderFunctions = functions => {
//   if (isEmpty(functions)) return '';
//   return (
//     <SmallText numberOfLines={1} ellipsizeMode="tail" style={styles.graphite}>
//       {functions!.map(func => func.name).join(', ')}
//     </SmallText>
//   );
// };

const renderProfile = profile => {
  if (isEmpty(profile)) return '';
  return (
    <>
      {' - '}
      <SmallBoldText style={{ color: accountTypeInfos[profile].color.regular }}>
        {I18n.get(accountTypeInfos[profile].text)}
      </SmallBoldText>
    </>
  );
};

const MailsRecipientUserItem = (props: MailsRecipientContainerProps) => {
  //   const { id, displayName, classrooms, relatives, profile, children, disciplines, functions } = props.item;
  const { children, displayName, id, profile, relatives } = props.item as MailsRecipientInfo | MailsVisible;

  const renderSubtitle = () => {
    switch (profile) {
      // case AccountType.Teacher:
      //   return isEmpty(classrooms) && isEmpty(disciplines) ? null : (
      //     <SmallText numberOfLines={1} ellipsizeMode="tail">
      //       {renderClassrooms(classrooms)}
      //       {!isEmpty(classrooms) && !isEmpty(disciplines) ? ' - ' : ''}
      //       {renderDisciplines(disciplines)}
      //     </SmallText>
      //   );
      // case AccountType.Student:
      //   return isEmpty(classrooms) && isEmpty(relatives) ? null : (
      //     <SmallText numberOfLines={1} ellipsizeMode="tail">
      //       {renderClassrooms(classrooms)}
      //       {!isEmpty(classrooms) && !isEmpty(relatives) ? ' - ' : ''}
      //       {renderRelatives(relatives)}
      //     </SmallText>
      //   );
      case AccountType.Student:
        return renderRelatives(relatives);
      case AccountType.Relative:
        return renderChildren(children);
      // case AccountType.Personnel:
      // case AccountType.Guest:
      //   return renderFunctions(functions);
      default:
        return null;
    }
  };

  return (
    <MailsRecipientContainer {...props}>
      <MailsRecipientAvatar id={id} type="User" />
      <View style={styles.flex1}>
        <SmallBoldText numberOfLines={1} ellipsizeMode="tail">
          {displayName}
          {renderProfile(profile)}
        </SmallBoldText>
        {children || relatives ? renderSubtitle() : null}
      </View>
    </MailsRecipientContainer>
  );
};

export default MailsRecipientUserItem;

import { ColorValue } from 'react-native';

import theme from '~/app/theme';
import { AccountType } from '~/framework/modules/auth/model';
import { assertSession } from '~/framework/modules/auth/reducer';
import { zimbraService } from '~/framework/modules/zimbra/service';

export const getProfileColor = (userType?: string): ColorValue => {
  switch (userType) {
    case AccountType.Student:
      return theme.color.profileTypes.Student;
    case AccountType.Relative:
      return theme.color.profileTypes.Relative;
    case AccountType.Teacher:
      return theme.color.profileTypes.Teacher;
    case AccountType.Personnel:
      return theme.color.profileTypes.Personnel;
    case AccountType.Guest:
      return theme.color.profileTypes.Guest;
    default:
      return theme.palette.grey.graphite;
  }
};

export const getUserColor = async (userId: string) => {
  try {
    const session = assertSession();
    const user = await zimbraService.user.get(session, userId);
    return getProfileColor(user.type[0]);
  } catch {
    return theme.palette.grey.grey;
  }
};

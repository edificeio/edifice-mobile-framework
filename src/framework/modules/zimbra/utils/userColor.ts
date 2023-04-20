import { ColorValue } from 'react-native';

import theme from '~/app/theme';
import { assertSession } from '~/framework/modules/auth/reducer';
import { UserType } from '~/framework/modules/auth/service';
import { zimbraService } from '~/framework/modules/zimbra/service';

export const getProfileColor = (userType?: string): ColorValue => {
  switch (userType) {
    case UserType.Student:
      return theme.color.profileTypes.Student;
    case UserType.Relative:
      return theme.color.profileTypes.Relative;
    case UserType.Teacher:
      return theme.color.profileTypes.Teacher;
    case UserType.Personnel:
      return theme.color.profileTypes.Personnel;
    case UserType.Guest:
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

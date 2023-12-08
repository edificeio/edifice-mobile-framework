import { ColorValue } from 'react-native';

import theme from '~/app/theme';
import { assertSession } from '~/framework/modules/auth/reducer';
import { zimbraService } from '~/framework/modules/zimbra/service';

import { AccountTyoe } from '../../auth/model';

export const getProfileColor = (userType?: string): ColorValue => {
  switch (userType) {
    case AccountTyoe.Student:
      return theme.color.profileTypes.Student;
    case AccountTyoe.Relative:
      return theme.color.profileTypes.Relative;
    case AccountTyoe.Teacher:
      return theme.color.profileTypes.Teacher;
    case AccountTyoe.Personnel:
      return theme.color.profileTypes.Personnel;
    case AccountTyoe.Guest:
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

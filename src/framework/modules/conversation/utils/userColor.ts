import theme from '~/app/theme';
import { mailContentService } from '~/framework/modules/conversation/service/mailContent';

enum UserRole {
  STUDENT = 'STUDENT',
  RELATIVE = 'RELATIVE',
  TEACHER = 'TEACHER',
  PERSONNEL = 'PERSONNEL',
  GUEST = 'GUEST',
}

export const getProfileColor = (role?) => {
  switch (role?.toUpperCase()) {
    case UserRole.STUDENT:
      return theme.color.profileTypes.Student;
    case UserRole.RELATIVE:
      return theme.color.profileTypes.Relative;
    case UserRole.TEACHER:
      return theme.color.profileTypes.Teacher;
    case UserRole.PERSONNEL:
      return theme.color.profileTypes.Personnel;
    case 'PrincTeacherGroup':
      return theme.palette.grey.graphite;
    case UserRole.GUEST:
      return theme.color.profileTypes.Guest;
    default:
      return theme.palette.grey.grey;
  }
};

export const getUserColor = async (userId: string) => {
  try {
    const { result } = userId
      ? await mailContentService.getUserInfos(userId)
      : { result: [{ displayNames: '', id: '', type: [''] }] };
    return getProfileColor(result?.[0].type[0]);
  } catch {
    return getProfileColor();
  }
};

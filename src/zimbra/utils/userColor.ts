import { CommonStyles } from "../../styles/common/styles";
import { mailContentService } from "../service/mailContent";

enum UserRole {
  STUDENT = "STUDENT",
  RELATIVE = "RELATIVE",
  TEACHER = "TEACHER",
  PERSONNEL = "PERSONNEL",
  GUEST = "GUEST",
}

export const getUserColor = async (userId: string) => {
  try {
    const { result } = await mailContentService.getUserInfos(userId);
    return getProfileColor(result?.[0].type[0]);
  } catch (err) {
    return getProfileColor();
  }
};

export const getProfileColor = (role?) => {
  switch (role?.toUpperCase()) {
    case UserRole.STUDENT:
      return CommonStyles.profileTypes.Student;
    case UserRole.RELATIVE:
      return CommonStyles.profileTypes.Relative;
    case UserRole.TEACHER:
      return CommonStyles.profileTypes.Teacher;
    case UserRole.PERSONNEL:
      return CommonStyles.profileTypes.Personnel;
    case "PrincTeacherGroup":
      return "#8C939E";
    case UserRole.GUEST:
      return CommonStyles.profileTypes.Guest;
    default:
      return "#BBBFC6";
  }
};

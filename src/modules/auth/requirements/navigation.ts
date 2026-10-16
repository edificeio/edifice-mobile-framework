import { type NavigationProp, useNavigation } from '@react-navigation/native';

/**
 * Params of the requirement screens that are reached from another requirement screen (never from the outside).
 * The screens that are shown by themselves, because the requirement of the account is the one they are for, have none.
 */
export type RequirementsParamList = {
  'requirements/verify-email-code': { email: string };
  'requirements/verify-mobile-code': { mobile: string };
};

/** Same as `useNavigation`, typed with the requirement screens that can be navigated to from another requirement screen. */
export const useRequirementsNavigation = () => useNavigation<NavigationProp<RequirementsParamList>>();

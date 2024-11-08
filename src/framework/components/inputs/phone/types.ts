import { Country, CountryCode } from 'react-native-phone-number-input';

export interface InputPhoneProps {
  defaultCode: CountryCode;
  isMobileStateClean: boolean;
  onChangeText: (text: string) => void;
  onPhoneInputBlur: () => void;
  onChangeCountry: (newCountry: Country) => void;
  phoneNumber: string;
  placeholder: string;
  testID?: string;
  testIDCountryWithCode?: string;
}

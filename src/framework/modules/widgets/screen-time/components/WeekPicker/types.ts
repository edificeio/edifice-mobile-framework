import { ColorValue, StyleProp, ViewStyle } from 'react-native';

import { Moment } from 'moment';

export interface WeekPickerProps {
  /** Date de début de la semaine sélectionnée */
  selectedWeekStart: Moment;
  /** Callback appelé quand la semaine sélectionnée change */
  onWeekChange: (weekStart: Moment) => void;
  /** Désactive le composant */
  disabled?: boolean;
  /** Style personnalisé pour le conteneur */
  style?: StyleProp<ViewStyle>;
  /** Couleur des chevrons, indigo par défaut */
  iconColor?: ColorValue;
}

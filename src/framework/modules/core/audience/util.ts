import { I18n } from '~/app/i18n';
import theme from '~/app/theme';

import { AudienceReactionType } from './types';

export const audienceReactionsInfos = {
  [AudienceReactionType.REACTION_1]: {
    icon: 'reaction-thankyou',
    roundIcon: 'reaction-thankyou-round',
    label: I18n.get('audiencemeasurement-reaction-1'),
    color: theme.palette.complementary.blue.pale,
  },
  [AudienceReactionType.REACTION_2]: {
    icon: 'reaction-awesome',
    roundIcon: 'reaction-awesome-round',
    label: I18n.get('audiencemeasurement-reaction-2'),
    color: theme.palette.complementary.red.pale,
  },
  [AudienceReactionType.REACTION_3]: {
    icon: 'reaction-welldone',
    roundIcon: 'reaction-welldone-round',
    label: I18n.get('audiencemeasurement-reaction-3'),
    color: theme.palette.complementary.green.pale,
  },
  [AudienceReactionType.REACTION_4]: {
    icon: 'reaction-instructive',
    roundIcon: 'reaction-instructive-round',
    label: I18n.get('audiencemeasurement-reaction-4'),
    color: theme.palette.complementary.yellow.pale,
  },
};

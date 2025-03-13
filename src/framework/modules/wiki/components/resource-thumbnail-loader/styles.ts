import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export const styles = StyleSheet.create({
    resourceLoaderContent: {
        alignSelf: 'center',
        borderColor: theme.palette.grey.white,
        borderRadius: UI_SIZES.radius.mediumPlus,
        borderWidth: UI_SIZES.elements.border.large,
        height: getScaleWidth(120),
        width: getScaleWidth(120),
    },
});

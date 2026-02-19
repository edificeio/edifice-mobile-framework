import React from 'react';

import { BaseTextAreaProps, BaseTextInputProps } from './types';

/**
 * Android & iOS have specific TextInput-related issues that need to be handled differently.
 * This is why there is a tsx file for iOS and Android.
 */

declare const BaseTextInput = React.FunctionComponent<BaseTextInputProps>;
declare const BaseTextArea = React.FunctionComponent<BaseTextAreaProps>;

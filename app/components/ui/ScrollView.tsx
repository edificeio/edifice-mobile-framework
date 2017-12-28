import * as React from 'react'
import { ScrollView as SysScrollView } from 'react-native'

export const ScrollView = props => (
  <SysScrollView {...props} keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled">
    {props.children}
  </SysScrollView>
)

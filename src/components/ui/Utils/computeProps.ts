var React = require('react')
var ReactNativePropRegistry = require('ReactNativePropRegistry')

export const computeProps = (aIncomingProps, aDefaultProps) => {
  // External props has a higher precedence
  let computedProps : any = {}

  let incomingProps = { ...aIncomingProps }
  delete incomingProps.children

  let incomingPropsStyle = incomingProps.style
  delete incomingProps.style

  // console.log(defaultProps, incomingProps);

  if (incomingProps) computedProps = { ...aDefaultProps, ...incomingProps }
  else computedProps = aDefaultProps

  // Pass the merged Style Object instead
  if (incomingPropsStyle) {
    let computedPropsStyle = {}
    computedProps.style = {}
    if (Array.isArray(incomingPropsStyle)) {
      incomingPropsStyle.map(style => {
        if (typeof style === 'number') {
          computedPropsStyle = { ...computedPropsStyle, ...ReactNativePropRegistry.getByID(style) }
        } else {
          computedPropsStyle = { ...computedPropsStyle, ...style }
        }
      })
    } else {
      if (typeof incomingPropsStyle === 'number') {
        computedPropsStyle = ReactNativePropRegistry.getByID(incomingPropsStyle)
      } else {
        computedPropsStyle = incomingPropsStyle
      }
    }

    computedProps.style = { ...aDefaultProps.style, ...computedPropsStyle }
  }

  // console.log("computedProps ", computedProps);

  return computedProps
}

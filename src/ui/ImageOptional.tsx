/**
 * An Image component, but can accept a `errorComponent` prop to display if Image fails loading.
 * Accepts also an imageComponent to replace the <Image> rendered component by default.
 */
import * as React from 'react';
import { ImageProps, TouchableOpacityProps } from 'react-native';

import { Image } from '~/framework/util/media';
import TouchableOpacity from '~/ui/CustomTouchableOpacity';

export type ImageOptionalProps = ImageProps & {
  errorComponent: any;
  imageComponent?: any;
};

export default class ImageOptional extends React.PureComponent<ImageOptionalProps, { isError: boolean }> {
  public constructor(props) {
    super(props);
    this.state = { isError: false };
  }

  public render() {
    const ImageComponent = this.props.imageComponent ? this.props.imageComponent : Image;
    return this.state.isError ? (
      this.props.errorComponent
    ) : (
      <ImageComponent
        {...this.props}
        onError={e => {
          this.setState({
            isError: true,
          });
          if (this.props.onError) this.props.onError(e);
        }}
      />
    );
  }
}

// tslint:disable-next-line:max-classes-per-file
export class TouchableImageOptional extends React.PureComponent<TouchableOpacityProps & ImageOptionalProps, { isActive: boolean }> {
  public constructor(props) {
    super(props);
    this.state = { isActive: true };
  }
  public render() {
    return (
      <TouchableOpacity
        onPress={event => (this.state.isActive && this.props.onPress ? this.props.onPress(event) : false)}
        onLongPress={event => (this.state.isActive && this.props.onLongPress ? this.props.onLongPress(event) : false)}
        onPressIn={event => (this.state.isActive && this.props.onPressIn ? this.props.onPressIn(event) : false)}
        onPressOut={event => (this.state.isActive && this.props.onPressOut ? this.props.onPressOut(event) : false)}>
        <ImageOptional
          {...this.props}
          onError={() => {
            this.setState({ isActive: false });
          }}
        />
      </TouchableOpacity>
    );
  }
}

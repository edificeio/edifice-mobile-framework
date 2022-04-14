import I18n from 'i18n-js';
import React from 'react';
import { Platform, SafeAreaView, StatusBar, TouchableOpacity, View, ViewStyle } from 'react-native';



import { UI_SIZES } from '~/framework/components/constants';
import { mainNavNavigate } from '~/navigation/helpers/navHelper';
import { Loading } from '~/ui/Loading';



import { MediaAction } from './MediaAction';
import { Italic } from './Typography';
import { SafeWebView } from './Webview';


export class IFrame extends React.Component<
  {
    source: string;
    style?: ViewStyle;
    navigation: any;
  },
  {
    httpError: boolean;
    loaded: boolean;
  }
> {
  state = {
    httpError: false,
    loaded: false,
  };

  render() {
    const { source, style = {}, navigation } = this.props;
    const { httpError, loaded } = this.state;
    const fullScreenSource = navigation && navigation.getParam('source');
    const isEducationApp =
      (source && source.includes('learningapps')) ||
      (source && source.includes('educaplay')) ||
      (source && source.includes('edumedia'));
    return (
      // "overflow: hidden" prevents a display bug on Android
      <SafeAreaView style={{ flex: 1, overflow: 'hidden', ...style }}>
        {fullScreenSource ? <StatusBar backgroundColor="rgba(0,0,0,0.90)" barStyle="dark-content" /> : null}
        <TouchableOpacity
          activeOpacity={1}
          style={{
            flex: 1,
            backgroundColor: '#eeeeee',
            aspectRatio: fullScreenSource ? undefined : isEducationApp ? 4 / 3 : 16 / 9,
            justifyContent: httpError ? 'center' : undefined,
            alignItems: httpError ? 'center' : undefined,
          }}>
          {httpError ? (
            <Italic>{I18n.t('common-ErrorLoadingResource')}</Italic>
          ) : (
            <SafeWebView
              style={{ alignSelf: 'stretch' }}
              source={{ uri: source || fullScreenSource }}
              renderLoading={() => (
                <View
                  style={{
                    backgroundColor: '#eeeeee',
                    height: '100%',
                    width: '100%',
                  }}>
                  <Loading />
                </View>
              )}
              scrollEnabled={false}
              startInLoadingState
              mediaPlaybackRequiresUserAction
              onHttpError={() => this.setState({ httpError: true })}
              onLoadEnd={() => this.setState({ loaded: true })}
              /* On Android, the status bar is by default visible, even when a video is playing fullscreen */
              /* Thanks for the tip, Nabil ! :) */
              {...(Platform.OS === 'android'
                ? {
                    injectedJavaScript: `
                          let isFullscreen = false;
                          function check() {
                            if (isFullscreen) {
                              window.postMessage("-fullscreen-off");
                            } else {
                              window.postMessage("-fullscreen-on");
                            }
                            isFullscreen = !isFullscreen;
                          }
                          document.addEventListener('webkitfullscreenchange', function(e) {
                              check();
                          }, false);
                          document.addEventListener('mozfullscreenchange', function(e) {
                              check();
                          }, false);
                          document.addEventListener('fullscreenchange', function(e) {
                              check();
                          }, false);
                        `,
                    onMessage: (data: any) => {
                      if (data.nativeEvent.data === '-fullscreen-off') StatusBar.setHidden(false);
                      else if (data.nativeEvent.data === '-fullscreen-on') StatusBar.setHidden(true);
                    },
                  }
                : {})}
            />
          )}
        </TouchableOpacity>
        {fullScreenSource ? (
          <MediaAction
            iconName="fullscreen-off"
            action={() => navigation.goBack()}
            customStyle={{
              backgroundColor: 'rgba(63,63,63,0.8)',
              top: UI_SIZES.screen.topInset,
            }}
          />
        ) : null}
        {isEducationApp && loaded ? (
          <TouchableOpacity
            onPress={() => mainNavNavigate('iframeModal', { source })}
            style={{
              position: 'absolute',
              zIndex: 1,
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <MediaAction
              iconName="fullscreen-on"
              action={() => mainNavNavigate('iframeModal', { source })}
              customStyle={{
                height: 70,
                width: 70,
                borderRadius: 35,
                position: 'relative',
                top: undefined,
                right: undefined,
                backgroundColor: 'rgba(63,63,63,0.8)',
              }}
              customIconSize={30}
            />
          </TouchableOpacity>
        ) : null}
      </SafeAreaView>
    );
  }
}
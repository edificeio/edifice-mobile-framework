import React from "react";
import { View, Platform, StatusBar, ViewStyle, TouchableOpacity } from "react-native";
import WebView from "react-native-webview";
import { Loading } from ".";

interface IIFrameProps {
  source: string;
  style?: ViewStyle;
}

export const IFrame = ({source, style ={}}: IIFrameProps) => {
  return (
    // `overflow: hidden` prevent a display bug on Android
    <TouchableOpacity activeOpacity={1} style={{ height: 200, overflow: "hidden", ...style }}>
      <WebView
        style={{ alignSelf: "stretch" }}
        source={{ uri: source }}
        renderLoading={() => (
          <View
            style={{
              backgroundColor: "#eeeeee",
              height: "100%",
              width: "100%"
            }}
          >
            <Loading />
          </View>
        )}
        scrollEnabled={false}
        startInLoadingState
        mediaPlaybackRequiresUserAction
        useWebKit
        /* On Android, the status bar is by default visible, even when a video is playing fullscreen */
        /* Thanks for the tip, Nabil ! :) */
        {...(Platform.OS === "android"
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
                if (data.nativeEvent.data === "-fullscreen-off")
                  StatusBar.setHidden(false);
                else if (data.nativeEvent.data === "-fullscreen-on")
                  StatusBar.setHidden(true);
              }
            }
          : {})}
      />
    </TouchableOpacity>
  );
}

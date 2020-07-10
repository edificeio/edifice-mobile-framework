/**
 * Player (audio/video)
 */

import I18n from "i18n-js";
import * as React from "react";
import { View, ViewStyle, Dimensions, TouchableOpacity, Platform } from "react-native";
import VideoPlayer from "react-native-video";
import VideoPlayerAndroid from "react-native-video-player";
import { signURISource } from "../infra/oauth";
import { CommonStyles } from "../styles/common/styles";
import { TextItalic } from "./text";
import { Loading } from "./Loading";

export interface IPlayerProps {
  source: string;
  type: string;
  style?: ViewStyle;
}

interface IPlayerState {
  loaded: boolean;
  error: boolean;
  videoRatio: number;
}

// tslint:disable-next-line:max-classes-per-file
export default class Player extends React.Component<
  IPlayerProps,
  IPlayerState
> {
  public state = {
    loaded: false,
    error: false,
    videoRatio: 0
  };

  public render() {
    const { source, type, style } = this.props;
    const { error, videoRatio, loaded } = this.state;
    const { height } = Dimensions.get("window");
    const playerProps = {
      source: signURISource(source),
      onLoad: res => {
        const { width, height } = res.naturalSize;
        const videoRatio = height !== 0 ? width / height : 0;
        this.setState({ videoRatio, loaded: true });
      },
      onError: err => {
        console.log("video error:", err);
        this.setState({ error: true });
      },
      style: {
        backgroundColor: "black",
        width: "100%",
        maxHeight: "100%",
        aspectRatio: type === "video"
          ? videoRatio ? videoRatio : 16/9
          : type === "audio"
          ? 9/2
          : undefined,
        borderRadius: Platform.OS === "ios" && type=== "audio" ? 12 : undefined,
        opacity: loaded ? 1 : 0
      },
      controlTimeout: 0,
      seekColor: CommonStyles.actionColor,
      paused: true,
      disableBack: true,
      disableVolume: true,
      disableFullscreen: true,
      controls: Platform.OS === "ios"
    }

    if (!source) {
      this.setState({ error: true });
      return null;
    }

    return (
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          height: type === "video" ? 0.33 * height : type === "audio" ? 84 : undefined,
          ...style
        }}
      >
        {!loaded
        ? <View style={{ position: "absolute" }}>
            <Loading/>
          </View>
        : null
        }
        {error
        ? <TextItalic>{I18n.t(`${type}NotAvailable`)}</TextItalic>
        : <TouchableOpacity activeOpacity={1}>
            {Platform.select({
              ios: <VideoPlayer {...playerProps}/>,
              android: <VideoPlayerAndroid video={signURISource(source)}/>,
              default: null
            })}
          </TouchableOpacity>
        }
      </View>
    );
  }
}

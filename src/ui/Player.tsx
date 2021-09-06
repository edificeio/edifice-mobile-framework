/**
 * Player (audio/video)
 */

import I18n from "i18n-js";
import * as React from "react";
import { View, ViewStyle, Dimensions, TouchableOpacity, Platform, Image, ImageURISource } from "react-native";
import VideoPlayer from "react-native-video";
import VideoPlayerAndroid from "react-native-video-player";
import { TextItalic } from "../framework/components/text";
import { Loading } from "./Loading";
import { MediaAction } from "./MediaAction";

export interface IPlayerProps {
  type: "audio" | "video";
  source: ImageURISource;
  posterSource?: ImageURISource;
  ratio?: number;
  style?: ViewStyle;
}

interface IPlayerState {
  loadMedia: boolean;
  loaded: boolean;
  error: boolean;
}

// tslint:disable-next-line:max-classes-per-file
export default class Player extends React.Component<
  IPlayerProps,
  IPlayerState
> {
  public state = {
    loadMedia: false,
    loaded: false,
    error: false
  };

  public render() {
    const { type, source, posterSource, ratio, style } = this.props;
    const { loadMedia, loaded, error } = this.state;
    const { height } = Dimensions.get("window");
    const thirdOfScreenHeight = 0.33 * height;
    const isAudio = type === "audio";
    const isVideo = type === "video";
    const playerStyle = {
      width: "100%",
      maxHeight: "100%",
      aspectRatio: isVideo
        ? ratio || 16/9
        : isAudio
        ? 9/2
        : undefined,
      borderRadius: isAudio ? 12 : undefined
    }

    const getPlayer = () => {
      return (
        <>
          {!loaded
            ? <Loading customStyle={{ position: "absolute" }}/>
            : error
            ? <TextItalic style={{ position: "absolute" }}>{I18n.t(`${type || "media"}NotAvailable`)}</TextItalic>
            :  null
          }
          <TouchableOpacity activeOpacity={1}>
            {Platform.select({
              ios: 
                <VideoPlayer
                  source={source}
                  onLoad={() => this.setState({ loaded: true })}
                  onError={() => this.setState({ error: true, loaded: true })}
                  controls
                  style={playerStyle}
                />,
              android: 
                <VideoPlayerAndroid
                  video={source}
                  onLoad={() => this.setState({ loaded: true })}
                  onError={() => this.setState({ error: true, loaded: true })}
                  autoplay
                  disableFullscreen={isAudio}
                  loaded={loaded}
                  type={type}
                  style={{...playerStyle, alignSelf: "center", backgroundColor: loaded ? "#000" : undefined}}
                  customStyles={isAudio ? {controls: {backgroundColor: undefined}} : undefined}
                />,
              default: null
            })}
          </TouchableOpacity>
        </>
      )
    }

    const getPreview = () => {
      return !source || !type
        ? <TextItalic>{I18n.t(`${type || "media"}NotAvailable`)}</TextItalic>
        : <>
            {isVideo
              ? <Image
                  source={posterSource || {}}
                  style={playerStyle}
                  resizeMode="contain"
                />
              : null
            }
            <TouchableOpacity
              onPress={() => this.setState({loadMedia: true})}
              style={{ position: "absolute" }}
            >
              <MediaAction
                iconName="play"
                customIconSize={30}
                action={() => this.setState({loadMedia: true})}
                customStyle={{
                  height: 70,
                  width: 70,
                  borderRadius: 35,
                  position: "relative",
                  top: undefined,
                  right: undefined,
                  paddingLeft: 4,
                  backgroundColor: "rgba(63,63,63,0.8)"
                }}
              />
            </TouchableOpacity>
          </>
    }

    return (
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          height: !type || (isVideo && !source) ? thirdOfScreenHeight : isAudio ? 84 : undefined,
          maxHeight: isVideo ? thirdOfScreenHeight : undefined,
          backgroundColor: "#000",
          ...style
        }}
      >
        {loadMedia ? getPlayer() : getPreview()}
      </View>
    );
  }
}

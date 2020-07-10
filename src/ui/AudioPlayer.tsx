/**
 * Audio player
 */

import I18n from "i18n-js";
import * as React from "react";
import { Platform, Text, View, ViewStyle } from "react-native";
import RNFS from "react-native-fs";
import VideoPlayer from "react-native-video-controls";
import RNFetchBlob from "rn-fetch-blob";
import { Loading } from ".";
import { getAuthHeader } from "../infra/oauth";
import { CommonStyles } from "../styles/common/styles";
import { TextItalic } from "./text";

export interface IAudioPlayerProps {
  source: string;
  style?: ViewStyle;
}

interface IAudioPlayerState {
  isError: boolean;
  localFile: any;
}

class CustomRNVideoPlayerControls extends VideoPlayer<
  IAudioPlayerProps,
  IAudioPlayerState
> {
  public props: any; // For typings
  public state: any; // For typings

  public constructor(props) {
    super(props);
  }

  // Disable the timeout that hides the controls
  public setControlTimeout() {
    return;
  }
  public resetControlTimeout() {
    return;
  }
  public clearControlTimeout() {
    return;
  }
  public hideControlAnimation() {
    return;
  }
  public _hideControls() {
    return;
  }

  public calculateTime() {
    /* if (this.state.showTimeRemaining) {
      const time = this.state.duration - this.state.currentTime;
      return `-${this.formatTime(time)}`;
    }*/

    return (
      this.formatTime(this.state.currentTime) +
      " / " +
      this.formatTime(this.state.duration)
    );
  }

  public renderTimer() {
    return this.renderControl(
      <Text
        style={{
          backgroundColor: "transparent",
          color: "#FFF",
          fontSize: 11,
          textAlign: "right"
        }}
      >
        {this.calculateTime()}
      </Text>,
      this.methods.toggleTimer,
      { width: 160 }
    );
  }
}

// tslint:disable-next-line:max-classes-per-file
export default class AudioPlayer extends React.Component<
  IAudioPlayerProps,
  IAudioPlayerState
> {
  public state = {
    isError: false,
    localFile: null
  };

  public async componentDidMount() {
    // console.log("props uri", this.props.source);
    if (Platform.OS === "ios") {
      this.iOSLoadAudio();
    } else if (Platform.OS === "android") {
      this.androidLoadAudio();
    }
  }

  public render() {
    if (!this.props.source) {
      this.setState({ isError: true });
      return null;
    }

    if (!this.state.localFile) {
      return (
        <View
          style={{
            backgroundColor: CommonStyles.entryfieldBorder,
            height: 84,
            width: "100%",
            ...this.props.style,
            overflow: "hidden"
          }}
        >
          <Loading />
        </View>
      );
    }

    // console.log({ uri: "file://" + this.state.localFile });

    return (
      <View
        style={{
          backgroundColor: CommonStyles.entryfieldBorder,
          height: 84,
          width: "100%",
          ...this.props.style,
          overflow: "hidden"
        }}
      >
        {this.state.isError ? (
          <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
            <TextItalic>{I18n.t("soundNotAvailable")}</TextItalic>
          </View>
        ) : (
          /*
          <WebView
            style={{ alignSelf: "stretch" }}
            source={{
              html: this.state.data
                ? `<audio controls src="data:audio/mp3;base64,${
                    this.state.data
                  }"></audio>`
                : `<i>Loading...</i>`
            }}
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
            startInLoadingState={true}
            scrollEnabled={false}
            useWebKit={true}
          />
          */
          <CustomRNVideoPlayerControls
            source={{ uri: "file://" + this.state.localFile }}
            // onLoadStart={err => console.log("START", err)}
            // onLoad={err => console.log("LOAD", err)}
            onError={err => {
              console.log("err video", err);
              this.setState({ isError: true });
            }}
            // onProgress={a => console.log("progress", a)}
            controlTimeout={0}
            seekColor={CommonStyles.actionColor}
            audioOnly={true}
            paused={true}
            style={{
              backgroundColor: "black",
              bottom: 0,
              left: 0,
              position: "absolute",
              right: 0,
              top: 0
            }}
            disableFullscreen
            disableBack
            disableVolume
          />
        )}
      </View>
    );
  }

  protected iOSLoadAudio() {
    // TODO use an unique filename here
    const path = `${RNFS.DocumentDirectoryPath}/react-native.mp3`;
    // console.log("out path", path);
    try {
      RNFS.downloadFile({
        fromUrl: this.props.source,
        headers: getAuthHeader(),
        toFile: path
      })
        .promise.then(r => {
          // console.log("DONE");
          this.setState({
            localFile: path
          });
          /*
            RNFS.stat(path)
              .then(res => console.log(res))
              .catch(e => {
                console.warn(e);
                this.setState({ isError: true });
              });
            */
        })
        .catch(e => {
          console.warn(e);
          this.setState({ isError: true });
        });
    } catch (e) {
      console.warn(e);
      this.setState({ isError: true });
    }
  }

  protected androidLoadAudio() {
    try {
      RNFetchBlob.config({
        fileCache: true
      })
        .fetch("GET", this.props.source, getAuthHeader())
        .then(res => {
          // the temp file path
          this.setState({
            localFile: res.path()
          });
          // console.log("The file saved to ", res.path());
          /*
          RNFS.stat(res.path())
            .then(res => console.log(res))
            .catch(e => console.warn(e));
          */
        });
    } catch (e) {
      console.warn(e);
      this.setState({ isError: true });
    }
  }
}

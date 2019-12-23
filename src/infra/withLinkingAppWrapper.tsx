import * as React from "react";
import RNFileShareIntent from "react-native-file-share-intent";
import { NativeEventEmitter, NativeModules, Platform } from "react-native";
import { mainNavNavigate } from "../navigation/helpers/navHelper";
import { FilterId } from "../workspace/types/filters";
import I18n from "i18n-js";
import { ContentUri } from "../types/contentUri";

export default function withLinkingAppWrapper(WrappedComponent: React.Component): React.Component {
  class HOC extends React.Component {
    eventEmitter: NativeEventEmitter | null = null;

    public componentDidMount() {
      if (Platform.OS === "android") {
        RNFileShareIntent.getFilePath((contentUri: ContentUri) => {
          this.navigate(contentUri);
        });

        this.eventEmitter = new NativeEventEmitter(NativeModules.RNFileShareIntent);

        this.eventEmitter.addListener("FileShareIntent", (contentUri: ContentUri) => {
          this.navigate(contentUri);
        });
      }
    }

    private navigate(contentUri: ContentUri) {
      mainNavNavigate("Workspace", {
        contentUri: null,
        filter: FilterId.root,
        parentId: FilterId.root,
        title: I18n.t("workspace"),
        childRoute: "Workspace",
        childParams: {
          parentId: "owner",
          filter: FilterId.owner,
          title: I18n.t("owner"),
          contentUri: [contentUri],
        },
      });
    }

    public componentWillUnmount(): void {
      if (Platform.OS === "android") this.eventEmitter?.removeListener("FileShareIntent", this.navigate);
    }

    public render() {
      return <WrappedComponent {...this.props} />;
    }
  }

  return HOC;
}

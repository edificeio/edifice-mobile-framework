import * as React from "react";
import RNFileShareIntent from "react-native-file-share-intent";
import { NativeEventEmitter, NativeModules, Platform } from "react-native";
import I18n from "i18n-js";
import { mainNavNavigate } from "../../navigation/helpers/navHelper";
import { FilterId } from "../../workspace/types/filters";
import { ContentUri } from "../../types/contentUri";
import {contentUriAction} from "../../workspace/actions/contentUri";
import {isInOwnerWorkspace} from "../../navigation/NavigationService";

export interface IProps {
  dispatch: any,
}

export default function withLinkingAppWrapper<T extends IProps>(
  WrappedComponent: React.ComponentType<T>,
): React.ComponentType<T> {
  return class extends React.PureComponent<T> {
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
      this.props.dispatch( contentUriAction(contentUri instanceof Array ? contentUri :  [contentUri]))
      RNFileShareIntent.clearFilePath();

      // check to see if already in workspace
      if (!isInOwnerWorkspace())
        mainNavNavigate("Workspace", {
          filter: FilterId.root,
          parentId: FilterId.root,
          title: I18n.t("workspace"),
          childRoute: "Workspace",
          childParams: {
            parentId: "owner",
            filter: FilterId.owner,
            title: I18n.t("owner"),
          },
        });
    }

    public componentWillUnmount(): void {
      if (Platform.OS === "android") {
        this.eventEmitter && this.eventEmitter.removeListener("FileShareIntent", this.navigate);
      }
    }

    public render() {
      return <WrappedComponent {...this.props} />;
    }
  };
}

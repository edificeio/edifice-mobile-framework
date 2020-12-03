import * as React from "react";
import I18n from "i18n-js";
import { connect } from "react-redux";
import DeviceInfo from 'react-native-device-info';

import { logout } from "../actions/login";
import { ButtonsOkCancel } from "../../ui";
import {
  ButtonLine,
  ContainerSpacer,
  ContainerView
} from "../../ui/ButtonLine";
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { PageContainer } from "../../ui/ContainerContent";
import {
  ModalBox,
  ModalContent,
  ModalContentBlock,
  ModalContentText
} from "../../ui/Modal";
import { Label, } from "../../ui/Typography";

import { getSessionInfo } from "../../App";
import { UserCard } from "../components/UserCard";
import { NavigationScreenProp } from "react-navigation";
import { standardNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { Dispatch } from "redux";
import withViewTracking from "../../infra/tracker/withViewTracking";
import { profileUpdateAction } from "../actions/profile";
import pickFile from "../../infra/actions/pickFile";
import { ContentUri } from "../../types/contentUri";
import { uploadDocument, formatResults } from "../../workspace/actions/helpers/documents";
import { OAuth2RessourceOwnerPasswordClient, signURISource } from "../../infra/oauth";
import Conf from "../../../ode-framework-conf";
import Notifier from "../../infra/notifier/container";
import { IUserInfoState } from "../state/info";
import { notifierShowAction } from "../../infra/notifier/actions";
import { Trackers } from "../../infra/tracker";

export const UserPageNavigationOptions = ({ navigation }: { navigation: NavigationScreenProp<{}> }) =>
  standardNavScreenOptions(
    {
      headerBackTitle: null,
      title: I18n.t("MyAccount"),
    },
    navigation
  );

  const pickImageError = () => {
    return (dispatch) => {
      dispatch(notifierShowAction({
        id: "profileOne",
        text: I18n.t("common-ErrorStorageAccess"),
        icon: 'close',
        type: 'error'
      }));
      Trackers.trackEvent("Profile", "UPDATE ERROR", "AvatarChangeError");
    }
  }

  const uploadAvatarError = () => {
    return (dispatch) => {
      dispatch(notifierShowAction({
        id: "profileOne",
        text: I18n.t("ProfileChangeAvatarErrorUpload"),
        icon: 'close',
        type: 'error'
      }));
      Trackers.trackEvent("Profile", "UPDATE ERROR", "AvatarChangeError");
    }
  }

// tslint:disable-next-line:max-classes-per-file
export class UserPage extends React.PureComponent<
  {
    onLogout: () => Promise<void>;
    onUploadAvatar: (avatar: ContentUri[]) => Promise<void>;
    onUpdateAvatar: (uploadedAvatarUrl: string) => Promise<void>;
    onPickImageError: () => void;
    onUploadAvatarError: () => void;
    userinfo: IUserInfoState;
    navigation: any;
  },
  { showDisconnect: boolean, updatingAvatar: boolean }
> {
  public state = {
    showDisconnect: false,
    updatingAvatar: false
  };

  public disconnect() {
    this.setState({ showDisconnect: false });
    this.props.onLogout();
  }

  public disconnectBox = () => (
    <ModalContent>
      <ModalContentBlock>
        <ModalContentText>
          {I18n.t("common-confirm")}
          {"\n"}
          {I18n.t("auth-disconnectConfirm")}
        </ModalContentText>
      </ModalContentBlock>
      <ModalContentBlock>
        <ButtonsOkCancel
          onCancel={() => this.setState({ showDisconnect: false })}
          onValid={() => this.disconnect()}
          title={I18n.t("directory-disconnectButton")}
        />
      </ModalContentBlock>
    </ModalContent>
  ); // TS-ISSUE

  public render() {
    //avoid setstate on modalbox when unmounted
    const { onUploadAvatar, onUpdateAvatar, onPickImageError, onUploadAvatarError, userinfo } = this.props;
    const { showDisconnect, updatingAvatar } = this.state;
    const signedURISource = userinfo.photo && signURISource(`${(Conf.currentPlatform as any).url}${userinfo.photo}`)
    // FIXME (Hack): we need to add a variable param to force the call on Android for each session
    // (otherwise, a previously-loaded image is retrieved from cache)
    const sourceWithParam = signedURISource && {
      ...signedURISource,
      uri: `${signedURISource && signedURISource.uri}?uti=${OAuth2RessourceOwnerPasswordClient.connection?.getUniqueSessionIdentifier()}`
    }

    return (
      <PageContainer>
        <ConnectionTrackingBar/>
        <Notifier id="profileOne"/>
        {showDisconnect && (
          <ModalBox backdropOpacity={0.5} isVisible={showDisconnect}>
            {this.disconnectBox()}
          </ModalBox>
        )}
        <UserCard
          canEdit
          hasAvatar={userinfo.photo !== ""}
          updatingAvatar={updatingAvatar}
          onChangeAvatar={async () => {
            try {
              const selectedImage = await pickFile(true);
              this.setState({ updatingAvatar: true })
              const response = await onUploadAvatar([selectedImage]);

              const data = response.map(item => JSON.parse(item));
              const formattedData = formatResults(data);
              const uploadedAvatar = Object.values(formattedData)[0];
              const uploadedAvatarUrl = uploadedAvatar.url;
              await onUpdateAvatar(uploadedAvatarUrl);
            } catch (err) {
              if (err.message === "Error picking image") {
                onPickImageError();
              } else if (!(err instanceof Error)) {
                onUploadAvatarError();
              }
            } finally {
              this.setState({updatingAvatar: false});
            }}
          }
          onDeleteAvatar={async () => {
            try {
              this.setState({updatingAvatar: true});
              await onUpdateAvatar("");
            } finally {
              this.setState({updatingAvatar: false});
            }
          }}
          id={sourceWithParam}
          displayName={getSessionInfo().displayName!}
          type={getSessionInfo().type!}
          touchable={true}
          onPress={() => this.props.navigation.navigate("MyProfile")}
        />
        <ContainerSpacer />
        <ButtonLine
          title={"directory-structuresTitle"}
          onPress={() => this.props.navigation.navigate("Structures")}
        />
        <ContainerSpacer />
        {getSessionInfo().type === "Student" ? <>
          <ButtonLine
            title={"directory-relativesTitle"}
            onPress={() => this.props.navigation.navigate("Relatives")}
          />
          <ContainerSpacer />
        </> :
        getSessionInfo().type === "Relative" ? <>
          <ButtonLine
            title={"directory-childrenTitle"}
            onPress={() => this.props.navigation.navigate("Children")}
          />
          <ContainerSpacer />
        </> :
        null}
        <ButtonLine
          title={"directory-notificationsTitle"}
          onPress={() => this.props.navigation.navigate("NotifPrefs")}
        />
        <ContainerSpacer />
        <ContainerView>
          <Label>
            {I18n.t("version-number")} {DeviceInfo.getVersion()}
          </Label>
        </ContainerView>
        <ContainerSpacer />
        <ButtonLine
          title={"directory-disconnectButton"}
          hideIcon={true}
          color={"#F64D68"}
          onPress={() => this.setState({ showDisconnect: true })}
        />
      </PageContainer>
    );
  }
}

const UserPageConnected = connect(
  (state: any) => {
    const ret = {
      userinfo: state.user.info
    }
    return ret;
  },
  (dispatch: Dispatch) => ({
    onLogout: () => dispatch<any>(logout()),
    onPickImageError: () => dispatch(pickImageError()),
    onUploadAvatarError: () => dispatch(uploadAvatarError()),
    onUploadAvatar: (avatar: ContentUri[]) => uploadDocument(dispatch, avatar),
    onUpdateAvatar: (imageWorkspaceUrl: string) => dispatch(profileUpdateAction({picture: imageWorkspaceUrl}, true))
  })
)(UserPage);

export default withViewTracking("user")(UserPageConnected);

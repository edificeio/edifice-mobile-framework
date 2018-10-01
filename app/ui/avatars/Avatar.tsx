import style from "glamorous-native";
import * as React from "react";
import RNFetchBlob from "react-native-fetch-blob";
import { View } from "react-native";
import { Conf } from "../../Conf";
import { usersAvatars, setUsersAvatars } from "../../infra/Cache";
import { Connection } from "../../infra/Connection";

const avatarsMap = {
  loaded: false,
  awaiters: [],
  onload: function(cb: (userId: string) => void) {
    this.awaiters.push(cb);
  },
  trigger: function(userId: string) {
    this.awaiters.forEach(a => a(userId));
  },
  load: async () => {
    if (this.loaded) {
      return;
    }
    const avatars = await usersAvatars();
    for (let user in avatars) {
      if (user !== "awaiters") {
        avatarsMap[user] = avatars[user];
      }
    }
    this.loaded = true;
  },
  save: () => {
    setUsersAvatars(avatarsMap);
  }
} as any;

export enum Size {
  aligned,
  large,
  small,
  verylarge
}
const StyledImage = {
  borderColor: "white",
  borderWidth: 1
};

const LargeImage = style.image({
  ...StyledImage,
  borderRadius: 24,
  height: 45,
  width: 45
});

const MediumImage = style.image({
  ...StyledImage,
  borderRadius: 16,
  height: 35,
  width: 35
});

const AlignedContainer = style.view(
  {
    borderRadius: 16,
    height: 29,
    marginRight: -4,
    marginLeft: -4,
    width: 29,
    backgroundColor: "#EEEEEE"
  },
  ({ index }) => ({
    zIndex: 100 - index
  })
);

const VLContainer = style.view({
  alignSelf: "center",
  borderRadius: 35,
  height: 71,
  width: 71,
  margin: 0,
  backgroundColor: "#EEEEEE"
});

const LargeContainer = style.view({
  borderRadius: 24,
  height: 45,
  width: 45,
  backgroundColor: "#EEEEEE"
});

const MediumContainer = style.view({
  borderRadius: 16,
  height: 35,
  width: 35,
  backgroundColor: "#EEEEEE"
});

const AlignedImage = style.image({
  ...StyledImage,
  borderRadius: 16,
  height: 29,
  width: 29
});

const VeryLargeImage = style.image(
  {
    ...StyledImage,
    alignSelf: "center",
    borderRadius: 35,
    height: 71,
    width: 71,
    margin: 0
  },
  ({ decorate }) => ({
    borderWidth: decorate ? 1 : 0
  })
);

const SmallImage = style.image(
  {
    borderColor: "white",
    borderWidth: 1
  },
  ({ count }) => ({
    borderRadius: count === 1 ? 22 : count === 2 ? 15 : 10,
    height: count === 1 ? 45 : count === 2 ? 31 : 22,
    width: count === 1 ? 45 : count === 2 ? 31 : 22
  })
);

const SmallContainer = style.view(
  {
    position: "absolute",
    backgroundColor: "#EEEEEE"
  },
  ({ count, index }) => ({
    borderRadius: count === 1 ? 22 : count === 2 ? 15 : 10,
    height: count === 1 ? 45 : count === 2 ? 31 : 22,
    left:
      count === 2
        ? index === 0
          ? 0
          : 15
        : index === 0 || (index === 2 && count === 4)
          ? 0
          : index === 2
            ? 14
            : 25,
    top: count === 2 ? (index === 0 ? 0 : 15) : index < 2 ? 0 : 25,
    width: count === 1 ? 45 : count === 2 ? 31 : 22
  })
);

export interface IAvatarProps {
  count?: number;
  decorate?: boolean;
  id: string;
  index?: number;
  large?: boolean;
  size: Size;
  width?: number;
}

export class Avatar extends React.Component<
  IAvatarProps,
  { loaded: boolean; noAvatar: boolean }
> {
  decorate: boolean;
  count: number;

  constructor(props) {
    super(props);

    this.decorate = true;
    if (this.props.decorate !== undefined) {
      this.decorate = this.props.decorate;
    }

    this.state = { loaded: false, noAvatar: true };
  }

  componentDidMount() {
    //render avatars after content
    setTimeout(() => this.load(), 100);
  }

  get isGroup() {
    return this.props.id.length < 36;
  }

  async load() {
    await avatarsMap.load();

    if (!this.props.id) {
      this.setState({ loaded: true, noAvatar: true });
      return;
    }

    if (this.isGroup) {
      this.setState({ loaded: true });
      return;
    }

    if (avatarsMap[this.props.id]) {
      if (avatarsMap[this.props.id].loading) {
        avatarsMap.onload(userId => {
          if (userId === this.props.id) {
            this.setState({
              loaded: true,
              noAvatar: avatarsMap[this.props.id].noAvatar
            });
          }
        });
        return;
      }

      this.setState({
        loaded: true,
        noAvatar: avatarsMap[this.props.id].noAvatar
      });
      return;
    }

    avatarsMap[this.props.id] = { loading: true };
    const response = await RNFetchBlob.fetch(
      "GET",
      `${Conf.platform}/userbook/avatar/${this.props.id}?thumbnail=48x48`
    );
    if (response.type === "utf8") {
      this.setState({ loaded: true, noAvatar: true });
    } else {
      this.setState({ loaded: true, noAvatar: false });
    }
    avatarsMap[this.props.id] = { noAvatar: this.state.noAvatar };
    avatarsMap.trigger(this.props.id);
    avatarsMap.save();
  }

  renderNoAvatar(width) {
    if (this.props.size === Size.large || this.count === 1) {
      return (
        <LargeContainer style={{ width: width, height: width }}>
          <LargeImage
            style={{ width: width, height: width }}
            source={require("../../../assets/images/no-avatar.png")}
          />
        </LargeContainer>
      );
    } else if (this.props.size === Size.aligned) {
      return (
        <AlignedContainer index={this.props.index}>
          <AlignedImage
            source={require("../../../assets/images/no-avatar.png")}
          />
        </AlignedContainer>
      );
    } else if (this.props.size === Size.verylarge) {
      return (
        <VLContainer>
          <VeryLargeImage
            decorate={this.decorate}
            source={require("../../../assets/images/no-avatar.png")}
          />
        </VLContainer>
      );
    } else {
      return (
        <SmallContainer count={this.props.count || 1} index={this.props.index}>
          <SmallImage
            count={this.props.count || 1}
            source={require("../../../assets/images/no-avatar.png")}
          />
        </SmallContainer>
      );
    }
  }

  renderIsGroup(width) {
    if (this.props.size === Size.large || this.count === 1) {
      return (
        <LargeContainer style={{ width: width, height: width }}>
          <LargeImage
            style={{ width: width, height: width }}
            source={require("../../../assets/images/group-avatar.png")}
          />
        </LargeContainer>
      );
    } else if (this.props.size === Size.aligned) {
      return (
        <AlignedContainer index={this.props.index}>
          <AlignedImage
            source={require("../../../assets/images/group-avatar.png")}
          />
        </AlignedContainer>
      );
    } else if (this.props.size === Size.verylarge) {
      return (
        <VLContainer>
          <VeryLargeImage
            decorate={this.decorate}
            source={require("../../../assets/images/group-avatar.png")}
          />
        </VLContainer>
      );
    } else {
      return (
        <SmallContainer count={this.props.count || 1} index={this.props.index}>
          <SmallImage
            count={this.props.count || 1}
            source={require("../../../assets/images/group-avatar.png")}
          />
        </SmallContainer>
      );
    }
  }

  render() {
    let width = 45;
    if (this.props.width) {
      width = this.props.width;
    }

    if (!this.state.loaded || !Connection.isOnline) {
      return this.renderNoAvatar(width);
    }

    if (this.isGroup) {
      return this.renderIsGroup(width);
    }
    if (this.state.noAvatar) {
      return this.renderNoAvatar(width);
    }
    if (this.props.size === Size.large || this.count === 1) {
      return (
        <LargeContainer style={{ width: width, height: width }}>
          <LargeImage
            source={{
              uri: `${Conf.platform}/userbook/avatar/${
                this.props.id
              }?thumbnail=100x100`
            }}
            style={{ width: width, height: width }}
          />
        </LargeContainer>
      );
    } else if (this.props.size === Size.aligned) {
      return (
        <AlignedContainer index={this.props.index}>
          <AlignedImage
            source={{
              uri: `${Conf.platform}/userbook/avatar/${
                this.props.id
              }?thumbnail=100x100`
            }}
          />
        </AlignedContainer>
      );
    } else if (this.props.size === Size.verylarge) {
      return (
        <VLContainer>
          <VeryLargeImage
            decorate={this.decorate}
            source={{
              uri: `${Conf.platform}/userbook/avatar/${
                this.props.id
              }?thumbnail=150x150`
            }}
          />
        </VLContainer>
      );
    } else {
      return (
        <SmallContainer count={this.props.count || 1} index={this.props.index}>
          <SmallImage
            count={this.props.count || 1}
            source={{
              uri: `${Conf.platform}/userbook/avatar/${
                this.props.id
              }?thumbnail=100x100`
            }}
          />
        </SmallContainer>
      );
    }
  }
}

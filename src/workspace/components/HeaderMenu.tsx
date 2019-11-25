import * as React from "react";

import { View, TouchableOpacity, LayoutChangeEvent, StyleSheet, Dimensions } from "react-native";
import { Icon } from "../../ui";
import ElevatedComponent, { elevatedComponentStyle } from "../../ui/ElevatedComponent";
import { CommonStyles } from "../../styles/common/styles";
import { HeaderIcon } from "../../ui/headers/NewHeader";

interface IHeaderMenuProps {
  items: Array<IHeaderMenuItemProps>;
}

interface IHeaderMenuState {
  displayMenu: boolean;
  containerWidth: number;
}

interface IHeaderMenuItemProps {
  iconName: string;
  label: string;
}

const style = StyleSheet.create({
  container: {
    overflow: "visible",
  },
  absoluteView: {
    flex:1,
    position: "absolute",
    alignItems: "flex-end",
    width: Dimensions.get("window").width * 0.8,
    right: 15,
    zIndex: 100
  },
  button: {
    ...elevatedComponentStyle,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: CommonStyles.secondary,
    marginBottom: 15,
  },
  menu: {
    ...elevatedComponentStyle,
    borderRadius: 10,
    overflow: "hidden",
  },
});

export class HeaderMenu extends React.PureComponent<IHeaderMenuProps, IHeaderMenuState> {
  public constructor(props: IHeaderMenuProps) {
    super(props);

    this.state = { displayMenu: false, containerWidth: 0 };
  }

  private displayMenu = () => {
    this.setState({ displayMenu: !this.state.displayMenu });
  };

  public render() {
    return (
      <View
        onLayout={(event: LayoutChangeEvent) =>
          this.setState({
            containerWidth: event.nativeEvent.layout.width,
          })
        }
        style={style.container}
      >
        <HeaderIcon name={null} hidden={true} />
        <View style={[style.absoluteView, { top: this.state.containerWidth / 3 }]}>
          <TouchableOpacity
            style={[style.button, { width: this.state.containerWidth, borderRadius: this.state.containerWidth / 2 }]}
            onPress={this.displayMenu}
          >
            <Icon name="plus" size={40} color="#FFFFFF" />
          </TouchableOpacity>

          {this.state.displayMenu && (
            <ElevatedComponent style={style.menu}>
              {this.props.items.map((item: IHeaderMenuItemProps) => (
                <Icon.Button
                  numberOfLines={1}
                  borderRadius={0}
                  name={item.iconName}
                  key={item.label}
                  style={{ padding: 15 }}
                  onPress={() => console.log(item.label)}
                  backgroundColor={CommonStyles.secondary}
                >
                  {item.label}
                </Icon.Button>
              ))}
            </ElevatedComponent>
          )}
        </View>
      </View>
    );
  }
}

export default HeaderMenu;

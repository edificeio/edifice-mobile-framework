import * as React from "react"
import { Image, TouchableOpacity, View } from "react-native";
import { IEventProps, IItem, FilterId } from "../types";

import { CommonStyles } from "../../styles/common/styles";
import { Icon } from "../../ui";
import { Text } from "../../ui/text";
import { CenterPanel, LeftPanel } from "../../ui/ContainerContent";
import { layoutSize } from "../../styles/common/layoutSize";
import { DateView } from "../../ui/DateView";
import style from "../../styles"
import { filters } from "../types/filters/helpers/filters";
import Conf from "../../../ode-framework-conf";


export const Item = ({ date, id, isFolder, name, number, onPress, ownerName }: IItem & IEventProps) => {
  return (
    <TouchableOpacity style={style.item_flexrow} onPress={() => onPress(id)}>
      <LeftPanel>
        {renderIcon( id, isFolder, name)}
      </LeftPanel>
      <CenterPanel>
        <View style={style.LeftTopPosition}>
          <Text numberOfLines={1} style={style.textHeader}>{name}</Text>
        </View>
        <View style={style.LeftBottomPosition}>
          <DateView date={date} min/>
        </View>
        <View style={style.RightBottomPosition}>
          <Text style={style.textMin}>{isFolder ? `${number} elements` : ownerName}</Text>
        </View>
      </CenterPanel>
    </TouchableOpacity>
  )
};

const renderIcon = ( id: string | null, isFolder: boolean, name: string): any => {
  const icon = getIcon(id, isFolder, name);

  if (icon)
    return (
      <Icon color={CommonStyles.grey} size={layoutSize.LAYOUT_40} name={icon}/>
    );
  else
    return (
      <Image
        style={{width: layoutSize.LAYOUT_40, height: layoutSize.LAYOUT_40}}
        source={{uri: `${(Conf.currentPlatform as any).url}/workspace/document/${id}?thumbnail=120x120`}}
      />
    )
};

const getIcon = ( id: string | null, isFolder: boolean, name: string): string | null => {

  if (isFolder) {
    switch (filters(id)) {
      case FilterId.owner:
        return "folder1";
      case FilterId.shared:
        return "shared_files";
      case FilterId.protected:
        return "added_files";
      case FilterId.trash:
        return "delete";
      default:
        return "folder1"
    }
  }
  if (name && name.endsWith(".pdf"))
    return "pdf_files";
  return null
};

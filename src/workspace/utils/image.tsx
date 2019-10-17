import { filters } from "../types/filters/helpers/filters";
import { FilterId } from "../types/filters";
import Conf from "../../../ode-framework-conf";
import { Icon } from "../../ui";
import { CommonStyles } from "../../styles/common/styles";
import { layoutSize } from "../../styles/common/layoutSize";
import { Image } from "react-native";
import * as React from "react";

export const renderIcon = ( id: string | null, isFolder: boolean, name: string, style: any): any => {
  const icon = getIcon(id, isFolder, name);
  const uri = `${Conf.currentPlatform.url}/workspace/document/${id}?thumbnail=120x120`

  if (icon)
    return (
      <Icon color={CommonStyles.grey} size={layoutSize.LAYOUT_40} name={icon}/>
    );
  else
    return (
      <Image
        style={style}
        source={{uri}}
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

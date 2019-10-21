import { filters } from "../types/filters/helpers/filters";
import { FilterId } from "../types/filters";
import Conf from "../../../ode-framework-conf";
import { Icon } from "../../ui";
import { CommonStyles } from "../../styles/common/styles";
import {DEVICE_HEIGHT, layoutSize} from "../../styles/common/layoutSize";
import { Image } from "react-native";
import * as React from "react";
import { signUrl } from "../../infra/oauth";

export const renderIcon = ( id: string | null, isFolder: boolean, name: string): any => {
  const icon = getIcon(id, isFolder, name);

  if (icon)
    return (
      <Icon color={CommonStyles.grey} size={layoutSize.LAYOUT_50} name={icon}/>
    );
  else {
    // @ts-ignore
    const uri = `${Conf.currentPlatform.url}/workspace/document/${id}?thumbnail=120x120`
    const style = {width: layoutSize.LAYOUT_50, height: layoutSize.LAYOUT_50}
    return (
      <Image style={style} source={signUrl(uri)} />
    )
  }
};

export const renderImage = ( id: string | null, isFolder: boolean, name: string): any => {
  const icon = getIcon(id, isFolder, name);

  if (icon)
    return (
      <Icon color={CommonStyles.grey} size={layoutSize.LAYOUT_200} name={icon}/>
    );
  else {
    // @ts-ignore
    const uri = `${Conf.currentPlatform.url}/workspace/document/${id}`
    const style = {width: "100%", height: DEVICE_HEIGHT - layoutSize.LAYOUT_200}
    return (
      <Image style={style} source={signUrl(uri)} />
    )
  }
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
        return "deleted_files";
      default:
        return "folder1"
    }
  }
  if (name && name.endsWith(".pdf"))
    return "pdf_files";
  return null
};

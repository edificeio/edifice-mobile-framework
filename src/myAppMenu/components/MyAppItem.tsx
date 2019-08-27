import React from "react";
import { ArticleContainer } from "../../ui/ContainerContent";
import { TouchCard } from "../../ui/Card";
import { Icon } from "../../ui";
import { TextH1 } from "../../ui/text";

export default (props: any) => {
  return (
    <ArticleContainer>
      <TouchCard style={{ width: "100%", alignItems: "center" }} onPress={props.onPress}>
        <Icon size={25} name={"menu"} />
        <TextH1>{props.config.displayName}</TextH1>
      </TouchCard>
    </ArticleContainer>
  );
};

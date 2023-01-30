import React, { FC } from "react";
import { ICONS } from "src/utils/iconsData";
import styled from "styled-components";


interface IconModel{
  icon: IconName
}

const IconStyle = styled.div`
  width: 2rem;
  aspect-ratio: 1;
  --icon-color: #fff;
`;

export const Icon: FC<IconModel> = ({icon}) => {
  return <IconStyle dangerouslySetInnerHTML={{ __html: ICONS[icon]}} />;
};

export type IconName = keyof typeof ICONS;
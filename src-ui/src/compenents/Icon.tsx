import React, { FC } from "react";
import { ICONS } from "src/utils/iconsData";
import styled from "styled-components";


interface IconModel{
  icon: IconName
  css?: React.CSSProperties
}

const IconStyle = styled.div`
  display: inline-block;
  width: 2rem;
  aspect-ratio: 1;
  --icon-color: #fff;
`;

export const Icon: FC<IconModel> = ({icon, css}) => {
  return <IconStyle style={css} dangerouslySetInnerHTML={{ __html: ICONS[icon]}} />;
};

export type IconName = keyof typeof ICONS;
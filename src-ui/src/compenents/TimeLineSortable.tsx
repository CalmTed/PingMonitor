import React, { ReactNode } from "react";
import { SortableContainer as sortableContainer, SortableElement } from "react-sortable-hoc";
import { TimelineRow, TimelineRowModel } from "./TimelineRow";


export const SortableItem:any = SortableElement( //eslint-disable-line @typescript-eslint/no-explicit-any
  (props: TimelineRowModel) => <TimelineRow {...props} />
);
export const SortableList:any = sortableContainer(({children}: {children: ReactNode}) => { //eslint-disable-line @typescript-eslint/no-explicit-any
  return <div>{children}</div>;
});
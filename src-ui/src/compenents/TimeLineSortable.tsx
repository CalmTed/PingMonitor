import React, { FC, ReactNode } from "react";
import { SortableContainer as sortableContainer, SortableElement, SortableHandle } from "react-sortable-hoc";
import { TimelineRow, TimelineRowModel } from "./TimelineRow";

export const RowHandler:any = SortableHandle(() => <div className="dragHandle"></div>);

export const SortableItem:any = SortableElement(
  (props: TimelineRowModel) => <TimelineRow {...props} />
);
export const SortableList:any = sortableContainer(({children}: {children: ReactNode}) => {
  return <div>{children}</div>;
});
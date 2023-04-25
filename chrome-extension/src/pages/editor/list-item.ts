import { PromptsV1Item } from "../../idb/types";
import { el, escapeHTML } from "../../utils/dom";

import * as iconAdd from "./add.svg";
import * as iconReorder from "./reorder.svg";
import * as iconEdit from "./edit.svg";
import * as iconDelete from "./delete.svg";

export function getListItem(
  item: Partial<PromptsV1Item>,
  onDnd: (srcKey: number, taregtKey: number, isBefore: boolean) => any
) {
  const handler = el("div", { className: "handle", html: iconReorder });
  const edit = el("div", { className: "edit", html: iconEdit });
  const del = el("div", { className: "del", html: iconDelete });
  const element = el(
    "div",
    {
      className: "item",
    },
    [
      handler,
      el("div", { className: "content" }, [
        //
        el("div", { className: "title", html: escapeHTML(item.title || "") }),
        el("div", { className: "text", html: escapeHTML(item.text || "") }),
      ]),
      edit,
      del,
    ]
  );
  const dndMimeType = "application/x-prompt-item";
  handler.addEventListener("mousedown", (ev) => {
    element.draggable = true;
  });
  handler.addEventListener("mouseup", (ev) => {
    element.draggable = false;
  });
  element.addEventListener("dragstart", (ev) => {
    ev.dataTransfer.setData(dndMimeType, JSON.stringify(item));
    element.classList.add("dragging");
  });
  element.addEventListener("dragend", (ev) => {
    element.classList.remove("dragging");
    element.draggable = false;
  });
  element.addEventListener("dragover", (ev) => {
    if (ev.dataTransfer.types.includes(dndMimeType)) ev.preventDefault();
  });
  element.addEventListener("drop", (ev) => {
    const json = ev.dataTransfer.getData(dndMimeType);
    if (!json) return;

    const dragedItem: PromptsV1Item = JSON.parse(json);
    const h = element.offsetHeight;
    const y = ev.offsetY;
    let isBefore = y < h * 0.4;

    // console.log("drop", dragedItem.key, isBefore, item.key);
    onDnd(dragedItem.key, item.key, isBefore);
  });
  return { listItem: element, edit, del, handler };
}

export function getAddListItem() {
  return el(
    "div",
    {
      className: "item new",
    },
    [el("div", { className: "handle", html: iconAdd })]
  );
}

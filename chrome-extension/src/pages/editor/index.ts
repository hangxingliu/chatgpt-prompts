import { addDefaultPrompts } from "../../idb/add-default-prompts";
import { ExtensionIDB } from "../../idb/op";
import { PromptsV1Item } from "../../idb/types";
import { $, el } from "../../utils/dom";
import { downloadJSONFile } from "../../utils/download";
import { getFormValues } from "../../utils/form";
import { createEditForm } from "./edit-form";
import { getAddListItem, getListItem } from "./list-item";
import { closeModal, openModal } from "./modal";

main().catch((error) => {
  console.error(error);
});
async function main() {
  const idb = new ExtensionIDB();
  await idb.fixLinkedList();
  await addDefaultPrompts(idb);
  await initList();
  await initToolbar();

  async function initToolbar() {
    $("#btn-export").addEventListener("click", exportItems);
  }

  async function initList() {
    const $list = $("#list");
    const $add = getAddListItem();
    $add.addEventListener("click", (ev) => {
      edit();
    });
    $list.innerHTML = "";
    $list.appendChild($add);

    const items = await idb.getAll();
    const f = document.createDocumentFragment();
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const elements = getListItem(item, onDnD);
      elements.edit.addEventListener("click", (ev) => {
        edit(item);
      });
      elements.del.addEventListener("click", (ev) => {
        const ok = confirm(`Delete the prompt?\n${item.title}`);
        if (!ok) return;
        idb.del(item.key).then((ok) => {
          if (ok) setTimeout(initList);
        });
      });
      f.appendChild(elements.listItem);
    }
    $list.prepend(f);
  }

  async function onDnD(srcKey: number, targetKey: number, isBefore: boolean) {
    let ok = false;
    if (isBefore) {
      targetKey = await idb.getPrevKey(targetKey);
      if (typeof targetKey === "number") ok = await idb.reorder(srcKey, targetKey);
    } else {
      ok = await idb.reorder(srcKey, targetKey);
    }
    if (ok) setTimeout(initList);
  }

  function edit(item?: PromptsV1Item) {
    const isCreate = item ? false : true;
    const { form, btnCancel } = createEditForm(item);
    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const values = getFormValues(form);
      onSubmit(values, isCreate ? null : item.key).then((ok) => {
        if (ok) {
          closeModal("modal-edit");
          setTimeout(initList);
        }
      });
    });
    btnCancel.addEventListener("click", (ev) => closeModal("modal-edit"));
    openModal("modal-edit", form);
  }
  async function onSubmit(values: any, key?: number) {
    try {
      if (key) {
        await idb.set(key, values);
      } else {
        await idb.add(values);
      }
    } catch (error) {
      console.error(error);
      alert(`failed: ${error.message}`);
      return false;
    }
    return true;
  }

  async function exportItems() {
    const items = await idb.getAll();
    const result = [];
    for (const item of items) {
      delete item.nextKey;
      delete item.mtime;
      delete item.ctime;
      result.push(item);
    }
    downloadJSONFile("prompts.json", result);
  }
}

import { PromptsV1Item } from "../../idb/types";
import { el, escapeHTML } from "../../utils/dom";

export function createEditForm(item?: Partial<PromptsV1Item>) {
  const title = item ? `Edit "${escapeHTML(item.title)}"` : "Create";
  const btnSave = el(
    "button",
    {
      className: "button save",
      type: "submit",
    },
    "Save"
  );
  const btnCancel = el(
    "button",
    {
      className: "button",
      type: "button",
    },
    "Cancel"
  );
  const form = el(
    "form",
    {
      action: "#",
      className: "form-wrapper",
    },
    [
      el("h2", { html: title }),
      el(
        "label",
        {
          className: "form-label",
        },
        [
          el("span", {}, "Title:"),
          el("input", {
            type: "text",
            name: "title",
            placeholder: "The title of the prompt",
            required: true,
            className: "form-input",
            value: item?.title || "",
          }),
        ]
      ),
      el(
        "label",
        {
          className: "form-label",
        },
        [
          el("span", {}, "Prompt Text:"),
          el("textarea", {
            rows: 5,
            name: "text",
            placeholder: "I want you act as a ...",
            required: true,
            className: "form-input",
            value: item?.text || "",
          }),
        ]
      ),
      el("div", { className: "form-toolbar" }, [btnSave, btnCancel]),
    ]
  );
  return { form, btnSave, btnCancel };
}

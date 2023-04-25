import { ExtensionIDB } from "../../idb/op";
import { $$, escapeHTML } from "../../utils/dom";

export async function initPromptsList(
  idb: ExtensionIDB,
  $container: HTMLDivElement,
  onItemClick: (ev: MouseEvent) => any
) {
  const prompts = await idb.getAll();
  let html = "";
  for (let i = 0; i < prompts.length; i++) {
    const { title } = prompts[i];
    html += `
    <div class="menuOption" data-item="inject-prompt" data-prompt="${i}">
      <span class="optionText">${escapeHTML(title)}</span>
    </div>
    `;
  }
  $container.innerHTML = html;
  $$(".menuOption", $container).forEach((item) => {
    item.addEventListener("click", onItemClick);
  });
  return prompts;
}

/**
 * This function will be injected into the page.
 * So please keep this function is STANDALONE.
 *
 * @param parameters
 */
export function inject(parameters: { text: string }) {
  const { text } = parameters;
  debug(`injecting the prompt "${text.slice(0, 16)}..."`);

  let allTextAreas = $$<HTMLTextAreaElement>("#__next textarea");
  const exactMatched = allTextAreas.find(it => it.id === 'prompt-textarea');
  if (exactMatched) allTextAreas = [exactMatched];

  let input: HTMLTextAreaElement;
  let button: HTMLButtonElement;
  for (let i = 0; i < allTextAreas.length; i++) {
    const _input = allTextAreas[i];
    button = getSendButtonFromInput(_input);
    if (!button) continue;
    input = _input;
    break;
  }

  if (input) {
    debug(`found text area (original: ${allTextAreas.length})`);
    inputPrompt(input, button).catch((error) => console.error(error));
  }

  function getSendButtonFromInput(input: HTMLTextAreaElement): HTMLButtonElement {
    let button = input.nextElementSibling as HTMLButtonElement;
    if (button?.tagName === "BUTTON") return button

    button = input.parentElement.lastElementChild as HTMLButtonElement;
    if (button?.tagName === "BUTTON") return button;

    button = input.parentElement.parentElement.lastElementChild as HTMLButtonElement;
    if (button?.tagName === "BUTTON") return button;
  }
  async function inputPrompt(input: HTMLTextAreaElement, button: HTMLButtonElement) {
    input.focus();
    document.execCommand("insertText", false, text);
    button.removeAttribute("disabled");
    button.click();
  }

  function $<T extends HTMLElement>(selector: string, element?: HTMLElement | Document): T {
    return (element || document).querySelector(selector);
  }
  function $$<T extends HTMLElement>(selector: string, element?: HTMLElement | Document): T[] {
    return Array.from((element || document).querySelectorAll(selector) || []);
  }
  function removeElement(element: HTMLElement) {
    if (element && element.parentNode) element.parentNode.removeChild(element);
  }
  function escapeHTML(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  function debug(...msg) {
    console.log(...msg);
  }
}

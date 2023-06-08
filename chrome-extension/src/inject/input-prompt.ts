/**
 * This function will be injected into the page.
 * So please keep this function is STANDALONE.
 *
 * @param parameters
 */
export function inject(parameters: { text: string }) {
  const { text } = parameters;
  debug(`injecting the prompt "${text.slice(0, 16)}..."`);

  const _inputs = $$<HTMLTextAreaElement>("#__next textarea");
  let input: HTMLTextAreaElement;
  let button: HTMLButtonElement;
  for (let i = 0; i < _inputs.length; i++) {
    const _input = _inputs[i];
    button = _input.nextElementSibling as HTMLButtonElement;
    if (button?.tagName !== "BUTTON") continue;
    input = _input;
    break;
  }

  if (input) {
    debug(`found text area (original: ${_inputs.length})`);
    inputPrompt(input, button).catch((error) => console.error(error));
  }

  async function inputPrompt(input: HTMLTextAreaElement, button: HTMLButtonElement) {
    input.focus();
    document.execCommand('insertText', false, text);
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

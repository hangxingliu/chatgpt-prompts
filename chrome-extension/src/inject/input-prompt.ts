/**
 * This function will be injected into the page.
 * So please keep this function is STANDALONE.
 *
 * @param parameters
 */
export function inject(parameters: { text: string }) {
  const { text } = parameters;

  const inputBoxes = $$<HTMLTextAreaElement>("#__next textarea");
  for (let i = 0; i < inputBoxes.length; i++) {
    const inputBox = inputBoxes[i];
    const btn = inputBox.nextElementSibling as HTMLButtonElement;
    if (btn?.tagName !== 'BUTTON')
      continue;
    btn.removeAttribute('disabled');
    inputBox.value = text;
    btn.click();
    break;
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
}

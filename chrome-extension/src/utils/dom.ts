export function el<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  attrs?: Partial<Omit<HTMLElementTagNameMap[K], "style">> & {
    html?: string;
    style?: Partial<CSSStyleDeclaration>;
  },
  children?: any
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName);
  if (attrs) {
    if (typeof attrs.html !== "undefined") {
      element.innerHTML = attrs.html;
      delete attrs.html;
    }
    if (attrs.style) {
      const style = attrs.style;
      delete attrs.style;
      Object.keys(style).forEach((key) => (element.style[key] = style[key]));
    }
    Object.assign(element, attrs);
  }

  if (children) {
    if (Array.isArray(children)) children.forEach((child) => element.append(child));
    else element.append(children);
  }
  return element;
}

export function $<T extends HTMLElement>(selector: string, element?: HTMLElement | Document): T {
  return (element || document).querySelector(selector);
}
export function $$<T extends HTMLElement>(selector: string, element?: HTMLElement | Document): T[] {
  return Array.from((element || document).querySelectorAll(selector) || []);
}

export function removeElement(element: HTMLElement) {
  if (element && element.parentNode) element.parentNode.removeChild(element);
}

export function escapeHTML(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

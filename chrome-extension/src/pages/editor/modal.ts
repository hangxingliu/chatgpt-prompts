import { $ } from "../../utils/dom";

export function openModal(
  id: string,
  content?: HTMLElement
) {
  const modalToggle = $<HTMLInputElement>('#' + id);
  if (!modalToggle) return false;

  const modal = modalToggle.nextElementSibling as HTMLElement;
  if (!modal) return false;

  const modalContent = $<HTMLDivElement>('.modal__content', modal);
  if (!modalContent) return false;

  modalContent.innerHTML = '';
  if(content)
    modalContent.appendChild(content);
  modalToggle.checked = true;
  return true;
}

export function closeModal(id: string) {
  const modalToggle = $<HTMLInputElement>('#' + id);
  if (!modalToggle) return false;
  modalToggle.checked = false;
  return true;
}

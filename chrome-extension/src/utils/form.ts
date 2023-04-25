/** Define a function to get form values */
export function getFormValues(formElement: HTMLFormElement): Record<string, string> {
  const formValues: Record<string, string> = {};

  // Iterate through form elements
  const len = formElement.elements.length;
  for (let i = 0; i < len; i++) {
    const inputElement = formElement.elements[i] as HTMLInputElement;

    // Check if the element is an input, select, or textarea, and it has a name attribute
    if (
      (inputElement.tagName === "INPUT" || inputElement.tagName === "SELECT" || inputElement.tagName === "TEXTAREA") &&
      inputElement.name
    ) {
      // Store the element value in formValues using the name attribute as the key
      formValues[inputElement.name] = inputElement.value;
    }
  }

  return formValues;
}

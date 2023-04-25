export function openExtensionURI(uri: string, options?: chrome.tabs.CreateProperties) {
  const url = chrome.runtime.getURL(uri);
  return new Promise<chrome.tabs.Tab>((resolve) => {
    chrome.tabs.query({ url }, (tabs) => {
      if (tabs.length > 0) {
        const tab = tabs[0];
        chrome.tabs.update(tab.id, { active: true }, resolve);
        return;
      }
      chrome.tabs.create(Object.assign({ url }, options || {}), resolve);
    });
  });
}

export function concatURI(base: string, concat: string) {
  return base.replace(/\/+$/, "") + "/" + concat.replace(/^\/+/, "");
}

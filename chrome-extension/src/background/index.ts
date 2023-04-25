import { chatGPTAPIBase } from "../const";
import { concatURI } from "../utils/url";
import type { InMemoryState } from "./state";

console.log("background service is booting ...");

/**
 * @see https://developer.chrome.com/docs/extensions/migrating/to-service-workers/#persist-states
 */
const weakState: InMemoryState = {
  accessToken: "",
};

/**
 * Listen all request to ChatGPT backend api to extract the access token
 */
chrome.webRequest.onSendHeaders.addListener(
  (details) => {
    if (!details.requestHeaders) return;
    const headers = details.requestHeaders;
    for (let i = 0; i < headers.length; i++) {
      const { name, value } = headers[i];
      if (name === "Authorization" || name === "authorization") {
        const mtx = value.match(/^bearer\s+([\w.\-\/\\]+)$/i);
        if (mtx) {
          console.log(`get access token from ${details.method} ${details.url}`);
          weakState.accessToken = mtx[1];
        }
        break;
      }
    }
  },
  {
    urls: [concatURI(chatGPTAPIBase, "*")],
  },
  ["requestHeaders"]
);

/**
 * Handle messages from other part of the extension (e.g., browser action popup page)
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(`get message ${JSON.stringify(request)}`);
  switch (request.type) {
    case "state":
      sendResponse({ state: weakState });
      break;
  }
});

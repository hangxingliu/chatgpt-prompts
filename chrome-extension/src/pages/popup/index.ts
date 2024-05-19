import { $, $$ } from "../../utils/dom";
import { inject as inputPrompt } from "../../inject/input-prompt";
import { InMemoryState } from "../../background/state";
import { chatGPTHomePage } from "../../const";
import { downloadJSONFile, downloadMarkdown } from "../../utils/download";
import { getMarkdownFromGPTJSON } from "../../utils/json-to-markdown";
import { concatURI, openExtensionURI } from "../../utils/url";
import { initPromptsList } from "./prompt-lists";
import { ExtensionIDB } from "../../idb/op";
import { addDefaultPrompts } from "../../idb/add-default-prompts";
import { PromptsV1Item } from "../../idb/types";

main();
function main() {
  let downloaded: any;
  let downloadFileName: string;

  showVersion();

  const $promptList = $("#prompt-list");
  const $downloadList = $("#download-list");

  document.addEventListener("keydown", (ev) => {
    switch (ev.code) {
      case "Escape":
        togglePromptList(false);
        toggleDownloadList(false);
        break;
    }
  });
  $promptList.addEventListener("click", (ev) => {
    if (ev.target === $promptList) togglePromptList(false);
  });
  $downloadList.addEventListener("click", (ev) => {
    if (ev.target === $downloadList) togglePromptList(false);
  });
  $promptList.querySelector(".button-back").addEventListener("click", (ev) => {
    togglePromptList(false);
  });
  $downloadList.querySelector(".button-back").addEventListener("click", (ev) => {
    toggleDownloadList(false);
  });

  // show main menu
  $("#main").style.opacity = "1";

  bindItemClickListener();
  function bindItemClickListener() {
    $$(".menuOption").forEach((item) => {
      item.addEventListener("click", onClickItem);
    });
  }

  const idb = new ExtensionIDB();
  let prompts: PromptsV1Item[];
  idb
    .fixLinkedList()
    .then(() => addDefaultPrompts(idb))
    .then(() => initPromptsList(idb, $promptList.querySelector(".group"), onClickItem))
    .then((_prompts) => (prompts = _prompts))
    .catch((e) => console.error(e));

  function togglePromptList(visible: boolean) {
    const names = $promptList.className.split(/\s+/);
    const index = names.indexOf("visible");
    if (visible) {
      if (index < 0) $promptList.className = names.concat("visible").join(" ");
      return;
    }
    if (index < 0) return;
    names.splice(index, 1);
    $promptList.className = names.join(" ");
  }
  function toggleDownloadList(visible: boolean) {
    const names = $downloadList.className.split(/\s+/);
    const index = names.indexOf("visible");
    if (visible) {
      if (index < 0) $downloadList.className = names.concat("visible").join(" ");
      return;
    }
    if (index < 0) return;
    names.splice(index, 1);
    $downloadList.className = names.join(" ");
    downloaded = null;
  }
  async function onClickItem(this: HTMLDivElement, event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();

    const itemId = this.getAttribute("data-item");
    switch (itemId) {
      case "prompts":
        togglePromptList(true);
        return;
      case "prompts-editor":
        return openExtensionURI("/pages/editor/index.html");
      case "access-token": {
        const state = await getBackgroundState();
        const accessToken = state.accessToken;
        if (!accessToken) return await onAccessTokenIsNotFound();
        prompt("Access token:", state.accessToken);
        break;
      }
      case "download-session": {
        downloaded = null;

        const state = await getBackgroundState();
        const accessToken = state.accessToken;
        if (!accessToken) return await onAccessTokenIsNotFound();

        const tab = await getChatGPTTab();
        if (!tab) return;

        const info = getDownloadInfoFromURL(tab.url);
        if (!info) return;

        const { sessionId, fileName } = info;
        const res = await fetch(`https://chatgpt.com/backend-api/conversation/${sessionId}`, {
          headers: {
            Authorization: `Bearer ${state.accessToken}`,
          },
        });
        console.log("response", res.status);
        downloaded = await res.json();
        downloadFileName = fileName;

        toggleDownloadList(true);
        return;
      }
      case "download-markdown": {
        if (downloaded) {
          const markdown = getMarkdownFromGPTJSON(downloaded);
          await downloadMarkdown(downloadFileName + ".md", markdown);
        }
        return;
      }
      case "download-json": {
        if (downloaded) await downloadJSONFile(downloadFileName + ".json", downloaded);
        return;
      }
      case "inject-prompt": {
        if (!prompts) return;

        const promptIndex = this.getAttribute("data-prompt");
        const prompt = prompts[parseInt(promptIndex, 10)];
        if (!prompt) return;

        const tab = await getChatGPTTab();
        if (!tab) return openChatGPT();

        const promptKey = prompt.key;
        idb.use(promptKey);

        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: inputPrompt,
          args: [{ text: prompt.text }],
        });
        return;
      }
      default:
    }
  }

  function getChatGPTTab() {
    return new Promise<chrome.tabs.Tab>((resolve, reject) => {
      chrome.tabs.query(
        {
          // active: true,
          url: [concatURI(chatGPTHomePage, "*")],
          currentWindow: true,
        },
        (tabs) => {
          resolve((tabs && tabs[0]) || null);
        }
      );
    });
  }

  function getBackgroundState() {
    return new Promise<InMemoryState>((resolve, reject) => {
      chrome.runtime.sendMessage({ type: "state" }, (resp) => {
        resolve(resp?.state);
      });
    });
  }
  async function onAccessTokenIsNotFound() {
    const tab = await getChatGPTTab();
    if (!tab) {
      openChatGPT();
    } else {
      chrome.tabs.reload(tab.id);
    }
    alert(`Please try again!`);
  }
  function openChatGPT() {
    return chrome.tabs.create({
      url: chatGPTHomePage,
      active: true,
    });
  }
  function getDownloadInfoFromURL(url: string) {
    const parsed = new URL(url);
    const mtx = parsed.pathname.match(/\/c\/([\w-]+)/);
    if (!mtx) return;
    const sessionId = mtx[1];
    return {
      sessionId,
      fileName: "chatgpt-" + sessionId + "",
    };
  }
  async function showVersion() {
    const url = chrome.runtime.getURL("manifest.json");
    const res = await fetch(url);
    if (!res.ok) return;
    const manifest = await res.json();
    if (manifest?.version) $("#version").innerText = manifest.version;
  }
}

export function downloadJSONFile(fileName: string, object: any) {
  const filename = fileName.replace(/(?:\.\w+)?$/, ".json");
  const blob = new Blob([JSON.stringify(object, null, 2)], { type: "text/json" });

  const url = URL.createObjectURL(blob);
  return new Promise<number>((resolve) => {
    chrome.downloads.download({ url, /*saveAs: true,*/ filename }, resolve);
  });
}
export function downloadMarkdown(fileName: string, markdown: any) {
  const filename = fileName.replace(/(?:\.\w+)?$/, ".md");
  const blob = new Blob([markdown], { type: "text/markdown" });

  const url = URL.createObjectURL(blob);
  return new Promise<number>((resolve) => {
    chrome.downloads.download({ url, /*saveAs: true,*/ filename }, resolve);
  });
}

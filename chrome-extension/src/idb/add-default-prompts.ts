import { ExtensionIDB } from "./op";

export async function addDefaultPrompts(idb: ExtensionIDB) {
  const count = await idb.count();
  if (count <= 1) {
    const prompts: { title: string; text: string }[] = require("../prompts.json");
    for (let i = 0; i < prompts.length; i++) {
      const prompt = prompts[i];
      await idb.add(prompt);
    }
    console.log("Added " + prompts.length + " default prompts");
  }
}

import { IDBPDatabase, openDB } from "idb";
import { AddPromptV1Payload, ExtensionDB, PromptsV1Item, UpdatePromptV1Payload } from "./types";

const promptsV1Key = (key: keyof PromptsV1Item) => key;

async function initIDB() {
  let needUpgrade = false;
  const db = await openDB<ExtensionDB>("chatgpt-prompts1", 1, {
    upgrade(db) {
      const promptsV1 = db.createObjectStore("promptsV1", {
        keyPath: promptsV1Key("key"),
        autoIncrement: true,
      });
      promptsV1.createIndex("byUsage", promptsV1Key("usage"));
      promptsV1.createIndex("byNextKey", promptsV1Key("nextKey"));
      needUpgrade = true;
    },
  });
  if (needUpgrade) {
    await db.put("promptsV1", {
      key: 0,
      title: "__HEAD__",
      text: "__HEAD__",
      ctime: 0,
      mtime: 0,
      usage: 0,
    });
  }
  return db;
}

export class ExtensionIDB {
  db: IDBPDatabase<ExtensionDB>;

  init = async () => {
    if (!this.db) this.db = await initIDB();
    return this.db;
  };

  count = async () => {
    const db = await this.init();
    return db.count("promptsV1");
  };

  dispose = async () => {
    if (!this.db) return;
    this.db.close();
    this.db = undefined;
  };

  getAll = async () => {
    const db = await this.init();
    const result: PromptsV1Item[] = [];
    let cursor = await db.get("promptsV1", 0);
    while (cursor) {
      if (cursor.key > 0) result.push(cursor);
      if (cursor.nextKey) cursor = await db.get("promptsV1", cursor.nextKey);
      else break;
    }
    return result;
  };

  add = async (payload: AddPromptV1Payload) => {
    const db = await this.init();
    const tx = db.transaction("promptsV1", "readwrite");
    const now = Date.now();
    const nextKey = await tx.store.add({
      ...payload,
      ctime: now,
      mtime: now,
      usage: 0,
    });
    const cursor = await tx.store.openCursor(IDBKeyRange.upperBound(nextKey, true), "prev");
    if (cursor) await cursor.update({ ...cursor.value, nextKey });
    await tx.done;
    return nextKey;
  };

  del = async (key: number) => {
    if (key <= 0) return false;
    const db = await this.init();
    const tx = db.transaction("promptsV1", "readwrite");

    // 0  ->  1  ->  2  ->  3  ->  4
    // |      |
    // |  deleteKey
    // |      |
    // A      B

    const cursorB = await tx.store.openCursor(key);
    if (!cursorB) return false;

    const cursorA = await tx.store.index("byNextKey").openCursor(key);
    if (!cursorA) return false;

    await cursorA.update({ ...cursorA.value, nextKey: cursorB.value.nextKey });
    await cursorB.delete();
    await tx.done;
    return true;
  };

  set = async (key: number, payload: UpdatePromptV1Payload) => {
    if (key <= 0) return false;

    const db = await this.init();
    const tx = db.transaction("promptsV1", "readwrite");
    const cursor = await tx.store.openCursor(key);
    let ok = false;
    if (cursor) {
      const orig = cursor.value;
      await cursor.update({
        ctime: orig.ctime,
        usage: orig.usage,
        ...payload,
        mtime: Date.now(),
        key: orig.key,
        nextKey: orig.nextKey,
      });
      ok = true;
    }
    await tx.done;
    return ok;
  };

  reorder = async (originalKey: number, afterKey: number) => {
    if (originalKey <= 0) return false;
    if (originalKey === afterKey) return false;

    const db = await this.init();
    const tx = db.transaction("promptsV1", "readwrite");

    // 0  ->  1  ->  2  ->  3  ->  4
    //        |             |      |
    //    afterKey          | originalKey
    //        |             |      |
    //        A             B      C

    const cursorA = await tx.store.openCursor(afterKey);
    if (!cursorA) return false;

    const cursorC = await tx.store.openCursor(originalKey);
    if (!cursorC) return false;

    const cursorB = await tx.store.index("byNextKey").openCursor(originalKey);
    if (!cursorB) return false;

    let originalNextKey = cursorA.value.nextKey;

    if (cursorA.key !== cursorB.key) await cursorA.update({ ...cursorA.value, nextKey: originalKey });
    await cursorB.update({ ...cursorB.value, nextKey: cursorC.value.nextKey });
    await cursorC.update({ ...cursorC.value, nextKey: originalNextKey });
    await tx.done;
    return true;
  };

  getPrevKey = async (key: number) => {
    const db = await this.init();
    const prevKey = await db.getKeyFromIndex("promptsV1", "byNextKey", key);
    return prevKey;
  };

  /**
   * Increment the usage count of a prompt text by 1.
   * @returns the latest prompt item
   */
  use = async (key: number) => {
    if (key <= 0) return false;
    const db = await this.init();
    const tx = db.transaction("promptsV1", "readwrite");
    const cursor = await tx.store.openCursor(key);
    let prompt: PromptsV1Item;
    if (cursor) {
      prompt = cursor.value;
      prompt.usage++;
      await cursor.update(prompt);
    }
    await tx.done;
    return prompt;
  };
}

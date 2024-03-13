import "fake-indexeddb/auto";
import { ExtensionIDB } from "../src/idb/op";
import { deepStrictEqual } from "assert";

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
async function main() {
  const idb = new ExtensionIDB();

  let result = await idb.add({ title: "hi", text: "helloworld" });
  deepStrictEqual(result, 1);

  let items = await idb.getAll();
  // console.log(items);
  deepStrictEqual(items.length, 1);
  deepStrictEqual(items[0].title, "hi");

  result = await idb.add({ title: "hi2", text: "helloworld2" });
  deepStrictEqual(result, 2);

  items = await idb.getAll();
  deepStrictEqual(items.length, 2);
  deepStrictEqual(items[0].title, "hi");
  deepStrictEqual(items[1].title, "hi2");

  // move the item with the id 2 to the place after the item with id 0 (head)
  let ok = await idb.reorder(2, 0);
  deepStrictEqual(ok, true, "idb.reorder");

  items = await idb.getAll();
  deepStrictEqual(items.length, 2);
  deepStrictEqual(items[0].title, "hi2");
  deepStrictEqual(items[1].title, "hi");

  result = await idb.add({ title: "new one", text: "new one" });
  deepStrictEqual(result, 3);
  items = await idb.getAll();
  console.log(items);
  deepStrictEqual(items[0].title, "hi2");
  deepStrictEqual(items[1].title, "new one");
  deepStrictEqual(items[2].title, "hi");

  await idb.fixLinkedList();
  // console.log(await idb.del(2));
  // console.log(await idb.getAll());

  // console.log(await idb.del(1));
  // console.log(await idb.getAll());
}

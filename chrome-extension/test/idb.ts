import "fake-indexeddb/auto";
import { ExtensionIDB } from "../src/idb/op";

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
async function main() {
  const idb = new ExtensionIDB();

  let result = await idb.add({ title: 'hi', text: 'helloworld' });
  console.log(result);

  console.log(await idb.getAll());

  result = await idb.add({ title: 'hi!', text: 'helloworld' });
  console.log(result);

  console.log(await idb.getAll());

  console.log(await idb.reorder(2, 0));
  console.log(await idb.getAll());

  // console.log(await idb.del(2));
  // console.log(await idb.getAll());

  // console.log(await idb.del(1));
  // console.log(await idb.getAll());
}

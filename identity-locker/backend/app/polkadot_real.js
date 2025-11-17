// polkadot_real.js — real on-chain anchoring example
// Node script to anchor a hash using polkadot.js
// Usage: node polkadot_real.js <HASH_HEX> <WS_ENDPOINT> <SURI>
// Example: node polkadot_real.js abcd... wss://rpc.polkadot.io '//Alice'

const { ApiPromise, WsProvider, Keyring } = require("@polkadot/api");
const process = require("process");

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.error("Usage: node polkadot_real.js <HASH_HEX> <WS_ENDPOINT> <SURI>");
    process.exit(1);
  }
  const [hashHex, wsEndpoint, suri] = args;
  const provider = new WsProvider(wsEndpoint);
  const api = await ApiPromise.create({ provider });

  const keyring = new Keyring({ type: 'sr25519' });
  const pair = keyring.addFromUri(suri);

  // Use system.remark to store a remark containing the hash (simple anchor)
  const remark = api.tx.system.remark(hashHex);
  const unsub = await remark.signAndSend(pair, (result) => {
    if (result.status.isInBlock) {
      console.log(JSON.stringify({
        tx_hash: result.status.asInBlock.toString(),
        block: result.status.asInBlock.toString()
      }));
      unsub();
    } else if (result.status.isFinalized) {
      console.log(JSON.stringify({
        tx_hash: result.status.asFinalized.toString(),
        block: result.status.asFinalized.toString()
      }));
      unsub();
    }
  });
}

main().catch(console.error);

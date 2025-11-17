/**
 * polkadot_real.js
 * Anchor a credential hash on-chain using polkadot.js
 *
 * Environment variables:
 *   HASH        - the cid/hash to anchor (required)
 *   POLKADOT_WS - websocket endpoint (default: ws://127.0.0.1:9944)
 *   POLKADOT_SURI - signer SURI (e.g. //Alice) (default: //Alice)
 *
 * The script prints a single JSON object line with tx result.
 */

const { ApiPromise, WsProvider, Keyring } = require("@polkadot/api");

async function main() {
  const hashHex = process.env.HASH;
  const ws = process.env.POLKADOT_WS || "ws://127.0.0.1:9944";
  const suri = process.env.POLKADOT_SURI || "//Alice";

  if (!hashHex) {
    console.error(JSON.stringify({ error: "HASH env var required" }));
    process.exit(2);
  }

  try {
    const provider = new WsProvider(ws);
    const api = await ApiPromise.create({ provider });

    const keyring = new Keyring({ type: 'sr25519' });
    const pair = keyring.addFromUri(suri);

    // Use system.remark to store the hash (simple anchor)
    const tx = api.tx.system.remark(hashHex);

    const unsub = await tx.signAndSend(pair, (result) => {
      const status = result.status;
      if (status.isInBlock) {
        console.log(JSON.stringify({
          tx_hash: status.asInBlock.toString(),
          status: "inBlock"
        }));
        unsub();
      } else if (status.isFinalized) {
        console.log(JSON.stringify({
          tx_hash: status.asFinalized.toString(),
          status: "finalized"
        }));
        unsub();
      }
    });

  } catch (err) {
    console.error(JSON.stringify({ error: err.message }));
    process.exit(1);
  }
}

main();

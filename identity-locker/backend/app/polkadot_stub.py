# polkadot_stub.py - simulate anchoring a hash on-chain
import time
def anchor_hash(hash_hex):
    # Simulate an on-chain anchor tx hash
    now = int(time.time())
    tx = f"tx_anchor_{hash_hex[:8]}_{now}"
    # In real integration: call polkadot.js or RPC to submit extrinsic and return tx hash
    return {"tx_hash": tx, "anchored_at": now}

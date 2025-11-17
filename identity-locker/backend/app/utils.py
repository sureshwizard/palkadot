# utils.py - simple key / DID generation utilities for demo
import os
import json
import hashlib
import secrets
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
os.makedirs(DATA_DIR, exist_ok=True)

def generate_keypair():
    priv = Ed25519PrivateKey.generate()
    pub = priv.public_key()
    priv_bytes = priv.private_bytes(
        encoding=serialization.Encoding.Raw,
        format=serialization.PrivateFormat.Raw,
        encryption_algorithm=serialization.NoEncryption(),
    )
    pub_bytes = pub.public_bytes(
        encoding=serialization.Encoding.Raw,
        format=serialization.PublicFormat.Raw,
    )
    return priv_bytes.hex(), pub_bytes.hex()

def create_did():
    priv, pub = generate_keypair()
    did = "did:polkadot:" + secrets.token_hex(8)
    entry = {"did": did, "private_key": priv, "public_key": pub}
    data_path = os.path.join(DATA_DIR, f"{did}.json")
    with open(data_path, "w") as f:
        json.dump(entry, f)
    return entry

def hash_object(obj):
    s = json.dumps(obj, sort_keys=True).encode("utf-8")
    return hashlib.sha256(s).hexdigest()

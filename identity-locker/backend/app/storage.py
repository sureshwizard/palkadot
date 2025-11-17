# storage.py - simple file-based credential store for demo
import os, json
from .utils import hash_object
BASE = os.path.join(os.path.dirname(__file__), "..", "data")
os.makedirs(BASE, exist_ok=True)

CRED_DIR = os.path.join(BASE, "creds")
os.makedirs(CRED_DIR, exist_ok=True)

REVOKE_FILE = os.path.join(CRED_DIR, "revoked.json")
if not os.path.exists(REVOKE_FILE):
    with open(REVOKE_FILE, "w") as f:
        json.dump([], f)

def save_credential(vc):
    cid = hash_object(vc)
    path = os.path.join(CRED_DIR, f"{cid}.json")
    with open(path, "w") as f:
        json.dump(vc, f)
    return cid

def load_credential(cid):
    path = os.path.join(CRED_DIR, f"{cid}.json")
    if not os.path.exists(path):
        return None
    with open(path, "r") as f:
        return json.load(f)

def revoke_credential(cid, reason="dev-revoked"):
    with open(REVOKE_FILE, "r") as f:
        r = json.load(f)
    entry = {"cid": cid, "reason": reason}
    r.append(entry)
    with open(REVOKE_FILE, "w") as f:
        json.dump(r, f)
    return True

def is_revoked(cid):
    with open(REVOKE_FILE, "r") as f:
        r = json.load(f)
    return any(item["cid"] == cid for item in r)

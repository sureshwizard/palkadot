# main.py - FastAPI app with endpoints for DID, issue, verify, revoke
from fastapi import FastAPI, HTTPException
from .utils import create_did, hash_object
from .storage import save_credential, load_credential, revoke_credential, is_revoked
from .polkadot_stub import anchor_hash
from .models import CreateDIDResponse, IssueRequest, IssueResponse, VerifyRequest, RevokeRequest
from datetime import datetime, timedelta
import json, os, subprocess

app = FastAPI(title="Identity Locker API (Demo)")
ANCHOR_MODE = os.getenv("ANCHOR_MODE", "stub")

@app.post("/did/create", response_model=CreateDIDResponse)
def did_create():
    entry = create_did()
    return {"did": entry["did"], "public_key": entry["public_key"]}

@app.post("/issue", response_model=IssueResponse)
def issue_vc(req: IssueRequest):
    issued = datetime.utcnow().isoformat() + "Z"
    expires = (datetime.utcnow() + timedelta(days=req.expires_in_days)).isoformat() + "Z"
    vc = {
        "context": ["https://www.w3.org/2018/credentials/v1"],
        "id": None,
        "type": ["VerifiableCredential", "IdentityCredential"],
        "issuer": req.issuer_did,
        "issuanceDate": issued,
        "expirationDate": expires,
        "credentialSubject": req.credential_subject,
    }
    # compute VC id / cid
    cid = save_credential(vc)
    vc["id"] = f"urn:vc:{cid}"
    # anchor (stub or real via node script)
    if ANCHOR_MODE == "real":
        try:
            # call node script - expects polkadot_real.js in same folder and environment variables
            ws = os.getenv("POLKADOT_WS", "wss://rpc.polkadot.io")
            suri = os.getenv("POLKADOT_SURI", "//Alice")
            script = os.path.join(os.path.dirname(__file__), "polkadot_real.js")
            out = subprocess.check_output(["node", script, cid, ws, suri], stderr=subprocess.STDOUT, timeout=30)
            anchor = json.loads(out.decode().strip().splitlines()[-1])
        except Exception as e:
            anchor = {"error": str(e)}
    else:
        anchor = anchor_hash(cid)
    return {"vc": vc, "cid": cid, "anchor": anchor}

@app.post("/verify")
def verify_presentation(req: VerifyRequest):
    pres = req.presentation
    # For demo: check that vc.id exists, not revoked, and nonce present
    vc_id = pres.get("vc_id")
    nonce = pres.get("nonce")
    if not vc_id or not nonce:
        raise HTTPException(400, "presentation must include vc_id and nonce")
    cid = vc_id.replace("urn:vc:", "")
    vc = load_credential(cid)
    if not vc:
        raise HTTPException(404, "credential not found")
    revoked = is_revoked(cid)
    if revoked:
        return {"verified": False, "reason": "revoked"}
    # In real implementation: verify signature, issuer DID, proof, nonce, etc.
    return {"verified": True, "vc": vc}

@app.post("/revoke")
def revoke(req: RevokeRequest):
    ok = revoke_credential(req.cid, req.reason)
    return {"revoked": ok}

@app.get("/revocation/{cid}")
def check_revocation(cid: str):
    return {"cid": cid, "revoked": is_revoked(cid)}

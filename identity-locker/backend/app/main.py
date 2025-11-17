# main.py - FastAPI app (anchor support: stub or real via polkadot_real.js)
from fastapi import FastAPI, HTTPException
from .utils import create_did, hash_object
from .storage import save_credential, load_credential, revoke_credential, is_revoked
from .polkadot_stub import anchor_hash as stub_anchor
from .models import CreateDIDResponse, IssueRequest, IssueResponse, VerifyRequest, RevokeRequest
from datetime import datetime, timedelta
import json, os, subprocess
from fastapi.middleware.cors import CORSMiddleware
from fastapi import APIRouter
import uuid

router = APIRouter()
app = FastAPI(title="Identity Locker API (Demo)")
ANCHOR_MODE = os.getenv("ANCHOR_MODE", "stub")

origins = [
    "http://162.0.225.90:4087",
    "http://localhost:4087",
    "http://127.0.0.1:4087",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@router.get("/create_holder_did")
async def compat_create_holder_did():
    return {"did": f"did:example:holder-{uuid.uuid4().hex[:8]}"}

@router.get("/create_issuer_did")
async def compat_create_issuer_did():
    return {"did": f"did:example:issuer-{uuid.uuid4().hex[:8]}"}

app.include_router(router)



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
    cid = save_credential(vc)
    vc["id"] = f"urn:vc:{cid}"

    # Anchor (stub or real via node script)
    if ANCHOR_MODE == "real":
        try:
            script = os.path.join(os.path.dirname(__file__), "polkadot_real.js")
            env = os.environ.copy()
            env["HASH"] = cid
            env["POLKADOT_WS"] = env.get("POLKADOT_WS", "ws://127.0.0.1:9944")
            env["POLKADOT_SURI"] = env.get("POLKADOT_SURI", "//Alice")
            out = subprocess.check_output(["node", script], env=env, stderr=subprocess.STDOUT, timeout=60)
            lines = out.decode().strip().splitlines()
            anchor = json.loads(lines[-1])
        except subprocess.CalledProcessError as e:
            anchor = {"error": f"node script failed: {e.output.decode().strip()}"}
        except Exception as e:
            anchor = {"error": str(e)}
    else:
        anchor = stub_anchor(cid)

    return {"vc": vc, "cid": cid, "anchor": anchor}

@app.post("/verify")
def verify_presentation(req: VerifyRequest):
    pres = req.presentation
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
    return {"verified": True, "vc": vc}

@app.post("/revoke")
def revoke(req: RevokeRequest):
    ok = revoke_credential(req.cid, req.reason)
    return {"revoked": ok}

@app.get("/revocation/{cid}")
def check_revocation(cid: str):
    return {"cid": cid, "revoked": is_revoked(cid)}

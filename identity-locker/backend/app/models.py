# models.py - simple pydantic request/response models
from pydantic import BaseModel
from typing import Optional, Dict, Any

class CreateDIDResponse(BaseModel):
    did: str
    public_key: str

class IssueRequest(BaseModel):
    holder_did: str
    issuer_did: str
    credential_subject: Dict[str, Any]
    expires_in_days: Optional[int] = 365

class IssueResponse(BaseModel):
    vc: Dict
    cid: str
    anchor: Dict

class VerifyRequest(BaseModel):
    presentation: Dict

class RevokeRequest(BaseModel):
    cid: str
    reason: Optional[str] = "revoked"

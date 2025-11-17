import axios from "axios";
const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000" });

export async function createDID() {
  const r = await API.post("/did/create");
  return r.data;
}

export async function issueVC(holder_did, issuer_did, subject) {
  const r = await API.post("/issue", { holder_did, issuer_did, credential_subject: subject });
  return r.data;
}

export async function verifyPresentation(presentation) {
  const r = await API.post("/verify", { presentation });
  return r.data;
}

export async function revoke(cid, reason="dev-revoked") {
  const r = await API.post("/revoke", { cid, reason });
  return r.data;
}

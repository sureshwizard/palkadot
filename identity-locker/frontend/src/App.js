// frontend/src/App.js
import React, { useState } from "react";
import { API_URL as DEFAULT_API_URL } from "./config";


function App() {
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);

  // DID inputs
  const [holderName, setHolderName] = useState("Alice Holder");
  const [issuerName, setIssuerName] = useState("Acme Issuer");

  // Credential inputs
  const [email, setEmail] = useState("alice@example.com");
  const [age, setAge] = useState(30);

  // Revoke inputs
  const [revokeCid, setRevokeCid] = useState("");
  const [revokeVcId, setRevokeVcId] = useState("");

  // Last results + UI state
  const [holderDid, setHolderDid] = useState(null);
  const [issuerDid, setIssuerDid] = useState(null);
  const [lastVc, setLastVc] = useState(null);
  const [log, setLog] = useState([]);
  const [rawBody, setRawBody] = useState("");

  const addLog = (msg) => {
    setLog((l) => [new Date().toISOString() + " - " + msg, ...l].slice(0, 200));
  };

  const api = (path) => apiUrl.replace(/\/$/, "") + path;

  /* ---------- DID creation ---------- */
  async function createDID(role, name) {
    addLog(`Creating ${role} DID (name=${name})...`);
    try {
      const res = await fetch(api("/did/create"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, name }),
      });
      const data = await res.json();
      if (!res.ok) {
        addLog(`Create DID failed (${res.status}): ${JSON.stringify(data)}`);
        throw new Error("Create DID failed");
      }
      addLog(`Created ${role} DID: ${data.did}`);
      return data;
    } catch (err) {
      addLog(`Error createDID: ${err?.message || err}`);
      throw err;
    }
  }

  const handleCreateHolder = async () => {
    try {
      const d = await createDID("holder", holderName);
      setHolderDid(d.did);
    } catch (e) {}
  };
  const handleCreateIssuer = async () => {
    try {
      const d = await createDID("issuer", issuerName);
      setIssuerDid(d.did);
    } catch (e) {}
  };

  /* ---------- Issue VC ---------- */
  const buildIssuePayload = () => {
    // allow editing via rawBody if non-empty JSON, otherwise use structured inputs
    if (rawBody && rawBody.trim()) {
      try {
        return JSON.parse(rawBody);
      } catch (e) {
        addLog("Raw JSON invalid — using structured inputs.");
      }
    }
    return {
      issuer_did: issuerDid,
      holder_did: holderDid,
      credential_subject: {
        email,
        age: Number(age),
      },
      // any other fields your backend supports can go here
    };
  };

  const handleIssueVC = async () => {
    if (!issuerDid || !holderDid) {
      addLog("Need both issuer and holder DIDs to issue VC.");
      return;
    }
    const payload = buildIssuePayload();
    addLog(`Issuing VC with payload: ${JSON.stringify(payload)}`);
    try {
      const res = await fetch(api("/issue"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        addLog(`Issue failed (${res.status}): ${JSON.stringify(data)}`);
        return;
      }
      setLastVc(JSON.stringify(data));
      // store common identifiers to UI inputs for revoke tests
      if (data.cid) setRevokeCid(data.cid);
      if (data.vc_id) setRevokeVcId(data.vc_id);
      addLog(`Issued VC: ${JSON.stringify(data)}`);
    } catch (err) {
      addLog(`Error issuing VC: ${err?.message || err}`);
    }
  };

  /* ---------- Verify ---------- */
  const handleVerify = async () => {
    if (!lastVc) {
      addLog("No VC to verify.");
      return;
    }
    addLog("Verifying presentation...");
    try {
      const parsed = JSON.parse(lastVc);
      // Guessing your backend accepts { presentation: { verifiableCredential: [...] } }
      const presentation = { verifiableCredential: [parsed.jwt || parsed] };
      const res = await fetch(api("/verify"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presentation }),
      });
      const data = await res.json();
      addLog(`Verify response: ${JSON.stringify(data)}`);
    } catch (err) {
      addLog(`Error verify: ${err?.message || err}`);
    }
  };

  /* ---------- Revoke ---------- */
  const handleRevoke = async () => {
    // backend required fields: maybe cid (or vc_id). try both.
    const cid = revokeCid || (lastVc && (() => { try { return JSON.parse(lastVc).cid } catch(e){return null}})());
    const vc_id = revokeVcId || (lastVc && (() => { try { return JSON.parse(lastVc).vc_id } catch(e){return null}})());

    if (!cid && !vc_id) {
      addLog("No cid or vc_id available to revoke — fill input or issue a VC first.");
      return;
    }

    addLog(`Revoking (cid=${cid} vc_id=${vc_id})...`);
    try {
      const body = cid ? { cid, issuer: issuerDid } : { vc_id, issuer: issuerDid, cid: cid || "" };
      const res = await fetch(api("/revoke"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      addLog(`Revoke response: ${JSON.stringify(data)}`);
    } catch (err) {
      addLog(`Error revoke: ${err?.message || err}`);
    }
  };

  /* ---------- UI ---------- */
  return (
    <div style={{ padding: 28, fontFamily: "Inter, Arial, sans-serif", maxWidth: 1100 }}>
      <h1>Identity Locker — Demo</h1>

      <div style={{ marginBottom: 12 }}>
        <label style={{ marginRight: 8 }}>API URL:</label>
        <input
          style={{ width: 420 }}
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          placeholder="http://162.0.225.90:4086"
        />
        <button onClick={() => addLog(`API URL set to ${apiUrl}`)} style={{ marginLeft: 8 }}>Set</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 20 }}>
        <div>
          <h3>Create DIDs</h3>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input value={holderName} onChange={(e) => setHolderName(e.target.value)} placeholder="Holder name" />
            <button onClick={handleCreateHolder}>Create Holder DID</button>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input value={issuerName} onChange={(e) => setIssuerName(e.target.value)} placeholder="Issuer name" />
            <button onClick={handleCreateIssuer}>Create Issuer DID</button>
          </div>

          <h3>Issue Verifiable Credential</h3>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Credential email" />
            <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Age" style={{ width: 120 }} />
            <button onClick={handleIssueVC}>Issue VC</button>
          </div>

          <h3>Verify / Revoke</h3>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <button onClick={handleVerify}>Verify Presentation</button>
            <button onClick={handleRevoke}>Revoke VC</button>
          </div>

          <h4>Revoke helpers</h4>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input value={revokeCid} onChange={(e) => setRevokeCid(e.target.value)} placeholder="cid (optional)" style={{ width: 280 }} />
            <input value={revokeVcId} onChange={(e) => setRevokeVcId(e.target.value)} placeholder="vc_id (optional)" style={{ width: 200 }} />
          </div>

          <h4>Raw request body (optional)</h4>
          <textarea
            value={rawBody}
            onChange={(e) => setRawBody(e.target.value)}
            placeholder='Optional custom JSON for /issue (e.g. {"issuer_did":"...","holder_did":"...","credential_subject":{...}})'
            style={{ width: "100%", minHeight: 120 }}
          />
        </div>

        <div>
          <h3>State</h3>
          <div style={{ marginBottom: 8 }}>
            <strong>Holder DID:</strong>
            <div style={{ background: "#f5f5f5", padding: 8, marginTop: 6 }}>{holderDid || "-"}</div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>Issuer DID:</strong>
            <div style={{ background: "#f5f5f5", padding: 8, marginTop: 6 }}>{issuerDid || "-"}</div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>Last VC (raw):</strong>
            <pre style={{ background: "#fff", padding: 8, minHeight: 80 }}>{lastVc || "-"}</pre>
          </div>

          <h3>Activity Log</h3>
          <div style={{
            background: "#111", color: "#0f0",
            padding: 12, height: 420, overflow: "auto", fontFamily: "monospace", fontSize: 12
          }}>
            {log.length === 0 ? "No activity yet" : log.map((l, i) => <div key={i}>{l}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;


import React, { useState } from "react";
import { createDID, issueVC, verifyPresentation, revoke } from "./api";

export default function App(){
  const [log, setLog] = useState([]);
  const [holder, setHolder] = useState(null);
  const [issuer, setIssuer] = useState(null);
  const [lastVC, setLastVC] = useState(null);

  function append(msg){
    setLog(l => [msg, ...l].slice(0,50));
  }

  async function onCreateDID(){
    try {
      const res = await createDID();
      append(`Created DID: ${res.did}`);
      setHolder(res.did);
    } catch (e) {
      append(`Error create DID: ${e.message}`);
    }
  }

  async function onCreateIssuer(){
    try {
      const res = await createDID();
      append(`Created Issuer DID: ${res.did}`);
      setIssuer(res.did);
    } catch (e) {
      append(`Error create Issuer: ${e.message}`);
    }
  }

  async function onIssue(){
    if(!holder || !issuer){ append("Need holder and issuer"); return; }
    try {
      const subject = { email: "alice@example.com", age: 30 };
      const res = await issueVC(holder, issuer, subject);
      append(`Issued VC id: ${res.vc.id}`);
      append(`Anchor: ${JSON.stringify(res.anchor)}`);
      setLastVC(res);
    } catch (e) {
      append(`Issue error: ${e.message}`);
    }
  }

  async function onVerify(){
    if(!lastVC){ append("No VC to present"); return; }
    try {
      const presentation = { vc_id: lastVC.vc.id, nonce: "nonce-12345" };
      const res = await verifyPresentation(presentation);
      append(`Verify result: ${JSON.stringify(res)}`);
    } catch (e) {
      append(`Verify error: ${e.message}`);
    }
  }

  async function onRevoke(){
    if(!lastVC){ append("No VC to revoke"); return; }
    try {
      const res = await revoke(lastVC.cid);
      append(`Revoked: ${JSON.stringify(res)}`);
    } catch (e) {
      append(`Revoke error: ${e.message}`);
    }
  }

  return (
    <div style={{fontFamily:"sans-serif", padding:20}}>
      <h2>Identity Locker — Demo</h2>
      <div style={{display:"flex", gap:10, marginBottom:10}}>
        <button onClick={onCreateDID}>Create Holder DID</button>
        <button onClick={onCreateIssuer}>Create Issuer DID</button>
        <button onClick={onIssue}>Issue VC (email, age)</button>
        <button onClick={onVerify}>Verify Presentation</button>
        <button onClick={onRevoke}>Revoke VC</button>
      </div>

      <div style={{marginTop:20}}>
        <strong>Holder DID:</strong> {holder || "-"} <br/>
        <strong>Issuer DID:</strong> {issuer || "-"} <br/>
        <strong>Last VC ID:</strong> {lastVC ? lastVC.vc.id : "-"}
      </div>

      <h3>Activity Log</h3>
      <div className="log">
        {log.map((l, idx) => <div key={idx} className="log-item">{l}</div>)}
      </div>
    </div>
  );
}

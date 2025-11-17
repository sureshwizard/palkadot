# Devpost Submission: Identity Locker — Decentralized Identity on Polkadot

**Title:** Identity Locker  
**Team:** Solo / Your Name  
**Hashtag:** #aicodewithsuresh

## Short description (1 sentence)
A user-centric decentralized identity locker that issues verifiable credentials, supports selective presentation, and anchors credential integrity on Polkadot.

## What it does
Identity Locker lets users create self-owned DIDs, receive signed verifiable credentials (email, age), present minimal proofs to verifiers, and revoke credentials when needed. Credential hashes are optionally anchored on-chain via Polkadot (system.remark or DID pallet).

## Built with
- Polkadot (anchoring via polkadot.js example)  
- FastAPI (Python) backend  
- React frontend  
- Docker / docker-compose for easy deployment

## Demo video
A 2–5 minute demo is included in the repo (script) — shows DID creation, VC issuance, verification, and revocation.

## Why this matters
Users currently rely on centralized platforms for identity. Identity Locker returns control to users, enabling privacy-preserving, portable identity and easier integration for Web2→Web3 apps.

## How to run (short)
1. `git clone <repo>`  
2. `cp .env.example .env`  
3. `docker-compose up --build`  
4. Open `http://localhost:3000` and follow the quick 3-step checklist in README.

## What I learned / Challenges
- Designing a minimal but complete VC flow for judges to test quickly.  
- Balancing demo simplicity (stubbed anchoring) with a clear path to real on-chain anchoring (polkadot.js).

## Future work
- Replace stub with DID pallet & real signatures.  
- Add selective disclosure (BBS+/ZK proofs).  
- Integrate IPFS for encrypted credential storage.

## Repo
Link: `<YOUR_REPO_URL>`

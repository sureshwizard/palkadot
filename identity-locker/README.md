# Identity Locker – Polkadot Decentralized Identity Demo
### Hackathon Submission — “Build Resilient Apps with Polkadot Cloud”
### Theme: **User-Centric Apps**

Identity Locker is a simple, runnable prototype demonstrating how users can
create self-owned decentralized identities (DIDs), receive verifiable credentials
(e.g., email verification, age claim), present selective proofs to verifiers, and
support revocation—all backed by a Polkadot anchoring mechanism.

This submission includes:
- Fully runnable **frontend (React)** and **backend (FastAPI)**
- Example **Verifiable Credential (VC)** flows
- Simple **"presentation" & verification** model
- Local **revocation registry**
- **Polkadot.js on-chain anchoring example** (opt-in / optional)
- **10 cURL commands** for testing
- **User Manual** and **How to Grade (3-step checklist)**

---

## Quickstart (Run in ~5 minutes)

### Prerequisites
- Docker & docker-compose installed
- (Optional) Node 18+ & npm if you want to run frontend locally without Docker

1. Clone repo and change directory
```bash
git clone <YOUR_REPO_URL>
cd identity-locker
```

2. Copy env
```bash
cp .env.example .env
```

3. Start with Docker Compose
```bash
docker-compose up --build
```

4. Open the frontend
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000/docs` (FastAPI auto-docs)

### Default test accounts / seeds
See `backend/data/seeds.json` and `scripts/` for convenience scripts.

### How to grade (3-step checklist)
Judges: You can verify the entire project in **under 2 minutes**.

**STEP 1 — Issue a Credential**
1. Open UI → Create Holder DID
2. Create Issuer DID
3. Click “Issue VC” → You should see a VC ID

**STEP 2 — Verify**
1. Click “Verify Presentation” → Expect: `\"verified\": true`

**STEP 3 — Revoke & Re-Verify**
1. Click “Revoke VC”
2. Click “Verify Presentation” → Expect: `\"verified\": false`

---

## Polkadot integration
Set `ANCHOR_MODE` in `.env` to `stub` (default) or `real` to enable polkadot.js anchoring (requires Node + @polkadot/api and a funded/test account).

---

## Project structure
```
identity-locker/
├─ backend/
│  ├─ app/
│  ├─ requirements.txt
│  └─ Dockerfile
├─ frontend/
│  ├─ public/
│  └─ src/
├─ docker-compose.yml
├─ .env.example
├─ scripts/
└─ README.md
```

---
MIT License

#!/bin/bash
# run-tests.sh - runs the 10 curl commands against http://localhost:8000
BASE=http://localhost:8000

echo "1) Create Holder DID"
curl -s -X POST $BASE/did/create | jq
echo -e "\n\n2) Create Issuer DID"
curl -s -X POST $BASE/did/create | jq
echo -e "\n\n3) Issue VC (example)"
curl -s -X POST $BASE/issue -H "Content-Type: application/json" -d '{"holder_did":"did:polkadot:holder_test","issuer_did":"did:polkadot:issuer_test","credential_subject":{"email":"alice@example.com","age":30}}' | jq
echo -e "\n\nNote: capture cid from above output to run verify/revoke tests manually."

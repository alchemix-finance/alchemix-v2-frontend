#!/bin/bash

rm -rfv ./src/abi/*
mkdir ./src/abi/ethereum
mkdir ./src/abi/fantom
git clone git@github.com:alchemix-finance/alchemix-v2-auditable.git
for f in ./alchemix-v2-auditable/deployments/v1/*.json; do cp "$f" ./src/abi/ethereum/; done
for f in ./alchemix-v2-auditable/deployments/mainnet/*.json; do cp "$f" ./src/abi/ethereum/; done
for f in ./alchemix-v2-auditable/deployments/fantom/*.json; do cp "$f" ./src/abi/fantom/; done
rm -rf ./alchemix-v2-auditable

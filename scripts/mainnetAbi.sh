#!/bin/bash

rm -rfv ./src/abi/*
mkdir ./src/abi/ethereum
mkdir ./src/abi/fantom
mkdir ./src/abi/arbitrum
mkdir ./src/abi/optimism
git clone git@github.com:alchemix-finance/alchemix-v2-auditable.git
for f in ./alchemix-v2-auditable/deployments/v1/*.json; do cp "$f" ./src/abi/ethereum/; done
for f in ./alchemix-v2-auditable/deployments/mainnet/*.json; do cp "$f" ./src/abi/ethereum/; done
for f in ./alchemix-v2-auditable/deployments/fantom/*.json; do cp "$f" ./src/abi/fantom/; done
for f in ./alchemix-v2-auditable/deployments/arbitrum/*.json; do cp "$f" ./src/abi/arbitrum/; done
for f in ./alchemix-v2-auditable/deployments/optimism/*.json; do cp "$f" ./src/abi/optimism/; done
rm -rf ./alchemix-v2-auditable

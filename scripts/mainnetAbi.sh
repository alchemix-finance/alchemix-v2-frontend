#!/bin/bash

rm -rfv ./src/abi/*
git clone git@github.com:alchemix-finance/v2-contracts.git
for f in ./v2-contracts/deployments/v1/*.json; do cp "$f" ./src/abi/; done
for f in ./v2-contracts/deployments/mainnet/*.json; do cp "$f" ./src/abi/; done
rm -rf ./v2-contracts

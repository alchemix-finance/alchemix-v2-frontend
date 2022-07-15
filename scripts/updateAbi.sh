#!/bin/bash

rm -rfv ./src/abi/*
mkdir ./src/abi/ethereum
mkdir ./src/abi/fantom
mkdir ./src/abi/arbitrum
mkdir ./src/abi/optimism
git clone git@github.com:alchemix-finance/v2-testnet-artifacts.git
for f in ./v2-testnet-artifacts/localhost/v1/*.json; do cp "$f" ./src/abi/ethereum/; done
for f in ./v2-testnet-artifacts/localhost/*.json; do cp "$f" ./src/abi/ethereum/; done
#for f in ./deployments/fantom/*.json; do cp "$f" ./src/abi/fantom/; done
#for f in ./deployments/arbitrum/*.json; do cp "$f" ./src/abi/arbitrum/; done
#for f in ./deployments/optimism/*.json; do cp "$f" ./src/abi/optimism/; done
rm -rf ./v2-testnet-artifacts

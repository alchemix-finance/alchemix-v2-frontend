#!/bin/bash

rm -rfv ./src/abi/*
git clone git@github.com:alchemix-finance/v2-testnet-artifacts.git
for f in ./v2-testnet-artifacts/localhost/*.json; do cp "$f" ./src/abi/; done
rm -rf ./v2-testnet-artifacts

#!/bin/bash

# clear all subdirectories
rm -rfv ./src/abi/*

# create new directories
mkdir ./src/abi/ethereum
mkdir ./src/abi/fantom
mkdir ./src/abi/arbitrum
mkdir ./src/abi/optimism

# fetch deployment artifacts and sort them into the right directories
git clone git@github.com:alchemix-finance/deployments.git
for f in ./deployments/v1/*.json; do cp "$f" ./src/abi/ethereum/; done
for f in ./deployments/mainnet/*.json; do cp "$f" ./src/abi/ethereum/; done
for f in ./deployments/fantom/*.json; do cp "$f" ./src/abi/fantom/; done
for f in ./deployments/arbitrum/*.json; do cp "$f" ./src/abi/arbitrum/; done
for f in ./deployments/optimism/*.json; do cp "$f" ./src/abi/optimism/; done

# cleanup
rm -rf ./deployments

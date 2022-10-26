#!/bin/bash

# this script fetches the secrets from vercel and creates a .env
# TODO debug vercel config so this isn't needed

echo 'VITE_DEBUG_MODE='$DEBUG_MODE >> .env
echo 'VITE_BLOCKNATIVE_KEY='$BLOCKNATIVE_KEY >> .env
echo 'VITE_NETWORK_ID='$NETWORK_ID >> .env
echo 'VITE_NETWORK_NAME='$NETWORK_NAME >> .env
echo 'VITE_LOCAL_NETWORK_ID='$LOCAL_NETWORK_ID >> .env
echo 'VITE_LOCAL_NETWORK_NAME='$LOCAL_NETWORK_NAME >> .env
echo 'VITE_LOCAL_NETWORK_URL='$LOCAL_NETWORK_URL >> .env
echo 'VITE_ZAPPER_KEY='$ZAPPER_KEY >> .env
echo 'VITE_APP_URL='$APP_URL >> .env
echo 'VITE_INFURA_KEY='$INFURA_KEY >> .env
echo 'VITE_ALCHEMY_KEY='$ALCHEMY_KEY >> .env

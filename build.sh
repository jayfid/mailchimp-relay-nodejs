#!/usr/bin/env bash

echo "[1/3] Deleting artifacts"
rm -rf build build.zip
mkdir build
cp index.js build/
npm install --prefix=./build mailchimp-api-v3 > /dev/null 2> /dev/null
rm -rf build/etc build/package-lock.json
echo "[2/3] Building Zip File"
cd build && zip -q -r ../build.zip *
rm -rf build
echo "[3/3] Finished Building"

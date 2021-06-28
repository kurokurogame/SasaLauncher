#!/usr/bin/env bash

git submodule update --init && ./scripts/applyPatches.sh || exit 1

if [ "$1" == "--build" ]; then
     cd sasaddLauncher
     yarn install --ignore-engines
     node build.js
fi

#!/usr/bin/env bash

pushd sasaddLauncher
git rebase --interactive upstream/upstream
popd

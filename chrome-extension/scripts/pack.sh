#!/usr/bin/env bash

pushd "$( dirname "${BASH_SOURCE[0]}" )/.." || exit 1;

set -x;
yarn run clean;
yarn run build;

find "ext" -type f \( -iname '.DS_Store' -o -iname '._*' \) |
  while read -r file; do
    test -n "${file}" && rm -v "${file}"; done

test -f ext.zip && rm ext.zip;
zip -r -q ext.zip ext;

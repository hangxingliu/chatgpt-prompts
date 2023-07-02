#!/usr/bin/env bash
#
# Building and packing for deployment
#
# https://chrome.google.com/webstore/devconsole
#
# make sure cwd is the project dir
pushd "$( dirname "${BASH_SOURCE[0]}" )/.." || exit 1;

EXT_DIR="ext";
EXT_BASE_NAME="chatgpt-prompts-";

RED="\x1b[31m"; YELLOW="\x1b[33m"; CYAN="\x1b[36m";
DIM="\x1b[2m";  RESET="\x1b[0m";

throw() { echo -e "${RED}fatal: ${1}${RESET}" >&2; exit 1; }
execute() {
  printf "${CYAN}$ %s${RESET}\n" "$*";
  "$@" || throw "failed to execute '$1'";
}
assert_command() {
  command -v "$1" >/dev/null || throw "the command '$1' is not found!";
}

assert_command yarn
assert_command jq
test -d node_modules || throw "please run 'yarn install' before this script";

execute yarn run clean;

export USE_DEFAULT_RESOURCE=true;
execute yarn run build;

# cleaning OS X files
find "${EXT_DIR}" -type f \( -iname '.DS_Store' -o -iname '._*' \) |
  while read -r file; do
    test -n "${file}" && execute rm -v "${file}";
  done


EXT_VERSION="$(cat "${EXT_DIR}/manifest.json" | jq -r .version)";
test -n "$EXT_VERSION" || throw "can not resolve the extension version";

EXT_ZIP_FILE="${EXT_BASE_NAME}${EXT_VERSION}.zip";

test -f "${EXT_ZIP_FILE}" && execute rm "${EXT_ZIP_FILE}";
execute zip -r -q -9 "${EXT_ZIP_FILE}" "${EXT_DIR}";
execute ls -alh "${EXT_ZIP_FILE}";

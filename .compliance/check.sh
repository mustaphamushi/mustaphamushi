#!/usr/bin/env bash
# Compliance check. Canonical copy: mustaphamushi/ansot-standards scripts/check.sh, synced into every
# repository as .compliance/check.sh. Do not edit a repository's copy; the next sync overwrites it.
#
# Usage: bash .compliance/check.sh [directory]        (default: the current directory)
#
# Lists hold one case-insensitive extended regex per line, matched as whole words (grep -w), so a
# pattern such as rank never matches "ranking".
#   .compliance/block.txt  every hit prints file:line and the check fails (exit 1)
#   .compliance/warn.txt   every hit becomes a ::warning annotation; warnings never fail
# COMPLIANCE_BLOCK and COMPLIANCE_WARN point at other lists (the weekly audit uses this).
# Exit codes: 0 clean or warnings only, 1 blocked pattern found, 2 the scan itself failed.
set -uo pipefail

here=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
root=${1:-.}
block_list=${COMPLIANCE_BLOCK:-$here/block.txt}
warn_list=${COMPLIANCE_WARN:-$here/warn.txt}

flags=(-rniwIE --null
  --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=build
  --exclude-dir=.next --exclude-dir=.astro --exclude-dir=.vercel --exclude-dir=.compliance
  --exclude=compliance.md --exclude=CHANGELOG.md --exclude=redirects.json --exclude='*.lock'
  --exclude=package-lock.json --exclude=pnpm-lock.yaml --exclude=yarn.lock)

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

# A blank line would match every line, so blank lines (and Windows line endings) are dropped.
load() {
  : > "$2"
  if [ -f "$1" ]; then tr -d '\r' < "$1" | grep -v '^[[:space:]]*$' > "$2"; fi
  [ -s "$2" ]
}

# grep prints "./path\0line:text"; rewrite as "path<TAB>line<TAB>text".
scan() {
  local out=$1 list=$2 rc
  (cd "$root" && grep "${flags[@]}" -f "$list" -- .) > "$tmp/raw"
  rc=$?
  if [ "$rc" -gt 1 ]; then
    echo "check.sh: grep failed with exit code $rc (see the message above)" >&2
    exit 2
  fi
  : > "$out"
  while IFS= read -r -d '' path && IFS= read -r rest; do
    printf '%s\t%s\t%s\n' "${path#./}" "${rest%%:*}" "${rest#*:}" >> "$out"
  done < "$tmp/raw"
}

# Escaping for GitHub workflow commands.
esc_data() { local s=$1; s=${s//'%'/%25}; s=${s//$'\r'/%0D}; s=${s//$'\n'/%0A}; printf '%s' "$s"; }
esc_prop() { local s; s=$(esc_data "$1"); s=${s//:/%3A}; s=${s//,/%2C}; printf '%s' "$s"; }

blocked=0
warned=0

if load "$warn_list" "$tmp/warn.pat"; then
  scan "$tmp/warn.hits" "$tmp/warn.pat"
  while IFS=$'\t' read -r file line text; do
    text=$(printf '%s' "$text" | tr -s '[:space:]' ' ' | cut -c1-200)
    printf '::warning file=%s,line=%s::%s\n' "$(esc_prop "$file")" "$line" \
      "$(esc_data "Compliance warning (pattern in .compliance/warn.txt, see compliance.md): $text")"
    warned=$((warned + 1))
  done < "$tmp/warn.hits"
fi

if load "$block_list" "$tmp/block.pat"; then
  scan "$tmp/block.hits" "$tmp/block.pat"
  if [ -s "$tmp/block.hits" ]; then
    echo "Blocked patterns found (see .compliance/block.txt and compliance.md):"
    while IFS=$'\t' read -r file line _; do
      echo "$file:$line"
      if [ "${GITHUB_ACTIONS:-}" = true ]; then
        printf '::error file=%s,line=%s::%s\n' "$(esc_prop "$file")" "$line" \
          "Blocked pattern (see .compliance/block.txt and compliance.md)"
      fi
      blocked=$((blocked + 1))
    done < "$tmp/block.hits"
  fi
fi

echo "compliance-check: $blocked blocked, $warned warning(s)"
[ "$blocked" -eq 0 ]

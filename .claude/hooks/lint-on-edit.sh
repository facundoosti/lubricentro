#!/usr/bin/env bash
# PostToolUse (Edit|Write): autocorrige el archivo editado y devuelve a Claude los errores restantes.
set -uo pipefail

root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
file_path=$(jq -r '.tool_input.file_path // empty')
[[ -z "$file_path" || ! -f "$file_path" ]] && exit 0

case "$file_path" in
  "$root"/backend/*.rb|"$root"/backend/*.rake)
    rel="${file_path#"$root"/backend/}"
    [[ "$rel" == db/schema.rb ]] && exit 0
    out=$(cd "$root/backend" && bundle exec rubocop -a --format simple --force-exclusion "$rel" 2>&1)
    if [[ $? -ne 0 ]]; then
      echo "RuboCop dejó ofensas sin corregir en $rel:" >&2
      echo "$out" | tail -40 >&2
      exit 2
    fi ;;
  "$root"/frontend/src/*.js|"$root"/frontend/src/*.jsx)
    rel="${file_path#"$root"/frontend/}"
    out=$(cd "$root/frontend" && npx --no-install eslint --fix "$rel" 2>&1)
    if [[ $? -ne 0 ]]; then
      echo "ESLint dejó errores en $rel:" >&2
      echo "$out" | tail -40 >&2
      exit 2
    fi ;;
esac

exit 0

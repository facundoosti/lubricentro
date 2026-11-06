#!/usr/bin/env bash
# PreToolUse (Edit|Write): bloquea la edición de archivos generados o sensibles.
set -euo pipefail

file_path=$(jq -r '.tool_input.file_path // empty')
[[ -z "$file_path" ]] && exit 0

case "$file_path" in
  */db/schema.rb)
    echo "Bloqueado: no edites schema.rb. Generá una migración (bin/rails g migration ...) y corré db:migrate." >&2
    exit 2 ;;
  */.env.example) ;;
  */.env|*/.env.*|*/config/master.key|*/config/credentials/*.key)
    echo "Bloqueado: $file_path contiene secretos. Pedile al usuario que lo edite manualmente." >&2
    exit 2 ;;
  */Gemfile.lock|*/package-lock.json)
    echo "Bloqueado: los lockfiles se regeneran con bundle install / npm install, no se editan a mano." >&2
    exit 2 ;;
  */.codegraph/*|*/openspec/changes/archive/*)
    echo "Bloqueado: $file_path es generado/archivado y no se edita a mano." >&2
    exit 2 ;;
esac

exit 0

#!/usr/bin/env bash
# Stop: corre los tests afectados por los cambios sin commitear. Si fallan, Claude sigue trabajando.
set -uo pipefail

input=$(cat)
# Evita loops: si Claude ya está continuando por este hook, no volver a bloquear.
[[ "$(jq -r '.stop_hook_active // false' <<<"$input")" == "true" ]] && exit 0

root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$root" || exit 0

changed=$( { git diff --name-only HEAD; git ls-files --others --exclude-standard; } 2>/dev/null | sort -u )
[[ -z "$changed" ]] && exit 0

# No repetir si el estado de los cambios no se modificó desde la última corrida verde.
state_file="${TMPDIR:-/tmp}/claude-lubricentro-tests-$(echo "$root" | shasum | cut -c1-8)"
state=$( { git diff HEAD; git ls-files --others --exclude-standard | xargs cat 2>/dev/null; } | shasum | cut -c1-40 )
[[ -f "$state_file" && "$(cat "$state_file")" == "$state" ]] && exit 0

failures=""

# Backend: mapea app/**/x.rb -> spec/**/x_spec.rb (y controllers -> spec/requests).
specs=()
while IFS= read -r f; do
  [[ "$f" != backend/* ]] && continue
  rel="${f#backend/}"
  case "$rel" in
    spec/*_spec.rb) specs+=("$rel") ;;
    app/controllers/*_controller.rb)
      base="${rel#app/controllers/}"; base="${base%_controller.rb}"
      specs+=("spec/requests/${base}_spec.rb" "spec/controllers/${base}_controller_spec.rb") ;;
    app/*.rb|lib/*.rb)
      base="${rel#app/}"; base="${base#lib/}"; base="${base%.rb}"
      sub="${base%%/*}"; rest="${base#*/}"
      specs+=("spec/${sub}/${rest}_spec.rb") ;;
  esac
done <<<"$changed"

existing=()
for s in "${specs[@]:-}"; do [[ -n "$s" && -f "backend/$s" ]] && existing+=("$s"); done
if (( ${#existing[@]} > 0 )); then
  uniq_specs=$(printf '%s\n' "${existing[@]}" | sort -u | tr '\n' ' ')
  # Postgres de test con pgvector en Docker (make test-db-local); se puede sobreescribir con TEST_DATABASE_URL.
  test_db="${TEST_DATABASE_URL:-postgresql://postgres:postgres@localhost:5435/lubricentro_test}"
  out=$(cd backend && RAILS_ENV=test DATABASE_URL="$test_db" bundle exec rspec $uniq_specs --format progress 2>&1)
  if [[ $? -ne 0 ]]; then
    # Problemas de entorno (DB de test sin migrar / sin conexión): avisar al usuario sin bloquear.
    if grep -Eq 'PendingMigrationError|could not connect|NoDatabaseError|connection to server' <<<"$out"; then
      env_warning=1
      jq -n --arg m "⚠️ RSpec no pudo correr por el entorno (DB de test). Ejecutá: make test-db-local" '{systemMessage: $m}'
    else
      failures+=$'\n### RSpec ('"$uniq_specs"$')\n'"$(echo "$out" | tail -60)"
    fi
  fi
fi

# Frontend: vitest related encuentra los tests que importan los archivos cambiados.
fe=$(grep -E '^frontend/src/.*\.(js|jsx)$' <<<"$changed" | sed 's#^frontend/##' | while read -r f; do [[ -f "frontend/$f" ]] && echo "$f"; done)
if [[ -n "$fe" ]]; then
  out=$(cd frontend && npx --no-install vitest related --run --passWithNoTests $fe 2>&1)
  [[ $? -ne 0 ]] && failures+=$'\n### Vitest\n'"$(echo "$out" | tail -60)"
fi

if [[ -n "$failures" ]]; then
  echo "Hay tests fallando por los cambios actuales. Corregilos antes de terminar:$failures" >&2
  exit 2
fi

[[ -z "${env_warning:-}" ]] && echo "$state" > "$state_file"
exit 0

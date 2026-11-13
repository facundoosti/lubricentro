#!/usr/bin/env bash
# Resume .claude/logs/search-usage.jsonl: codegraph vs grep/glob, total y por agente.
# Uso: .claude/scripts/search-report.sh [desde-ISO, ej. 2026-11-13]
set -euo pipefail

log="$(cd "$(dirname "$0")/../.." && pwd)/.claude/logs/search-usage.jsonl"
[[ -f "$log" ]] || { echo "Sin datos todavía ($log)"; exit 0; }
since="${1:-0000}"

jq -rs --arg since "$since" '
  map(select(.ts >= $since)) as $r
  | ($r | length) as $n
  | "Búsquedas desde \($since): \($n)",
    ( $r | group_by(.kind)[] | "  \(.[0].kind): \(length) (\((length*100/$n)|floor)%)" ),
    "Por agente:",
    ( $r | group_by(.agent)[] | . as $g
      | "  \($g[0].agent): " + ([group_by(.kind)[] | "\(.[0].kind)=\(length)"] | join(" ")) )
' "$log"
